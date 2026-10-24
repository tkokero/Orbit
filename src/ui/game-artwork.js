/* Every named-game menu receives available artwork, with a consistent fallback. */
(()=>{
 function gameFor(title){return [...state.games].filter(g=>title===g.title||title.startsWith(g.title+' · ')).sort((a,b)=>b.title.length-a.title.length)[0];}
 function markup(g,cls='game-menu-art'){if(cls==='game-menu-art'&&window.OrbitConsole)return OrbitConsole.artwork(g,cls);return `<div class="${cls}">${g?.cover?`<img src="${esc(g.cover)}" alt="" decoding="async" loading="lazy">`:'<span class="game-art-fallback" aria-hidden="true">✦</span>'}</div>`;}
 function decorate(root,title){if(!root||root.querySelector('.game-menu-art,.detail-art,.controller-context-art,[data-game-banner]'))return;const g=gameFor(title);if(g)root.insertAdjacentHTML('afterbegin',markup(g));}
 window.OrbitGameArtwork={decorate,markup,thumbnail(id){return markup(state.games.find(g=>g.id===id),'download-game-art');}};
})();
