/* Local, user-confirmed identity associations. Names only propose a match. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitFriendLinks=api;})(globalThis,()=>{
 const P=typeof module==='object'&&module.exports?require('./friend-presence.js'):globalThis.OrbitFriendPresence;
 const key='orbit-friend-links-v1',validSteam=id=>/^steam:\d{17}$/.test(id||''),validDiscord=id=>/^discord:\d{17,20}$/.test(id||'');
 const pair=(s,d)=>s+'|'+d;
 function account(data){const s=data?.steamSelf?.id,d=data?.discordSelf?.id;return validSteam(s)&&validDiscord(d)?pair(s,d):null;}
 function read(value){const accounts={};for(const [scope,rows] of Object.entries(value?.accounts||{}).slice(-8)){
  const [s,d]=scope.split('|');if(!validSteam(s)||!validDiscord(d)||!Array.isArray(rows))continue;
  const result=new Map(),used=new Set();for(const row of rows.slice(-2000).reverse()){
   if(!validSteam(row?.steam)||!validDiscord(row?.discord)||!['link','separate'].includes(row.decision))continue;
   const id=pair(row.steam,row.discord);if(result.has(id))continue;
   if(row.decision==='link'){if(used.has(row.steam)||used.has(row.discord))continue;used.add(row.steam);used.add(row.discord);}
   result.set(id,{steam:row.steam,discord:row.discord,decision:row.decision});
  }accounts[scope]=[...result.values()].reverse();
 }return {version:1,accounts};}
 function decide(config,scope,steam,discord,decision){
  if(!scope||scope.split('|').length!==2||!validSteam(scope.split('|')[0])||!validDiscord(scope.split('|')[1])||!validSteam(steam)||!validDiscord(discord)||!['link','separate','reset'].includes(decision))throw Error('Choose a Steam and Discord profile.');
  const next=read(config),rows=(next.accounts[scope]||[]).filter(r=>pair(r.steam,r.discord)!==pair(steam,discord));
  if(decision==='link'&&rows.some(r=>r.decision==='link'&&(r.steam===steam||r.discord===discord)))throw Error('Unlink the existing profiles first.');
  if(decision!=='reset')rows.push({steam,discord,decision});delete next.accounts[scope];next.accounts[scope]=rows.slice(-2000);return read(next);
 }
 function normalize(text){return Array.from(String(text||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'')).slice(0,64).join('');}
 function names(friend){return [...new Set([friend.username,friend.name].map(normalize).filter(n=>Array.from(n).length>=3&&!['steamplayer','discorduser','unknown','player'].includes(n)))];}
 function close(a,b){const x=Array.from(a),y=Array.from(b);if(Math.min(x.length,y.length)<5||Math.abs(x.length-y.length)>1)return false;
  if(x.length===y.length){const diff=[];for(let i=0;i<x.length;i++)if(x[i]!==y[i])diff.push(i);return diff.length===1||diff.length===2&&diff[1]===diff[0]+1&&x[diff[0]]===y[diff[1]]&&x[diff[1]]===y[diff[0]];}
  const longer=x.length>y.length?x:y,shorter=x.length>y.length?y:x;let i=0,j=0,skipped=false;while(i<longer.length&&j<shorter.length){if(longer[i]===shorter[j]){i++;j++;}else{if(skipped)return false;skipped=true;i++;}}return true;
 }
 const signatures=n=>{const a=Array.from(n);return [n,...a.map((_,i)=>a.slice(0,i).concat(a.slice(i+1)).join(''))];};
 function state(config,data){return account(data)?read(config).accounts[account(data)]||[]:[];}
 function suggestions(config,data,limit=25){
  if(!account(data))return [];
  const rows=state(config,data),blocked=new Set(rows.map(r=>pair(r.steam,r.discord))),used=new Set(rows.filter(r=>r.decision==='link').flatMap(r=>[r.steam,r.discord]));
  const people=[...new Map((data.friends||[]).map(f=>[f.id,f])).values()].filter(f=>!used.has(f.id));
  const steam=people.filter(f=>validSteam(f.id)&&f.platform==='Steam'),discord=people.filter(f=>validDiscord(f.id)&&f.platform==='Discord');
  const index=new Map(),aliases=new Map(),candidates=new Map();
  for(const friend of discord){const ns=names(friend);aliases.set(friend.id,ns);for(const n of ns)for(const sig of signatures(n)){const bucket=index.get(sig)||[];if(bucket.length<32&&!bucket.includes(friend))bucket.push(friend);index.set(sig,bucket);}}
  for(const s of steam){const ns=names(s),found=new Set();for(const n of ns)for(const sig of signatures(n))for(const d of index.get(sig)||[])found.add(d);
   for(const d of found){if(candidates.size>=2000)break;const id=pair(s.id,d.id);if(blocked.has(id))continue;const dn=aliases.get(d.id),exact=ns.some(n=>dn.includes(n));if(!exact&&!ns.some(n=>dn.some(m=>close(n,m))))continue;candidates.set(id,{steam:s,discord:d,reason:exact?'Matching names':'Similar names',score:exact?2:1});}
   if(candidates.size>=2000)break;
  }
  return [...candidates.values()].sort((a,b)=>b.score-a.score||a.steam.name.localeCompare(b.steam.name)||a.steam.id.localeCompare(b.steam.id)||a.discord.id.localeCompare(b.discord.id)).slice(0,Math.max(0,Math.min(100,limit)));
 }
 function view(config,data){const people=data?.friends||[],byId=new Map(people.map(f=>[f.id,f])),partners=new Map();for(const r of state(config,data))if(r.decision==='link'&&byId.has(r.steam)&&byId.has(r.discord)){partners.set(r.steam,r.discord);partners.set(r.discord,r.steam);}
  const seen=new Set();return people.flatMap(f=>{if(seen.has(f.id))return [];seen.add(f.id);const other=byId.get(partners.get(f.id));if(!other)return [{...f,profiles:[f]}];seen.add(other.id);const profiles=[f,other].sort((a,b)=>Number(b.platform==='Steam')-Number(a.platform==='Steam')),primary=profiles[0],best=P.pick(profiles)||primary;return [{...primary,linked:true,profiles,state:best.state,stateLabel:best.stateLabel,stale:profiles.every(p=>p.stale),activity:profiles.find(p=>p.platform==='Steam'&&P.online(p))?.activity||null}];});
 }
 return {key,read,account,decide,normalize,suggestions,state,view};
});
