/* Bounded Steam news shelf: cached metadata, two thumbnail jobs, no polling. */
(()=>{
 const shelf=document.createElement('section');shelf.id='news-shelf';shelf.hidden=true;shelf.innerHTML='<div class="news-shelf-heading"><h2>What’s new</h2><div><button class="subtle-button" data-news-prev aria-label="Previous news">‹</button><button class="subtle-button" data-news-next aria-label="Next news">›</button></div></div><div class="news-strip"></div>';$('#recent-games').after(shelf);
 const near=new WeakSet(),urls=new WeakMap(),pending=new WeakSet();
 let data=null,loadedAt=0,busy=false,ticket=0,queue=[],active=0,painted=false;
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const img=e.target;if(e.isIntersecting){near.add(img);if(urls.has(img))img.src=urls.get(img);else if(!pending.has(img)){pending.add(img);queue.push(img);}}else{near.delete(img);if(img.hasAttribute('src'))window.orbitMemory?.trim();img.removeAttribute('src');}}drain();},{rootMargin:'80px'});
 function visible(){return !document.hidden&&!document.documentElement.classList.contains('couch-home-active')&&!$('#library-panel').hidden&&state.section==='games';}
 function drain(){while(active<2&&queue.length){const img=queue.shift();if(!visible()||!img.isConnected||!near.has(img)){pending.delete(img);continue;}active++;window.orbit.newsImage({id:img.dataset.newsGame,postId:img.dataset.newsPost}).then(url=>{if(url&&img.isConnected){urls.set(img,url);if(visible()&&near.has(img)){img.src=url;img.onerror=()=>{img.hidden=true;};}}}).catch(()=>{}).finally(()=>{pending.delete(img);active--;drain();});}}

 function markup(p,gameId){return `<img data-news-game="${esc(gameId)}" data-news-post="${esc(p.id)}" alt="" decoding="async" loading="lazy">`;}
 function observe(root){root.querySelectorAll('[data-news-post]').forEach(img=>observer.observe(img));}
 function release(){observer.disconnect();queue=[];shelf.querySelector('.news-strip').replaceChildren();painted=false;}
 function paint(){if(!visible()||!data)return;shelf.hidden=!data.posts.length;if(painted)return;observer.disconnect();queue=[];shelf.querySelector('.news-strip').innerHTML=data.posts.map(p=>`<button class="news-banner" data-news-id="${esc(p.id)}" data-news-game-id="${esc(p.gameId)}"><span class="news-art">${markup(p,p.gameId)}</span><small>${esc(p.gameTitle)}${p.date?' · '+new Date(p.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}):''}</small><strong>${esc(p.title)}</strong>${p.stale?'<small>Cached</small>':''}</button>`).join('');painted=true;observe(shelf);}
 async function render(){if(!window.orbit.newsShelf||!state.games.some(g=>g.newsSupported||g.sources?.includes('Steam'))||!visible()){shelf.hidden=true;return;}paint();if(busy||Date.now()-loadedAt<1800000)return;busy=true;const own=++ticket;try{const result=await window.orbit.newsShelf();if(own!==ticket)return;data=result;loadedAt=Date.now();painted=false;paint();}catch{loadedAt=Date.now()-1740000;}finally{busy=false;}}
 shelf.onclick=e=>{const article=e.target.closest('[data-news-id]');if(article)attempt(()=>window.OrbitNewsReader.open({id:article.dataset.newsGameId,postId:article.dataset.newsId}));if(e.target.closest('[data-news-prev],[data-news-next]'))shelf.querySelector('.news-strip').scrollBy({left:e.target.closest('[data-news-prev]')?-600:600,behavior:allowMotion()?'smooth':'instant'});};
 window.orbitNews={render,release,markup,observe};render();
})();

