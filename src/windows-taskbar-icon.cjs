const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{constants}=require('node:fs'),{execFile}=require('node:child_process');
function notify(changes){return new Promise((resolve,reject)=>{const helper=path.join(__dirname.replace('app.asar'+path.sep,'app.asar.unpacked'+path.sep),'native/shell/orbit-shell.exe');const child=execFile(helper,[],{windowsHide:true,timeout:5000},error=>error?reject(error):resolve());child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(changes));});}
const samePath=(a,b)=>typeof a==='string'&&typeof b==='string'&&path.win32.normalize(a).toLowerCase()===path.win32.normalize(b).toLowerCase();
const identity=s=>Object.fromEntries(['target','args','cwd','description','appUserModelId','toastActivatorClsid'].map(k=>[k,s[k]||'']));
class TaskbarIcon{
 constructor({folder,folders=[],backupFolder,iconFolder,executable,appId,read,write,notifyShell=notify}){Object.assign(this,{folder,folders,backupFolder,iconFolder,executable,appId,read,write,notifyShell});this.queue=Promise.resolve();this.revision=0;}
 sync(icon){const ticket=++this.revision,task=this.queue.catch(()=>{}).then(()=>ticket===this.revision?this.update(icon):{updated:0});this.queue=task;return task;}
 async update(icon){
  if(path.dirname(path.resolve(icon))!==path.resolve(this.iconFolder)||!/^theme-[a-f0-9]{20}\.ico$/.test(path.basename(icon)))throw Error('Invalid themed taskbar icon.');
  const changed=[];
  await fs.access(icon);
  for(const folder of new Set([this.folder,...this.folders].filter(Boolean).map(f=>path.resolve(f)))){
  let entries;try{entries=await fs.readdir(folder,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')continue;throw e;}
  for(const entry of entries){
   if(!entry.isFile()||!entry.name.toLowerCase().endsWith('.lnk'))continue;
   const file=path.join(folder,entry.name);let before;try{before=this.read(file);}catch{continue;}
   if(!samePath(before.target,this.executable)||before.appUserModelId&&before.appUserModelId!==this.appId||/(?:^|\s)--(?:orbit-game=|dev-debug\b|smoke-test\b|orbit-recorder\b)/i.test(before.args||''))continue;
   if(samePath(before.icon,icon)&&Number(before.iconIndex||0)===0)continue;
   const bytes=await fs.readFile(file);await fs.mkdir(this.backupFolder,{recursive:true});const backup=path.join(this.backupFolder,crypto.createHash('sha256').update(path.resolve(file).toLowerCase()).digest('hex').slice(0,24)+'.lnk');
   try{await fs.copyFile(file,backup,constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;}
   try{if(!this.write(file,'update',{icon,iconIndex:0}))throw Error('Windows could not update the Orbit taskbar icon.');const after=this.read(file);if(JSON.stringify(identity(after))!==JSON.stringify(identity(before))||!samePath(after.icon,icon)||Number(after.iconIndex)!==0)throw Error('Taskbar shortcut verification failed.');}catch(e){await fs.writeFile(file,bytes);throw e;}
   changed.push({path:file,oldIcon:before.icon||this.executable,oldIndex:Number(before.iconIndex)||0});
  }
  }
  const updated=changed.length;
  if(changed.length)await this.notifyShell(changed);return {updated};
 }
}
module.exports={TaskbarIcon,notify};
