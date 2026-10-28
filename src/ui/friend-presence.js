/* Presence policy is shared by filtering, ordering, counts and linked summaries. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitFriendPresence=api;})(globalThis,()=>{
 const members=friend=>friend.profiles||[friend];
 const online=person=>!person.stale&&['online','busy'].includes(person.state);
 const rank=person=>online(person)?(person.activity||person.gameId?3:person.state==='busy'?2:1):0;
 function pick(people){return [...people].sort((a,b)=>rank(b)-rank(a)||Number(Boolean(a.stale))-Number(Boolean(b.stale)))[0];}
 function visible(friend,platform='all',filter='online'){return members(friend).filter(p=>(platform==='all'||p.platform===platform)&&(filter==='all'||online(p)));}
 function compare(a,b,platform='all'){const score=f=>Math.max(0,...members(f).filter(p=>platform==='all'||p.platform===platform).map(rank));return score(b)-score(a)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id);}
 function rows(people,{platform='all',filter='online',search=''}={}){const query=search.toLowerCase();return people.filter(f=>visible(f,platform,filter).length).filter(f=>members(f).some(p=>(p.name+' '+(p.username||'')+' '+p.platform+' '+(p.activity||'')).toLowerCase().includes(query))).sort((a,b)=>compare(a,b,platform));}
 const label=p=>p.state==='busy'?'DND':p.stateLabel||({online:'Online',away:'Away',offline:'Offline',unknown:'Unavailable'})[p.state]||'Unavailable';
 return {members,online,rank,pick,visible,compare,rows,label};
});
