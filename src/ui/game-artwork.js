/* Every named-game menu receives available artwork, with a consistent fallback. */
(()=>{
 let actionObserver=null;
 function releaseActions(){actionObserver?.disconnect();actionObserver=null;}
 document.addEventListener('close',event=>{if(event.target.id==='modal'&&!event.target.open)releaseActions();},true);
 function gameFor(title){return [...state.games].filter(g=>title===g.title||title.startsWith(g.title+' · ')).sort((a,b)=>b.title.length-a.title.length)[0];}
 function markup(g,cls='game-menu-art'){if(cls==='game-menu-art'&&window.OrbitConsole)return OrbitConsole.artwork(g,cls);return `<div class="${cls}">${g?.cover?`<img src="${esc(g.cover)}" alt="" decoding="async" loading="lazy">`:'<span class="game-art-fallback" aria-hidden="true">✦</span>'}</div>`;}
 function decorate(root,title){
  releaseActions();root?.style.removeProperty('scroll-padding-block-start');
  if(!root)return;
  const heading=root.querySelector('.detail-heading');
  if(heading&&!document.documentElement.classList.contains('couch-mode')){
   const actions=root.querySelector(':scope>.detail-actions');
   if(actions){
    root.prepend(actions);
    const updatePadding=entry=>{if(!root.isConnected||!actions.isConnected||!root.closest('dialog')?.open)return;const height=entry?.borderBoxSize?.[0]?.blockSize||actions.getBoundingClientRect().height;root.style.scrollPaddingBlockStart=Math.ceil(height+(parseFloat(getComputedStyle(actions).marginBottom)||0))+'px';};
    actionObserver=new ResizeObserver(entries=>updatePadding(entries[0]));
    actionObserver.observe(actions);
    queueMicrotask(()=>updatePadding());
   }
   if(!heading.querySelector('img,.console-artwork,.detail-placeholder'))heading.insertAdjacentHTML('afterbegin','<span class="detail-placeholder" aria-hidden="true">'+OrbitControllerArt.icon('home')+'</span>');
   return;
  }
  if(root.querySelector('#artwork-editor,.game-menu-art,.detail-art,.controller-context-art,[data-game-banner],[data-launch-options-root],.desktop-runtime,[data-vr-loading]'))return;
  const g=gameFor(title);if(g&&(g.cover||g.hero||document.documentElement.classList.contains('couch-mode')))root.insertAdjacentHTML('afterbegin',markup(g));
 }
 window.OrbitGameArtwork={decorate,markup,thumbnail(id){return markup(state.games.find(g=>g.id===id),'download-game-art');}};
})();
