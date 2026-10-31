const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('vrCapture',{status:value=>ipcRenderer.send('vr-capture:status',value)});
