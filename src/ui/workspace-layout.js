/* Workspace consumes the shared Desktop layout; it never replaces saved choices. */
window.OrbitWorkspaceLayout=function(c){
 const {root,body,html:h,icon,button}=c,$=s=>root.querySelector(s);
 const actions={quick:['Quick launch','play',()=>orbitFeatures.quickSearch()],add:['Add game','add',()=>document.querySelector('#add-game').click()],refresh:['Refresh','refresh',()=>document.querySelector('#refresh').click()],vr:['VR','vr',()=>OrbitDesktopTools.runtime()],controller:['Controller mode','gamepad',()=>document.querySelector('#controller-view').click()]};
 let news=null,newsKey='',loadedAt=0,request=null,generation=0,observer=null,queue=[],active=0;
 const api=()=>OrbitDesktopMenus,live=()=>c.visible()&&c.prefs.page==='library';
 function markup(host,text){if(!host)return;if(host.dataset.markup!==text){unobserve(host);host.innerHTML=text;host.dataset.markup=text;}observeImages(host);}
 function sync(){
  const p=api().custom,choices=api().choices;root.dataset.navigation=p.navigation;root.dataset.width=p.contentWidth;root.dataset.detailsPosition=p.detailsPosition;root.dataset.detailsPanel=String(p.detailsPanel);for(const b of root.querySelectorAll('.ws-nav [data-ws-page]'))b.hidden=!p.navigationItems.includes(b.dataset.wsPage);
  const header=$('.ws-top-actions'),ids=['search',...(['library','tools'].includes(c.prefs.page)?p.quickActions:[])],key=ids.join('|');
  if(header.dataset.actions!==key){const focus=header.contains(document.activeElement)?document.activeElement.dataset.wsAction:null;header.dataset.actions=key;header.innerHTML=button(icon('search'),'data-ws-action="search" aria-label="Search Orbit"')+ids.slice(1).map(id=>button(icon(actions[id][1])+'<span>'+actions[id][0]+'</span>','data-ws-layout-action="'+id+'"',id==='add')).join('');if(focus)header.querySelector('[data-ws-action="'+focus+'"]')?.focus({preventScroll:true});}
  const platforms=$('[data-ws-platforms]'),group=$('.ws-platform-group');group.hidden=!choices.platforms;platforms.hidden=!choices.platforms;if(!group.dataset.restored){group.open=c.prefs.platformsExpanded;group.dataset.restored='true';}
  const names=[...new Set(state.games.filter(g=>!g.hidden&&!g.removed).flatMap(g=>g.sources))].sort();
  const count=$('[data-ws-platform-count]');count.textContent=c.source||String(names.length);count.title=c.source||names.length+' platforms';group.classList.toggle('has-filter',Boolean(c.source));markup(platforms,names.map(name=>'<button type="button" class="ws-collection" data-ws-platform="'+h(name)+'" aria-label="Filter '+h(name)+'" aria-pressed="'+(c.source===name)+'">'+(window.OrbitBrands?.icon(name)||icon('library'))+'<span class="ws-collection-name">'+h(name)+'</span></button>').join(''));
  for(const id of ['activity','storage'])$('[data-ws-layout-action="'+id+'"]').hidden=!choices[id];
  const host=$('.ws-library-main');if(!host)return;
  for(const id of ['hero','recents','news']){const block=host.querySelector('[data-ws-section="'+id+'"]');block.hidden=c.prefs.page!=='library'||!choices[id];}
  const focus=document.activeElement,scroll=$('.ws-content').scrollTop;
  if([...host.children].map(n=>n.dataset.wsSection).join('|')!==p.order.join('|'))for(const id of p.order){const node=host.querySelector('[data-ws-section="'+id+'"]');if(host.moveBefore)host.moveBefore(node,null);else host.append(node);}
  if(focus?.isConnected&&focus!==document.activeElement)focus.focus({preventScroll:true});$('.ws-content').scrollTop=scroll;
  shelves(p,choices);
 }
 function shelves(p,choices){
  if(!live())return;
  const games=state.games.filter(g=>g.kind==='game'&&!g.hidden&&!g.removed),featured=games.find(g=>g.id===state.featured)||OrbitDesktopMenus.recents(games)[0]||games[0],hero=$('[data-ws-section=hero]');
  if(choices.hero&&featured){hero.dataset.layout=p.bannerLayout==='inherit'?(window.OrbitDesktopBanner?.layout||'overlay'):p.bannerLayout;hero.dataset.size=p.bannerSize;hero.dataset.fit=featured.hero?'cover':'contain';markup(hero,'<div class="ws-feature-art">'+(featured.hero||featured.cover?'<img data-src="'+h(featured.hero||featured.cover)+'" alt="" decoding="async">':'')+'</div><div class="ws-feature-copy"><h2>'+h(featured.title)+'</h2><div class="ws-actions">'+button(icon('play')+h(action(featured)),'data-ws-launch="'+h(featured.id)+'"',true)+button('Details','data-ws-open="'+h(featured.id)+'"')+'</div></div>');}else if(!featured)hero.hidden=true;
  const recent=$('[data-ws-section=recents]'),focused=recent.contains(document.activeElement)?document.activeElement?.closest('[data-ws-open]')?.dataset.wsOpen:null,rows=OrbitDesktopMenus.recents(games,recent,()=>shelves(api().custom,api().choices));if(choices.recents&&rows.length)markup(recent,'<h2>Recents</h2><div class="ws-recent-strip">'+rows.map(g=>'<button class="ws-recent-game" data-ws-open="'+h(g.id)+'"><span>'+(g.cover?'<img data-src="'+h(g.cover)+'" alt="" decoding="async">':'')+'</span><strong>'+h(g.title)+'</strong></button>').join('')+'</div>');else recent.hidden=true;
  if(focused){const buttons=[...recent.querySelectorAll('[data-ws-open]')];(buttons.find(b=>b.dataset.wsOpen===focused)||buttons.at(-1))?.focus({preventScroll:true});}
  if(choices.news)void loadNews();else pauseNews();
 }
 function pauseNews(){generation++;observer?.disconnect();observer=null;queue=[];const host=$('[data-ws-section=news]');host?.querySelectorAll('img').forEach(img=>img.removeAttribute('src'));}
 async function loadNews(){
  const host=$('[data-ws-section=news]');if(!host||host.hidden||!live())return;
  const options=api().newsOptions(),key=JSON.stringify(options);if(key!==newsKey){newsKey=key;news=null;loadedAt=0;pauseNews();}
  if(news&&Date.now()-loadedAt<1800000){paintNews();return;}
  if(request)return;const token=generation;markup(host,'<h2>What’s new</h2><p role="status">Loading news…</p>');
  request=orbit.newsShelf(options).then(result=>{if(token!==generation)return;news=(result.posts||[]).filter(p=>OrbitDesktopCustomizationModel.newsMatches(p.gameId,options)).slice(0,16);loadedAt=Date.now();if(live()&&!host.hidden)paintNews();}).catch(()=>{if(token===generation&&live())markup(host,'<h2>What’s new</h2><p role="status">News is unavailable</p>'+button('Try again','data-ws-layout-action="news-retry"'));}).finally(()=>{request=null;if(token!==generation&&live()&&api().shown('news'))void loadNews();});
 }
 function paintNews(){
  const host=$('[data-ws-section=news]');if(!host||!news||!live()||host.hidden)return;
  if(!news.length){host.hidden=true;return;}
  markup(host,'<h2>What’s new</h2><div class="ws-news-strip">'+news.map(p=>'<button class="ws-news-card" data-ws-article="'+h(p.id)+'" data-ws-article-game="'+h(p.gameId)+'"><span><img data-ws-news-image="'+h(p.id)+'" data-ws-news-game="'+h(p.gameId)+'" alt="" decoding="async"></span><small>'+h(p.gameTitle)+'</small><strong>'+h(p.title)+'</strong></button>').join('')+'</div>');
  if(observer)return;const token=generation;observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);queue.push(e.target);}drain(token);},{root:$('.ws-content'),rootMargin:'80px'});host.querySelectorAll('[data-ws-news-image]').forEach(img=>observer.observe(img));
 }
 function drain(token){while(active<2&&queue.length&&live()){const img=queue.shift();active++;orbit.newsImage({id:img.dataset.wsNewsGame,postId:img.dataset.wsNewsImage}).then(url=>{if(url&&token===generation&&live()&&img.isConnected)img.src=url;}).catch(()=>{}).finally(()=>{active--;if(token===generation)drain(token);});}}
 function mount(){const host=$('.ws-library-main'),results=document.createElement('section');results.className='ws-results';results.dataset.wsSection='games';results.append(...host.childNodes);host.append(results);for(const id of ['hero','recents','news']){const section=document.createElement('section');section.dataset.wsSection=id;section.className='ws-'+({hero:'feature',recents:'recents',news:'news'})[id];section.hidden=true;host.append(section);}sync();}
 async function click(b){if(b.dataset.wsLayoutAction){const id=b.dataset.wsLayoutAction;if(actions[id])return actions[id][2]();if(id==='activity')return orbitCompanion.activity();if(id==='storage')return document.querySelector('#game-storage-open')?.click();if(id==='news-retry'){loadedAt=0;return loadNews();}}
  if(b.dataset.wsOpen)c.select(b.dataset.wsOpen);else if(b.dataset.wsLaunch)return play(b.dataset.wsLaunch);else if(b.dataset.wsPlatform)c.platform(b.dataset.wsPlatform);else if(b.dataset.wsArticle)return OrbitNewsReader.open({id:b.dataset.wsArticleGame,postId:b.dataset.wsArticle});
 }
 return {sync,mount,click,pause:pauseNews,leave(){pauseNews();},resume(){if(live())sync();}};
};
