/* Desktop library presentation and organization. No scans or polling. */
(()=>{
  const model=OrbitDesktopLibraryModel,key='orbit-desktop-library-v1',selection=new model.Selection();
  let settings=model.preferences(),selecting=false,busy=false,undo=null,scope='';
  try{settings=model.preferences(JSON.parse(localStorage.getItem(key)||'{}'));}catch{}
  const defaults={...model.display({...settings,layout:state.list?'list':settings.layout})},viewsKey='orbit-library-views-v1';let savedViews=model.views(),displayScope=null,drag=null,suppressClickUntil=0;
  try{savedViews=model.views(JSON.parse(localStorage.getItem(viewsKey)||'{}'));}catch{}
  const desktop=()=>!document.documentElement.classList.contains('couch-mode');
  const active=()=>desktop()&&!$('#library-panel').hidden&&['games','tools'].includes(state.section)&&(!window.orbitShell||['library','tools'].includes(orbitShell.current()));
  const save=()=>{try{localStorage.setItem(key,JSON.stringify({...defaults,layout:defaults.layout==='banners'?'banners':'covers',pins:settings.pins}));}catch{toast('Library display settings could not be saved.',true);}};
  function saveView(){if(!active())return;const current=model.scope(state.section,$('#collection-filter').value);savedViews[current]=model.display({...settings,layout:state.list?'list':settings.layout});savedViews=model.views(savedViews);if(current==='games|')Object.assign(defaults,savedViews[current]);try{localStorage.setItem(viewsKey,JSON.stringify(savedViews));save();}catch{toast('Library display settings could not be saved.',true);}}
  function syncView(){if(!active())return;const next=model.scope(state.section,$('#collection-filter').value);if(next===displayScope)return;const view=savedViews[next]||savedViews['games|']||defaults;displayScope=next;settings.layout=view.layout==='banners'?'banners':'covers';settings.size=view.size;settings.spacing=view.spacing;state.list=view.layout==='list';for(const [id,field]of [['library-card-size','size'],['library-spacing','spacing']])$('#'+id).value=settings[field];}
  const options=()=>[...$('#collection-filter').options].filter(o=>o.value).map(o=>({value:o.value,name:o.textContent}));
  const grid=$('#game-grid'),view=$('#library-view');
  const sizeControls=document.createElement('div');sizeControls.className='library-size-controls';
  sizeControls.innerHTML='<label>Card size <output id="library-card-size-value"></output><input id="library-card-size" aria-label="Library card size" type="range" min="120" max="260" step="10"></label><label>Spacing <output id="library-spacing-value"></output><input id="library-spacing" aria-label="Library card spacing" type="range" min="8" max="32" step="2"></label>';
  const bannerButton=document.createElement('button');bannerButton.id='banner-view';bannerButton.textContent='Banners';
  $('#grid-view').textContent='Covers';$('#grid-view').after(bannerButton);view.append(sizeControls);
  const picker=view.querySelector('.view-toggle');picker.classList.add('library-layout-picker');picker.setAttribute('role','group');picker.setAttribute('aria-label','Library layout');
  for(const [id,label,art]of [
    ['grid-view','Covers','<rect x="3" y="4" width="10" height="22" rx="2"/><rect x="19" y="4" width="10" height="22" rx="2"/>'],
    ['banner-view','Banners','<rect x="3" y="5" width="26" height="8" rx="2"/><rect x="3" y="18" width="26" height="8" rx="2"/>'],
    ['list-view','List','<rect x="3" y="4" width="6" height="6" rx="1.5"/><rect x="3" y="13" width="6" height="6" rx="1.5"/><rect x="3" y="22" width="6" height="6" rx="1.5"/><path d="M14 7h15M14 16h15M14 25h15"/>'],
  ]){const button=$('#'+id);button.type='button';button.classList.remove('desktop-action');button.classList.add('layout-choice');button.setAttribute('aria-label',label);button.innerHTML='<svg class="layout-choice-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">'+art+'</svg><span class="layout-choice-label">'+label+'</span>';}
  function layout(value){settings.layout=value==='banners'?'banners':'covers';state.list=value==='list';saveView();render();}
  $('#grid-view').onclick=()=>layout('covers');bannerButton.onclick=()=>layout('banners');$('#list-view').onclick=()=>layout('list');
  for(const [id,field]of [['library-card-size','size'],['library-spacing','spacing']]){
    $('#'+id).value=settings[field];$('#'+id).oninput=e=>{settings[field]=Number(e.target.value);paintDisplay();};$('#'+id).onchange=saveView;
  }
  function paintDisplay(){
    const banner=desktop()&&settings.layout==='banners';grid.dataset.libraryLayout=settings.layout;
    grid.style.setProperty('--library-card-size',Math.round(settings.size*(banner?1.65:1))+'px');grid.style.setProperty('--library-card-gap',settings.spacing+'px');
    $('#library-card-size-value').textContent=Math.round(settings.size*(banner?1.65:1))+' px';$('#library-spacing-value').textContent=settings.spacing+' px';
    sizeControls.hidden=state.list;$('#banner-view').setAttribute('aria-pressed',String(banner&&!state.list));$('#banner-view').classList.toggle('active',banner&&!state.list);
    $('#grid-view').setAttribute('aria-pressed',String(!banner&&!state.list));$('#grid-view').classList.toggle('active',!banner&&!state.list);
  }
  const pinButton=document.createElement('button');pinButton.className='subtle-button';pinButton.textContent='Pin';pinButton.setAttribute('aria-label','Pin collections');pinButton.title='Pin collections in the sidebar';pinButton.dataset.orbitIcon='folder';
  $('.library-collections').append(pinButton);pinButton.onclick=managePins;
  const pins=document.createElement('section');pins.id='pinned-collections';pins.setAttribute('aria-label','Pinned collections');$('#source-navigation').after(pins);
  const dropList=document.createElement('section');dropList.id='library-drop-collections';dropList.hidden=true;pins.after(dropList);
  const dragBadge=document.createElement('div');dragBadge.className='library-drag-badge';dragBadge.setAttribute('aria-hidden','true');document.body.append(dragBadge);
  function endDrag(){drag=null;dropList.hidden=true;dropList.replaceChildren();document.querySelectorAll('.collection-drop-target,.collection-drop-ready,.collection-drop-unavailable').forEach(n=>n.classList.remove('collection-drop-target','collection-drop-ready','collection-drop-unavailable'));}
  const dropButton=event=>event.target.closest('#pinned-collections [data-pinned-collection],#library-drop-collections [data-drop-collection]');
  function dropKey(button){return button?.dataset.pinnedCollection||button?.dataset.dropCollection||'';}
  function accepts(event){return drag&&active()&&!busy&&!document.querySelector('dialog[open]')&&[...event.dataTransfer?.types||[]].includes('application/x-orbit-library-games');}
  grid.addEventListener('dragstart',event=>{const button=event.target.closest('[data-game]');if(!button||!active()||busy||document.querySelector('dialog[open]')){event.preventDefault();return;}const ids=model.dragIds(button.dataset.game,selection.ids,order());if(!ids.length){event.preventDefault();return;}drag={ids,token:crypto.randomUUID()};event.dataTransfer.effectAllowed='copy';event.dataTransfer.setData('application/x-orbit-library-games',drag.token);dragBadge.textContent=ids.length===1?state.games.find(g=>g.id===ids[0]).title:ids.length+' selected';event.dataTransfer.setDragImage(dragBadge,16,16);const pinned=new Set([...pins.querySelectorAll('[data-pinned-collection]')].map(b=>b.dataset.pinnedCollection));const remaining=options().filter(o=>o.value.startsWith('manual:')&&!pinned.has(o.value));dropList.innerHTML='<div class="sidebar-heading">Add to collection</div>'+remaining.map(o=>'<button type="button" class="nav-item" data-orbit-icon="folder" data-drop-collection="'+esc(o.value)+'">'+esc(o.name)+'</button>').join('');dropList.hidden=!remaining.length;for(const b of pins.querySelectorAll('[data-pinned-collection]'))b.classList.add(b.dataset.pinnedCollection.startsWith('manual:')?'collection-drop-ready':'collection-drop-unavailable');});
  document.addEventListener('dragover',event=>{const b=dropButton(event);if(!b||!accepts(event))return;event.preventDefault();document.querySelectorAll('.collection-drop-target').forEach(n=>n.classList.remove('collection-drop-target'));const manual=dropKey(b).startsWith('manual:');event.dataTransfer.dropEffect=manual?'copy':'none';if(manual)b.classList.add('collection-drop-target');});
  document.addEventListener('dragleave',event=>{const b=dropButton(event);if(b&&!b.contains(event.relatedTarget))b.classList.remove('collection-drop-target');});
  document.addEventListener('drop',event=>{const b=dropButton(event);if(!b||!accepts(event))return;event.preventDefault();const key=dropKey(b),ids=[...drag.ids],valid=event.dataTransfer.getData('application/x-orbit-library-games')===drag.token;endDrag();suppressClickUntil=performance.now()+300;if(!valid||!key.startsWith('manual:')||!options().some(o=>o.value===key))return;runBulk('collection-add',decodeURIComponent(key.slice(7)),ids);});
  grid.addEventListener('dragend',()=>{suppressClickUntil=performance.now()+300;endDrag();});window.addEventListener('blur',endDrag);document.addEventListener('visibilitychange',()=>{if(document.hidden)endDrag();});
  function pinCollection(value){const control=$('#collection-filter');if(!options().some(o=>o.value===value))return;state.source='';state.view='all';control.value=value;control.dispatchEvent(new Event('change',{bubbles:true}));}
  function managePins(){
    const choices=options();modal('Pin collections',`<form class="library-pin-panel"><div class="library-pin-choices" role="group" aria-label="Collections to pin">${choices.map(o=>{const smart=o.value.startsWith('smart:');return `<label>${window.OrbitCollectionUI?.symbol(o.value)||OrbitControllerArt.icon('folder')}<strong>${esc(smart?o.name.replace(/ · Smart$/,''):o.name)}</strong>${smart?'<span class="library-pin-kind">Smart</span>':''}<input type="checkbox" value="${esc(o.value)}" ${settings.pins.includes(o.value)?'checked':''}></label>`;}).join('')||'<p>Create a collection to pin it here.</p>'}</div><footer class="library-pin-footer"><button type="button" id="library-manage-pins" class="subtle-button">Manage collections</button><button type="submit" id="library-save-pins" class="primary-button">Save</button></footer></form>`);
    $('.library-pin-panel').onsubmit=e=>{e.preventDefault();settings.pins=[...e.currentTarget.querySelectorAll('input:checked')].map(i=>i.value);save();paintPins();closeModal();};$('#library-manage-pins').onclick=()=>$('#manage-collections').click();
  }
  function paintPins(){
    pins.hidden=!active()||!settings.pins.length;if(pins.hidden)return;
    const all=options(),chosen=settings.pins.map(value=>all.find(o=>o.value===value)).filter(Boolean);
    const markup='<div class="sidebar-heading">Collections</div>'+chosen.map(o=>`<button class="nav-item ${$('#collection-filter').value===o.value?'active':''}" data-pinned-collection="${esc(o.value)}" data-orbit-icon="folder">${window.OrbitCollectionUI?.symbol(o.value)||''}<span>${esc(o.name)}</span></button>`).join('');
    if(pins.orbitMarkup!==markup){pins.innerHTML=markup;pins.orbitMarkup=markup;}pins.hidden=!chosen.length;
  }
  pins.onclick=e=>{const b=e.target.closest('[data-pinned-collection]');if(b)pinCollection(b.dataset.pinnedCollection);};
  document.addEventListener('orbit:collections',paintPins);
  const selectButton=document.createElement('button');selectButton.id='library-select';selectButton.className='subtle-button';selectButton.textContent='Select';selectButton.title='Select entries · Ctrl-click to toggle · Shift-click for a range · Ctrl+A for all results';selectButton.setAttribute('aria-pressed','false');
  $('.library-collections').append(selectButton);
  const organize=document.createElement('button');organize.id='library-organize';organize.type='button';organize.className='subtle-button';organize.textContent='Organize';organize.setAttribute('aria-haspopup','menu');organize.setAttribute('aria-expanded','false');
  $('.library-collections').append(organize);
  organize.onclick=()=>attempt(async()=>{const r=organize.getBoundingClientRect();organize.setAttribute('aria-expanded','true');try{const choice=await OrbitContextMenu.open([{id:'collections',label:'Manage collections'},{id:'pins',label:'Pin collections'},{id:'select',label:selecting?'Finish selecting':state.section==='tools'?'Select tools':'Select games',type:'checkbox',checked:selecting}],{x:r.left,y:r.bottom+6},'Organize library');if(choice?.action==='collections')$('#manage-collections').click();else if(choice?.action==='pins')pinButton.click();else if(choice?.action==='select')selectButton.click();}finally{organize.setAttribute('aria-expanded','false');}});
  const bulk=document.createElement('section');bulk.id='library-bulk';bulk.hidden=true;bulk.setAttribute('aria-label','Selected entries');
  bulk.innerHTML='<span id="library-selection-count" role="status" aria-live="polite"></span><div class="library-bulk-actions"><button class="subtle-button" data-bulk="all">Select all results</button><button class="subtle-button" data-bulk="favorite">Favorite</button><button class="subtle-button" data-bulk="unfavorite">Unfavorite</button><button class="subtle-button" data-bulk="collections">Collections</button><button class="subtle-button" data-bulk="tags">Tags</button><button class="subtle-button" data-bulk="hide">Remove</button></div>';
  grid.before(bulk);
  const undoBar=document.createElement('div');undoBar.id='library-undo';undoBar.hidden=true;undoBar.innerHTML='<span role="status"></span><button class="subtle-button">Undo</button><button class="icon-button" aria-label="Dismiss undo">×</button>';grid.before(undoBar);
  function clear(){selection.clear();selecting=false;paintSelection();}
  selectButton.onclick=()=>{if(selecting)clear();else{selecting=true;paintSelection();}};
  function order(){return filtered().map(g=>g.id);}
  function paintSelection(){
    const enabled=active();bulk.hidden=!enabled||!selecting;selectButton.setAttribute('aria-pressed',String(selecting));selectButton.textContent=selecting?'Cancel selection':'Select';
    grid.classList.toggle('library-selecting',desktop()&&selecting);$('#library-selection-count').textContent=selection.ids.size+' selected';
    for(const button of grid.querySelectorAll('[data-game]')){
      if(!desktop()){button.classList.remove('library-selected');button.removeAttribute('aria-pressed');continue;}
      const selected=selection.ids.has(button.dataset.game);button.classList.toggle('library-selected',selected);button.closest('.game-row')?.classList.toggle('library-selected',selected);
      if(selecting)button.setAttribute('aria-pressed',String(selected));else button.removeAttribute('aria-pressed');
    }
    for(const button of bulk.querySelectorAll('[data-bulk]'))button.disabled=busy||(!selection.ids.size&&!['all','clear'].includes(button.dataset.bulk));
    const hide=bulk.querySelector('[data-bulk=hide]'),restore=state.view==='hidden',label=restore?'Restore':'Remove',icon=restore?'show':'hide';if(hide.dataset.orbitIcon!==icon){hide.dataset.orbitIcon=icon;hide.textContent=label;window.OrbitDesktop?.enhance(bulk);}
    undoBar.hidden=!enabled||!undo;undoBar.querySelectorAll('button').forEach(b=>b.disabled=busy);
  }
  grid.addEventListener('click',e=>{
    if(!active())return;if(busy||performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}const button=e.target.closest('[data-game]');if(!button||(!selecting&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey))return;
    e.preventDefault();e.stopImmediatePropagation();selecting=true;selection.choose(button.dataset.game,order(),{range:e.shiftKey,additive:e.ctrlKey||e.metaKey});paintSelection();
  },true);
  bulk.onclick=e=>{const b=e.target.closest('[data-bulk]');if(!b||busy)return;switch(b.dataset.bulk){
    case 'clear':clear();break;
    case 'all':for(const id of order())selection.ids.add(id);paintSelection();break;
    case 'favorite':runBulk('favorite',true);break;
    case 'unfavorite':runBulk('favorite',false);break;
    case 'hide':runBulk('hidden',state.view!=='hidden');break;
    case 'collections':editBulk('collections');break;
    case 'tags':editBulk('tags');break;
  }};
  function editBulk(kind){
    const ids=[...selection.ids];modal(kind==='tags'?'Edit tags':'Edit collections',`<form id="library-bulk-form"><p>${ids.length} selected</p><label>${kind==='tags'?'Tag<input name="value" maxlength="32" required placeholder="Co-op">':`Collection<select name="value" required>${options().filter(o=>o.value.startsWith('manual:')).map(o=>`<option value="${esc(decodeURIComponent(o.value.slice(7)))}">${esc(o.name)}</option>`).join('')}</select>`}</label><div class="settings-actions"><button class="primary-button" name="operation" value="add">Add to selected</button><button class="subtle-button" name="operation" value="remove">Remove from selected</button></div></form>`);
    const form=$('#library-bulk-form');if(kind==='collections'&&!form.elements.value.options.length){form.innerHTML='<section class="bulk-collection-empty"><span class="bulk-collection-icon" aria-hidden="true">'+OrbitControllerArt.icon('folder')+'</span><h3>No collections yet</h3><p>Create a collection, then add your selected entries.</p><div class="settings-actions"><button type="button" class="primary-button" data-bulk-manage-collections>Create a collection</button><button type="button" class="subtle-button" data-bulk-cancel>Cancel</button></div></section>';form.querySelector('[data-bulk-manage-collections]').onclick=()=>attempt(()=>OrbitCollectionUI.manage());form.querySelector('[data-bulk-cancel]').onclick=closeModal;return;}
    form.querySelector('.settings-actions').insertAdjacentHTML('beforeend','<button type="button" class="subtle-button" data-bulk-cancel>Cancel</button>');form.querySelector('[data-bulk-cancel]').onclick=closeModal;
    form.onsubmit=e=>{e.preventDefault();runBulk((kind==='tags'?'tag':'collection')+'-'+(e.submitter?.value==='remove'?'remove':'add'),new FormData(form).get('value'),ids,form);};
  }
  async function runBulk(action,value,ids=[...selection.ids],form=null){
    if(busy||!ids.length)return false;busy=true;paintSelection();form?.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      const result=await orbit.bulkLibrary({ids,action,value});if(form?.isConnected)closeModal();
      undo=result.token?{token:result.token,count:result.count}:undo;
      const message=action==='hidden'?(value?'Removed from library. Games stay installed.':'Restored to library.'):(result.count+' '+(result.count===1?'entry updated.':'entries updated.'));
      if(result.token)undoBar.querySelector('span').textContent=message;
      absorb(result.library);toast(result.count?message:'No changes needed.');return true;
    }catch(error){toast(error.message,true);return false;}finally{busy=false;form?.querySelectorAll('button').forEach(b=>b.disabled=false);paintSelection();}
  }
  undoBar.querySelector('button').onclick=async()=>{if(busy||!undo)return;busy=true;paintSelection();try{const result=await orbit.undoLibrary(undo.token);undo=null;absorb(result.library);toast('Changes undone.');}catch(error){toast(error.message,true);}finally{busy=false;paintSelection();}};
  undoBar.querySelector('.icon-button').onclick=()=>{undo=null;paintSelection();};
  document.addEventListener('keydown',e=>{
    if(!active()||document.querySelector('dialog[open],:popover-open')||(e.target.isContentEditable||e.target.closest('input,textarea,select')))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='a'&&(grid.contains(e.target)||bulk.contains(e.target)||e.target===selectButton)){
      e.preventDefault();e.stopImmediatePropagation();selecting=true;for(const id of order())selection.ids.add(id);paintSelection();
    }else if(e.key==='Escape'&&selecting){e.preventDefault();e.stopImmediatePropagation();clear();}
    else if(e.key===' '&&e.shiftKey&&e.target.matches('[data-game]')){e.preventDefault();selecting=true;selection.choose(e.target.dataset.game,order(),{range:true,additive:e.ctrlKey||e.metaKey});paintSelection();}
    else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&undo){e.preventDefault();undoBar.querySelector('button').click();}
  },true);
  /* Only request landscape artwork for nearby visible cards, two at a time. */
  const requested=new Set(),failed=new Map(),pending=[];let loading=0;
  function defer(id){failed.delete(id);failed.set(id,Date.now()+30000);if(failed.size>256)failed.delete(failed.keys().next().value);}
  function drain(){if(document.hidden||!active()||settings.layout!=='banners'||state.list)return;
    while(loading<2&&pending.length){const id=pending.shift(),game=state.games.find(g=>g.id===id);if(!game||game.hero){requested.delete(id);continue;}loading++;
      orbit.hero(id).then(src=>{if(!src){defer(id);return;}failed.delete(id);if(src){const current=state.games.find(g=>g.id===id);if(current)current.hero=src;const img=[...grid.querySelectorAll('[data-library-banner]')].find(i=>i.dataset.libraryBanner===id);if(img&&active()&&settings.layout==='banners'){img.src=src;delete img.dataset.src;img.hidden=false;}}}).catch(()=>defer(id)).finally(()=>{requested.delete(id);loading--;drain();});
    }
  }
  const artworkObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){artworkObserver.unobserve(entry.target);const id=entry.target.dataset.libraryBanner;if(!requested.has(id)&&(failed.get(id)||0)<=Date.now()){requested.add(id);pending.push(id);}}drain();},{rootMargin:'100px'});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)drain();});
  grid.addEventListener('load',e=>{const img=e.target;if(img.matches?.('[data-library-banner]')){img.dataset.shape=img.naturalWidth/img.naturalHeight<1.4?'fallback':'landscape';img.hidden=false;}},true);
  grid.addEventListener('error',e=>{const img=e.target;if(!img.matches?.('[data-library-banner]'))return;const fallback=state.games.find(g=>g.id===img.dataset.libraryBanner)?.cover;if(fallback&&img.getAttribute('src')!==fallback)queueMicrotask(()=>{if(img.isConnected){img.src=fallback;delete img.dataset.src;img.hidden=false;}});},true);
  const renderBefore=render;render=function(...args){
    if(!active())endDrag();syncView();const focused=grid.contains(document.activeElement)?document.activeElement.closest('[data-game]')?.dataset.game:null,result=renderBefore.apply(this,args);
    if(!active()){selection.clear();selecting=false;scope='';}else{
      const nextScope=state.section+'|'+state.view+'|'+state.source+'|'+state.search+'|'+$('#collection-filter').value;
      if(scope&&nextScope!==scope){selection.clear();selecting=false;}scope=nextScope;selection.reconcile(order());
    }
    paintDisplay();paintPins();paintSelection();for(const button of grid.querySelectorAll('[data-game]'))button.draggable=active();artworkObserver.disconnect();for(const id of pending.splice(0))requested.delete(id);
    if(active()&&!state.list&&settings.layout==='banners')for(const img of grid.querySelectorAll('[data-library-banner]'))artworkObserver.observe(img);
    if(focused&&!document.querySelector('dialog[open]'))[...grid.querySelectorAll('[data-game]')].find(b=>b.dataset.game===focused)?.focus({preventScroll:true});
    return result;
  };
  window.addEventListener('orbit:couch',()=>{clear();displayScope=null;endDrag();render();});
  window.orbitDesktopLibrary={
    image(g){if(!desktop()||settings.layout!=='banners')return null;return (g.hero||g.cover)?`<img data-src="${esc(g.hero||g.cover)}" data-library-banner="${esc(g.id)}" alt="" decoding="async">`:'';},
    setHidden:(ids,value)=>runBulk('hidden',value,ids),managePins,selection,settings,clear,setLayout:layout,captureSelection:()=>({selecting,ids:[...selection.ids],anchor:selection.anchor}),restoreSelection(value){selection.clear();if(value&&Array.isArray(value.ids)){for(const id of value.ids)if(typeof id==='string')selection.ids.add(id);selection.anchor=value.anchor;selection.reconcile(order());}selecting=Boolean(value?.selecting);paintSelection();},repaintPins:paintPins,renamePin(from,to){settings.pins=[...new Set(settings.pins.map(key=>key===from?to:key))];savedViews=model.renameViews(savedViews,from,to);if(displayScope?.endsWith('|'+from))displayScope=null;try{localStorage.setItem(viewsKey,JSON.stringify(savedViews));}catch{toast('Collection layout could not be saved.',true);}save();paintPins();},deactivate(){clear();endDrag();scope='';pins.hidden=true;undoBar.hidden=true;}
  };
  paintDisplay();paintPins();paintSelection();
})();
