const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {NvidiaApp,READ,SET}=require('./nvidia-app.cjs');
const presets=['Performance','Balanced','Recommended','Quality','Revert'];
const normalize=name=>String(name||'').replace(/[®™]/g,'').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
class GpuGameSettings{
 constructor({programFiles=process.env.ProgramFiles||'C:/Program Files',client=new NvidiaApp({programFiles}),folder,clock=Date.now,assertClosed=async()=>{},assertNoBackup=async()=>{},openApp=async()=>{}}={}){Object.assign(this,{programFiles,client,folder,clock,assertClosed,assertNoBackup,openApp});this.plans=new Map();this.files={nvidia:path.join(programFiles,'NVIDIA Corporation/NVIDIA App/CEF/NVIDIA App.exe'),amd:path.join(programFiles,'AMD/CNext/CNext/RadeonSoftware.exe')};}
 async installed(){const rows=await Promise.all(Object.entries(this.files).map(async([id,file])=>{let installed=false;try{installed=(await fs.stat(file)).isFile();}catch{}return [id,installed];}));return Object.fromEntries(rows);}
 cancelRead(){this.client.close();}
 close(){this.cancelRead();this.plans.clear();}
 async discovery(){
  if(!this.folder)return;
  this.discoveryRead??=(async()=>{try{const file=path.join(this.folder,'nvidia-games.json');if((await fs.stat(file)).size>512*1024)return;const data=JSON.parse(await fs.readFile(file,'utf8'));if(data.version===1&&Number.isFinite(data.at)&&data.at<=this.clock()+300000&&this.clock()-data.at<30*86400000&&Array.isArray(data.applications)&&data.applications.length<=4096&&data.applications.every(a=>typeof a.game==='string'&&a.game.length>0&&a.game.length<300&&typeof a.displayName==='string'&&a.displayName.length<300))this.cache={at:data.at,apps:data.applications};}catch{}})();
  await this.discoveryRead;
 }
 async remember(apps){
  if(!this.folder)return;
  const data={version:1,at:this.clock(),applications:apps.map(a=>({game:a.game,displayName:a.displayName,isCreativeApp:a.isCreativeApp===true}))};
  try{await fs.mkdir(this.folder,{recursive:true});await fs.writeFile(path.join(this.folder,'nvidia-games.json'),JSON.stringify(data));}catch{}
 }
 async open(provider){if(!Object.hasOwn(this.files,provider)||!(await this.installed())[provider])throw Error('This GPU app is not installed.');await this.openApp(this.files[provider]);return {opened:true};}
 async catalog(force=false){
  await this.discovery();
  if(!force&&this.cache&&this.clock()-this.cache.at<30*86400000)return this.cache.apps;
  if(this.pending)return this.pending;
  const pending=this.client.call(READ,{}).then(async data=>{if(!Array.isArray(data.applications)||data.applications.length>4096)throw Error('NVIDIA returned an unsupported game list.');const apps=data.applications.filter(a=>typeof a.game==='string'&&a.game.length>0&&a.game.length<300&&typeof a.displayName==='string');this.cache={at:this.clock(),apps};await this.remember(apps);return apps;}).finally(()=>{if(this.pending===pending)this.pending=null;});this.pending=pending;return pending;
 }
 matches(apps,game){
  const names=new Set([normalize(game.title)]);
  if(game.id==='steam:2357570'||game.versions?.some(v=>v.source==='Steam'&&String(v.appId)==='2357570'))names.add('overwatch2');
  return apps.filter(a=>!a.isCreativeApp&&(names.has(normalize(a.game))||names.has(normalize(a.displayName))));
 }
 async game(game,{refresh=false}={}){
  if(game?.kind!=='game')throw Error('Choose a game.');const installed=await this.installed();if(!installed.nvidia)return {installed,nvidia:null};
  const matches=this.matches(await this.catalog(refresh),game);
  if(matches.length!==1)return {installed,nvidia:null,note:matches.length?'More than one NVIDIA game matches. Choose it in NVIDIA App.':'This game is not in NVIDIA’s saved game list. Check again to refresh it.'};
  const app=await this.readGame(matches[0].game);return {installed,nvidia:this.summary(app)};
 }
 async readGame(id,preset){
  const data=await this.client.call(READ,{game:id,...(preset&&preset!=='Revert'?{preset}:{})}),app=data.applications?.find(a=>a.game===id);
  if(!app)throw Error('NVIDIA App no longer detects this game. Check again to refresh its game list.');return app;
 }
 summary(app){const p=app.optimizationProfiles?.ac;return {game:app.game,title:app.displayName,supported:app.opsSupported===true,currentState:typeof p?.currentState==='string'?p.currentState:'UNKNOWN',presets:app.opsSupported===true&&!p?.unavailableReason?presets.filter(v=>v==='Revert'||p?.availablePresets?.includes(v)):[],reason:typeof p?.unavailableReason==='string'?p.unavailableReason:app.opsSupported!==true?'NVIDIA App does not support optimization for this game.':!p?'NVIDIA App did not return a power profile.':null};}
 async fresh(game,preset){
  const matches=this.matches(await this.catalog(),game);if(matches.length!==1)throw Error('Find this game in NVIDIA App first.');
  return this.summary(await this.readGame(matches[0].game,preset));
 }
 async preview(game,preset){
  if(game?.kind!=='game')throw Error('Choose a game.');if(!presets.includes(preset))throw Error('Choose an available NVIDIA preset.');await this.assertNoBackup(game);const app=await this.fresh(game,preset);if(app.reason||!app.presets.includes(preset))throw Error(app.reason||'This NVIDIA preset is unavailable.');
  for(const [token,p]of this.plans)if(p.gameId===game.id||p.expires<this.clock())this.plans.delete(token);while(this.plans.size>=8)this.plans.delete(this.plans.keys().next().value);
  const token=crypto.randomUUID();this.plans.set(token,{gameId:game.id,app:app.game,preset,fingerprint:digest(app),expires:this.clock()+120000});return {token,game:app.title,preset,currentState:app.currentState,notice:preset==='Revert'?'This restores NVIDIA defaults for this game, not your previous custom settings.':'NVIDIA applies this preset to the game. It may change resolution and display mode. View the individual recommendations in NVIDIA App.',individualValuesAvailable:false};
 }
 async apply(game,token){
  const p=this.plans.get(token);if(!p||p.gameId!==game.id||p.expires<this.clock())throw Error('This NVIDIA review expired. Review the preset again.');this.plans.delete(token);
  await this.assertNoBackup(game);await this.assertClosed(game);const app=await this.fresh(game,p.preset);if(app.game!==p.app||digest(app)!==p.fingerprint||app.reason||!app.presets.includes(p.preset))throw Error('NVIDIA settings changed. Review the preset again.');
  await this.assertClosed(game);const result=await this.client.call(SET,{game:p.app,preset:p.preset,powerSource:'AC'});
  return {message:(typeof result.message==='string'?result.message:typeof result.result==='string'?result.result:'NVIDIA returned a response. Check NVIDIA App for the result.').slice(0,1200),confirmed:result.success===true||result.status==='success',preset:p.preset};
 }
}
module.exports={GpuGameSettings,normalize};
