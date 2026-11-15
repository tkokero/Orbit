const {options}=require('./clips-buffer.cjs');

function hotkey(value,fallback){
 if(value===undefined)return fallback;
 if(typeof value!=='string'||value.length>70)throw Error('Choose a valid clipping shortcut.');
 const parts=value.replace(/\s+/g,'').split('+'),key=parts.pop(),aliases={ctrl:'Control',control:'Control',alt:'Alt',shift:'Shift',meta:'Super',super:'Super'},mods=parts.map(p=>aliases[p.toLowerCase()]);
 if(mods.some(p=>!p)||new Set(mods).size!==mods.length||!(/^(F(?:[1-9]|1\d|2[0-4])|[a-z0-9])$/i.test(key))||!mods.length&&!/^F\d+$/i.test(key))throw Error('Use a function key, or Ctrl, Alt or Shift with a letter or number.');
 return [...['Control','Alt','Shift','Super'].filter(p=>mods.includes(p)),key.toUpperCase()].join('+');
}
function audioPreferences(value={}){
 const audioMode=value.audioMode||'system';if(!['system','game','apps','devices'].includes(audioMode))throw Error('Choose an audio capture source.');
 const ids=key=>{if(value[key]===undefined)return [];if(!Array.isArray(value[key])||value[key].length>4||value[key].some(v=>typeof v!=='string'||!v||v.length>2048||/[\x00-\x1f]/.test(v)))throw Error('Choose up to four audio sources.');return [...new Set(value[key])];};
 const volume=key=>value[key]===undefined?100:Math.round(Math.max(0,Math.min(100,Number.isFinite(value[key])?value[key]:100)));
 const micDevice=typeof value.micDevice==='string'&&value.micDevice.length<=2048&&!/[\x00-\x1f]/.test(value.micDevice)?value.micDevice:'default';
 return {audio:value.audio===true,audioMode,audioDevices:ids('audioDevices'),audioApps:ids('audioApps'),audioVolume:volume('audioVolume'),microphone:value.microphone===true,micDevice,micVolume:volume('micVolume')};
}
function preferences(value={}){
 const saveHotkey=hotkey(value.saveHotkey,'F8'),stopHotkey=hotkey(value.stopHotkey,'Control+Alt+F9');
 if(saveHotkey===stopHotkey)throw Error('Save and Stop need different shortcuts.');
 const audio=audioPreferences(value),presets=value.audioPresets??[];
 if(!Array.isArray(presets)||presets.length>12||presets.some(p=>!p||typeof p.id!=='string'||!/^saved:[a-zA-Z0-9-]{1,60}$/.test(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>40||/[\x00-\x1f]/.test(p.name)))throw Error('Use up to 12 named audio presets.');
 if(new Set(presets.map(p=>p.id)).size!==presets.length)throw Error('Audio presets need distinct IDs.');
 const audioPresets=presets.map(p=>({id:p.id,name:p.name.trim(),...audioPreferences(p)}));
 const recordingMode=value.recordingMode??'replay';if(!['replay','session'].includes(recordingMode))throw Error('Choose replay clips or full sessions.');
 const maxSessionGB=value.maxSessionGB??20,libraryLimitGB=value.libraryLimitGB??0;if(!Number.isInteger(maxSessionGB)||maxSessionGB<1||maxSessionGB>100||!Number.isInteger(libraryLimitGB)||libraryLimitGB<0||libraryLimitGB>1000)throw Error('Choose a valid recording storage limit.');
 const rules=value.gameRules??[];if(!Array.isArray(rules)||rules.length>500||rules.some(r=>!r||typeof r.id!=='string'||!r.id||r.id.length>2048||/[\x00-\x1f]/.test(r.id)||!['skip','replay','session'].includes(r.mode)))throw Error('Choose valid per-game recording preferences.');
 const gameRules=[...new Map(rules.map(r=>[r.id,{id:r.id,mode:r.mode}])).values()];
 return {...options(value),mode:value.mode==='source'?'source':'games',recordingMode,startWithOrbit:value.startWithOrbit===true,maxSessionGB,libraryLimitGB,gameRules,saveHotkey,stopHotkey,...audio,audioPresets};
}
function forGame(settings,id){const {gameRules,startWithOrbit,audioPresets,...capture}=preferences(settings),rule=gameRules.find(r=>r.id===id);return rule?.mode==='skip'?null:{...capture,recordingMode:rule?.mode||capture.recordingMode};}
function available(version,development=false){const parts=/^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(version||'');return development||Boolean(parts&&(Number(parts[1])>0||Number(parts[2])>=3));}
module.exports={hotkey,preferences,audioPreferences,forGame,available};
