/* Apply before first paint. Optional sections collapse without polling or spacer rows. */
(()=>{
 const model=OrbitDesktopMenuModel,customModel=OrbitDesktopCustomizationModel,root=document.documentElement;
 let choices=model.read({getItem:key=>localStorage.getItem(key)}),custom=customModel.read({getItem:key=>localStorage.getItem(key)});
 let customSignature=JSON.stringify(custom);
 const desktop=()=>!root.classList.contains('couch-mode');
 const shown=id=>!desktop()||choices[id]!==false;
 function paint(){
  root.dataset.menuHidden=model.sections.filter(s=>!choices[s.id]).map(s=>s.id).join(' ');
  root.dataset.desktopNavigation=custom.navigation;root.dataset.desktopWidth=custom.contentWidth;root.dataset.topbarTransparent=String(custom.transparentTopbar);window.OrbitDesktopBanner?.sync(custom.bannerLayout);root.dataset.bannerSize=custom.bannerSize;root.dataset.recentCount=String(custom.recentCount);
  for(const button of document.querySelectorAll('[data-menu-section]'))button.setAttribute('aria-checked',String(choices[button.dataset.menuSection]));
  const restore=document.querySelector('#desktop-menu-restore');if(restore)restore.disabled=model.sections.every(s=>choices[s.id]);
  window.OrbitDesktopCustomization?.paint();
 }
 function changed(){paint();window.OrbitDesktopCustomization?.arrange();window.orbitSimple?.configureToolbar(custom.quickActions);if(!shown('news'))window.orbitNews?.release();if(typeof render==='function')render();}
 function set(id,value){if(!model.sections.some(s=>s.id===id)||typeof value!=='boolean')return false;if(choices[id]===value)return true;try{choices=model.update(localStorage,choices,id,value);changed();return true;}catch{window.toast?.('Menu choices could not be saved.',true);return false;}}
 function reset(){try{choices=model.reset(localStorage);changed();return true;}catch{window.toast?.('Menu choices could not be saved.',true);return false;}}
 function mount(panel){
  if(!desktop()||!panel||panel.querySelector('#desktop-menu-settings'))return;
  const card=document.createElement('section');card.id='desktop-menu-settings';card.className='setting-card desktop-menu-settings';
  card.innerHTML='<div class="menu-customize-heading"><h3>Desktop menus</h3><button type="button" class="subtle-button menu-preview-toggle" data-menu-preview-toggle aria-controls="desktop-menu-preview" aria-expanded="false">Preview</button><button type="button" id="desktop-menu-restore" class="subtle-button">Show all</button></div><div class="menu-live-layout"><aside id="desktop-menu-preview" class="menu-layout-preview"><span class="menu-preview-label">Layout preview</span><div data-menu-preview role="img" aria-label="Desktop layout preview"></div></aside><div class="menu-live-controls">'+['Library','Sidebar'].map(group=>'<fieldset><legend>'+group+'</legend>'+model.sections.filter(s=>s.group===group).map(s=>'<div class="menu-visibility-row"><span id="menu-label-'+s.id+'">'+s.label+'</span><button type="button" class="setting-switch" role="switch" aria-labelledby="menu-label-'+s.id+'" data-menu-section="'+s.id+'" aria-checked="true"></button></div>').join('')+'</fieldset>').join('')+'</div></div>';
  card.querySelectorAll('[data-menu-section]').forEach(button=>button.onclick=()=>set(button.dataset.menuSection,!choices[button.dataset.menuSection]));
  card.querySelector('[data-menu-preview-toggle]').onclick=e=>{const expanded=card.classList.toggle('menu-preview-expanded');e.currentTarget.setAttribute('aria-expanded',String(expanded));};card.querySelector('#desktop-menu-restore').onclick=reset;window.OrbitDesktopCustomization?.mount(card);panel.prepend(card);paint();
 }
 function open(){showSettings();document.querySelector('#tab-appearance')?.click();document.querySelector('[data-appearance-tab=layout]')?.click();const card=document.querySelector('#desktop-menu-settings');card?.scrollIntoView({block:'start'});card?.querySelector('[data-menu-section]')?.focus({preventScroll:true});}
 function targetShown(selector){return !model.sections.some(s=>s.target===selector&&choices[s.id]===false);}
 function customize(patch){try{const next=customModel.preferences({...custom,...patch}),signature=JSON.stringify(next);if(signature===customSignature)return true;localStorage.setItem(customModel.key,signature);custom=next;customSignature=signature;changed();return true;}catch{window.toast?.('Menu choices could not be saved.',true);return false;}}
 function applyPreset(id){const layout=customModel.preset(custom,id);return layout?applyLayout(layout):false;}
 function applyLayout(layout){if(!layout||typeof layout!=='object')return false;layout=customModel.layout(layout);const next=customModel.preferences({...custom,...layout}),nextChoices=model.preferences(layout.visibility),signature=JSON.stringify(next),old=[localStorage.getItem(customModel.key),localStorage.getItem(model.key)];if(signature===customSignature&&JSON.stringify(choices)===JSON.stringify(nextChoices))return true;try{localStorage.setItem(customModel.key,signature);localStorage.setItem(model.key,JSON.stringify(nextChoices));}catch{try{for(const [i,key]of [customModel.key,model.key].entries())if(old[i]===null)localStorage.removeItem(key);else localStorage.setItem(key,old[i]);}catch{}window.toast?.('The layout could not be saved.',true);return false;}custom=next;customSignature=signature;choices=nextChoices;changed();return true;}
 window.OrbitDesktopMenus={shown,set,reset,mount,open,targetShown,customize,applyPreset,applyLayout,recents:items=>desktop()?customModel.recents(items,custom):[...items].filter(g=>g.lastPlayed).sort((a,b)=>b.lastPlayed-a.lastPlayed).slice(0,5),newsOptions:()=>desktop()?customModel.newsOptions(custom):undefined,get order(){return [...custom.order];},get custom(){return structuredClone(custom);},get choices(){return {...choices};}};paint();
})();
