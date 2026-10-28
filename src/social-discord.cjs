const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const ERRORS={permissions:'Discord returned broader permissions than Orbit requested. This connection was not saved.',authorization:'Discord sign-in was cancelled or access was denied. Try connecting again.',connection:'Could not connect to Discord. Check your connection and try again.','secure-storage':'Windows could not save this connection securely. Try without Remember.',busy:'Discord sign-in is already open.',cancelled:'Discord connection was cancelled.'};
function developmentFriendsEnabled(version){return /^\d+\.\d+\.\d+-dev\.\d+$/.test(String(version));}
const METHODS=new Set(['connect','resume','snapshot','token','forget','disconnect','close']);
class DiscordSdkBridge {
 constructor({directory,userData,spawnImpl=spawn,timeout=15000,allowUnverified=false}={}){this.allowUnverified=allowUnverified;this.directory=directory;this.vault=path.join(userData,'discord-friends.dpapi');this.spawn=spawnImpl;this.timeout=timeout;this.child=null;this.pending=new Map();this.sequence=0;}
 available(){let verified=false;try{const metadata=JSON.parse(fs.readFileSync(path.join(this.directory,'integration.json'),'utf8')),scopes=metadata.requestedScopes;verified=metadata.friendsReadOnlyVerified===true&&Array.isArray(scopes)&&scopes.length===2&&scopes.includes('identify')&&scopes.includes('relationships.read')&&metadata.transport==='authenticated-desktop-ipc';}catch{}return (verified||this.allowUnverified)&&['orbit-discord.exe','discord_partner_sdk.dll'].every(name=>fs.existsSync(path.join(this.directory,name)));}
 saved(){return fs.existsSync(this.vault);}
 start(){
  if(this.child)return;
  if(!this.available())throw Error('Discord friends support is not included in this build.');
  const child=this.spawn(path.join(this.directory,'orbit-discord.exe'),[this.vault,String(process.pid)],{cwd:this.directory,windowsHide:true,shell:false,stdio:['pipe','pipe','ignore']});this.child=child;
  let buffer='';const lost=()=>{if(this.child!==child)return;this.child=null;for(const task of this.pending.values()){clearTimeout(task.timer);task.reject(Error('Discord connection closed. Try connecting again.'));}this.pending.clear();};
  child.on('error',lost);child.on('exit',lost);child.stdin.on('error',lost);
  child.stdout.setEncoding('utf8');child.stdout.on('data',part=>{buffer+=part;if(Buffer.byteLength(buffer)>8*1024*1024){child.kill();lost();return;}let index;while((index=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+1);let row;try{row=JSON.parse(line);}catch{child.kill();lost();return;}const task=this.pending.get(row.id);if(!task)continue;this.pending.delete(row.id);clearTimeout(task.timer);if(row.ok===true)task.resolve(row.data);else{const error=Error(ERRORS[row.code]||'Discord could not finish this request. Try again.');error.code=Object.hasOwn(ERRORS,row.code)?row.code:'unknown';task.reject(error);}}});
 }
 request(method,input={}){
  if(!METHODS.has(method))return Promise.reject(Error('Unsupported Discord action.'));
  try{this.start();}catch(error){return Promise.reject(error);}
  if(this.pending.size>=16)return Promise.reject(Error('Discord is busy. Try again shortly.'));
  const id=++this.sequence;
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error(method==='connect'?'Discord sign-in timed out. Try connecting again.':'Discord did not respond. Try again.'));this.stop();},method==='connect'?180000:this.timeout);timer.unref?.();this.pending.set(id,{resolve,reject,timer});this.child.stdin.write(JSON.stringify({id,method,remember:input.remember===true})+'\n');});
 }
 stop(){const child=this.child;if(!child)return;child.kill();this.child=null;for(const task of this.pending.values()){clearTimeout(task.timer);task.reject(Error('Discord connection was closed.'));}this.pending.clear();}
 async forget(){await fs.promises.unlink(this.vault).catch(error=>{if(error.code!=='ENOENT')throw error;});if(this.child)await this.request('forget');}
}
function discordImage(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['cdn.discordapp.com','media.discordapp.net'].includes(u.hostname)&&/^\/(avatars\/\d{17,20}\/[a-f\d_]+\.(png|webp|jpg)|embed\/avatars\/\d+\.png)$/.test(u.pathname)?u.href:null;}catch{return null;}}
function normalizeDiscordPerson(row,now=Date.now()){
 const platformId=String(row?.platformId||'');if(!/^\d{17,20}$/.test(platformId))return null;
 const state=['online','offline','away','busy'].includes(row.state)?row.state:'unknown';
 return {id:'discord:'+platformId,platform:'Discord',platformId,name:String(row.name||'Discord user').slice(0,120),...(typeof row.username==='string'?{username:row.username.slice(0,120)}:{}),state,stateLabel:({online:'Online',offline:'Offline or hidden',away:'Away',busy:'Do not disturb',unknown:'Unavailable'})[state],activity:null,gameId:null,avatar:discordImage(row.avatar),checkedAt:now};
}
class DiscordFriends {
 constructor(bridge,{clock=Date.now}={}){this.bridge=bridge;this.clock=clock;this.people=[];this.self=null;this.connected=false;this.saved=bridge.saved();this.rememberAllowed=false;this.checkedAt=0;this.error='';this.generation=0;this.connecting=false;this.inflight=null;this.resumeRetryAt=0;this.resumeBlocked=false;}
 snapshot(){return {friends:this.people,self:this.self,connected:this.connected,saved:this.saved,checkedAt:this.checkedAt,error:this.error,connecting:this.connecting,available:this.bridge.available(),experimental:this.bridge.allowUnverified===true,stale:!!this.error||!this.checkedAt||this.clock()-this.checkedAt>120000};}
 accept(raw){if(!raw||typeof raw.connected!=='boolean'||!Array.isArray(raw.friends)||raw.friends.length>10000)throw Error('Discord returned an invalid friends response.');const now=this.clock(),rows=raw.friends.map(p=>normalizeDiscordPerson(p,now)).filter(Boolean);this.connected=raw.connected;this.saved=raw.saved===true&&this.rememberAllowed;this.people=raw.connected?[...new Map(rows.map(p=>[p.id,p])).values()]:[];this.self=raw.connected?normalizeDiscordPerson(raw.self,now):null;this.checkedAt=raw.connected?now:0;this.error='';return this.snapshot();}
 async connect({remember=false,resume=false}={}){
  if(this.closing)throw Error('Discord is disconnecting. Try again shortly.');if(this.connecting)throw Error('Discord sign-in is already open.');
  if(!resume){this.resumeRetryAt=0;this.resumeBlocked=false;}const generation=++this.generation;this.rememberAllowed=remember;this.connecting=true;
  try{const result=await this.bridge.request(resume?'resume':'connect',{remember});if(generation!==this.generation)throw Error('Discord connection was cancelled.');return this.accept(result);}catch(error){if(generation===this.generation)this.error=error.message;throw error;}finally{if(generation===this.generation)this.connecting=false;}
 }
 async resume(){if(this.resumeOperation)return this.resumeOperation;if(this.connected||this.connecting||!this.bridge.available()||!this.bridge.saved()||this.resumeBlocked||this.clock()<this.resumeRetryAt)return this.snapshot();const operation=(async()=>{try{await this.connect({remember:true,resume:true});this.resumeRetryAt=0;}catch(error){this.resumeRetryAt=this.clock()+30000;if(error.code==='authorization'){this.resumeBlocked=true;this.error='Your saved Discord sign-in expired. Connect again.';}}return this.snapshot();})();this.resumeOperation=operation;try{return await operation;}finally{if(this.resumeOperation===operation)this.resumeOperation=null;}}
 async refresh(){if(!this.connected&&!this.connecting&&this.rememberAllowed)return this.resume();if(!this.connected||this.connecting)return this.snapshot();if(this.inflight)return this.inflight;const generation=this.generation;const operation=(async()=>{try{const raw=await this.bridge.request('snapshot');if(generation===this.generation)this.accept(raw);}catch(error){if(generation===this.generation)this.error=error.message;}return this.snapshot();})();this.inflight=operation;try{return await operation;}finally{if(this.inflight===operation)this.inflight=null;}}
 async disconnect(){if(this.closing)throw Error('Discord is already disconnecting.');this.closing=true;++this.generation;this.connecting=false;this.connected=false;this.saved=false;this.people=[];this.self=null;this.checkedAt=0;this.error='';try{if(this.bridge.child)await this.bridge.request('disconnect');}catch{this.error='Disconnected on this computer. You can also remove Orbit from Discord’s Authorized Apps.';}finally{this.bridge.stop();try{await this.bridge.forget();}finally{this.closing=false;}}return this.snapshot();}
 async forget(){this.rememberAllowed=false;this.saved=false;await this.bridge.forget();}
 pause(){++this.generation;this.connected=false;this.checkedAt=0;this.connecting=false;this.error='Discord friends are paused in Offline mode.';this.bridge.stop();}
 stop(){this.bridge.stop();}
}
function combinedFriends(steam,discord){
 const all=[steam,discord].filter(Boolean),active=all.filter(p=>p.connected);const friends=all.flatMap(p=>(p.friends||[]).map(f=>({...f,stale:p.stale===true})));
 return {...steam,steamSelf:steam.self,discordSelf:discord?.self||null,friends,connected:active.length>0,saved:all.some(p=>p.saved),checkedAt:active.length?Math.min(...active.map(p=>p.checkedAt||0)):0,stale:active.length>0&&active.every(p=>p.stale),error:[steam.error&&'Steam: '+steam.error,discord?.error&&'Discord: '+discord.error].filter(Boolean).join(' ')};
}
module.exports={developmentFriendsEnabled,DiscordSdkBridge,DiscordFriends,normalizeDiscordPerson,discordImage,combinedFriends};
