/* A short guide over the real app. Navigation never changes saved choices. */
(()=>{
 let revision=0,index=0,active=false,frame=0,previousTarget,previousDescription,contentAnimation,origin;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches||localStorage.getItem('orbit-motion')==='off';
 const ring=document.createElement('div');ring.className='tour-ring';ring.hidden=true;ring.setAttribute('aria-hidden','true');document.body.append(ring);
 const card=document.createElement('section');card.className='tour-card';card.hidden=true;card.setAttribute('role','dialog');card.setAttribute('aria-labelledby','tour-title');card.setAttribute('aria-describedby','tour-description');document.body.append(card);
 card.innerHTML='<div class="tour-copy" aria-live="polite"></div><div class="tour-progress" aria-hidden="true"><i></i></div><div class="settings-actions"><button id="tour-back" class="subtle-button">Back</button><button id="tour-next" class="primary-button">Next</button><button id="tour-stop" class="link-button">Close guide</button></div>';
 const copy=card.querySelector('.tour-copy'),back=card.querySelector('#tour-back'),nextButton=card.querySelector('#tour-next');
 const orb=document.createElement('div');orb.className='tour-orb';orb.hidden=true;orb.setAttribute('aria-hidden','true');orb.innerHTML='<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="7" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8"><ellipse cx="32" cy="32" rx="27" ry="11" transform="rotate(-32 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="11" transform="rotate(32 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="11" transform="rotate(90 32 32)"/></g><circle cx="48" cy="13" r="3.5" fill="currentColor"/></svg>';document.body.append(orb);
 // Resolve targets after their workspace opens, rather than while scripts load.
 const steps=[
  ['#workspace-library','Your games','Your games live here. Open one for details, or choose Play.','library'],
  ['#hero','Pick up where you left off','Your recent game is up front. Play uses your preferred copy.','library'],
  ['#quick-launch','Quick launch','Press Ctrl+K to find and launch a game from any page.','library'],
  ['#navigation [data-view=installed]','Find games to play','Show installed games, favorites, or games you still need to install.','library'],
  ['#source-navigation','Choose a platform','Use this list to show games from one launcher.','library'],
  ['.library-collections','Keep games together','Use Manage to make collections. Pin them in the sidebar.','library'],
  ['#library-select','Change several games','Choose Select, or hold Ctrl or Shift, to pick games. Change them together; Undo puts them back.','library'],
  ['#search','Find a game','Search by name or tag. Press Ctrl+F to jump here.','library'],
  ['#advanced-filters','Narrow the list','Filter by playtime, size, tags, or game features. Clear a filter to see more games.','library'],
  ['#library-view-button','Choose your layout','Open View for covers, banners, or a list. Adjust card size and spacing there too.','library'],
  ['#game-grid [data-game]','More game options','Open Details for launch settings, artwork, and saves. Right-click a game for quick actions.','library'],
  ['#activity-open','Your play history','See recent sessions and playtime recorded while Orbit was running.','library'],
  ['#game-storage-open','Check storage','See your game folders and how much space they use.','library'],
  ['#settings-button','Settings','Choose themes, resize popups, and set privacy options. Reopen this guide in General.','library'],
  ['#workspace-downloads','Follow your downloads','See progress, search the queue, and use each game’s controls.','downloads'],
  ['#steam-background-controls','Steam controls','Open Steam here for downloads, library folders, and game moves. Your Downloads page stays open.','downloads'],
  ['.download-history','Recently finished','Completed downloads appear here. Select one to open its game details.','downloads'],
  ['#release-calendar','See what’s coming','Pick a day to see its releases. Dates can change.','store'],
  ['.radar-following','Save games for later','Add games to your wishlist and check their prices when you want.','store'],
  ['#radar-deals','Browse deals','See Steam offers here. The store confirms the final price.','store'],
  ['#friends-connections','Connect your friends','Open Accounts to connect Steam or Discord. You choose what to allow.','friends'],
  ['.friends-controls','See who’s around','Online shows playing friends first, then DND, then online. All friends includes other statuses.','friends'],
  ['#workspace-tools','Your tools','Keep launchers, utilities, and mod managers together here.','tools'],
 ];
 function detach(){if(previousTarget){if(previousDescription===null)previousTarget.removeAttribute('aria-describedby');else previousTarget.setAttribute('aria-describedby',previousDescription);previousTarget=null;}}
 const visible=e=>Boolean(e?.isConnected&&e.checkVisibility()&&e.getBoundingClientRect().width&&e.getBoundingClientRect().height);
 function target(){const found=document.querySelector(steps[index][0]);return visible(found)?found:document.querySelector('#workspace-'+steps[index][3]);}
 function position(){
  if(!active||card.hidden)return;
  const element=target(),r=visible(element)?element.getBoundingClientRect():null,box=card.getBoundingClientRect();
  const margin=Math.min(48,Math.max(16,innerHeight*.04));
  const left=Math.max(12,(innerWidth-box.width)/2),top=Math.max(12,innerHeight-box.height-margin);
  const ox=left+box.width-48,oy=top-16;
  const reserve=Math.ceil(box.height+margin+16)+'px';if(document.documentElement.style.getPropertyValue('--tour-reserve')!==reserve)document.documentElement.style.setProperty('--tour-reserve',reserve);
  // Read geometry first; write once per frame to avoid forced layout on scroll.
  ring.dataset.targetVisible=String(Boolean(r));
  if(r){const x=Math.max(2,r.left-5),y=Math.max(2,r.top-5);Object.assign(ring.style,{left:x+'px',top:y+'px',width:Math.max(0,Math.min(innerWidth-2-x,r.width+10))+'px',height:Math.max(0,Math.min(innerHeight-2-y,r.height+10))+'px'});}
  card.style.transform=`translate3d(${left}px,${top}px,0)`;orb.style.transform=`translate3d(${ox}px,${oy}px,0)`;
  if(element&&element!==previousTarget){detach();previousTarget=element;previousDescription=element.getAttribute('aria-describedby');element.setAttribute('aria-describedby','tour-description');resize.disconnect();resize.observe(card);resize.observe(element);}
 }
 function queue(){if(active&&!frame)frame=requestAnimationFrame(()=>{frame=0;position();});}
 const resize=new ResizeObserver(queue);
 async function show(next){
  if(!active)return;const ticket=++revision;index=Math.max(0,Math.min(steps.length-1,next));const [,title,text,workspace]=steps[index];
  contentAnimation?.cancel();
  try{if(window.orbitShell.current()!==workspace)await window.orbitShell.activate(workspace);}catch{if(ticket===revision){finish();toast('Could not open this part of the guide. Try again.',true);}return;}
  if(!active||ticket!==revision)return;detach();resize.disconnect();
  const first=card.hidden,control=document.activeElement;
  copy.innerHTML=`<small>Step ${index+1} of ${steps.length}</small><h2 id="tour-title" tabindex="-1">${esc(title)}</h2><p id="tour-description">${esc(text)}</p>`;
  back.disabled=index===0;nextButton.textContent=index===steps.length-1?'Finish':'Next';card.querySelector('.tour-progress i').style.width=((index+1)/steps.length*100)+'%';
  card.hidden=ring.hidden=orb.hidden=false;
  const element=target();if(element){previousTarget=element;previousDescription=element.getAttribute('aria-describedby');element.setAttribute('aria-describedby','tour-description');element.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});resize.observe(element);}
  resize.observe(card);position();
  if(element&&document.querySelector('#main-scroll').contains(element)){const r=element.getBoundingClientRect(),dock=card.getBoundingClientRect();if(r.right>dock.left&&r.left<dock.right&&r.bottom>dock.top-20&&r.top<dock.bottom)document.querySelector('#main-scroll').scrollBy({top:r.bottom-dock.top+20,behavior:'instant'});position();}
  if(first)for(const node of [card,ring,orb])node.classList.add('tour-positioned');
  if(!reduced()){contentAnimation=copy.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});}
  (card.contains(control)&&control.tagName==='BUTTON'&&!control.disabled?control:nextButton).focus({preventScroll:true});
 }
 async function start(){
  if(active)return;
  const focus=document.activeElement,attribute=['id','data-game','data-list-play','data-source'].find(key=>focus?.hasAttribute(key));
  origin={workspace:window.orbitShell.current(),state:Object.fromEntries(['section','view','source','search','sort','page','list'].map(k=>[k,state[k]])),scroll:document.querySelector('#main-scroll').scrollTop,focus,focusKey:attribute?[attribute,focus.getAttribute(attribute)]:null,selection:window.orbitDesktopLibrary?.captureSelection(),couch:document.documentElement.classList.contains('couch-mode')};
  active=true;document.documentElement.classList.add('tour-active');if(origin.couch)window.orbitFeatures.setCouch(false);document.addEventListener('scroll',queue,{capture:true,passive:true});window.addEventListener('resize',queue);await show(0);
 }
 async function finish(){
  if(!active)return;const ticket=++revision,saved=origin;origin=null;active=false;document.documentElement.classList.remove('tour-active');document.documentElement.style.removeProperty('--tour-reserve');detach();resize.disconnect();cancelAnimationFrame(frame);frame=0;contentAnimation?.cancel();
  for(const node of [ring,card,orb]){node.hidden=true;node.classList.remove('tour-positioned');for(const animation of node.getAnimations({subtree:true}))animation.cancel();}
  document.removeEventListener('scroll',queue,true);window.removeEventListener('resize',queue);
  try{const restoring=window.orbitShell.activate(saved.workspace),navigation=window.orbitShell.revision;await restoring;if(active||ticket!==revision||window.orbitShell.revision!==navigation)return;Object.assign(state,saved.state);const search=document.querySelector('#search'),sort=document.querySelector('#sort');search.value=state.search||'';if(state.sort)sort.value=state.sort;render();window.orbitDesktopLibrary?.restoreSelection(saved.selection);if(saved.couch)window.orbitFeatures.setCouch(true);document.querySelector('#main-scroll').scrollTop=saved.scroll;const matched=saved.focusKey&&document.querySelector('['+saved.focusKey[0]+'="'+CSS.escape(saved.focusKey[1])+'"]'),focus=visible(saved.focus)?saved.focus:visible(matched)?matched:document.querySelector('#workspace-'+saved.workspace);focus?.focus({preventScroll:true});}catch{toast('The guide closed. Choose a page to continue.',true);}
 }
 back.onclick=()=>show(index-1);nextButton.onclick=()=>index===steps.length-1?finish():show(index+1);card.querySelector('#tour-stop').onclick=finish;
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();finish();}});
 window.orbitTour={start,finish,next:()=>show(index+1),current:()=>index,active:()=>active,steps:steps.length};
})();
