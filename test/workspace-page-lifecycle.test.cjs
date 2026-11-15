const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function fixture(orbit){
 const body={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]},messages=[];
 const sandbox={window:{},orbit,orbitCalendar:{hide(){}},document:{hasFocus:()=>false},setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/ui/workspace-pages.js'),'utf8'),sandbox);
 const pages=sandbox.window.OrbitWorkspacePages({body,html:String,icon:()=>'',button:()=>'<button>Retry</button>',visible:()=>true,release(){},message:text=>messages.push(text),run:fn=>Promise.resolve().then(fn).catch(error=>messages.push(error.message))});
 return {pages,body,messages};
}
test('a delayed Clips failure leaves the newly opened page intact',async()=>{
 const pending=deferred(),{pages,body,messages}=fixture({clips:()=>pending.promise,onClips:()=>()=>{}});
 const oldPage=pages.mount('clips');pages.leave();await pages.mount('library');body.innerHTML='<section>Library content</section>';
 pending.reject(Error('The old clip request failed'));await oldPage;
 assert.equal(body.innerHTML,'<section>Library content</section>');assert.deepEqual(messages,[]);
});
test('returning to Downloads during a pending load requests the new page after that load settles',async()=>{
 const pending=deferred(),next=deferred();let requests=0;
 const {pages}=fixture({downloads:()=>++requests===1?pending.promise:next.promise,onDownloadsChanged:()=>()=>{}});
 const oldPage=pages.mount('downloads');pages.leave();await pages.mount('library');await pages.mount('downloads');
 assert.equal(requests,1,'A pending request should stay shared instead of starting duplicate loads');
 pending.resolve({items:[],native:[],history:[]});await oldPage;await tick();
 assert.equal(requests,2,'The current Downloads page must get a fresh load after the old response is discarded');pages.leave();
});
