const {test}=require('node:test'),assert=require('node:assert/strict');
const state=require('../src/collection-state.cjs'),design=require('../src/ui/collection-design.js'),tools=require('../src/library-tools.cjs');
const fixture=()=>({collections:['Weekend','Co-op'],preferences:{a:{collections:['Weekend','Co-op'],notes:'Keep',favorite:true},b:{tags:['VR']}},collectionStyles:{[design.key('Weekend')]:{icon:'gamepad',color:'green'}}});
test('renaming updates all memberships and appearance without changing other preferences',()=>{
 const store=fixture(),before=structuredClone(store),result=state.edit(store,{key:design.key('Weekend'),renameTo:'After work'});
 assert.deepEqual(store,before);assert.deepEqual(result.collections,['After work','Co-op']);assert.deepEqual(result.preferences.a.collections,['After work','Co-op']);assert.equal(result.preferences.a.notes,'Keep');assert.equal(result.preferences.a.favorite,true);assert.deepEqual(result.preferences.b,store.preferences.b);assert.deepEqual(result.renamed,{from:design.key('Weekend'),to:design.key('After work')});assert.deepEqual(result.collectionStyles[design.key('After work')],{icon:'gamepad',color:'green'});assert.equal(result.collectionStyles[design.key('Weekend')],undefined);
});
test('invalid names, collisions, style injection, and unknown collections are rejected atomically',()=>{
 const store=fixture(),before=structuredClone(store);
 for(const input of [{key:design.key('Weekend'),renameTo:' co-OP '},{key:design.key('Weekend'),renameTo:''},{key:design.key('Weekend'),renameTo:'x'.repeat(41)},{key:'manual:Missing',renameTo:'New'},{key:'smart:installed',renameTo:'New'},{key:design.key('Weekend'),style:{icon:'<svg>',color:'url(file://x)'}}])assert.throws(()=>state.edit(store,input));
 assert.deepEqual(store,before);
});
test('manual and smart collections accept validated theme-aware styling',()=>{
 const store=fixture();const result=state.edit(store,{key:'smart:installed',style:{icon:'downloads',color:'cool'}});assert.deepEqual(result.collectionStyles['smart:installed'],{icon:'downloads',color:'cool'});assert.equal(result.renamed,null);assert.deepEqual(result.preferences,store.preferences);
 const same=state.edit(store,{key:design.key('Weekend'),renameTo:'weekend',style:{icon:'favorites',color:'warm'}});assert.equal(same.collections[0],'weekend');assert.equal(same.preferences.a.collections[0],'weekend');
});
test('appearance sanitizer ignores malformed entries and keeps Unicode collection identifiers',()=>{
 const key=design.key('週末 🎮');const result=design.styles({[key]:{icon:'gamepad',color:'green'},bad:{icon:'folder',color:'accent'},'manual:Bad':{icon:'javascript',color:'red'}});assert.deepEqual(Object.keys(result),[key]);assert.equal(Object.getPrototypeOf(result),null);
});
test('settings backup round-trip preserves collection appearance',()=>{
 const store=fixture();const restored=tools.backup({...store,settings:{},imports:[]},{totals:{}},{});assert.deepEqual(restored.collectionStyles[design.key('Weekend')],store.collectionStyles[design.key('Weekend')]);
});
