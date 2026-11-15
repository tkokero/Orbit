const test=require('node:test'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process'),path=require('node:path');
const {preferences,forGame}=require('../src/clips-settings.cjs'),P=require('../src/ui/clip-audio-presets.js');
test('audio presets preserve quality, privacy, missing IDs and independent volumes',()=>{
 const source=preferences({height:1440,fps:60,seconds:120,mode:'source',audio:true,audioMode:'devices',audioDevices:['missing-output'],audioApps:['C:\\Game.exe'],audioVolume:74,microphone:true,micDevice:'missing-mic',micVolume:35});
 const saved=preferences(P.save(source,'My headset','saved:one'));assert.equal(saved.audioPresets.length,1);assert.equal(P.match(saved),'saved:one');
 const silent=preferences(P.apply(saved,'silent'));assert(!silent.audio&&!silent.microphone);assert.equal(silent.height,1440);assert.equal(silent.fps,60);assert.equal(silent.mode,'source');
 const restored=preferences(P.apply(silent,'saved:one'));assert.deepEqual(P.pick(restored),P.pick(source));assert.deepEqual(restored.audioDevices,['missing-output']);assert.equal(restored.micVolume,35);assert.equal(forGame(restored,'x').audioPresets,undefined);
 const updated=preferences(P.save({...restored,micVolume:25},'my HEADSET','saved:unused'));assert.equal(updated.audioPresets.length,1);assert.equal(updated.audioPresets[0].id,'saved:one');assert.equal(updated.audioPresets[0].micVolume,25);
});
test('preset bounds and malformed choices cannot damage saved clipping preferences',()=>{
 const source=preferences();assert.throws(()=>preferences({...source,audioPresets:[{id:'bad',name:'Bad'}]}),/presets/);assert.throws(()=>preferences({...source,audioPresets:Array(13).fill({id:'saved:a',name:'A'})}),/12/);
 assert.throws(()=>P.save(source,'','saved:one'),/name/);assert.throws(()=>P.apply(source,'missing'),/available/);assert.throws(()=>preferences({...source,audioPresets:[{id:'saved:a',name:'A',audioDevices:Array(5).fill('x')}]}),/four/);
 assert.equal(source.microphone,false);assert.equal(source.audio,false);
});
test('changing visible selections retains missing selections until the user forgets them',()=>{
 assert.deepEqual(P.mergeSelection(['missing','visible'],['visible','new'],['new']),['missing','new']);
 assert.deepEqual(P.mergeSelection(['returned'],['returned'],['returned']),['returned']);
 assert.deepEqual(P.mergeSelection(['returned'],['returned'],[]),[]);
 const {selection}=require('../src/clips-audio.cjs');assert.deepEqual(selection({audio:true,audioMode:'devices',audioDevices:[],microphone:true,micDevice:'selected-mic'}).sources,[{kind:'microphone',id:'selected-mic',gain:1}]);
});
test('native source recovery skips missing sources, reconnects, stays silent without fallback, and cleans up',{skip:process.platform!=='win32'},()=>{
 const result=JSON.parse(execFileSync(path.join(__dirname,'../src/native/capture/OrbitAudio.exe'),['--hotplug-test'],{windowsHide:true,encoding:'utf8',timeout:10000}));assert(result.passed&&result.syntheticOnly&&result.noFallback&&result.missingSourceReturns&&result.repeatedReconnect&&result.allMissingSilent&&result.stoppedResourcesReleased);assert.equal(result.microphoneOpened,false);assert.equal(result.deviceLoopbackOpened,false);
});
