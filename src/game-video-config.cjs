/* Compatible Source-style VideoConfig only. Unknown keys remain byte-for-byte; no console commands. */
const specs=[
 ['setting.mat_antialias_mode','Anti-aliasing',[[0,'None'],[12,'TSAA']],'Smooths jagged edges. TSAA can soften the image.',false,0],
 ['setting.mat_forceaniso','Anisotropic filtering',[[1,'1×'],[2,'2×'],[4,'4×'],[8,'8×'],[16,'16×']],'Keeps textures clearer at an angle. Higher levels can cost GPU time.',false,1],
 ['setting.ssao_quality','Ambient occlusion',[[0,'Disabled'],[1,'Low'],[2,'Medium'],[3,'High']],'Adds shading where surfaces meet.',false,0],
 ['setting.volumetric_lighting','Volumetric lighting',[[0,'Off'],[1,'On']],'Adds visible beams and shafts of light.',false,0],
 ['setting.dynamic_streaming_budget','Automatic texture budget',[[0,'Off'],[1,'On']],'Lets the game adjust its texture streaming budget. Orbit leaves your fixed budget unchanged.',true],
 ['setting.shadow_enable','Dynamic spot shadows',[[0,'Off'],[1,'On']],'Allows moving shadows from spot lights.',true,0]
];
function parse(text){
 const entries=[],seen=new Set();let stage=0;
 for(const [index,line]of text.split(/\r?\n/).entries()){
  const clean=line.trim();if(!clean||clean.startsWith('//'))continue;
  if(stage===0&&/^"VideoConfig"\s*(?:\/\/.*)?$/i.test(clean)){stage=1;continue;}
  if(stage===1&&clean==='{'){stage=2;continue;}
  if(stage===2&&clean==='}'){stage=3;continue;}
  if(stage!==2)throw Error('This is not a supported VideoConfig file.');
  const m=line.match(/^(\s*"([^"\\\r\n]+)"\s*")((?:\\.|[^"\\\r\n])*)("\s*(?:\/\/.*)?)$/);
  if(!m)throw Error('This VideoConfig needs manual review.');
  if(seen.has(m[2].toLowerCase()))throw Error('Duplicate VideoConfig settings need manual review.');
  seen.add(m[2].toLowerCase());entries.push({index,section:'VideoConfig',key:m[2].toLowerCase(),prefix:m[1],value:m[3],suffix:m[4]});
 }
 if(stage!==3||entries.filter(e=>specs.some(([key])=>key===e.key)).length<2)throw Error('No recognized VideoConfig graphics settings were found.');return entries;
}
function fields(entries){return specs.flatMap(([key,label,pairs,detail,advanced])=>{const e=entries.find(e=>e.key===key);if(!e||!/^\d+$/.test(e.value))return [];const current=Number(e.value),options=pairs.map(([value,label])=>({value,label}));return options.some(o=>o.value===current)?[{id:'VideoConfig/'+key,section:'VideoConfig',key,label,type:'select',current,options,detail,advanced}]:[];});}
function changes(text,preset){const supported=fields(parse(text));if(!supported.length)throw Error('This VideoConfig has no supported editable values.');return supported.flatMap(field=>{const target=specs.find(s=>s[0]===field.key)[5];if(target===undefined||field.key==='setting.mat_forceaniso'&&preset!=='super'||field.current<=target)return [];return [{section:field.section,key:field.key,label:field.label,before:field.current,after:target,detail:field.detail}];});}
function patch(text,changes){const entries=parse(text),lines=text.split(/(?<=\n)/);for(const c of changes){const entry=entries.find(e=>e.key===c.key&&e.section===c.section);if(!entry)throw Error('A VideoConfig setting moved. Review the config again.');lines[entry.index]=entry.prefix+String(c.after)+entry.suffix+(lines[entry.index].match(/\r?\n$/)?.[0]||'');}return lines.join('');}
module.exports={parse,fields,changes,patch};
