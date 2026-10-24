const {Tray,Menu}=require('electron');
function attachTray({app,window,icon,keepRunning,isQuitting,ensureWindow,TrayClass=Tray,menuFromTemplate=Menu.buildFromTemplate}){
 const tray=new TrayClass(icon);
 const show=async()=>{try{if(ensureWindow)window=await ensureWindow();if(!window||window.isDestroyed())return;if(window.isMinimized())window.restore();window.show();window.focus();}catch(error){console.error('Could not reopen Orbit:',error.message);}};
 tray.setToolTip('Orbit');
 let clipMenuKey;const updateClips=(status={},save,stop)=>{const key=String(status.phase)+'|'+Boolean(status.saving);if(key===clipMenuKey)return;clipMenuKey=key;const active=['recording','starting'].includes(status.phase);tray.setToolTip(active?'Orbit · Clipping on':'Orbit');tray.setContextMenu(menuFromTemplate([{label:'Open Orbit',click:show},...(active?[{label:'Save game clip',enabled:status.phase==='recording'&&!status.saving,click:save},{label:'Stop clipping',click:stop}]:[]),{type:'separator'},{label:'Quit Orbit',click:()=>app.quit()}]));};tray.updateClips=updateClips;updateClips();
 tray.on('click',show);
 const bound=new WeakSet();tray.bindWindow=target=>{if(bound.has(target))return;bound.add(target);target.on('close',event=>{if(!isQuitting()&&keepRunning()){event.preventDefault();target.hide();}});};tray.bindWindow(window);
 app.on('will-quit',()=>tray.destroy());
 return tray;
}
module.exports={attachTray};
