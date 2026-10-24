/* A real, repositioning tour over the app. No screenshots or simulated library. */
(()=>{
 let revision=0,index=0,active=false,frame=0,previousFocus,previousTarget,previousDescription,contentAnimation;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('orbit-motion')==='off';
 const ring=document.createElement('div');ring.className='tour-ring';ring.hidden=true;ring.setAttribute('aria-hidden','true');document.body.append(ring);
 const card=document.createElement('section');card.className='tour-card';card.hidden=true;card.setAttribute('role','dialog');card.setAttribute('aria-label','Orbit walkthrough');document.body.append(card);
 card.setAttribute('aria-labelledby','tour-title');card.setAttribute('aria-describedby','tour-description');
 card.innerHTML='<div class="tour-copy"></div><div class="tour-progress" aria-hidden="true"><i></i></div><div class="settings-actions"><button id="tour-back" class="subtle-button">Back</button><button id="tour-next" class="primary-button">Next</button><button id="tour-stop" class="link-button">Close guide</button></div>';
 const copy=card.querySelector('.tour-copy'),back=card.querySelector('#tour-back'),nextButton=card.querySelector('#tour-next');
 const orb=document.createElement('div');orb.className='tour-orb';orb.hidden=true;orb.setAttribute('aria-hidden','true');orb.innerHTML='<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="7" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8"><ellipse cx="32" cy="32" rx="27" ry="11" transform="rotate(-32 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="11" transform="rotate(32 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="11" transform="rotate(90 32 32)"/></g><circle cx="48" cy="13" r="3.5" fill="currentColor"/></svg>';document.body.append(orb);
 const steps=[
 ['#workspace-library','Your library','Your games from different launchers, together. Open a game for details or choose Play to jump in.','library'],
 ['#navigation [data-view=installed]','Installation filters','Find installed games, revisit your favorites, or browse the rest of your library.','library'],
 ['#source-navigation','Your platforms','Choose Steam, Epic Games, or another platform to see its games.','library'],
 ['#hero','Continue playing','Pick up where you left off. Play launches your preferred copy; Details opens its settings.','library'],
 ['#search','Search your library','Search titles, alternate names, and tags. Ctrl+K opens Quick launch from anywhere.','library'],
 ['#advanced-filters','Filters','Narrow your library by playtime, size, tags, or game features.','library'],
 ['.library-collections','Collections','Filter your games by collection, or choose Manage to create and organize collections.','library'],
 ['#library-view-button','Library layout','Switch between Grid and List.','library'],
 ['#game-grid','Game details and right-click','Open a game to manage its artwork, launch settings, saves, and statistics. Right-click for quick actions.','library'],
 ['#workspace-downloads','Downloads','Follow your installations here. Use the original client to pause, resume, or manage a download.','downloads'],
 ['#workspace-store','Radar','Explore upcoming games, featured deals, and your wishlist.','store'],
 ['#workspace-friends','Friends','See supported friends lists and what people are playing. Connect a library to get started.','friends'],
 ['#workspace-tools','Tools','Keep launchers, utilities, and mod managers handy in their own space.','tools'],
 ['#activity-open','Activity and recaps','Look back at the time you’ve played while Orbit was running, with recent sessions and weekly totals.','library'],
 ['#game-storage-open','Storage','See where your games are installed and how much drive space they use.','library'],
 ['#settings-button','Settings','Make Orbit yours with themes, startup movies, connections, and privacy controls. You can reopen this guide from General.','library']].filter(([selector])=>document.querySelector(selector));
 function detach(){if(previousTarget){if(previousDescription===null)previousTarget.removeAttribute('aria-describedby');else previousTarget.setAttribute('aria-describedby',previousDescription);previousTarget=null;}}
 function position(){
  if(!active||card.hidden)return;const r=document.querySelector(steps[index][0])?.getBoundingClientRect(),visible=r&&r.width>0&&r.height>0;
  ring.dataset.targetVisible=String(Boolean(visible));
  if(visible){const left=Math.max(2,r.left-5),top=Math.max(2,r.top-5);ring.style.left=left+'px';ring.style.top=top+'px';ring.style.width=Math.max(0,Math.min(innerWidth-2-left,r.width+10))+'px';ring.style.height=Math.max(0,Math.min(innerHeight-2-top,r.height+10))+'px';}
  const box=card.getBoundingClientRect(),bound=(n,size,limit)=>Math.max(12,Math.min(limit-size-12,n));
  // Prefer the open space beside a sidebar control, then below or above the target.
  let left=(innerWidth-box.width)/2,top=(innerHeight-box.height)/2;
  if(visible){if(r.width<innerWidth*.35&&r.right+box.width+28<innerWidth){left=r.right+24;top=r.top-12;}else{left=r.left;top=r.bottom+24;if(top+box.height>innerHeight-12)top=r.top-box.height-24;}}
  left=bound(left,box.width,innerWidth);top=bound(top,box.height,innerHeight);card.style.transform=`translate3d(${left}px,${top}px,0)`;
  const ox=visible?bound(r.right-18,48,innerWidth):left+box.width-30,oy=visible?bound(r.top-22,48,innerHeight):top-18;
  orb.style.transform=`translate3d(${ox}px,${oy}px,0)`;
 }
 function queue(){cancelAnimationFrame(frame);frame=requestAnimationFrame(position);}
 async function show(next){
  if(!active)return;const ticket=++revision;index=Math.max(0,Math.min(steps.length-1,next));const [selector,title,text,workspace]=steps[index];
  contentAnimation?.cancel();
  // Keep the current explanation visible while a workspace is loading.
  try{if(window.orbitShell.current()!==workspace)await window.orbitShell.activate(workspace);}catch(error){if(ticket===revision){finish();toast('Could not open this part of the guide. Try again.',true);}return;}
  if(!active||ticket!==revision)return;
  const fading=!card.hidden&&!reduced()?copy.animate([{opacity:1},{opacity:0}],{duration:100,fill:'forwards'}):null;contentAnimation=fading;await fading?.finished.catch(()=>{});
  if(!active||ticket!==revision)return;detach();fading?.cancel();
  const target=document.querySelector(selector),first=card.hidden;
  copy.innerHTML=`<small>Orbit guide · ${index+1} / ${steps.length}</small><h2 id="tour-title" tabindex="-1">${esc(title)}</h2><p id="tour-description">${esc(text)}</p>`;
  back.disabled=index===0;nextButton.textContent=index===steps.length-1?'Finish':'Next';card.querySelector('.tour-progress i').style.width=((index+1)/steps.length*100)+'%';
  card.hidden=ring.hidden=orb.hidden=false;
  if(target){previousTarget=target;previousDescription=target.getAttribute('aria-describedby');target.setAttribute('aria-describedby','tour-description');target.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced()?'instant':'smooth'});}
  position();
  if(first){void card.offsetWidth;for(const node of [card,ring,orb])node.classList.add('tour-positioned');}
  if(!reduced()){contentAnimation=copy.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});orb.querySelector('svg').getAnimations().forEach(a=>a.cancel());orb.querySelector('svg').animate([{rotate:'-15deg',scale:.88},{rotate:'8deg',scale:1.08,offset:.65},{rotate:'0deg',scale:1}],{duration:600,easing:'ease-out'});}
  card.querySelector('#tour-title').focus({preventScroll:true});
 }
 async function start(){if(active)return;previousFocus=document.activeElement;active=true;document.addEventListener('scroll',queue,true);window.addEventListener('resize',queue);await show(0);}
 function finish(){revision++;active=false;detach();cancelAnimationFrame(frame);contentAnimation?.cancel();for(const node of [ring,card,orb]){node.hidden=true;node.classList.remove('tour-positioned');for(const animation of node.getAnimations({subtree:true}))animation.cancel();}document.removeEventListener('scroll',queue,true);window.removeEventListener('resize',queue);window.orbitShell.activate('library');if(previousFocus?.isConnected)previousFocus.focus?.({preventScroll:true});}
 back.onclick=()=>show(index-1);nextButton.onclick=()=>index===steps.length-1?finish():show(index+1);card.querySelector('#tour-stop').onclick=finish;
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();finish();}});
 window.orbitTour={start,finish,next:()=>show(index+1),current:()=>index,active:()=>active,steps:steps.length};
})();
