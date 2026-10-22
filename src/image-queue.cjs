// Bound downloaded bytes and decoded image buffers across all artwork callers.
class ImageQueue{
 constructor(limit=2){this.limit=limit;this.active=0;this.pending=[];this.tasks=new Map();}
 run(key,job){if(this.tasks.has(key))return this.tasks.get(key);const task=new Promise((resolve,reject)=>{this.pending.push({job,resolve,reject});});this.tasks.set(key,task);const clean=()=>{if(this.tasks.get(key)===task)this.tasks.delete(key);};task.then(clean,clean);this.drain();return task;}
 drain(){while(this.active<this.limit&&this.pending.length){const {job,resolve,reject}=this.pending.shift();this.active++;Promise.resolve().then(job).then(resolve,reject).finally(()=>{this.active--;this.drain();});}}
}
async function imageBytes(response,max=15e6){
 if(Number(response.headers.get('content-length'))>max){await response.body?.cancel();throw Error('Image is too large.');}
 if(!response.body)throw Error('Empty image.');const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('Image is too large.');}chunks.push(value);}return Buffer.concat(chunks,size);}finally{reader.releaseLock();}
}
module.exports={ImageQueue,imageBytes};
