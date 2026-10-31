const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../src/ui/desktop-tools-model.js'),L=require('../src/launch-options.cjs'),{SteamVr}=require('../src/steamvr.cjs'),{validateBackup,backup}=require('../src/library-tools.cjs');
test('unified search spans visible games, collections, settings and actions with stable ranking',()=>{
 const rows=M.index({games:[{id:'hidden',title:'DOOM secret',hidden:true},{id:'doom',title:'DOOM Eternal',kind:'game',sources:['Steam'],aliases:['Slayer']},{id:'tool',title:'SteamVR',kind:'tool'}],collections:['Co-op'],smart:[{id:'recent',name:'Recently added'}],settings:[{id:'icon',label:'App icon',terms:'appearance theme'}],actions:[{id:'refresh',label:'Refresh library'}]});
 assert.deepEqual(M.search(rows,'doom').map(i=>i.id),['doom']);assert.equal(M.search(rows,'slayer steam')[0].id,'doom');assert.equal(M.search(rows,'theme')[0].type,'Setting');assert.equal(M.search(rows,'co-op')[0].type,'Collection');assert.equal(M.search(rows,'refresh')[0].type,'Action');assert.equal(M.search(rows,'steamvr')[0].type,'Tool');assert.equal(M.search(rows,'nothing').length,0);assert.equal(M.search(rows,'',2).length,2);
});
test('shortcut rebinding detects conflicts and protects text editing, system keys and composition',()=>{
 assert.equal(M.shortcuts({refresh:'Ctrl+Alt+R'}).refresh,'Ctrl+Alt+R');assert.throws(()=>M.shortcuts({search:'F5'}),/Already used/);for(const value of ['a','Shift+A','Ctrl+C','Alt+F4','Ctrl+Tab','Meta+K','Ctrl+Ctrl+K'])assert.throws(()=>M.shortcuts({search:value}));assert.equal(M.eventChord({key:'k',ctrlKey:true}),'Ctrl+K');assert.equal(M.eventChord({key:'k',ctrlKey:true,isComposing:true}),null);assert.equal(M.eventChord({key:'k',metaKey:true}),null);
});
test('popup position snapshots are bounded, per display, and recover within a smaller viewport',()=>{
 const value=M.positions(JSON.parse('{"displays":{"main":{"settings":{"x":2,"y":-1}},"second":{"settings":{"x":0.2,"y":0.7}},"__proto__":{"settings":{"x":0,"y":0}}}}'));assert.deepEqual(value.displays.main.settings,{x:1,y:0});assert.equal(Object.hasOwn(value.displays,'__proto__'),false);assert.equal(value.displays.second.settings.x,.2);const p=M.fit(value.displays.main.settings,{width:400,height:350},{width:300,height:200});assert.ok(p.left>=0&&p.left+300<=400);assert.ok(p.top>=0&&p.top+200<=350);assert.equal(M.fit({}, {width:400,height:350},{width:300,height:200}).left,50);
});
test('named targets preserve the original default and keep arguments literal across selection, edit and removal',()=>{
 const original={profile:{executable:'C:\\Game\\Original.exe',args:['--saved'],controller:'couch'}},before=JSON.stringify(original);let result=L.edit(null,{name:'SKSE',profile:{executable:'C:\\Game\\skse64_loader.exe',cwd:'C:\\Game',args:['$(not shell)','a b'],steamVR:true}});original.launchOptions=L.select(result.state,result.item.id);const current=L.current(original);assert.deepEqual(current.args,['$(not shell)','a b']);assert.equal(current.cwd,'C:\\Game');assert.equal(current.steamVR,true);assert.equal(JSON.stringify({profile:original.profile}),before);assert.throws(()=>L.edit(original.launchOptions,{name:'SKSE',profile:{}}),/different/);assert.throws(()=>L.select(original.launchOptions,'missing'),/existing/);original.launchOptions=L.remove(original.launchOptions,result.item.id);assert.equal(L.current(original).executable,'C:\\Game\\Original.exe');assert.equal(original.launchOptions.selected,'default');
});
test('launch target validation rejects malformed collections and unsafe folders without changing input',()=>{
 assert.throws(()=>L.read({version:1,items:[{id:'__proto__',name:'Bad',profile:{}}]}));assert.throws(()=>L.edit(null,{name:'Bad',profile:{cwd:'relative'}}));assert.throws(()=>L.edit(null,{name:'Bad',profile:{executable:'C:\\bad\0.exe'}}));assert.throws(()=>L.read({version:1,selected:'missing',items:[]}));let s=L.read();for(let i=0;i<12;i++)s=L.edit(s,{name:'Option '+i,profile:{}}).state;assert.throws(()=>L.edit(s,{name:'One more',profile:{}}),/12/);
});

test('imported launch option names cannot duplicate Default, each other, or contain controls',()=>{
 for(const names of [['Default'],['SKSE','skse'],['Bad\nname']])assert.throws(()=>L.read({version:1,items:names.map((name,n)=>({id:'option-'+n,name,profile:{}}))}));assert.throws(()=>L.edit(null,{name:'Bad\nname',profile:{}}));
});

test('normal preference loader preserves shortcut and per-display position choices alongside themes',async()=>{
 const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{UiPreferences}=require('../src/profile-preferences.cjs'),folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-desktop-prefs-'));
 try{const file=path.join(folder,'ui-preferences.json'),store=await new UiPreferences(file).load();await store.set('orbit-desktop-shortcuts-v1',JSON.stringify(M.shortcuts({refresh:'Ctrl+Alt+R'})));await store.set('orbit-popup-positions-v1',JSON.stringify(M.positions({displays:{first:{settings:{x:.2,y:.4}},second:{settings:{x:.8,y:.6}}}})));await store.set('orbit-themes-v1','{"active":"rose","custom":[]}');const loaded=await new UiPreferences(file).load();assert.deepEqual(loaded.state.values,store.state.values);}finally{await fs.rm(folder,{recursive:true,force:true});}
});
test('backups round-trip new launch targets, shortcuts, sizes and positions alongside existing preferences',()=>{
 const option=L.edit(null,{name:'Alternate',profile:{args:['--literal=a b'],cwd:'C:\\Game',steamVR:true}});const source={settings:{},preferences:{game:{favorite:true,launchOptions:option.state}},imports:[],collections:[]},ui={'orbit-desktop-shortcuts-v1':JSON.stringify(M.defaults),'orbit-popup-positions-v1':JSON.stringify({displays:{main:{settings:{x:.2,y:.3}}}}),'orbit-popup-size-v1':'{"width":120}'};
 const restored=validateBackup(backup(source,{totals:{}},ui));assert.deepEqual(restored.preferences.game.launchOptions,option.state);assert.deepEqual(restored.ui,ui);assert.equal(source.preferences.game.favorite,true);
});
const tool={id:'vr',kind:'tool',installed:true,versions:[{source:'Steam',appId:'250820',installed:true,location:'C:\\SteamVR'}]};
test('a script-extender target retains actual game detection and does not count its bootstrap process',()=>{const {candidatesFor,matchesProcess}=require('../src/playtime.cjs'),game={id:'skyrim',title:'The Elder Scrolls V: Skyrim Special Edition',installed:true,versions:[{executable:'C:\\Skyrim\\SkyrimSE.exe'}]},p={profile:{executable:'C:\\Skyrim\\skse64_loader.exe'}};const expected=candidatesFor(L.detectionGame(game,p));assert.equal(matchesProcess({name:'SkyrimSE',path:null},expected),true);assert.equal(matchesProcess({name:'skse64_loader',path:'C:\\Skyrim\\skse64_loader.exe'},expected),false);assert.equal(game.versions.length,1);});
test('SteamVR status reports only the verified runtime and does not claim headset availability',async()=>{
 let rows=[{name:'vrserver',path:'C:\\SteamVR\\bin\\win64\\vrserver.exe'}];const vr=new SteamVr({games:()=>[tool],find:async()=>rows,launch:()=>{throw Error('must not launch');}});assert.equal((await vr.status()).running,true);assert.equal(Object.hasOwn(await vr.status(),'headset'),false);rows=[{name:'vrserver',path:'C:\\SteamVR-Other\\vrserver.exe'}];assert.equal((await vr.status()).running,false);rows=[{name:'vrmonitor',path:null}];assert.equal((await vr.status()).running,false);
});
test('SteamVR preparation starts an installed tool once, remains opt-in, and smoke never probes real processes',async()=>{
 let running=false,launches=0;const vr=new SteamVr({games:()=>[tool],find:async()=>running?[{name:'vrserver',path:null}]:[],launch:async()=>{launches++;running=true;},wait:async()=>{}});await Promise.all([vr.prepare(),vr.prepare()]);assert.equal(launches,1);await vr.prepare();assert.equal(launches,1);const smoke=new SteamVr({games:()=>[tool],smoke:true,find:()=>{throw Error('real process probe');},launch:async()=>({})});assert.equal((await smoke.status()).running,false);await smoke.prepare();await assert.rejects(new SteamVr({games:()=>[],find:async()=>[],launch:()=>{throw Error('must not launch');}}).open(),/Install SteamVR/);
});
test('launch recovery offers relevant repair actions without suggesting elevation or changing VR mode',()=>{
 const {classify}=require('../src/ui/launch-recovery-model.js');assert.equal(classify('ENOENT').locate,true);assert.equal(classify('EACCES').locate,false);assert.match(classify('starting folder unavailable').detail,/Reconnect/);assert.equal(classify('SteamVR has not started').locate,false);assert.match(classify('unknown launch failure').detail,/original launcher/);
});

test('empty search preserves category quotas and source order without mutating the index',()=>{
 const rows=[{id:'a',type:'Action'},{id:'s1',type:'Setting'},{id:'g1',type:'Game'},{id:'c1',type:'Collection'},{id:'t',type:'Tool'},{id:'s2',type:'Setting'},{id:'c2',type:'Collection'},{id:'g2',type:'Game'},{id:'g3',type:'Game'},{id:'a2',type:'Action'},{id:'c3',type:'Collection'}];
 assert.deepEqual(M.search(rows,'').map(r=>r.id),['g1','t','g2','c1','c2','s1','s2','a','a2']);assert.deepEqual(M.search(rows,'',2).map(r=>r.id),['g1','t']);assert.deepEqual(M.search(rows,'',0),[]);assert.equal(M.search(rows,'')[0],rows[2]);assert.equal(rows.length,11);
});

test('blank search suggests recently played games, then favorites and installed games without inventing history',()=>{
 const rows=M.index({games:[{id:'alpha',title:'Alphabetical first',kind:'game',lastPlayed:0},{id:'installed',title:'Installed',kind:'game',installed:true},{id:'favorite',title:'Favorite',kind:'game',favorite:true},{id:'older',title:'Older session',kind:'game',lastPlayed:1000},{id:'recent',title:'Recent session',kind:'game',lastPlayed:2000},{id:'hidden',title:'Hidden recent',kind:'game',lastPlayed:9999,hidden:true}]});
 assert.equal(rows.find(r=>r.id==='alpha').lastPlayed,0);assert.deepEqual(M.search(rows,'').map(r=>r.id),['recent','older','favorite']);assert.equal(M.search(rows,'alphabetical')[0].id,'alpha');assert.equal(rows.some(r=>r.id==='hidden'),false);
});
