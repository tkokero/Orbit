/* Shared popup entrance starts after synchronous layout, including remembered positions. */
(()=>{
 const active=new WeakMap();
 function open(dialog){
  active.get(dialog)?.();
  if(!allowMotion())return;
  try{
   for(const a of dialog.getAnimations())if(a.animationName==='dialog-pop')a.cancel();
   const animation=dialog.animate([{opacity:0,translate:'0 20px',scale:'.96'},{opacity:1,translate:'0 -2px',scale:'1.006',offset:.8},{opacity:1,translate:'0 0',scale:'1'}],{duration:280,easing:'cubic-bezier(.18,.8,.22,1)',fill:'both'});
   animation.id='orbit-dialog-open';animation.pause();animation.currentTime=0;let frame=0,closed=false;const onClose=()=>{if(!dialog.open)release();};
   function release(){if(closed)return;closed=true;cancelAnimationFrame(frame);dialog.removeEventListener('close',onClose);if(active.get(dialog)===release)active.delete(dialog);animation.cancel();}
   active.set(dialog,release);dialog.addEventListener('close',onClose);
   frame=requestAnimationFrame(()=>{frame=0;if(dialog.open&&allowMotion())animation.play();else release();});
   animation.finished.then(release,release);
  }catch{}
 }
 window.OrbitFX={open};
})();
