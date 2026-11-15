(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.OrbitClipAudioPresets=factory();})(typeof globalThis==='object'?globalThis:this,()=>{
 const fields=['audio','audioMode','audioDevices','audioApps','audioVolume','microphone','micDevice','micVolume'];
 const pick=value=>Object.fromEntries(fields.map(key=>[key,Array.isArray(value[key])?[...value[key]]:value[key]]));
 const key=value=>JSON.stringify(fields.map(field=>Array.isArray(value[field])?[...value[field]].sort():value[field]));
 function rows(settings){const base=pick(settings);return [...(settings.audioPresets||[]),...[
  {id:'game',name:'Game only',audio:true,audioMode:'game',microphone:false},
  {id:'game-mic',name:'Game + microphone',audio:true,audioMode:'game',microphone:true},
  {id:'pc',name:'PC audio',audio:true,audioMode:'system',microphone:false},
  {id:'pc-mic',name:'PC + microphone',audio:true,audioMode:'system',microphone:true},
  {id:'silent',name:'No audio',audio:false,microphone:false}
 ].map(row=>({...base,...row}))];}
 function match(settings){return rows(settings).find(row=>key(row)===key(settings))?.id||'';}
 function apply(settings,id){const row=rows(settings).find(row=>row.id===id);if(!row)throw Error('Choose an available audio preset.');return {...settings,...pick(row)};}
 function save(settings,name,id){name=String(name).trim();if(!name||name.length>40||/[\x00-\x1f]/.test(name))throw Error('Use a preset name of 1–40 characters.');const presets=settings.audioPresets||[],existing=presets.find(row=>row.name.toLocaleLowerCase()===name.toLocaleLowerCase());if(!existing&&presets.length>=12)throw Error('Remove a preset before adding another.');return {...settings,audioPresets:[...presets.filter(row=>row.id!==existing?.id),{id:existing?.id||id,name,...pick(settings)}]};}
 function mergeSelection(saved,visible,selected){const shown=new Set(visible);return [...new Set([...saved.filter(id=>!shown.has(id)),...selected])];}
 return {fields,pick,rows,match,apply,save,mergeSelection};
});
