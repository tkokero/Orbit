/* Finite visual transitions. No audio or animation loops. */
(()=>{
 const active=new WeakMap();
 function open(dialog){
  active.get(dialog)?.cancel();active.delete(dialog);
  if(!allowMotion())return;
  try{
   const animation=dialog.animate([{opacity:0,transform:'translateY(24px) scale(.95)'},{opacity:1,transform:'translateY(-3px) scale(1.008)',offset:.75},{opacity:1,transform:'none'}],{duration:280,easing:'cubic-bezier(.18,.8,.22,1)'});
   animation.id='orbit-dialog-open';active.set(dialog,animation);
   const release=()=>{if(active.get(dialog)===animation)active.delete(dialog);};animation.finished.then(release,release);
  }catch{}
 }
 window.OrbitFX={open};
})();
