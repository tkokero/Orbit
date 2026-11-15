const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{EventEmitter}=require('node:events');
const {Clips}=require('../src/clips.cjs'),{preferences,hotkey,available}=require('../src/clips-settings.cjs'),{sameOwner,gameSource}=require('../src/clips-window.cjs');
const started='2026-11-04T20:00:00.000Z',game={id:'apex',title:'Apex Legends',pid:99,processStarted:started,windowHandle:'44',activity:'foreground'},source={id:'window:44:0',name:'Apex Legends'};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function fixture(run){
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-clip-lifecycle-')),keys=new Map(),events=[],children=[],requests=[];let sources=[source];
 const globalShortcut={register:(key,fn)=>{if(keys.has(key))return false;keys.set(key,fn);return true;},unregister:key=>keys.delete(key)};
 const launch=()=>{const child=new EventEmitter();Object.assign(child,{connected:true,exitCode:null,send(message,done){requests.push(message);done?.();setImmediate(async()=>{
   let data=true;if(message.cmd==='save'){const name='Orbit Apex fixture.mp4',file=path.join(folder,name);await fs.writeFile(file,'fixture video');data={name,path:file,seconds:28,createdAt:Date.now()};}
   child.emit('message',{id:message.id,data});if(message.cmd==='stop')setImmediate(()=>{child.connected=false;child.exitCode=0;child.emit('exit',0);});
  });},kill(){child.connected=false;child.exitCode=1;child.emit('exit',1);}});children.push(child);return child;};
 const clips=new Clips({folder,root:path.join(folder,'buffer'),desktopCapturer:{getSources:async()=>sources},globalShortcut,identity:async()=>({pid:99,started}),launch,notify:s=>events.push(s),persist:async value=>fs.writeFile(path.join(folder,'settings.json'),JSON.stringify(value))});
 try{await run({clips,keys,children,events,requests,folder,setSources:value=>sources=value});}finally{await clips.stop();await fs.rm(folder,{recursive:true,force:true});}
}
test('capture preferences normalize shortcuts, reject conflicts, and keep release capability explicit',()=>{
 assert.equal(hotkey('ctrl + shift + f8'),'Control+Shift+F8');assert.equal(preferences().saveHotkey,'F8');
 assert.throws(()=>preferences({saveHotkey:'F8',stopHotkey:'f8'}),/different/);assert.throws(()=>hotkey('A'),/function key/);assert.throws(()=>hotkey('Ctrl+Ctrl+F8'),/function key/);
 assert.equal(available('0.2.8'),false);assert.equal(available('0.3.0-dev.1'),true);assert.equal(available('0.3.0'),false);
});
test('invalid capture preferences cannot prevent Orbit from opening or overwrite saved choices',()=>{
 let persisted=false;const clips=new Clips({folder:os.tmpdir(),settings:{saveHotkey:'bad shortcut'},persist:async()=>persisted=true});
 assert.equal(clips.state.phase,'error');assert.equal(clips.armed,false);assert.equal(persisted,false);assert.match(clips.state.message,/Saved data has been kept/);
});
test('game matching uses verified window handles, never titles or a display fallback',()=>{
 assert.equal(gameSource([game],[{id:'screen:0:0',name:game.title}]),null);
 assert.equal(gameSource([game],[{id:'window:88:0',name:game.title}]),null);
 assert.equal(gameSource([game],[source]).game.id,'apex');
 assert.equal(gameSource([{...game,activity:'minimized'}],[source]),null);
 assert.equal(sameOwner({pid:99,started},{pid:99,started:'2026-11-04T20:00:01Z'}),false);
});
test('enabling game capture waits without launching a recorder or silently capturing a display',()=>fixture(async({clips,children,setSources})=>{
 clips.arm();await clips.observe([]);assert.equal(clips.snapshot().phase,'waiting');assert.equal(children.length,0);
 setSources([{id:'screen:0:0',name:game.title}]);await clips.observe([game]);assert.equal(children.length,0);await clips.stop();assert.equal(clips.armed,false);
}));
test('detected games start capture, retain the current game across focus changes, and stop after exit',()=>fixture(async({clips,children,requests,keys})=>{
 clips.arm();await clips.observe([game]);await tick();await clips.reconciling;
 assert.equal(clips.state.phase,'recording');assert.equal(children.length,1);assert.equal(requests[0].input.sourceId,source.id);assert.equal(requests[0].input.owner.pid,99);
 await clips.observe([{...game,activity:'background'}]);assert.equal(children.length,1);
 await clips.observe([]);assert.equal(children[0].exitCode,0);assert.equal(clips.state.phase,'waiting');assert.equal(clips.child,null);assert.ok(keys.has('F8'));
 await clips.stop();assert.equal(keys.size,0);assert.equal(clips.state.phase,'off');
}));
test('a conflicting shortcut prevents capture and never unregisters another app shortcut',()=>fixture(async({clips,keys,children})=>{
 keys.set('Control+Alt+F9',()=>{});await assert.rejects(clips.start({sourceId:source.id}),/already in use/);
 assert.equal(children.length,0);assert.equal(keys.has('F8'),false);assert.equal(keys.has('Control+Alt+F9'),true);
}));
test('overlapping starts cannot create two recorders and Stop cancels pending discovery',()=>fixture(async({clips,children})=>{
 let resolveSources;clips.desktopCapturer.getSources=()=>new Promise(resolve=>resolveSources=resolve);
 const start=clips.start({sourceId:source.id});await assert.rejects(clips.start({sourceId:source.id}),/Stop clipping/);
 const stopped=clips.stop();resolveSources([source]);await assert.rejects(start,/cancelled/);await stopped;
 assert.equal(children.length,0);assert.equal(clips.state.phase,'off');
}));
test('a changed window owner blocks automatic capture and is not repeatedly retried',()=>fixture(async({clips,children})=>{
 clips.identity=async()=>({pid:100,started});clips.arm();await clips.observe([game]);await tick();await clips.reconciling;
 assert.equal(clips.state.phase,'error');assert.equal(children.length,0);await clips.observe([game]);assert.equal(children.length,0);
}));
test('saved settings survive a reload while automatic capture always starts disabled',()=>fixture(async({clips,folder})=>{
 await clips.configure({seconds:120,height:1080,fps:60,audio:false,saveHotkey:'Ctrl+F8',mode:'games'});
 const stored=JSON.parse(await fs.readFile(path.join(folder,'settings.json'))),copy=new Clips({folder,settings:stored});
 assert.equal(copy.settings.fps,60);assert.equal(copy.settings.saveHotkey,'Control+F8');assert.equal(copy.armed,false);assert.equal(copy.state.phase,'off');
}));

test('live rebinding keeps the recorder and replaces only shortcut registrations',()=>fixture(async({clips,keys,children,folder})=>{
 clips.arm();await clips.observe([game]);await clips.reconciling;
 const recorder=clips.child,original={...clips.settings};
 await clips.configure({...clips.settings,saveHotkey:'Ctrl+Shift+F10',stopHotkey:'Ctrl+Shift+F11'});
 assert.equal(clips.child,recorder);assert.equal(children.length,1);assert.equal(clips.state.phase,'recording');
 assert.deepEqual([...keys.keys()].sort(),['Control+Shift+F10','Control+Shift+F11']);
 const stored=JSON.parse(await fs.readFile(path.join(folder,'settings.json')));assert.equal(stored.saveHotkey,'Control+Shift+F10');
 const {saveHotkey,stopHotkey,...rest}=clips.settings,{saveHotkey:oldSave,stopHotkey:oldStop,...oldRest}=original;assert.deepEqual(rest,oldRest);
 let saved=0,stopped=0;clips.save=async()=>saved++;const stop=clips.stop.bind(clips);clips.stop=async()=>{stopped++;return stop();};
 keys.get('Control+Shift+F10')();assert.equal(saved,1);keys.get('Control+Shift+F11')();await tick();assert.equal(stopped,1);
}));

test('shortcut conflicts keep the old live bindings and release only newly reserved keys',()=>fixture(async({clips,keys})=>{
 clips.arm();const occupied=()=>{};keys.set('Control+F10',occupied);const before={...clips.settings};
 await assert.rejects(clips.configure({...before,saveHotkey:'F11',stopHotkey:'Ctrl+F10'}),/already in use/);
 assert.deepEqual(clips.settings,before);assert(keys.has('F8'));assert(keys.has('Control+Alt+F9'));assert(!keys.has('F11'));assert.equal(keys.get('Control+F10'),occupied);assert(clips.armed);
}));

test('failed preference writes retain old shortcuts, and swapping bindings changes their actions',()=>fixture(async({clips,keys})=>{
 clips.arm();const persist=clips.persist;clips.persist=async()=>{throw Error('Disk full');};
 await assert.rejects(clips.configure({...clips.settings,saveHotkey:'F10',stopHotkey:'F11'}),/Disk full/);
 assert.deepEqual([...keys.keys()].sort(),['Control+Alt+F9','F8']);assert.equal(clips.settings.saveHotkey,'F8');
 clips.persist=persist;await clips.configure({...clips.settings,saveHotkey:'Control+Alt+F9',stopHotkey:'F8'});
 let saved=0;clips.save=async()=>saved++;keys.get('Control+Alt+F9')();assert.equal(saved,1);assert(clips.armed);keys.get('F8')();await tick();assert(!clips.armed);
}));

test('idle shortcut edits check availability but leave no global keys registered',()=>fixture(async({clips,keys,folder})=>{
 await clips.configure({...clips.settings,saveHotkey:'F10',stopHotkey:'F11'});assert.equal(keys.size,0);
 const copy=new Clips({folder,settings:JSON.parse(await fs.readFile(path.join(folder,'settings.json')))});assert.equal(copy.settings.saveHotkey,'F10');assert.equal(copy.settings.stopHotkey,'F11');assert(!copy.armed);
 keys.set('F12',()=>{});await assert.rejects(clips.configure({...clips.settings,saveHotkey:'F12'}),/already in use/);assert.equal(clips.settings.saveHotkey,'F10');assert.equal(keys.size,1);
}));

test('Stop during a pending binding save leaves no shortcuts, and concurrent edits cannot race',()=>fixture(async({clips,keys})=>{
 clips.arm();let finish;clips.persist=()=>new Promise(resolve=>finish=resolve);
 const changing=clips.configure({...clips.settings,saveHotkey:'F10',stopHotkey:'F11'});
 await assert.rejects(clips.configure({...clips.settings,saveHotkey:'F12'}),/Wait/);
 await clips.stop();finish();await changing;assert.equal(keys.size,0);assert(!clips.armed);assert.equal(clips.settings.saveHotkey,'F10');
}));

test('live shortcut editing cannot change recording quality or accept duplicate bindings',()=>fixture(async({clips,keys})=>{
 clips.arm();await assert.rejects(clips.configure({...clips.settings,height:1080,saveHotkey:'F10'}),/Stop clipping/);
 await assert.rejects(clips.configure({...clips.settings,saveHotkey:'F8',stopHotkey:'F8'}),/different/);
 assert.deepEqual([...keys.keys()].sort(),['Control+Alt+F9','F8']);
}));
test('saving a replay keeps recording and associates only the saved clip with the detected game',()=>fixture(async({clips,folder})=>{
 clips.arm();await clips.observe([game]);await tick();await clips.reconciling;const first=clips.save();await assert.rejects(clips.save(),/already/);const saved=await first;
 assert.equal(clips.state.phase,'recording');const rows=await clips.list();assert.equal(rows[0].gameId,'apex');assert.equal(rows[0].seconds,28);
 assert.equal(await clips.file(saved.name),path.join(folder,saved.name));assert.match(await clips.media(saved.name),/^file:/);
 await assert.rejects(clips.file('../other.mp4'),/Choose/);await assert.rejects(clips.file('Unknown.mp4'),/Choose/);
 await fs.unlink(saved.path);await assert.rejects(clips.file(saved.name));
}));
