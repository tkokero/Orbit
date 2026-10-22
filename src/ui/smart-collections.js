/* Shared rule evaluation: metadata only, no polling or disk scans. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitCollections=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const DAY=86400000;
 function validate(input){if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid smart collection.');const name=String(input.name||'').trim();if(!name||name.length>40)throw Error('Use a collection name under 40 characters.');const r=input.rule;if(!r||typeof r!=='object'||Array.isArray(r))throw Error('Choose collection rules.');if(!['any','installed','uninstalled'].includes(r.status)||!['any','game','tool'].includes(r.kind)||!['any','played','unplayed'].includes(r.playtime))throw Error('Invalid collection filter.');if(typeof r.platform!=='string'||r.platform.length>80)throw Error('Invalid platform filter.');for(const k of ['addedDays','playedDays'])if(![0,7,30].includes(r[k]))throw Error('Choose a 7-day or 30-day window.');return {name,rule:{status:r.status,kind:r.kind,playtime:r.playtime,platform:r.platform,addedDays:r.addedDays,playedDays:r.playedDays,favorite:r.favorite===true}};}
 const rule=overrides=>({status:'any',kind:'game',playtime:'any',platform:'',addedDays:0,playedDays:0,favorite:false,...overrides});
 const builtins=[{id:'installed',name:'Installed games',rule:rule({status:'installed'})},{id:'unplayed',name:'Never played',rule:rule({playtime:'unplayed'})},{id:'recent-added',name:'Recently added',rule:rule({addedDays:30})},{id:'recent-played',name:'Played this week',rule:rule({playedDays:7})}];
 function matches(game,filter,now=Date.now()){
  const r=filter.rule;if(game.hidden||r.kind!=='any'&&game.kind!==r.kind||r.status!=='any'&&Boolean(game.installed)!==(r.status==='installed')||r.platform&&!game.sources.includes(r.platform)||r.favorite&&!game.favorite)return false;
  if(r.playtime==='unplayed'&&(!game.playtimeKnown||game.playtime!==0||game.lastPlayed>0))return false;
  if(r.playtime==='played'&&!(game.playtimeKnown&&game.playtime>0||game.lastPlayed>0))return false;
  if(r.addedDays&&!(game.addedAt>0&&game.addedAt>=now-r.addedDays*DAY&&game.addedAt<=now))return false;
  if(r.playedDays&&!(game.lastPlayed>0&&game.lastPlayed>=now-r.playedDays*DAY&&game.lastPlayed<=now))return false;
  return true;
 }
 return {validate,builtins,matches,rule};
});
