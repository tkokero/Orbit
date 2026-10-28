/* Group secondary controls without adding polling, duplicate actions, or another settings mode. */
(()=>{
 const toolbar=document.querySelector('.toolbar-right'),filters=document.querySelector('.library-controls .filters');
 if(!toolbar||!filters)return;
 const menus=[];
 function closeMenus(){for(const {panel} of menus)if(panel.matches(':popover-open'))panel.hidePopover();}
 function menu(id,title,parent){
  const button=document.createElement('button');button.id=id+'-button';button.className='subtle-button control-menu-trigger';button.type='button';
  button.setAttribute('popovertarget',id);button.setAttribute('aria-controls',id);button.setAttribute('aria-expanded','false');
  button.innerHTML='<span>'+title+'</span><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const panel=document.createElement('div');panel.id=id;panel.className='control-menu';panel.setAttribute('popover','auto');panel.setAttribute('aria-label',title+' options');
  parent.append(button,panel);menus.push({button,panel});
  function position(){const rect=button.getBoundingClientRect(),width=Math.min(id==='library-view'?300:Math.max(272,window.OrbitPopups?.width(288,'toolbar')||288),innerWidth-24),below=innerHeight-rect.bottom-20,above=rect.top-20,flip=below<230&&above>below;panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(innerWidth-width-12,rect.right-width))+'px';panel.style.maxHeight=Math.max(80,Math.min(window.OrbitPopups?.height(360,'toolbar')||360,flip?above:below))+'px';panel.style.top=(flip?Math.max(12,rect.top-(panel.offsetHeight||Math.min(240,above))-8):rect.bottom+8)+'px';}
  panel.addEventListener('beforetoggle',event=>{if(event.newState==='open')position();});
  panel.addEventListener('toggle',event=>{button.setAttribute('aria-expanded',String(event.newState==='open'));if(event.newState==='open')position();});
  panel.addEventListener('click',event=>{if(event.target.closest('button'))closeMenus();},true);
  return {button,panel};
 }
 const more=menu('library-more','More',toolbar);
 more.button.setAttribute('aria-haspopup','menu');more.panel.setAttribute('role','menu');
 more.panel.innerHTML='<div data-more-actions></div><div class="toolbar-menu-divider" role="separator"></div><button type="button" class="subtle-button" data-simple-shortcuts>Keyboard shortcuts</button>';
 const moreActions=more.panel.querySelector('[data-more-actions]');
 for(const id of ['refresh','controller-view']){const control=document.getElementById(id);if(control)moreActions.append(control);}
 for(const [control,label,icon] of [[document.getElementById('refresh'),'Refresh','refresh'],[document.getElementById('controller-view'),'Controller mode','gamepad'],[more.panel.querySelector('[data-simple-shortcuts]'),'Keyboard shortcuts','keyboard']]){
  if(!control)continue;control.classList.add('toolbar-menu-item');control.setAttribute('role','menuitem');
  control.dataset.orbitIcon=icon;control.innerHTML='<span class="toolbar-menu-title">'+label+'</span>';
 }
 const menuItems=()=>[...more.panel.querySelectorAll('[role="menuitem"]')].filter(item=>!item.disabled&&!item.hidden);
 let keyboardEntry=false;
 more.button.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp','Enter',' '].includes(event.key)){keyboardEntry=event.key==='ArrowUp'?'last':'first';if(event.key.startsWith('Arrow')){event.preventDefault();if(!more.panel.matches(':popover-open'))more.panel.showPopover();else menuItems()[keyboardEntry==='last'?menuItems().length-1:0]?.focus();}}});
 more.button.addEventListener('pointerdown',()=>{keyboardEntry=false;});
 more.panel.addEventListener('toggle',event=>{if(event.newState==='open'&&keyboardEntry){const items=menuItems();items[keyboardEntry==='last'?items.length-1:0]?.focus();keyboardEntry=false;}});
 more.panel.addEventListener('keydown',event=>{
  const items=menuItems(),index=items.indexOf(document.activeElement);let next;
  if(event.key==='ArrowDown')next=(index+1)%items.length;else if(event.key==='ArrowUp')next=index<0?items.length-1:(index-1+items.length)%items.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=items.length-1;
  if(next!==undefined){event.preventDefault();event.stopPropagation();items[next]?.focus();}
  else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenus();more.button.focus();}
  else if(event.key==='Tab'){closeMenus();more.button.focus();}
 });
 more.panel.querySelector('[data-simple-shortcuts]').onclick=()=>window.orbitPolish?.shortcuts();
 const view=menu('library-view','View',filters);
 view.panel.innerHTML='<span class="control-menu-label">Layout</span><div data-view-layout></div>';
 const toggle=filters.querySelector('.view-toggle');if(toggle)view.panel.querySelector('[data-view-layout]').append(toggle);
 const collection=document.getElementById('collection-filter'),manage=document.getElementById('manage-collections'),collectionHost=document.createElement('div');
 collectionHost.className='library-collections';collectionHost.setAttribute('role','group');collectionHost.setAttribute('aria-label','Collections');

 function sync(){view.button.title='Library layout';collectionHost.classList.toggle('has-selection',Boolean(collection?.value));}
 if(collection){collectionHost.append(collection);collection.addEventListener('change',()=>{sync();closeMenus();});sync();}
 if(manage){manage.textContent='Manage';manage.setAttribute('aria-label','Manage collections');collectionHost.append(manage);}
 if(collection||manage)document.querySelector('.library-controls').before(collectionHost);
 document.getElementById('search').title='Search library · Ctrl+F to focus · Esc to clear';
 document.addEventListener('scroll',event=>{if(!menus.some(({panel})=>panel.contains(event.target)))closeMenus();},true);
 window.addEventListener('resize',closeMenus);
 function details(){
  const root=document.getElementById('detail-utilities');if(!root||root.closest('.simple-game-options'))return;
  const group=document.createElement('details');group.className='simple-game-options';
  const summary=document.createElement('summary');summary.innerHTML='<strong>Game options</strong>';
  root.before(group);group.append(summary,root);
  const files=document.createElement('div');files.className='settings-actions simple-file-actions';
  for(const id of ['detail-locate','detail-folder']){const control=document.getElementById(id);if(control)files.append(control);}
  if(files.childElementCount)root.prepend(files);
  const maintenance=document.getElementById('detail-kind')?.parentElement;if(maintenance)root.append(maintenance);
  const local=document.getElementById('timer-toggle')?.closest('.settings-section');if(local)root.append(local);
 }
 window.orbitSimple={closeMenus,details,sync};
})();
