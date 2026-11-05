/* Explicit offscreen fixture. No real profiles, accounts, game launches, or downloads. */
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=async({window,target})=>{
 const run=s=>window.webContents.executeJavaScript(s.includes('await ')?'(async()=>{'+s+'})()':s),wait=ms=>new Promise(r=>setTimeout(r,ms)),checks=[];
 const check=(name,passed)=>checks.push({name,passed:Boolean(passed)});
 const ready=async expression=>{for(let n=0;n<160;n++){if(await run(expression))return;await wait(30);}await shot('failure');throw Error('Timed out: '+expression);};
 const shot=async name=>{await wait(120);await fs.writeFile(path.join(target,name+'.png'),(await window.webContents.capturePage()).toPNG());};
 const visible=id=>run(`document.querySelector(${JSON.stringify(id)})?.checkVisibility()`);
 try{
 await run(`await orbitBoot.done;orbitFeatures.setCouch(false);await orbitShell.activate('library');closeModal();chooseTheme('orbit');motionEnabled=false;document.documentElement.classList.add('motion-off');`);
 await ready('window.orbitReady');await shot('library-before');
 if(!await run('Boolean(window.OrbitDesktopMenus)'))return finish();
 check('Existing sections are shown by default',await visible('#hero')&&await visible('#recent-games')&&await visible('#source-navigation')&&await visible('#activity-open')&&await visible('#game-storage-open'));
 await run(`window.menuViewBefore=JSON.stringify({view:state.view,source:state.source,selection:orbitDesktopLibrary.captureSelection(),display:orbitDesktopLibrary.settings});window.menuHistoryBefore=JSON.stringify(await orbit.history());document.querySelector('#customize-desktop-menus').click();`);
 await ready('document.querySelector("#desktop-menu-settings")?.checkVisibility()');
 check('More opens the same Layout settings and focuses a labeled switch',await run(`document.querySelector('[data-appearance-tab=layout]').getAttribute('aria-selected')==='true'&&document.activeElement.dataset.menuSection==='hero'&&document.activeElement.getAttribute('aria-labelledby')==='menu-label-hero'`));
 await run(`for(const id of ['hero','recents','news','platforms','activity','storage'])document.querySelector('[data-menu-section="'+id+'"]').click();`);
 check('Switches reflect saved choices immediately',await run(`Object.values(JSON.parse(localStorage.getItem('orbit-desktop-menus-v1'))).every(v=>v===false)&&[...document.querySelectorAll('[data-menu-section]')].every(b=>b.getAttribute('aria-checked')==='false')`));
 await shot('menu-settings');await run('closeModal()');await shot('library-after');
 check('Hidden sections collapse completely',!(await visible('#hero'))&&!(await visible('#recent-games'))&&!(await visible('#source-navigation'))&&!(await visible('#platforms-heading'))&&!(await visible('#activity-open'))&&!(await visible('#game-storage-open')));
 check('Library cards, settings and customization remain reachable',await visible('#game-grid')&&await visible('#settings-button')&&await visible('#library-more-button'));
 check('Hidden artwork is released and Recents has no retained cards',await run(`!document.querySelector('#hero-image').getAttribute('src')&&!document.querySelector('#recent-games').childElementCount&&!document.querySelector('#news-shelf .news-strip').childElementCount`));
 const preservation=await run(`return {viewBefore:JSON.parse(menuViewBefore),viewAfter:{view:state.view,source:state.source,selection:orbitDesktopLibrary.captureSelection(),display:orbitDesktopLibrary.settings},historyBefore:JSON.parse(menuHistoryBefore),historyAfter:await orbit.history()};`);await fs.writeFile(path.join(target,'menu-preservation.json'),JSON.stringify(preservation,null,2));
 check('Customization preserves filters, selection, density and recorded history',JSON.stringify(preservation.viewBefore)===JSON.stringify(preservation.viewAfter)&&JSON.stringify(preservation.historyBefore)===JSON.stringify(preservation.historyAfter));
 await run(`await orbitTour.start();await orbitTour.next();`);
 check('Tour skips hidden sections without changing visibility choices',await run(`!document.querySelector('#tour-title').textContent.includes('left off')&&Object.values(OrbitDesktopMenus.choices).every(v=>v===false)`));await run('await orbitTour.finish()');
 await run(`orbitFeatures.setCouch(true);OrbitCouch.skipEntry();OrbitCouch.act('library');`);
 check('Desktop preferences do not hide Controller sections',await run(`OrbitDesktopMenus.shown('hero')&&OrbitDesktopMenus.shown('news')&&getComputedStyle(document.querySelector('#source-navigation')).display!=='none'&&localStorage.getItem('orbit-desktop-menus-v1').includes('false')`));
 await run(`orbitFeatures.setCouch(false);await orbitShell.activate('library')`);
 await new Promise(resolve=>{window.webContents.once('did-finish-load',resolve);window.webContents.reload();});await ready('window.orbitReady&&!document.querySelector("#orbit-boot")');await run(`orbitFeatures.setCouch(false);await orbitShell.activate('library');closeModal();`);
 check('Reload restores hidden sections through the real preference loader',!(await visible('#hero'))&&!(await visible('#recent-games'))&&await run(`Object.values(OrbitDesktopMenus.choices).every(v=>v===false)`));
 await run(`OrbitDesktopMenus.set('recents',true);`);check('Recents works independently while the featured banner stays hidden',await visible('#recent-games')&&!(await visible('#hero')));
 await run(`OrbitDesktopMenus.open();document.querySelector('#desktop-menu-restore').click();`);
 check('Show all restores only menu visibility',await run(`Object.values(OrbitDesktopMenus.choices).every(Boolean)&&document.querySelector('#desktop-menu-restore').disabled&&localStorage.getItem('orbit-themes-v1')!==null`));
 await run('closeModal()');check('Restored sections render again',await visible('#hero')&&await visible('#recent-games')&&await visible('#source-navigation'));
 await run(`state.view='installed';render();[...document.querySelectorAll('#game-grid [data-game]')].slice(0,2).forEach(b=>b.dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true})));window.menuSelectedBefore=JSON.stringify(orbitDesktopLibrary.captureSelection());OrbitDesktopMenus.set('recents',false);OrbitDesktopMenus.set('recents',true);`);
 check('Real multi-selection and an active Installed filter survive changes',await run(`orbitDesktopLibrary.captureSelection().ids.length===2&&menuSelectedBefore===JSON.stringify(orbitDesktopLibrary.captureSelection())&&state.view==='installed'`));await run(`orbitDesktopLibrary.clear();state.view='all';render()`);
 window.setMinimumSize(640,420);window.setSize(900,780);window.webContents.setZoomFactor(1.25);
 await run(`chooseTheme('cloud');OrbitDesktopMenus.open()`);await shot('menu-settings-narrow-light');
 check('At 125% scaling the switches and labels stay within the popup',await run(`const card=document.querySelector('#desktop-menu-settings'),rect=document.querySelector('#modal').getBoundingClientRect();[...card.querySelectorAll('.menu-visibility-row')].every(row=>{const a=row.firstElementChild.getBoundingClientRect(),b=row.lastElementChild.getBoundingClientRect();return a.right+10<=b.left&&b.right<=rect.right;})&&document.documentElement.scrollWidth<=innerWidth`));
 check('Customization adds no duplicated settings or shortcuts on reopen',await run(`closeModal();OrbitDesktopMenus.open();document.querySelectorAll('#desktop-menu-settings').length===1&&document.querySelectorAll('#customize-desktop-menus').length===1`));
 return finish();
 }catch(error){await fs.writeFile(path.join(target,'menus-failure.json'),JSON.stringify({error:error.stack,checks},null,2));throw error;}
 async function finish(){const report={passed:checks.every(c=>c.passed),checks};await fs.writeFile(path.join(target,'menus-checks.json'),JSON.stringify(report,null,2));assert(report.passed,checks.filter(c=>!c.passed).map(c=>c.name).join('; '));return report;}
};
