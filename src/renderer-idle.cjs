// Keep native services alive while releasing an unused tray renderer.
function idleRenderer(window,{delay=30000,canSleep=async()=>true,beforeSleep=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let timer,stopped=false;
 const cancel=()=>{clearTimer(timer);timer=null;};
 const schedule=()=>{cancel();if(stopped||window.isDestroyed()||window.isVisible())return;timer=setTimer(async()=>{timer=null;try{if(!stopped&&!window.isDestroyed()&&!window.isVisible()&&await canSleep()){if(stopped||window.isDestroyed()||window.isVisible())return;beforeSleep();window.destroy();}else schedule();}catch{schedule();}},delay);timer?.unref?.();};
 window.on('hide',schedule);window.on('show',cancel);window.on('closed',()=>{stopped=true;cancel();});schedule();
 return {stop(){stopped=true;cancel();},schedule};
}
module.exports={idleRenderer};
