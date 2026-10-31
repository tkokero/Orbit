const {randomUUID}=require('node:crypto');
const profile=value=>require('./library-tools.cjs').profile(value);
const validId=id=>typeof id==='string'&&/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)&&!['constructor','prototype'].includes(id);
function read(value){
 if(value==null)return {version:1,selected:'default',items:[]};
 if(value.version!==1||!Array.isArray(value.items)||value.items.length>12)throw Error('Invalid saved launch options.');
 const seen=new Set(),names=new Set(['default']),items=value.items.map(item=>{if(!item||!validId(item.id)||item.id==='default'||seen.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>48||/[\x00-\x1f\x7f]/.test(item.name)||names.has(item.name.trim().toLocaleLowerCase()))throw Error('Invalid launch option.');seen.add(item.id);names.add(item.name.trim().toLocaleLowerCase());return {id:item.id,name:item.name.trim(),profile:profile(item.profile)};});
 const selected=value.selected||'default';if(selected!=='default'&&!seen.has(selected))throw Error('The selected launch option is unavailable. Choose Default in Launch options.');
 return {version:1,selected,items};
}
function current(preferences={}){const options=read(preferences.launchOptions);return options.selected==='default'?profile(preferences.profile):options.items.find(i=>i.id===options.selected).profile;}
function detectionGame(game,preferences={}){const p=current(preferences);return p.executable?{...game,installed:true,versions:[...(game.versions||[]),{executable:p.executable}]}:game;}
function edit(value,input){const next=read(value),existing=input?.id&&next.items.find(i=>i.id===input.id);if(input?.id&&!existing)throw Error('This launch option no longer exists.');const name=String(input?.name||'').trim();if(!name||name.length>48||/[\x00-\x1f\x7f]/.test(name))throw Error('Use a name between 1 and 48 characters.');if(next.items.some(i=>i.id!==existing?.id&&i.name.toLocaleLowerCase()===name.toLocaleLowerCase())||name.toLowerCase()==='default')throw Error('Choose a different launch option name.');if(!existing&&next.items.length>=12)throw Error('A game can have up to 12 additional launch options.');const item={id:existing?.id||'option-'+randomUUID(),name,profile:profile(input.profile)};if(existing)next.items=next.items.map(i=>i.id===item.id?item:i);else next.items.push(item);return {state:next,item};}
function select(value,id){const next=read(value);if(id!=='default'&&!next.items.some(i=>i.id===id))throw Error('Choose an existing launch option.');next.selected=id;return next;}
function remove(value,id){const next=read(value);if(!next.items.some(i=>i.id===id))throw Error('This launch option no longer exists.');next.items=next.items.filter(i=>i.id!==id);if(next.selected===id)next.selected='default';return next;}
module.exports={read,current,edit,select,remove,detectionGame};
