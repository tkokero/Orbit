(()=>{
 const controlMarkup=new WeakMap();
 const art=item=>item.hero||(/^\d+$/.test(String(item.appId))?'https://cdn.akamai.steamstatic.com/steam/apps/'+item.appId+'/library_hero.jpg':null);
 function render(root,item,controls){if(!item){root.hidden=true;root.replaceChildren();delete root.dataset.key;return;}root.hidden=false;const key=item.key||String(item.appId),image=art(item);
  if(root.dataset.key!==key){root.dataset.key=key;root.innerHTML=`<div class="download-banner-art" aria-hidden="true">${image?`<img src="${esc(image)}" alt="" decoding="async">`:''}</div><div class="download-banner-shade"></div><div class="download-banner-content"><span class="eyebrow" data-banner-state></span><h2 data-banner-title></h2><div class="download-banner-progress"><div class="transfer-heading"><span data-banner-bytes></span><strong data-banner-percent></strong></div><progress max="100" data-banner-progress></progress><div class="download-banner-stats"><span data-banner-rate></span><span data-banner-eta></span></div></div><div class="settings-actions" data-banner-actions></div></div>`;const game=state.games.find(g=>g.id===item.id||g.versions?.some(v=>Number(v.appId)>0&&Number(v.appId)===Number(item.appId)));if(game&&window.OrbitConsole){root.querySelector('.download-banner-art').innerHTML=OrbitConsole.artwork(game,'download-banner-picture');OrbitConsole.observeArtwork(root);}const img=game?null:root.querySelector('img');if(img)img.onerror=()=>{if(img.dataset.fallback||!item.appId){img.remove();return;}img.dataset.fallback='1';img.src='https://cdn.akamai.steamstatic.com/steam/apps/'+item.appId+'/header.jpg';};}
  root.querySelector('[data-banner-title]').textContent=item.title;root.querySelector('[data-banner-state]').textContent=item.status||(item.active?'Downloading now':item.paused?'Download paused':'Next in queue');root.querySelector('[data-banner-bytes]').textContent=bytes(item.done)+(item.total>0?' of '+bytes(item.total):'');root.querySelector('[data-banner-percent]').textContent=item.percent==null?'':Math.floor(item.percent*10)/10+'%';const p=root.querySelector('progress');p.setAttribute('aria-label','Download progress for '+item.title);if(item.percent==null)p.removeAttribute('value');else p.value=item.percent;
  root.querySelector('[data-banner-rate]').textContent=item.active&&item.rate>0?bytes(item.rate)+'/s':'';root.querySelector('[data-banner-eta]').textContent=item.active&&Number.isFinite(item.etaSeconds)&&item.etaSeconds>0?Math.ceil(item.etaSeconds/60)+' min remaining':'';const actions=root.querySelector('[data-banner-actions]');if(controlMarkup.get(actions)!==controls){actions.innerHTML=controls;controlMarkup.set(actions,controls);}
 }
 function watch(root,refresh,{interval=1000}={}){
  const dialog=root.closest('dialog');let timer,busy=false,stopped=false,observer;
  const alive=()=>root.isConnected&&(!dialog||dialog.open&&!dialog.classList.contains('dialog-closing'));
  const visible=()=>!document.hidden&&root.checkVisibility();
  function stop(){if(stopped)return;stopped=true;clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);dialog?.removeEventListener('close',stop);observer?.disconnect();}
  function schedule(){clearTimeout(timer);if(stopped)return;if(!alive()){stop();return;}if(visible())timer=setTimeout(tick,interval);}
  async function tick(){clearTimeout(timer);if(stopped||busy)return;if(!alive()){stop();return;}if(!visible())return;busy=true;try{await refresh();}catch{}finally{busy=false;schedule();}}
  function visibility(){clearTimeout(timer);if(!alive()){stop();return;}if(visible())void tick();}
  document.addEventListener('visibilitychange',visibility);dialog?.addEventListener('close',stop);
  if(dialog){observer=new MutationObserver(()=>{if(!alive())stop();});observer.observe(dialog,{attributes:true,attributeFilter:['open','class'],childList:true});}
  schedule();return stop;
 }
 window.OrbitDownloadHero={render,watch};
})();
