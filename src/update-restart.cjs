const fs=require('node:fs/promises'),path=require('node:path');
const RESUME_WINDOW=15*60*1000;
async function readyForUpdate({window,customArtwork,startupMedia,saveBackups,backupScheduler}){
 if(customArtwork?.busy||startupMedia?.busy||saveBackups?.busy||backupScheduler?.running||backupScheduler?.pending?.size)return false;
 if(window&&!window.isDestroyed())try{return Boolean(await window.webContents.executeJavaScript("Boolean(window.orbitReady&&!document.querySelector('#orbit-boot'))"));}catch{return false;}
 return true;
}
function backgroundRestart({automatic,window,playing}){
 // Reopen visibly after updates; an automatic restart during play must not activate.
 return Boolean(automatic&&playing);
}
class UpdateRestart{
 constructor(file,{clock=Date.now}={}){this.file=file;this.clock=clock;}
 async save(background){await fs.mkdir(path.dirname(this.file),{recursive:true});await fs.writeFile(this.file+'.tmp',JSON.stringify({version:1,at:this.clock(),background:Boolean(background)}));await fs.rename(this.file+'.tmp',this.file);}
 async clear(){try{await fs.unlink(this.file);}catch(error){if(error.code!=='ENOENT')throw error;}}
 async consume(updated){
  const fallback={resume:false,background:false};let value;
  try{value=JSON.parse(await fs.readFile(this.file,'utf8'));await this.clear();}catch{return fallback;}
  const age=this.clock()-value.at;
  return updated&&value.version===1&&Number.isFinite(value.at)&&age>=0&&age<=RESUME_WINDOW&&typeof value.background==='boolean'?{resume:true,background:value.background}:fallback;
 }
}
module.exports={UpdateRestart,readyForUpdate,backgroundRestart,RESUME_WINDOW};
