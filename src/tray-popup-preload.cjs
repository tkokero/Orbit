const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('orbitTray',{state:()=>ipcRenderer.invoke('orbit-tray:state'),choose:id=>ipcRenderer.invoke('orbit-tray:action',id),onUpdate:fn=>ipcRenderer.on('orbit-tray:update',(_event,data)=>fn(data))});
