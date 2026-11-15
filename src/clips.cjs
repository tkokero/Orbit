const {spawn}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {preferences,forGame}=require('./clips-settings.cjs');
const {windowIdentity,sameOwner,gameSource}=require('./clips-window.cjs');

class Clips{
 constructor({app,desktopCapturer,globalShortcut,folder,root,notify=()=>{},onSaved=()=>{},launch,settings={},persist=async()=>{},identity=windowIdentity}={}){
  Object.assign(this,{app,desktopCapturer,globalShortcut,root,notify,onSaved,launch,persist,identity});
  this.folder=path.resolve(folder);let settingsError;try{this.settings=preferences(settings);}catch(error){this.settings=preferences();settingsError='Check your clipping settings. Saved data has been kept.';}
  this.state={phase:settingsError?'error':'off',message:settingsError||'Clipping is off',seconds:0,bytes:0};
  this.pending=new Map();this.serial=0;this.saved=new Map();this.registered=new Set();this.generation=0;this.sessions=[];this.armed=false;
  this.sessionSaveTask=Promise.resolve();
 }
 snapshot(){return {...this.state,armed:this.armed,folder:this.folder,settings:{...this.settings},saveHotkey:this.settings.saveHotkey,stopHotkey:this.settings.stopHotkey};}
 emit(data){Object.assign(this.state,data);this.notify(this.snapshot());}
 async configure(input){
  if(this.configuring)throw Error('Wait for the shortcut change to finish.');
  const next=preferences(input),withoutKeys=value=>Object.fromEntries(Object.entries(value).filter(([key])=>!['saveHotkey','stopHotkey'].includes(key)));
  if((this.child||this.startTask||this.stopTask||this.armed)&&JSON.stringify(withoutKeys(next))!==JSON.stringify(withoutKeys(this.settings)))throw Error('Stop clipping before changing capture settings.');
  const changed=next.saveHotkey!==this.settings.saveHotkey||next.stopHotkey!==this.settings.stopHotkey,added=[];this.configuring=true;
  try{
   if(changed)for(const key of [next.saveHotkey,next.stopHotkey])if(!this.registered.has(key)){this.bindShortcut(key);added.push(key);}
   await this.persist(next);this.settings=next;
   if(changed)for(const key of [...this.registered])if(!(this.armed||this.child||this.startTask)||this.stopTask||![next.saveHotkey,next.stopHotkey].includes(key)){this.globalShortcut.unregister(key);this.registered.delete(key);}
   this.emit({});return this.snapshot();
  }catch(error){for(const key of added){this.globalShortcut.unregister(key);this.registered.delete(key);}throw error;}
  finally{this.configuring=false;}
 }
 async sources(previews=false){
  const rows=await this.desktopCapturer.getSources({types:['window','screen'],thumbnailSize:previews?{width:640,height:360}:{width:0,height:0},fetchWindowIcons:false});
  return rows.filter(s=>!/^Orbit(?:$|[ •·—-])/.test(s.name)).slice(0,80).map(s=>({id:s.id,name:s.name.slice(0,200),screen:s.id.startsWith('screen:'),preview:previews&&!s.thumbnail?.isEmpty()?s.thumbnail?.toDataURL():null}));
 }
 request(cmd,input){
  if(!this.child?.connected)return Promise.reject(Error('The recorder is not running.'));
  const id=++this.serial;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('The recorder did not respond. Stop clipping and try again.'));},cmd==='save'?45000:25000);
   this.pending.set(id,{resolve,reject,timer});
   this.child.send({id,cmd,input},error=>{if(error){clearTimeout(timer);this.pending.delete(id);reject(error);}});
  });
 }
 register(){
  if(this.registered.size)return;
  try{
   for(const key of [this.settings.saveHotkey,this.settings.stopHotkey])this.bindShortcut(key);
  }catch(error){this.unregister();throw error;}
 }
 bindShortcut(key){
  const run=()=>{if(!this.armed&&!this.child&&!this.startTask)return;if(key===this.settings.saveHotkey)void this.save().catch(e=>this.emit({message:e.message}));else if(key===this.settings.stopHotkey)void this.stop().catch(()=>{});};
  if(!this.globalShortcut.register(key,run))throw Error(key.replace('Control','Ctrl')+' is already in use. Choose another clipping shortcut.');
  this.registered.add(key);
 }
 unregister(){for(const key of this.registered)this.globalShortcut.unregister(key);this.registered.clear();}
 startAutomatically(){if(!this.settings.startWithOrbit||this.settings.mode!=='games')return false;this.arm();return true;}
 arm(){
  if(this.configuring)throw Error('Wait for the shortcut change to finish.');
  if(this.child||this.startTask||this.stopTask||this.armed)throw Error('Clipping is already enabled.');
  this.register();this.armed=true;this.failedGame=null;
  this.emit({phase:'waiting',message:'Waiting for a detected game. Your desktop is not recorded.',error:null});
  void this.observe(this.sessions);return this.snapshot();
 }
 observe(sessions){
  this.sessions=Array.isArray(sessions)?sessions.slice(0,64):[];
  if(!this.armed)return Promise.resolve();
  if(this.reconciling){this.observeAgain=true;return this.reconciling;}
  this.reconciling=this.reconcile().catch(error=>this.emit({phase:'error',message:error.message})).finally(()=>{this.reconciling=null;if(this.observeAgain){this.observeAgain=false;void this.observe(this.sessions);}});
  return this.reconciling;
 }
 async reconcile(){
  if(!this.armed||this.stopTask||this.startTask)return;
  if(this.child){
   const game=this.sessions.find(s=>s.id===this.state.gameId&&s.pid===this.state.gamePid&&s.processStarted===this.state.gameStarted&&s.activity!=='no-window');
   if(game)return;
   await this.stopRecorder();
   if(!this.armed)return;
   this.emit({phase:'waiting',message:'Game closed. Waiting for the next game.',seconds:0,bytes:0,gameId:null,source:null});
  }
  const eligible=this.sessions.filter(game=>forGame(this.settings,game.id));
  if(!eligible.length){this.failedGame=null;return;}
  const revision=this.generation,sources=await this.sources();
  if(!this.armed||revision!==this.generation)return;
  const match=gameSource(eligible,sources,this.state.gameId);
  if(!match){if(this.state.phase!=='error')this.emit({phase:'waiting',message:'Waiting for a game window. You can also choose a source manually.'});return;}
  const key=match.game.id+':'+match.game.pid+':'+match.game.processStarted;
  if(this.failedGame===key)return;
  try{await this.start({...this.settings,sourceId:match.source.id,game:match.game},true);}
  catch(error){if(this.armed){this.failedGame=key;this.emit({phase:'error',message:error.message});}}
 }
 start(input={},automatic=false){
  if(this.configuring)return Promise.reject(Error('Wait for the shortcut change to finish.'));
  if(this.child||this.startTask||this.stopTask||this.armed&&!automatic)return Promise.reject(Error('Stop clipping before starting another capture.'));
  const revision=this.generation,settings=forGame(this.settings,input.game?.id),cancelled=()=>{if(revision!==this.generation)throw Error('Capture start was cancelled.');};
  if(!settings)return Promise.reject(Error('This game is excluded from recording.'));
  this.emit({phase:'starting',message:'Starting capture…',seconds:0,bytes:0,error:null,lastSaved:null,bookmarks:0,sessionPartial:null,audioAvailability:null});
  const task=(async()=>{
   try{
    const source=(await this.sources()).find(s=>s.id===input.sourceId);cancelled();
    if(!source)throw Error('Choose an available game window or display.');
    const owner=source.screen?null:await this.identity(source.id);cancelled();
    if(input.game&&(!owner||!sameOwner(owner,{pid:input.game.pid,started:input.game.processStarted})))throw Error('The game window changed. Choose it again.');
    this.register();await fs.mkdir(this.folder,{recursive:true});cancelled();
    const child=this.child=this.launch?this.launch():spawn(process.execPath,[this.app.getAppPath(),'--orbit-recorder'],{stdio:['ignore','pipe','pipe','ipc'],serialization:'json',windowsHide:true});
    child.stdout?.on('data',()=>{});let detail='';child.stderr?.on('data',d=>detail=(detail+d.toString()).slice(-1500));
    child.on('message',message=>{
     if(this.child!==child)return;
     if(message.id){const pending=this.pending.get(message.id);if(pending){clearTimeout(pending.timer);this.pending.delete(message.id);message.error?pending.reject(Error(message.error)):pending.resolve(message.data);}}
     else if(message.event==='session-saved'){const game={gameId:this.state.gameId,gameTitle:this.state.gameTitle,source:this.state.source};this.sessionSaveTask=this.sessionSaveTask.then(()=>this.recordSaved(message.data,game,settings)).catch(error=>this.emit({message:'Recording kept, but its metadata could not be saved. '+error.message}));}
     else if(['status','buffer'].includes(message.event))this.emit(message.data);
    });
    child.on('error',error=>{this.emit({phase:'error',message:error.message});for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();});
    child.on('exit',()=>{
     if(this.child!==child)return;this.child=null;
     if(!this.armed)this.unregister();
     for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('The recorder closed. '+detail.slice(-300)));}this.pending.clear();
     if(!this.stopping){if(this.armed)this.failedGame=this.state.gameId+':'+this.state.gamePid+':'+this.state.gameStarted;this.emit({phase:'error',message:this.state.phase==='error'?this.state.message:'The recorder stopped unexpectedly. Try again.',seconds:0,bytes:0,saving:false});}
    });
    this.emit({source:source.name,sourceId:source.id,gameId:input.game?.id||null,gameTitle:input.game?.title||null,gamePid:input.game?.pid,gameStarted:input.game?.processStarted,options:settings});
    await this.request('start',{...settings,sourceId:source.id,owner,label:input.game?.title||source.name,metadata:{gameId:input.game?.id||null,gameTitle:input.game?.title||null,source:source.name,capture:settings},folder:this.folder,root:this.root});cancelled();
    if(this.state.phase==='error'||!child.connected)throw Error(this.state.message||'The recorder stopped before capture started.');
    this.emit({phase:'recording',message:settings.recordingMode==='session'?'Recording full session':'Ready to save the last '+settings.seconds+' seconds',hotkeys:true});return this.snapshot();
   }catch(error){await this.stopRecorder();if(!this.armed)this.unregister();if(revision===this.generation)this.emit({phase:'error',message:error.message});throw error;}
  })();
  this.startTask=task;task.finally(()=>{if(this.startTask===task)this.startTask=null;}).catch(()=>{});return task;
 }
 async recordSaved(item,game,capture){
  if(!item||path.dirname(path.resolve(item.path||''))!==this.folder||path.basename(item.path)!==item.name)throw Error('The recorder returned an invalid clip.');
  const stat=await fs.lstat(item.path);if(!stat.isFile()||stat.isSymbolicLink())throw Error('The recording is no longer available.');
  const metadata={...game,seconds:item.seconds,createdAt:item.createdAt,capture,kind:item.kind==='session'?'session':'replay',bookmarks:Array.isArray(item.bookmarks)?item.bookmarks.slice(0,1000).filter(b=>Number.isFinite(b.seconds)&&b.seconds>=0).map(b=>({seconds:b.seconds})):[]};
  await fs.writeFile(item.path+'.json',JSON.stringify(metadata),'utf8');this.saved.set(item.name,item.path);this.emit({lastSaved:{...item,...metadata},saving:false,message:item.stopReason||(item.kind==='session'?'Session saved':'Clip saved')});try{this.onSaved(item);}catch{}return item;
 }
 save(){
  if(this.state.phase!=='recording'||this.saveTask)return Promise.reject(Error(this.saveTask?'A clip is already being saved.':'No game is being buffered yet.'));
  this.emit({saving:true,message:'Saving clip…'});
  const game={gameId:this.state.gameId,gameTitle:this.state.gameTitle,source:this.state.source},capture={...this.state.options};
  this.saveTask=(async()=>{
   try{
    const item=await this.request('save');
    if(item?.bookmark===true){this.emit({saving:false,message:'Moment marked at '+Math.floor(item.seconds/60)+':'+String(Math.floor(item.seconds%60)).padStart(2,'0'),bookmarks:item.count});return item;}
    return await this.recordSaved(item,game,capture);
   }catch(error){this.emit({saving:false,message:error.message});throw error;}
   finally{this.saveTask=null;}
  })();return this.saveTask;
 }
 async stopRecorder(){
  const child=this.child;if(!child)return;
  this.stopping=true;
  try{
   await this.saveTask?.catch(()=>{});
   await this.request('stop');
   await new Promise(resolve=>{if(child.exitCode!==null)return resolve();const timer=setTimeout(()=>{child.kill();resolve();},this.state.options?.recordingMode==='session'?15000:5000);child.once('exit',()=>{clearTimeout(timer);resolve();});});
   await this.sessionSaveTask;
  }catch{child.kill();}
  finally{if(this.child===child)this.child=null;this.stopping=false;}
 }
 stop(){
  if(this.stopTask)return this.stopTask;
  this.armed=false;this.generation++;this.unregister();this.emit({phase:'stopping',message:'Stopping capture…'});
  this.stopTask=(async()=>{
   await this.startTask?.catch(()=>{});await this.reconciling?.catch(()=>{});await this.stopRecorder();
    this.emit({phase:'off',message:'Clipping is off',seconds:0,bytes:0,saving:false,gameId:null,gameTitle:null,source:null,sourceId:null,sessionPartial:null});return this.snapshot();
  })().finally(()=>{this.stopTask=null;});return this.stopTask;
 }
 async list(){
  await fs.mkdir(this.folder,{recursive:true});const saved=new Map();
  const names=(await fs.readdir(this.folder)).filter(n=>/^Orbit .+\.mp4(?:\.partial)?$/.test(n)&&(!this.child||n!==this.state.sessionPartial)),files=[],items=[];let next=0;
  await Promise.all(Array.from({length:Math.min(8,names.length)},async()=>{while(next<names.length){const name=names[next++],file=path.join(this.folder,name);try{const stat=await fs.lstat(file);if(stat.isFile()&&!stat.isSymbolicLink())files.push({name,file,stat});}catch{}}}));
  files.sort((a,b)=>b.stat.mtimeMs-a.stat.mtimeMs);
  for(const {name,file,stat}of files.slice(0,100)){
   let meta={};
   try{const info=await fs.lstat(file+'.json');if(info.isFile()&&!info.isSymbolicLink()&&info.size<=128*1024)meta=JSON.parse(await fs.readFile(file+'.json','utf8'));}catch{}
   const interrupted=name.endsWith('.partial');if(interrupted){if(meta.kind!=='session'||stat.size<64)continue;if(meta.recording&&Number.isSafeInteger(meta.writerPid)&&meta.writerPid>0){try{process.kill(meta.writerPid,0);continue;}catch(error){if(error.code!=='ESRCH')continue;}}}
   saved.set(name,file);items.push({name,bytes:stat.size,createdAt:Number.isFinite(meta.createdAt)&&meta.createdAt>0?meta.createdAt:stat.mtimeMs,gameId:typeof meta.gameId==='string'?meta.gameId.slice(0,2048):null,gameTitle:typeof meta.gameTitle==='string'?meta.gameTitle.slice(0,200):null,source:typeof meta.source==='string'?meta.source.slice(0,200):null,seconds:Number.isFinite(meta.seconds)?meta.seconds:null,kind:meta.kind==='session'?'session':'replay',interrupted,bookmarks:(Array.isArray(meta.bookmarks)?meta.bookmarks:[]).slice(0,1000).filter(b=>Number.isFinite(b?.seconds)&&b.seconds>=0).map(b=>({seconds:b.seconds}))});
  }
  this.saved=saved;return items.sort((a,b)=>b.createdAt-a.createdAt);
 }
 async file(name){
  if(typeof name!=='string'||name!==path.basename(name))throw Error('Choose a clip from this folder.');
  const file=this.saved.get(name);
  if(!file||path.dirname(file)!==this.folder)throw Error('Choose a clip from this folder.');
  const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('The saved clip is no longer available.');return file;
 }
 async remove({name,confirmed}={},trash){
  if(confirmed!==true)throw Error('Confirm deleting this clip first.');
  if(typeof trash!=='function')throw Error('The Recycle Bin is unavailable.');
  this.removing||=new Set();if(this.removing.has(name))throw Error('This clip is already being deleted.');
  if(name===this.state.sessionPartial)throw Error('Stop this recording before deleting it.');
  this.removing.add(name);
  try{
   let file;try{file=await this.file(name);}catch(error){if(error.code==='ENOENT')throw Error('The saved clip is no longer available.');throw error;}
   let metadata=null;try{const stat=await fs.lstat(file+'.json');if(!stat.isFile()||stat.isSymbolicLink())throw Error('The clip details changed. Refresh Clips before deleting.');metadata=file+'.json';if(name.endsWith('.partial')&&stat.size<=128*1024){const info=JSON.parse(await fs.readFile(metadata,'utf8'));if(info.recording&&Number.isSafeInteger(info.writerPid)&&info.writerPid>0){try{process.kill(info.writerPid,0);throw Error('Stop this recording before deleting it.');}catch(error){if(error.code!=='ESRCH')throw error;}}}}catch(error){if(error.code!=='ENOENT')throw error;}
   await trash(file);this.saved.delete(name);let warning=null;
   if(metadata)try{await trash(metadata);}catch{warning='The recording was moved to the Recycle Bin, but its details could not be moved.';}
   if(this.state.lastSaved?.name===name)this.emit({lastSaved:null});
   return {deleted:true,name,recycled:true,warning};
  }finally{this.removing.delete(name);}
 }
 async media(name){return pathToFileURL(await this.file(name)).href;}
}
module.exports={Clips};
