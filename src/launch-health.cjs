const fs=require('node:fs/promises');
async function diagnose(game,profile={},exists){
 const issues=[],version=game.versions[0];
 const executable=profile.executable||version.executable;
 if(version.location&&!await exists(version.location))issues.push({kind:'drive',title:'Game folder is unavailable',detail:'Reconnect the drive, then refresh. If the game moved, choose its executable.',action:'locate'});
 if(executable&&!await exists(executable))issues.push({kind:'executable',title:'Executable is missing',detail:'Locate the game again or use its original client to verify the installation.',action:'locate'});
 if(profile.args?.length&&!executable&&!version.directLaunch&&!(version.source==='Steam'&&version.installed&&/^steam:\/\/rungameid\/\d+$/.test(version.launch||'')))issues.push({kind:'arguments',title:'Arguments require a direct launch',detail:'Choose a preferred executable or clear the custom arguments. Steam launch options can be configured in Orbit.',action:'profile'});
 if(!version.installed&&!version.launcherAvailable&&!profile.executable)issues.push({kind:'install',title:'No installed copy detected',detail:'Install the game using its original client, or locate an existing installation.',action:'locate'});
 if(version.installed&&!version.launch&&!executable&&!version.directLaunch&&!version.windowsAppId)issues.push({kind:'target',title:'No launch target configured',detail:'Choose the game executable to repair this entry.',action:'locate'});
 return {id:game.id,title:game.title,issues,checkedAt:Date.now(),note:issues.length?'Resolve these items and try again.':'No missing launch files detected. The original client may still require sign-in, updates, or anti-cheat services. Orbit cannot verify those automatically.'};
}
async function healthReport(games,preferences,exists){
 const checked=games.filter(g=>!g.hidden&&!g.robloxPlaceId&&(g.installed||g.versions.some(v=>v.origin==='manual')||preferences[g.id]?.profile?.executable));
 const cache=new Map(),present=p=>{const key=String(p).toLowerCase();if(!cache.has(key))cache.set(key,Promise.resolve().then(()=>exists(p)).catch(()=>false));return cache.get(key);};
 const rows=await require('./library-tools.cjs').inspectLibrary(checked,present);let cursor=0;
 await Promise.all(Array.from({length:Math.min(8,checked.length)},async()=>{while(cursor<checked.length){const g=checked[cursor++],report=await diagnose(g,preferences[g.id]?.profile,present);for(const issue of report.issues){if(rows.some(r=>r.id===g.id&&r.reason==='Missing file or disconnected drive')&&['drive','executable'].includes(issue.kind))continue;rows.push({id:g.id,title:g.title,reason:issue.title,detail:issue.detail,action:issue.action,label:issue.action==='profile'?'Launch settings':'Locate executable'});}}}));
 rows.sort((a,b)=>a.title.localeCompare(b.title)||a.reason.localeCompare(b.reason));const affected=new Set(rows.map(r=>r.id));return {checkedAt:Date.now(),checked:checked.length,affected:affected.size,healthy:checked.length-affected.size,issues:rows,note:'Checks local launch files and duplicate targets. Store sign-in, anti-cheat, and game-specific errors still need their original client.'};
}
module.exports={diagnose,healthReport};
