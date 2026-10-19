const fs=require('node:fs/promises');const path=require('node:path');
const destinations=Object.freeze({'Epic Games':'com.epicgames.launcher://library',GOG:'https://www.gog.com/account',EA:'https://www.ea.com/ea-app','Ubisoft Connect':'https://ubisoftconnect.com/','Battle.net':'https://battle.net/download',Xbox:'ms-windows-store://home'});
function storeDestination(source){if(!Object.hasOwn(destinations,source))throw new Error('Unsupported store.');return destinations[source];}
async function openInstaller({dialog,shell,parent,title,smoke=false}){
 const selected=await dialog.showOpenDialog(parent,{title:title?'Install '+title:'Choose game installer',properties:['openFile'],filters:[{name:'Windows installers',extensions:['exe','msi']}]});
 if(selected.canceled)return null;
 const file=selected.filePaths[0];
 if(typeof file!=='string'||!path.isAbsolute(file)||!/\.(exe|msi)$/i.test(file)||!(await fs.stat(file)).isFile())throw new Error('Choose a Windows .exe or .msi installer.');
 const approval=await dialog.showMessageBox(parent,{type:'question',buttons:['Run installer','Cancel'],defaultId:1,cancelId:1,title:'Run game installer',message:path.basename(file),detail:file+'\nComplete setup in its own window. Only run installers from a source you trust.'});
 if(approval.response!==0)return null;
 if(!smoke){const error=await shell.openPath(file);if(error)throw new Error(error);}
 return {message:'Installer opened. Complete setup, then Refresh or Locate executable to add the installed game.'};
}
module.exports={openInstaller,storeDestination};
