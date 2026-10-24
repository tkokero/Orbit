const test=require('node:test'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {protectWindow}=require('../src/background-checks.cjs');
test('background validation blocks native activation and keeps captures hidden',async()=>{
 const w=new EventEmitter(),captures=[];
 w.webContents={capturePage:async(...args)=>captures.push(args),setBackgroundThrottling:value=>assert.equal(value,false)};
 for(const method of ['show','showInactive','focus','restore','maximize','minimize','moveTop','setAlwaysOnTop','setFullScreen','flashFrame'])w[method]=()=>assert.fail('Native window activation: '+method);
 const state=protectWindow(w);
 w.show();w.focus();w.restore();w.showInactive();w.setFullScreen(true);w.setAlwaysOnTop(true);
 const rect={x:0,y:0,width:300,height:200};
 await w.webContents.capturePage(rect,{stayHidden:false,stayAwake:true});
 assert.deepEqual(captures,[[rect,{stayHidden:true,stayAwake:false}]]);
 assert.deepEqual(state,{shown:0,focused:0,blocked:6});
 w.emit('show');w.emit('focus');
 assert.equal(state.shown,1);assert.equal(state.focused,1);
});
