/* One finite CSS sequence; library work runs concurrently underneath. */
(()=>{
 const cover=document.querySelector('#orbit-boot'),shell=document.querySelector('.app-shell');
 let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;try{reduced ||=localStorage.getItem('orbit-motion')==='off'||localStorage.getItem('orbit-intro')==='off';}catch{}
 if(reduced)cover.classList.add('boot-still');
 let resolve,finished=false;const done=new Promise(r=>resolve=r),started=performance.now();
 window.orbitBoot={done,ready(){if(finished)return;finished=true;setTimeout(()=>{
  document.body.classList.remove('booting');
  shell.inert=false;
  let completed=false,deadline,animations=[];
  const finish=()=>{if(completed)return;completed=true;clearTimeout(deadline);for(const animation of animations)try{animation.cancel();}catch{}shell.inert=false;cover.remove();resolve();};
  if(reduced){finish();return;}
  cover.classList.add('boot-leaving');
  const scene=cover.querySelector('.boot-scene');
  deadline=setTimeout(finish,700);
  try{animations=[
   cover.animate([{opacity:1},{opacity:0}],{duration:420,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'}),
   scene.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.12) translateY(-8px)'}],{duration:340,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'})
   // Animate only the cover: the interactive menu stays in its final layout.
  ];
  Promise.allSettled(animations.map(a=>a.finished)).then(finish,finish);
  }catch{finish();}
 },Math.max(0,(reduced?0:1900)-(performance.now()-started)));}};
})();
