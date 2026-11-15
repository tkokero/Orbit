const fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
const MiB=1024*1024,GiB=1024*MiB,RESERVE=512*MiB;
const recordingName=name=>/^Orbit .+\.mp4(?:\.partial)?$/i.test(name);
async function storage(folder){
 let bytes=0,files=0,seen=0;const dir=await fs.opendir(folder);
 for await(const entry of dir){if(++seen>20000)throw Error('This folder has too many files. Choose a separate clips folder.');if(!entry.isFile()||!recordingName(entry.name))continue;const stat=await fs.lstat(path.join(folder,entry.name));if(stat.isFile()&&!stat.isSymbolicLink()){bytes+=stat.size;files++;}}
 const disk=await fs.statfs(folder);return {bytes,files,free:disk.bavail*disk.bsize};
}
async function spaceFor(folder,{limitGB=0,needed=0}={}){const s=await storage(folder);if(s.free<RESERVE+needed)throw Error('Not enough free space. Keep at least 512 MB free.');if(limitGB&&s.bytes+needed>limitGB*GiB)throw Error('The clip library limit is reached. Increase it or choose another folder.');return s;}
class SessionFile{
 constructor({folder,label='Game',metadata={},maxGB=20,libraryGB=0,onLimit=()=>{},clock=Date.now,free}={}){
  if(!path.isAbsolute(folder)||!Number.isInteger(maxGB)||maxGB<1||maxGB>100||!Number.isInteger(libraryGB)||libraryGB<0||libraryGB>1000)throw Error('Invalid recording storage limits.');
  Object.assign(this,{folder:path.resolve(folder),label,metadata,maxGB,libraryGB,onLimit,clock,free});this.bookmarks=[];this.createdAt=clock();this.size=0;this.serial=Promise.resolve();this.metadataSerial=Promise.resolve();this.closed=false;this.limitSent=false;this.lastSpaceCheck=0;
 }
 async start(){
  await fs.mkdir(this.folder,{recursive:true});const s=await spaceFor(this.folder,{limitGB:this.libraryGB,needed:32*MiB});this.maxBytes=Math.min(this.maxGB*GiB,this.libraryGB?this.libraryGB*GiB-s.bytes:Infinity);this.margin=16*MiB;
  const label=String(this.label).replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').trim().slice(0,64)||'Game';this.final=path.join(this.folder,'Orbit '+label+' '+new Date(this.createdAt).toISOString().replace(/[:.]/g,'-')+' '+randomUUID().slice(0,8)+'.mp4');this.partial=this.final+'.partial';this.manifest=this.partial+'.json';this.file=await fs.open(this.partial,'wx');
  try{await this.checkpoint(0,true);}catch(e){await this.file.close();await fs.unlink(this.partial).catch(()=>{});throw e;}return {name:path.basename(this.partial),createdAt:this.createdAt};
 }
 markLimit(reason){if(this.limitSent)return;this.limitSent=true;this.reason=reason;setImmediate(()=>this.onLimit(reason));}
 async monitor(){
  if(this.closed||this.limitSent||this.clock()-this.lastSpaceCheck<15000)return;this.lastSpaceCheck=this.clock();const free=this.free?await this.free():(await fs.statfs(this.folder));const available=typeof free==='number'?free:free.bavail*free.bsize;
  if(available<RESERVE+this.margin)this.markLimit('Recording stopped to keep free space available.');
  if(this.libraryGB){const s=await storage(this.folder);if(s.bytes>=this.libraryGB*GiB-this.margin)this.markLimit('Recording stopped at the clip library limit.');}
 }
 write(data,position){
  if(this.closed||!this.file)return Promise.reject(Error('Session recording is closed.'));
  if(!Number.isSafeInteger(position)||position<0||!data?.byteLength||data.byteLength>2*MiB||position+data.byteLength>this.maxBytes)return Promise.reject(Error('Session output reached its size limit.'));
  const bytes=Buffer.from(data);const job=this.serial.then(async()=>{let offset=0;while(offset<bytes.length){const result=await this.file.write(bytes,offset,bytes.length-offset,position+offset);if(!result.bytesWritten)throw Error('The recording could not be written.');offset+=result.bytesWritten;}this.size=Math.max(this.size,position+bytes.length);if(this.size>=this.maxBytes-this.margin)this.markLimit(this.libraryGB&&this.maxBytes<this.maxGB*GiB?'Recording stopped at the clip library limit.':'Recording stopped at the session limit.');await this.monitor();}).catch(e=>{this.failure=e;throw e;});this.serial=job.catch(()=>{});return job;
 }
 checkpoint(seconds,interrupted=true){const task=this.metadataSerial.then(()=>this.writeCheckpoint(seconds,interrupted));this.metadataSerial=task.catch(()=>{});return task;}
 async writeCheckpoint(seconds,interrupted=true){this.lastSeconds=Number.isFinite(seconds)?Math.max(0,seconds):0;const info={...this.metadata,kind:'session',createdAt:this.createdAt,seconds:this.lastSeconds,bookmarks:this.bookmarks.map(b=>({...b})),interrupted,recording:!this.closed,writerPid:process.pid};const json=JSON.stringify(info);if(json.length>128*1024)throw Error('Recording metadata exceeded its limit.');await fs.writeFile(this.manifest+'.tmp',json,'utf8');await fs.rename(this.manifest+'.tmp',this.manifest);}
 async bookmark(seconds){if(this.closed||!Number.isFinite(seconds)||seconds<0)throw Error('The recording is not ready for a bookmark.');const last=this.bookmarks.at(-1);if(last&&seconds-last.seconds<1)return {bookmark:true,seconds:last.seconds,count:this.bookmarks.length};if(this.bookmarks.length>=1000)throw Error('This recording has reached 1,000 bookmarks.');this.bookmarks.push({seconds});try{await this.checkpoint(seconds);}catch(e){this.bookmarks.pop();throw e;}return {bookmark:true,seconds,count:this.bookmarks.length};}
 async finish(seconds){if(this.closed)return null;await this.serial;if(this.failure)throw this.failure;await this.file.sync();await this.file.close();this.closed=true;await this.checkpoint(seconds,false);await fs.rename(this.partial,this.final);await fs.rename(this.manifest,this.final+'.json');return {path:this.final,name:path.basename(this.final),seconds,createdAt:this.createdAt,bytes:this.size,kind:'session',bookmarks:this.bookmarks,stopReason:this.reason||null};}
 async abort(){if(this.closed)return;await this.serial;await this.file?.close().catch(()=>{});this.closed=true;if(this.size===0){await fs.unlink(this.partial).catch(()=>{});await fs.unlink(this.manifest).catch(()=>{});}else await this.checkpoint(this.lastSeconds,true).catch(()=>{});return this.size?{name:path.basename(this.partial),bytes:this.size,interrupted:true}:null;}
}
module.exports={SessionFile,storage,spaceFor,recordingName,RESERVE,GiB};
