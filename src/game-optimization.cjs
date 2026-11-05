/* Local, reviewed graphics changes. No executable patches, downloads, or launch-time reapplication. */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const graphics=require('./game-graphics.cjs'),video=require('./game-video-config.cjs');
const {GameConfigSearch,namesFor}=require('./game-config-search.cjs');
const MAX_BYTES=1024*1024,TTL=10*60*1000;
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const keyOf=change=>change.section?change.section+'/'+change.key:change.key;
const scalar=value=>JSON.stringify(value);
const sources={source:'https://help.ea.com/en/articles/apex-legends/best-settings-pc/',vrchat:'https://docs.vrchat.com/docs/avatar-particle-system-limits',valorant:'https://support.riotgames.com/en-us/riot/performance/network-system-and-logs-windows',overwatch:'https://us.forums.blizzard.com/en/overwatch/t/i-can%E2%80%99t-change-my-graphics-quality/639522/11',unreal:'https://dev.epicgames.com/documentation/en-us/unreal-engine/scalability-reference-for-unreal-engine'};
function kindFor(game){
 if(game?.kind!=='game'||game.robloxPlaceId)return null;
 const title=String(game.title||'').replace(/[®™]/g,'').trim().toLowerCase();
 if(/^apex legends$/.test(title))return 'source';if(/^vrchat$/.test(title))return 'vrchat';if(/^overwatch(?:\s*2)?$/.test(title))return 'overwatch';if(/^valorant$/.test(title))return 'valorant';return 'unreal';
}
function decode(bytes,{allowTerminator=false}={}){
 if(bytes.length>MAX_BYTES)throw Error('Config files must be under 1 MB.');
 let encoding='utf8',bom=Buffer.alloc(0),body=bytes;
 if(bytes.subarray(0,3).equals(Buffer.from([239,187,191]))){bom=bytes.subarray(0,3);body=bytes.subarray(3);}
 else if(bytes.subarray(0,2).equals(Buffer.from([255,254]))){encoding='utf16le';bom=bytes.subarray(0,2);body=bytes.subarray(2);if(body.length%2)throw Error('Invalid UTF-16 config.');}
 else if(bytes.subarray(0,2).equals(Buffer.from([254,255])))throw Error('This config encoding is not supported.');
 let text=body.toString(encoding),terminator='';if(allowTerminator){terminator=text.match(/\0{1,4}[\r\n \t]*$/)?.[0]||'';if(terminator)text=text.slice(0,-terminator.length);}if(text.includes('\uFFFD')||text.includes('\0'))throw Error('This config is not readable text.');
 return {text,encode:text=>Buffer.concat([bom,Buffer.from(text+terminator,encoding)])};
}
function ini(text){
 let section='';const entries=[];
 for(const [index,line]of text.split(/\r?\n/).entries()){
  const heading=line.match(/^\s*\[([^\]\r\n]+)\]\s*(?:[;#].*)?$/);if(heading){section=heading[1];continue;}
  if(/^\s*[;#]/.test(line))continue;const match=line.match(/^(\s*([^=\s]+)\s*=\s*)("[^"\r\n]*"|[^;#\r\n]*?)(\s*(?:[;#].*)?)$/);
  if(match)entries.push({index,section,key:match[2],prefix:match[1],raw:match[3],suffix:match[4],value:match[3].replace(/^"|"$/g,'').trim()});
 }
 return entries;
}
function patchIni(text,changes){
 const lines=text.split(/\r?\n/),entries=ini(text);
 for(const c of changes){const found=entries.filter(e=>e.section===c.section&&e.key===c.key);if(found.length!==1)throw Error('A graphics setting is missing or duplicated. Preview the config again.');const e=found[0];lines[e.index]=e.prefix+(e.raw.startsWith('"')?'"'+c.after+'"':String(c.after))+e.suffix;}
 return lines.join(text.includes('\r\n')?'\r\n':'\n');
}
function jsonObject(text){let value;try{value=JSON.parse(text);}catch{throw Error('The VRChat config is not valid JSON. Repair it before optimizing.');}if(!value||typeof value!=='object'||Array.isArray(value))throw Error('The VRChat config must be a JSON object.');return value;}
function jsonText(text,value){const indent=text.match(/\n([\t ]+)"/)?.[1]||'  ',newline=text.includes('\r\n')?'\r\n':'\n';return JSON.stringify(value,null,indent).replace(/\n/g,newline)+(text.endsWith('\n')?newline:'');}
function changesFor(kind,text,preset){
 if(!['performance','super'].includes(preset))throw Error('Choose Performance or Super optimization.');
 if(kind==='source')return video.changes(text,preset);
 const rows=[],add=(section,key,label,before,after,detail)=>{if(scalar(before)!==scalar(after))rows.push({section,key,label,before,after,detail});};
 if(kind==='vrchat'){
  const value=jsonObject(text);if(value.betas!==undefined&&(!Array.isArray(value.betas)||value.betas.some(v=>typeof v!=='string')))throw Error('VRChat beta options have an unsupported format.');
  add('', 'betas','Avatar particle limiter',value.betas,value.betas?.includes('particle_system_limiter')?value.betas:[...(value.betas||[]),'particle_system_limiter'],'Enable VRChat’s experimental particle limiter. Particle collisions with you are disabled.');
  const limits=preset==='super'?{ps_max_particles:20000,ps_max_systems:100,ps_max_emission:2500,ps_max_total_emission:20000}:{ps_max_particles:50000,ps_max_systems:200,ps_max_emission:5000,ps_max_total_emission:40000};
  const labels={ps_max_particles:'Particles per system',ps_max_systems:'Particle systems',ps_max_emission:'Emission per system',ps_max_total_emission:'Total avatar emission'};
  for(const [key,limit]of Object.entries(limits)){if(value[key]!==undefined&&(!Number.isFinite(value[key])||value[key]<0))throw Error('A particle setting has an unsupported value.');add('',key,labels[key],value[key],value[key]===undefined?limit:Math.min(value[key],limit),'Lower limits can hide avatar particle effects. Existing stricter limits are kept.');}
  return rows;
 }
 const entries=ini(text),find=(section,key)=>{const found=entries.filter(e=>e.section===section&&e.key===key);if(found.length>1)throw Error('Duplicate graphics settings need manual review.');return found[0];};
 if(kind==='overwatch'){
  const sections=[...new Set(entries.filter(e=>/^Render\.\d+$/.test(e.section)&&e.key==='GFXPresetLevel').map(e=>e.section))];if(sections.length!==1)throw Error('No recognized Overwatch graphics preset was found.');
  const section=sections[0],e=find(section,'GFXPresetLevel');if(!/^[1-5]$/.test(e.value))throw Error('This Overwatch preset format is not supported.');
  add(section,e.key,'Graphics preset',Number(e.value),Math.min(Number(e.value),preset==='super'?1:2),'Lower graphics quality. Overwatch may replace local settings after launch.');
  if(preset==='super')for(const [key,target,label]of [['AADetail',0,'Anti-aliasing'],['TextureDetail',1,'Texture detail']]){const e=find(section,key);if(e&&/^\d+$/.test(e.value))add(section,key,label,Number(e.value),Math.min(Number(e.value),target),'Lower image quality; screen resolution and FPS limits stay unchanged.');}
  return rows;
 }
 if(kind==='valorant'&&!entries.some(e=>e.section==='/Script/ShooterGame.ShooterGameUserSettings'))throw Error('This is not a recognized VALORANT user config.');
 const keys={ 'sg.ShadowQuality':'Shadows','sg.GlobalIlluminationQuality':'Global illumination','sg.ReflectionQuality':'Reflections','sg.PostProcessQuality':'Post-processing','sg.EffectsQuality':'Effects','sg.FoliageQuality':'Foliage','sg.ShadingQuality':'Shading'};
 if(entries.filter(e=>e.section==='ScalabilityGroups'&&e.key in keys).length<2)throw Error('No compatible Unreal graphics settings were found.');
 for(const [key,label]of Object.entries(keys)){const e=find('ScalabilityGroups',key);if(!e)continue;if(!/^[0-4]$/.test(e.value))throw Error('This graphics setting has an unsupported value.');const before=Number(e.value);add(e.section,key,label,before,Math.min(before,preset==='super'?0:1),'Lower rendering quality. Resolution, textures, controls and FPS limits stay unchanged.');}
 return rows;
}
function applyText(kind,text,changes){if(kind==='source')return video.patch(text,changes);if(kind!=='vrchat')return patchIni(text,changes);const value=jsonObject(text);for(const c of changes){if(c.after===undefined)delete value[c.key];else Object.defineProperty(value,c.key,{value:c.after,enumerable:true,writable:true,configurable:true});}return jsonText(text,value);}
async function noLinks(file){
 let current=path.resolve(file);while(true){try{const s=await fs.lstat(current);if(s.isSymbolicLink()||s.isFile()&&s.nlink>1)throw Error('Linked configs are not supported. Choose the original file.');}catch(error){if(error.code!=='ENOENT')throw error;}const parent=path.dirname(current);if(parent===current)break;current=parent;}
}
async function readFile(file,allowMissing=false,kind){
 let stat;try{stat=await fs.stat(file);}catch(error){if(error.code==='ENOENT'&&allowMissing){await noLinks(file);const parent=await fs.stat(path.dirname(file));if(!parent.isDirectory())throw Error('Config folder unavailable.');return {exists:false,bytes:Buffer.from('{}\n'),fingerprint:'missing',mode:0o600};}throw error;}
 if(!stat.isFile()||stat.size>MAX_BYTES)throw Error('Choose a config file under 1 MB.');await noLinks(file);const bytes=await fs.readFile(file);decode(bytes,{allowTerminator:kind==='source'});return {exists:true,bytes,fingerprint:hash(bytes),mode:stat.mode};
}
async function replaceFile(file,bytes,expected,kind){
 const current=await readFile(file,expected==='missing',kind);if(current.fingerprint!==expected)throw Error('The config changed. Preview it again before applying.');
 if(current.exists&&!(current.mode&0o200))throw Error('The config is read-only. Orbit will not change its permissions.');
 const temporary=file+'.orbit-'+crypto.randomUUID()+'.tmp';
 try{await fs.writeFile(temporary,bytes,{flag:'wx',mode:current.mode&0o777});const handle=await fs.open(temporary,'r+');try{await handle.sync();}finally{await handle.close();}await noLinks(file);if((await readFile(file,expected==='missing',kind)).fingerprint!==expected)throw Error('The config changed. Preview it again.');await fs.rename(temporary,file);}finally{await fs.unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
}
class GameOptimization{
 constructor({folder,documents,local,localLow,roaming,savedGames,assertClosed=async()=>{},clock=Date.now}){Object.assign(this,{folder,documents,local,localLow,savedGames,assertClosed,clock});this.files=new Map();this.foundFiles=new Map();this.finder=new GameConfigSearch({documents,local,localLow,roaming,savedGames,clock});this.plans=new Map();this.choices=new Map();this.names=new Map();this.operation=Promise.resolve();}
 locked(action){const next=this.operation.catch(()=>{}).then(async()=>{this.busy=true;try{return await action();}finally{this.busy=false;}});this.operation=next.catch(()=>{});return next;}
 recordPath(id){return path.join(this.folder,hash(String(id)));}
 async choice(id){if(this.choices.has(id))return this.choices.get(id);let value=null;try{const bytes=await fs.readFile(path.join(this.recordPath(id),'choice.json'));if(bytes.length>16384)throw Error('Choice too large');const saved=JSON.parse(bytes);if(typeof saved.file!=='string'||!path.isAbsolute(saved.file)||!['performance','super','custom'].includes(saved.preset))throw Error('Invalid choice');if(saved.custom!==undefined&&(!saved.custom||typeof saved.custom!=='object'||Array.isArray(saved.custom)||Object.keys(saved.custom).length>32))throw Error('Invalid graphics choices');value=saved;}catch(error){if(error.code!=='ENOENT')throw Error('The saved config choice needs review.');}if(this.choices.size>=512)this.choices.delete(this.choices.keys().next().value);this.choices.set(id,value);return value;}
 async remember(id,file,preset,custom){const previous=await this.choice(id),value={file,preset,custom:custom??(previous?.file===file?previous.custom||{}:{})};if(JSON.stringify(previous)===JSON.stringify(value))return;await this.locked(async()=>{const folder=this.recordPath(id);await fs.mkdir(folder,{recursive:true});const temporary=path.join(folder,'choice-'+crypto.randomUUID()+'.tmp');try{await fs.writeFile(temporary,JSON.stringify(value),{flag:'wx',mode:0o600,flush:true});await fs.rename(temporary,path.join(folder,'choice.json'));this.choices.set(id,value);}finally{await fs.unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}});}
 async labels(id){if(this.names.has(id))return this.names.get(id);let names={};try{const bytes=await fs.readFile(path.join(this.recordPath(id),'names.json'));if(bytes.length>32768)throw Error('Names file too large');const value=JSON.parse(bytes);if(!value||Array.isArray(value)||typeof value!=='object'||Object.keys(value).length>128||Object.entries(value).some(([key,name])=>!/^\w{64}$/.test(key)||typeof name!=='string'||!name.trim()||name.length>40||/[\x00-\x1f\x7f]/.test(name)))throw Error('Invalid names');names=value;}catch(error){if(error.code!=='ENOENT')throw Error('Saved config names need review.');}if(this.names.size>=256)this.names.delete(this.names.keys().next().value);this.names.set(id,names);return names;}
 rename(game,token,label){return this.locked(async()=>{const entry=this.files.get(token);if(!entry||entry.gameId!==game.id)throw Error('Choose this game’s config first.');if(typeof label!=='string'||label.trim().length>40||/[\x00-\x1f\x7f]/.test(label))throw Error('Use a config name of up to 40 characters.');const names={...await this.labels(game.id)},name=label.trim();if(name&&!names[token]&&Object.keys(names).length>=128)throw Error('Clear an old config name before adding another.');if(name)names[token]=name;else delete names[token];const folder=this.recordPath(game.id);await fs.mkdir(folder,{recursive:true});const temp=path.join(folder,'names-'+crypto.randomUUID()+'.tmp');try{await fs.writeFile(temp,JSON.stringify(names),{flag:'wx',mode:0o600,flush:true});await fs.rename(temp,path.join(folder,'names.json'));this.names.set(game.id,names);}finally{await fs.unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}return this.register(game,entry.file,entry.kind);});}
 async backup(id){try{const value=JSON.parse(await fs.readFile(path.join(this.recordPath(id),'latest.json'),'utf8'));if(value.version!==1||!['prepared','applied','restored'].includes(value.state)||!Array.isArray(value.changes)||!['vrchat','overwatch','valorant','unreal','source'].includes(value.kind))throw Error('Invalid optimization recovery record.');return value;}catch(error){if(error.code==='ENOENT')return null;throw Error('The optimization backup needs manual review. No config was changed.');}}
 async saveRecord(id,record){const folder=this.recordPath(id);await fs.mkdir(folder,{recursive:true});const temp=path.join(folder,'record-'+crypto.randomUUID()+'.tmp');try{await fs.writeFile(temp,JSON.stringify(record,null,2),{flag:'wx',mode:0o600,flush:true});await fs.rename(temp,path.join(folder,'latest.json'));}finally{await fs.unlink(temp).catch(e=>{if(e.code!=='ENOENT')throw e;});}}
 async register(game,file,kind=kindFor(game)){
  if(!kind)throw Error('Choose a supported game.');let data,decoded;if(/\.(?:txt|cfg|ini|conf)$/i.test(file))try{const probe=await readFile(file,false,'source'),text=decode(probe.bytes,{allowTerminator:true});if(/^\s*(?:\/\/[^\n]*\n\s*)*"VideoConfig"/i.test(text.text)){data=probe;decoded=text;kind='source';}}catch{}const allowed=kind==='source'?'videoconfig.txt':kind==='vrchat'?'config.json':kind==='overwatch'?'settings_v0.ini':'gameusersettings.ini';if(kind!=='source'&&path.basename(file).toLowerCase()!==allowed)throw Error('Choose '+allowed+' for this game.');
  if(!data){data=await readFile(file,kind==='vrchat',kind);decoded=decode(data.bytes,{allowTerminator:kind==='source'});}changesFor(kind,decoded.text,'performance');
  const token=hash(game.id+'\n'+path.resolve(file));if(!this.files.has(token)&&this.files.size>=512)this.files.delete(this.files.keys().next().value);this.files.set(token,{gameId:game.id,file:path.resolve(file),kind});
  const profile=path.basename(path.dirname(path.dirname(file))),label=kind==='valorant'?(profile.toLowerCase()==='config'?'Shared config':'Profile '+(profile.length>22?profile.slice(0,14)+'…':profile))+' · '+path.basename(path.dirname(file)):path.basename(file),customLabel=(await this.labels(game.id))[token]||'';
  return {token,path:path.resolve(file),name:path.basename(file),format:kind==='source'?'VideoConfig':kind==='vrchat'?'JSON':'INI',label:customLabel||label,customLabel,modified: data.exists?(await fs.stat(file)).mtimeMs:null,newFile:!data.exists};
 }
 async discover(game,{files=true,refresh=false}={}){
  const kind=kindFor(game);if(!kind)return {id:game.id,title:game.title,kind:null,candidates:[],supported:false,note:'No config profile for this entry.'};const paths=[];
  if(kind==='source'&&this.savedGames&&/^apex legends$/i.test(game.title.replace(/[®™]/g,'').trim()))paths.push(path.join(this.savedGames,'Respawn','Apex','local','videoconfig.txt'));
  if(kind==='source')for(const version of (game.versions||[]).filter(v=>v.installed&&v.location).slice(0,3))for(const name of ['video.txt','videoconfig.txt'])paths.push(path.join(version.location,'cfg',name));
  if(kind==='vrchat')paths.push(path.join(this.localLow,'VRChat','VRChat','config.json'));
  if(kind==='overwatch')paths.push(path.join(this.documents,'Overwatch','Settings','Settings_v0.ini'));
  if(kind==='valorant'){
   const base=path.join(this.local,'VALORANT','Saved','Config');let entries=[];try{entries=(await fs.readdir(base,{withFileTypes:true})).slice(0,128);}catch(error){if(error.code!=='ENOENT')throw error;}
   for(const leaf of ['Windows','WindowsClient'])paths.push(path.join(base,leaf,'GameUserSettings.ini'));
   for(const entry of entries)if(entry.isDirectory()&&!entry.isSymbolicLink())for(const leaf of ['Windows','WindowsClient'])paths.push(path.join(base,entry.name,leaf,'GameUserSettings.ini'));
  }
  if(kind==='unreal'){
   const names=new Set(namesFor(game));
   const bases=[];for(const location of [...new Set((game.versions||[]).filter(v=>v.installed&&typeof v.location==='string').map(v=>v.location))].slice(0,3)){
    bases.push(location);try{for(const e of (await fs.readdir(location,{withFileTypes:true})).slice(0,32))if(e.isDirectory()&&!e.isSymbolicLink()&&!/^(Engine|Plugins|Binaries|Content)$/i.test(e.name)){bases.push(path.join(location,e.name));if(/^[\w .()'-]{3,80}$/.test(e.name))names.add(e.name);}}catch(error){if(!['ENOENT','EACCES','EPERM'].includes(error.code))throw error;}
   }
   for(const name of [...names].slice(0,36))bases.push(path.join(this.local,name));
   for(const base of bases)for(const platform of ['Windows','WindowsClient','WindowsNoEditor'])paths.push(path.join(base,'Saved','Config',platform,'GameUserSettings.ini'));
  }
  const preferred=await this.choice(game.id);if(preferred)paths.push(preferred.file);
  const candidates=[];let unreadable=0;for(const file of [...new Set(paths)])try{candidates.push(await this.register(game,file,kind));}catch(error){if(error.code!=='ENOENT')unreadable++;}
  // Explicitly selected files remain available in this session without broadening the scan.
  for(const [token,entry]of this.files)if(entry.gameId===game.id&&!candidates.some(c=>c.token===token))try{candidates.push(await this.register(game,entry.file,entry.kind));}catch{}
  const located=files?await this.finder.find(game,{refresh}):!candidates.length?await this.finder.quickVideo(game):{files:[],scannedFolders:0,skipped:0,limited:false},foundFiles=[];
  for(const item of located.files){if(candidates.some(c=>c.path===item.path))continue;if((kind==='unreal'||kind==='valorant')&&item.name.toLowerCase()==='gameusersettings.ini'||/\.(?:txt|cfg|ini|conf)$/i.test(item.name))try{candidates.push(await this.register(game,item.path,kind));continue;}catch{}
   const token=hash(game.id+'\nlocated\n'+item.path);if(this.foundFiles.size>=512)this.foundFiles.delete(this.foundFiles.keys().next().value);this.foundFiles.set(token,{gameId:game.id,path:item.path});foundFiles.push({...item,token,editable:false});
  }
  candidates.sort((a,b)=>(b.modified||0)-(a.modified||0));const record=await this.backup(game.id);
  const preferredToken=candidates.find(c=>c.path===preferred?.file)?.token||null;
  return {id:game.id,title:game.title,kind,candidates:candidates.slice(0,64),foundFiles,discovery:{scannedFolders:located.scannedFolders,skipped:located.skipped,limited:located.limited},supported:candidates.length>0,unreadable,preferredToken,preset:preferred?.preset||(kind==='source'||candidates.some(c=>c.format==='VideoConfig')?'custom':'performance'),custom:preferred?.custom||{},source:sources[kind],backup:record&&record.state!=='restored'?{state:record.state,created:record.created,path:record.file,preset:record.preset}:null,note:kind==='source'||candidates.some(c=>c.format==='VideoConfig')?'Compatible VideoConfig. Only recognized graphics values are editable; other settings stay unchanged. Confirm the result in-game.':kind==='vrchat'?'Experimental particle limits only. Use VRChat’s in-game settings for textures and general graphics.':kind==='overwatch'?'Config support is experimental; Overwatch may replace these settings.':kind==='valorant'?'Choose your account’s config. These are engine quality settings; Riot may override them.':'Compatible Unreal configs only. Some games override these values.'};
 }
 async locatedFolder(game,token){const entry=this.foundFiles.get(token);if(!entry||entry.gameId!==game.id)throw Error('Search this game’s config files again.');await noLinks(entry.path);const stat=await fs.stat(entry.path);if(!stat.isFile())throw Error('This config file moved. Search again.');return path.dirname(entry.path);}
 cancelSearch(){this.searchRevision=(this.searchRevision||0)+1;}
 async search(games){this.cancelSearch();this.finder.quickRoots?.clear();const revision=this.searchRevision,items=games.filter(g=>g.kind==='game'&&!g.hidden&&!g.robloxPlaceId),results=new Array(items.length);let next=0;await Promise.all(Array.from({length:3},async()=>{while(next<items.length&&revision===this.searchRevision){const i=next++;try{results[i]=await this.discover(items[i],{files:false});}catch{results[i]={id:items[i].id,title:items[i].title,supported:false,candidates:[],note:'Config discovery unavailable. No files were changed.'};}}}));if(revision!==this.searchRevision)throw Error('Config search cancelled.');return {checked:items.length,truncated:false,results,available:results.filter(r=>r.supported).length};}
 async preview(game,token,preset,custom){
  const entry=this.files.get(token);if(!entry||entry.gameId!==game.id)throw Error('Find or choose this game’s config first.');const data=await readFile(entry.file,entry.kind==='vrchat',entry.kind),decoded=decode(data.bytes,{allowTerminator:entry.kind==='source'});
  changesFor(entry.kind,decoded.text,preset==='custom'?'performance':preset);
  const object=entry.kind==='vrchat'?jsonObject(decoded.text):null,settings=graphics.fieldsFor(entry.kind,entry.kind==='vrchat'?[]:entry.kind==='source'?video.parse(decoded.text):ini(decoded.text),object),checked=preset==='custom'?graphics.validateChoices(settings,custom===undefined?{}:custom):undefined;
  const changes=preset==='custom'?graphics.customChanges(settings,checked,object):changesFor(entry.kind,decoded.text,preset);
  for(const [id,p]of this.plans)if(p.expires<this.clock()||p.gameId===game.id)this.plans.delete(id);while(this.plans.size>=8)this.plans.delete(this.plans.keys().next().value);
  const id=crypto.randomUUID(),plan={...entry,gameId:game.id,preset,data,changes,expires:this.clock()+TTL};this.plans.set(id,plan);
  await this.remember(game.id,entry.file,preset,checked);const record=await this.backup(game.id);return {token:id,path:entry.file,preset,settings,custom:checked,changes:changes.map(c=>{const field=settings.find(f=>f.id===keyOf(c));return {...c,...(field&&field.type==='select'&&c.key!=='betas'?{label:field.label,beforeLabel:graphics.display(field,c.before),afterLabel:graphics.display(field,c.after)}:{}),id:keyOf(c),before:c.before===undefined?null:c.before,unset:c.before===undefined};}),newFile:!data.exists,canApply:!record||record.state==='restored',note:'FPS gains are not guaranteed. Restart the game after applying.'};
 }
 apply(game,token,selected){return this.locked(async()=>{
  const plan=this.plans.get(token);if(!plan||plan.gameId!==game.id||plan.expires<this.clock())throw Error('This preview expired. Preview the config again.');
  const previous=await this.backup(game.id);if(previous&&previous.state!=='restored')throw Error('Restore the current optimization before applying another profile.');
  if(!Array.isArray(selected)||!selected.length||selected.length>32||selected.some(id=>!plan.changes.some(c=>keyOf(c)===id)))throw Error('Select the settings shown in the preview.');const changes=plan.changes.filter(c=>selected.includes(keyOf(c)));
  await this.assertClosed(game,plan.kind);const current=await readFile(plan.file,plan.kind==='vrchat',plan.kind);if(current.fingerprint!==plan.data.fingerprint)throw Error('The config changed. Preview it again before applying.');if(current.exists&&!(current.mode&0o200))throw Error('The config is read-only. Orbit will not change its permissions.');const decoded=decode(current.bytes,{allowTerminator:plan.kind==='source'});
  if(plan.kind==='vrchat'&&changes.some(c=>c.key.startsWith('ps_'))){const beta=changes.find(c=>c.key==='betas'),enabled=(beta?beta.after:jsonObject(decoded.text).betas)?.includes('particle_system_limiter');if(!enabled)throw Error('Select Avatar particle limiter as well, or keep its current limits.');}
  const after=decoded.encode(applyText(plan.kind,decoded.text,changes));
  const folder=this.recordPath(game.id);await fs.mkdir(folder,{recursive:true});const backupFile=path.join(folder,'original-'+crypto.randomUUID()+'.bak');await fs.writeFile(backupFile,current.bytes,{flag:'wx',mode:0o600,flush:true});if(hash(await fs.readFile(backupFile))!==hash(current.bytes))throw Error('Backup verification failed. No settings were changed.');
  const record={version:1,state:'prepared',file:plan.file,kind:plan.kind,preset:plan.preset,created:this.clock(),existed:current.exists,backupName:path.basename(backupFile),beforeHash:hash(current.bytes),afterHash:hash(after),changes:changes.map(c=>({...c,unset:c.before===undefined}))};await this.saveRecord(game.id,record);await this.assertClosed(game,plan.kind);await replaceFile(plan.file,after,current.fingerprint,plan.kind);await this.saveRecord(game.id,{...record,state:'applied'});this.plans.delete(token);return {applied:changes.length,backup:true,restartRequired:true};
 });}
 restore(game){return this.locked(async()=>{
  const record=await this.backup(game.id);if(!record||record.state==='restored')throw Error('No active optimization backup for this game.');if(!/^original-[a-f0-9-]+\.bak$/.test(record.backupName))throw Error('Invalid recovery file.');await this.assertClosed(game,record.kind);
  const original=await fs.readFile(path.join(this.recordPath(game.id),record.backupName));if(hash(original)!==record.beforeHash)throw Error('Backup verification failed. No settings were changed.');let current;try{current=await readFile(record.file,record.kind==='vrchat',record.kind);}catch(error){if(error.code==='ENOENT')throw Error('The config moved or was removed. Restore it to its original folder first.');throw error;}
  if(record.state==='prepared'&&(current.fingerprint===record.beforeHash||!record.existed&&current.fingerprint==='missing')){await this.saveRecord(game.id,{...record,state:'restored'});return {restored:true,alreadyOriginal:true};}
  if(!current.exists)throw Error('The config was removed after applying. Restore needs manual review.');
  let restoreBytes=original,remove=!record.existed&&current.fingerprint===record.afterHash;
  if(current.fingerprint!==record.afterHash){const decoded=decode(current.bytes,{allowTerminator:record.kind==='source'}),entries=record.kind==='vrchat'?null:record.kind==='source'?video.parse(decoded.text):ini(decoded.text),value=record.kind==='vrchat'?jsonObject(decoded.text):null;
   for(const c of record.changes){const found=value?value[c.key]:entries.filter(e=>e.section===c.section&&e.key===c.key);const now=value?found:found.length===1&&/^\d+$/.test(found[0].value)?Number(found[0].value):undefined;if(scalar(now)!==scalar(c.after))throw Error('An optimized setting changed after Apply. Restore stopped to protect your newer settings.');}
   restoreBytes=decoded.encode(applyText(record.kind,decoded.text,record.changes.map(c=>({...c,after:c.unset?undefined:c.before}))));remove=false;
  }
  await this.assertClosed(game,record.kind);if(remove){await noLinks(record.file);if((await readFile(record.file,false,record.kind)).fingerprint!==current.fingerprint)throw Error('The config changed. Try Restore again.');await fs.unlink(record.file);}else await replaceFile(record.file,restoreBytes,current.fingerprint,record.kind);
  await this.saveRecord(game.id,{...record,state:'restored',restored:this.clock()});return {restored:true,preservedNewerUnrelatedSettings:current.fingerprint!==record.afterHash};
 });}
}
module.exports={GameOptimization,kindFor,changesFor,applyText,decode,ini,readFile,MAX_BYTES};
