/* Finite visual transitions. No audio or animation loops. */
(()=>{
 function open(dialog){if(!allowMotion())return;try{const a=dialog.animate([{opacity:0,transform:'translateY(24px) scale(.95)'},{opacity:1,transform:'translateY(-3px) scale(1.008)',offset:.75},{opacity:1,transform:'none'}],{duration:280,easing:'cubic-bezier(.18,.8,.22,1)'});a.finished.catch(()=>{});}catch{}}
 window.OrbitFX={open};
})();
