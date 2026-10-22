(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbitModSupport=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const games={r2modman:new Set(['riskofrain2','valheim','dysonsphereprogram','gtfo','boneworks','lethalcompany']),CurseForge:new Set(['minecraft','minecraftjavaedition','minecraftforwindows','worldofwarcraft','thesims4','stardewvalley'])};
 function supports(game,tool){return game.kind==='game'&&!game.robloxPlaceId&&Boolean(games[tool]?.has(normalize(game.title)));}
 function filter(game,tools){return tools.filter(tool=>supports(game,/^r2modman/i.test(tool.title)?'r2modman':/^CurseForge/i.test(tool.title)?'CurseForge':''));}
 return {supports,filter};
});
