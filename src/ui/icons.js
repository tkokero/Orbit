/* Shared thumbnail queue. No remote requests until an image is near the viewport. */
(()=>{
 const cache=new Map();let queue=[],active=0;
 const selector='[data-store-icon],[data-game-icon],[data-roblox-icon]';
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);queue.push(entry.target);}drain();},{rootMargin:'100px'});
 function markup(id,store=false){return `<span class="small-game-art" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M6 12h6m-3-3v6m7-4h1m1 3h1"/></svg><img ${store?'data-store-icon':'data-game-icon'}="${String(id).replace(/[&<>"']/g,'')}" alt="" decoding="async"></span>`;}
 const identify=img=>img.hasAttribute('data-roblox-icon')?['r:',img.dataset.robloxIcon]:img.hasAttribute('data-store-icon')?['s:',img.dataset.storeIcon]:['g:',img.dataset.gameIcon];
 function request(img){const [kind,id]=identify(img),key=kind+id;let task=cache.get(key);if(!task){if(cache.size>=192)cache.delete(cache.keys().next().value);task=Promise.resolve().then(()=>kind==='r:'?window.orbit.robloxIcon(id):kind==='s:'?window.orbit.storeIcon(id):window.orbit.gameIcon(id));cache.set(key,task);task.catch(()=>cache.delete(key));}return task;}
 function drain(){while(active<3&&queue.length){const img=queue.shift();if(!img.isConnected)continue;active++;request(img).then(url=>{if(url&&img.isConnected){img.onerror=()=>{img.hidden=true;cache.delete(identify(img).join(''));};img.src=url;img.hidden=false;}else{img.hidden=true;cache.delete(identify(img).join(''));}}).catch(()=>{img.hidden=true;}).finally(()=>{active--;drain();});}}
 function observe(root){queue=queue.filter(img=>img.isConnected);root.querySelectorAll(selector).forEach(img=>observer.observe(img));}
 function unobserve(root){root.querySelectorAll(selector).forEach(img=>observer.unobserve(img));queue=queue.filter(img=>!root.contains(img)&&img.isConnected);}
 window.OrbitIcons={markup,robloxMarkup:id=>markup(id).replace('data-game-icon','data-roblox-icon'),observe,unobserve};
})();
