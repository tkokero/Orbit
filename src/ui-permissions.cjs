const path=require('node:path'),{fileURLToPath}=require('node:url');
// Only Orbit's own top-level UI may enter fullscreen. Capture permissions stay separate.
function uiFullscreen(sender,permission,details,window,page){
 if(permission!=='fullscreen'||!window||window.isDestroyed()||sender!==window.webContents||details?.isMainFrame!==true)return false;
 const local=value=>{try{const url=new URL(value);return url.protocol==='file:'&&!url.host&&path.resolve(fileURLToPath(url))===path.resolve(page);}catch{return false;}};
 return local(details.requestingUrl)&&local(sender.getURL());
}
module.exports={uiFullscreen};
