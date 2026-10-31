/* Synthetic local files for the explicit Desktop smoke pass. Nothing is executed. */
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async folder=>{
 const root=path.join(folder,'desktop-tool-fixtures');await fs.mkdir(root,{recursive:true});
 const records=[];for(const [name,file,kind]of [['DOOM Eternal','DoomFixture.exe','game'],['VRChat','VrChatFixture.exe','game'],['Cyberpunk 2077','CyberpunkFixture.exe','game'],['SteamVR','vrstartup.exe','tool']]){const location=path.join(root,file.replace('.exe',''));await fs.mkdir(location,{recursive:true});const executable=path.join(location,file);await fs.writeFile(executable,'isolated smoke fixture; never execute');records.push({id:'manual:fixture-'+file,title:name,kind,source:kind==='tool'?'Steam':'Other',...(kind==='tool'?{appId:'250820'}:{}),origin:'manual',installed:true,executable,location,playtime:0,playtimeKnown:false});}
 return {records,steamRoot:'',warnings:[],statuses:[],scannedAt:Date.now(),coverStatus:{}};
};
