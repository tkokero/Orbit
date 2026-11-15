const {spawn,execFile}=require('node:child_process'),path=require('node:path');
const helper=()=>path.join(__dirname,'native/capture/OrbitAudio.exe').replace(/app\.asar([\\/])/,'app.asar.unpacked$1');
let cached,pending;
function sources(refresh=false){
 if(!refresh&&cached&&Date.now()-cached.at<10000)return Promise.resolve(cached.value);
 if(pending)return pending;
 pending=new Promise((resolve,reject)=>execFile(helper(),['--list'],{windowsHide:true,timeout:10000,maxBuffer:256*1024,encoding:'utf8'},(error,stdout)=>{
  if(error)return reject(Error('Audio devices could not be read. Refresh the list and try again.'));
  try{const data=JSON.parse(stdout.replace(/^\uFEFF/,'')),rows=key=>Array.isArray(data[key])?data[key].filter(r=>typeof r.id==='string'&&r.id.length<=2048&&typeof r.name==='string').slice(0,80).map(r=>({id:r.id,name:r.name.slice(0,180)})):[];const value={outputs:rows('outputs'),microphones:rows('microphones'),apps:rows('apps')};cached={at:Date.now(),value};resolve(value);}catch(e){reject(Error('Windows returned an invalid audio-device list.'));}
 })).finally(()=>pending=null);return pending;
}
function selection(settings,owner){
 settings=require('./clips-settings.cjs').preferences(settings);
 const result=[];
 if(settings.audio){
  const gain=settings.audioVolume/100;
  if(settings.audioMode==='devices'){if(!settings.audioDevices.length&&!settings.microphone)throw Error('Choose at least one audio device.');for(const id of settings.audioDevices)result.push({kind:'output',id,gain});}
  else if(settings.audioMode==='apps'){if(!settings.audioApps.length&&!settings.microphone)throw Error('Choose at least one running app.');for(const id of settings.audioApps)result.push({kind:'app',id,gain});}
  else if(settings.audioMode==='game'){if(!Number.isInteger(owner?.pid))throw Error('Game-only audio needs a detected game window. Choose apps or devices for this source.');result.push({kind:'game',id:String(owner.pid),gain,...(typeof owner.started==='string'?{started:owner.started}:{})});}
  else result.push({kind:'output',id:'default',gain});
 }
 if(settings.microphone)result.push({kind:'microphone',id:settings.micDevice||'default',gain:settings.micVolume/100});
 return {sources:result};
}
class PCMFrames{
 constructor(onFrame){this.onFrame=onFrame;this.header=Buffer.alloc(4);this.headerBytes=0;this.length=0;this.body=null;this.used=0;}
 push(bytes){if(this.headerBytes+this.used+bytes.length>384000)throw Error('Audio delivery fell behind. Capture stopped.');let at=0;while(at<bytes.length){
  if(!this.length){const count=Math.min(4-this.headerBytes,bytes.length-at);bytes.copy(this.header,this.headerBytes,at,at+count);this.headerBytes+=count;at+=count;if(this.headerBytes<4)return;this.length=this.header.readUInt32LE(0);if(this.length<8||this.length>32768||this.length%8)throw Error('Invalid audio frame.');this.headerBytes=0;}
  if(!this.body&&bytes.length-at>=this.length){const frame=new Uint8Array(bytes.buffer,bytes.byteOffset+at,this.length);at+=this.length;this.length=0;this.onFrame(frame);continue;}
  if(!this.body)this.body=Buffer.allocUnsafe(this.length);const count=Math.min(this.length-this.used,bytes.length-at);bytes.copy(this.body,this.used,at,at+count);this.used+=count;at+=count;
  if(this.used===this.length){const frame=new Uint8Array(this.body.buffer,this.body.byteOffset,this.length);this.body=null;this.length=this.used=0;this.onFrame(frame);}
 }}
}
function start(settings,owner,{onFrame,onError,onSources=()=>{},synthetic=false,hotplug=false}={}){
 const input=selection(settings,owner);if(!input.sources.length)throw Error('No audio source is enabled.');
 const child=spawn(helper(),[synthetic?(hotplug?'--capture-hotplug-test':'--capture-test'):'--capture'],{windowsHide:true,stdio:['pipe','pipe','pipe']});let ready=false,closed=false,tail='';
 const frames=new PCMFrames(onFrame),done=new Promise(resolve=>child.once('exit',resolve));
 const report=error=>{if(!closed)onError?.(error);};child.stdout.on('data',data=>{try{frames.push(data);}catch(error){report(error);child.kill();}});
 const waiting=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('Windows audio capture did not start.'));},10000);
  child.stderr.on('data',data=>{tail+=data.toString();if(tail.length>16384){child.kill();reject(Error('Audio capture returned too many errors.'));return;}let at;while((at=tail.indexOf('\n'))>=0){const line=tail.slice(0,at);tail=tail.slice(at+1);try{const event=JSON.parse(line);if(event.ready){ready=true;clearTimeout(timer);resolve(event);}else if(event.audioSources){const rows=key=>Array.isArray(event.audioSources[key])?event.audioSources[key].filter(i=>Number.isInteger(i)&&i>=0&&i<input.sources.length).map(i=>({kind:input.sources[i].kind,id:input.sources[i].id})):[];onSources({available:rows('available'),missing:rows('missing')});}else if(event.error){const error=Error(event.error);clearTimeout(timer);reject(error);if(ready)report(error);}}catch{}}});
  child.once('error',()=>{clearTimeout(timer);reject(Error('The audio helper could not start.'));});child.once('exit',code=>{clearTimeout(timer);if(!ready)reject(Error('Windows could not open a selected audio source.'));else if(!closed)report(Error('An audio source stopped. Capture has been stopped.'));});
 });
 child.stdin.on('error',error=>{if(!closed)report(error);});
 child.stdin.write(JSON.stringify(input)+'\n');
 // Keep stdin alive so parent exit and Stop both release native device resources.
 return {child,ready:waiting,async stop(){if(closed)return;closed=true;child.stdin.end();const timer=setTimeout(()=>child.kill(),1500);try{await done;}finally{clearTimeout(timer);}}};
}
module.exports={sources,selection,PCMFrames,start};
