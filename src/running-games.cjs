const {findProcesses,candidatesFor,matchesProcess,isSessionProcess}=require('./playtime.cjs');
const {spawn}=require('node:child_process');
const activity=p=>['foreground','fullscreen','background','minimized','no-window'].includes(p.activity)?p.activity:'running';
const sameProcess=(a,b)=>a?.pid===b.pid&&(!a.started||!b.started||a.started===b.started);
// A game-specific launcher can be available before its store exposes an install manifest.
// Scan its actual game candidates without turning the launcher into an installed/owned copy.
const monitorable=game=>game.kind==='game'&&!game.robloxPlaceId&&(game.installed||game.versions?.some(v=>v.launcherAvailable||v.shortcutGameTarget));
class RunningGames{
 constructor({games,emit,find=findProcesses,clock=Date.now,configs=()=>({})}){Object.assign(this,{games,emit,find,clock,configs});this.sessions=new Map();this.pendingCloseCleanup=new Map();this.lastRows=[];this.checkedAt=null;this.scanFailed=false;this.busy=false;this.stopped=false;}
 scan(){if(this.stopped)return Promise.resolve(this.snapshot());if(this.inflight)return this.inflight;this.inflight=this.scanNow().finally(()=>{this.inflight=null;});return this.inflight;}
 async scanNow(){if(this.stopped)return this.snapshot();this.busy=true;try{
  const candidates=this.games().filter(monitorable).map(game=>({game,candidates:candidatesFor(game,this.configs()[game.id])}));
  const rows=await this.find([...new Set(candidates.flatMap(c=>c.candidates.names))]);
  this.lastRows=rows;this.checkedAt=this.clock();this.scanFailed=false;
  const live=new Map(),claimed=new Set();for(const {game,candidates:expected}of candidates){const previous=this.sessions.get(game.id),eligible=row=>!claimed.has(row.pid)&&isSessionProcess(row)&&matchesProcess(row,expected),p=rows.find(row=>sameProcess(previous,row)&&eligible(row))||rows.find(eligible);if(!p)continue;claimed.add(p.pid);const same=sameProcess(previous,p);live.set(game.id,{id:game.id,title:game.title,pid:p.pid,name:p.name,path:p.path,started:p.started||(same?previous.started:null),activity:activity(p),since:same?previous.since:/^RobloxPlayer(?:Beta)?$/i.test(p.name)?this.clock():Math.min(this.clock(),Date.parse(p.started)||this.clock())});}

  if(!this.stopped){this.sessions=live;await this.cleanupClosedClients(live);this.emit(this.snapshot());}return this.snapshot();
 }catch(error){this.scanFailed=true;throw error;}finally{this.busy=false;}}
 async diagnose(id){
  try{await this.scan();}catch{}const game=this.games().find(g=>g.id===id);if(!game)throw Error('Game not found.');
  const expected=candidatesFor(game,this.configs()[id]),names=new Set(expected.names.map(n=>n.toLowerCase()));
  const processes=this.lastRows.filter(p=>names.has((p.name+'.exe').toLowerCase())).map(p=>({pid:p.pid,name:p.name+'.exe',activity:activity(p),pathAvailable:Boolean(p.path),matched:matchesProcess(p,expected)}));
  const session=this.sessions.get(id);const supported=monitorable(game);
  const trayOnly=this.lastRows.some(p=>!isSessionProcess(p)&&matchesProcess(p,expected));
  const status=this.scanFailed?'Scan unavailable':!supported?'Not monitored':session?'Running':trayOnly?'Session finished':!expected.names.length?'Executable needed':processes.length?'Different executable path':'Not detected';
  const note=this.scanFailed?'The latest scan failed. The results below are from the last successful scan. Try again; no sessions were ended by this failure.':!supported?'Automatic detection requires an installed game or a linked game launcher. Roblox experiences are tracked through the Roblox client.':session?'The game process is running. Switching windows or minimizing the game does not stop detection.':trayOnly?'Roblox is running in the tray without a game window. This does not count as an active session.':!expected.names.length?'Choose the actual game executable, rather than its launcher, to enable detection.':processes.length?'A process with the expected name was found, but its path could not be verified against this copy. Choose the actual game executable.':'No matching game process was found. If the game is open, choose its actual executable and check again.';
  return {id,title:game.title,status,note,checkedAt:this.checkedAt,stale:this.scanFailed,expectedNames:expected.names,processes};
 }
 snapshot(){return [...this.sessions.values()].map(({path,started,name,...s})=>({...s,processStarted:started,seconds:Math.max(0,(this.clock()-s.since)/1000)}));}
 stop(){this.stopped=true;this.sessions.clear();this.pendingCloseCleanup.clear();}
 async close(id,force=false,close=require('./close-game.cjs').closeProcess){
  const session=this.sessions.get(id);if(!session)throw Error('This game is no longer running.');
  const game=this.games().find(g=>g.id===id),valid=require('./close-game.cjs').validSession;
  const roblox=Boolean(game?.versions?.some(v=>v.source==='Roblox')&&/^RobloxPlayer(?:Beta)?$/i.test(session.name));
  const names=roblox?['RobloxPlayerBeta.exe','RobloxPlayer.exe','RobloxCrashHandler.exe']:[session.name+'.exe'];
  const rows=await this.find(names);
  const identity=r=>r.pid===session.pid&&r.started===session.started&&r.path&&r.path.toLowerCase()===session.path.toLowerCase();
  if(!valid(session)||!rows.some(identity))throw Error('The game process changed or cannot be verified. Refresh and try again.');
  if(!roblox)return this.closeVerified(session,force,close,names);
  const path=require('node:path').win32,folder=path.normalize(path.dirname(session.path)).toLowerCase();
  const sameFolder=r=>r.path&&path.normalize(path.dirname(r.path)).toLowerCase()===folder;
  const player=r=>/^RobloxPlayer(?:Beta)?$/i.test(r.name)&&sameFolder(r);
  const players=rows.filter(player),pids=new Set(players.map(p=>p.pid));
  const helper=r=>/^RobloxCrashHandler$/i.test(r.name)&&sameFolder(r)&&pids.has(r.parentPid);
  if(players.some(p=>!valid(p)))throw Error('A Roblox game client cannot be verified. Refresh and try again.');
  const helpers=rows.filter(helper),targets=force?[...players,...helpers]:players,results=[];
  for(const target of targets){
   if(!valid(target))throw Error('A Roblox background process cannot be verified. Refresh and try again.');
   try{results.push(await close(target,force));}catch(error){const current=await this.find(names);if(current.some(r=>r.pid===target.pid&&r.started===target.started))throw error;}
  }
  const remaining=await this.find(names);
  if(force&&remaining.some(r=>player(r)||helper(r)))throw Error('Roblox is still running or restarted. Try Force close again.');
  if(force){this.pendingCloseCleanup.delete(id);this.sessions.delete(id);this.emit(this.snapshot());return {status:'forced'};}
  const requested=results.some(r=>r.status==='requested'||r.status==='closed');
  if(requested&&helpers.length){if(this.pendingCloseCleanup.size>=32)this.pendingCloseCleanup.delete(this.pendingCloseCleanup.keys().next().value);this.pendingCloseCleanup.set(id,{targets:helpers,close,attempts:0});if(!remaining.some(player))await this.cleanupClosedClients(new Map([...this.sessions].filter(([key])=>key!==id)));}
  const final=await this.find(names);if(!final.some(r=>player(r)||helper(r))){this.sessions.delete(id);this.emit(this.snapshot());return {status:'closed'};}return {status:requested?'requested':'no-window',stillRunning:true};
 }
 async cleanupClosedClients(live){
  for(const [id,pending]of this.pendingCloseCleanup){
   if(live.has(id)||this.stopped)continue;
   try{
    const rows=await this.find(['RobloxCrashHandler.exe']);
    for(const target of pending.targets){if(rows.some(r=>r.pid===target.pid&&r.started===target.started&&r.path?.toLowerCase()===target.path.toLowerCase()))await pending.close(target,true);}
    const after=await this.find(['RobloxCrashHandler.exe']);if(pending.targets.some(target=>after.some(r=>r.pid===target.pid&&r.started===target.started)))throw Error('Roblox background cleanup is not complete.');
    this.pendingCloseCleanup.delete(id);
   }catch{if(++pending.attempts>=3)this.pendingCloseCleanup.delete(id);}
  }
 }
 async closeVerified(session,force,close,names){
  const result=await close(session,force),game=this.games().find(g=>g.id===session.id),expected=game?candidatesFor(game,this.configs()[session.id]):null;
  const rows=await this.find([...new Set([...names,...(expected?.names||[])])]);
  const remains=rows.some(r=>sameProcess(session,r)||r.path?.toLowerCase()===session.path.toLowerCase()||expected&&matchesProcess(r,expected));
  if(remains){if(force)throw Error('The game is still running or restarted. Try Force close again.');return {status:result.status==='no-window'?'no-window':'requested',stillRunning:true};}
  this.sessions.delete(session.id);this.emit(this.snapshot());return {status:force?'forced':'closed'};
 }
 async focus(id){const s=this.sessions.get(id);if(!s)throw Error('This game is no longer running.');const rows=await this.find([s.name+'.exe']);if(!rows.some(r=>sameProcess(s,r)&&matchesProcess(r,candidatesFor(this.games().find(g=>g.id===id)||{title:s.title,versions:[]},this.configs()[id]))))throw Error('The game process has ended.');return focusProcess(s.pid);}
}
function focusProcess(pid){if(!Number.isSafeInteger(pid)||pid<=0)throw Error('Invalid process.');return new Promise((resolve,reject)=>{
 const script=require('./windows-focus.cjs').script;
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,shell:false,stdio:['pipe','ignore','pipe']});let error='';const timer=setTimeout(()=>{child.kill();reject(Error('Could not focus the game.'));},8000);child.stderr.on('data',b=>error+=b);child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('close',code=>{clearTimeout(timer);code?reject(Error(error.slice(0,400)||'Could not focus the game.')):resolve(true);});child.stdin.on('error',()=>{});child.stdin.end(String(pid));
 });}
module.exports={RunningGames};
