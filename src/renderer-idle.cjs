// Keep native services alive while releasing an unused tray renderer.
function idleRenderer(window,{delay=2000,canSleep=async()=>true,beforeSleep=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let timer,stopped=false,generation=0;
 const cancel=()=>{generation++;clearTimer(timer);timer=null;};
 const schedule=()=>{cancel();if(stopped||window.isDestroyed()||window.isVisible())return;const revision=generation;timer=setTimer(async()=>{timer=null;const current=()=>revision===generation&&!stopped&&!window.isDestroyed()&&!window.isVisible();try{if(!current())return;const allowed=await canSleep();if(!current())return;if(allowed){beforeSleep();window.destroy();}else schedule();}catch{if(current())schedule();}},delay);timer?.unref?.();};
 window.on('hide',schedule);window.on('show',cancel);window.on('closed',()=>{stopped=true;cancel();});schedule();
 return {stop(){stopped=true;cancel();},schedule};
}
module.exports={idleRenderer};
