/* Desktop filter feedback, collection editing, and return-to-library position. */
(()=>{
 const design=OrbitCollectionDesign,desktop=()=>!document.documentElement.classList.contains('couch-mode');
 const active=()=>desktop()&&!$('#library-panel').hidden&&['library','tools'].includes(window.orbitShell?.current()||'library');
 let styles=design.styles({}),collectionRevision=0,detailsOrigin=null;
 const scope=()=>[state.section,state.view,state.source,state.search,$('#collection-filter').value,JSON.stringify(orbitCare.getFilters())].join('|');
 function symbol(key){const s=styles[key]||{icon:'folder',color:'accent'};return `<span class="desktop-action-icon collection-symbol" aria-hidden="true" data-collection-color="${s.color}">${OrbitControllerArt.icon(s.icon)}</span>`;}
 function setStyles(value){styles=design.styles(value);window.orbitDesktopLibrary?.repaintPins();}
 async function loadStyles(){if(!orbit.collectionDetails)return;const revision=++collectionRevision;try{const data=await orbit.collectionDetails();if(revision===collectionRevision)setStyles(data.styles);}catch{}}
 const feedback=document.createElement('section');feedback.id='library-feedback';feedback.setAttribute('aria-label','Library results');feedback.innerHTML='<p id="library-result-count" role="status" aria-live="polite"></p><div id="library-filter-chips" aria-label="Active filters"></div>';$('#game-grid').before(feedback);
 const labels={controller:{any:'',yes:'Controller support',no:'No listed controller support',unknown:'Controller support unknown'},multiplayer:{any:'',yes:'Multiplayer',no:'No listed multiplayer',unknown:'Multiplayer unknown'},hours:{any:'',unplayed:'Never played',under10:'Under 10 hours',over10:'10 hours or more',unknown:'Playtime unknown'},size:{any:'',under10:'Under 10 GB','10to50':'10–50 GB',over50:'Over 50 GB',unknown:'Size unknown'}};
 function chips(){
  const out=[],collection=$('#collection-filter'),filters=orbitCare.getFilters();
  if(state.search)out.push(['search','Search: '+state.search]);
  if(state.view!=='all')out.push(['view',({installed:'Installed',uninstalled:'Not installed',favorites:'Favorites',hidden:'Hidden'})[state.view]||state.view]);
  if(state.source)out.push(['source','Platform: '+state.source]);
  if(collection.value)out.push(['collection','Collection: '+collection.selectedOptions[0]?.textContent]);
  for(const [key,value]of Object.entries(filters))if(value&&value!=='any')out.push([key,key==='tag'?'Tag: '+value:key==='genre'?'Genre: '+value:labels[key]?.[value]||value]);
  return out;
 }
 function clearFilters(){
  clearTimeout(searchTimer);state.view='all';state.source='';state.search='';state.page=0;$('#search').value='';
  orbitFeatures.resetCollection();orbitCare.setFilters({});render();
 }
 function removeFilter(key){
  if(key==='search'){clearTimeout(searchTimer);state.search='';$('#search').value='';}
  else if(key==='view')state.view='all';else if(key==='source')state.source='';else if(key==='collection')orbitFeatures.resetCollection();
  else{const filters=orbitCare.getFilters();filters[key]=['tag','genre'].includes(key)?'':'any';orbitCare.setFilters(filters);}
  state.page=0;render();
 }
 feedback.onclick=e=>{const button=e.target.closest('[data-remove-filter],[data-clear-filters]');if(!button)return;
  if(button.hasAttribute('data-clear-filters'))clearFilters();else removeFilter(button.dataset.removeFilter);
  ($('#library-filter-chips button')||$('#search')).focus({preventScroll:true});
 };
 const emptyRefresh=document.createElement('button');emptyRefresh.id='empty-refresh';emptyRefresh.className='subtle-button';emptyRefresh.textContent='Refresh library';emptyRefresh.onclick=()=>refresh();$('#empty').append(emptyRefresh);
 function paintFeedback(){
  feedback.hidden=!active();if(!active())return;
  const filters=chips(),count=filtered().length,total=sectionItems().length,kind=state.section==='tools'?'tools':'games';
  $('#library-result-count').textContent=filters.length&&state.view!=='hidden'?`${count} of ${total} ${kind}`:`${count} ${kind}`;
  const markup=filters.map(([key,label])=>`<button class="library-filter-chip" data-remove-filter="${key}" aria-label="Remove ${esc(label)} filter"><span>${esc(label)}</span><span aria-hidden="true">×</span></button>`).join('')+(filters.length?'<button class="subtle-button" data-clear-filters>Clear filters</button>':'');
  const host=$('#library-filter-chips');if(host.orbitMarkup!==markup){host.innerHTML=markup;host.orbitMarkup=markup;}
  if(!count){const emptyLibrary=!total&&!filters.length;$('#empty h3').textContent=emptyLibrary?'No '+kind+' yet':'No matching '+kind;$('#empty p').textContent=emptyLibrary?(state.section==='tools'?'Add a tool or refresh.':'Add a game or refresh.'):'Change your search or clear filters.';const button=$('#empty-action');button.textContent=emptyLibrary?(state.section==='tools'?'Add tool':'Add game'):'Clear filters';button.onclick=emptyLibrary?showAdd:clearFilters;emptyRefresh.hidden=!emptyLibrary;}
 }
 const manageBefore=$('#manage-collections').onclick;
 $('#manage-collections').onclick=()=>desktop()?attempt(manage):manageBefore?.();
 async function manage(){
  const data=await orbit.collectionDetails();setStyles(data.styles);orbitFeatures.updateCollections(data);
  const definitions=orbitFeatures.collectionState(),manual=definitions.collections.map(name=>({key:design.key(name),name,manual:true})),smart=definitions.smart.map(c=>({key:'smart:'+c.id,name:c.name,id:c.id}));
  const rows=items=>items.map(c=>`<div class="collection-edit-row">${symbol(c.key)}<div class="collection-edit-copy"><strong>${esc(c.name)}</strong>${c.manual?`<small>${state.games.filter(g=>!g.hidden&&g.collections?.includes(c.name)).length} entries</small>`:'<small>Smart collection</small>'}</div><div class="settings-actions"><button class="subtle-button" data-edit-collection="${esc(c.key)}">Edit</button>${c.manual?`<button class="subtle-button" data-delete-collection="${esc(c.name)}">Remove</button>`:''}</div></div>`).join('');
  modal('Collections',`<form id="new-collection" class="settings-actions"><input name="name" aria-label="New collection name" maxlength="40" placeholder="New collection" required><button class="primary-button">Create</button></form><div class="collection-editor-list">${rows(manual)||'<p>Create a collection above.</p>'}</div><h3>Smart collections</h3><div class="collection-editor-list">${rows(smart)}</div><button id="collection-rule-editor" class="subtle-button">Manage smart rules</button>`);
  $('#collection-rule-editor').onclick=()=>orbitExtras.smartEditor();
  $('#new-collection').onsubmit=e=>{e.preventDefault();const form=e.target,button=e.submitter;attempt(async()=>{button.disabled=true;try{const name=String(new FormData(form).get('name')).trim();if(definitions.collections.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('A collection with that name already exists.');const names=await orbit.saveCollection({name});orbitFeatures.updateCollections({collections:names});render();await manage();}finally{if(button.isConnected)button.disabled=false;}});};
  $('#modal-body').onclick=e=>{const b=e.target.closest('[data-edit-collection],[data-delete-collection]');if(!b)return;
   if(b.dataset.editCollection)attempt(()=>editCollection(b.dataset.editCollection));else confirmRemove(b.dataset.deleteCollection);
  };
 }
 function confirmRemove(name){modal('Remove collection',`<p>Remove <strong>${esc(name)}</strong>? Its entries stay in your library.</p><div class="settings-actions"><button id="collection-confirm-remove" class="primary-button">Remove collection</button><button id="collection-remove-cancel" class="subtle-button">Cancel</button></div>`);$('#collection-remove-cancel').onclick=()=>attempt(manage);$('#collection-confirm-remove').onclick=()=>attempt(async()=>{const button=$('#collection-confirm-remove');button.disabled=true;try{orbitFeatures.updateCollections({collections:await orbit.saveCollection({name,remove:true})});for(const g of state.games)g.collections=g.collections?.filter(n=>n!==name);render();await manage();}finally{if(button.isConnected)button.disabled=false;}});}
 async function editCollection(key){
  const data=orbitFeatures.collectionState(),manual=key.startsWith('manual:'),definition=manual?{name:decodeURIComponent(key.slice(7))}:data.smart.find(c=>'smart:'+c.id===key);if(!definition)throw Error('This collection is no longer available.');
  const current=styles[key]||{icon:'folder',color:'accent'};
  modal('Edit collection',`<form id="collection-edit-form"><label>Name<input name="name" maxlength="40" required value="${esc(definition.name)}" ${manual?'':'readonly'}></label><fieldset><legend>Icon</legend><div class="collection-icon-options">${Object.entries(design.icons).map(([icon,name])=>`<label><input type="radio" name="icon" value="${icon}" ${current.icon===icon?'checked':''}><span aria-hidden="true">${OrbitControllerArt.icon(icon)}</span><span>${name}</span></label>`).join('')}</div></fieldset><fieldset><legend>Color</legend><div class="collection-color-options">${Object.entries(design.colors).map(([color,name])=>`<label><input type="radio" name="color" value="${color}" ${current.color===color?'checked':''}><i data-collection-color="${color}" aria-hidden="true"></i><span>${name}</span></label>`).join('')}</div></fieldset><div class="settings-actions"><button class="primary-button">Save collection</button><button type="button" id="collection-edit-cancel" class="subtle-button">Cancel</button></div></form>`);
  $('#collection-edit-cancel').onclick=()=>attempt(manage);
  $('#collection-edit-form').onsubmit=e=>{e.preventDefault();const form=e.target,button=e.submitter,fields=new FormData(form);attempt(async()=>{button.disabled=true;try{
   const result=await orbit.editCollection({key,...(manual?{renameTo:fields.get('name')}:{}),style:{icon:fields.get('icon'),color:fields.get('color')}});
   setStyles(result.styles);orbitFeatures.updateCollections(result);absorb(result.library);await manage();toast('Collection saved.');
  }finally{if(button.isConnected)button.disabled=false;}});};
 }
 const beforeDetails=showDetails;showDetails=async function(id,...args){
  if(active()&&!detailsOrigin){const cards=[...$('#game-grid').querySelectorAll('[data-game]')],target=document.activeElement;detailsOrigin={scope:scope(),scroll:$('#main-scroll').scrollTop,id,index:Math.max(0,cards.findIndex(b=>b.dataset.game===id)),target};}
  try{return await beforeDetails.call(this,id,...args);}finally{if(!$('#modal').open)detailsOrigin=null;}
 };
 $('#modal').addEventListener('close',()=>{const origin=detailsOrigin;detailsOrigin=null;if(!origin)return;
  requestAnimationFrame(()=>{if(!active()||scope()!==origin.scope||document.querySelector('dialog[open]'))return;
   $('#main-scroll').scrollTop=origin.scroll;
   if(document.hidden)return;
   const cards=[...$('#game-grid').querySelectorAll('[data-game]')],target=origin.target?.isConnected&&origin.target!==document.body?origin.target:cards.find(b=>b.dataset.game===origin.id)||cards[Math.min(origin.index,cards.length-1)]||$('#search');target?.focus({preventScroll:true});
  });
 });
 const beforeRender=render;render=function(...args){
  const keep=active(),previous=keep?scope()+'|'+state.page:null,scroll=$('#main-scroll').scrollTop,result=beforeRender.apply(this,args);
  paintFeedback();if(keep&&active()&&previous===scope()+'|'+state.page)$('#main-scroll').scrollTop=scroll;return result;
 };
 document.addEventListener('orbit:collections',()=>{paintFeedback();loadStyles();});
 window.OrbitCollectionUI={symbol,setStyles,manage,editCollection,clearFilters,removeFilter,paintFeedback};
 loadStyles();paintFeedback();
})();
