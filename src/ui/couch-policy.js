(function(root,factory){if(typeof module==='object')module.exports=factory();else root.OrbitCouchPolicy=factory();})(globalThis,()=>{
 const eligible=(games,{excluded=[],guest=false,privateIds=[]}={})=>games.filter(g=>g.kind==='game'&&!g.hidden&&!excluded.includes(g.id)&&(!guest||!privateIds.includes(g.id)));
 function shuffle(games,scope,options={},random=Math.random){let pool=eligible(games,options).filter(g=>g.installed);if(scope==='favorites')pool=pool.filter(g=>g.favorite);if(scope==='forgotten')pool=pool.filter(g=>!g.lastPlayed||g.lastPlayed<(options.now||Date.now())-30*86400000);return pool.length?pool[Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length))]:null;}
 function playable(games,queue,options){const busy=new Set((queue||[]).filter(r=>!r.completed).map(r=>String(r.appid??r.appId)));return eligible(games,options).filter(g=>g.installed&&!g.installationProgress&&!(g.versions||[]).some(v=>v.source==='Steam'&&busy.has(String(v.appId))));}
 return {eligible,shuffle,playable};
});
