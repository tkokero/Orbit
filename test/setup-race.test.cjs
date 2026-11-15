const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('automatic Quick Start does not cover a menu opened while its preferences are loading',async()=>{
 let calls=0,resolve,modal=false,shows=0;const root={setAttribute(){},addEventListener(){},showModal(){shows++;}};
 const document={createElement:()=>root,body:{append(){}},documentElement:{classList:{contains:()=>false}},querySelector:()=>modal?{}:null};
 const window={orbitReady:false,orbit:{getSetup:()=>++calls===1?Promise.resolve({status:'new'}):new Promise(r=>resolve=r)}};
 const context={window,document,$:()=>({open:false}),cancelDialogClose(){},bindDialogDismiss(){},toast(){},clearTimeout,setTimeout};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/ui/setup.js'),'utf8'),context);
 const pending=window.orbitSetup.ready();await new Promise(r=>setImmediate(r));assert.equal(calls,2);modal=true;resolve({status:'new'});await pending;assert.equal(shows,0);
});
