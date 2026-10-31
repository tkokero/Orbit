const test=require('node:test'),assert=require('node:assert/strict'),size=require('../src/ui/popup-size.js');
test('popup preferences recover from absent, malformed, and nonnumeric values',()=>{for(const value of [undefined,null,{},[],{width:'140',height:NaN},{width:Infinity,height:-Infinity}])assert.deepEqual(size.normalize(value),{width:100,height:100});});
test('popup dimensions have independent safe limits and whole-percent saved values',()=>{assert.deepEqual(size.normalize({width:999,height:-99}),{width:200,height:20});assert.deepEqual(size.normalize({width:110.3,height:152.8}),{width:110,height:153});});
test('a centered resize doubles each edge delta without changing the other dimension',()=>{const start={width:1280,height:680,baseWidth:1280,baseHeight:680,size:{width:100,height:100}},result=size.resize(start,64,0);assert.ok(Math.abs(result.width-110)<1e-9);assert.equal(result.height,100);const tall=size.resize(start,0,170);assert.equal(tall.width,100);assert.equal(tall.height,150);});
test('resizing from a viewport-clamped frame follows the actual edge rather than the hidden requested size',()=>{const start={width:908,height:688,baseWidth:876,baseHeight:656,size:{width:170,height:170}},result=size.resize(start,-16,-16);assert.equal(result.width,100);assert.equal(result.height,100);});
test('extreme pointer travel cannot produce negative or excessive popup dimensions',()=>{const start={width:1280,height:680,baseWidth:1280,baseHeight:680,size:{width:100,height:100}};assert.deepEqual(size.resize(start,-10000,10000),{width:20,height:200});});
test('legacy shared dimensions migrate without losing the previous size',()=>{const state=size.read({width:110,height:153});assert.equal(state.version,2);assert.equal(state.shared,true);assert.deepEqual(size.forKind(state,'settings'),{width:110,height:153});});
test('separate menu sizes are independent and survive temporarily sharing a size',()=>{let state=size.sharing(size.read({width:110,height:153}),false);state=size.withSize(state,'settings',{width:80,height:90});state=size.withSize(state,'game-details',{width:120,height:140,fixedHeight:true});assert.deepEqual(size.forKind(state,'settings'),{width:80,height:90});assert.deepEqual(size.forKind(state,'game-details'),{width:120,height:140,fixedHeight:true});state=size.sharing(state,true,'settings');assert.deepEqual(size.forKind(state,'game-details'),{width:80,height:90});state=size.withSize(state,'settings',{width:130,height:160});state=size.sharing(state,false);assert.deepEqual(size.forKind(state,'game-details'),{width:120,height:140,fixedHeight:true});assert.deepEqual(size.forKind(state,'settings'),{width:80,height:90});});
test('stored menu identifiers and sizes are sanitized and bounded',()=>{const state=size.read({shared:false,sizes:{'bad key':{},settings:{width:400,height:10,fixedHeight:true,extra:4},...Object.fromEntries(Array.from({length:100},(_,i)=>['menu-'+i,{}]))}});assert.ok(Object.keys(state.sizes).length<=64);assert.equal(Object.hasOwn(state.sizes,'bad key'),false);assert.deepEqual(state.sizes.settings,{width:200,height:20,fixedHeight:true});});
test('an unseen separate menu fits content instead of inheriting another menu fixed height',()=>{
 const state=size.read({shared:false,common:{width:93,height:177,fixedHeight:true},sizes:{settings:{width:99,height:163,fixedHeight:true}}});
 assert.deepEqual(size.forKind(state,'menu-steamvr'),{width:100,height:100});assert.equal(size.automatic(state,'menu-steamvr'),true);
 assert.equal(size.automatic(state,'settings'),false);assert.deepEqual(state.common,{width:93,height:177,fixedHeight:true});
});
test('saved manual dimensions take priority, including an explicit 100 percent per-menu choice',()=>{
 assert.equal(size.automatic(size.read({common:{width:93,height:177,fixedHeight:true}}),'menu-steamvr'),false);
 const state=size.read({shared:false,sizes:{'menu-steamvr':{width:100,height:100}}});assert.equal(size.automatic(state,'menu-steamvr'),false);
 const shared=size.sharing(state,true,'menu-steamvr');assert.equal(size.automatic(shared,'menu-steamvr'),false);
});
test('automatic height and a custom width survive persistence and switching sharing modes',()=>{
 let state=size.withSize(size.read(),'settings',{width:110,height:100,mode:'auto'});assert.equal(size.automatic(state,'settings'),true);
 state=size.sharing(state,false,'settings');assert.equal(size.automatic(state,'settings'),true);assert.equal(size.forKind(state,'settings').width,110);
 assert.equal(size.automatic(state,'confirmation'),true);state=size.read(JSON.parse(JSON.stringify(state)));assert.equal(size.automatic(state,'settings'),true);
});
test('switching to separate sizing preserves the current manual menu and leaves new menus automatic',()=>{
 const state=size.sharing(size.read({width:110,height:153}),false,'settings');assert.deepEqual(size.forKind(state,'settings'),{width:110,height:153});
 assert.equal(size.automatic(state,'settings'),false);assert.equal(size.automatic(state,'menu-other'),true);
});
test('manual frames originating from compact defaults retain their width basis safely',()=>{
 assert.deepEqual(size.normalize({width:100,height:75,mode:'manual',baseWidth:720}),{width:100,height:75,mode:'manual',baseWidth:720});
 assert.equal(size.normalize({baseWidth:99999}).baseWidth,1280);assert.equal(size.normalize({baseWidth:1}).baseWidth,320);assert.equal(size.normalize({baseWidth:NaN}).baseWidth,undefined);
 assert.equal(size.preset('menu-steamvr').width,720);assert.ok(size.preset('settings').width>size.preset('confirmation').width);
});
