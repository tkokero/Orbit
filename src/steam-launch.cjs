const path=require('node:path');
async function steamAction(version,args,root,exists){
 if(version.source!=='Steam'||!version.installed)return null;
 const match=/^steam:\/\/rungameid\/(\d+)$/.exec(version.launch||'');
 if(!match)return null;
 const executable=root&&path.join(root,'steam.exe');
 if(!executable||!await exists(executable)){
  if(args.length)throw Error('Steam could not be located. Refresh the library before using Steam launch options.');
  return null;
 }
 return {type:'exe',value:executable,args:['-silent','-applaunch',match[1],...args]};
}
module.exports={steamAction};
