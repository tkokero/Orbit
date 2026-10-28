const accessibility=require('./accessibility.cjs');
const wishlist=require('./wishlist.cjs');
const collectionState=require('./collection-state.cjs');
const path=require('node:path');
const libraryFilters=require('./ui/library-filters.js');
const {personal}=require('./personal.cjs');
const {safeUrl,STORES}=require('./library.cjs');
const {safeGameExe}=require('./playtime.cjs');
const {experienceEntry}=require('./roblox.cjs');
const {validate:validateTheme}=require('./ui/themes.js');
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const safeId=id=>typeof id==='string'&&id.length>0&&id.length<2048&&!['__proto__','constructor','prototype'].includes(id);
function profile(input={}){
 if(!plain(input))throw Error('Invalid launch settings.');
 const args=input.args??[];
 if(!Array.isArray(args)||args.length>64||args.some(a=>typeof a!=='string'||a.length>2048||a.includes('\0')))throw Error('Arguments must be a JSON array of up to 64 strings.');
 const executable=input.executable||'';
 if(executable&&(!path.win32.isAbsolute(executable)||! /\.exe$/i.test(executable)))throw Error('Choose an absolute executable path.');
 return {args,executable,launchChoice:typeof input.launchChoice==='string'&&input.launchChoice.length<=2048?input.launchChoice:'ask',controller:['inherit','couch','desktop'].includes(input.controller)?input.controller:'inherit',tools:[...new Set((Array.isArray(input.tools)?input.tools:[]).filter(safeId))].slice(0,8)};
}
function preferences(input){
 if(!plain(input)||Object.keys(input).length>20000)throw Error('Invalid preferences.');
 const result=Object.create(null);
 for(const [id,p] of Object.entries(input)){
  if(!safeId(id)||!plain(p))continue;
  const v={};for(const k of ['favorite','hidden'])if(typeof p[k]==='boolean')v[k]=p[k];
  if(['game','tool'].includes(p.kind))v.kind=p.kind;
  if(typeof p.preferred==='string'&&safeId(p.preferred))v.preferred=p.preferred;
  if(Number.isFinite(p.lastOpened)&&p.lastOpened>=0)v.lastOpened=p.lastOpened;
  if(Array.isArray(p.collections))v.collections=[...new Set(p.collections.filter(x=>typeof x==='string'&&x.trim()&&x.length<=40).map(x=>x.trim()))].slice(0,30);
  if(p.tags!==undefined)v.tags=libraryFilters.tags(p.tags);
  if(p.metadata&&typeof p.metadata==='object'){const m=p.metadata;v.metadata={genres:(Array.isArray(m.genres)?m.genres:[]).filter(x=>typeof x==='string'&&x.length<=80).slice(0,20),controller:m.controller===true?true:null,multiplayer:m.multiplayer===true?true:null,checkedAt:Number(m.checkedAt)||0,source:'Steam Store'};}
  if(p.profile)v.profile=profile(p.profile);
  if(p.notes!==undefined||p.aliases!==undefined)Object.assign(v,personal({notes:p.notes||'',aliases:p.aliases||[]}));
  result[id]=v;
 }return result;
}
function uiState(input={}){
 const out={};for(const key of ['orbit-motion','orbit-remember-view','orbit-view','orbit-couch','orbit-library-filters','orbit-controller-input-v1','orbit-controller-sound-v1','orbit-controller-startup-v1','orbit-controller-secrets-v1','orbit-couch-home-v1','orbit-startup-volume','orbit-startup-sound','orbit-startup-style','orbit-secret-startups','orbit-super-dark','orbit-sidebar-width','orbit-desktop-library-v1','orbit-app-icon-v1'])if(typeof input[key]==='string'&&input[key].length<1024*1024)out[key]=input[key];
 if(typeof input['orbit-themes-v1']==='string'){
  if(input['orbit-themes-v1'].length>4*1024*1024)throw Error('Theme images exceed the 4 MB theme storage limit.');
  const data=JSON.parse(input['orbit-themes-v1']);
  out['orbit-themes-v1']=JSON.stringify({active:typeof data.active==='string'?data.active:'orbit',custom:(data.custom||[]).slice(0,24).map(t=>({...validateTheme(t),id:/^custom-[a-z0-9-]+$/.test(t.id)?t.id:'custom-restored'}))});
 }return out;
}
function backup(store,ledger,ui,configs={}){return validateBackup({format:'orbit-backup',version:1,savedAt:Date.now(),settings:store.settings,accessibility:store.accessibility,preferences:store.preferences,imports:store.imports,collections:store.collections||[],collectionStyles:store.collectionStyles,wishlist:store.wishlist||[],smartCollections:store.smartCollections||[],addedAt:store.addedAt,addedTrackingInitialized:store.addedTrackingInitialized,roblox:store.roblox,playtime:{totals:ledger.totals,configs},ui});}
function validateBackup(data){
 if(!plain(data)||data.format!=='orbit-backup'||data.version!==1)throw Error('This is not a supported Orbit backup.');
 const settings={};for(const [k,v]of Object.entries(data.settings||{}))if(typeof v==='boolean'&&safeId(k))settings[k]=v;
 if(!Array.isArray(data.imports)||data.imports.length>20000)throw Error('Invalid custom library.');
 const imports=data.imports.map(r=>{
  if(!plain(r)||!safeId(r.id)||typeof r.title!=='string'||!r.title.trim()||r.title.length>300)throw Error('Invalid custom entry.');
  const v={id:r.id,title:r.title,source:STORES.includes(r.source)?r.source:'Other',origin:r.origin==='manual'?'manual':'import',installed:false};
  for(const k of ['appId','kind'])if(typeof r[k]==='string')v[k]=r[k].slice(0,200);
  for(const k of ['launch','installUrl'])if(r[k])v[k]=safeUrl(r[k]);
  if(r.executable){v.executable=profile({executable:r.executable}).executable;v.location=path.win32.dirname(v.executable);}
  return v;
 });
 const totals=Object.create(null);for(const [id,t]of Object.entries(data.playtime?.totals||{})){if(safeId(id)&&plain(t)&&Number.isFinite(t.seconds)&&t.seconds>=0&&t.seconds<1e10)totals[id]={seconds:t.seconds,since:Number(t.since)||Date.now(),lastPlayed:Number(t.lastPlayed)||0};}
 const configs=Object.create(null);for(const [id,c]of Object.entries(data.playtime?.configs||{}))if(safeId(id)&&plain(c)&&Array.isArray(c.executables))configs[id]={executables:c.executables.filter(p=>typeof p==='string'&&path.win32.isAbsolute(p)&&safeGameExe(p)).slice(0,8)};
 const collections=[...new Set((data.collections||[]).filter(x=>typeof x==='string'&&x.trim()&&x.length<=40).map(x=>x.trim()))].slice(0,50);
 // Only saved public experience identifiers, never account credentials.
 const roblox=plain(data.roblox)?{mode:data.roblox.mode==='app'?'app':'browser',games:(Array.isArray(data.roblox.games)?data.roblox.games:[]).slice(0,200).map(g=>({...experienceEntry(g),lastOpened:Number(g.lastOpened)||0}))}:undefined;
 if(roblox&&JSON.stringify(roblox).length>200000)throw Error('Experience list is too large.');
 return {format:'orbit-backup',version:1,savedAt:Number(data.savedAt)||Date.now(),settings,accessibility:accessibility.validate(data.accessibility||{}),preferences:preferences(data.preferences||{}),imports,collections,collectionStyles:require('./ui/collection-design.js').styles(data.collectionStyles),wishlist:wishlist.validate(data.wishlist||[]),smartCollections:collectionState.smartDefinitions(data.smartCollections||[]),addedAt:collectionState.addedDates(data.addedAt),addedTrackingInitialized:data.addedTrackingInitialized===true,roblox,playtime:{totals,configs},ui:uiState(data.ui||{})};
}
async function inspectLibrary(games,exists){
 const rows=[];
 for(const g of games){
  const checks=await Promise.all(g.versions.map(async v=>({v,target:v.executable||v.shortcut||v.location,available:(v.executable||v.shortcut||v.location)?await exists(v.executable||v.shortcut||v.location):false})));
  const hasAvailable=checks.some(c=>c.v.installed&&c.available);
  for(const {v,target,available}of checks){if((v.installed||v.origin==='manual')&&target&&!available)rows.push({id:g.id,versionId:v.id,title:g.title,reason:'Missing file or disconnected drive',path:target,action:hasAvailable?'review':'hide',label:hasAvailable?'Review copies':'Hide entry'});}
  const seen=new Set();for(const v of g.versions){const key=(v.executable||v.shortcut)?.replaceAll('/','\\').toLowerCase()||v.launch;if(!key)continue;if(seen.has(key))rows.push({id:g.id,versionId:v.id,title:g.title,reason:'Duplicate launch target',path:key,action:'review',label:'Review copies'});else seen.add(key);}
 }return rows;
}
function completedDownload(previous,progress,state,installed){
 const total=Number(state.BytesToDownload),done=Number(state.BytesDownloaded);
 return Boolean(previous&&!progress&&installed&&((total>0&&done>=total)||(previous.total>0&&previous.done>=previous.total)));
}
module.exports={profile,preferences,uiState,backup,validateBackup,inspectLibrary,completedDownload};
