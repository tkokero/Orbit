const test=require('node:test'),assert=require('node:assert/strict');
const {LoginStartup,STARTUP_NAME,backgroundInstance,startupWindowAction,startupNote}=require('../src/login-startup.cjs');
const executable='C:\\Users\\Player\\AppData\\Local\\Programs\\Orbit\\Orbit.exe';

function fixture(initial=[],options={}){
 let rows=structuredClone(initial);const calls=[];
 const app={isPackaged:true,getLoginItemSettings(query){
  assert.equal(query.path,executable);assert.deepEqual(query.args,['--startup']);
  const matches=rows.filter(r=>r.path.toLowerCase()===query.path.toLowerCase());
  return {openAtLogin:matches.some(r=>JSON.stringify(r.args)===JSON.stringify(query.args)),executableWillLaunchAtLogin:matches.some(r=>r.enabled),launchItems:structuredClone(matches)};
 },setLoginItemSettings(value){calls.push(value);if(options.failWrite)return;rows=rows.filter(r=>r.name!==value.name);if(value.openAtLogin)rows.push({name:value.name,path:value.path,args:value.args,scope:'user',enabled:value.enabled});}};
 return {manager:new LoginStartup({app,executable,platform:'win32',...options}),calls,rows:()=>rows,app};
}
const entry=(value={})=>({name:STARTUP_NAME,path:executable,args:['--startup'],scope:'user',enabled:true,...value});

test('registers a stable, explicit startup name and verifies Windows enabled it',()=>{
 const {manager,calls}=fixture();assert.equal(manager.read().launchAtLogin,false);
 assert.equal(manager.set(true).launchAtLogin,true);
 assert.deepEqual(calls[0],{name:STARTUP_NAME,path:executable,args:['--startup'],openAtLogin:true,enabled:true});
 assert.equal(manager.set(false).launchAtLogin,false);
});
test('reports a Task Manager disabled entry as blocked, even when its Run command exists',()=>{
 const {manager,calls}=fixture([entry({enabled:false})]);
 assert.deepEqual(manager.read(),{launchAtLogin:false,startupAvailable:true,startupRegistered:true,startupBlocked:true});
 manager.reconcile(true);assert.equal(calls.length,0);
 assert.match(manager.snapshot().startupNote,/Disabled in Windows/);
 assert.equal(manager.set(true).launchAtLogin,true);
});
test('another argument list cannot make a disabled startup entry appear enabled',()=>{
 const {manager}=fixture([entry({enabled:false}),entry({name:'OrbitShortcut',args:['--launch-game','id'],enabled:true})]);
 assert.equal(manager.read().launchAtLogin,false);
});
test('enabling consolidates legacy names for this executable without changing other installs',()=>{
 const {manager,rows,calls}=fixture([entry({name:'electron.app.Orbit'}),entry({name:'Orbit',path:'D:\\Other Orbit\\Orbit.exe'})]);
 manager.set(true);assert.deepEqual(rows().map(r=>r.name).sort(),['Orbit',STARTUP_NAME].sort());
 assert.equal(calls.some(c=>c.name==='Orbit'),false);
});
test('turning startup off also removes a matching legacy registration',()=>{
 const {manager,rows}=fixture([entry(),entry({name:'electron.app.Orbit'})]);
 manager.set(false);assert.equal(rows().length,0);
});
test('a saved startup preference repairs a moved executable, but never opts users in',()=>{
 const {manager,calls}=fixture([entry({path:'D:\\Previous Orbit\\Orbit.exe'})]);
 manager.reconcile(undefined);manager.reconcile(false);assert.equal(calls.length,0);
 assert.equal(manager.reconcile(true).launchAtLogin,true);
});
test('an external Windows enable is respected when the old preference was off',()=>{
 const {manager,calls}=fixture([entry()]);assert.equal(manager.reconcile(false).launchAtLogin,true);assert.equal(calls.length,0);
});
test('failed registration is reported and never removes a legacy entry',()=>{
 const {manager,calls}=fixture([entry({name:'electron.app.Orbit',enabled:false})],{failWrite:true});
 assert.throws(()=>manager.set(true),/Windows did not enable/);assert.equal(calls.length,1);
});
test('development, smoke checks, and non-Windows builds cannot modify login items',()=>{
 for(const options of [{smoke:true},{platform:'linux'}]){
  const {manager,calls}=fixture([],options);assert.equal(manager.snapshot().startupAvailable,false);assert.throws(()=>manager.set(true),/packaged Windows/);assert.equal(calls.length,0);
 }
 const {manager,app,calls}=fixture();app.isPackaged=false;
 const development=new LoginStartup({app,executable,platform:'win32'});assert.equal(development.read().startupAvailable,false);assert.equal(calls.length,0);
});
test('read failures produce a useful status instead of breaking Settings',()=>{
 const {manager,app}=fixture();app.getLoginItemSettings=()=>{throw Error('Registry unavailable')};
 assert.equal(manager.snapshot().startupError,true);assert.match(manager.snapshot().startupNote,/Could not check/);
});
test('startup visibility keeps normal launches visible and offers a fallback if no tray exists',()=>{
 assert.equal(startupWindowAction({args:['Orbit.exe'],startMinimized:true,trayAvailable:true}),'show');
 assert.equal(startupWindowAction({args:['Orbit.exe','--startup'],startMinimized:false,trayAvailable:true}),'show');
 assert.equal(startupWindowAction({args:['Orbit.exe','--startup'],startMinimized:true,trayAvailable:true}),'tray');
 assert.equal(startupWindowAction({args:['Orbit.exe','--startup'],startMinimized:true,trayAvailable:false}),'minimized');
 assert.match(startupNote({startupAvailable:true,launchAtLogin:true},true),/system tray/);
 assert.match(startupNote({startupAvailable:true,launchAtLogin:true},false),/Opens Orbit/);
});
test('login and manual opens are visible requests while explicit background launches stay quiet',()=>{
 assert.equal(backgroundInstance(['Orbit.exe','--startup']),false);
 assert.equal(backgroundInstance(['Orbit.exe','--background']),true);
 assert.equal(backgroundInstance(['Orbit.exe']),false);
 assert.equal(backgroundInstance(['Orbit.exe','--launch-game','steam:123']),false);
});

test('0.2.6 migrates only the old start-minimized preference and preserves other data',()=>{
 const {migrateDesktopStartup}=require('../src/login-startup.cjs'),store={settings:{startMinimized:true,launchAtLogin:false,closeToTray:true,rememberAccounts:true},preferences:{one:{favorite:true}},themes:['custom'],migrations:{previous:true}};
 assert.equal(migrateDesktopStartup(store,'0.2.5'),false);assert.equal(store.settings.startMinimized,true);
 assert.equal(migrateDesktopStartup(store,'0.2.6'),true);assert.equal(store.settings.startMinimized,false);assert.equal(store.settings.launchAtLogin,false);assert.equal(store.settings.closeToTray,true);assert.deepEqual(store.preferences,{one:{favorite:true}});assert.deepEqual(store.themes,['custom']);assert.equal(store.migrations.previous,true);
 store.settings.startMinimized=true;assert.equal(migrateDesktopStartup(store,'0.2.7'),false);assert.equal(store.settings.startMinimized,true);
});

test('automatic starts and update launches request Desktop without affecting explicit background or renderer restoration',()=>{
 const {startupQuery}=require('../src/login-startup.cjs');
 assert.deepEqual(startupQuery({args:['--startup']}),{desktop:'1'});
 assert.deepEqual(startupQuery({args:['--updated'],updateResume:true}),{resume:'1',desktop:'1'});
 assert.deepEqual(startupQuery({args:['--restart-orbit'],updateResume:true}),{desktop:'1'});
 assert.deepEqual(startupQuery({args:['--restart-orbit'],restored:true,updateResume:true}),{resume:'1'});
 assert.deepEqual(startupQuery({migrated:true}),{desktop:'1'});
 assert.deepEqual(startupQuery({args:['--background'],migrated:true}),{resume:'1'});
 assert.deepEqual(startupQuery({args:['--startup'],restored:true}),{resume:'1'});
 assert.deepEqual(startupQuery({args:[]}),{});
});
