const path=require('node:path');

const STARTUP_NAME='io.github.tkokero.orbit';
const STARTUP_ARGS=Object.freeze(['--startup']);
const LEGACY_NAMES=new Set(['electron.app.Orbit','Orbit']);
const samePath=(a,b)=>typeof a==='string'&&typeof b==='string'&&path.win32.normalize(a.replace(/^"|"$/g,'')).toLowerCase()===path.win32.normalize(b.replace(/^"|"$/g,'')).toLowerCase();
const startupArgs=args=>Array.isArray(args)&&args.length===1&&args[0]==='--startup';

function startupNote({startupAvailable,launchAtLogin,startupBlocked,startupError},startMinimized){
 if(!startupAvailable)return 'Available in the packaged Windows app.';
 if(startupError)return 'Could not check Windows startup. Try turning Launch at login on again.';
 if(startupBlocked)return 'Disabled in Windows Startup Apps. Turn Launch at login on to enable it.';
 if(!launchAtLogin)return 'Orbit will not start with Windows.';
 return startMinimized?'Starts with Windows in the system tray.':'Opens Orbit when you sign in to Windows.';
}

class LoginStartup{
 constructor({app,executable=process.execPath,platform=process.platform,smoke=false}){
  this.app=app;this.executable=executable;this.available=platform==='win32'&&app.isPackaged&&!smoke;
 }
 options(name=STARTUP_NAME){return {name,path:this.executable,args:[...STARTUP_ARGS]};}
 read(){
  if(!this.available)return {launchAtLogin:false,startupAvailable:false,startupRegistered:false,startupBlocked:false};
  const value=this.app.getLoginItemSettings({path:this.executable,args:[...STARTUP_ARGS]});
  const items=(value.launchItems||[]).filter(item=>samePath(item.path,this.executable)&&startupArgs(item.args)&&(item.name===STARTUP_NAME||LEGACY_NAMES.has(item.name)));
  const registered=value.openAtLogin===true||items.length>0;
  const enabled=registered&&(items.length?items.some(item=>item.enabled!==false):value.executableWillLaunchAtLogin!==false);
  return {launchAtLogin:enabled,startupAvailable:true,startupRegistered:registered,startupBlocked:registered&&!enabled};
 }
 snapshot(settings={}){
  let state;try{state=this.read();}catch{state={launchAtLogin:false,startupAvailable:this.available,startupRegistered:false,startupBlocked:false,startupError:true};}
  return {...state,startupNote:startupNote(state,settings.startMinimized)};
 }
 set(enabled){
  if(!this.available)throw Error('Startup is available in the packaged Windows app.');
  const before=this.app.getLoginItemSettings({path:this.executable,args:[...STARTUP_ARGS]});
  this.app.setLoginItemSettings({...this.options(),openAtLogin:enabled,enabled});
  if(enabled&&!this.read().launchAtLogin)throw Error('Windows did not enable Orbit at login. Check Settings → Apps → Startup, then try again.');
  // Remove only old Orbit names for this executable; other installations are left alone.
  for(const item of before.launchItems||[]){
   if(item.scope==='user'&&LEGACY_NAMES.has(item.name)&&samePath(item.path,this.executable)&&startupArgs(item.args))this.app.setLoginItemSettings({...this.options(item.name),openAtLogin:false,enabled:false});
  }
  const result=this.read();
  if(result.launchAtLogin!==enabled)throw Error(enabled?'Windows did not enable Orbit at login. Check Windows Startup Apps.':'Another Orbit startup entry is still enabled. Check Windows Startup Apps.');
  return result;
 }
 reconcile(preference){
  const current=this.read();
  // A moved portable folder or an update can invalidate the old executable path.
  // A present, disabled registration is a Windows choice and must remain disabled.
  return this.available&&preference===true&&!current.startupRegistered?this.set(true):current;
 }
}

function backgroundInstance(args){return args.includes('--background');}
function desktopLaunch(args){return !args.includes('--background')&&(args.includes('--startup')||args.includes('--updated')||args.includes('--restart-orbit'));}
function startupQuery({args=[],restored=false,updateResume=false,migrated=false}={}){const fullRestart=args.includes('--restart-orbit');return {...(restored||updateResume&&!fullRestart||args.includes('--background')?{resume:'1',...(restored?{'restore-workspace':'1'}:{})}:{}),...(!restored&&!args.includes('--background')&&(migrated||desktopLaunch(args))?{desktop:'1'}:{})};}
function migrateDesktopStartup(store,version){
 const match=/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(String(version));
 if(!match||Number(match[1])===0&&(Number(match[2])<2||Number(match[2])===2&&Number(match[3])<6)||store.migrations?.desktopStartup026===true)return false;
 store.settings={...store.settings,startMinimized:false};
 store.migrations={...(store.migrations&&typeof store.migrations==='object'&&!Array.isArray(store.migrations)?store.migrations:{}),desktopStartup026:true};
 return true;
}
function startupWindowAction({args,startMinimized,trayAvailable}){
 if(!args.includes('--startup')||!startMinimized)return 'show';
 return trayAvailable?'tray':'minimized';
}

module.exports={LoginStartup,STARTUP_NAME,STARTUP_ARGS,backgroundInstance,startupWindowAction,startupNote,desktopLaunch,migrateDesktopStartup,startupQuery};
