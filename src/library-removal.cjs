// A removed entry leaves only an identity marker so discovery cannot add it back.
// Hidden entries retain their normal preferences and are a separate library state.
function removeEntry(store,game){
 if(!game?.id||!game.versions?.length)throw Error('Choose a library entry to remove.');
 const ids=new Set(game.versions.flatMap(v=>[v.id,v.recordId].filter(Boolean)));
 return {...store,preferences:{...store.preferences,[game.id]:{removed:true,removedRecords:[...new Set(game.versions.map(v=>v.source+'|'+(v.recordId||v.id)))]}},
  imports:(store.imports||[]).filter(r=>!ids.has(r.id)),
  remembered:(store.remembered||[]).filter(r=>!ids.has(r.id))};
}
function restoreEntries(store,records){
 const keys=new Set(records.map(r=>r.source+'|'+r.id));
 const preferences={...store.preferences};
 for(const [id,pref]of Object.entries(preferences))if(pref?.removed&&pref.removedRecords?.some(key=>keys.has(key)))delete preferences[id];
 return {...store,preferences};
}
module.exports={removeEntry,restoreEntries};
