const {test}=require('node:test'),assert=require('node:assert/strict'),model=require('../src/ui/desktop-menu-model');
const storage=()=>{const values=new Map();return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('Desktop menus preserve the current interface when preferences are missing or invalid',()=>{
 for(const input of [undefined,null,[],false,'false',42,{recents:'false',news:0},Object.create({recents:false})])assert(Object.values(model.preferences(input)).every(Boolean));
 const store=storage();store.setItem(model.key,'{broken');assert(Object.values(model.read(store)).every(Boolean));
});
test('Each optional section can be saved and restored independently',()=>{
 const store=storage();let current=model.read(store);for(const {id}of model.sections){current=model.update(store,current,id,false);assert.equal(model.read(store)[id],false);}assert(Object.values(model.read(store)).every(v=>!v));
 current=model.update(store,current,'recents',true);assert.equal(current.recents,true);assert.equal(current.hero,false);assert.equal(current.news,false);
});
test('Unknown, non-boolean and inherited fields cannot customize unrelated controls',()=>{
 const store=storage(),input=model.preferences({recents:false,settings:false,__proto__:{hero:false}});assert.equal(input.hero,true);assert.equal(input.recents,false);assert(!('settings' in input));
 assert.deepEqual(model.update(store,input,'settings',false),input);assert.deepEqual(model.update(store,input,'recents','false'),input);assert.equal(store.values.size,0);
});
test('Show all changes only menu visibility and a failed save leaves the old choice intact',()=>{
 const store=storage();store.setItem('orbit-themes-v1','saved-theme');let current=model.update(store,model.preferences(),'news',false);
 assert.throws(()=>model.update({setItem(){throw Error('full');}},current,'news',true));assert.equal(current.news,false);
 assert(Object.values(model.reset(store)).every(Boolean));assert.equal(store.getItem('orbit-themes-v1'),'saved-theme');
});
test('Menu choices fit the normal profile loader and preference backups',()=>{
 const {values}=require('../src/profile-preferences.cjs');const raw=JSON.stringify(model.preferences({recents:false}));assert.equal(values({[model.key]:raw})[model.key],raw);
 const fs=require('node:fs');assert(fs.readFileSync(require.resolve('../src/ui/features.js'),'utf8').includes("'"+model.key+"'"));
});
test('Hidden news stays dormant; restoring it starts the normal request once',async()=>{
 const fs=require('node:fs'),vm=require('node:vm');let shown=false,calls=0;
 const shelf={hidden:true,querySelector:()=>({replaceChildren(){},querySelectorAll:()=>[],scrollBy(){}})};
 const context={document:{hidden:false,documentElement:{classList:{contains:()=>false}},createElement:()=>shelf},state:{section:'games',games:[{sources:['Steam']}]},$:id=>id==='#recent-games'?{after(){}}:{hidden:false},IntersectionObserver:class{disconnect(){}observe(){}},Date,WeakMap,WeakSet};
 context.window={OrbitDesktopMenus:{shown:()=>shown},orbit:{newsShelf:async()=>{calls++;return {posts:[]};}}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/ui/news-shelf.js'),'utf8'),context);
 await context.window.orbitNews.render();assert.equal(calls,0);assert.equal(shelf.hidden,true);shown=true;await context.window.orbitNews.render();assert.equal(calls,1);await context.window.orbitNews.render();assert.equal(calls,1);
});
test('news discards an old response when followed games change and queues one replacement',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),model=require('../src/ui/desktop-customization-model.js');let options={mode:'followed',followed:['old'],muted:[]};const requests=[];let markup='';const strip={replaceChildren(){markup='';},querySelectorAll:()=>[],set innerHTML(value){markup=value;},get innerHTML(){return markup;}};
 const shelf={hidden:true,querySelector:()=>strip,querySelectorAll:()=>[]},context={OrbitDesktopCustomizationModel:model,queueMicrotask,esc:String,document:{hidden:false,documentElement:{classList:{contains:()=>false}},createElement:()=>shelf},state:{section:'games',games:[{sources:['Steam']}]},$:id=>id==='#recent-games'?{after(){}}:{hidden:false},IntersectionObserver:class{disconnect(){}observe(){}},Date,WeakMap,WeakSet};
 context.window={OrbitDesktopCustomizationModel:model,OrbitDesktopMenus:{shown:()=>true,newsOptions:()=>options},orbit:{newsShelf:criteria=>new Promise(resolve=>requests.push({criteria,resolve}))}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/ui/news-shelf.js'),'utf8'),context);assert.equal(requests.length,1);options={mode:'followed',followed:['new'],muted:[]};await context.window.orbitNews.render();assert.equal(requests.length,1);requests[0].resolve({posts:[{gameId:'old',title:'Old'}]});await new Promise(resolve=>setImmediate(resolve));assert.equal(requests.length,2);assert.equal(requests[1].criteria.followed[0],'new');requests[1].resolve({posts:[{gameId:'new',title:'New',gameTitle:'New game'},{gameId:'old',title:'Private old'}]});await new Promise(resolve=>setImmediate(resolve));assert(markup.includes('New game'));assert(!markup.includes('Private old'));await context.window.orbitNews.render();assert.equal(requests.length,2);
});
