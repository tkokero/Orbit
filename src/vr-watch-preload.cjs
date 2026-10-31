const {contextBridge,ipcRenderer}=require('electron');
const on=(name,fn)=>ipcRenderer.on(name,(_e,v)=>fn(v));
contextBridge.exposeInMainWorld('orbitWatch',{data:()=>ipcRenderer.invoke('vr-watch:data'),tool:v=>ipcRenderer.invoke('vr-watch:tool',v),onError:fn=>on('vr-watch:error',fn),onUpdate:fn=>on('vr-watch:update',fn),onPointer:fn=>on('vr-watch:pointer',fn)});
