const {Tray,Menu}=require('electron'),{trayItems}=require('./tray-menu-model.cjs');
function attachTray({app,window,icon,keepRunning,isQuitting,ensureWindow,restart,games=()=>[],navigate=()=>{},TrayClass=Tray,menuFromTemplate=Menu.buildFromTemplate,platform=process.platform,popupFactory=options=>new (require('./tray-popup.cjs').TrayPopup)(options)}){
 const tray=new TrayClass(icon);
 const show=async()=>{try{if(ensureWindow)window=await ensureWindow();if(!window||window.isDestroyed())return;if(window.isMinimized())window.restore();window.show();window.focus();}catch(error){console.error('Could not reopen Orbit:',error.message);}};
 tray.setToolTip('Orbit');
 let clipMenuKey,popup,clipStatus={},saveClip,stopClip,colors=require('./theme-icon.cjs').palette();
 const menuState=()=>({items:trayItems(games(),clipStatus),colors,light:require('./ui/themes.js').contrast(colors.text,'#000000')<require('./ui/themes.js').contrast(colors.text,'#ffffff')});
 const choose=id=>{const item=menuState().items.find(item=>item.id===id);if(!item||item.enabled===false)return;if(item.command)return navigate(item.command);if(id==='open')return show();if(id==='save')return saveClip?.();if(id==='stop')return stopClip?.();if(id==='restart')return restart?.();if(id==='quit')return app.quit();};
 const nativeMenu=()=>menuFromTemplate(menuState().items.map(item=>item.type==='separator'?{type:'separator'}:{label:item.label,enabled:item.enabled,click:()=>choose(item.id)}));
 tray.setTheme=value=>{colors=value;popup?.update();};
 tray.updateClips=(status={},save,stop)=>{saveClip=save;stopClip=stop;clipStatus={...status};const key=String(status.phase)+'|'+Boolean(status.saving);if(key===clipMenuKey)return;clipMenuKey=key;tray.setToolTip(['recording','starting'].includes(status.phase)?'Orbit · Clipping on':'Orbit');if(platform!=='win32')tray.setContextMenu(nativeMenu());popup?.update();};tray.updateClips();
 if(platform==='win32')tray.on('right-click',()=>{try{popup||=popupFactory({state:menuState,action:choose});popup.open(require('electron').screen.getCursorScreenPoint()).catch(error=>{console.error('Tray menu:',error.message);tray.popUpContextMenu(nativeMenu());});}catch(error){console.error('Tray menu:',error.message);tray.popUpContextMenu(nativeMenu());}});
 tray.on('click',show);
 const bound=new WeakSet();tray.bindWindow=target=>{if(bound.has(target))return;bound.add(target);target.on('close',event=>{if(!isQuitting()&&keepRunning()){event.preventDefault();target.hide();}});};tray.bindWindow(window);
 app.on('will-quit',()=>{popup?.dispose();tray.destroy();});
 return tray;
}
module.exports={attachTray};
