/* Reviewed config controls. No arbitrary keys, commands, or renderer-supplied ranges. */
const quality=['Low','Medium','High','Epic','Cinematic'].map((label,value)=>({value,label}));
const unreal=[
 ['sg.TextureQuality','Textures','Texture detail and filtering.'],
 ['sg.ShadowQuality','Shadows','Dynamic shadow quality.'],
 ['sg.PostProcessQuality','Post-processing','Screen effects, such as depth of field.'],
 ['sg.EffectsQuality','Effects','Rendering quality of visual effects.'],
 ['sg.AntiAliasingQuality','Anti-aliasing','Smooths jagged edges.'],
 ['sg.ViewDistanceQuality','View distance','How far detail remains visible.',true],
 ['sg.GlobalIlluminationQuality','Global illumination','Indirect lighting quality.',true],
 ['sg.ReflectionQuality','Reflections','Reflection quality.',true],
 ['sg.FoliageQuality','Foliage','Grass and foliage density.',true],
 ['sg.ShadingQuality','Shading','Material shading quality.',true]
];
const particles=[
 ['ps_max_particles','Particles per system',50000,false],
 ['ps_max_systems','Particle systems per avatar',200,false],
 ['ps_max_emission','Emission per system',5000,true],
 ['ps_max_total_emission','Total avatar emission',40000,true]
];
function fieldsFor(kind,entries,value){
 if(kind==='source')return require('./game-video-config.cjs').fields(entries);
 if(kind==='vrchat')return [
  {id:'betas',section:'',key:'betas',label:'Avatar particle limiter',type:'select',current:!!value.betas?.includes('particle_system_limiter'),options:[{value:true,label:'On'},{value:false,label:'Off'}],detail:'Experimental. Disables particle collisions with you.'},
  ...particles.map(([key,label,max,advanced])=>({id:key,section:'',key,label,type:'number',current:value[key]??null,min:0,max,step:1,advanced,detail:'0–'+max.toLocaleString('en-US')+'. Lower limits can hide avatar effects.'}))
 ];
 const field=(section,key,label,options,detail,advanced=false)=>{
  const matches=entries.filter(e=>e.section===section&&e.key===key);
  if(matches.length!==1||!/^\d+$/.test(matches[0].value))return null;
  const current=Number(matches[0].value);
  if(!Number.isSafeInteger(current)||current<0||current>4&&key!=='GFXPresetLevel')return null;
  return {id:section+'/'+key,section,key,label,type:'select',current,options,detail,advanced};
 };
 if(kind==='overwatch'){
  const section=entries.find(e=>/^Render\.\d+$/.test(e.section)&&e.key==='GFXPresetLevel').section;
  const choices=(labels,start=0)=>labels.map((label,i)=>({value:i+start,label}));
  return [field(section,'GFXPresetLevel','Overall graphics quality',choices(['Low','Medium','High','Ultra','Epic'],1),'Changes the game’s overall graphics preset.'),field(section,'TextureDetail','Texture quality',choices(['Low','Medium','High'],1),'Detail and clarity of surfaces.'),field(section,'AADetail','Anti-aliasing quality',choices(['Low · FXAA','Medium · SMAA Low','High · SMAA Medium','Ultra · SMAA High']),'Smooths jagged edges.')].filter(f=>f&&f.options.some(o=>o.value===f.current));
 }
 return unreal.map(([key,label,detail,advanced])=>field('ScalabilityGroups',key,label,kind==='valorant'?quality.slice(0,4):quality,detail,advanced)).filter(Boolean);
}
function display(field,value){return value===null||value===undefined?'Not set':field.options?.find(o=>o.value===value)?.label||String(value);}
function validateChoices(fields,choices){
 if(!choices||typeof choices!=='object'||Array.isArray(choices)||![Object.prototype,null].includes(Object.getPrototypeOf(choices))||Object.keys(choices).length>32)throw Error('Choose graphics values from the available controls.');
 const checked={};
 for(const [id,value]of Object.entries(choices)){
  const field=fields.find(f=>f.id===id);
  if(!field)throw Error('This graphics setting is not supported by the selected config.');
  if(field.type==='number'?!Number.isSafeInteger(value)||value<field.min||value>field.max:!field.options.some(o=>o.value===value))throw Error('Choose a valid value for '+field.label+'.');
  checked[id]=value;
 }
 return checked;
}
function customChanges(fields,choices,value){
 const rows=[];
 for(const field of fields){
  if(!Object.hasOwn(choices,field.id)||choices[field.id]===field.current)continue;
  const before=field.key==='betas'?value.betas:field.current===null?undefined:field.current;
  const after=field.key==='betas'?(choices[field.id]?[...(value.betas||[]),'particle_system_limiter']:(value.betas||[]).filter(v=>v!=='particle_system_limiter')):choices[field.id];
  rows.push({section:field.section,key:field.key,label:field.label,before,after,detail:field.detail,beforeLabel:display(field,field.current),afterLabel:display(field,choices[field.id])});
 }
 return rows;
}
module.exports={fieldsFor,display,validateChoices,customChanges};
