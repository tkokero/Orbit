const fs=require('node:fs/promises');
async function diagnose(game,profile={},exists){
 const issues=[],version=game.versions[0];
 const executable=profile.executable||version.executable;
 if(version.location&&!await exists(version.location))issues.push({kind:'drive',title:'Game folder is unavailable',detail:'Reconnect the drive, then refresh. If the game moved, choose its executable.',action:'locate'});
 if(executable&&!await exists(executable))issues.push({kind:'executable',title:'Executable is missing',detail:'Locate the game again or use its original client to verify the installation.',action:'locate'});
 if(profile.args?.length&&!executable&&!version.directLaunch)issues.push({kind:'arguments',title:'Arguments require a direct launch',detail:'Choose a preferred executable or clear the custom arguments. Store launch options belong in the store client.',action:'profile'});
 if(!version.installed&&!version.launcherAvailable&&!profile.executable)issues.push({kind:'install',title:'No installed copy detected',detail:'Install the game using its original client, or locate an existing installation.',action:'locate'});
 if(version.installed&&!version.launch&&!executable&&!version.directLaunch&&!version.windowsAppId)issues.push({kind:'target',title:'No launch target configured',detail:'Choose the game executable to repair this entry.',action:'locate'});
 return {id:game.id,title:game.title,issues,checkedAt:Date.now(),note:issues.length?'Resolve these items and try again.':'No missing launch files detected. The original client may still require sign-in, updates, or anti-cheat services. Orbit cannot verify those automatically.'};
}
module.exports={diagnose};
