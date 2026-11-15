/* Keep frequent actions visible. Original controls stay in their owning surface. */
(()=>{
 const jobs=new Map(),placements=new Map(),quiet=new WeakMap();let paused=false,frame=0,active;
 const desktop=()=>!paused&&!document.documentElement.classList.contains('couch-mode');
 const icon='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
 function close(restore=false){const job=active;if(!job)return;active=null;try{job.menu.hidePopover();}catch{}job.trigger.setAttribute('aria-expanded','false');if(restore&&job.trigger.isConnected)job.trigger.focus({preventScroll:true});}
 function group(host,label,buttons,{keep=[]}={}){
  const rows=[...new Set(buttons)].filter(b=>b?.isConnected&&!keep.includes(b)&&!b.matches('.action-overflow-trigger')&&!b.closest('[data-action-overflow]'));
  const existing=jobs.get(host);if(!rows.length||!existing&&rows.length<2)return;
  if(existing){for(const button of rows){const marker=document.createComment('action location'),role=button.getAttribute('role');button.before(marker);button.dataset.actionMenuItem='';button.setAttribute('role','menuitem');existing.locations.push({button,marker,role});existing.menu.append(button);}return;}
  const trigger=document.createElement('button');trigger.type='button';trigger.className='subtle-button action-overflow-trigger';trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');trigger.innerHTML='<span></span>'+icon;trigger.firstElementChild.textContent=label;
  const menu=document.createElement('div');menu.className='action-overflow-menu';menu.dataset.actionOverflow='';menu.setAttribute('popover','auto');menu.setAttribute('role','menu');menu.setAttribute('aria-label',label);
  const locations=rows.map(button=>{const marker=document.createComment('action location'),role=button.getAttribute('role');button.before(marker);button.dataset.actionMenuItem='';button.setAttribute('role','menuitem');return {button,marker,role};});
  menu.append(...rows);host.append(trigger,menu);const job={host,trigger,menu,locations};jobs.set(host,job);
  const items=()=>[...menu.querySelectorAll(':scope>button')].filter(b=>!b.disabled&&!b.hidden);
  const position=()=>{const rect=trigger.getBoundingClientRect(),width=Math.min(280,innerWidth-24);menu.style.width=width+'px';menu.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.right-width))+'px';const below=innerHeight-rect.bottom-16,above=rect.top-16,flip=below<200&&above>below;menu.style.maxHeight=Math.max(90,Math.min(400,flip?above:below))+'px';menu.style.top=(flip?Math.max(12,rect.top-menu.offsetHeight-6):rect.bottom+6)+'px';};
  const open=last=>{close();menu.showPopover();active=job;trigger.setAttribute('aria-expanded','true');position();const targets=items();targets[last?targets.length-1:0]?.focus({preventScroll:true});};
  job.open=open;trigger.onclick=()=>active===job?close(true):open(false);
  trigger.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open(e.key==='ArrowUp');}};
  menu.onkeydown=e=>{const targets=items(),index=targets.indexOf(document.activeElement);let next;if(e.key==='ArrowDown')next=(index+1)%targets.length;else if(e.key==='ArrowUp')next=(index+targets.length-1)%targets.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=targets.length-1;if(next!==undefined){e.preventDefault();e.stopPropagation();targets[next]?.focus();}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}else if(e.key==='Tab')close(true);};
  menu.addEventListener('click',e=>{if(e.target.closest('button'))queueMicrotask(()=>close(menu.contains(document.activeElement)));});
  menu.addEventListener('toggle',e=>{if(e.newState==='closed'){trigger.setAttribute('aria-expanded','false');if(active===job)active=null;}});
 }
 function signature(root){return JSON.stringify([...root.querySelectorAll('input,textarea,select')].map(e=>[e.name||e.id||e.value,e.type==='checkbox'?e.checked:e.value]));}
 function quietSave(root,button,status){
  if(!root||!button)return;if(quiet.has(root))return quiet.get(root);let baseline=signature(root),submitted,lastEdited;
  root.classList.add('quiet-save');button.classList.add('quiet-save-button');root.dataset.dirty='false';
  const paint=()=>{root.dataset.dirty=String(signature(root)!==baseline);if(root.dataset.dirty==='true'&&status?.textContent==='Saved')status.textContent='Unsaved changes';};const edited=event=>{lastEdited=event.target;paint();};root.addEventListener('input',edited);root.addEventListener('change',edited);
  root.addEventListener('submit',()=>submitted=signature(root),true);button.addEventListener('click',()=>submitted=signature(root),true);
  const controller={commit(value=signature(root)){const restore=document.activeElement===button;baseline=value;submitted=null;paint();if(restore&&root.dataset.dirty==='false'&&lastEdited?.isConnected)lastEdited.focus({preventScroll:true});}};quiet.set(root,controller);
  if(status)new MutationObserver(()=>{if(status.textContent.trim()==='Saved'&&submitted)controller.commit(submitted);}).observe(status,{childList:true,subtree:true,characterData:true});return controller;
 }
 function move(element,parent){
  if(!element||!parent||element.parentElement===parent)return;
  if(!placements.has(element)){const marker=document.createComment('control location');element.before(marker);placements.set(element,marker);}parent.append(element);
 }
 function collapse(host,label,nodes){
  if(!host)return;const existing=host.querySelector('[data-action-section="'+label+'"]');if(existing)return existing;const children=nodes.filter(Boolean);if(!children.length)return;
  const section=document.createElement('details');section.className='action-disclosure';section.dataset.actionSection=label;const summary=document.createElement('summary');summary.textContent=label;summary.dataset.orbitIcon=({Performance:'performance',Artwork:'appearance',Troubleshooting:'help'})[label];children[0].before(section);section.append(summary);for(const child of children)move(child,section);
  return section;
 }
 function details(){
  const root=document.querySelector('#detail-utilities');if(!root||!desktop())return;
  const named=labels=>[...root.querySelectorAll('button')].filter(b=>!b.closest('form,[data-action-overflow]')&&labels.includes(b.textContent.trim()));
  const files=root.querySelector('.simple-file-actions');if(files){for(const button of named(['Create desktop shortcut']))move(button,files);group(files,'Files & installation',[...files.querySelectorAll(':scope>button')]);}
  if(files){let bar=root.querySelector('.detail-quick-actions');if(!bar){bar=document.createElement('div');bar.className='settings-actions detail-quick-actions';bar.dataset.densityContainer='';root.prepend(bar);}for(const button of [root.querySelector('#launch-settings'),root.querySelector('#detail-return-game'),root.querySelector('#detail-close-game')])move(button,bar);move(files,bar);}
  const check=root.querySelector('#check-requirements'),system=root.querySelector('#system-result'),fps=root.querySelector('[data-fps-panel]');
  const performance=collapse(root,'Performance',[check,system,fps]);if(performance){if(performance.parentElement!==root)root.querySelector('.detail-quick-actions').after(performance);for(const button of named(['Graphics settings'])){move(button,performance);if(performance.children[1]!==button)performance.insertBefore(button,performance.children[1]||null);}}
  for(const [label,labels]of [['Artwork',['Customize artwork','Repair image']],['Troubleshooting',['Launch help','Save backups','Game detection']]]){
   const buttons=named(labels),section=root.querySelector('[data-action-section="'+label+'"]')||collapse(root,label,buttons);if(section){for(const button of buttons)move(button,section);if(section.parentElement!==root)root.append(section);}
  }
  const libraryButtons=named(['Add to wishlist','Move to Tools','Move to Games','Remove from library…','Hide game','Unhide game']);
  let library=root.querySelector('.density-library-actions');if(libraryButtons.length&&!library){library=document.createElement('div');library.className='settings-actions density-library-actions';library.dataset.densityContainer='';(root.querySelector('.collection-choices')||root).append(library);}if(library)for(const button of libraryButtons)move(button,library);
  // Activity already offers recaps; its game-scoped view also offers news.
  if(document.querySelector('#detail-activity'))for(const button of named(['Game news','Session recaps']))button.classList.add('density-redundant');
  for(const form of root.querySelectorAll('.personal-form'))quietSave(form,form.querySelector('button:not([type=button])'),form.querySelector('[data-note-status],[data-tag-status]'));
  const collections=root.querySelector('.collection-choices'),save=collections?.querySelector('#save-game-collections');
  if(collections&&save&&!quiet.has(collections)){
   const controller=quietSave(collections,save),original=save.onclick;save.onclick=async event=>{const submitted=signature(collections),selected=[...collections.querySelectorAll('input:checked')].map(e=>e.value).sort();await original?.call(save,event);const current=state.games.find(g=>g.id===collections.closest('.library-detail-tools')?.dataset.gameId)?.collections;if(current&&JSON.stringify(selected)===JSON.stringify([...current].sort()))controller.commit(submitted);};
  }
  for(const row of root.querySelectorAll('.settings-actions,.utility-actions'))row.classList.toggle('density-empty',[...row.childNodes].every(n=>n.nodeType===8||n.nodeType===3&&!n.textContent.trim()||n.nodeType===1&&n.matches('.density-redundant')));
 }
 function surfaces(){
  if(!desktop())return;
  for(const [host,job]of jobs)if(!host.isConnected){if(active===job)close();jobs.delete(host);}
  for(const [element]of placements)if(!element.isConnected)placements.delete(element);
  details();
  for(const row of document.querySelectorAll('.storage-row-actions'))group(row,'More',[...row.querySelectorAll(':scope>button')],{keep:[row.querySelector('[data-measure]')].filter(Boolean)});
  for(const footer of document.querySelectorAll('.installation-footer')){const buttons=[...footer.querySelectorAll('button')];footer.classList.toggle('utility-close-only',buttons.length===1&&buttons[0].matches('[data-install-close]')&&buttons[0].textContent.trim()==='Close');}
 }
 function schedule(records){if(!desktop()||frame)return;if(records&&!records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches('button,.settings-actions,.storage-row-actions,form')||n.querySelector('button')))))return;frame=requestAnimationFrame(()=>{frame=0;surfaces();});}
 new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});
 document.addEventListener('scroll',e=>{if(active&&!active.menu.contains(e.target))close();},true);window.addEventListener('resize',()=>close());document.addEventListener('close',()=>close(),true);
 function restore(){close();paused=true;for(const job of jobs.values()){for(const {button,marker,role}of job.locations){delete button.dataset.actionMenuItem;if(role===null)button.removeAttribute('role');else button.setAttribute('role',role);if(marker.isConnected)marker.replaceWith(button);}job.trigger.remove();job.menu.remove();}jobs.clear();for(const [element,marker]of [...placements].reverse())if(marker.isConnected)marker.replaceWith(element);placements.clear();for(const section of document.querySelectorAll('[data-action-section]'))section.replaceWith(...[...section.children].slice(1));document.querySelectorAll('[data-density-container]').forEach(e=>e.replaceWith(...e.childNodes));document.querySelectorAll('.density-redundant,.density-empty').forEach(e=>e.classList.remove('density-redundant','density-empty'));document.documentElement.classList.add('action-density-paused');}
 window.addEventListener('orbit:couch',event=>{if(event.detail)restore();else{paused=false;document.documentElement.classList.remove('action-density-paused');schedule();}});
 const show=window.OrbitInstall?.show;if(show)OrbitInstall.show=function(...args){const result=show.apply(this,args);surfaces();return result;};
 window.OrbitActionDensity={apply:surfaces,pause:restore,resume(){paused=false;document.documentElement.classList.remove('action-density-paused');surfaces();},reveal(element){const menu=element?.closest('[data-action-overflow]'),job=[...jobs.values()].find(j=>j.menu===menu);if(job)job.open(false);return Boolean(job);},close};surfaces();
})();
