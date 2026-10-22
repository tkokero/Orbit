/* Scene playback and library loading are independent; both must finish. */
(()=>{
 const cover=document.querySelector('#orbit-boot'),shell=document.querySelector('.app-shell');shell.inert=true;
 const debugReplay=Boolean(window.orbitDebug)&&new URLSearchParams(location.search).get('debug-intro')==='1';
 let reduced=(!debugReplay&&new URLSearchParams(location.search).get('resume')==='1')||matchMedia('(prefers-reduced-motion: reduce)').matches;try{reduced ||=localStorage.getItem('orbit-motion')==='off'||(!debugReplay&&localStorage.getItem('orbit-intro')==='off');}catch{}
 const playback=OrbitStartup.play(cover,{reduced,holdFrame:true});let loaded=false,sceneDone=false,exiting=false,resolve;const done=new Promise(r=>resolve=r);
 const hint=document.createElement('p');hint.className='startup-load-hint';hint.hidden=true;hint.textContent='Opening your library…';cover.append(hint);
 async function leave(){if(!loaded||!sceneDone||exiting)return;exiting=true;cover.classList.add('boot-leaving');
  try{await OrbitStartup.exit(cover,{reduced,reveal:()=>document.body.classList.add('boot-revealing')});}
  finally{try{playback.release();}finally{cover.remove();document.body.classList.remove('booting','boot-revealing');shell.inert=false;resolve();}}
 }

 playback.done.then(()=>{sceneDone=true;hint.hidden=loaded;const skip=cover.querySelector('.startup-skip');if(skip){skip.disabled=true;skip.hidden=true;}leave();});
 document.addEventListener('keydown',e=>{if(!exiting&&e.key==='Escape'&&cover.isConnected){e.preventDefault();playback.skip();}});
 window.orbitBoot={done,ready(){loaded=true;hint.hidden=true;leave();},skip:()=>playback.skip()};
})();
