/* Shared finite scenes for startup and the Settings preview. No looping timers. */
(()=>{
 const styles=[{id:'bubbles',name:'Bubble Orbit',hint:'A soft, springy arrival'},{id:'startrail',name:'Startrail',hint:'A comet finds its orbit'},{id:'constellation',name:'Constellation',hint:'Stars connect in the dark'},{id:'warp',name:'Warp Jump',hint:'A quick trip through starlight'},{id:'eclipse',name:'Eclipse',hint:'A planet crosses a glowing sun'},{id:'nebula',name:'Nebula Drift',hint:'Drift through glowing gas and stardust'},{id:'singularity',name:'Singularity',hint:'A secret gravity well bends its universe',secret:true},{id:'supernova',name:'Supernova',hint:'A secret star blooms into a new beginning',secret:true},{id:'bigbang',name:'Big Bang',hint:'Every orbit. One new universe.',secret:true},{id:'goatkero',name:'Goatkero',secret:true},{id:'void',name:'Void',secret:true},{id:'afterglow',name:'Afterglow',secret:true},{id:'afterglow-encore',name:'Afterglow: Encore',secret:true}];
 const secrets=styles.filter(style=>style.secret).map(style=>style.id);
 const unlocked=()=>{try{return JSON.parse(localStorage.getItem('orbit-secret-startups')||'[]').filter(id=>secrets.includes(id));}catch{return [];}};
 function unlock(id){const next=[...new Set([...unlocked(),id])].filter(id=>secrets.includes(id));localStorage.setItem('orbit-secret-startups',JSON.stringify(next));window.dispatchEvent(new Event('orbit-startups-unlocked'));}
 const template=document.querySelector('#orbit-boot').innerHTML;
 const valid=id=>styles.some(s=>s.id===id)||id==='custom';
 const duration=id=>({singularity:5200,supernova:5400,nebula:3200,bigbang:7600,goatkero:5800,void:6600,afterglow:6400,'afterglow-encore':8000})[id]||1750;
 function selected(){try{const id=localStorage.getItem('orbit-startup-style');return valid(id)?id:'bubbles';}catch{return 'bubbles';}}
 function apply(root,id){root.dataset.startupStyle=valid(id)?id:'bubbles';if(root.querySelector('.boot-feature'))return;const feature=document.createElement('div');feature.className='boot-feature';feature.setAttribute('aria-hidden','true');feature.innerHTML='<div class="startup-bubbles">'+Array.from({length:8},()=>'<i></i>').join('')+'</div><div class="startup-ripples"><i></i><i></i></div><div class="startup-burst">'+Array.from({length:16},()=>'<i></i>').join('')+'</div><div class="startup-trail"></div><div class="startup-corona"></div><div class="startup-streaks">'+Array.from({length:12},(_,i)=>'<i></i>').join('')+'</div><svg class="startup-constellation" viewBox="0 0 320 260" fill="none"><path d="M42 167 97 56 189 37 272 122 205 211 109 196 42 167 189 37 205 211 97 56 272 122 109 196"/>'+[[42,167],[97,56],[189,37],[272,122],[205,211],[109,196]].map(([cx,cy],i)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+(i%2?5:7)+'"/>').join('')+'</svg>';root.querySelector('.boot-scene').prepend(feature);}
 function stopVideo(video){if(!video)return;video.onended=video.onerror=video.onloadedmetadata=video.onplaying=null;video.pause();video.removeAttribute('src');video.load();video.remove();}
 function play(root,{style=selected(),reduced=false,holdFrame=false}={}){
  apply(root,style);root.style.setProperty('--startup-duration',duration(style)+'ms');root.classList.toggle('boot-still',reduced);let finished=false,fellBack=false,video,loadTimer,resolve;const timers=new Set(),started=performance.now(),done=new Promise(r=>resolve=r);
  if(['nebula','bigbang'].includes(style)){const feature=root.querySelector('.boot-feature');if(!feature.querySelector('.startup-nebula'))feature.insertAdjacentHTML('beforeend','<div class="startup-nebula"><i></i><i></i><i></i></div><div class="startup-orbiters"><i></i><i></i><i></i></div>');}
  const cosmic=style==='afterglow-encore'?window.OrbitStartupEncore?.play(root,{reduced,duration:duration(style)}):style==='afterglow'?window.OrbitStartupAfterglow?.play(root,{reduced,duration:duration(style)}):style==='void'?window.OrbitStartupVoid?.play(root,{reduced,duration:duration(style)}):style==='goatkero'?window.OrbitStartupGoatkero?.play(root,{reduced,duration:duration(style)}):reduced?null:style==='nebula'?window.OrbitStartupNebula?.play(root,style,duration(style)):['singularity','supernova','bigbang'].includes(style)?window.OrbitStartupCosmos?.play(root,style,duration(style)):null;
  let stopAudio=()=>{},audioStarted=false;const visibleAudio=()=>{if(!finished&&!audioStarted&&!document.hidden&&!reduced){audioStarted=true;stopAudio=window.OrbitStartupAudio?.play(style)||(()=>{});document.removeEventListener('visibilitychange',visibleAudio);}};
  const later=(fn,delay)=>{const t=setTimeout(()=>{timers.delete(t);fn();},delay);timers.add(t);return t;};
  const release=()=>{cosmic?.release();stopVideo(video);video=null;root.classList.remove('startup-has-video');};
  const finish=()=>{if(finished)return;finished=true;for(const t of timers)clearTimeout(t);timers.clear();document.removeEventListener('visibilitychange',visibleAudio);stopAudio();cosmic?.stop();if(holdFrame){for(const animation of root.getAnimations({subtree:true}))animation.pause();if(video){video.onended=video.onerror=video.onloadedmetadata=video.onplaying=null;video.pause();}}else release();resolve();};
  const fallback=()=>{if(finished||fellBack)return;fellBack=true;clearTimeout(loadTimer);stopVideo(video);video=null;root.classList.remove('startup-has-video');apply(root,'bubbles');later(finish,Math.max(200,1750-(performance.now()-started)));};
  const skip=document.createElement('button');skip.className='startup-skip subtle-button';skip.type='button';skip.textContent='Skip intro';skip.onclick=finish;root.append(skip);
  if(!reduced){visibleAudio();if(!audioStarted)document.addEventListener('visibilitychange',visibleAudio);}
  if(reduced)later(finish,0);
  else if(style!=='custom')later(finish,duration(style));
  else{
   loadTimer=later(fallback,2200);
   Promise.resolve().then(()=>window.orbit.startupVideo?.()).then(saved=>{
    if(finished||fellBack)return;if(!saved?.url||!/^file:/i.test(saved.url)){fallback();return;}
    video=document.createElement('video');video.className='startup-video';video.muted=true;video.defaultMuted=true;video.playsInline=true;video.disablePictureInPicture=true;video.preload='auto';video.setAttribute('aria-hidden','true');video.onended=finish;video.onerror=fallback;
    video.onloadedmetadata=()=>{if(!Number.isFinite(video.duration)||video.duration<=0||video.duration>15||video.videoWidth<1||video.videoHeight<1||video.videoWidth*video.videoHeight>1920*1080||Math.max(video.videoWidth,video.videoHeight)>1920){fallback();return;}video.play().catch(fallback);};
    video.onplaying=()=>{clearTimeout(loadTimer);root.classList.add('startup-has-video');later(finish,Math.min(15500,video.duration*1000+800));};
    root.append(video);video.src=saved.url;video.load();
   }).catch(fallback);
  }
  return {done,stop:finish,skip:finish,release};
 }
 // Shrink the held artwork over a steady destination; never resize the interface.
 function exit(element,{reduced=false,reveal=()=>{}}={}){
  return new Promise(resolve=>{let finished=false,deadline,animations=[];const finish=()=>{if(finished)return;finished=true;clearTimeout(deadline);for(const a of animations)try{a.cancel();}catch{}resolve();};
   try{reveal();if(reduced){finish();return;}deadline=setTimeout(finish,950);const options={duration:560,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
    const artwork=element.querySelector('.startup-cover')||element;
    for(const target of artwork.querySelectorAll('.boot-scene,.boot-bubbles,.startup-cosmos,.startup-void,.startup-afterglow,.startup-encore,.void-wordmark,.startup-video,.goatkero-stage'))animations.push(target.animate([{scale:1},{scale:.78}],options));
    animations.push(element.animate([{opacity:1},{opacity:1,offset:.06},{opacity:0}],options));
    Promise.allSettled(animations.map(a=>a.finished)).then(finish,finish);
   }catch{finish();}
  });
 }
 function create(){const root=document.createElement('div');root.className='startup-cover';root.innerHTML=template;return root;}
 window.OrbitStartup={get styles(){const found=unlocked();return styles.filter(s=>!s.secret||found.includes(s.id)||s.id==='afterglow-encore'&&found.includes('afterglow'));},unlock,unlocked,selected,apply,play,create,stopVideo,exit,duration};
})();
