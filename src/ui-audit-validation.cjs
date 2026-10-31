/* Opt-in hidden audit. All pages use synthetic games and isolated preferences. */
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async({window,target})=>{
 const run=s=>window.webContents.executeJavaScript(s),wait=ms=>new Promise(r=>setTimeout(r,ms)),checks=[],errors=[];
 const check=(name,passed,details)=>checks.push({name,passed:!!passed,...(details?{details}:{})});
 await fs.mkdir(target,{recursive:true});
 await run(`(async()=>{await orbitBoot.done;await orbit.saveSetup({step:0,status:'complete',schemaVersion:2});document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitFeatures.setCouch(false);motionEnabled=false;document.documentElement.classList.add('motion-off');OrbitPopups.resetAll();})()`);
 const inspect=`(()=>{
  const dialogs=[...document.querySelectorAll('dialog[open]')],d=dialogs.at(-1),menu=document.querySelector('.orbit-context-menu'),root=menu||d||document.querySelector('main');
  const visible=n=>{if(!n.getClientRects().length||n.closest('[hidden]')||getComputedStyle(n).visibility==='hidden')return false;const r=n.getBoundingClientRect();if(r.bottom<=0||r.top>=innerHeight||r.right<=0||r.left>=innerWidth)return false;for(let p=n.parentElement;p&&p!==root;p=p.parentElement){const s=getComputedStyle(p),a=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowY)&&(r.bottom<=a.top||r.top>=a.bottom))return false;}return true;};
  const overlaps=[];
  for(const group of root.querySelectorAll('.settings-actions,.detail-actions,.toolbar-right,.library-controls,.launch-mode-footer,.installation-footer,.theme-actions,.settings-tabs,.appearance-nav')){
   const nodes=[...group.querySelectorAll('button,input,select,textarea')].filter(visible);
   for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){if(nodes[a].contains(nodes[b])||nodes[b].contains(nodes[a]))continue;const x=nodes[a].getBoundingClientRect(),y=nodes[b].getBoundingClientRect();if(Math.min(x.right,y.right)-Math.max(x.left,y.left)>2&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>2)overlaps.push([nodes[a].id||nodes[a].textContent.trim(),nodes[b].id||nodes[b].textContent.trim()]);}
  }
  const r=(menu||d)?.getBoundingClientRect(),body=d?.querySelector('#modal-body,.installation-body,.desktop-command-body'),panel=d?.querySelector('#modal-body>[role=tabpanel]:not([hidden])');
  return {dialog:d?.id,fit:!r||(r.left>=7&&r.top>=7&&r.right<=innerWidth-7&&r.bottom<=innerHeight-7),horizontalOverflow:!!body&&body.scrollWidth>body.clientWidth+2||!!panel&&panel.scrollWidth>panel.clientWidth+2,overlaps,sidebarClipping:[...document.querySelectorAll('.sidebar .nav-item')].filter(visible).filter(b=>b.scrollWidth>b.clientWidth+2).map(b=>b.textContent.trim()),panelHeight:panel?.clientHeight,buttons:[...root.querySelectorAll('button')].filter(visible).length,viewport:{width:innerWidth,height:innerHeight}};
 })()`;
 async function surface(name,statement,screenshot=false){try{await run(`document.querySelectorAll('dialog[open]').forEach(d=>d.close());OrbitContextMenu.close();`);await run(statement);await wait(90);const result=await run(inspect);check(name+' fits without horizontal overflow or overlapping action targets',result.fit&&!result.horizontalOverflow&&!result.overlaps.length&&!result.sidebarClipping.length,result);if(screenshot)await fs.writeFile(path.join(target,name+'.png'),(await window.webContents.capturePage()).toPNG());}catch(e){errors.push({name,error:e.message});check(name,false,{error:e.message});}}
 for(const mode of [{id:'wide',width:1440,height:960,zoom:1},{id:'narrow-125',width:800,height:700,zoom:1.25}]){
  window.setMinimumSize(640,420);window.setSize(mode.width,mode.height);window.webContents.setZoomFactor(mode.zoom);await wait(60);
  for(const theme of ['orbit','rose','cloud']){
   await run(`chooseTheme('${theme}');OrbitPopups.resetAll()`);const prefix=mode.id+'-'+theme;
   for(const route of ['library','store','downloads','friends','tools'])await surface(prefix+'-'+route,`orbitShell.activate('${route}')`,theme==='orbit');
   for(const tab of ['general','libraries','appearance','manage','privacy','about'])await surface(prefix+'-settings-'+tab,`showSettings();document.querySelector('#tab-${tab}').click()`,theme==='orbit');
   for(const tab of ['startup','layout'])await surface(prefix+'-appearance-'+tab,`showSettings();document.querySelector('#tab-appearance').click();document.querySelector('[data-appearance-tab=${tab}]').click()`,theme==='orbit');
   await surface(prefix+'-controller-settings',`showSettings();document.querySelector('[data-settings-fold=controller]').open=true;document.querySelector('[data-settings-fold=controller]').scrollIntoView({block:'start'})`);
   await surface(prefix+'-privacy-expanded',`showSettings();document.querySelector('#tab-privacy').click();document.querySelector('.discord-disclosure').open=true;document.querySelector('.discord-disclosure').scrollIntoView({block:'start'})`);
   await surface(prefix+'-details',`showDetails(state.games.find(g=>g.kind==='game').id)`,theme==='orbit');
   await surface(prefix+'-game-options',`(async()=>{await showDetails(state.games.find(g=>g.kind==='game').id);document.querySelector('.simple-game-options').open=true;document.querySelector('.simple-game-options').scrollIntoView({block:'start'});})()`,theme==='orbit');
   await surface(prefix+'-search',`OrbitDesktopTools.search()`,theme==='orbit');
   await surface(prefix+'-shortcuts',`OrbitDesktopTools.shortcutEditor()`);
   await surface(prefix+'-launch-targets',`OrbitDesktopLaunch.manager(state.games.find(g=>g.kind==='game'))`);
   await surface(prefix+'-collections',`OrbitCollectionUI.manage()`);
   await surface(prefix+'-activity',`orbitCompanion.activity()`);
   await surface(prefix+'-vr-settings',`OrbitDesktopTools.runtime()`,theme==='orbit');
   await surface(prefix+'-steam-disconnected',`OrbitSteam.panel({connected:false,apps:[],message:'Synthetic connection unavailable. Retry from Steam.'})`);
   await surface(prefix+'-context-menu',`OrbitContextMenu.open([{id:'copy',label:'Copy title'},{id:'artwork',label:'Change artwork'},{id:'collections',label:'Collections',submenu:[{id:'playing',label:'Playing'}]}],{x:innerWidth-30,y:innerHeight-30},'Fixture actions');true`,theme==='orbit');
  }
 }
 await run(`OrbitContextMenu.close();document.querySelectorAll('dialog[open]').forEach(d=>d.close());showSettings();document.querySelector('#tab-general').click()`);
 check('controller fields start folded and search reveals a matching control',await run(`(()=>{const d=document.querySelector('[data-settings-fold=controller]'),closed=!d.open,input=document.querySelector('.settings-search input');input.value='deadzone';input.dispatchEvent(new Event('input'));document.querySelector('.settings-search-result')?.click();return closed&&d.open&&document.activeElement.getBoundingClientRect().height>0;})()`));
 await run(`closeModal();showSettings();document.querySelector('#tab-privacy').click()`);
 check('privacy groups activity and accounts while local-data actions start folded',await run(`document.querySelectorAll('#panel-privacy>.settings-group').length===2&&!document.querySelector('[data-settings-fold=local-data]').open&&document.querySelectorAll('[data-clear-private]').length===4`));
 await run(`closeModal();showSettings();document.querySelector('#tab-appearance').click()`);
 check('narrow Settings retains useful scrolling room and all six section tabs',await run(`(()=>{const p=document.querySelector('#panel-appearance'),nav=document.querySelector('.settings-tabs');return p.clientHeight>=180&&nav.scrollWidth<=nav.clientWidth+2&&[...nav.querySelectorAll('button')].every(b=>b.getBoundingClientRect().height>=34);})()`));
 check('theme labels remain readable and app icon uses a compact preview',await run(`parseFloat(getComputedStyle(document.querySelector('.theme-option>span:last-child')).fontSize)>=14&&document.querySelector('#app-icon-settings [data-icon-preview]').getBoundingClientRect().width<=40`));
 check('quiet icons avoid the generic atom fallback on unrelated utility actions',await run(`!document.querySelector('#theme-export .desktop-action-icon')||document.querySelector('#theme-export .desktop-action-icon').innerHTML!==OrbitControllerArt.icon('relay')`));
 await run(`closeModal()`);
 const report={passed:checks.every(c=>c.passed)&&!errors.length,checks,errors,scope:'All main Desktop pages and representative dialogs; Orbit/Roseberry/Cloud; wide 100% and narrow 125%; reduced motion; isolated synthetic data. Separate suites cover Controller, popup persistence, news and VR.',liveDisplayTest:false};
 await fs.writeFile(path.join(target,'ui-audit-report.json'),JSON.stringify(report,null,2));return report;
};
