const {FEED,RELEASES}=require('./release-config.cjs');
const INSTALLER=RELEASES;
const CHECK_INTERVAL=6*60*60*1000,RETRY_DELAYS=[2,5,15,60].map(minutes=>minutes*60000);
async function installerDestination(fetchImpl=fetch){
 try{
  const response=await fetchImpl(FEED+'/latest.yml',{signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('Update feed unavailable.');
  const source=await response.text();if(source.length>65536)throw Error('Invalid update feed.');
  const info=require('yaml').parse(source),file=info.files?.find(f=>typeof f.url==='string'&&/Orbit-Setup\.exe$/i.test(f.url))?.url||info.path;
  const url=new URL(file,FEED+'/');
  if(url.origin!=='https://github.com'||!/^\/tkokero\/Orbit\/releases\/download\/[^/]+\/Orbit-Setup\.exe$/.test(url.pathname)||url.search||url.hash||url.username||url.password)throw Error('Invalid installer destination.');
  return url.href;
 }catch{return RELEASES;}
}
function releaseText(value){return (Array.isArray(value)?value.filter(x=>x&&typeof x==='object').map(x=>(x.version?String(x.version)+'\n':'')+String(x.note||'')).join('\n\n'):typeof value==='string'?value:'').replace(/<[^>]*>/g,'').slice(0,16000);}
function updateError(error){const value=String(error?.message||error);return /404/.test(value)&&/latest\.yml|channel|update info/.test(value)?'Update information is not published yet.':'Could not check for updates. Try again later.';}
class OrbitUpdater{
 constructor({driver=null,version,settings=()=>({}),beforeRestart=async()=>{},canRestart=async()=>true,restartFailed=()=>{},notify=()=>{},timers={setTimeout,clearTimeout}}){
  this.generation=0;this.checkingGeneration=0;this.driver=driver;this.settings=settings;this.beforeRestart=beforeRestart;this.canRestart=canRestart;this.postponedUntil=0;this.restartFailed=restartFailed;this.notify=notify;this.timers=timers;this.inflight=null;this.checkTimer=null;this.restartTimer=null;this.restarting=false;this.autoChecking=false;this.retryCount=0;this.retryScheduled=false;this.downloadTask=null;
  this.state={supported:Boolean(driver),phase:driver?'idle':'installer-required',version,latest:null,percent:0,releaseNotes:'',downloaded:false,postponedUntil:0,message:driver?'Ready to check for updates.':'Install Orbit once to enable automatic updates.'};
  if(!driver)return;
  driver.autoDownload=true;driver.autoInstallOnAppQuit=false;driver.allowPrerelease=true;driver.allowDowngrade=false;
  driver.setFeedURL({provider:'generic',url:FEED,channel:'latest'});driver.channel='latest';driver.allowDowngrade=false;driver.autoRunAppAfterInstall=true;
  driver.on('checking-for-update',()=>this.emit({phase:'checking',message:'Checking for updates…'}));
  driver.on('update-not-available',()=>{this.resetRetry();this.emit({phase:'current',message:'Orbit is up to date.'});});
  driver.on('update-available',info=>this.emit({phase:'available',latest:info.version,releaseNotes:releaseText(info.releaseNotes),downloaded:false,percent:0,message:'A new version is downloading in the background.'}));
  driver.on('download-progress',progress=>this.emit({phase:'downloading',percent:Math.min(100,Math.max(0,Math.round(progress.percent||0))),message:'Downloading update…'}));
  driver.on('update-downloaded',info=>{this.resetRetry();this.emit({phase:'ready',latest:info.version,releaseNotes:releaseText(info.releaseNotes)||this.state.releaseNotes,downloaded:true,percent:100,message:'Update ready.'});this.planRestart();});
  driver.on('error',error=>this.failed(error));
 }
 snapshot(){return {...this.state};}
 emit(change){Object.assign(this.state,change);this.notify(this.snapshot());}
 failed(error){
  this.generation++;if(this.restarting){this.restarting=false;this.restartFailed();}if(this.restartTimer){this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;}
  this.emit({phase:'error',message:/404/.test(String(error?.message||error))?updateError(error):'Update interrupted. Your current app is unchanged.'});
  if(this.autoChecking&&this.settings().autoUpdates!==false&&!this.state.downloaded&&!this.retryScheduled){const delay=RETRY_DELAYS[Math.min(this.retryCount++,RETRY_DELAYS.length-1)];this.scheduleCheck(delay,true);this.emit({message:'Update interrupted. Retrying in '+delay/60000+' minutes.'});}
 }
 resetRetry(){this.retryCount=0;if(this.retryScheduled)this.scheduleCheck(CHECK_INTERVAL);}
 scheduleCheck(delay,retry=false){
  if(this.checkTimer)this.timers.clearTimeout(this.checkTimer);this.checkTimer=null;this.retryScheduled=false;
  if(!this.autoChecking||!this.driver||this.settings().autoUpdates===false||this.restarting)return;
  const generation=this.checkingGeneration;this.retryScheduled=retry;
  this.checkTimer=this.timers.setTimeout(async()=>{if(generation!==this.checkingGeneration)return;this.checkTimer=null;this.retryScheduled=false;await this.check();if(generation===this.checkingGeneration&&!this.checkTimer)this.scheduleCheck(CHECK_INTERVAL);},delay);this.checkTimer.unref?.();
 }
 async check(){
  if(!this.driver||this.restarting||this.state.downloaded||this.downloadTask||['downloading','ready'].includes(this.state.phase))return this.snapshot();
  if(this.inflight)return this.inflight;
  this.emit({phase:'checking',message:'Checking for updates…'});
  this.inflight=(async()=>{try{const result=await this.driver.checkForUpdates();if(result?.downloadPromise){const task=this.downloadTask=result.downloadPromise;void task.catch(error=>{if(this.state.phase!=='error')this.failed(error);}).finally(()=>{if(this.downloadTask===task)this.downloadTask=null;});}}catch(error){if(this.state.phase!=='error')this.failed(error);}return this.snapshot();})();
  try{return await this.inflight;}finally{this.inflight=null;}
 }
 start(){this.stopChecking();if(!this.driver||this.settings().autoUpdates===false)return;this.autoChecking=true;this.retryCount=0;this.scheduleCheck(1000);}
 stopChecking(){this.checkingGeneration++;this.autoChecking=false;this.retryScheduled=false;if(this.checkTimer){this.timers.clearTimeout(this.checkTimer);this.checkTimer=null;}}
 settingsChanged(){this.start();if(this.settings().autoUpdates===false||this.settings().restartForUpdates===false){if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;if(this.state.phase==='ready')this.emit({message:'Update ready. Restart when convenient.'});}else if(this.state.phase==='ready')this.planRestart();}
 postpone(minutes=60){
  if(!this.state.downloaded||this.restarting)return this.snapshot();
  if(![15,60,240].includes(minutes))throw Error('Choose 15 minutes, 1 hour, or 4 hours.');
  this.postponedUntil=Date.now()+minutes*60000;if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;
  this.emit({phase:'ready',postponedUntil:this.postponedUntil,message:'Update ready. Automatic restart postponed.'});this.planRestart();return this.snapshot();
 }
 planRestart(delay=5000){
  if(this.restartTimer||this.restarting||!this.state.downloaded||this.settings().autoUpdates===false||this.settings().restartForUpdates===false)return;
  const remaining=this.postponedUntil-Date.now();if(remaining>0)delay=Math.max(delay,remaining);
  if(remaining<=0&&delay===5000)this.emit({message:'Update ready. Orbit will restart in 5 seconds. Your games will keep running.'});
  this.restartTimer=this.timers.setTimeout(()=>{this.restartTimer=null;this.restart(true).catch(()=>{});},delay);this.restartTimer.unref?.();
 }
 async restart(automatic=false){
  if(!this.driver||!this.state.downloaded||this.restarting||this.checkingRestart)return this.snapshot();
  if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;
  if(automatic&&this.postponedUntil>Date.now()){this.planRestart();return this.snapshot();}
  // Wait only for Orbit's own file operations and startup, without closing games.
  const generation=this.generation;this.checkingRestart=true;let allowed;try{allowed=await this.canRestart();}catch{this.checkingRestart=false;this.emit({phase:'ready',message:'Could not prepare Orbit for the update. Try again.'});return this.snapshot();}this.checkingRestart=false;
  if(generation!==this.generation)return this.snapshot();
  if(!allowed){this.emit({phase:'ready',message:'Update ready. Waiting for Orbit to finish its current task.'});this.planRestart(60000);return this.snapshot();}
  if(automatic&&this.postponedUntil>Date.now()){this.planRestart();return this.snapshot();}
  if(automatic&&(this.settings().autoUpdates===false||this.settings().restartForUpdates===false))return this.snapshot();
  this.restarting=true;this.stopChecking();this.emit({phase:'restarting',postponedUntil:0,message:'Saving and restarting Orbit…'});
  try{await this.beforeRestart({automatic});this.driver.quitAndInstall(true,true);}catch(error){this.restarting=false;this.restartFailed();this.emit({phase:'error',message:'Could not restart for the update. Retry when ready. '+String(error.message||error).slice(0,240)});}return this.snapshot();
 }
 stop(){this.generation++;this.stopChecking();if(this.restartTimer)this.timers.clearTimeout(this.restartTimer);this.restartTimer=null;}
}
module.exports={OrbitUpdater,FEED,INSTALLER,installerDestination,releaseText,updateError};
