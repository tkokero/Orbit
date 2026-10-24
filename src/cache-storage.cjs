const fs=require('node:fs/promises'),path=require('node:path'),{fileURLToPath}=require('node:url');
const MiB=1024*1024,DAY=86400000,FOLDERS={'artwork':64*MiB,'store-artwork':8*MiB,'friend-avatars':8*MiB};
const ownImage=/^[a-f0-9]{28}-(?:cover|hero|icon|news|article)\.(?:jpg|webp)$/;
async function inspect(userData){const rows=[];for(const [name,limit]of Object.entries(FOLDERS)){const folder=path.resolve(userData,name);if(path.dirname(folder)!==path.resolve(userData))throw Error('Invalid cache path.');let entries=[];try{entries=await fs.readdir(folder,{withFileTypes:true});}catch(e){if(e.code!=='ENOENT')throw e;}for(const entry of entries){if(!entry.isFile()||!ownImage.test(entry.name))continue;const file=path.join(folder,entry.name);try{const stat=await fs.lstat(file);if(stat.isFile()&&!stat.isSymbolicLink())rows.push({file,folder:name,limit,bytes:stat.size,mtime:stat.mtimeMs});}catch(e){if(e.code!=='ENOENT')throw e;}}}return rows;}
async function cacheUsage(userData){const rows=await inspect(userData);return {bytes:rows.reduce((n,r)=>n+r.bytes,0),files:rows.length};}
async function trimImageCaches(userData,urls=[],{removeUnused=false,now=Date.now()}={}){
 const keep=new Set();for(const url of urls)try{if(typeof url==='string'&&url.startsWith('file:'))keep.add(path.resolve(fileURLToPath(url)).toLowerCase());}catch{}
 const rows=await inspect(userData),beforeBytes=rows.reduce((n,r)=>n+r.bytes,0);let freedBytes=0,removed=0;
 for(const [name,limit]of Object.entries(FOLDERS)){
  const group=rows.filter(r=>r.folder===name).sort((a,b)=>a.mtime-b.mtime);let total=group.reduce((n,r)=>n+r.bytes,0);
  for(const row of group){if(keep.has(row.file.toLowerCase()))continue;const age=now-row.mtime;if(age<60000)continue;if(!removeUnused&&age<7*DAY&&(total<=limit||age<DAY))continue;
   // Only regular, recognizable cache images inside these three exact folders.
   try{const stat=await fs.lstat(row.file);if(!stat.isFile()||stat.isSymbolicLink())continue;await fs.unlink(row.file);total-=row.bytes;freedBytes+=row.bytes;removed++;}catch(e){if(e.code!=='ENOENT')throw e;}
  }
 }
 return {beforeBytes,afterBytes:beforeBytes-freedBytes,freedBytes,removed};
}
module.exports={cacheUsage,trimImageCaches,FOLDERS};
