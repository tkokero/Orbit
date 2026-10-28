function trayItems(games=[],status={}){
 const seen=new Set(),recent=games.filter(g=>{if(!g||typeof g.id!=='string'||seen.has(g.id)||g.hidden||g.kind==='tool'||!Number.isFinite(g.lastPlayed)||g.lastPlayed<=0||!(g.installed||g.launcherAvailable||g.directLaunchAvailable||g.robloxPlaceId))return false;seen.add(g.id);return true;}).sort((a,b)=>b.lastPlayed-a.lastPlayed||a.title.localeCompare(b.title)).slice(0,5);
 const rows=recent.map(g=>({id:'game:'+g.id,label:g.title,icon:'game',image:typeof g.cover==='string'&&/^(file:|data:image\/(png|jpeg|webp);base64,)/i.test(g.cover)?g.cover:null,command:{type:'game',id:g.id}}));
 if(rows.length)rows.push({type:'separator'});
 rows.push({id:'open',label:'Open Orbit',icon:'open'},...['library','downloads','friends','settings'].map(id=>({id,label:id[0].toUpperCase()+id.slice(1),icon:id,command:{type:'page',page:id}})));
 if(['recording','starting'].includes(status.phase))rows.push({type:'separator'},{id:'save',label:'Save game clip',icon:'save',enabled:status.phase==='recording'&&!status.saving},{id:'stop',label:'Stop clipping',icon:'stop'});
 rows.push({type:'separator'},{id:'restart',label:'Restart Orbit',icon:'restart'},{id:'quit',label:'Quit Orbit',icon:'quit'});return rows;
}
module.exports={trayItems};
