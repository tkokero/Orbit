const fs=require('node:fs/promises'),path=require('node:path');
async function folderSpace(folders,{statfs=fs.statfs,timeout=2500}={}){
 const volumes=new Map();return Promise.all((folders||[]).slice(0,32).map(async f=>{
  const result={index:f.nFolderIndex,available:false};if(f.bIsMounted===false||typeof f.strFolderPath!=='string'||!path.win32.isAbsolute(f.strFolderPath))return result;
  const root=path.win32.parse(f.strFolderPath).root,key=root.toLowerCase();if(!volumes.has(key))volumes.set(key,(async()=>{let timer;try{return await Promise.race([statfs(root),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Drive unavailable')),timeout);})]);}finally{clearTimeout(timer);}})());
  try{const stat=await volumes.get(key),free=Number(stat.bavail)*Number(stat.bsize),total=Number(stat.blocks)*Number(stat.bsize);if(!Number.isFinite(free)||!Number.isFinite(total)||free<0||total<=0||free>total)return result;return {...result,available:true,free,total};}catch{return result;}
 }));
}
module.exports={folderSpace};
