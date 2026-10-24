const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function fixture(){
 let now=10000,next=0,clears=0,api;const timers=new Map(),listeners=new Map(),document={hidden:false,addEventListener:(name,fn)=>listeners.set(name,fn)};
 const electron={contextBridge:{exposeInMainWorld:(name,value)=>{if(name==='orbit')api=value;}},ipcRenderer:{sendSync:()=>false,},webFrame:{clearCache:()=>clears++}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/preload.cjs'),'utf8'),{require:name=>{assert.equal(name,'electron');return electron;},process:{argv:[]},document,Date:{now:()=>now},setTimeout:(fn,delay)=>{timers.set(++next,{fn,at:now+delay});return next;},clearTimeout:id=>timers.delete(id)});
 function advance(ms){now+=ms;for(const [id,timer]of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}}
 return {api,advance,timers,get clears(){return clears;},hide(){document.hidden=true;listeners.get('visibilitychange')();},show(){document.hidden=false;listeners.get('visibilitychange')();}};
}
test('unused-image cleanup stays idle until requested and coalesces scroll bursts',()=>{
 const f=fixture();assert.equal(f.timers.size,0);for(let i=0;i<100;i++)f.api.releaseImageCache();assert.equal(f.timers.size,1);f.advance(649);assert.equal(f.clears,0);f.advance(1);assert.equal(f.clears,1);assert.equal(f.timers.size,0);
});
test('repeated cleanup requests cannot clear the renderer cache more than once per five seconds',()=>{
 const f=fixture();f.api.releaseImageCache();f.advance(650);f.api.releaseImageCache();f.advance(2000);f.api.releaseImageCache();f.advance(2999);assert.equal(f.clears,1);f.advance(1);assert.equal(f.clears,2);
});
test('hiding releases unused resources while a quick return cancels the pending hidden cleanup',()=>{
 const f=fixture();f.hide();f.show();f.advance(1000);assert.equal(f.clears,0);f.hide();f.advance(650);assert.equal(f.clears,1);assert.equal(f.timers.size,0);
});
