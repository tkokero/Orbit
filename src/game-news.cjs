const HOSTS=new Set(['steamcommunity.com','store.steampowered.com']);
function safePostUrl(value){try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||!(HOSTS.has(url.hostname)||(url.hostname==='steamstore-a.akamaihd.net'&&/^\/news\/externalpost\/(steam_community_announcements|steam_updates)\/\d+$/.test(url.pathname))))return null;return url.href;}catch{return null;}}
function plain(value,max){return String(value||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').replace(/\[\/?(?:b|i|u|h[1-6]|list|olist|\*|url|img|previewyoutube|table|tr|td|th|quote|code|spoiler)(?:=[^\]]*)?\]/gi,' ').replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'",'&nbsp;':' '})[x]).replace(/\s+/g,' ').trim().slice(0,max);}
function newsBanner(contents){
 const text=String(contents||'').slice(0,200000),candidates=[...text.matchAll(/\[img\](.*?)\[\/img\]|\[img\s+src=["']([^"']+)["']\]|<img\b[^>]*\bsrc=["']([^"']+)["']/gi)];
 for(const match of candidates){let value=(match[1]||match[2]||match[3]||'').trim().replace(/\{STEAM_CLAN_(?:LOC_)?IMAGE\}\//g,'https://clan.akamai.steamstatic.com/images/').replace(/&amp;/g,'&');try{const u=new URL(value);if(u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&['clan.akamai.steamstatic.com','clan.fastly.steamstatic.com','cdn.akamai.steamstatic.com','cdn.cloudflare.steamstatic.com','shared.akamai.steamstatic.com','shared.fastly.steamstatic.com','images.steamusercontent.com'].includes(u.hostname))return u.href;}catch{}}
 return null;
}
function normalizeNews(data,now=Date.now()){
 const seen=new Set(),rows=[];for(const row of Array.isArray(data.appnews?.newsitems)?data.appnews.newsitems:[]){if(!['steam_community_announcements','steam_updates'].includes(row.feedname))continue;const url=safePostUrl(row.url);if(!url||seen.has(url))continue;seen.add(url);const title=plain(row.title,200);if(!title)continue;const date=Number(row.date)*1000;rows.push({id:String(row.gid||url).slice(0,300),title,url,summary:plain(row.contents,800),banner:newsBanner(row.contents),author:plain(row.author,100),feed:plain(row.feedlabel,80),date:Number.isFinite(date)&&date>0&&date<=now+86400000?date:null});}return rows.sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,8);
}
function steamId(game){const version=game.versions?.find(v=>v.source==='Steam'||v.equivalentSteamId);const id=String(version?.source==='Steam'?version.appId:version?.equivalentSteamId||'');return /^[1-9]\d{0,9}$/.test(id)&&Number(id)<=4294967295?id:null;}
class GameNews{
 constructor({fetchImpl=fetch,clock=Date.now}={}){this.fetch=fetchImpl;this.clock=clock;this.cache=new Map();this.inflight=new Map();}
 async get(appId,{offline=false,refresh=false}={}){
  if(!/^[1-9]\d{0,9}$/.test(String(appId))||Number(appId)>4294967295)throw Error('Invalid game news source.');appId=String(appId);const old=this.cache.get(appId),now=this.clock();
  if(offline)return old?{...old,stale:true,offline:true}:{posts:[],checkedAt:null,offline:true,stale:false};
  if(old&&!refresh&&now-old.checkedAt<30*60*1000)return {...old,stale:false,offline:false};if(this.inflight.has(appId))return this.inflight.get(appId);
  const task=(async()=>{try{const url=new URL('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/');url.search=new URLSearchParams({appid:appId,count:'8',maxlength:'0',feeds:'steam_community_announcements,steam_updates'});const response=await this.fetch(url,{signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Game news is unavailable. Try again later.');let text='';if(response.body?.[Symbol.asyncIterator]){let bytes=0;const decoder=new TextDecoder();for await(const chunk of response.body){bytes+=chunk.length;if(bytes>1024*1024)throw Error('News response is too large.');text+=decoder.decode(chunk,{stream:true});}text+=decoder.decode();}else{text=await response.text();if(Buffer.byteLength(text)>1024*1024)throw Error('News response is too large.');}const data=JSON.parse(text);if(String(data.appnews?.appid)!==appId)throw Error('News did not match the selected game.');const value={posts:normalizeNews(data,this.clock()),checkedAt:this.clock()};if(this.cache.size>=32)this.cache.delete(this.cache.keys().next().value);this.cache.set(appId,value);return {...value,stale:false,offline:false};}catch(error){if(old)return {...old,stale:true,offline:false,error:'Could not refresh. Showing previously loaded announcements.'};throw error;}})();
  this.inflight.set(appId,task);try{return await task;}finally{this.inflight.delete(appId);}
 }
 post(appId,id){return this.cache.get(String(appId))?.posts.find(p=>p.id===id);}
}
module.exports={GameNews,normalizeNews,safePostUrl,steamId,newsBanner};
