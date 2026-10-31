// One write at a time: controls go first, pixels keep only their newest frame.
// Round-robin selection prevents a busy dashboard/watch starving screen panels.
class VrTransport {
 constructor(stream){this.stream=stream;this.commands=[];this.frames=new Map();this.cursor=-1;this.writing=false;this.closed=false;}
 command(bytes){if(this.closed)return;this.commands.push(bytes);this.pump();}
 frame(id,encode){if(this.closed)return;this.frames.set(id,encode);this.pump();}
 discard(id){this.frames.delete(id);}
 pump(){
  if(this.closed||this.writing||this.stream.destroyed)return;
  let bytes=this.commands.shift();
  if(!bytes&&this.frames.size){const ids=[...this.frames.keys()].sort((a,b)=>a-b),id=ids.find(id=>id>this.cursor)??ids[0],encode=this.frames.get(id);this.frames.delete(id);this.cursor=id;bytes=encode();}
  if(!bytes)return;
  this.writing=true;this.stream.write(bytes,()=>{this.writing=false;setImmediate(()=>this.pump());});
 }
 close(){this.closed=true;this.commands.length=0;this.frames.clear();}
}
module.exports={VrTransport};
