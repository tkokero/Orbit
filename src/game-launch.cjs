const fs=require('node:fs/promises');const path=require('node:path');
async function riotLaunch(title,client,configFile){
  if(!/^VALORANT$/i.test(title)||!/^RiotClientServices\.exe$/i.test(path.basename(client)))return {};
  const result={directLaunch:{executable:client,args:['--launch-product=valorant','--launch-patchline=live']},directLaunchAvailable:true};
  try{const data=JSON.parse(await fs.readFile(configFile,'utf8'));for(const [root,associated]of Object.entries(data.associated_client||{})){
    if(path.resolve(associated).toLowerCase()!==path.resolve(client).toLowerCase())continue;
    const game=path.join(root,'ShooterGame/Binaries/Win64/VALORANT-Win64-Shipping.exe');
    try{await fs.access(game);return {...result,installed:true,location:root,gameExecutables:[game],catalogNote:'Launches VALORANT through Riot’s game-specific command. Riot handles sign-in, updates, and Vanguard.'};}catch{}
  }}catch{}
  return {...result,catalogNote:'Launches VALORANT through Riot’s game-specific command. Riot may require installation, sign-in, updates, or Vanguard.'};
}
function checkedDirectLaunch(version){
  const launch=version.directLaunch;
  if(!launch)return null;
  if(version.source!=='Riot Games'||!/^VALORANT$/i.test(version.title)||!path.isAbsolute(launch.executable)||!/^RiotClientServices\.exe$/i.test(path.basename(launch.executable))||JSON.stringify(launch.args)!==JSON.stringify(['--launch-product=valorant','--launch-patchline=live']))throw new Error('Invalid game launch command. Refresh the library.');
  if(!require('node:fs').existsSync(launch.executable))throw new Error('The Riot client executable is unavailable. Refresh the library.');
  return {type:'exe',value:launch.executable,args:launch.args};
}
module.exports={riotLaunch,checkedDirectLaunch};
