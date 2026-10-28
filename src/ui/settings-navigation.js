(()=>{
 function mount(){
  const root=document.querySelector('#modal-body'),general=root.querySelector('#panel-general');if(!general)return;
  const startupNote=general.querySelector('#startup-status'),startupCard=general.querySelector('[data-setting="launchAtLogin"]')?.closest('.setting-card');if(startupNote&&startupCard)startupCard.querySelector('div')?.append(startupNote);
  const groups=[['Startup & window',['launchAtLogin','startMinimized','closeToTray','intro-toggle','remember-toggle','reopen-setup']],['Library & playing',['autoDiscover','minimizeOnPlay','confirmGameClose','confirmForceClose','downloadNotifications']],['Updates',['autoUpdates','restartForUpdates','check-updates']],['Connections & friends',['offlineMode','autoLoadFriends','refreshFriends']],['Performance & system',['lowMemoryRendering','scan-computer']]];
  const recovery=general.querySelector('#recovery-open-data')?.closest('.setting-card');
  const cards=[...general.children].filter(card=>card!==recovery);
  for(const [title,keys]of groups){const selected=cards.filter(card=>keys.some(key=>card.querySelector('[data-setting="'+key+'"],#'+key)));if(!selected.length)continue;const section=document.createElement('section');section.className='settings-group';const heading=document.createElement('h2');heading.textContent=title;section.append(heading);const grid=document.createElement('div');grid.className='settings-group-grid';section.append(grid);selected.forEach(card=>grid.append(card));general.append(section);}
  const remaining=cards.filter(card=>card.parentElement===general);if(remaining.length){const section=document.createElement('section');section.className='settings-group';const heading=document.createElement('h2');heading.textContent='Preferences';section.append(heading,...remaining);general.append(section);}
  if(recovery)general.prepend(recovery);
  const bar=document.createElement('div');bar.className='settings-search';const input=document.createElement('input');input.type='search';input.placeholder='Search all settings…';input.setAttribute('aria-label','Search all settings');input.setAttribute('aria-controls','settings-search-results');bar.append(input);root.prepend(bar);
  const results=document.createElement('div');results.id='settings-search-results';results.className='settings-search-results';results.hidden=true;root.append(results);
  const count=document.createElement('p');count.className='small-note';count.setAttribute('role','status');
  function search(){const query=input.value.trim().toLocaleLowerCase();root.classList.toggle('settings-searching',Boolean(query));results.hidden=!query;results.replaceChildren(count);if(!query)return;
   let found=0;
   for(const panel of root.querySelectorAll('[role=tabpanel]')){const category=document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent.trim()||'Settings';
    for(const card of panel.querySelectorAll('.setting-card,.theme-editor')){if(card.querySelector('.setting-card'))continue;const heading=card.querySelector('h3,h2,summary');if(!heading)continue;const title=(heading.childNodes[0]?.textContent||heading.textContent).trim();const text=card.textContent.toLocaleLowerCase();if(!query.split(/\s+/).every(word=>text.includes(word)))continue;
     found++;const button=document.createElement('button');button.type='button';button.className='settings-search-result';const name=document.createElement('strong');name.textContent=title;const context=document.createElement('span');context.textContent=category;button.append(name,context);button.onclick=()=>{input.value='';search();document.getElementById(panel.getAttribute('aria-labelledby'))?.click();for(let parent=card.parentElement;parent&&parent!==panel;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;card.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});heading.tabIndex=-1;heading.focus({preventScroll:true});};results.append(button);
    }
   }
   count.textContent=found?found+' matching '+(found===1?'setting':'settings'):'No settings found. Try another search.';
  }
  input.oninput=search;input.onkeydown=event=>{if(event.key==='Escape'&&input.value){event.preventDefault();event.stopPropagation();input.value='';search();}else if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('button')?.focus();}};
  root.querySelector('.settings-tabs').addEventListener('click',()=>{if(input.value){input.value='';search();}});
  root.querySelector('.settings-tabs')?.setAttribute('aria-orientation','vertical');
 }
 window.OrbitSettingsNav={mount};
})();
