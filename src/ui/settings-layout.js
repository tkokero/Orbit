/* Group related Desktop settings after all feature controls have mounted. */
(()=>{
 function select(panel,key){
  const current=panel.querySelector('[data-appearance-section]:not([hidden])');if(current)current.dataset.scroll=String(panel.scrollTop);
  panel.querySelectorAll('[data-appearance-section]').forEach(section=>section.hidden=section.dataset.appearanceSection!==key);
  panel.querySelectorAll('[data-appearance-tab]').forEach(button=>{const active=button.dataset.appearanceTab===key;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
  panel.scrollTop=Number(panel.querySelector('[data-appearance-section="'+key+'"]')?.dataset.scroll)||0;
 }
 function reveal(node){const section=node.closest('[data-appearance-section]'),panel=node.closest('#panel-appearance');if(section&&panel)select(panel,section.dataset.appearanceSection);}
 function addSection(panel,nav,key,label){
  const section=document.createElement('section');section.id='appearance-'+key;section.dataset.appearanceSection=key;section.dataset.appearanceLabel=label;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby','appearance-tab-'+key);section.hidden=key!=='theme';
  const button=document.createElement('button');button.id='appearance-tab-'+key;button.type='button';button.dataset.appearanceTab=key;button.textContent=label;button.setAttribute('role','tab');button.setAttribute('aria-controls',section.id);button.setAttribute('aria-selected',String(key==='theme'));button.tabIndex=key==='theme'?0:-1;button.onclick=()=>select(panel,key);
  button.onkeydown=event=>{const buttons=[...nav.querySelectorAll('[data-appearance-tab]')],index=buttons.indexOf(button);let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();event.stopPropagation();select(panel,buttons[next].dataset.appearanceTab);buttons[next].focus();};nav.append(button);return section;
 }
 function appearance(panel,dialog){
  let nav=panel.querySelector('.appearance-nav');
  if(!nav){
   nav=document.createElement('div');nav.className='appearance-nav';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Appearance sections');
   const groups={};for(const [key,label]of [['theme','Theme'],['startup','Startup'],['layout','Layout']])groups[key]=addSection(panel,nav,key,label);
   const palette=document.createElement('section');palette.className='setting-card appearance-theme-palette';palette.innerHTML='<h3>Color theme</h3>';for(const selector of ['.theme-saved-actions','#theme-picker']){const node=panel.querySelector(selector);if(node)palette.append(node);}groups.theme.append(palette);
   for(const selector of ['#app-icon-settings','#theme-editor']){const node=panel.querySelector(selector);if(node)groups.theme.append(node);}
   const intro=dialog.querySelector('#intro-toggle')?.closest('.setting-card');if(intro)groups.startup.append(intro);
   const startup=panel.querySelector('.startup-settings');if(startup)groups.startup.append(startup);
   for(const selector of ['.desktop-banner-setting','#motion-toggle','#accessibility-form','[data-popup-sizing]','[data-popup-positions]']){const node=panel.querySelector(selector),card=node?.closest('.setting-card')||node;if(card)groups.layout.append(card);}
   const memory=panel.querySelector('[data-setting="lowMemoryRendering"]')?.closest('.setting-card');if(memory)dialog.querySelector('#panel-general')?.append(memory);
   const leftovers=[...panel.children];panel.append(nav,...Object.values(groups));
   if(leftovers.length){const misc=addSection(panel,nav,'misc','Miscellaneous');misc.append(...leftovers);panel.append(misc);}
  }else{
   const extras=[...panel.children].filter(node=>node!==nav&&!node.matches('[data-appearance-section]'));
   if(extras.length){let misc=panel.querySelector('[data-appearance-section=misc]');if(!misc){misc=addSection(panel,nav,'misc','Miscellaneous');panel.append(misc);}misc.append(...extras);}
  }
 }
 function general(dialog){
  const panel=dialog.querySelector('#panel-general');if(!panel)return;
  const updates=dialog.querySelector('#check-updates')?.closest('.setting-card'),manage=dialog.querySelector('#panel-manage');
  if(updates&&manage){let group=manage.querySelector('#settings-updates-group');if(!group){group=document.createElement('section');group.id='settings-updates-group';group.setAttribute('aria-label','Updates');manage.prepend(group);group.append(updates);}for(const key of ['autoUpdates','restartForUpdates']){const card=panel.querySelector('[data-setting="'+key+'"]')?.closest('.setting-card');if(card)group.append(card);}}
  const setup=panel.querySelector('#reopen-setup')?.closest('.setting-card'),about=dialog.querySelector('#panel-about');if(setup&&about)about.prepend(setup);
  const recovery=panel.querySelector('#recovery-open-data')?.closest('.setting-card');
  const cards=[...panel.querySelectorAll('.setting-card')].filter(card=>card!==recovery&&!card.parentElement.closest('.setting-card'));
  const groups=[['Startup & window',['[data-setting=launchAtLogin]','[data-setting=startMinimized]','[data-setting=closeToTray]','#remember-toggle']],['Library & playing',['[data-setting=autoDiscover]','[data-setting=minimizeOnPlay]','[data-setting=confirmGameClose]','[data-setting=confirmForceClose]','[data-setting=downloadNotifications]']],['Connections & friends',['[data-setting=offlineMode]','[data-setting=autoLoadFriends]','[data-setting=refreshFriends]']],['Controls',['.controller-input-settings','[data-desktop-shortcuts]']],['Performance & system',['[data-setting=lowMemoryRendering]','#scan-computer']]];
  const used=new Set(),sections=[];
  function group(title,items){if(!items.length)return;const section=document.createElement('section');section.className='settings-group';const heading=document.createElement('h2');heading.textContent=title;const grid=document.createElement('div');grid.className='settings-group-grid';grid.append(...items);section.append(heading,grid);sections.push(section);}
  for(const [title,selectors]of groups){const selected=cards.filter(card=>!used.has(card)&&selectors.some(selector=>card.matches(selector)||card.querySelector(selector)));selected.forEach(card=>used.add(card));group(title,selected);}
  group('Miscellaneous',cards.filter(card=>!used.has(card)));
  panel.replaceChildren(...(recovery?[recovery]:[]),...sections);
 }
 function fold(card,key){if(!card||card.querySelector(':scope > details.settings-fold'))return;const heading=card.querySelector('h3');if(!heading)return;const details=document.createElement('details');details.className='settings-fold';details.dataset.settingsFold=key;const summary=document.createElement('summary');summary.append(heading);const arrow=document.createElement('span');arrow.className='settings-fold-chevron';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"/></svg>';summary.append(arrow);details.append(summary);const body=document.createElement('div');body.className='settings-fold-body';body.append(...card.childNodes);details.append(body);card.append(details);card.classList.add('settings-fold-card');}
 function privacy(dialog){const panel=dialog.querySelector('#panel-privacy');if(!panel||panel.querySelector('.settings-group'))return;const cards=[...panel.children].filter(n=>n.classList.contains('setting-card')),used=new Set();for(const [title,selectors]of [['Activity',['recordHistory','launchStreaks','localPlaytime','sessionRecaps']],['Accounts',['rememberAccounts','autoConnectAccounts']]]){const items=cards.filter(card=>selectors.some(key=>card.querySelector('[data-setting="'+key+'"]')));if(!items.length)continue;const group=document.createElement('section');group.className='settings-group';const heading=document.createElement('h2');heading.textContent=title;const rows=document.createElement('div');rows.className='settings-group-grid';rows.append(...items);items.forEach(card=>used.add(card));group.append(heading,rows);panel.append(group);}const discord=panel.querySelector('.discord-settings');if(discord)panel.append(discord);const local=panel.querySelector('#privacy-summary')?.closest('.setting-card');if(local){fold(local,'local-data');panel.append(local);}for(const card of cards)if(!used.has(card)&&card!==discord&&card!==local)panel.append(card);}
 function simplify(dialog){
  const controller=dialog.querySelector('.controller-input-settings')?.closest('.setting-card');fold(controller,'controller');
  const computer=dialog.querySelector('#computer-specs')?.closest('.setting-card');fold(computer,'computer');
  const library=dialog.querySelector('#settings-installer')?.closest('.setting-card');fold(library,'installers');
  privacy(dialog);
 }
 function disclosures(dialog){
  for(const details of dialog.querySelectorAll('details')){const summary=details.querySelector(':scope>summary');if(!summary)continue;details.classList.add('settings-disclosure');if(summary.querySelector(':scope>.settings-fold-chevron'))continue;const arrow=document.createElement('span');arrow.className='settings-fold-chevron';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 9 6 6 6-6"/></svg>';summary.append(arrow);}
 }
 function mount(){const dialog=document.querySelector('#modal'),panel=dialog.querySelector('#panel-appearance');if(document.documentElement.classList.contains('couch-mode')||!panel)return;appearance(panel,dialog);general(dialog);simplify(dialog);disclosures(dialog);dialog.querySelector('#shortcut-guide')?.remove();}
 const settings=showSettings;showSettings=function(...args){const result=settings.apply(this,args);mount();return result;};
 window.OrbitSettingsLayout={mount,reveal};
})();
