const fs=require('node:fs/promises'),path=require('node:path');
const Theme=require('./ui/themes.js');
const allowed=key=>typeof key==='string'&&/^orbit-[a-z0-9-]{1,70}$/.test(key)&&!/^orbit-(dev|update-preview)/.test(key);
function validDocument(data){
 if(data?.schemaVersion!==1||!data.values||typeof data.values!=='object'||Array.isArray(data.values))return false;
 try{const clean=values(data.values);for(const key of Object.keys(data.values))if(allowed(key)&&!(key in clean))return false;
  if(clean['orbit-themes-v1']){const theme=JSON.parse(clean['orbit-themes-v1']);if(!theme||typeof theme!=='object'||Array.isArray(theme))return false;}return true;
 }catch{return false;}
}
async function preserveUnreadable(file){
 const kept=[];for(const source of [file,file+'.bak'])try{
  const bytes=await fs.readFile(source),key=require('node:crypto').createHash('sha256').update(bytes).digest('hex').slice(0,16),folder=path.join(path.dirname(file),'preference-recovery',key);await fs.mkdir(folder,{recursive:true});
  await fs.writeFile(path.join(folder,path.basename(source)),bytes,{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});kept.push(folder);
  try{const data=JSON.parse(bytes.toString('utf8')),saved=themes(data.values?.['orbit-themes-v1']);for(const [i,theme]of saved.custom.entries())await fs.writeFile(path.join(folder,'theme-'+String(i+1).padStart(2,'0')+'.json'),JSON.stringify(theme,null,2),{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});}catch{}
 }catch(error){if(error.code!=='ENOENT')throw error;}return kept;
}
function values(input){const result={};if(!input||typeof input!=='object'||Array.isArray(input))return result;let size=0;for(const [key,value]of Object.entries(input)){if(!allowed(key)||typeof value!=='string'||value.length>4*1024*1024)continue;size+=value.length;if(size>8*1024*1024)throw Error('Saved interface settings are too large.');result[key]=value;}return result;}
function themes(value){let saved;try{saved=JSON.parse(value||'{}');}catch{return {custom:[]};}const custom=[];for(const item of Array.isArray(saved.custom)?saved.custom:[]){try{const theme=Theme.validate(item);if(typeof item.id==='string'&&/^custom-[a-z0-9-]+$/.test(item.id))custom.push({...theme,id:item.id});}catch{}}return {active:typeof saved.active==='string'?saved.active:'orbit',custom:custom.slice(0,24)};}
function mergeLegacy(saved,current){const merged={...values(saved),...values(current)};if(saved?.['orbit-themes-v1']||current?.['orbit-themes-v1']){const a=themes(saved?.['orbit-themes-v1']),b=themes(current?.['orbit-themes-v1']),all=new Map([...a.custom,...b.custom].map(t=>[t.id,t]));merged['orbit-themes-v1']=JSON.stringify({active:current?.['orbit-themes-v1']?b.active:a.active,custom:[...all.values()].slice(0,24)});}return merged;}
async function readJson(file,validate=()=>true){let original;for(const candidate of [file,file+'.bak'])try{const data=JSON.parse(await fs.readFile(candidate,'utf8'));if(!validate(data))throw Error('Invalid settings data.');return {data,recovered:candidate!==file};}catch(error){if(!original||original.code==='ENOENT'&&error.code!=='ENOENT')original=error;}throw original;}
async function writeJson(file,data,validate=()=>true){await fs.mkdir(path.dirname(file),{recursive:true});try{const old=JSON.parse(await fs.readFile(file,'utf8'));if(validate(old))await fs.copyFile(file,file+'.bak');}catch(error){if(error.code!=='ENOENT'&&!(error instanceof SyntaxError))throw error;}await fs.writeFile(file+'.tmp',JSON.stringify(data,null,2),'utf8');await fs.rename(file+'.tmp',file);}
class UiPreferences{
 constructor(file){this.file=file;this.state={schemaVersion:1,values:{},bootstrapLegacy:true};this.queue=Promise.resolve();}
 async load(){try{const loaded=await readJson(this.file,validDocument);if(loaded.recovered){await preserveUnreadable(this.file);this.recovery={message:'Settings recovered from the last saved copy. Original files are kept in your data folder.'};}this.state={schemaVersion:1,values:values(loaded.data.values),bootstrapLegacy:loaded.data.bootstrapLegacy===true};this.recovered=loaded.recovered;}catch(error){if(error.code!=='ENOENT'){await preserveUnreadable(this.file);throw error;}}return this;}
 bootstrap(legacy){if(this.state.bootstrapLegacy){const next=mergeLegacy(this.state.values,legacy);if(!validDocument({schemaVersion:1,values:next}))throw Error('Saved themes exceed the storage limit. Export older photo themes before adding more.');this.state.values=next;this.state.bootstrapLegacy=false;this.persist();}return {...this.state.values};}
 set(key,value){if(!allowed(key)||value!==null&&typeof value!=='string')throw Error('Invalid interface setting.');if(value!==null&&value.length>4*1024*1024)throw Error('Interface setting is too large.');const next={...this.state.values};if(value===null)delete next[key];else next[key]=value;values(next);if(!validDocument({schemaVersion:1,values:next}))throw Error('Invalid interface setting.');this.state.values=next;return this.persist();}
 persist(){const snapshot=JSON.parse(JSON.stringify(this.state));const task=this.queue.catch(()=>{}).then(()=>writeJson(this.file,snapshot,validDocument));this.queue=task;task.catch(()=>{});return task;}
}
module.exports={UiPreferences,readJson,writeJson,values,mergeLegacy,themes};
