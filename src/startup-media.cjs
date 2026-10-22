const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {pipeline}=require('node:stream/promises'),{Transform}=require('node:stream'),{createReadStream,createWriteStream}=require('node:fs'),{pathToFileURL}=require('node:url');
const MAX=64*1024*1024,validFile=f=>typeof f==='string'&&/^[a-f0-9]{32}\.(mp4|webm)$/.test(f);
class StartupMedia{
 constructor(root){this.root=path.resolve(root);this.queue=Promise.resolve();this.staged=new Map();this.busy=false;}
 exclusive(job){const task=this.queue.then(async()=>{this.busy=true;try{return await job();}finally{this.busy=false;}});this.queue=task.catch(()=>{});return task;}
 file(name){if(!validFile(name))throw Error('Invalid startup video.');return path.join(this.root,name);}
 async current(){try{const index=path.join(this.root,'index.json');if((await fs.stat(index)).size>4096)return null;const data=JSON.parse(await fs.readFile(index,'utf8'));if(!validFile(data.file)||typeof data.name!=='string'||data.name.length>120)return null;const stat=await fs.stat(this.file(data.file));if(!stat.isFile()||stat.size<=0||stat.size>MAX)return null;return {file:data.file,name:data.name,url:pathToFileURL(this.file(data.file)).href};}catch{return null;}}
 async sweep(current){try{if(!current){try{await fs.access(path.join(this.root,'index.json'));return;}catch{}}const keep=new Set([current?.file,...this.staged.values()]);for(const entry of await fs.readdir(this.root,{withFileTypes:true}))if(entry.isFile()&&validFile(entry.name)&&!keep.has(entry.name))await fs.rm(this.file(entry.name),{force:true}).catch(()=>{});}catch{}}
 get(){return this.exclusive(async()=>{const current=await this.current();await this.sweep(current);return current;});}
 close(){return this.exclusive(async()=>{for(const file of this.staged.values())await fs.rm(this.file(file),{force:true}).catch(()=>{});this.staged.clear();});}
 stage(input){return this.exclusive(async()=>{
  const ext=path.extname(input).toLowerCase();if(!['.mp4','.webm'].includes(ext))throw Error('Choose an MP4 or WebM video.');
  const handle=await fs.open(input,'r');let header;try{const stat=await handle.stat();if(!stat.isFile()||stat.size<12||stat.size>MAX)throw Error('Choose a video under 64 MB.');header=Buffer.alloc(32);await handle.read(header,0,32,0);}finally{await handle.close();}
  if(ext==='.mp4'?header.toString('ascii',4,8)!=='ftyp':header.subarray(0,4).toString('hex')!=='1a45dfa3')throw Error('This file is not a supported video container.');
  await fs.mkdir(this.root,{recursive:true});for(const name of this.staged.values())await fs.rm(this.file(name),{force:true});this.staged.clear();
  const token=crypto.randomBytes(16).toString('hex'),file=token+ext,target=this.file(file);let size=0;
  try{await pipeline(createReadStream(input),new Transform({transform(chunk,_encoding,done){size+=chunk.length;done(size>MAX?Error('Choose a video under 64 MB.'):null,chunk);}}),createWriteStream(target,{flags:'wx'}));}catch(e){await fs.rm(target,{force:true});throw e;}
  this.staged.set(token,file);return {token,name:path.basename(input).replace(/[\x00-\x1f]/g,'').slice(0,120),url:pathToFileURL(target).href};
 });}
 commit({token,name}={}){return this.exclusive(async()=>{const file=this.staged.get(token);if(!file)throw Error('Choose the video again.');if(typeof name!=='string'||!name.trim()||name.length>120)throw Error('Invalid video name.');const old=await this.current();const index=path.join(this.root,'index.json');await fs.writeFile(index+'.tmp',JSON.stringify({file,name:name.trim()}));await fs.rename(index+'.tmp',index);this.staged.delete(token);if(old&&old.file!==file)await fs.rm(this.file(old.file),{force:true});return this.current();});}
 discard(token){return this.exclusive(async()=>{const file=this.staged.get(token);if(file){await fs.rm(this.file(file),{force:true});this.staged.delete(token);}return true;});}
 remove(){return this.exclusive(async()=>{const current=await this.current();await fs.rm(path.join(this.root,'index.json'),{force:true});if(current)await fs.rm(this.file(current.file),{force:true});return true;});}
}
module.exports={StartupMedia,MAX};
