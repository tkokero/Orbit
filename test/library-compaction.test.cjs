const test=require('node:test'),assert=require('node:assert/strict');
const {compactRecords,mergeLibrary}=require('../src/library.cjs');
test('cache compaction retains copies, verified evidence, preferred launch and newest stats',()=>{
 const rows=[
  {id:'steam:1',appId:'1',title:'Game',source:'Steam',origin:'scan',installed:true,location:'C:\\Games\\Game',launch:'steam://rungameid/1'},
  {id:'steam:1',appId:'1',title:'Game',source:'Steam',origin:'local-history',playtime:120,lastPlayed:200,statsUpdatedAt:300,achievements:{total:3,unlocked:2,items:[{id:'a'}]}},
  {id:'steam:1',appId:'1',title:'Game',source:'Steam',origin:'steam-account',installed:false},
  {id:'steam:1',appId:'1',title:'Game',source:'Steam',origin:'scan',installed:true,location:'D:\\Games\\Game',launch:'steam://rungameid/1'},
  {id:'epic:g',title:'Game',source:'Epic Games',origin:'offline-entitlement',installed:false},
  {id:'steam:2',appId:'2',title:'Refunded game',source:'Steam',origin:'local-history',playtime:10},
 ];
 const original=mergeLibrary(rows),prefs={[original[0].id]:{preferred:'epic:g',favorite:true,collections:['Weekend']}};
 const compact=compactRecords(rows);assert.equal(compact.length,3);assert.deepEqual(mergeLibrary(compact,prefs),mergeLibrary(rows,prefs));assert.deepEqual(compactRecords(compact),compact);
 assert.equal(mergeLibrary(compact)[0].playtime,120);assert.ok(!compact.some(r=>r.title==='Refunded game'));
});
