const fs = require('node:fs/promises');
const path = require('node:path');
const { watch } = require('node:fs');
function installationProgress(app) {
  const number = key => Math.max(0, Number(app[key]) || 0);
  const flags=number('StateFlags'),active=Boolean(flags&256||flags&1024),paused=Boolean(flags&512);
  if(!active&&!paused&&(flags&4)&&!(flags&2))return null;
  const prefix=paused?'Paused · ':!active?'Queued · ':'';
  const total=number('BytesToDownload'),done=Math.min(total,number('BytesDownloaded'));
  const stageTotal=number('BytesToStage'),staged=Math.min(stageTotal,number('BytesStaged'));
  if(total>done)return {phase:prefix+'Download',done,total,percent:Math.floor(done/total*100)};
  if(stageTotal>staged)return {phase:prefix+'Installing',done:staged,total:stageTotal,percent:Math.floor(staged/stageTotal*100)};
  if(!(flags&4))return {phase:total||stageTotal?'Finalizing':'Installation pending',percent:null};
  return null;
}
async function watchFolders(steamRoot,parseVdf) {
  const folders=[];
  if(steamRoot){folders.push(path.join(steamRoot,'steamapps'));try{const vdf=parseVdf(await fs.readFile(path.join(steamRoot,'steamapps/libraryfolders.vdf'),'utf8')).libraryfolders||{};for(const [key,value]of Object.entries(vdf))if(/^\d+$/.test(key)&&value)folders.push(path.join(typeof value==='string'?value:value.path,'steamapps'));}catch{}}
  folders.push(path.join(process.env.ProgramData||'C:/ProgramData','Epic/EpicGamesLauncher/Data/Manifests'));
  for(const base of [process.env.ProgramData,process.env.APPDATA])if(base)folders.push(path.join(base,'Microsoft/Windows/Start Menu/Programs'));
  for(const base of [process.env.USERPROFILE,process.env.PUBLIC])if(base)folders.push(path.join(base,'Desktop'));
  return [...new Set(folders)];
}
class LibraryMonitor {
  constructor(onChange,delay=1500){this.onChange=onChange;this.delay=delay;this.watchers=[];this.events=new Map();}
  start(folders){this.close();for(const folder of folders){try{const watcher=watch(folder,{persistent:false,recursive:/Start Menu[\\/]Programs$/i.test(folder)},(_event,file)=>{
    const name=String(file||'');if(name&&!/appmanifest_\d+\.acf$|libraryfolders\.vdf$|\.item$|\.lnk$/i.test(name))return;
    this.events.set(path.join(folder,name),{folder,name});if(!this.timer)this.timer=setTimeout(()=>{this.timer=null;const events=[...this.events.values()];this.events.clear();Promise.resolve(this.onChange(events)).catch(()=>{});},this.delay);
  });watcher.on('error',()=>watcher.close());this.watchers.push(watcher);}catch{}}}
  close(){for(const watcher of this.watchers)watcher.close();this.watchers=[];clearTimeout(this.timer);this.timer=null;this.events.clear();}
}
module.exports={installationProgress,watchFolders,LibraryMonitor};
