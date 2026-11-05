/* Optional early features share a clear route without changing saved choices. */
(()=>{
 const items=()=>[
  {id:'graphics',title:'Graphics settings',note:'Edit supported game configs with a backup and Restore.',open:()=>OrbitGameOptimization.search()},
  {id:'vr',title:'VR overlay',note:'Panels and wrist tools for SteamVR. Headset support is still being tested.',open:()=>OrbitDesktopTools.runtime()},
  {id:'steam',title:'Steam connection',note:'Optional local connection for download controls. Setup explains the Steam restart.',open:async()=>{closeModal();await OrbitSteam.panel();document.querySelector('.steam-controls-dialog[open] [data-steam-tab="connection"]')?.click();}},
  {id:'discord',title:'Discord friends',note:'Read-only friends access. Connecting requires your approval.',open:()=>{closeModal();document.querySelector('[data-section="friends"]')?.click();}},
  ...(window.orbitClipsEnabled&&window.OrbitClips?[{id:'clips',title:'Clips prototype',note:'Preview capture tools in this development build.',open:()=>{closeModal();OrbitClips.open();}}]:[])
 ];
 function mount(){
  const body=document.querySelector('#modal-body'),tabs=body?.querySelector('.settings-tabs');if(!tabs||body.querySelector('#panel-experiments'))return;
  const tab=document.createElement('button');tab.id='tab-experiments';tab.type='button';tab.role='tab';tab.dataset.settingsTab='experiments';tab.setAttribute('aria-controls','panel-experiments');tab.setAttribute('aria-selected','false');tab.tabIndex=-1;tab.textContent='Experiments';tabs.append(tab);
  const panel=document.createElement('section');panel.id='panel-experiments';panel.role='tabpanel';panel.setAttribute('aria-labelledby',tab.id);panel.hidden=true;
  panel.innerHTML='<p class="experiments-note">Experimental features may change. Opening one does not enable it.</p>'+items().map(item=>'<section class="setting-card setting-row experiment-row"><div><h3>'+item.title+'</h3><p>'+item.note+'</p></div><button type="button" class="subtle-button experiment-open" data-experiment="'+item.id+'" aria-label="Open '+item.title+'">Open</button></section>').join('');
  body.append(panel);for(const button of panel.querySelectorAll('[data-experiment]'))button.onclick=()=>attempt(()=>items().find(item=>item.id===button.dataset.experiment).open());
 }
 function open(){showSettings();document.querySelector('#tab-experiments')?.click();}
 const more=document.querySelector('#library-more [data-more-actions]');if(more){const button=document.createElement('button');button.id='experiments-open';button.type='button';button.className='subtle-button toolbar-menu-item';button.role='menuitem';button.dataset.orbitIcon='experiment';button.innerHTML='<span class="toolbar-menu-title">Experiments</span>';button.onclick=open;more.append(button);}
 window.OrbitExperiments={mount,open};
})();
