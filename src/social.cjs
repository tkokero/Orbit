const fs=require('node:fs/promises');const path=require('node:path');
const STATES={0:'offline',1:'online',2:'busy',3:'away',4:'away',5:'online',6:'online'};
function steamImage(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname.endsWith('.steamstatic.com')||['steamcdn-a.akamaihd.net','media.steampowered.com'].includes(u.hostname))?u.href:null;}catch{return null;}}
function normalizeSteamPlayer(player,now=Date.now()){
 const id=String(player?.steamid||'');if(!/^\d{17}$/.test(id))return null;
 const known=Object.hasOwn(STATES,player.personastate),state=known?STATES[player.personastate]:'unknown';
 const playing=state!=='offline'&&state!=='unknown'&&typeof player.gameextrainfo==='string'&&player.gameextrainfo.trim();
 return {id:'steam:'+id,platform:'Steam',platformId:id,avatar:steamImage(player.avatarmedium)||steamImage(player.avatarfull)||steamImage(player.avatar),name:String(player.personaname||'Steam player').slice(0,120),state,
  stateLabel:state==='offline'?'Offline or hidden':state==='unknown'?'Unavailable':({online:'Online',busy:'Busy',away:'Away'})[state],
  activity:playing?'Playing '+player.gameextrainfo.trim().slice(0,180):null,gameId:playing&&/^\d+$/.test(String(player.gameid||''))?String(player.gameid):null,checkedAt:now};
}
class SteamFriends {
 constructor({fetchImpl=fetch,clock=Date.now}={}){this.fetch=fetchImpl;this.clock=clock;this.key='';this.steamId='';this.people=[];this.self=null;this.checkedAt=0;this.lastAttempt=0;this.error='';this.inflight=null;this.generation=0;this.abort=null;this.details=new Map();this.minimumRefresh=30000;this.saved=false;}
 configure(steamId,key,saved=false){if(!/^\d{17}$/.test(steamId||'')||!/^[a-f\d]{32}$/i.test(key||''))throw new Error('Enter a 17-digit SteamID64 and a 32-character Steam Web API key.');this.disconnect();this.steamId=steamId;this.key=key;this.saved=saved;}
 disconnect(){this.details.clear();this.generation++;this.abort?.abort();this.key='';this.steamId='';this.people=[];this.self=null;this.checkedAt=0;this.lastAttempt=0;this.error='';this.saved=false;this.inflight=null;}
 snapshot(){return {friends:this.people,self:this.self,checkedAt:this.checkedAt,error:this.error,connected:Boolean(this.key),saved:this.saved,steamId:this.steamId,stale:Boolean(this.error)||!this.checkedAt||this.clock()-this.checkedAt>120000};}
 async request(method,params,signal){const url=new URL('https://api.steampowered.com/ISteamUser/'+method);url.search=new URLSearchParams({key:this.key,...params});let response;try{response=await this.fetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])});}catch(error){if(signal.aborted)throw new Error('Steam connection was closed.');throw new Error('Could not reach Steam. Check your connection and try again.');}
  if(response.status===401||response.status===403)throw new Error('Steam denied access. Check your API key and Friends List privacy settings.');if(response.status===429)throw new Error('Steam is rate limiting requests. Wait a minute and try again.');if(!response.ok)throw new Error('Steam friends service is unavailable ('+response.status+').');try{return await response.json();}catch{throw new Error('Steam returned an invalid friends response.');}}
 async activity(id){
  const friend=this.people.find(p=>p.id===id);if(!this.key||!friend)throw new Error('Friend is not in the connected list.');
  const cached=this.details.get(id);if(cached&&this.clock()-cached.time<300000)return cached.promise;
  const generation=this.generation,signal=this.abort?.signal||new AbortController().signal;
  const promise=(async()=>{try{
   const url=new URL('https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/');url.search=new URLSearchParams({key:this.key,steamid:friend.platformId,count:'3'});
   const response=await this.fetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(10000)])});if(!response.ok)throw new Error();const data=await response.json();
   if(generation!==this.generation)return {games:[],unavailable:true};
   const games=(Array.isArray(data.response?.games)?data.response.games:[]).slice(0,3).filter(g=>/^\d+$/.test(String(g.appid))).map(g=>({id:String(g.appid),title:String(g.name||'Steam game').slice(0,180),minutes:Number.isFinite(g.playtime_forever)&&g.playtime_forever>=0?g.playtime_forever:null,recentMinutes:Number.isFinite(g.playtime_2weeks)&&g.playtime_2weeks>=0?g.playtime_2weeks:null,icon:/^[a-f\d]{40}$/i.test(g.img_icon_url||'')?'https://media.steampowered.com/steamcommunity/public/images/apps/'+g.appid+'/'+g.img_icon_url+'.jpg':null}));
   return {games,unavailable:!games.length};
  }catch{return {games:[],unavailable:true};}})();
  if(this.details.size>=256)this.details.delete(this.details.keys().next().value);this.details.set(id,{time:this.clock(),promise});return promise;
 }
 async refresh(){if(!this.key)return this.snapshot();if(this.inflight)return this.inflight;if(this.lastAttempt&&this.clock()-this.lastAttempt<this.minimumRefresh)return this.snapshot();
  this.lastAttempt=this.clock();
  const generation=this.generation;this.abort=new AbortController();const signal=this.abort.signal;
  const operation=(async()=>{try{
   const list=await this.request('GetFriendList/v1/',{steamid:this.steamId,relationship:'friend'},signal);
   if(generation!==this.generation||signal.aborted)return this.snapshot();
   if(!Array.isArray(list.friendslist?.friends))throw new Error('Steam did not expose this friends list. Check its privacy settings.');
   const ids=[...new Set(list.friendslist.friends.map(f=>String(f.steamid)).filter(id=>/^\d{17}$/.test(id)))];if(ids.length>10000)throw new Error('Steam returned too many friend entries.');
   const chunks=[];const all=[this.steamId,...ids.filter(id=>id!==this.steamId)];for(let i=0;i<all.length;i+=100)chunks.push(all.slice(i,i+100));
   let cursor=0;const players=[];await Promise.all(Array.from({length:Math.min(2,chunks.length)},async()=>{while(cursor<chunks.length){const chunk=chunks[cursor++];const data=await this.request('GetPlayerSummaries/v2/',{steamids:chunk.join(',')},signal);if(!Array.isArray(data.response?.players))throw new Error('Steam did not return presence information.');players.push(...data.response.players);}}));
   if(generation!==this.generation)return this.snapshot();
   const now=this.clock(),allowed=new Set(ids),normalized=players.map(p=>normalizeSteamPlayer(p,now)).filter(Boolean);this.self=normalized.find(p=>p.platformId===this.steamId)||null;
   const returned=new Map(normalized.filter(p=>allowed.has(p.platformId)&&p.platformId!==this.steamId).map(p=>[p.platformId,p]));
   this.people=ids.map(id=>returned.get(id)||{id:'steam:'+id,platform:'Steam',platformId:id,name:'Steam player',state:'unknown',stateLabel:'Unavailable',activity:null,gameId:null,checkedAt:now});this.checkedAt=now;this.error='';
  }catch(error){if(generation!==this.generation)return this.snapshot();this.error=error.message;}return this.snapshot();})();
  this.inflight=operation;try{return await operation;}finally{if(this.inflight===operation)this.inflight=null;}
 }
}
class SocialCredentials {
 constructor(file,secure){this.file=file;this.secure=secure;}
 async load(){try{const row=JSON.parse(await fs.readFile(this.file,'utf8'));if(!this.secure.isEncryptionAvailable()||!/^\d{17}$/.test(row.steamId||'')||typeof row.encryptedKey!=='string')return null;const key=this.secure.decryptString(Buffer.from(row.encryptedKey,'base64'));if(!/^[a-f\d]{32}$/i.test(key))return null;return{steamId:row.steamId,key};}catch{return null;}}
 async save(steamId,key){if(!this.secure.isEncryptionAvailable())throw new Error('Secure storage is unavailable. Connect without Remember instead.');const payload={version:1,steamId,encryptedKey:this.secure.encryptString(key).toString('base64')};await fs.mkdir(path.dirname(this.file),{recursive:true});await fs.writeFile(this.file+'.tmp',JSON.stringify(payload));await fs.rename(this.file+'.tmp',this.file);}
 async clear(){await fs.unlink(this.file).catch(error=>{if(error.code!=='ENOENT')throw error;});}
}
function providers(steam){return [{id:'steam',name:'Steam',friendsSupported:true,connected:steam.connected,statusMode:'official-client',statusLabel:'Change in Steam',message:steam.connected?'Friends and presence connected':'Connect your Steam friends list'},
 {id:'epic',name:'Epic Games',friendsSupported:false,connected:false,statusMode:'official-client',statusLabel:'Open Epic Games',message:'View friends and manage status in the Epic Games client.'},
 {id:'discord',name:'Discord',friendsSupported:false,connected:false,statusMode:'official-client',statusLabel:'Change in Discord',message:'View friends and change status in the Discord client.'}];}
function socialClientUrl(provider){const urls={steam:'steam://open/friends',epic:'com.epicgames.launcher://library',discord:'https://discord.com/channels/@me'};if(!Object.hasOwn(urls,provider))throw new Error('Unknown social platform.');return urls[provider];}
function friendProfileUrl(friend){if(friend.platform!=='Steam'||!/^\d{17}$/.test(friend.platformId))throw new Error('Unsupported friend profile.');return 'https://steamcommunity.com/profiles/'+friend.platformId+'/';}
module.exports={steamImage,SteamFriends,SocialCredentials,normalizeSteamPlayer,providers,socialClientUrl,friendProfileUrl};
