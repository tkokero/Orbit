/* Original mallet/bubble UI cues. Pure offline synthesis shared with validation. */
(function(root,factory){if(typeof module==='object')module.exports=factory();else root.OrbitControllerSoundCore=factory();})(globalThis,()=>{
 const presets={navigate:{duration:.17,notes:[[523.25,0,.13,.20]]},confirm:{duration:.39,notes:[[392,0,.29,.24],[587.33,.065,.29,.14]]},back:{duration:.30,notes:[[349.23,0,.25,.23],[261.63,.035,.22,.08]]},toggle:{duration:.27,notes:[[659.25,0,.22,.16],[329.63,0,.23,.10]]},menu:{duration:.47,notes:[[261.63,0,.38,.20],[392,.045,.37,.14],[523.25,.08,.32,.08]]},save:{duration:.49,notes:[[440,0,.37,.20],[659.25,.075,.35,.14]]}};
 function settings(input={}){input=input&&typeof input==='object'?input:{};return {enabled:input.enabled!==false,volume:Number.isFinite(Number(input.volume))?Math.max(0,Math.min(50,Number(input.volume))):20};}
 function render(kind,rate=48000){const preset=presets[kind]||presets.navigate,sampleRate=Math.max(8000,Math.min(96000,rate)),samples=new Float32Array(Math.ceil(preset.duration*sampleRate));
 for(const [hz,at,life,strength]of preset.notes){const from=Math.round(at*sampleRate),n=Math.round(life*sampleRate);for(let i=0;i<n&&from+i<samples.length;i++){const t=i/sampleRate,p=i/n,attack=Math.min(1,t/.014),edge=Math.sin(attack*Math.PI/2)**2,tail=Math.min(1,(1-p)/.18)**2,phase=2*Math.PI*hz*t;const body=Math.sin(phase)*Math.exp(-p*3.8),glass=.13*Math.sin(phase*2.003)*Math.exp(-p*7),round=.10*Math.sin(phase*.5)*Math.exp(-p*4.8);samples[from+i]+=(body+glass+round)*edge*tail*strength;}}
 return {samples,sampleRate,duration:preset.duration};}
 return {render,settings,kinds:Object.keys(presets)};
});
