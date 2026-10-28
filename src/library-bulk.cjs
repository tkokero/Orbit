const {randomUUID}=require('node:crypto');
const {tags}=require('./ui/library-filters.js');
const copy=value=>Array.isArray(value)?[...value]:value;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* Validate the entire batch before changing any preferences. Undo touches only
   the field changed by the batch and refuses to overwrite a later edit. */
function plan(store,games,input){
  if(!input||!Array.isArray(input.ids)||!input.ids.length||input.ids.length>30000||input.ids.some(id=>typeof id!=='string'))throw Error('Select library entries first.');
  const ids=[...new Set(input.ids)],known=new Set(games.map(g=>g.id));
  if(ids.some(id=>!known.has(id)))throw Error('Some selected entries are no longer available. Refresh the library.');
  const action=input.action;let field,value=input.value;
  if(['favorite','hidden'].includes(action)){field=action;if(typeof value!=='boolean')throw Error('Choose an on or off value.');}
  else if(['collection-add','collection-remove'].includes(action)){field='collections';if(typeof value!=='string'||!store.collections?.includes(value))throw Error('Choose an existing collection.');}
  else if(['tag-add','tag-remove'].includes(action)){field='tags';value=tags([value])[0];if(!value)throw Error('Enter a tag.');}
  else throw Error('Unknown bulk action.');
  return ids.flatMap(id=>{
    const before=copy(store.preferences[id]?.[field]);let after=value;
    if(field==='collections'||field==='tags'){
      const current=Array.isArray(before)?before:[];
      after=action.endsWith('-add')?[...new Set([...current,value])]:current.filter(item=>item!==value);
      if(field==='tags')after=tags(after);
      if(!current.length&&!after.length)return [];
    }else if(Boolean(before)===after)return [];
    return equal(before,after)?[]:[{id,field,before,after}];
  });
}
function apply(store,changes,direction){
  for(const row of changes){const pref=store.preferences[row.id]||={},value=copy(row[direction]);
    store.preferences[row.id]={...pref};
    if(value===undefined)delete store.preferences[row.id][row.field];else store.preferences[row.id][row.field]=value;
  }
}
class BulkLibrary{
  constructor({store,games,save,invalidate=()=>{},now=Date.now}){Object.assign(this,{store,games,save,invalidate,now});this.undo=new Map();this.pending=Promise.resolve();}
  queue(fn){const result=this.pending.then(fn);this.pending=result.catch(()=>{});return result;}
  prune(){for(const [token,entry]of this.undo)if(this.now()-entry.at>5*60000)this.undo.delete(token);while(this.undo.size>5)this.undo.delete(this.undo.keys().next().value);}
  update(input){return this.queue(async()=>{
    const store=this.store(),changes=plan(store,this.games(),input);if(!changes.length)return {count:0,token:null};
    apply(store,changes,'after');this.invalidate();
    try{await this.save();}catch(error){this.rollback(store,changes,'after','before');throw error;}
    const token=randomUUID();this.undo.set(token,{at:this.now(),changes});this.prune();return {count:changes.length,token};
  });}
  rollback(store,changes,expected,direction){apply(store,changes.filter(row=>equal(store.preferences[row.id]?.[row.field],row[expected])),direction);this.invalidate();}
  restore(token){return this.queue(async()=>{
    this.prune();const entry=typeof token==='string'&&this.undo.get(token);if(!entry)throw Error('Undo expired. Changes can still be edited from the library.');
    const store=this.store(),known=new Set(this.games().map(g=>g.id));
    if(entry.changes.some(row=>!known.has(row.id)||!equal(store.preferences[row.id]?.[row.field],row.after)))throw Error('These entries changed after the bulk action. Undo is unavailable.');
    // Do not revive collections removed since the batch was applied.
    if(entry.changes.some(row=>row.field==='collections'&&row.before?.some(name=>!store.collections?.includes(name))))throw Error('A collection used by this action was removed.');
    apply(store,entry.changes,'before');this.invalidate();
    try{await this.save();}catch(error){this.rollback(store,entry.changes,'before','after');throw error;}
    this.undo.delete(token);return {count:entry.changes.length};
  });}
}
module.exports={plan,BulkLibrary};
