const FEED='https://github.com/tkokero/Orbit/releases/download/v1.0.0-pre.1';
const INSTALLER=FEED+'/Orbit-Setup.exe';
class OrbitUpdater{
 constructor({driver=null,version,settings=()=>({}),beforeRestart=async()=>{},restartFailed=()=>{},notify=()=>{},timers={setTimeout,clearTimeout}}){
  this.driver=driver;this.settings=settings;this.beforeRestart=beforeRestart;this.restartFailed=restartFailed;this.notify=notify;this.timers=timers;this.inflight=null;this.checkTimer=null;this.restartTimer=null;this.restarting=false;
  this.state={supported:Boolean(driver),phase:driver?'idle':'installer-required',version,latest:null,percent:0,message:driver?'Ready to check for updates.':'Install Orbit once to enable automatic updates.'};
  if(!driver)return;
  driver.autoDownload=true;driver.autoInstallOnAppQuit=false;driver.allowPrerelease=true;driver.allowDowngrade=false;
  driver.setFeedURL({provider:'generic',url:FEED,channel:'latest'});driver.channel='latest';driver.allowDowngrade=false;driver.autoRunAppAfterInstall=true;
  driver.on('checking-for-update',()=>this.emit({phase:'checking',message:'Checking for updates…'}));
  driver.on('update-not-available',()=>this.emit({phase:'current',message:'Orbit is up to date.'}));
  driver.on('update-available',info=>this.emit({phase:'available',latest:info.version,percent:0,message:'A new version is downloading in the background.'}));
  driver.on('download-progress',progress=>this.emit({phase:'downloading',percent:Math.min(100,Math.max(0,Math.round(progress.percent||0))),message:'Downloading update…'}));
  driver.on('update-downloaded',info=>{this.emit({phase:'ready',latest:info.version,percent:100,message:'Update ready.'});this.planRestart();});
  driver.on('error',error=>{if(this.restarting){this.restarting=false;this.restartFailed();}if(this.restartTimer){this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;}this.emit({phase:'error',message:'Update failed. Your current app is unchanged. '+String(error.message||error).slice(0,240)});});
 }
 snapshot(){return {...this.state};}
 emit(change){Object.assign(this.state,change);this.notify(this.snapshot());}
 async check(){
  if(!this.driver||this.restarting||['downloading','ready'].includes(this.state.phase))return this.snapshot();
  if(this.inflight)return this.inflight;
  this.inflight=(async()=>{try{const result=await this.driver.checkForUpdates();result?.downloadPromise?.catch(()=>{});}catch(error){this.emit({phase:'error',message:'Could not check for updates. '+String(error.message||error).slice(0,240)});}return this.snapshot();})();
  try{return await this.inflight;}finally{this.inflight=null;}
 }
 start(){this.stopChecking();if(!this.driver||this.settings().autoUpdates===false)return;const tick=async()=>{this.checkTimer=null;await this.check();if(this.settings().autoUpdates!==false&&!this.restarting){this.checkTimer=this.timers.setTimeout(tick,6*60*60*1000);this.checkTimer.unref?.();}};this.checkTimer=this.timers.setTimeout(tick,15000);this.checkTimer.unref?.();}
 stopChecking(){if(this.checkTimer){this.timers.clearTimeout(this.checkTimer);this.checkTimer=null;}}
 settingsChanged(){this.start();if(this.settings().autoUpdates===false||this.settings().restartForUpdates===false){if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;if(this.state.phase==='ready')this.emit({message:'Update ready. Restart when convenient.'});}else if(this.state.phase==='ready')this.planRestart();}
 planRestart(){if(this.restartTimer||this.restarting||this.settings().autoUpdates===false||this.settings().restartForUpdates===false)return;this.emit({message:'Update ready. Orbit will restart in 5 seconds.'});this.restartTimer=this.timers.setTimeout(()=>{this.restartTimer=null;this.restart().catch(()=>{});},5000);this.restartTimer.unref?.();}
 async restart(){
  if(!this.driver||this.state.phase!=='ready'||this.restarting)return this.snapshot();
  if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;this.restarting=true;this.stopChecking();this.emit({phase:'restarting',message:'Saving and restarting Orbit…'});
  try{await this.beforeRestart();this.driver.quitAndInstall(true,true);}catch(error){this.restarting=false;this.restartFailed();this.emit({phase:'error',message:'Could not restart for the update. '+String(error.message||error).slice(0,240)});}return this.snapshot();
 }
 stop(){this.stopChecking();if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;}
}
module.exports={OrbitUpdater,FEED,INSTALLER};
