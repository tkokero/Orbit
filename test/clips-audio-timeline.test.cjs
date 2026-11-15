const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{execFileSync}=require('node:child_process');
const load=()=>import('../src/capture/audio-timeline.mjs');
const chunk=(frames=960)=>new Uint8Array(new Float32Array(frames*2).fill(.25).buffer);
test('capture timestamps follow sample counts regardless of delivery jitter',async()=>{
 const {AudioTimeline}=await load(),clock=new AudioTimeline(10.04,.04);let previous;
 for(let i=0;i<10000;i++){const row=clock.read(chunk(),10);assert(Math.abs(row.timestamp-i*.02)<1e-10);if(previous!==undefined)assert(Math.abs(row.timestamp-previous-.02)<1e-10);previous=row.timestamp;assert.equal(row.data.length,1920);}
});
test('only audio before the video origin is trimmed, preserving channels and exact gain',async()=>{
 const {AudioTimeline}=await load(),clock=new AudioTimeline(1,.04);assert.equal(clock.read(chunk(),1),null);assert.equal(clock.read(chunk(),1),null);let row=clock.read(chunk(),1);assert(Math.abs(row.timestamp)<1e-10);assert(row.data.every(v=>v===.25));
 const partial=new AudioTimeline(1,.04),pcm=new Float32Array(1920);for(let i=0;i<pcm.length;i++)pcm[i]=i%2?.2:-.1;row=partial.read(new Uint8Array(pcm.buffer),.97);assert(Math.abs(row.timestamp)<1e-10);assert.equal(row.data.length,960);assert(Math.abs(row.data[0]+.1)<1e-6);assert(Math.abs(row.data[1]-.2)<1e-6);
});
test('invalid audio clocks and malformed PCM are rejected; non-finite samples are silent',async()=>{
 const {AudioTimeline}=await load();assert.throws(()=>new AudioTimeline(NaN,0),/clock/);assert.throws(()=>new AudioTimeline(0,1),/clock/);const clock=new AudioTimeline(0,0);assert.throws(()=>clock.read(new Uint8Array(3),0),/stereo/);const data=new Float32Array([NaN,Infinity,.2,-.2]),row=clock.read(new Uint8Array(data.buffer),0);assert.equal(row.data[0],0);assert.equal(row.data[1],0);assert(Math.abs(row.data[2]-.2)<1e-6);
});
test('native mixer keeps two-minute generated sources continuous with uneven packets and separate clocks',{skip:process.platform!=='win32'},()=>{
 const report=JSON.parse(execFileSync(path.join(__dirname,'../src/native/capture/OrbitAudio.exe'),['--buffer-test'],{encoding:'utf8',windowsHide:true,timeout:10000}));assert(report.passed&&report.syntheticOnly);assert.equal(report.microphoneOpened,false);assert.equal(report.deviceLoopbackOpened,false);assert(report.cases.every(r=>r.underruns===0));assert(report.cases.some(r=>r.legacyDropoutBlocks>0));
});
