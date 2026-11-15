const test=require('node:test'),assert=require('node:assert/strict');
const {preferences}=require('../src/clips-settings.cjs'),{selection,PCMFrames}=require('../src/clips-audio.cjs');
test('1440p and explicit audio choices survive preference normalization',async()=>{
 const input={height:1440,audio:true,audioMode:'apps',audioApps:['C:\\Games\\Game.exe'],microphone:true,micDevice:'mic:fixture',micVolume:40,audioVolume:90};
 const saved=preferences(input);for(const key of Object.keys(input))assert.deepEqual(saved[key],input[key]);assert.equal(preferences().microphone,false);assert.equal(preferences().audio,false);
 const {quality}=await import('../src/capture/quality.mjs');assert.deepEqual(quality(1440),{width:2560,height:1440,bitrate:18000000});
});
test('selected apps and devices never expand into all-PC audio',()=>{
 const selected=selection({audio:true,audioMode:'apps',audioApps:['C:\\Game.exe'],microphone:true,micDevice:'mic:1',micVolume:40,audioVolume:90});
 assert.deepEqual(selected.sources,[{kind:'app',id:'C:\\Game.exe',gain:0.9},{kind:'microphone',id:'mic:1',gain:0.4}]);
 assert.deepEqual(selection({audio:true,audioMode:'devices',audioDevices:['device:a','device:b']}).sources.map(r=>r.id),['device:a','device:b']);
 assert.throws(()=>selection({audio:true,audioMode:'apps',audioApps:[]}),/Choose at least one/);assert.throws(()=>selection({audio:true,audioMode:'devices'}),/Choose at least one/);
 assert.throws(()=>selection({audio:true,audioMode:'game'}),/detected game/);assert.deepEqual(selection({audio:true,audioMode:'game'},{pid:99}).sources,[{kind:'game',id:'99',gain:1}]);
 assert.equal(selection({microphone:true}).sources[0].kind,'microphone');assert.equal(selection({microphone:true}).sources.length,1);
});
test('audio selection and gains are bounded without changing Windows volume',()=>{
 assert.equal(preferences({micVolume:1000,audioVolume:-5}).micVolume,100);assert.equal(preferences({micVolume:1000,audioVolume:-5}).audioVolume,0);
 assert.throws(()=>preferences({audioMode:'fallback-everything'}),/audio capture source/);assert.throws(()=>preferences({audioApps:Array(5).fill('x')}),/four audio/);assert.throws(()=>preferences({audioDevices:['bad\nsource']}),/four audio/);
});
test('native PCM framing handles partial chunks and rejects unbounded or malformed input',()=>{
 const received=[],parser=new PCMFrames(p=>received.push(p)),samples=new Float32Array([0.1,0.2,-0.1,-0.2]),payload=Buffer.from(samples.buffer),size=Buffer.alloc(4);size.writeUInt32LE(payload.length);const packet=Buffer.concat([size,payload]);
 parser.push(packet.subarray(0,2));assert.equal(received.length,0);parser.push(packet.subarray(2,8));parser.push(packet.subarray(8));assert.deepEqual(Buffer.from(received[0]),payload);
 assert.throws(()=>new PCMFrames(()=>{}).push(Buffer.alloc(384001)),/fell behind/);assert.throws(()=>new PCMFrames(()=>{}).push(Buffer.of(7,0,0,0)),/Invalid audio/);
});
