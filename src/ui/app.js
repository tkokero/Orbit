const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const THEME_STORAGE='orbit-themes-v1';
let customThemes=[],activeTheme='orbit',themePreview=false,themeEditorImage=null,darkPresses=0,superDark=false;
try{superDark=localStorage.getItem('orbit-super-dark')==='on';}catch{}
try{const saved=JSON.parse(localStorage.getItem(THEME_STORAGE)||'{}');customThemes=(saved.custom||[]).slice(0,24).flatMap(t=>{try{return [{...OrbitTheme.validate(t),id:typeof t.id==='string'&&/^custom-[a-z0-9-]+$/.test(t.id)?t.id:'custom-'+crypto.randomUUID()}];}catch{return [];}});if(typeof saved.active==='string')activeTheme=saved.active;}catch{}
const allThemes=()=>[...OrbitTheme.builtins,...customThemes];
const selectedTheme=()=>{const theme=allThemes().find(t=>t.id===activeTheme)||OrbitTheme.builtins[0];return theme.id==='dark'&&superDark?{...theme,name:'Super Dark',colors:{...theme.colors,background:'#000000',surface:'#070707',accent:'#929292',positive:'#a6aaa6',secondary:'#999999',warm:'#aaa49c'}}:theme;};
function saveThemes(){try{localStorage.setItem(THEME_STORAGE,JSON.stringify({active:activeTheme,custom:customThemes}));}catch{toast('Theme could not be saved on this computer.',true);}}
function chooseTheme(id){activeTheme=allThemes().some(t=>t.id===id)?id:'orbit';themePreview=false;OrbitTheme.apply(selectedTheme(),document.documentElement);saveThemes();window.OrbitAppIconSettings?.refresh();}
OrbitTheme.apply(selectedTheme(),document.documentElement);
function discardThemePreview(){if(themePreview){themePreview=false;OrbitTheme.apply(selectedTheme(),document.documentElement);}}
function themeEditorValue(){return OrbitTheme.validate({schemaVersion:1,name:$('#theme-name').value,...(themeEditorImage?{image:{...themeEditorImage,mode:$('#theme-image-mode').value,opacity:Number($('#theme-image-opacity').value)}}:{}),colors:Object.fromEntries(OrbitTheme.fields.map(key=>[key,$('#theme-color-'+key).value]))});}
function syncColorFields(){for(const key of OrbitTheme.fields){const picker=$('#theme-color-'+key),hex=$('#theme-hex-'+key),swatch=$('#theme-swatch-'+key),button=$('[data-change-color="'+key+'"]');if(!hex)continue;hex.value=picker.value.toUpperCase();hex.setCustomValidity('');swatch.style.backgroundColor=picker.value;hex.disabled=picker.disabled;button.disabled=picker.disabled;}}
function fillThemeEditor(){const theme=selectedTheme();$('#theme-name').value=theme.id.startsWith('custom-')?theme.name:theme.name+' remix';for(const key of OrbitTheme.fields)$('#theme-color-'+key).value=theme.colors[key];themeEditorImage=theme.image?{...theme.image}:null;syncThemeImageControls();$('#theme-warning').hidden=true;}
function updateThemeImageOpacity(){const slider=$('#theme-image-opacity');if(!slider)return;const progress=(Number(slider.value)-Number(slider.min))/(Number(slider.max)-Number(slider.min))*100;slider.style.setProperty('--range-progress',progress+'%');const output=$('#theme-image-opacity-value');if(output)output.value=slider.value+'%';slider.setAttribute('aria-valuetext',slider.value+' percent image visibility');}
function syncThemeImageControls(){const image=themeEditorImage,preview=$('#theme-image-preview');if(!preview)return;preview.hidden=!image;if(image){preview.src=image.data;}else preview.removeAttribute('src');$('#theme-image-mode').disabled=!image;$('#theme-image-mode').value=image?.mode||'manual';$('#theme-image-opacity').disabled=!image;$('#theme-image-opacity').value=image?.opacity??30;updateThemeImageOpacity();$('#theme-image-remove').disabled=!image;$('#theme-color-accent').disabled=Boolean(image&&image.mode==='auto');syncColorFields();$('#theme-image-status').textContent=image?'Image copied into the theme. The original file is unchanged.':'Choose a background image to enable image visibility and automatic accent colors.';}
function renderThemePicker(){const root=$('#theme-picker');if(!root)return;root.replaceChildren();for(const theme of allThemes()){
  const button=document.createElement('button');button.type='button';button.className='theme-option';button.setAttribute('aria-pressed',String(theme.id===selectedTheme().id));button.dataset.theme=theme.id;
  const swatches=document.createElement('span');swatches.className='theme-swatches';swatches.setAttribute('aria-hidden','true');for(const key of ['background','accent','positive']){const swatch=document.createElement('i');swatch.style.backgroundColor=key==='accent'?OrbitTheme.effectiveAccent(theme):theme.colors[key];swatches.append(swatch);}const label=document.createElement('span');label.textContent=theme.name;button.append(swatches,label);root.append(button);
}$('#theme-delete').hidden=!activeTheme.startsWith('custom-');$('#theme-selection').textContent=selectedTheme().name;}
function setupThemeEditor(){
  window.orbitFonts?.mount();window.orbitStartupSettings?.mount();
  darkPresses=0;
  renderThemePicker();fillThemeEditor();
  $('#theme-picker').onclick=e=>{const b=e.target.closest('[data-theme]');if(!b)return;darkPresses=b.dataset.theme==='dark'?darkPresses+1:0;if(darkPresses===3){superDark=!superDark;darkPresses=0;try{localStorage.setItem('orbit-super-dark',superDark?'on':'off');}catch{}toast(superDark?'Lights out.':'Back to Dark.');}chooseTheme(b.dataset.theme);renderThemePicker();fillThemeEditor();};
  $('#theme-form').oninput=event=>{if(event.target.matches('input[type=color]'))syncColorFields();updateThemeImageOpacity();try{if(themeEditorImage){themeEditorImage.mode=$('#theme-image-mode').value;themeEditorImage.opacity=Number($('#theme-image-opacity').value);$('#theme-color-accent').disabled=themeEditorImage.mode==='auto';if(event.target.id==='theme-image-mode')syncColorFields();}const theme=themeEditorValue();themePreview=true;OrbitTheme.apply(theme,document.documentElement);const warning=$('#theme-warning');warning.hidden=OrbitTheme.contrast(theme.colors.text,theme.colors.background)>=4.5&&OrbitTheme.contrast(theme.colors.muted,theme.colors.background)>=3;}catch{}};
  for(const key of OrbitTheme.fields){const picker=$('#theme-color-'+key),hex=$('#theme-hex-'+key);hex.oninput=()=>{const value=hex.value.trim();const valid=/^#[0-9a-f]{6}$/i.test(value);hex.setCustomValidity(valid?'':'Enter a six-digit hex color, such as #AABBCC.');if(valid){picker.value=value;$('#theme-swatch-'+key).style.backgroundColor=value;}};hex.onchange=()=>{if(hex.checkValidity())hex.value=picker.value.toUpperCase();};$('[data-change-color="'+key+'"]').onclick=()=>{if(picker.disabled)return;try{picker.showPicker();}catch{picker.click();}};}
  $('#theme-form').onsubmit=e=>{e.preventDefault();attempt(async()=>{const theme=themeEditorValue();const existing=customThemes.findIndex(t=>t.id===activeTheme);if(existing<0&&customThemes.length>=24)throw new Error('You can save 24 custom themes. Remove one to make room.');const id=existing>=0?activeTheme:'custom-'+crypto.randomUUID();const saved={...theme,id};const candidate=existing>=0?customThemes.map((t,i)=>i===existing?saved:t):[...customThemes,saved];const serialized=JSON.stringify({active:id,custom:candidate});if(serialized.length>4*1024*1024)throw Error('Theme images take too much space. Remove an image or theme first.');localStorage.setItem(THEME_STORAGE,serialized);if(existing>=0)customThemes[existing]=saved;else customThemes.push(saved);chooseTheme(id);renderThemePicker();fillThemeEditor();toast('Theme saved.');});};
  $('#theme-image-choose').onclick=()=>attempt(async()=>{const button=$('#theme-image-choose'),form=$('#theme-form');button.disabled=true;try{const image=await window.orbit.chooseThemeImage();if(!image||!form.isConnected)return;themeEditorImage=image;syncThemeImageControls();themePreview=true;OrbitTheme.apply(themeEditorValue(),document.documentElement);}finally{if(button.isConnected)button.disabled=false;}});
  $('#theme-image-remove').onclick=()=>{themeEditorImage=null;syncThemeImageControls();themePreview=true;OrbitTheme.apply(themeEditorValue(),document.documentElement);};
  $('#theme-discard').onclick=()=>{discardThemePreview();fillThemeEditor();};
  $('#theme-delete').onclick=()=>{customThemes=customThemes.filter(t=>t.id!==activeTheme);chooseTheme('orbit');renderThemePicker();fillThemeEditor();};
  $('#theme-export').onclick=()=>attempt(async()=>{const theme=themePreview?themeEditorValue():selectedTheme();const result=await window.orbit.exportTheme({schemaVersion:1,name:theme.name,colors:theme.colors,...(theme.image?{image:theme.image}:{})});if(result)toast('Theme exported.');});
  $('#theme-import').onclick=()=>attempt(async()=>{const imported=await window.orbit.importTheme();if(!imported)return;const theme=OrbitTheme.validate(imported);if(customThemes.length>=24)throw new Error('Remove a custom theme to make room.');const id='custom-'+crypto.randomUUID();const candidate=[...customThemes,{...theme,id}];const serialized=JSON.stringify({active:id,custom:candidate});if(serialized.length>4*1024*1024)throw Error('Theme images take too much space. Remove an image or theme first.');localStorage.setItem(THEME_STORAGE,serialized);customThemes.push({...theme,id});chooseTheme(id);renderThemePicker();fillThemeEditor();toast('Theme imported.');});
}
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = true;
try { motionEnabled = localStorage.getItem('orbit-motion') !== 'off'; } catch {}
document.documentElement.classList.toggle('motion-off', !motionEnabled);
const allowMotion = () => motionEnabled && !motionQuery.matches && !document.hidden;
function animateSurface(element) {
  element.getAnimations().forEach(a=>a.cancel());
  if(allowMotion()) element.animate([{opacity:.65},{opacity:1}],{duration:190,easing:'cubic-bezier(.2,.8,.2,1)'});
}
motionQuery.addEventListener('change',()=>{if(motionQuery.matches)document.getAnimations().forEach(a=>a.cancel());});
const PAGE_SIZE = 30;
const state = { games: [], warnings: [], section: 'games', view: 'all', source: '', search: '', sort: 'recent', list: false, page: 0, featured: '', busy: false };
let rememberView=true;
try {rememberView=localStorage.getItem('orbit-remember-view')!=='off';if(rememberView){const view=JSON.parse(localStorage.getItem('orbit-view')||'{}');if(['games','tools','friends'].includes(view.section))state.section=view.section;if(['all','installed','favorites','uninstalled'].includes(view.view))state.view=view.view;if(['','Steam','Epic Games','Roblox','Others'].includes(view.source))state.source=view.source;if(['recent','az','installed','platform'].includes(view.sort))state.sort=view.sort;state.list=Boolean(view.list);}}catch{}
const bytes=n=>n<1024?n+' B':n<1024**2?(n/1024).toFixed(1)+' KB':n>=1024**3?(n/1024**3).toFixed(1)+' GB':(n/1024**2).toFixed(0)+' MB';
function duration(seconds){const m=Math.max(1,Math.ceil(seconds/60));return m<60?m+' min':Math.floor(m/60)+' h '+(m%60)+' min';}
function progressMarkup(p){return p?`<span class="install-caption">${esc(p.phase)}${Number.isFinite(p.percent)?` · ${Math.max(0,Math.min(100,p.percent)).toFixed(1).replace(/\.0$/,'')}%`:''}</span>${p.done!=null&&p.total?`<span class="transfer-size">${bytes(p.done)} / ${bytes(p.total)}</span>`:''}${p.etaSeconds>0&&p.bytesPerSecond>0&&Date.now()-(p.sampledAt||0)<90000?`<span class="transfer-estimate">About ${p.etaSeconds<60?Math.ceil(p.etaSeconds)+' s':duration(p.etaSeconds)} remaining · ${bytes(p.bytesPerSecond)}/s</span>`:/^(Download|Installing)$/.test(p.phase)?'<span class="transfer-estimate">Estimating time remaining…</span>':''}${Number.isFinite(p.percent)?`<progress aria-label="${esc(p.phase)}" value="${p.percent}" max="100"></progress>`:''}`:'';}
function renderDownloads(){window.orbitCare?.updateDownloads();const root=$('#downloads');root.hidden=true;}

const hours = n => `${(n/60).toLocaleString(undefined,{maximumFractionDigits:1})} h`;
const date = n => n ? new Date(n).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}) : 'Unavailable';
const status = g => g.robloxPlaceId?'Saved experience':g.installed ? 'Installed' : g.alternateLaunch?'Custom launch':g.launcherAvailable ? 'Launcher ready' : 'Not installed';
const action = g => g.robloxPlaceId?'Open game':g.alternateLaunch?(g.kind==='tool'?'Open':'Play'):(g.selectedInstalled??g.installed) ? (g.kind === 'tool' ? 'Open' : 'Play') : g.directLaunchAvailable ? 'Play' : g.launcherAvailable ? (g.launchRoute?.mode==='game'?'Play':'Open launcher') : 'Install';
const modToolsFor=g=>OrbitModSupport.filter(g,state.games.filter(t=>t.kind==='tool'));
const sectionItems = () => state.games.filter(g => !g.hidden && g.kind === (state.section === 'tools' ? 'tool' : 'game'));
let toastTimer, searchTimer, detailRequest = 0;
function toast(message, error=false) { $('#toast').textContent=message; $('#toast').classList.toggle('error',error); $('#toast').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').hidden=true,error?7000:3500); }
async function attempt(fn) { try { return await fn(); } catch(e) { toast(e.message,true); } }
function absorb(data) {
  if (!data) return;
  if (data.scannedAt !== state.scannedAt) state.featured='';
  Object.assign(state,{games:data.games,warnings:data.warnings||[],scannedAt:data.scannedAt,steamId:data.steamId,connections:data.connections||[],offline:Boolean(data.offline),cached:Boolean(data.cached),coverStatus:data.coverStatus||{},settings:data.settings||state.settings||{}});
  for (const g of state.games) {g.searchIndex=OrbitSearch.index(g);g.searchText=`${g.title} ${g.sources.join(' ')}`.toLowerCase();}
  render();
}
function filtered() {
  const matchesSearch=OrbitSearch.matcher(state.search),otherSources=['Steam','Epic Games',...(state.games.some(g=>g.robloxPlaceId)?['Roblox']:[])];
  return state.games.filter(g => state.view==='hidden' ? g.hidden : !g.hidden && g.kind===(state.section==='tools'?'tool':'game'))
    .filter(g=>state.view!=='installed'||g.installed).filter(g=>state.view!=='uninstalled'||!g.installed)
    .filter(g=>state.view!=='favorites'||g.favorite)
    .filter(g=>!state.source || (state.source==='Others' ? g.sources.some(s=>!otherSources.includes(s)) : g.sources.includes(state.source)))
    .filter(g=>window.orbitCare?.matches(g)??true).filter(matchesSearch).filter(g=>window.orbitFeatures?.matches(g)??true)
    .sort((a,b)=>state.sort==='recent'?b.lastPlayed-a.lastPlayed||a.title.localeCompare(b.title):state.sort==='installed'?Number(b.installed)-Number(a.installed)||a.title.localeCompare(b.title):state.sort==='platform'?a.sources[0].localeCompare(b.sources[0])||a.title.localeCompare(b.title):a.title.localeCompare(b.title));
}
function unobserve(root) { OrbitIcons.unobserve(root); root.querySelectorAll('img').forEach(img=>imageObserver.unobserve(img)); }
/* Keep matching cards and decoded images mounted when filters or status change. */
function stableChildren(root,markup){
 if(root.orbitMarkup===markup&&root.childElementCount)return;
 const template=document.createElement('template');template.innerHTML=markup;
 const key=(node,index)=>{const control=node.matches('[data-game],[data-recent],[data-couch-play]')?node:node.querySelector('[data-game],[data-recent],[data-couch-play]');return node.tagName+':'+(control?.dataset.game||control?.dataset.recent||control?.dataset.couchPlay||index);};
 const existing=new Map([...root.children].map((node,index)=>[key(node,index),node]));let cursor=root.firstElementChild;
 [...template.content.children].forEach((fresh,index)=>{const id=key(fresh,index),old=existing.get(id),html=fresh.outerHTML;let node=fresh;
  if(old?.orbitMarkup===html)node=old;else{node.orbitMarkup=html;if(old){for(const img of node.querySelectorAll('img[data-src]')){const previous=[...old.querySelectorAll('img[src]')].find(previous=>previous.getAttribute('src')===img.dataset.src);if(previous){img.src=img.dataset.src;delete img.dataset.src;}}}}
  if(node===cursor)cursor=cursor.nextElementSibling;else root.insertBefore(node,cursor);existing.delete(id);if(old&&old!==node){if(old===cursor)cursor=old.nextElementSibling;unobserve(old);old.remove();}
 });
 for(const old of existing.values()){unobserve(old);old.remove();}root.orbitMarkup=markup;
}
const imageObserver = new IntersectionObserver(entries=>{
  for(const entry of entries){
    const img=entry.target;
    if(!img.isConnected||document.hidden)continue;
    if(!entry.isIntersecting)continue;
    if(img.dataset.achievement){
      imageObserver.unobserve(img);
      window.orbit.achievementImage(img.dataset.game,img.dataset.achievement).then(src=>{if(img.isConnected&&src){if(document.hidden)img.dataset.src=src;else img.src=src;}else img.remove();}).catch(()=>img.remove());
    }else if(img.dataset.src){img.src=img.dataset.src;delete img.dataset.src;}
  }
},{rootMargin:'100px'});
function observeImages(root) {
  OrbitIcons.observe(root);
  root.querySelectorAll('img').forEach(img=>{
    img.onerror=async()=>{
      if(!img.isConnected)return;
      const id=img.dataset.cover;
      if(id&&!img.dataset.repaired) {
        img.dataset.repaired='1';
        try { const src=await window.orbit.repairImage(id); if(src&&img.isConnected){img.src=src;const g=state.games.find(g=>g.id===id);if(g)g.cover=src;return;} } catch{}
      }
      img.hidden=true;
    };
    if(img.dataset.src||img.dataset.achievement) imageObserver.observe(img);
  });
}
function releaseLibraryImages(){
 window.orbitNews?.release();
 for(const id of ['game-grid','recent-games']){const root=$('#'+id);if(root?.childElementCount){unobserve(root);root.replaceChildren();}}
 const hero=$('#hero-image');if(hero){imageObserver.unobserve(hero);hero.removeAttribute('src');delete hero.dataset.src;}
 window.orbitMemory?.trim();
}
function setHeroImage(src){
 const img=$('#hero-image');if(!src){imageObserver.unobserve(img);img.removeAttribute('src');delete img.dataset.src;return;}
 if((img.dataset.src||img.getAttribute('src'))!==src){img.src=src;delete img.dataset.src;}
 img.dataset.hero='1';img.hidden=false;imageObserver.observe(img);
}
function render() {
  window.OrbitCouch?.refresh();
  if(window.orbitMemory?.suspended())return;
  if(window.orbitShell?.renderExternal())return;
  const hasRoblox=state.games.some(g=>g.robloxPlaceId);
  if(state.source==='Roblox'&&!hasRoblox)state.source='';
  if(rememberView)try{localStorage.setItem('orbit-view',JSON.stringify({section:state.section,view:state.view==='hidden'?'all':state.view,source:state.source,sort:state.sort,list:state.list}));}catch{}
  window.orbitUtilities?.render();
  $('#sort').value=state.sort;
  const socialView=state.section==='friends';$('#library-panel').hidden=socialView;$('#friends-panel').hidden=state.section!=='friends';$('#add-game').hidden=socialView;
  $('#source-navigation').hidden=socialView;$('.sidebar-heading').hidden=socialView;$('#navigation').querySelectorAll('[data-view]').forEach(b=>b.hidden=socialView);
  if(socialView){releaseLibraryImages();const visible=state.games.filter(g=>!g.hidden);$('#games-count').textContent=visible.filter(g=>g.kind==='game').length;$('#tools-count').textContent=visible.filter(g=>g.kind==='tool').length;$('#navigation').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.section==='friends'));friendsUI.enter();return;}
  friendsUI.leave();

  const items=sectionItems(), all=state.games.filter(g=>!g.hidden);
  $('#games-count').textContent=all.filter(g=>g.kind==='game').length;
  $('#tools-count').textContent=all.filter(g=>g.kind==='tool').length;
  $('#installed-count').textContent=items.filter(g=>g.installed).length;
  $('#favorite-count').textContent=items.filter(g=>g.favorite).length;
  const label=state.view==='hidden'?'Hidden':state.section==='tools'?'Tools':'Games';
  $('#page-title').textContent=label; $('#section-count').textContent=items.length;
  $('#search').placeholder=state.section==='tools'?'Search tools':'Search games';
  $('#add-game').textContent=state.section==='tools'?'Add tool':'Add game';
  $('#navigation').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.section?b.dataset.section===state.section&&state.view==='all'&&!state.source:b.dataset.view===state.view&&!state.source));
  const groups=[['Steam','assets/steam.svg',items.filter(g=>g.sources.includes('Steam')).length],['Epic Games','assets/epicgames.svg',items.filter(g=>g.sources.includes('Epic Games')).length],...(hasRoblox?[['Roblox','assets/roblox.svg',items.filter(g=>g.sources.includes('Roblox')).length]]:[]),['Others',null,items.filter(g=>g.sources.some(s=>!['Steam','Epic Games',...(hasRoblox?['Roblox']:[])].includes(s))).length]];
  $('#source-navigation').innerHTML=groups.map(([name,logo,count])=>`<button class="nav-item platform ${state.source===name?'active':''}" data-source="${name}">${logo?`<img src="${logo}" class="platform-logo" alt="">`:'<span class="logo-space"></span>'}<span>${name==='Epic Games'?'Epic Games':name}</span><span class="count">${count}</span></button>`).join('');

  const games=filtered(), pages=Math.max(1,Math.ceil(games.length/PAGE_SIZE));$('#section-count').textContent=games.length; state.page=Math.max(0,Math.min(state.page,pages-1));
  const start=state.page*PAGE_SIZE, visible=games.slice(start,start+PAGE_SIZE), grid=$('#game-grid');
  grid.classList.toggle('list',state.list);
  stableChildren(grid,state.list?`<div class="list-heading"><span>Game</span><span>Status</span><span>Playtime</span><span>Last played</span><span>Achievements</span><span></span></div>`+visible.map(g=>`<div class="game-row"><button class="list-game" data-game="${esc(g.id)}">${g.cover?`<img data-src="${esc(g.cover)}" data-cover="${esc(g.id)}" alt="">`:OrbitIcons.markup(g.id)}<span><strong>${esc(g.title)}</strong><small>${esc(g.sources.join(' · '))}${g.versions.length>1?' · '+g.versions.length+' copies':''}${g.favorite?' · Favorite':''}</small></span></button><span class="list-status ${g.installed?'ready':''}">${esc(status(g))}${g.sizeBytes?`<small class="list-size">${bytes(g.sizeBytes)}</small>`:''}</span><span data-playtime="${esc(g.id)}">${g.playtimeKnown?hours(g.playtime):'—'}</span><span class="list-last">${g.lastPlayed?new Date(g.lastPlayed).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'}</span><span class="list-achievements">${g.achievements?.total?`${g.achievements.unlocked} / ${g.achievements.total}`:'—'}</span><button class="row-launch subtle-button" data-list-play="${esc(g.id)}">${action(g)}</button></div>`).join(''):visible.map(g=>`<button class="game-card" data-game="${g.id}" aria-label="${esc(g.title)}, ${status(g)}"><div class="cover-wrap"><span class="cover-placeholder">${esc(g.title)}</span>${g.robloxPlaceId?OrbitIcons.robloxMarkup(g.robloxPlaceId):''}${window.orbitDesktopLibrary?.image(g)??(g.cover?`<img data-src="${esc(g.cover)}" data-cover="${g.id}" alt="" decoding="async">`:'')}${g.favorite?'<span class="favorite-indicator">★</span>':''}<span class="card-peek" aria-hidden="true">View ${g.kind==='tool'?'tool':'game'}</span></div><div class="card-info"><div class="card-title">${esc(g.title)}</div><div class="card-meta"><span>${g.installed?'<i class="installed-dot"></i>':''}${esc(g.sources.join(' · '))}${g.versions.length>1?' · '+g.versions.length+' copies':''}</span><span data-playtime="${g.id}">${g.playtimeKnown?hours(g.playtime):g.robloxPlaceId?'Experience':g.launcherAvailable?'Launcher':''}</span></div><div class="card-install" data-install="${g.id}" ${g.installationProgress?'':'hidden'}>${progressMarkup(g.installationProgress)}</div></div></button>`).join(''));
  observeImages(grid);
  // Keep the scrollable click targets out of transient compositor layers.
  // Fading this grid while its height/scroll offset changes can leave its
  // painted cards outside Chromium's mouse hit-test region on Windows.
  animateSurface($('#page-title'));
  $('#grid-view').classList.toggle('active',!state.list);$('#list-view').classList.toggle('active',state.list);
  $('#grid-view').setAttribute('aria-pressed',String(!state.list));$('#list-view').setAttribute('aria-pressed',String(state.list));
  $('#empty').hidden=games.length>0;$('#pagination').hidden=!games.length;
  $('#page-range').textContent=`${start+1}–${Math.min(start+PAGE_SIZE,games.length)} of ${games.length}`;
  $('#previous-page').disabled=state.page===0;$('#next-page').disabled=state.page===pages-1;
  renderHero(items);
  window.orbitNews?.render();
  renderDownloads();
  window.orbitRecovery?.render();
}
function renderHero(items) {
  const show=state.section==='games'&&state.view!=='hidden'; $('#hero').hidden=!show;$('#recent-games').hidden=!show;
  if(!show){setHeroImage(null);return;}
  const recent=[...items].filter(g=>g.lastPlayed).sort((a,b)=>b.lastPlayed-a.lastPlayed).slice(0,5);
  const featured=items.find(g=>g.id===state.featured)||recent[0]||items[0];
  if(featured) {
    state.featured=featured.id;$('#hero-title').textContent=featured.title;
    $('#hero-kicker').textContent=featured.lastPlayed?'Continue playing':'From your library';
    $('#hero-description').textContent=[featured.playtimeKnown?hours(featured.playtime):'',featured.achievements?.total?`${featured.achievements.unlocked}/${featured.achievements.total} achievements`:'',featured.lastPlayed?'Last played '+date(featured.lastPlayed):''].filter(Boolean).join(' · ');
    $('#hero-play').disabled=false;$('#hero-details').disabled=false;$('#hero-play').textContent=action(featured);
    const img=$('#hero-image');
    if(featured.hero) setHeroImage(featured.hero);
    else {setHeroImage(null);if(!featured.heroRequested){featured.heroRequested=true;window.orbit.hero(featured.id).then(src=>{featured.hero=src;if(src&&state.featured===featured.id&&!$('#library-panel').hidden&&!document.hidden)setHeroImage(src);}).catch(()=>{});}}
    img.onerror=()=>{img.hidden=true;};
  } else {$('#hero-title').textContent='Your library';$('#hero-description').textContent='';setHeroImage(null);$('#hero-play').disabled=true;$('#hero-details').disabled=true;}
  const root=$('#recent-games');
  stableChildren(root,recent.map(g=>`<button data-recent="${g.id}" class="recent-game ${g.id===state.featured?'active':''}">${g.robloxPlaceId?OrbitIcons.robloxMarkup(g.robloxPlaceId):''}${g.cover?`<img data-src="${esc(g.cover)}" data-cover="${g.id}" alt="" decoding="async">`:''}<span class="recent-info"><strong>${esc(g.title)}</strong><small>${g.playtimeKnown?hours(g.playtime):''}${g.lastPlayed?' · '+new Date(g.lastPlayed).toLocaleDateString(undefined,{month:'short',day:'numeric'}):''}</small></span></button>`).join(''));observeImages(root);
}
async function refresh(repair=false) {
  if(state.busy)return;state.busy=true;$('#refresh').disabled=true;$('#sync-status').textContent=repair?'Repairing images…':'Scanning…';
  try { absorb(await (repair?window.orbit.repairImages():window.orbit.getLibrary())); }
  catch(e){toast(e.message,true);}
  finally{state.busy=false;$('#refresh').disabled=false;$('#sync-status').textContent='';window.orbitReady=true;window.orbitBoot?.ready();if(window.orbitBoot)window.orbitBoot.done.then(()=>window.orbitSetup?.ready());else window.orbitSetup?.ready();}
}
const closingDialogs=new WeakMap();
function cancelDialogClose(dialog){const pending=closingDialogs.get(dialog);if(pending){closingDialogs.delete(dialog);clearTimeout(pending.deadline);pending.animation.cancel();dialog.classList.remove('dialog-closing');}}
function dismissDialog(dialog,finish){
  if(closingDialogs.has(dialog))return;
  if(!dialog.open||!allowMotion()){dialog.close();finish?.();return;}
  const current=getComputedStyle(dialog),from={opacity:current.opacity,transform:current.transform};
  dialog.getAnimations().forEach(a=>a.cancel());
  dialog.classList.add('dialog-closing');
  let animation;try{animation=dialog.animate([from,{opacity:0,transform:'translateY(18px) scale(.955)'}],{duration:190,easing:'cubic-bezier(.5,0,.2,1)',fill:'forwards'});}catch{dialog.classList.remove('dialog-closing');dialog.close();finish?.();return;}
  const pending={animation};closingDialogs.set(dialog,pending);
  const complete=()=>{if(closingDialogs.get(dialog)!==pending)return;closingDialogs.delete(dialog);clearTimeout(pending.deadline);dialog.close();animation.cancel();dialog.classList.remove('dialog-closing');finish?.();};
  pending.deadline=setTimeout(complete,260);
  animation.finished.then(complete,complete);
}
function modal(title,body){window.OrbitSettingsNav?.dispose();window.orbitExtras?.disposeStorage?.();$('#modal').classList.remove('launch-mode-dialog','storage-dialog');window.OrbitHelp?.close();window.orbitSimple?.closeMenus();$('#modal').classList.toggle('settings-dialog',title==='Settings');$('#modal').classList.toggle('activity-dialog',title==='Activity'||title==='Game activity');cancelDialogClose($('#modal'));discardThemePreview();const root=$('#modal-body');unobserve(root);root.classList.remove('settings-searching');$('#modal-title').textContent=title;root.innerHTML=body;$('#modal').classList.toggle('pin-collections-dialog',Boolean(root.querySelector('.library-pin-panel')));$('#modal').classList.toggle('release-notes-dialog',Boolean(root.querySelector('.release-notes-reader')));$('#modal').classList.toggle('game-details-dialog',Boolean(root.querySelector('.detail-heading')));window.OrbitGameArtwork?.decorate(root,title);if(!$('#modal').open){$('#modal').showModal();window.OrbitFX?.open($('#modal'));}observeImages(root);}
function bindDialogDismiss(dialog,dismiss){
  const outside=e=>{const r=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
  let backdropPointer=null;
  dialog.addEventListener('pointerdown',e=>{backdropPointer=e.button===0&&outside(e)?e.pointerId:null;});
  dialog.addEventListener('pointercancel',()=>{backdropPointer=null;});
  dialog.addEventListener('pointerup',e=>{const close=backdropPointer===e.pointerId&&outside(e);backdropPointer=null;if(close&&dialog.open)dismiss();});
  dialog.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='w'&&!e.altKey&&!e.shiftKey){e.preventDefault();e.stopPropagation();dismiss();}});
  dialog.addEventListener('close',()=>{backdropPointer=null;});
}
function closeModal(){window.OrbitSettingsNav?.dispose();window.orbitExtras?.disposeStorage?.();window.OrbitHelp?.close();discardThemePreview();detailRequest++;unobserve($('#modal-body'));dismissDialog($('#modal'),()=>$('#modal-body').replaceChildren());}
let updateState=null;
function renderUpdateStatus(data){
 if(data)updateState=data;const root=$('#update-status');if(!root||!updateState)return;
 root.textContent=updateState.message;$('#update-version').textContent='Version '+updateState.version+(updateState.latest?' · Available '+updateState.latest:'');
 const progress=$('#update-progress');progress.hidden=updateState.phase!=='downloading';progress.value=Number.isFinite(updateState.percent)?updateState.percent:0;
 $('#check-updates').disabled=!updateState.supported||['checking','downloading','restarting'].includes(updateState.phase);
 $('#restart-update').hidden=updateState.phase!=='ready'&&!updateState.downloaded;$('#get-update-installer').hidden=updateState.supported;window.orbitCompanion?.updateStatus(updateState);
}
window.orbit.onUpdateStatus?.(renderUpdateStatus);
async function showComputerSpecs(refresh=false){
 const root=$('#computer-specs'),button=$('#scan-computer');if(!root||!window.orbit.systemInfo)return;
 button.disabled=true;root.textContent='Detecting this computer…';
 try{const pc=await window.orbit.systemInfo(refresh);if(!root.isConnected)return;const entries=[['Processor',pc.cpu||'Unavailable'],['Graphics',pc.gpu?.join(' / ')||'Unavailable'],['Memory',Number.isFinite(pc.ramGB)?pc.ramGB.toFixed(1)+' GB':'Unavailable'],['CPU threads',pc.logicalCores||'Unavailable'],['System',pc.os||'Unavailable'],['Free storage',Number.isFinite(pc.freeGB)?pc.freeGB.toFixed(1)+' GB'+(pc.drive?' on '+pc.drive:''):'Unavailable']];root.innerHTML=`<dl class="computer-specs">${entries.map(([name,value])=>`<div><dt>${name}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;}
 catch(error){if(root.isConnected)root.textContent=error.message;}
 finally{if(button.isConnected)button.disabled=false;}
}
function showSettings() {
  const settingHelp=new Set(['offlineMode','closeToTray','autoUpdates','restartForUpdates','lowMemoryRendering']);
  const settingSwitch=(key,title,note)=>`<div class="setting-card setting-row"><div><h3>${title}${settingHelp.has(key)?OrbitHelp.markup(title,note):''}</h3></div><button class="setting-switch" role="switch" aria-label="${title}" aria-checked="${Boolean(state.settings?.[key])}" data-setting="${key}" ${key==='launchAtLogin'&&!state.settings?.startupAvailable?'disabled':''}></button></div>`;
  const otherConnections=(state.connections||[]).filter(c=>!['Steam','Epic Games'].includes(c.source));
  modal('Settings',`<div class="settings-tabs" role="tablist" aria-label="Settings sections"><button role="tab" id="tab-general" aria-controls="panel-general" aria-selected="true" tabindex="0" data-settings-tab="general">General</button><button role="tab" id="tab-libraries" aria-controls="panel-libraries" aria-selected="false" tabindex="-1" data-settings-tab="libraries">Libraries</button><button role="tab" id="tab-appearance" aria-controls="panel-appearance" aria-selected="false" tabindex="-1" data-settings-tab="appearance">Appearance</button><button role="tab" id="tab-manage" aria-controls="panel-manage" aria-selected="false" tabindex="-1" data-settings-tab="manage">Manage</button><button role="tab" id="tab-about" aria-controls="panel-about" aria-selected="false" tabindex="-1" data-settings-tab="about">About</button></div>
  <section id="panel-general" role="tabpanel" aria-labelledby="tab-general">${state.settings?.interfaceRecovery?`<div class="setting-card" role="status"><h3>Saved settings</h3><p>${esc(state.settings.interfaceRecovery)}</p><button id="recovery-open-data" class="subtle-button">Open data folder</button></div>`:''}<div class="setting-card setting-row"><div><h3>Quick start</h3></div><button class="subtle-button" id="reopen-setup">Open Quick start</button></div>
    <div class="setting-card"><div class="setting-row"><div><h3>This computer<button type="button" class="info-button" data-orbit-help="Detected locally for game requirements and approximate FPS estimates. Use Scan this PC to refresh the hardware information." aria-label="About This computer" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3></div><button class="subtle-button" id="scan-computer">Scan this PC</button></div><div id="computer-specs" role="status" aria-live="polite"></div></div>
    ${settingSwitch('launchAtLogin','Launch at login','Open Orbit when you sign in to Windows.')}
    <p id="startup-status" class="small-note" role="status">${esc(state.settings?.startupNote||'')}</p>
    ${settingSwitch('offlineMode','Offline mode','Use local discovery and cached artwork. Online account connections, deals, and downloads remain in their original clients.')} ${settingSwitch('downloadNotifications','Installation notifications','Notify when a monitored installation finishes. Click the notification to open its game controls.')} ${settingSwitch('closeToTray','Keep running when closed','Close the window to the system tray. Right-click the Orbit tray icon to quit.')}
    ${settingSwitch('startMinimized','Start minimized','Start in the system tray when opened at login.')}
    ${settingSwitch('autoDiscover','Automatically find games','Keep your library up to date when games are installed or removed.')}
    ${settingSwitch('minimizeOnPlay','Minimize when playing','Give the game the screen after you press Play.')}
    ${settingSwitch('confirmGameClose','Confirm before closing games','Show an Orbit confirmation before requesting a normal game close.')}
    ${settingSwitch('confirmForceClose','Confirm before force closing games','Show an Orbit confirmation before ending a game task.')}
    ${settingSwitch('autoUpdates','Automatic updates','Check at startup and every six hours. Download updates in the background.')}
    ${settingSwitch('restartForUpdates','Restart automatically after updates','Update Orbit without closing your games. Playtime is saved, timers resume, and automatic restarts stay in the background while playing.')}

    ${settingSwitch('autoLoadFriends','Load friends at startup','Prepare existing friend connections in the background.')}
    ${settingSwitch('refreshFriends','Refresh friends automatically','Update presence once a minute while the Friends tab is active.')}
    <div class="setting-card setting-row"><div><h3>Startup animation</h3></div><button id="intro-toggle" class="setting-switch" role="switch" aria-label="Startup animation" aria-checked="${localStorage.getItem('orbit-intro')!=='off'}"></button></div>
    <div class="setting-card setting-row"><div><h3>Remember my view<button type="button" class="info-button" data-orbit-help="Restores the library section, filters, sort order and grid or list layout." aria-label="About Remember my view" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3></div><button id="remember-toggle" class="setting-switch" role="switch" aria-label="Remember my view" aria-checked="${rememberView}"></button></div>
  </section><section id="panel-libraries" role="tabpanel" aria-labelledby="tab-libraries" hidden>
    <div class="setting-card"><div class="setting-row"><div><h3>Steam</h3><p class="small-note">${esc(state.connections?.find(c=>c.source==='Steam')?.status||'Connect your library.')}</p></div><button id="steam-connect" class="subtle-button">Connect account</button></div><p id="steam-connect-result" role="status"></p><details><summary>Advanced import</summary><form id="steam-form"><label>SteamID64<input id="steam-id" value="${esc(state.steamId||'')}" autocomplete="off" pattern="[0-9]{17}" required></label><label>API key<input id="steam-key" type="password" autocomplete="off" required></label><div class="form-row"><button type="submit" class="subtle-button">Import</button><button type="button" class="link-button" data-help="steamKey">Get key</button><button type="button" class="link-button" data-help="steamPrivacy">Privacy</button></div><p id="steam-result" role="status"></p></form></details></div>
    <div class="setting-card"><div class="setting-row"><div><h3>Epic Games</h3><p class="small-note">${esc(state.connections?.find(c=>c.source==='Epic Games')?.status||'Connect your library.')}</p></div><button id="epic-sync" class="subtle-button">Import library</button></div><details><summary>Connection help</summary><p class="small-note">Sign in with Legendary, then select its executable.</p><button class="link-button" data-help="legendary">Open Quick start</button></details><p id="epic-result" role="status"></p></div>
    <div class="setting-card"><h3>Install without Steam<button type="button" class="info-button" data-orbit-help="Runs a downloaded .exe or .msi installer. It does not download or unlock a game. Refresh the library afterward, or add the game executable if detection misses it. Store buttons open that client’s install controls." aria-label="About Install without Steam" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3><div class="settings-actions"><button class="subtle-button" id="settings-installer">Install from file</button>${['Epic Games','GOG','EA','Ubisoft Connect','Battle.net','Xbox'].map(source=>`<button class="link-button" data-install-store="${source}">${source}</button>`).join('')}</div></div><div class="setting-card library-connections-card"><details class="library-connections"><summary data-orbit-icon="connection">Other libraries</summary><div class="library-connections-list" role="list">${otherConnections.map(c=>`<div class="connection-status" role="listitem"><span class="library-provider-symbol" aria-hidden="true">${window.OrbitBrands?.icon(c.source)||window.OrbitControllerArt?.icon('desktop')||''}</span><div class="library-provider-copy"><strong>${esc(c.source)}</strong><span>${esc(c.status)}</span></div></div>`).join('')||'<p class="small-note">No other libraries detected.</p>'}</div></details></div>
  </section>
  <section id="panel-appearance" role="tabpanel" aria-labelledby="tab-appearance" hidden>
  <div class="setting-card startup-settings"><h3>Startup movies<button type="button" class="info-button" data-orbit-help="Use a built-in animation or a local MP4/WebM up to 15 seconds, 1080p and 64 MB. Orbit saves a local copy and plays custom videos silently. Reduced-motion settings take priority. Turn off Startup animation to skip intros." aria-label="About Startup movies" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3><div id="startup-choices" class="startup-choices" aria-label="Startup movie"></div><div class="settings-actions"><button id="startup-preview" class="subtle-button">Preview</button><button id="startup-video-choose" class="subtle-button">Choose video</button><button id="startup-video-remove" class="link-button" disabled>Remove video</button></div><div class="startup-audio-controls"><label class="discord-check"><input id="startup-sound-enabled" type="checkbox"> Startup sounds</label><label for="startup-sound-volume">Volume <output id="startup-sound-value">12%</output></label><input id="startup-sound-volume" type="range" min="0" max="30" step="1" value="12" aria-label="Startup sound volume"></div><p id="startup-video-name" class="small-note" hidden></p></div>
  ${settingSwitch('lowMemoryRendering','Reduce graphics memory','Use software rendering to reduce graphics memory. Turn this off if animations feel slow. Changing this requires quitting Orbit from the tray and reopening it.')}
  <div class="theme-saved-actions"><span id="theme-selection"></span><div class="theme-actions"><button id="theme-import" class="subtle-button">Import theme</button><button id="theme-export" class="subtle-button">Export</button><button id="theme-delete" class="link-button" hidden>Remove custom theme</button></div></div>
  <div id="theme-picker" class="theme-grid" aria-label="Color themes"></div>
  <details id="theme-editor" class="theme-editor"><summary><span class="appearance-summary-copy"><strong>Customize appearance</strong></span></summary><div class="setting-row appearance-font-row"><div><h3>Interface font<button type="button" class="info-button" data-orbit-help="Choose a local TTF, OTF, WOFF or WOFF2 file up to 4 MB. Font changes apply immediately and are saved separately from the theme." aria-label="About Interface font" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3><p id="custom-font-name" class="small-note">Default · Orbit Rounded</p></div><div class="settings-actions"><button id="custom-font-choose" type="button" class="subtle-button">Choose font</button><button id="custom-font-reset" type="button" class="subtle-button" disabled>Reset font</button></div></div><form id="theme-form"><label>Theme name<input id="theme-name" maxlength="60" required></label><div class="theme-image-editor"><label>Background image<button type="button" class="info-button" data-orbit-help="Visibility is limited to 70% to keep text readable. Still PNG, JPEG, or WebP, up to 15 MB. Orbit saves a compressed copy and includes it when exporting the theme." aria-label="About Background image" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></label><img id="theme-image-preview" alt="Theme background preview" hidden><div class="settings-actions"><button id="theme-image-choose" type="button" class="subtle-button">Choose image</button><button id="theme-image-remove" type="button" class="subtle-button">Remove image</button></div><label>Accent colors<select id="theme-image-mode"><option value="auto">Automatic from image</option><option value="manual">Choose manually</option></select></label><label><span class="theme-visibility-label">Image visibility<output id="theme-image-opacity-value" for="theme-image-opacity">30%</output></span><input id="theme-image-opacity" type="range" min="0" max="70" step="5" value="30"></label><small id="theme-image-status" class="small-note"></small></div><div class="theme-color-fields">${OrbitTheme.fields.map(key=>`<div class="theme-color-control"><label for="theme-hex-${key}">${({background:'Background',surface:'Surfaces',text:'Text',muted:'Secondary text',accent:'Accent',positive:'Play button',warm:'Warm highlight',secondary:'Cool highlight'})[key]}</label><div class="theme-color-value"><span class="theme-color-swatch" id="theme-swatch-${key}" aria-hidden="true"></span><input type="text" id="theme-hex-${key}" aria-label="${key} hex code" pattern="#[0-9a-fA-F]{6}" maxlength="7" spellcheck="false" autocomplete="off" required><button type="button" class="subtle-button" data-change-color="${key}" aria-label="Change ${key} color">Change</button><input class="theme-native-color" type="color" id="theme-color-${key}" aria-label="${key} color" tabindex="-1"></div></div>`).join('')}</div><p class="theme-warning" id="theme-warning" hidden>Increase text contrast for readability.</p><div class="theme-actions"><button class="primary-button" type="submit">Save theme</button><button id="theme-discard" class="subtle-button" type="button">Discard preview</button></div></form></details><div class="setting-card setting-row"><div><h3>Playful motion<button type="button" class="info-button" data-orbit-help="Panel transitions and highlights respect your system’s reduced-motion setting." aria-label="About Playful motion" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3></div><button id="motion-toggle" class="setting-switch" role="switch" aria-label="Playful motion" aria-checked="${motionEnabled}"></button></div></section>
  <section id="panel-about" role="tabpanel" aria-labelledby="tab-about" hidden><div class="setting-card"><h3>Orbit <span class="prerelease-badge">Pre-release</span></h3><p id="about-version" class="small-note">Reading version…</p><p class="small-note">Game library and launcher. MIT licensed.</p><button id="report-issue" class="subtle-button">Report an issue</button><button type="button" class="info-button" data-orbit-help="Include the build number and steps to reproduce. Keep account keys and private files out of the report." aria-label="About Reporting an issue" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></div><div class="setting-card"><h3>About the project</h3><p>Orbit is a personal project by kokero, started in October 2026.</p><p>Built with Electron and JavaScript, with development assistance from OpenAI Codex (GPT-6.1 Sol).</p></div><section class="setting-card special-thanks"><h3>Special thanks</h3><p>Thanks to everyone who tests Orbit and shares feedback.</p></section></section><section id="panel-manage" role="tabpanel" aria-labelledby="tab-manage" hidden>    <div class="setting-card"><h3>Updates</h3><p id="update-version" class="small-note"></p><p id="update-status" class="small-note" role="status">Checking update support…</p><progress id="update-progress" max="100" value="0" aria-label="Update download progress" hidden></progress><div class="settings-actions"><button id="check-updates" class="subtle-button">Check for updates</button><button id="restart-update" class="primary-button" hidden>Restart now</button><button id="get-update-installer" class="subtle-button" hidden>Get Windows installer</button></div></div><details class="setting-card"><summary>Scan warnings</summary>${state.warnings.length?state.warnings.map(w=>`<p class="small-note">${esc(w)}</p>`).join(''):'<p class="small-note">No scan warnings.</p>'}</details><div class="setting-card"><h3>Library</h3><div class="settings-actions"><button id="import-json" class="subtle-button">Import catalog</button><button id="export-json" class="subtle-button">Export catalog</button><button id="show-hidden" class="subtle-button">Hidden (${state.games.filter(g=>g.hidden).length})</button></div></div><div class="setting-card setting-row"><div><h3>Artwork</h3></div><button id="repair-images" class="subtle-button">Repair images</button></div><div class="setting-card setting-row"><div><h3>Local data<button type="button" class="info-button" data-orbit-help="Opens Orbit’s settings, artwork and local playtime folder. Opening the folder does not create a backup." aria-label="About Local data" aria-expanded="false"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 5.8v.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></h3></div><button id="open-data" class="subtle-button">Open data folder</button></div></section>`);
  window.orbitDev?.mountSettings();
  $('#report-issue').onclick=()=>attempt(()=>window.orbit.reportIssue());
  window.orbit.releaseNotes?.().then(data=>{const label=$('#about-version');if(label)label.textContent='Build '+(data.current?.version||'Unavailable')+' · Windows x64';}).catch(()=>{});
  $('#scan-computer').onclick=()=>showComputerSpecs(true);showComputerSpecs();
  setupThemeEditor();
  window.OrbitAppIconSettings?.mount();
  renderUpdateStatus();if(window.orbit.updateStatus)window.orbit.updateStatus().then(renderUpdateStatus).catch(()=>{});else $('#update-status').textContent='Update status is unavailable.';
  $('#check-updates').onclick=()=>attempt(async()=>renderUpdateStatus(await window.orbit.checkUpdates()));
  $('#restart-update').onclick=()=>attempt(async()=>renderUpdateStatus(await window.orbit.installUpdate()));
  $('#get-update-installer').onclick=()=>attempt(()=>window.orbit.getUpdateInstaller());
  window.orbitCompanion?.mountUpdates();
  $('#reopen-setup').onclick=()=>{closeModal();window.orbitSetup.open();};
  window.orbitFeatures?.mountSettings();window.orbitCompanion?.mountSettings();window.orbitDiscord?.mount();
  $('#settings-installer').onclick=()=>attempt(()=>OrbitInstall.fromFile());
  document.querySelectorAll('[data-install-store]').forEach(b=>b.onclick=()=>attempt(()=>window.orbit.openInstallStore(b.dataset.installStore)));
  window.OrbitSettingsNav?.mount();
  const selectTab=name=>{document.querySelectorAll('[data-settings-tab]').forEach(b=>{const active=b.dataset.settingsTab===name;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});for(const nameOfPanel of ['general','libraries','appearance','manage','privacy','about']){const panel=$('#panel-'+nameOfPanel);if(panel)panel.hidden=nameOfPanel!==name;}if(name!=='appearance')discardThemePreview();};
  document.querySelectorAll('[data-settings-tab]').forEach((b,index,buttons)=>{b.onclick=()=>selectTab(b.dataset.settingsTab);b.onkeydown=e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%buttons.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index+buttons.length-1)%buttons.length;if(e.key==='Home')next=0;if(e.key==='End')next=buttons.length-1;if(next!==undefined){e.preventDefault();buttons[next].focus();selectTab(buttons[next].dataset.settingsTab);}};});
  document.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>attempt(async()=>{b.disabled=true;try{state.settings=await window.orbit.updateSettings({[b.dataset.setting]:b.getAttribute('aria-checked')!=='true'});b.setAttribute('aria-checked',String(state.settings[b.dataset.setting]));const startupStatus=$('#startup-status');if(startupStatus)startupStatus.textContent=state.settings.startupNote||'';window.friendsUI?.settingsChanged();if(b.dataset.setting==='lowMemoryRendering')toast('Quit Orbit from the tray and reopen it to apply rendering changes.');if(b.dataset.setting==='offlineMode'){window.orbitRecovery?.render();window.orbit.getLibrary().then(absorb).catch(()=>{});}}finally{b.disabled=false;}}));
  $('#intro-toggle').onclick=()=>{const enabled=$('#intro-toggle').getAttribute('aria-checked')!=='true';try{localStorage.setItem('orbit-intro',enabled?'on':'off');$('#intro-toggle').setAttribute('aria-checked',String(enabled));}catch{toast('Startup preference could not be saved.',true);}};
  $('#remember-toggle').onclick=()=>{rememberView=!rememberView;$('#remember-toggle').setAttribute('aria-checked',String(rememberView));try{localStorage.setItem('orbit-remember-view',rememberView?'on':'off');if(!rememberView)localStorage.removeItem('orbit-view');}catch{}};
  $('#open-data').onclick=()=>attempt(()=>window.orbit.openData());
  $('#recovery-open-data')?.addEventListener('click',()=>attempt(()=>window.orbit.openData()));
  $('#motion-toggle').onclick=()=>{motionEnabled=!motionEnabled;document.documentElement.classList.toggle('motion-off',!motionEnabled);$('#motion-toggle').setAttribute('aria-checked',String(motionEnabled));try{localStorage.setItem('orbit-motion',motionEnabled?'on':'off');}catch{}if(!motionEnabled)document.getAnimations().forEach(a=>a.cancel());};
  $('#steam-connect').onclick=async()=>{const b=$('#steam-connect');b.disabled=true;$('#steam-connect-result').textContent='Complete sign-in in the Steam window.';try{absorb(await window.orbit.steamConnect());$('#steam-connect-result').textContent='Connected.';}catch(e){$('#steam-connect-result').textContent=e.message;}finally{b.disabled=false;}};
  $('#steam-form').onsubmit=async e=>{e.preventDefault();e.submitter.disabled=true;try{absorb(await window.orbit.steamSync({steamId:$('#steam-id').value.trim(),apiKey:$('#steam-key').value.trim()}));$('#steam-key').value='';$('#steam-result').textContent='Imported.';}catch(x){$('#steam-result').textContent=x.message;}finally{e.submitter.disabled=false;}};
  $('#epic-sync').onclick=async()=>{const b=$('#epic-sync');b.disabled=true;try{const data=await window.orbit.epicSync();if(data){absorb(data);$('#epic-result').textContent='Imported.';}}catch(e){$('#epic-result').textContent=e.message;}finally{b.disabled=false;}};
  $('#modal-body').querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>attempt(()=>window.orbit.help(b.dataset.help)));
  $('#import-json').onclick=()=>attempt(async()=>{absorb(await window.orbit.importLibrary());toast('Catalog imported.');});
  $('#export-json').onclick=()=>attempt(async()=>{const message=await window.orbit.exportLibrary();if(message)toast(message);});
  $('#show-hidden').onclick=()=>{state.view='hidden';state.source='';state.search='';state.page=0;$('#search').value='';closeModal();render();};
  $('#repair-images').onclick=async()=>{closeModal();await refresh(true);toast('Image repair finished.');};
}
function showAdd(){modal(state.section==='tools'?'Add tool':'Add game',`<form id="add-form"><label class="form-field">Title<input id="new-title" required maxlength="300" autofocus></label><label class="form-field">Platform<select id="new-source">${['Other','Steam','Epic Games','GOG','Ubisoft Connect','EA','Battle.net','Xbox','GRYPHLINK','Riot Games','HoYoPlay','Roblox','Minecraft','Standalone'].map(s=>`<option>${s}</option>`).join('')}</select></label><div class="form-row"><button class="primary-button" type="submit">Choose executable</button><button class="subtle-button" type="button" id="add-installer">Install from file</button></div></form>`);$('#add-installer').onclick=()=>attempt(()=>OrbitInstall.fromFile());$('#add-form').onsubmit=e=>{e.preventDefault();attempt(async()=>{const data=await window.orbit.add({title:$('#new-title').value,source:$('#new-source').value,kind:state.section==='tools'?'tool':'game'});if(data){absorb(data);closeModal();}});};}
function showRobloxExperience(g){
 modal(g.title,`<div class="detail-heading">${OrbitIcons.robloxMarkup(g.robloxPlaceId)}<div><p>Roblox experience</p><p class="small-note">Place ${esc(g.robloxPlaceId)}</p></div></div><div class="detail-actions"><button class="primary-button" id="experience-play">Open game</button><button class="subtle-button" id="experience-page">Open page</button><button class="subtle-button" id="experience-favorite">${g.favorite?'Unfavorite':'Favorite'}</button><button class="subtle-button" id="experience-manage">Manage experiences</button><button class="link-button" id="experience-remove">Remove</button></div><section id="detail-utilities" class="settings-section"></section><p class="small-note">Launch mode is set in Experiences. Playtime and achievements are unavailable.</p>`);
 OrbitIcons.observe($('#modal-body'));window.orbitUtilities?.detail(g);window.orbitFeatures?.mountDetails(g);window.orbitCompanion?.mountDetails(g);window.orbitSimple?.details();
 $('#experience-play').onclick=()=>play(g.id);$('#experience-page').onclick=()=>attempt(async()=>toast((await window.orbit.launchRoblox(g.robloxPlaceId,true)).message));
 $('#experience-favorite').onclick=()=>attempt(async()=>{absorb(await window.orbit.preference(g.id,{favorite:!g.favorite}));await showDetails(g.id);});
 $('#experience-remove').onclick=()=>attempt(async()=>{await window.orbit.removeRoblox(g.robloxPlaceId);closeModal();});
 $('#experience-manage').onclick=()=>attempt(async()=>{const app=state.games.find(x=>x.sources.includes('Roblox')&&!x.robloxPlaceId);if(app){await showDetails(app.id);$('#roblox-experiences-tab')?.click();}});
}
async function showDetails(id) {
  const request=++detailRequest;
  try {
    const g=await window.orbit.details(id);if(request!==detailRequest)return;
    if(g.robloxPlaceId){showRobloxExperience(g);return;}
    const v=g.versions[0],isRoblox=/^Roblox(?: Player)?$/i.test(g.title),localStats=g.kind==='game'&&!document.documentElement.classList.contains('couch-mode')?g.sessionStats:null;
    modal(g.title,`<div class="detail-heading">${g.cover?`<img class="detail-art" src="${esc(g.cover)}" data-cover="${id}" alt="">`:''}<div class="detail-summary"><strong>${status(g)}</strong><p>${esc(g.sources.join(' · '))}</p>${g.ownership?.label?`<p class="small-note">${esc(g.ownership.label)}</p>`:''}${g.description?`<p>${esc(g.description)}</p>`:''}</div></div>
    <div class="detail-actions"><button class="primary-button" id="detail-play">${action(g)}</button><button class="subtle-button" id="detail-favorite">${g.favorite?'Unfavorite':'Favorite'}</button><button class="subtle-button" id="detail-locate">Locate executable</button>${g.installed?'<button class="subtle-button" id="detail-folder">Open folder</button>':''}</div>
    ${isRoblox?'<div class="detail-tabs" role="tablist" aria-label="Roblox details"><button class="subtle-button" role="tab" id="roblox-overview-tab" aria-controls="roblox-overview" aria-selected="true">Overview</button><button class="subtle-button" role="tab" id="roblox-experiences-tab" aria-controls="roblox-experiences" aria-selected="false">Experiences</button></div><div id="roblox-overview" role="tabpanel" aria-labelledby="roblox-overview-tab">':''}
    <div class="detail-install" data-install="${id}" ${g.installationProgress?'':'hidden'}>${progressMarkup(g.installationProgress)}</div><div class="detail-statistics"><div class="stats-grid${localStats?' has-session-stats':''}"><div><small>Playtime${g.statsSource?' · '+esc(g.statsSource):''}</small><strong data-playtime="${g.id}">${g.playtimeKnown?hours(g.playtime):'Unavailable'}</strong></div>${localStats?`<div data-detail-stat="plays"><small>Times played${OrbitHelp.markup('Times played','Plays recorded by Orbit, starting with saved session history. Plays from before those records are not included. The total stays saved when older history expires. The same verified game process is counted once; separate observed sessions count when its start time is unavailable. Turning off session history stops new counts. Clearing session history resets the total.')}</small><strong>${Number.isSafeInteger(localStats.timesPlayed)?localStats.timesPlayed.toLocaleString():'Unavailable'}</strong></div>${localStats.showStreaks?`<div data-detail-stat="streak"><small>Current streak${OrbitHelp.markup('Current streak','Consecutive local dates with a recorded launch of this game. Playing other games does not extend it. The streak stays current through yesterday; a missed day resets it. Based on retained history (up to 180 days and 1,000 sessions). Show launch streaks in Privacy controls its visibility.')}</small><strong>${localStats.streaks.current} <span class="detail-stat-unit">${localStats.streaks.current===1?'day':'days'}</span></strong></div>`:''}`:''}<div><small>Last played</small><strong class="small-stat">${date(g.lastPlayed)}</strong></div><div><small>Achievements</small><strong>${g.achievements?`${g.achievements.unlocked} / ${g.achievements.total}`:'Unavailable'}</strong></div><div><small>Size</small><strong>${g.sizeBytes?(g.sizeBytes/1024**3).toFixed(1)+' GB':'Unavailable'}</strong></div></div></div>
    <section class="settings-section" id="detail-utilities"></section>${g.kind==='game'&&!g.storePlaytimeKnown?`<div class="settings-section"><h3>Local playtime <span data-tracking="${id}">${esc(g.tracking?.state||'idle')}</span></h3><div class="settings-actions"><button class="subtle-button" id="timer-toggle">${['running','paused','waiting'].includes(g.tracking?.state)?'Stop timer':'Start manual timer'}</button><button class="subtle-button" id="timer-configure">Choose game executable</button></div><p class="small-note">Tracks while Orbit runs. Manual timers stop when you end them or quit Orbit.</p></div>`:''}${achievementPanel(g)}${g.kind==='game'&&modToolsFor(g).length?`<div class="settings-section"><h3>Mod tools</h3><div class="settings-actions">${modToolsFor(g).map(t=>`<button class="subtle-button" data-mod-tool="${t.id}">${t.installed?'Open':'Get'} ${esc(t.title)}</button>`).join('')}</div></div>`:''}<div class="settings-section"><h3>All copies <span class="small-note">${g.versions.length}</span></h3><p class="small-note">Choose which copy to launch.</p>${g.versions.map(copy=>`<div class="version ${copy.id===v.id?'selected':''}"><div><strong>${esc(copy.source)}</strong><span>${status(copy)}${copy.playtimeKnown?' · '+hours(copy.playtime):''}</span>${copy.launchRoute?`<p class="small-note">${esc(copy.launchRoute.label)}</p>`:''}${copy.location?`<p>${esc(copy.location)}</p>`:''}${copy.catalogNote?`<details><summary>Source information</summary><p>${esc(copy.catalogNote)}</p></details>`:''}</div>${copy.id===v.id?'<span class="selected-label">Preferred launch</span>':`<button class="subtle-button" data-prefer="${esc(copy.id)}">Prefer</button>`}</div>`).join('')}</div>
    <div class="settings-actions"><button class="subtle-button" id="detail-kind">Move to ${g.kind==='tool'?'Games':'Tools'}</button><button class="subtle-button" id="detail-repair">Repair image</button><button class="link-button" id="detail-hide">${g.hidden?'Restore':'Hide'}</button></div>${isRoblox?'</div><section id="roblox-experiences" role="tabpanel" aria-labelledby="roblox-experiences-tab" hidden></section>':''}`);
    if(isRoblox){let mounted=false;const tabs=[$('#roblox-overview-tab'),$('#roblox-experiences-tab')];tabs.forEach((tab,index)=>{tab.onclick=()=>{tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;});$('#roblox-overview').hidden=index!==0;$('#roblox-experiences').hidden=index!==1;if(index===1&&!mounted){mounted=true;window.robloxUI.mount($('#roblox-experiences'));}};tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-index;tabs[next].click();tabs[next].focus();}};});tabs[1].tabIndex=-1;}
    if ($('#timer-toggle')) { $('#timer-toggle').dataset.game=id; $('#timer-toggle').onclick=()=>attempt(async()=>{const current=await window.orbit.details(id);absorb(await (['running','paused','waiting'].includes(current.tracking?.state)?window.orbit.stopTimer(id):window.orbit.startTimer(id)));await showDetails(id);}); }
    if ($('#timer-configure')) $('#timer-configure').onclick=()=>attempt(async()=>{absorb(await window.orbit.configureTimer(id));await showDetails(id);});
    $('#modal-body').querySelectorAll('[data-mod-tool]').forEach(b=>b.onclick=()=>play(b.dataset.modTool));
    $('#detail-play').onclick=()=>play(id);
    $('#detail-favorite').onclick=()=>attempt(async()=>{absorb(await window.orbit.preference(id,{favorite:!g.favorite}));await showDetails(id);});
    $('#detail-locate').onclick=()=>attempt(async()=>{absorb(await window.orbit.locate(id));await showDetails(id);});
    if($('#detail-folder'))$('#detail-folder').onclick=()=>attempt(()=>window.orbit.folder(id));
    $('#detail-kind').onclick=()=>attempt(async()=>{absorb(await window.orbit.preference(id,{kind:g.kind==='tool'?'game':'tool'}));closeModal();});
    $('#detail-hide').onclick=()=>attempt(async()=>{absorb(await window.orbit.preference(id,{hidden:!g.hidden}));closeModal();});
    $('#detail-repair').onclick=()=>attempt(async()=>{const src=await window.orbit.repairImage(id);if(src){const card=state.games.find(x=>x.id===id);if(card)card.cover=src;render();await showDetails(id);}else toast('No working image found.',true);});
    window.orbitUtilities?.detail(g);
    window.orbitFeatures?.mountDetails(g);window.orbitCompanion?.mountDetails(g);window.orbitSimple?.details();
    $('#modal-body').querySelectorAll('[data-prefer]').forEach(b=>b.onclick=()=>attempt(async()=>{absorb(await window.orbit.preference(id,{preferred:b.dataset.prefer}));await showDetails(id);}));
  } catch(e){toast(e.message,true);}
}
function achievementPanel(g) {
  const a=g.achievements;if(!a?.total)return '';
  return `<div class="settings-section"><div class="achievement-heading"><h3>Achievements</h3><span>${Math.round(a.unlocked/a.total*100)}%</span></div><progress value="${a.unlocked}" max="${a.total}"></progress>${a.partial?`<p class="small-note">${a.items.length} cached details · ${a.total} total</p>`:''}<div class="achievement-list">${a.items.map(x=>`<div class="achievement ${x.unlocked?'unlocked':'locked'}">${x.image?`<span class="achievement-art" aria-hidden="true">${window.OrbitControllerArt?.icon('achievement')||'★'}<img data-game="${g.id}" data-achievement="${esc(x.id)}" alt=""></span>`:''}<div><strong>${esc(x.name)}</strong><p>${esc(x.description)}</p><small>${x.unlocked?'Unlocked'+(x.unlockedAt?' · '+new Date(x.unlockedAt).toLocaleDateString():''):'Locked'}${x.rarity!==null?' · '+x.rarity.toFixed(1)+'% of players':''}</small></div></div>`).join('')}</div></div>`;
}
const launchRequests=new Set();
async function play(id,mode){
 if(launchRequests.has(id)||window.orbitLaunch?.pending(id))return;
 launchRequests.add(id);
 try{
  const entry=state.games.find(g=>g.id===id);if(entry&&action(entry)==='Install'&&window.OrbitInstall){const choices=await window.orbit.installChoices(id);if(!choices.launchable){await OrbitInstall.install(id,choices);return;}}
  if(mode===undefined&&window.orbit.launchChoices){const options=await window.orbit.launchChoices(id);if(options.ask){window.orbitFeatures.chooseLaunch(id,options);return;}}
  const controller=document.documentElement.classList.contains('couch-mode');if(controller)window.OrbitGameHandoff?.start(id);window.orbitLaunch?.start(id);const result=await window.orbit.play(id,mode,{controller});if(!result.controllerHandoff)window.OrbitGameHandoff?.dismiss();window.orbitLaunch?.sent(id,result);window.orbitFeatures?.afterPlay(result);window.OrbitCouch?.launched(id,result);return result;
 }catch(e){window.OrbitGameHandoff?.dismiss();window.orbitLaunch?.failed(id,e.message);if(window.orbitRecovery)await window.orbitRecovery.troubleshoot(id,e.message);else toast(e.message,true);}
 finally{launchRequests.delete(id);}
}
function resetPage(){state.page=0;render();}
$('#navigation').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.section){state.section=b.dataset.section;state.view='all';}else state.view=state.view===b.dataset.view?'all':b.dataset.view;state.source='';state.featured='';resetPage();};
$('#source-navigation').onclick=e=>{const b=e.target.closest('[data-source]');if(b){state.source=state.source===b.dataset.source?'':b.dataset.source;state.view='all';resetPage();}};
$('#downloads').onclick=e=>{const source=e.target.closest('[data-download-source]'),game=e.target.closest('[data-download-game]');if(source)attempt(()=>window.orbit.openDownloads(source.dataset.downloadSource));if(game)showDetails(game.dataset.downloadGame);};
$('#game-grid').onclick=e=>{const launch=e.target.closest('[data-list-play]');if(launch){play(launch.dataset.listPlay);return;}const b=e.target.closest('[data-game]');if(b)showDetails(b.dataset.game);};
$('#recent-games').onclick=e=>{const b=e.target.closest('[data-recent]');if(b){state.featured=b.dataset.recent;renderHero(sectionItems());}};
$('#search').oninput=e=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{state.search=e.target.value;resetPage();},100);};
$('#search').onkeydown=e=>{if(e.key==='Escape'&&!e.isComposing&&(e.target.value||state.search)){e.preventDefault();e.stopPropagation();clearTimeout(searchTimer);e.target.value='';state.search='';resetPage();}};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'&&!e.altKey&&!$('#modal').open){const input=state.section==='friends'?$('#friends-search'):$('#search');if(input?.getClientRects().length){e.preventDefault();input.focus();input.select();}}});
$('#sort').onchange=e=>{state.sort=e.target.value;resetPage();};
$('#grid-view').onclick=()=>{state.list=false;render();};$('#list-view').onclick=()=>{state.list=true;render();};
for(const [id,delta] of [['previous-page',-1],['next-page',1]])$('#'+id).onclick=()=>{state.page+=delta;render();$('#game-grid').scrollIntoView({block:'start'});};
$('#refresh').onclick=()=>state.section==='friends'?friendsUI.refresh():refresh();$('#hero-play').onclick=()=>play(state.featured);$('#hero-details').onclick=()=>showDetails(state.featured);
$('#settings-button').onclick=()=>attempt(async()=>{state.settings=await window.orbit.getSettings();showSettings();});$('#add-game').onclick=showAdd;$('#modal-close').onclick=closeModal;
$('#modal').addEventListener('cancel',e=>{e.preventDefault();closeModal();});
bindDialogDismiss($('#modal'),closeModal);
$('#modal-close').title='Close (Esc or Ctrl+W)';
$('#empty-action').onclick=()=>{state.view='all';state.source='';state.search='';$('#search').value='';resetPage();};

let closingWindow=false;
document.querySelectorAll('[data-window]').forEach(b=>b.onclick=async()=>{
 const action=b.dataset.window;if(action!=='close'||!allowMotion()){window.orbit.control(action);return;}if(closingWindow)return;closingWindow=true;
 const shell=$('.app-shell');let animation;try{animation=shell.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(5px)'}],{duration:140,easing:'ease-in',fill:'forwards'});}catch{closingWindow=false;window.orbit.control(action);return;}
 try{await new Promise(resolve=>{const timeout=setTimeout(resolve,220);animation.finished.then(()=>{clearTimeout(timeout);resolve();},()=>{clearTimeout(timeout);resolve();});});await window.orbit.control(action);}finally{animation.cancel();closingWindow=false;}
});
// Restoring the window must not transform the entire interactive surface.
document.addEventListener('keydown',e=>{if(e.key==='/'&&!$('#modal').open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();(state.section==='friends'?$('#friends-search'):$('#search')).focus();}});
window.runSmokeTests=async()=>{
  const checks=[],check=(name,passed)=>checks.push({name,passed:Boolean(passed)});
  state.section='games';state.view='all';state.source='';state.search='';state.list=false;state.sort='recent';render();
  check('discovery loaded',state.games.length>0);
  check('games exclude tools',filtered().every(g=>g.kind==='game'));
  state.section='tools';state.featured='';render();check('tools separated and banner hidden',filtered().length>0&&filtered().every(g=>g.kind==='tool')&&$('#hero').hidden);
  state.section='games';state.source='Others';render();check('Others groups minor platforms',filtered().every(g=>g.sources.some(s=>!['Steam','Epic Games'].includes(s))));
  check('platform list uses brand logos and three groups',$('#source-navigation').children.length===3&&$('#source-navigation').querySelectorAll('img.platform-logo').length===2);
  state.source='';state.search='__no_orbit_match__';render();check('search empty state',!$('#empty').hidden);
  state.search='';state.view='installed';render();check('installed filter',filtered().every(g=>g.installed));
  state.view='favorites';render();check('favorites filter',filtered().every(g=>g.favorite));
  state.view='all';state.list=true;render();check('list view',$('#game-grid').classList.contains('list'));
  state.list=false;render();check('bounded grid rendering',$('#game-grid').children.length<=PAGE_SIZE);
  if(filtered().length>PAGE_SIZE){const first=$('#game-grid').firstElementChild.dataset.game;state.page=1;render();check('pagination changes cards',$('#game-grid').firstElementChild.dataset.game!==first);}
  state.page=0;
  const game=state.games.find(g=>g.kind==='game');if(game){absorb(await window.orbit.preference(game.id,{favorite:true}));check('favorite persists',state.games.find(g=>g.id===game.id).favorite);absorb(await window.orbit.preference(game.id,{favorite:false}));}
  const savedSettings=await window.orbit.getSettings();state.settings=await window.orbit.updateSettings({autoDiscover:!savedSettings.autoDiscover});check('automatic discovery setting persists',(await window.orbit.getSettings()).autoDiscover===!savedSettings.autoDiscover);state.settings=await window.orbit.updateSettings({autoDiscover:savedSettings.autoDiscover});
  showSettings();check('quality of life options available',['autoDiscover','closeToTray','autoLoadFriends','autoUpdates','restartForUpdates'].every(key=>Boolean(document.querySelector('[data-setting="'+key+'"]')))&&$('#remember-toggle')&&$('#open-data'));check('connection forms',$('#steam-form')&&$('#epic-sync')&&$('#repair-images'));
  $('#tab-appearance').click();check('settings sections are focused and accessible',!$('#panel-appearance').hidden&&$('#panel-libraries').hidden&&$('#tab-appearance').getAttribute('aria-selected')==='true');
  check('fourteen built-in themes available',OrbitTheme.builtins.length>=14&&$('#theme-picker').children.length>=14);
  const originalTheme=activeTheme;chooseTheme('ocean');renderThemePicker();fillThemeEditor();check('theme switches through CSS variables',document.documentElement.style.getPropertyValue('--accent')===OrbitTheme.builtins.find(t=>t.id==='ocean').colors.accent);
  $('#theme-color-accent').value='#eab0d9';$('#theme-color-accent').dispatchEvent(new Event('input',{bubbles:true}));check('custom theme previews immediately',themePreview&&document.documentElement.style.getPropertyValue('--accent')==='#eab0d9');$('#theme-discard').click();check('discard restores saved theme',!themePreview&&document.documentElement.style.getPropertyValue('--accent')===selectedTheme().colors.accent);
  $('#theme-name').value='Smoke test palette';$('#theme-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));check('custom themes save and select',activeTheme.startsWith('custom-')&&selectedTheme().name==='Smoke test palette');$('#theme-delete').click();check('custom themes removable',!customThemes.some(t=>t.name==='Smoke test palette'));chooseTheme(originalTheme);renderThemePicker();fillThemeEditor();
  const beforeMotion=motionEnabled;$('#motion-toggle').click();check('motion preference switches',motionEnabled!==beforeMotion&&document.documentElement.classList.contains('motion-off')===!motionEnabled);$('#motion-toggle').click();
  $('#tab-manage').click();check('management tools remain accessible',!$('#panel-manage').hidden&&$('#repair-images').getBoundingClientRect().height>0);closeModal();
  state.section='friends';render();for(let i=0;i<50&&!friendsUI.getData();i++)await new Promise(r=>setTimeout(r,20));
  check('friends view has separate platform controls',$('#library-panel').hidden&&!$('#friends-panel').hidden&&document.querySelectorAll('#friends-platforms [data-social-more]').length===3&&document.querySelectorAll('#friends-platforms [data-social-provider]').length===3);
  const socialProviders=friendsUI.getData().providers,epicSocial=socialProviders.find(p=>p.id==='epic'),discordSocial=socialProviders.find(p=>p.id==='discord');
  check('Epic remains client-only and Discord controls match its capability',!epicSocial.connected&&!epicSocial.friendsSupported&&!discordSocial.connected&&Boolean(document.querySelector('[data-social-connect=discord]'))===discordSocial.friendsSupported);
  check('available Discord preview is labeled before account linking',!discordSocial.experimental||!discordSocial.friendsSupported||[...document.querySelectorAll('.social-platform')].some(el=>el.textContent.includes('Discord')&&el.textContent.includes('Dev preview')));
  $('#friends-all').click();check('friend filters preserve platform labels',[...document.querySelectorAll('.friend-source')].every(n=>/Steam|Epic Games|Discord/.test(n.textContent)));
  friendsUI.connect();check('account picker offers supported connections',Boolean(document.querySelector('.social-account-picker [data-social-provider=steam] [data-social-more]')));closeModal();friendsUI.connect('steam');check('friend connection offers optional secure key storage',Boolean($('#friends-steam-key')&&$('#friends-remember')));closeModal();
  state.section='games';render();
  const stats=state.games.find(g=>g.achievements?.total&&g.playtimeKnown);if(stats){await showDetails(stats.id);check('lazy statistics panels',$('.stats-grid')&&$('progress'));closeModal();}
  const playable=state.games.find(g=>g.installed&&g.sources.includes('Steam'));if(playable){const r=await window.orbit.play(playable.id);check('Steam launch route dry run uses silent mode when the client is detected',r.action?.type==='exe'?r.action.args?.[0]==='-silent'&&r.action.args?.[1]==='-applaunch'&&/^\d+$/.test(r.action.args?.[2]):r.action?.type==='url');}
  const direct=state.games.find(g=>g.directLaunchAvailable);if(direct){const r=await window.orbit.play(direct.id);check('VALORANT uses game-specific Riot launch arguments',r.action?.type==='exe'&&r.action.args?.includes('--launch-product=valorant')&&action(direct)==='Play');}
  const launcher=state.games.find(g=>g.launcherAvailable&&!g.directLaunchAvailable);if(launcher){const r=await window.orbit.play(launcher.id);check('shortcut route dry run',r.action?.type==='shortcut');}
  check('summaries exclude achievement detail arrays',state.games.every(g=>!g.achievements?.items));
  const coverGames=state.games.filter(g=>g.cover),images=[];let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<coverGames.length){const g=coverGames[cursor++];images.push(await new Promise(resolve=>{const img=new Image();const timer=setTimeout(()=>resolve(false),7000);img.onload=()=>{clearTimeout(timer);resolve(img.naturalWidth>0&&img.naturalWidth<=320&&img.naturalHeight<=480);};img.onerror=()=>{clearTimeout(timer);resolve(false);};img.src=g.cover||'';}));}}));
  check('available covers decode at thumbnail size',images.length>0&&images.every(Boolean));
  state.view='all';state.section='games';state.source='';state.featured='';render();
  check('latest banner excludes tools',state.games.find(g=>g.id===state.featured)?.lastPlayed===Math.max(...sectionItems().map(g=>g.lastPlayed)));
  const local=state.games.find(g=>g.kind==='game'&&!g.storePlaytimeKnown);
  if(local){absorb(await window.orbit.startTimer(local.id));check('local timer starts through bridge',state.games.find(g=>g.id===local.id).tracking.state==='running');await showDetails(local.id);check('local timer controls in details',Boolean($('#timer-toggle')&&$('#timer-configure')));absorb(await window.orbit.stopTimer(local.id));check('local timer stops and preserves total',state.games.find(g=>g.id===local.id).tracking.state==='idle'&&state.games.find(g=>g.id===local.id).localPlaytime);closeModal();}
  const controls=['#search','#sort',window.orbitSimple?'#library-view-button':'.view-toggle'].map(s=>{const element=$(s);return (element.hidden&&element.dataset.desktopSelect?element.nextElementSibling:element).getBoundingClientRect();});
  check('toolbar controls share center and height',controls.every(r=>Math.abs(r.height-controls[0].height)<1&&Math.abs(r.top+r.height/2-controls[0].top-controls[0].height/2)<1));
  await new Promise(r=>setTimeout(r,300));
  const columns=getComputedStyle($('#game-grid')).gridTemplateColumns.split(' ').length;
  const covers=[...document.querySelectorAll('.cover-wrap')].slice(0,columns).map(n=>n.getBoundingClientRect());
  check('first row cards share top and size',covers.every(r=>Math.abs(r.top-covers[0].top)<1&&Math.abs(r.height-covers[0].height)<1));
  check('no horizontal overflow',document.documentElement.scrollWidth===window.innerWidth);
  await new Promise(r=>setTimeout(r,300));check('no repeating animations at idle',document.getAnimations().filter(a=>a.playState==='running').every(a=>a.effect.getTiming().iterations===1&&a.effect.getTiming().duration<=500));
  return{passed:checks.every(c=>c.passed),checks,renderedCards:$('#game-grid').children.length,animationDiagnostics:document.getAnimations().map(a=>({name:a.animationName,state:a.playState,target:a.effect?.target?.id||a.effect?.target?.className})),missingCoverCount:state.games.filter(g=>!g.cover).length};
};
friendsUI.bind();friendsUI.preload();
refresh();

async function runContextAction(id, command) {
  if (!command) return;
  const g=state.games.find(x=>x.id===id);
  if(id&&!g)throw Error('This entry is no longer in the library. Refresh and try again.');
  switch(command.action) {
    case 'return': return window.orbit.focusGame(id);
    case 'close-game': return window.orbitFeatures.closeGame(id);
    case 'launch-settings': {const game=await window.orbit.details(id);return window.OrbitDesktopLaunch&&!document.documentElement.classList.contains('couch-mode')?OrbitDesktopLaunch.manager(game):window.orbitFeatures.editProfile(game);}
    case 'detection': return window.orbitRecovery.detection(id);
    case 'artwork': return window.orbitPolish.artwork(await window.orbit.details(id));
    case 'uninstall': return window.OrbitInstall.uninstall(id);
    case 'manage-collections': return $('#manage-collections')?.click();
    case 'hidden-games': state.view='hidden';state.source='';state.search='';state.page=0;$('#search').value='';render();break;
    case 'library-health': return window.orbitCompanion.health();
    case 'cleanup': return window.orbitFeatures.cleanup();
    case 'export-table': return window.orbitPlus.exportTable();
    case 'collection': {const names=new Set(g.collections||[]);if(names.has(command.name))names.delete(command.name);else names.add(command.name);absorb(await window.orbit.assignCollections({id,names:[...names]}));break;}
    case 'play': return play(id);
    case 'open-tool': return play(command.toolId);
    case 'details': return showDetails(id);
    case 'folder': return window.orbit.folder(id);
    case 'shortcut': return toast((await window.orbit.createShortcut(id)).message);
    case 'copy-title': return window.orbit.copyTitle(id);
    case 'favorite': absorb(await window.orbit.preference(id,{favorite:!g.favorite})); break;
    case 'hide': absorb(await window.orbit.preference(id,{hidden:!g.hidden})); break;
    case 'move': absorb(await window.orbit.preference(id,{kind:g.kind==='tool'?'game':'tool'})); break;
    case 'prefer': absorb(await window.orbit.preference(id,{preferred:command.versionId})); break;
    case 'locate': absorb(await window.orbit.locate(id)); break;
    case 'repair': {const src=await window.orbit.repairImage(id);if(src){g.cover=src;render();}else toast('No working image found.',true);break;}
    case 'start-timer': absorb(await window.orbit.startTimer(id)); break;
    case 'stop-timer': absorb(await window.orbit.stopTimer(id)); break;
    case 'track-executable': absorb(await window.orbit.configureTimer(id)); break;
    case 'add': showAdd(); break;
    case 'refresh': return refresh();
    case 'grid': state.list=false;render();break;
    case 'list': state.list=true;render();break;
    case 'settings': showSettings();break;
  }
}
function contextTarget(target){
 const direct=target.closest('[data-game].game-card,[data-game].list-game,[data-recent],[data-list-play],[data-return-game]');
 if(direct)return direct.dataset.game||direct.dataset.recent||direct.dataset.listPlay||direct.dataset.returnGame;
 const row=target.closest('.game-row,.running-game');if(row){const entry=row.querySelector('[data-game],[data-return-game]');return entry?.dataset.game||entry?.dataset.returnGame||null;}
 return target.closest('#hero')?state.featured:null;
}
function contextAllowed(target){return !$('#modal').open&&!$('#library-panel').hidden&&state.section!=='friends'&&Boolean(target.closest('#library-panel'))&&!target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]')&&Boolean(contextTarget(target)||!target.closest('button,a,summary,[popover]'));}
async function openContext(target,point){
 const id=contextTarget(target),surface=id&&target.closest('.game-card,.game-row,.recent-game,.running-game,#hero');
 window.orbitSimple?.closeMenus();contextMenus++;
 if(surface){surface.classList.add('context-target');const control=surface.matches('button')?surface:surface.querySelector('button');control?.focus({preventScroll:true});}
 try{await attempt(async()=>{const items=await window.orbit.contextMenuItems({id,section:state.section,list:state.list});const title=id?state.games.find(g=>g.id===id)?.title||'Game actions':'Library actions';return runContextAction(id,await window.OrbitContextMenu.open(items,point,title));});}
 finally{surface?.classList.remove('context-target');contextMenus--;if(!contextMenus)flushLibraryUpdate();}
}
document.addEventListener('contextmenu',e=>{if(!contextAllowed(e.target))return;e.preventDefault();openContext(e.target,{x:e.clientX,y:e.clientY});});
document.addEventListener('keydown',e=>{if((e.key==='ContextMenu'||e.key==='F10'&&e.shiftKey)&&contextAllowed(document.activeElement)){e.preventDefault();const target=document.activeElement,r=target.getBoundingClientRect();openContext(target,{x:r.left+r.width/2,y:r.top+r.height/2});}});
window.orbit.onPlaytimeUpdate(updates=>{
 const games=new Map(state.games.map(g=>[g.id,g])),changed=new Map();
 for(const update of updates){const g=games.get(update.id);if(!g||g.storePlaytimeKnown)continue;g.tracking={...g.tracking,...update};
  if(update.since){g.playtime=update.seconds/60;g.playtimeKnown=true;g.localPlaytime=true;g.statsSource='Orbit (local)';}changed.set(g.id,g);
 }
 document.querySelectorAll('[data-playtime],[data-tracking]').forEach(node=>{const g=changed.get(node.dataset.playtime||node.dataset.tracking);if(g)node.textContent=node.hasAttribute('data-playtime')?(g.playtimeKnown?hours(g.playtime):''):g.tracking.state;});
 const toggle=$('#timer-toggle'),game=changed.get(toggle?.dataset.game);if(game)toggle.textContent=['running','paused','waiting'].includes(game.tracking.state)?'Stop timer':'Start manual timer';
});

// Keep the pressed element alive until Chromium has dispatched its click.
// Background snapshots otherwise replace the button between down and up.
let libraryPointer=null,pendingLibrary=null,libraryFlush=null,contextMenus=0;
function applyLibraryUpdate(data){
 const oldGames=new Map(state.games.map(g=>[g.id,g]));
 const ready=data.games.filter(g=>g.installed&&oldGames.has(g.id)&&!oldGames.get(g.id).installed);
 const focused=document.activeElement,attribute=['data-game','data-list-play','data-recent','data-source'].find(name=>focused?.hasAttribute(name)),value=attribute&&focused.getAttribute(attribute);
 absorb(data);
 if(attribute&&!focused.isConnected)document.querySelector('['+attribute+'="'+CSS.escape(value)+'"]')?.focus({preventScroll:true});
 if(ready.length)toast(ready.length===1?ready[0].title+' is ready to play':ready.length+' games are ready to play');
}
function flushLibraryUpdate(){clearTimeout(libraryFlush);libraryFlush=null;if(libraryPointer!==null||contextMenus||!pendingLibrary)return;const data=pendingLibrary;pendingLibrary=null;applyLibraryUpdate(data);}
function releaseLibraryPointer(e){if(e&&e.pointerId!==libraryPointer)return;libraryPointer=null;clearTimeout(libraryFlush);libraryFlush=setTimeout(flushLibraryUpdate,0);}
document.addEventListener('pointerdown',e=>{if(e.button===0){clearTimeout(libraryFlush);libraryFlush=null;libraryPointer=e.pointerId;}},true);
document.addEventListener('pointerup',releaseLibraryPointer,true);
document.addEventListener('pointercancel',releaseLibraryPointer,true);
window.addEventListener('blur',()=>releaseLibraryPointer());
window.orbit.onLibraryUpdate(data=>{pendingLibrary=data;if(libraryPointer===null&&libraryFlush===null)flushLibraryUpdate();});
window.orbit.onInstallationUpdate(updates=>{
 const games=new Map(state.games.map(g=>[g.id,g])),changed=new Map();
 for(const update of updates){const g=games.get(update.id);if(g){g.installationProgress=update.installationProgress;changed.set(g.id,g);}}
 document.querySelectorAll('[data-install]').forEach(node=>{const g=changed.get(node.dataset.install);if(g){node.hidden=!g.installationProgress;node.innerHTML=progressMarkup(g.installationProgress);}});
 renderDownloads();
});

let transferExpiry=null;
function scheduleTransferExpiry(){clearTimeout(transferExpiry);transferExpiry=null;if(document.hidden||!document.hasFocus())return;const fresh=state.games.some(g=>g.installationProgress?.etaSeconds>0&&Date.now()-(g.installationProgress.sampledAt||0)<90000);if(fresh)transferExpiry=setTimeout(()=>{document.querySelectorAll('[data-install]').forEach(node=>{const g=state.games.find(g=>g.id===node.dataset.install);if(g?.installationProgress)node.innerHTML=progressMarkup(g.installationProgress);});renderDownloads();scheduleTransferExpiry();},15000);}
window.orbit.onInstallationUpdate(()=>scheduleTransferExpiry());window.addEventListener('focus',scheduleTransferExpiry);window.addEventListener('blur',()=>{clearTimeout(transferExpiry);transferExpiry=null;});document.addEventListener('visibilitychange',scheduleTransferExpiry);



