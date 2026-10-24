const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async({window,target})=>{
 const report={passed:true,checks:[]},wait=ms=>new Promise(r=>setTimeout(r,ms)),run=s=>window.webContents.executeJavaScript(s);
 function check(name,passed,detail){report.checks.push({name,passed:Boolean(passed),...(!passed?{detail}:{})});report.passed&&=Boolean(passed);}
 const close=()=>run("document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitSimple.closeMenus();OrbitControllerFocus.cancel()");
 async function inspect(name,selector,suffix){await wait(380);const m=await run(`(()=>{const d=document.querySelector(${JSON.stringify(selector)}),r=d.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,top:r.top,vw:innerWidth,vh:innerHeight,overflow:d.scrollWidth>d.clientWidth+1,font:parseFloat(getComputedStyle(d.querySelector('#modal-body')||d).fontSize),centered:Math.abs(r.left+r.width/2-innerWidth/2)<2&&Math.abs(r.top+r.height/2-innerHeight/2)<2};})()`);check(name+' fits and centers · '+suffix,m.centered&&!m.overflow&&m.left>=15&&m.top>=15&&m.width<=m.vw-30&&m.height<=m.vh-30,m);return m;}
 await run("Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[]})");
 for(const [width,height]of [[2550,1389],[1920,1080],[940,720]])for(const theme of ['dark','cloud']){
  window.setSize(width,height);const suffix=width+'-'+theme;
  await close();await run(`orbitFeatures.setCouch(false);OrbitTheme.apply(OrbitTheme.builtins.find(t=>t.id==='${theme}'),document.documentElement);showSettings();document.querySelector('#tab-appearance').click();true`);
  const settings=await inspect('Settings','#modal',suffix);
  check('Settings frame matches the reference size · '+suffix,Math.abs(settings.width-Math.min(1280,width-64))<2&&Math.abs(settings.height-Math.min(680,height-64))<2,settings);
  check('Settings body text remains readable · '+suffix,settings.font>=15,settings);
  check('launcher marks use clear, equally sized sidebar frames · '+suffix,await run("(()=>{OrbitDesktop.enhance(document.querySelector('#source-navigation'));const existing=document.querySelector('[data-source=Roblox]'),fixture=existing||document.createElement('button');if(!existing){fixture.className='nav-item platform';fixture.dataset.source='Roblox';fixture.textContent='Roblox';document.querySelector('#source-navigation').append(fixture);OrbitDesktop.enhance(fixture.parentElement);}const icons=['Steam','Epic Games','Roblox'].map(name=>document.querySelector('[data-source=\"'+name+'\"] .desktop-action-icon'));const valid=icons.every(i=>i&&i.getBoundingClientRect().width===28&&i.getBoundingClientRect().height===28&&i.querySelector('svg').getAttribute('viewBox')==='0 0 24 24'&&i.querySelector('svg').getBoundingClientRect().width===22&&!i.querySelector('text'));const steam=icons[0].parentElement,selected=steam.classList.contains('active');steam.classList.add('active');const contrast=getComputedStyle(icons[0]).color===getComputedStyle(steam).color;if(!selected)steam.classList.remove('active');if(!existing)fixture.remove();return valid&&contrast;})()"));
  for(const tab of ['general','appearance','privacy','libraries','manage','about']){
   const fits=await run(`(()=>{document.querySelector('#tab-${tab}').click();const p=document.querySelector('#panel-${tab}');return p.scrollWidth<=p.clientWidth+1&&p.clientHeight>60;})()`);check('Settings '+tab+' reflows and scrolls · '+suffix,fits);
  }
  await run("document.querySelector('#tab-appearance').click()");await fs.writeFile(path.join(target,'compact-settings-'+suffix+'.png'),(await window.webContents.capturePage()).toPNG());
  await close();await run("document.querySelector('#library-more-button').click()");await wait(30);check('More menu uses a compact anchored frame · '+suffix,await run("(()=>{const m=document.querySelector('#library-more'),r=m.getBoundingClientRect();return r.width<=202&&r.width>=180&&r.left>=10&&r.right<=innerWidth-10&&!m.querySelector('button').matches(':disabled');})()"));await run('orbitSimple.closeMenus()');
  for(const controller of [false,true]){
   const mode=suffix+'-'+(controller?'controller':'desktop');await close();await run(`orbitFeatures.setCouch(${controller});OrbitCouch.skipEntry();window.__popupGame=state.games.find(g=>g.installed&&g.kind==='game');`);
   await run("orbitFeatures.chooseLaunch(__popupGame.id,{title:__popupGame.title,choices:[{id:'qa:1',label:'Game launch'},{id:'qa:2',label:'Desktop mode'},{id:'qa:3',label:'Alternate launch'}]})");const launch=await inspect('Launch choices','#modal',mode);check('Launch chooser stays compact · '+mode,launch.width<=962,launch);
   check('Launch actions remain visible · '+mode,await run("(()=>{const d=document.querySelector('#modal').getBoundingClientRect(),f=document.querySelector('.launch-mode-footer').getBoundingClientRect();return f.top>=d.top&&f.bottom<=d.bottom&&document.querySelector('#mode-play').getBoundingClientRect().right<=d.right;})()"));
   if(theme==='dark')await fs.writeFile(path.join(target,'compact-launch-'+mode+'.png'),(await window.webContents.capturePage()).toPNG());
   await close();await run("OrbitInstall.show('Install a game','<div class=installation-choices>'+Array.from({length:20},(_,i)=>'<button class=installation-choice>Install option '+i+'</button>').join('')+'</div>','<button class=primary-button>Continue</button>')");await inspect('Installation','#installation-dialog',mode);
   check('Installation footer stays visible · '+mode,await run("(()=>{const d=document.querySelector('#installation-dialog'),r=d.getBoundingClientRect(),f=d.querySelector('.installation-footer').getBoundingClientRect();return f.bottom<=r.bottom&&f.top>=r.top&&d.querySelector('.installation-body').scrollHeight>d.querySelector('.installation-body').clientHeight;})()"));
   await close();await run('showDetails(__popupGame.id)');const detail=await inspect('Game details','#modal',mode);check('Game details honors the compact frame size · '+mode,Math.abs(detail.width-Math.min(1280,width-64))<2&&Math.abs(detail.height-Math.min(680,height-64))<2,detail);
   await close();await run('orbitFeatures.editProfile(__popupGame)');await inspect('Launch settings','#modal',mode);
   if(controller){
    await close();await run('OrbitCouchGame.menu(__popupGame.id)');await inspect('Game actions','.controller-game-context[open]',mode);
    await close();await run("(async()=>{OrbitCouch.act('settings');await new Promise(r=>setTimeout(r,150));document.querySelector('[data-settings-category=controls]').click();OrbitController.dropdown(document.querySelector('[name=binding-confirm]'))})()");await inspect('Controller choices','.controller-select[open]',mode);
    await close();await run("OrbitController.keyboard(document.querySelector('[name=delay]'))");await inspect('Controller keyboard','.controller-keyboard[open]',mode);
    check('Keyboard keys fit the smaller frame · '+mode,await run("(()=>{const g=document.querySelector('.controller-keyboard[open] .controller-key-grid');return g.scrollWidth<=g.clientWidth+1&&[...g.querySelectorAll('button')].every(b=>b.getBoundingClientRect().width>=40);})()"));
   }
  }
 }
 await close();await run("orbitFeatures.setCouch(false);OrbitTheme.apply(selectedTheme(),document.documentElement)");
 await fs.writeFile(path.join(target,'popup-report.json'),JSON.stringify(report,null,2));return report;
};
