const path=require('node:path'),{spawn}=require('node:child_process'),Core=require('./ui/controller-sound-core.js');
const key='orbit-clip-sound-v1';
function enabled(value){try{return JSON.parse(value||'{}').enabled!==false;}catch{return true;}}
let cached;
function wave(){
 if(cached)return cached;const {samples,sampleRate}=Core.render('save',48000),data=Buffer.alloc(44+samples.length*2);
 data.write('RIFF',0);data.writeUInt32LE(data.length-8,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(sampleRate,24);data.writeUInt32LE(sampleRate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(samples.length*2,40);
 for(let i=0;i<samples.length;i++)data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]*.45))*32767),44+i*2);cached=data;return data;
}
class ClipCue{
 constructor({allowed=()=>true,launch=spawn}={}){this.allowed=allowed;this.launch=launch;this.child=null;this.closed=false;}
 play(){
  if(this.closed||this.child||!this.allowed())return false;
  try{const child=this.launch(path.join(__dirname,'native/capture/OrbitAudio.exe').replace(/app\.asar([\\/])/,'app.asar.unpacked$1'),['--saved-cue'],{windowsHide:true,shell:false,stdio:['pipe','ignore','ignore']});this.child=child;const timer=setTimeout(()=>child.kill(),2000);timer.unref?.();const done=()=>{clearTimeout(timer);if(this.child===child)this.child=null;};child.once('exit',done);child.once('error',done);child.stdin.on('error',()=>{});child.stdin.end(wave());return true;}catch{this.child=null;return false;}
 }
 close(){this.closed=true;this.child?.kill();this.child=null;}
}
module.exports={ClipCue,wave,enabled,key};
