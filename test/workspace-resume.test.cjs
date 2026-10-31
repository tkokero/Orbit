const test=require('node:test'),assert=require('node:assert/strict'),{plan}=require('../src/ui/workspace-resume.js');
test('fresh background opens cannot replace newer Games/Tools/Friends choices with a stale internal checkpoint',()=>{
 for(const current of ['library','tools','friends'])for(const checkpoint of ['library','tools','friends'])assert.deepEqual(plan({current,checkpoint}),{workspace:null,scroll:current===checkpoint});
});
test('a released renderer resumes its exact workspace, even with Remember view disabled',()=>{
 for(const checkpoint of ['library','tools','friends','store','downloads'])assert.deepEqual(plan({current:'library',checkpoint,restored:true,remember:false}),{workspace:checkpoint,scroll:true});
});
test('fresh external workspaces remain restorable when remembering views; invalid and opted-out checkpoints do not apply',()=>{
 for(const checkpoint of ['store','downloads'])assert.deepEqual(plan({current:'library',checkpoint}),{workspace:checkpoint,scroll:true});
 assert.deepEqual(plan({current:'library',checkpoint:'downloads',remember:false}),{workspace:null,scroll:false});
 for(const checkpoint of [null,'wrong','__proto__'])assert.deepEqual(plan({current:'library',checkpoint,restored:true}),{workspace:null,scroll:false});
});
