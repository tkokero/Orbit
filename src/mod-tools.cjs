const fs=require('node:fs/promises');const path=require('node:path');
const TOOL_PAGES={r2modman:'https://github.com/ebkr/r2modmanPlus/releases',CurseForge:'https://download.curseforge.com/'};
function toolName(name){return /^r2modman(?:\s.*)?$/i.test(name)?'r2modman':/^CurseForge(?:\s.*)?$/i.test(name)?'CurseForge':null;}
function builtinEntries(){return Object.entries(TOOL_PAGES).map(([title,installUrl])=>({id:'tool-catalog:'+title,title,kind:'tool',appType:'tool',source:'Standalone',origin:'builtin-tool',installed:false,installUrl,catalogNote:'Opens the official download page when this mod manager is not installed.'}));}
function minecraftRecord(record){
 const launcher=record.source==='Minecraft'&&(/^Microsoft\.4297127D64EC6_/i.test(record.windowsAppId||'')||/MinecraftLauncher\.exe$/i.test(record.launcherExecutable||record.executable||'')||/^Minecraft Launcher$/i.test(record.title||''));
 return launcher?{...record,title:'Minecraft Launcher',kind:'tool',appType:'application',catalogNote:'Minecraft Launcher detected. This does not verify ownership of a Minecraft edition.'}:record;
}
function retainedRecords(records=[]){return records.filter(record=>!(record.origin==='builtin-game'&&record.id==='minecraft:catalog')).map(minecraftRecord);}
async function modTools(registry=[],env=process.env){
 const records=[];
 for(const title of Object.keys(TOOL_PAGES)){
  const candidates=[];
  for(const item of registry.filter(r=>toolName(r.DisplayName)===title)){
   const icon=String(item.DisplayIcon||'').replace(/,\s*-?\d+$/,'').replace(/^"|"$/g,'');
   if(path.basename(icon).toLowerCase()===(title+'.exe').toLowerCase())candidates.push(icon);
   if(item.InstallLocation)candidates.push(path.join(item.InstallLocation,title+'.exe'));
  }
  for(const root of [env.LOCALAPPDATA&&path.join(env.LOCALAPPDATA,'Programs'),env.LOCALAPPDATA,env.ProgramFiles,env['ProgramFiles(x86)']].filter(Boolean))for(const folder of [title,title+' Windows'])candidates.push(path.join(root,folder,title+'.exe'));
  for(const executable of [...new Set(candidates)]){try{await fs.access(executable);records.push({id:'mod-tool:'+title,title,kind:'tool',appType:'tool',source:'Standalone',origin:'scan',installed:true,executable,location:path.dirname(executable),installUrl:TOOL_PAGES[title]});break;}catch{}}
 }
 return records;
}
function minecraftApps(apps=[]){return apps.filter(a=>/^Microsoft\.(?:4297127D64EC6|MinecraftUWP)_[a-z0-9]+![a-z0-9.-]+$/i.test(a.AppID||'')).map(a=>{const bedrock=/MinecraftUWP_/i.test(a.AppID);return{id:'minecraft:windows:'+a.AppID,title:bedrock?'Minecraft for Windows':'Minecraft Launcher',source:'Minecraft',kind:bedrock?'game':'tool',origin:'windows-app',installed:bedrock,launcherAvailable:!bedrock,windowsAppId:a.AppID,installUrl:'https://www.minecraft.net/download/',catalogNote:bedrock?'Installed Minecraft Windows application.':'Minecraft Launcher detected. This does not verify ownership of a Minecraft edition.'};});}
function windowsGameAction(version){if(!version.windowsAppId)return null;if(version.source!=='Minecraft'||!/^Microsoft\.(?:4297127D64EC6|MinecraftUWP)_[a-z0-9]+![a-z0-9.-]+$/i.test(version.windowsAppId))throw new Error('Invalid Minecraft application identity. Refresh your library.');return{type:'windows-app',value:version.windowsAppId};}
module.exports={retainedRecords,builtinEntries,modTools,minecraftApps,windowsGameAction,toolName};
