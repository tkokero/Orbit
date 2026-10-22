const LIMITS=new Set([3,5,10]);
function policy(input={}){if(!input||typeof input!=='object'||!LIMITS.has(input.keep))throw Error('Keep 3, 5, or 10 automatic backups.');return {afterExit:input.afterExit===true,keep:input.keep};}
class BackupScheduler{
 constructor({backups,checkClosed,notify=()=>{},clock=Date.now,delay=20000,setTimer=setTimeout,clearTimer=clearTimeout}){Object.assign(this,{backups,checkClosed,notify,clock,delay,setTimer,clearTimer});this.active=new Set();this.pending=new Map();this.status=new Map();this.running=false;this.stopped=false;}
 observe(sessions){if(this.stopped)return;const live=new Set(sessions.map(s=>s.id));for(const id of live){const pending=this.pending.get(id);if(pending)this.clearTimer(pending.timer);this.pending.delete(id);}for(const id of this.active)if(!live.has(id)&&this.backups.schedule(id).afterExit)this.queue(id);this.active=live;}
 queue(id,retries=0){if(this.stopped||this.pending.has(id))return;this.status.set(id,{phase:'waiting',at:this.clock(),message:'Waiting for save files to settle.'});const timer=this.setTimer(()=>{this.pending.delete(id);this.run(id,retries).catch(()=>{});},this.delay);timer?.unref?.();this.pending.set(id,{timer,retries});}
 async run(id,retries=0){if(this.stopped||!this.backups.schedule(id).afterExit)return;if(this.running||this.backups.busy){if(retries<3)this.queue(id,retries+1);else this.finish(id,'error','Backup deferred too often. Use Back up now.');return;}this.running=true;try{if(!await this.checkClosed(id)){this.finish(id,'skipped','Game or local timer is still running.');return;}if(this.stopped||!this.backups.schedule(id).afterExit)return;this.status.set(id,{phase:'saving',at:this.clock(),message:'Backing up saves.'});const result=await this.backups.createAutomatic(id);this.finish(id,'complete',result.unchanged?'Saves unchanged; existing snapshot kept.':'Automatic save backup created.');}catch(error){this.finish(id,'error',error.message);}finally{this.running=false;}}
 finish(id,phase,message){const status={phase,message:String(message).slice(0,500),at:this.clock()};if(this.status.size>=100)this.status.delete(this.status.keys().next().value);this.status.set(id,status);this.notify({id,...status});}
 cancel(id){const job=this.pending.get(id);if(job)this.clearTimer(job.timer);this.pending.delete(id);this.status.delete(id);}
 snapshot(id){return this.status.get(id)||null;}
 stop(){this.stopped=true;for(const {timer}of this.pending.values())this.clearTimer(timer);this.pending.clear();}
}
module.exports={BackupScheduler,policy};
