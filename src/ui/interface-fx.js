/* Shared popup entrance starts after synchronous layout, including remembered positions. */
(()=>{
 const active=new WeakMap(),surfaces=new WeakMap(),ease='cubic-bezier(.22,1,.36,1)';
 function open(dialog,resume=null){
  const previous=active.get(dialog),style=previous&&typeof getComputedStyle==='function'?getComputedStyle(dialog):null;
  const from=resume|| (style?{opacity:style.opacity,translate:style.translate,scale:style.scale}:{opacity:0,translate:'0 10px',scale:'.985'});
  previous?.();
  if(!allowMotion())return;
  try{
   for(const a of dialog.getAnimations())if(a.animationName==='dialog-pop')a.cancel();
   const animation=dialog.animate([from,{opacity:1,translate:'0 0',scale:'1'}],{duration:200,easing:ease,fill:'both'});
   animation.id='orbit-dialog-open';animation.pause();animation.currentTime=0;let frame=0,closed=false;const onClose=()=>{if(!dialog.open)release();};
   function release(){if(closed)return;closed=true;cancelAnimationFrame(frame);dialog.removeEventListener('close',onClose);if(active.get(dialog)===release)active.delete(dialog);animation.cancel();}
   active.set(dialog,release);dialog.addEventListener('close',onClose);
   frame=requestAnimationFrame(()=>{frame=0;if(dialog.open&&allowMotion())animation.play();else release();});
   animation.finished.then(release,release);
  }catch{}
 }
 function content(element){
  if(!element)return;
  // Animate a destination label, keeping scrollable click targets out of compositor layers.
  if(element.matches&&!element.matches('#page-title,h1,h2,h3'))element=element.querySelector(':scope > .settings-group > h2')||element.closest('dialog')?.querySelector('.modal-header h2');
  if(!element||element.querySelector?.('button,input,select,textarea'))return;
  const previous=surfaces.get(element),style=previous&&typeof getComputedStyle==='function'?getComputedStyle(element):null,from=style?{opacity:style.opacity,translate:style.translate}:{opacity:.45,translate:'0 4px'};previous?.();if(!allowMotion())return;
  try{const animation=element.animate([from,{opacity:1,translate:'0 0'}],{duration:140,easing:ease});animation.id='orbit-content-change';let closed=false;const release=()=>{if(closed)return;closed=true;if(surfaces.get(element)===release)surfaces.delete(element);animation.cancel();};surfaces.set(element,release);animation.finished.then(release,release);}catch{}
 }
 window.OrbitFX={open,content};
})();
