const {test}=require('node:test'),assert=require('node:assert/strict');
const {Selection,preferences}=require('../src/ui/desktop-library-model.js');
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
