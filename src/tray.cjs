const {Tray,Menu}=require('electron');
function attachTray({app,window,icon,keepRunning,isQuitting,TrayClass=Tray,menuFromTemplate=Menu.buildFromTemplate}){
 const tray=new TrayClass(icon);
 const show=()=>{if(window.isDestroyed())return;if(window.isMinimized())window.restore();window.show();window.focus();};
 tray.setToolTip('Orbit');
 tray.setContextMenu(menuFromTemplate([{label:'Open Orbit',click:show},{type:'separator'},{label:'Quit Orbit',click:()=>app.quit()}]));
 tray.on('click',show);
 window.on('close',event=>{if(!isQuitting()&&keepRunning()){event.preventDefault();window.hide();}});
 app.on('will-quit',()=>tray.destroy());
 return tray;
}
module.exports={attachTray};
