const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),{uiFullscreen}=require('../src/ui-permissions.cjs');
const page=path.resolve(__dirname,'../src/ui/index.html'),url=pathToFileURL(page).href;
function fixture(){const sender={getURL:()=>url+'?startup=desktop'},window={webContents:sender,isDestroyed:()=>false};return {sender,window,details:{requestingUrl:url,isMainFrame:true}};}
test('the Orbit main frame can use native video fullscreen',()=>{const f=fixture();assert.equal(uiFullscreen(f.sender,'fullscreen',f.details,f.window,page),true);});
test('fullscreen does not grant camera, audio, display, clipboard or external permissions',()=>{const f=fixture();for(const permission of ['automatic-fullscreen','media','display-capture','clipboard-read','openExternal','unknown'])assert.equal(uiFullscreen(f.sender,permission,f.details,f.window,page),false);});
test('remote pages, other local files, subframes, other windows and destroyed windows are denied',()=>{
 const f=fixture();for(const requestingUrl of ['https://example.com','file://server/share/index.html',pathToFileURL(path.resolve(__dirname,'other.html')).href,'javascript:void(0)','bad url'])assert.equal(uiFullscreen(f.sender,'fullscreen',{...f.details,requestingUrl},f.window,page),false);
 assert.equal(uiFullscreen(f.sender,'fullscreen',{...f.details,isMainFrame:false},f.window,page),false);assert.equal(uiFullscreen({getURL:()=>url},'fullscreen',f.details,f.window,page),false);f.sender.getURL=()=> 'https://example.com';assert.equal(uiFullscreen(f.sender,'fullscreen',f.details,f.window,page),false);f.sender.getURL=()=>url;f.window.isDestroyed=()=>true;assert.equal(uiFullscreen(f.sender,'fullscreen',f.details,f.window,page),false);
});
