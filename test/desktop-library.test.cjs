const {test}=require('node:test'),assert=require('node:assert/strict');
const {Selection,preferences}=require('../src/ui/desktop-library-model.js');
const model=require('../src/ui/desktop-library-model.js');
test('collection views keep list banners sizes and sections independent without changing legacy preferences',()=>{
 const saved=model.views({'games|':{layout:'covers',size:190,spacing:20},'games|manual:Co-op':{layout:'banners',size:240,spacing:26},'tools|manual:Co-op':{layout:'list',size:130,spacing:8},'invalid':{layout:'list'}});
 assert.equal(Object.keys(saved).length,3);assert.equal(saved['games|manual:Co-op'].layout,'banners');assert.equal(saved['tools|manual:Co-op'].layout,'list');assert.equal(saved['games|'].size,190);
 const renamed=model.renameViews(saved,'manual:Co-op','manual:Together');assert.equal(renamed['games|manual:Together'].size,240);assert.equal(renamed['tools|manual:Together'].layout,'list');assert(!Object.hasOwn(renamed,'games|manual:Co-op'));assert.equal(saved['games|manual:Co-op'].size,240);
 assert.deepEqual(model.display({layout:'list',size:999,spacing:-1}),{layout:'list',size:260,spacing:8});assert.equal(Object.keys(model.views(Object.fromEntries(Array.from({length:250},(_,i)=>['games|manual:'+i,{layout:'banners'}])))).length,200);
});
test('dragging a selected card uses only its current selection and visible results',()=>{
 assert.deepEqual(model.dragIds('a',new Set(['a','b','hidden']),['a','b','c']),['a','b']);assert.deepEqual(model.dragIds('c',new Set(['a','b']),['a','b','c']),['c']);assert.deepEqual(model.dragIds('missing',new Set(),['a']),[]);
});
const {BulkLibrary,plan}=require('../src/library-bulk.cjs');
function fixture(save=async()=>{}){const store={preferences:{a:{favorite:true,tags:['VR'],collections:['Weekend'],notes:'Keep me'},b:{tags:['Co-op']}},collections:['Weekend','Co-op']};const games=['a','b','c'].map(id=>({id}));return {store,games,bulk:new BulkLibrary({store:()=>store,games:()=>games,save})};}
test('display preferences clamp malformed values and preserve valid unique pins',()=>{
  assert.deepEqual(preferences(null),{layout:'covers',size:190,spacing:20,pins:[]});
  assert.deepEqual(preferences({layout:'banners',size:999,spacing:-1,pins:['manual:Weekend','manual:Weekend',null,'unknown','smart:installed']}),{layout:'banners',size:260,spacing:8,pins:['manual:Weekend','smart:installed']});
});
test('selection follows sorted results, supports additive ranges and prunes filtered IDs',()=>{
  const s=new Selection(),order=['d','b','a','c'];s.choose('b',order);s.choose('c',order,{range:true});assert.deepEqual([...s.ids],['b','a','c']);s.choose('a',order);assert.deepEqual([...s.ids],['b','c']);s.choose('d',order,{range:true,additive:true});assert.equal(s.ids.size,4);s.reconcile(['b','d']);assert.deepEqual([...s.ids].sort(),['b','d']);assert.equal(s.anchor,null);s.clear();assert.equal(s.ids.size,0);
});
test('invalid batches leave every preference unchanged',()=>{
  const {store,games}=fixture(),before=structuredClone(store);
  for(const input of [{ids:['a','missing'],action:'hidden',value:true},{ids:['a'],action:'kind',value:'tool'},{ids:['a'],action:'favorite',value:1},{ids:['a'],action:'tag-add',value:'x'.repeat(33)},{ids:['a'],action:'collection-add',value:'Missing'}])assert.throws(()=>plan(store,games,input));
  store.preferences.b.tags=Array.from({length:20},(_,i)=>'t'+i);assert.throws(()=>plan(store,games,{ids:['a','b'],action:'tag-add',value:'extra'}));delete store.preferences.b.tags;before.preferences.b={};assert.deepEqual(store,before);
});
test('bulk actions save once and Undo restores only their changed fields',async()=>{
  let writes=0;const {store,bulk}=fixture(async()=>{writes++});const r=await bulk.update({ids:['b','c','c'],action:'favorite',value:true});assert.equal(r.count,2);assert.equal(writes,1);store.preferences.b.notes='Later note';await bulk.restore(r.token);assert.equal(writes,2);assert.equal(store.preferences.b.favorite,undefined);assert.equal(store.preferences.b.notes,'Later note');assert.deepEqual(store.preferences.a.tags,['VR']);
});
test('tag and collection additions preserve other values, deduplicate and undo',async()=>{
  const {store,bulk}=fixture();const add=await bulk.update({ids:['a','b'],action:'tag-add',value:'Co-op'});assert.equal(add.count,1);assert.deepEqual(store.preferences.a.tags,['VR','Co-op']);await bulk.restore(add.token);assert.deepEqual(store.preferences.a.tags,['VR']);const collect=await bulk.update({ids:['a','b'],action:'collection-add',value:'Weekend'});assert.equal(collect.count,1);await bulk.restore(collect.token);assert.equal(store.preferences.b.collections,undefined);const remove=await bulk.update({ids:['a'],action:'collection-remove',value:'Weekend'});assert.deepEqual(store.preferences.a.collections,[]);await bulk.restore(remove.token);assert.deepEqual(store.preferences.a.collections,['Weekend']);
});
test('Undo refuses conflicts and removed collections without partial restoration',async()=>{
  const {store,bulk}=fixture();const r=await bulk.update({ids:['a','b'],action:'hidden',value:true});store.preferences.b.hidden=false;await assert.rejects(bulk.restore(r.token),/changed after/);assert.equal(store.preferences.a.hidden,true);const removed=await bulk.update({ids:['a'],action:'collection-remove',value:'Weekend'});store.collections=[];await assert.rejects(bulk.restore(removed.token),/removed/);assert.deepEqual(store.preferences.a.collections,[]);
});
test('failed saves roll back, failed Undo can be retried',async()=>{
  let fail=true;const {store,bulk}=fixture(async()=>{if(fail)throw Error('Disk full')});await assert.rejects(bulk.update({ids:['a','b'],action:'hidden',value:true}),/Disk full/);assert.equal(store.preferences.a.hidden,undefined);fail=false;const r=await bulk.update({ids:['a','b'],action:'hidden',value:true});fail=true;await assert.rejects(bulk.restore(r.token),/Disk full/);assert.equal(store.preferences.a.hidden,true);fail=false;await bulk.restore(r.token);assert.equal(store.preferences.a.hidden,undefined);
});
test('bulk requests serialize, no-ops do not save, and undo expires',async()=>{
  let now=0,writes=0;const {store,games}=fixture();const bulk=new BulkLibrary({store:()=>store,games:()=>games,now:()=>now,save:async()=>{writes++;await Promise.resolve()}});const [a,b]=await Promise.all([bulk.update({ids:['b'],action:'tag-add',value:'One'}),bulk.update({ids:['b'],action:'tag-add',value:'Two'})]);assert.deepEqual(store.preferences.b.tags,['Co-op','One','Two']);await bulk.restore(b.token);await bulk.restore(a.token);assert.deepEqual(store.preferences.b.tags,['Co-op']);const noop=await bulk.update({ids:['a'],action:'favorite',value:true});assert.equal(noop.token,null);assert.equal(writes,4);const r=await bulk.update({ids:['c'],action:'hidden',value:true});now=300001;await assert.rejects(bulk.restore(r.token),/expired/);
});

test('removed library entries stay excluded after saving and rediscovery, retain other choices, and can be restored',async()=>{const {mergeLibrary}=require('../src/library.cjs'),records=[{id:'steam:removal',title:'Removal fixture',source:'Steam',installed:true,location:'C:/Games/Fixture',playtime:120}],first=mergeLibrary(records)[0],store={preferences:{[first.id]:{favorite:true,tags:['Keep'],collections:['Weekend'],notes:'Keep note'}},collections:['Weekend']};let persisted;const current=()=>mergeLibrary(records,store.preferences),bulk=new BulkLibrary({store:()=>store,games:current,save:async()=>{persisted=JSON.stringify(store);}}),original=structuredClone(store.preferences[first.id]);await bulk.update({ids:[first.id],action:'hidden',value:true});const reloaded=JSON.parse(persisted),discovered=mergeLibrary([...records,{...records[0],title:'Removal fixture™'}],reloaded.preferences)[0];assert.equal(discovered.hidden,true);assert.equal(discovered.installed,true);assert.equal(discovered.favorite,true);assert.deepEqual(reloaded.preferences[first.id].tags,['Keep']);assert.deepEqual(store.preferences[first.id],{...original,hidden:true});await bulk.update({ids:[first.id],action:'hidden',value:false});assert.equal(current()[0].hidden,false);assert.deepEqual(store.preferences[first.id],{...original,hidden:false});});
