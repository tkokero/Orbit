const test=require('node:test'),assert=require('node:assert/strict');
const {mergeLibrary}=require('../src/library.cjs'),{removeEntry}=require('../src/library-removal.cjs'),{preferences}=require('../src/library-tools.cjs');
const records=[{id:'steam:322170',appId:'322170',title:'Geometry Dash',source:'Steam',origin:'steam-account',installed:true,executable:'D:\\Games\\GeometryDash.exe'},{id:'manual:gd',title:'GD',source:'Other',origin:'manual',installed:true,executable:'D:\\Games\\GeometryDash.exe'}];
test('explicitly adding a removed record again clears only its removal marker',()=>{
 const {restoreEntries}=require('../src/library-removal.cjs'),games=mergeLibrary(records);let store={preferences:{},imports:records,remembered:[]};for(const g of games)store=removeEntry(store,g);
 const restored=restoreEntries(store,[records[1]]);assert.equal(mergeLibrary(records,restored.preferences).length,1);assert.equal(mergeLibrary(records,restored.preferences)[0].title,'GD');assert.equal(mergeLibrary(records,store.preferences).length,0);
});
test('removal deletes the entry instead of hiding it, preserves shared-file cards and survives discovery/reload',()=>{
 const games=mergeLibrary(records),g=games.find(g=>g.title==='GD'),other=games.find(g=>g.title!=='GD');
 const original={preferences:{[g.id]:{favorite:true,hidden:false,notes:'old'},[other.id]:{favorite:true}},imports:[records[1]],remembered:[records[0]]};
 const next=removeEntry(original,g);assert.deepEqual(next.preferences[g.id],{removed:true,removedRecords:['Other|manual:gd']});assert.equal(next.imports.length,0);assert.equal(original.imports.length,1);assert.equal(next.preferences[other.id].favorite,true);
 const reloaded={preferences:preferences(JSON.parse(JSON.stringify(next.preferences)))};
 const scan=mergeLibrary(records,reloaded.preferences);assert.deepEqual(scan.map(g=>g.id),[other.id]);assert.equal(scan.some(g=>g.hidden),false);
 assert.equal(mergeLibrary(records.map(r=>r.id==='manual:gd'?{...r,title:'Renamed by provider'}:r),reloaded.preferences).length,1);
});
test('Hide retains a library entry, while removal excludes hidden and ordinary views equally',()=>{
 const g=mergeLibrary(records)[0],hidden={[g.id]:{hidden:true}};
 assert.equal(mergeLibrary(records,hidden).find(row=>row.id===g.id).hidden,true);
 const next=removeEntry({preferences:hidden,imports:[],remembered:[]},g);
 assert.equal(mergeLibrary(records,next.preferences).some(row=>row.id===g.id),false);
});
