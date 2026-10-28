const {randomUUID}=require('node:crypto'),rules=require('./ui/smart-collections.js');
function smartDefinitions(value){if(!Array.isArray(value)||value.length>20)throw Error('Use up to 20 custom smart collections.');const ids=new Set();return value.map(input=>{if(!input||!/^custom-[a-f0-9-]{36}$/.test(input.id)||ids.has(input.id))throw Error('Invalid smart collection identifier.');ids.add(input.id);return {id:input.id,...rules.validate(input)};});}
function saveSmart(store,input){const definitions=store.smartCollections||[];if(input?.remove){if(!definitions.some(d=>d.id===input.id))throw Error('Choose a custom smart collection to remove.');store.smartCollections=definitions.filter(d=>d.id!==input.id);return;}const definition=rules.validate(input),index=definitions.findIndex(d=>d.id===input.id);if(input.id&&index<0)throw Error('Smart collection no longer exists.');if(index<0&&definitions.length>=20)throw Error('You can save up to 20 smart collections.');const saved={id:index<0?'custom-'+randomUUID():input.id,...definition};if(index<0)definitions.push(saved);else definitions[index]=saved;store.smartCollections=definitions;}
function observeAdded(store,games,now=Date.now()){store.addedAt||=Object.create(null);for(const g of games)if(!Object.hasOwn(store.addedAt,g.id))store.addedAt[g.id]=store.addedTrackingInitialized?now:0;store.addedTrackingInitialized=true;let count=Object.keys(store.addedAt).length;if(count>30000){const current=new Set(games.map(g=>g.id));for(const [id]of Object.entries(store.addedAt).sort((a,b)=>a[1]-b[1])){if(count<=30000)break;if(!current.has(id)){delete store.addedAt[id];count--;}}}}
function addedDates(value){const dates=Object.create(null);if(!value||typeof value!=='object'||Array.isArray(value))return dates;for(const [id,date]of Object.entries(value).slice(0,30000))if(/^[a-f0-9]{20}$/.test(id)&&Number.isFinite(date)&&date>=0&&date<=Date.now()+60000)dates[id]=date;return dates;}
const design=require('./ui/collection-design.js');
function edit(store,input){
 if(!input||typeof input!=='object')throw Error('Choose a collection to edit.');
 const names=[...(store.collections||[])],styles=design.styles(store.collectionStyles),preferences={...store.preferences};
 let key=input.key,renamed=null;
 const known=new Set([...names.map(design.key),...[...rules.builtins,...(store.smartCollections||[])].map(c=>'smart:'+c.id)]);
 if(typeof key!=='string'||!known.has(key))throw Error('This collection is no longer available.');
 if(input.renameTo!==undefined){
  if(!key.startsWith('manual:'))throw Error('Rename smart collections in their rule editor.');
  if(typeof input.renameTo!=='string')throw Error('Enter a collection name.');
  const name=input.renameTo.trim();if(!name||name.length>40||/[\x00-\x1f]/.test(name))throw Error('Use a collection name under 40 characters.');
  const previous=decodeURIComponent(key.slice(7));
  if(names.some(n=>n!==previous&&n.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('A collection with that name already exists.');
  if(name!==previous){
   names[names.indexOf(previous)]=name;
   for(const [id,pref]of Object.entries(preferences))if(pref.collections?.includes(previous))preferences[id]={...pref,collections:[...new Set(pref.collections.map(n=>n===previous?name:n))]};
   const nextKey=design.key(name);if(styles[key])styles[nextKey]=styles[key];delete styles[key];renamed={from:key,to:nextKey};key=nextKey;
  }
 }
 if(input.style!==undefined)styles[key]=design.style(input.style);
 return {collections:names,preferences,collectionStyles:styles,renamed};
}
module.exports={smartDefinitions,saveSmart,observeAdded,addedDates,edit};
