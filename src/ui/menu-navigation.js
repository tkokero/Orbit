/* Desktop navigation checkpoints live only for this window. No form values or credentials. */
(()=>{
 const desktop=()=>!document.documentElement.classList.contains('couch-mode'),dialog=document.querySelector('#modal');
 let lastSettings=null;
 function remember(){
  if(!desktop()||!dialog.classList.contains('settings-dialog')||!dialog.querySelector('.settings-tabs'))return;
  lastSettings={tab:dialog.querySelector('[data-settings-tab][aria-selected=true]')?.dataset.settingsTab||'general',appearance:dialog.querySelector('[data-appearance-tab][aria-selected=true]')?.dataset.appearanceTab||'theme',scroll:[...dialog.querySelectorAll('#modal-body>[role=tabpanel]')].map(n=>[n.id,n.scrollTop])};
 }
 function restore(){
  if(!desktop()||!lastSettings)return;
  dialog.querySelector('[data-settings-tab="'+CSS.escape(lastSettings.tab)+'"]')?.click();
  dialog.querySelector('[data-appearance-tab="'+CSS.escape(lastSettings.appearance)+'"]')?.click();
  for(const [id,top]of lastSettings.scroll){const panel=dialog.querySelector('#'+CSS.escape(id));if(panel)panel.scrollTop=top;}
  dialog.querySelector('[data-settings-tab][aria-selected=true]')?.focus({preventScroll:true});
 }
 function clearBack(){dialog.querySelector('#menu-settings-back')?.remove();}
 const originalModal=modal;
 modal=function(title,...args){
  const fromSettings=desktop()&&dialog.open&&dialog.classList.contains('settings-dialog')&&title==='Keyboard shortcuts';
  if(dialog.open)remember();clearBack();const result=originalModal.call(this,title,...args);
  if(fromSettings){const back=document.createElement('button');back.type='button';back.id='menu-settings-back';back.className='icon-button';back.setAttribute('aria-label','Back to Settings');back.title='Back to Settings';back.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';dialog.querySelector('.modal-header').prepend(back);back.onclick=()=>{showSettings();const card=dialog.querySelector('[data-desktop-shortcuts]');window.OrbitSettingsNav?.focus(card);};}
  return result;
 };
 const originalSettings=showSettings;
 showSettings=function(...args){if(dialog.open)remember();const result=originalSettings.apply(this,args);restore();return result;};
 dialog.addEventListener('beforetoggle',event=>{if(event.newState==='closed'){remember();clearBack();}});
 dialog.addEventListener('keydown',event=>{if(!desktop()||!dialog.classList.contains('settings-dialog')||!event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.key.toLowerCase()!=='f')return;const search=dialog.querySelector('.settings-search input');if(search){event.preventDefault();event.stopPropagation();search.focus({preventScroll:true});search.select();}});
 const more=document.querySelector('#library-more'),trigger=document.querySelector('#library-more-button');
 if(more){const settings=document.createElement('button');settings.type='button';settings.id='menu-open-settings';settings.className='subtle-button toolbar-menu-item';settings.setAttribute('role','menuitem');settings.dataset.orbitIcon='tune';settings.innerHTML='<span class="toolbar-menu-title">Settings</span>';const shortcuts=more.querySelector('[data-simple-shortcuts]'),customize=more.querySelector('#customize-desktop-menus');if(customize)more.insertBefore(customize,shortcuts);more.insertBefore(settings,customize||shortcuts);settings.onclick=()=>{trigger?.focus({preventScroll:true});document.querySelector('#settings-button').click();};const visibility=()=>settings.hidden=!desktop()||Boolean(document.querySelector('#settings-button')?.checkVisibility({visibilityProperty:true}));more.addEventListener('beforetoggle',visibility);window.addEventListener('orbit:couch',visibility);visibility();}
 window.OrbitMenuNavigation={remember};
})();
