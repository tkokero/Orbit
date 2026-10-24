// Validation must never activate a native window over a user's game.
function protectWindow(window){
 const state={shown:0,focused:0,blocked:0};
 window.on('show',()=>state.shown++);
 window.on('focus',()=>state.focused++);
 for(const method of ['show','showInactive','focus','restore','maximize','minimize','moveTop','setAlwaysOnTop','setFullScreen','flashFrame']){
  window[method]=()=>{state.blocked++;};
 }
 const capture=window.webContents.capturePage.bind(window.webContents);
 window.webContents.capturePage=(rect,options)=>capture(rect,{...options,stayHidden:true,stayAwake:false});
 window.webContents.setBackgroundThrottling(false);
 return state;
}
module.exports={protectWindow};
