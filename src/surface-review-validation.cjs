/* Explicit, isolated catalog review. Opens menus without submitting operations. */
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async({window,target})=>{
 const run=s=>window.webContents.executeJavaScript(s),wait=()=>new Promise(r=>setTimeout(r,150)),checks=[],surfaces=[];
 const inspect=`(()=>{const d=[...document.querySelectorAll('dialog[open]')].at(-1),root=d||document.querySelector('main'),r=root.getBoundingClientRect(),body=d?.querySelector('#modal-body,.installation-body')||root;return {dialog:Boolean(d),title:d?.querySelector('h2')?.textContent||document.querySelector('#page-title')?.textContent,fit:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,overflow:body.scrollWidth>body.clientWidth+2,buttons:[...root.querySelectorAll('button')].filter(b=>b.getClientRects().length&&!b.closest('[hidden]')).map(b=>b.textContent.trim()),text:root.innerText.slice(0,10000)};})()`;
 async function capture(name,statement){
  try{await run(`OrbitContextMenu.close();document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitSimple.closeMenus();`);await run(statement);await wait();const result=await run(inspect);if(!name.startsWith('controller-')&&!name.endsWith('tools-organize')&&!name.endsWith('header-restored')&&!name.endsWith('friends-providers')&&!result.dialog)throw Error('The requested popup did not open');surfaces.push({name,...result});checks.push({name:name+' fits without horizontal overflow',passed:result.fit&&!result.overflow});await fs.writeFile(path.join(target,name+'.png'),(await window.webContents.capturePage()).toPNG());}
  catch(error){checks.push({name,passed:false,error:error.message});surfaces.push({name,error:error.message});}
 }
 await run(`(async()=>{await orbitBoot.done;await orbit.saveSetup({step:0,status:'complete',schemaVersion:2});orbitFeatures.setCouch(false);motionEnabled=false;document.documentElement.classList.add('motion-off');OrbitPopups.resetAll();window.__reviewGame=state.games.find(g=>g.kind==='game');})()`);
 const cases=[
  ['add-game',`orbitShell.activate('library');showAdd()`],
  ['add-tool',`orbitShell.activate('tools');showAdd()`],
  ['launch-settings',`orbitFeatures.editProfile(__reviewGame)`],
  ['launch-choices',`orbitFeatures.chooseLaunch(__reviewGame.id,{title:__reviewGame.title,choices:[{id:'review:1',label:'Standard launch'},{id:'review:2',label:'Desktop mode'},{id:'review:3',label:'Alternate launch'}]})`],
  ['launch-options',`OrbitDesktopLaunch.manager(__reviewGame)`],
  ['launch-option-editor',`(async()=>{await OrbitDesktopLaunch.manager(__reviewGame);document.querySelector('[data-option-add]').click();})()`],
  ['game-options',`(async()=>{await showDetails(__reviewGame.id);document.querySelector('.simple-game-options').open=true;document.querySelector('.simple-game-options').scrollIntoView({block:'start'});})()`],
  ['game-notes',`(async()=>{await showDetails(__reviewGame.id);document.querySelector('.simple-game-options').open=true;const n=document.querySelector('.personal-notes');n.open=true;n.scrollIntoView({block:'start'});})()`],
  ['artwork',`(async()=>{await showDetails(__reviewGame.id);document.querySelector('.simple-game-options').open=true;[...document.querySelectorAll('#modal-body button')].find(b=>b.textContent.trim()==='Customize artwork').click();})()`],
  ['collections',`OrbitCollectionUI.manage()`],
  ['single-entry-collection',`state.games[0].collections=['Playing'];OrbitCollectionUI.manage()`],
  ['collection-editor',`(async()=>{await OrbitCollectionUI.manage();document.querySelector('[data-edit-collection]').click();})()`],
  ['collection-pins',`orbitDesktopLibrary.managePins()`],
  ['smart-collections',`orbitExtras.smartEditor()`],
  ['storage',`orbitExtras.storage()`],
  ['news-list',`orbitExtras.news(__reviewGame)`],
  ['health',`orbitCompanion.health()`],
  ['activity',`orbitCompanion.activity()`],
  ['uninstall-prompt',`OrbitInstall.uninstall(__reviewGame.id)`],
  ['steam-disconnected',`OrbitSteam.panel({connected:false,apps:[],folders:[],message:'Synthetic disconnected state'})`],
  ['steam-downloads',`(async()=>{await OrbitSteam.panel({connected:true,apps:[],folders:[],downloads:{overview:{paused:false},apps:[]}});document.querySelector('[data-steam-tab=downloads]').click();})()`],
  ['steam-storage',`(async()=>{await OrbitSteam.panel({connected:true,apps:[],folders:[],downloads:{overview:{paused:false},apps:[]}});document.querySelector('[data-steam-tab=storage]').click();})()`],
  ['steam-connection',`(async()=>{await OrbitSteam.panel({connected:false,apps:[],folders:[],message:'Synthetic disconnected state'});document.querySelector('[data-steam-tab=connection]').click();})()`],
  ['quick-launch',`orbitFeatures.quickSearch()`],
  ['shortcuts',`OrbitDesktopTools.shortcutEditor()`],
  ['release-notes',`showSettings();document.querySelector('#tab-manage').click();document.querySelector('[data-release-notes]').click()`],
  ['launcher-connections',`showSettings();document.querySelector('#tab-libraries').click();document.querySelectorAll('#panel-libraries details').forEach(d=>d.open=true)`],
  ['friends-providers',`(async()=>{await orbitShell.activate('friends');for(let i=0;i<30&&!friendsUI.getData();i++)await new Promise(r=>setTimeout(r,30));const d=friendsUI.getData();if(!d)throw Error('Sample Friends state unavailable');const person=(id,name,platform,activity='')=>({id,platformId:id.split(':')[1],name,platform,state:'online',stateLabel:'Online',activity});Object.assign(d,{connected:true,checkedAt:Date.now(),steamSelf:person('steam:76561198000000999','Sample owner','Steam'),discordSelf:person('discord:123456789012345999','Sample owner','Discord'),providers:[{id:'steam',name:'Steam',connected:true},{id:'discord',name:'Discord',connected:true}],friends:[person('steam:76561198000000001','Alex','Steam','Playing DOOM Eternal'),person('discord:123456789012345679','Alex','Discord'),person('discord:123456789012345680','Sam','Discord')]});friendsUI.render();})()`],
  ['friend-profile-links',`OrbitFriendLinksUI.openManager()`],
 ];
 for(const mode of [{id:'wide',w:1440,h:960,zoom:1},{id:'compact',w:800,h:700,zoom:1.25}]){
  window.setMinimumSize(640,420);window.setSize(mode.w,mode.h);window.webContents.setZoomFactor(mode.zoom);await wait();
  await run(`orbitFeatures.setCouch(false);chooseTheme('orbit');OrbitPopups.resetAll();`);
  for(const [name,statement]of cases){await capture(mode.id+'-'+name,statement);if(name==='game-options')checks.push({name:mode.id+' initial scroll keeps the Game options heading visible',passed:await run(`document.querySelector('.simple-game-options>summary').getBoundingClientRect().top>=document.querySelector('.detail-actions').getBoundingClientRect().bottom`)});if(name==='uninstall-prompt')checks.push({name:mode.id+' Uninstall fits the loaded copy rather than its loading message',passed:await run(`(()=>{const d=document.querySelector('#installation-dialog'),body=d.querySelector('.installation-body').getBoundingClientRect(),copy=d.querySelector('.launch-mode-card').getBoundingClientRect();return copy.bottom<=body.bottom+1&&body.height>=copy.height&&d.querySelector('.installation-note').textContent.includes('This removes game files.')&&d.querySelector('[data-remove-installation]').getBoundingClientRect().bottom<=d.getBoundingClientRect().bottom;})()`)});}
  if(mode.id==='compact')await capture(mode.id+'-tools-organize',`orbitShell.activate('tools');document.querySelector('#main-scroll').scrollTop=0;document.querySelector('#library-organize').click();`);
 }
 const verify=async(name,script)=>checks.push({name,passed:Boolean(await run(script))});
 await verify('Tools menu offers Select tools',`document.querySelector('.orbit-context-menu').textContent.includes('Select tools')&&!document.querySelector('.orbit-context-menu').textContent.includes('Select games')`);
 await capture('compact-fps-initial',`(async()=>{await showDetails(__reviewGame.id);document.querySelector('.simple-game-options').open=true;document.querySelector('[data-fps-estimate]').scrollIntoView({block:'center'});})()`);
 await verify('FPS starts without an empty table or a placeholder model badge',`document.querySelector('.fps-table').getBoundingClientRect().height===0&&!document.querySelector('.fps-badge')`);
 await run(`document.querySelector('.simple-game-options').scrollIntoView({block:'start'});`);await wait();
 await verify('scrolling to Game options leaves its heading below the fixed action row',`document.querySelector('.simple-game-options>summary').getBoundingClientRect().top>=document.querySelector('.detail-actions').getBoundingClientRect().bottom`);
 await run(`document.querySelector('[data-fps-estimate]').focus();document.querySelector('[data-fps-estimate]').click();`);
 for(let i=0;i<100;i++){if(await run(`!document.querySelector('[data-fps-estimate]').disabled`))break;await new Promise(r=>setTimeout(r,80));}
 await verify('requesting FPS reveals estimates and preserves keyboard focus',`document.querySelector('.fps-table').getBoundingClientRect().height>0&&document.querySelectorAll('[data-fps-kind=estimated]').length===16&&document.activeElement.matches('[data-fps-estimate]')`);
 await verify('FPS retains its approximation caption without sixteen repeated Estimated labels',`document.querySelector('.fps-table caption').textContent.startsWith('Estimated FPS')&&!document.querySelector('.fps-table td small')`);
 await fs.writeFile(path.join(target,'compact-fps-result.png'),(await window.webContents.capturePage()).toPNG());
 await run(`document.querySelector('#modal').style.width='340px';`);await wait();
 await run(`document.querySelector('.simple-game-options').scrollIntoView({block:'start'});`);await wait();
 await verify('scroll spacing follows a wrapped Play row in a resized popup',`(()=>{const a=document.querySelector('.detail-actions').getBoundingClientRect(),s=document.querySelector('.simple-game-options>summary').getBoundingClientRect(),padding=parseFloat(getComputedStyle(document.querySelector('#modal-body')).scrollPaddingBlockStart);return a.height>70&&padding>=a.height&&s.top>=a.bottom;})()`);
 await run(`document.querySelector('#modal').style.removeProperty('width');`);
 await capture('compact-no-art-launch',`orbitFeatures.chooseLaunch(__reviewGame.id,{title:__reviewGame.title,choices:[{id:'review:1',label:'Standard launch'},{id:'review:2',label:'Desktop mode'}]})`);
 await verify('missing artwork does not displace compact launch choices',`(()=>{const root=document.querySelector('#modal-body'),r=root.getBoundingClientRect(),b=root.querySelector('.launch-mode-card').getBoundingClientRect();return !root.querySelector('.game-menu-art')&&b.top>=r.top&&b.bottom<=r.bottom;})()`);
 await capture('compact-art-launch',`(()=>{const game=state.games.find(g=>g.id===__reviewGame.id);window.__reviewCover=game.cover;game.cover='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><rect width="600" height="200" fill="#476989"/></svg>');orbitFeatures.chooseLaunch(game.id,{title:game.title,choices:[{id:'review:1',label:'Standard launch'}]});})()`);
 await verify('available game artwork remains in launch prompts',`Boolean(document.querySelector('.launch-mode-layout .game-menu-art img[src]'))`);
 await run(`state.games.find(g=>g.id===__reviewGame.id).cover=window.__reviewCover;`);
 await capture('compact-steam-empty',`(async()=>{await OrbitSteam.panel({connected:true,apps:[],folders:[],downloads:{overview:{paused:false},apps:[]}});document.querySelector('[data-steam-tab=storage]').click();})()`);
 await verify('empty Steam storage shows a useful message instead of empty move controls',`document.querySelector('[data-steam-pane=storage]').textContent.includes('No installed games to move.')&&!document.querySelector('[data-move-app]')&&Boolean(document.querySelector('[data-bandwidth]'))`);
 window.setSize(1440,960);window.webContents.setZoomFactor(1);await wait();
 await capture('wide-header-restored',`orbitShell.activate('library');document.querySelector('#main-scroll').scrollTop=0`);
 await verify('wide header restores Quick launch before Add game after resizing',`document.querySelector('#quick-launch').getBoundingClientRect().left<document.querySelector('#add-game').getBoundingClientRect().left`);
 await capture('wide-single-entry-collection',`OrbitCollectionUI.manage()`);
 await verify('one collection entry has a singular label',`[...document.querySelectorAll('.collection-edit-row')].find(r=>r.querySelector('strong').textContent==='Playing').querySelector('small').textContent==='1 entry'`);
 window.setSize(1920,1080);window.webContents.setZoomFactor(1);await wait();await run(`chooseTheme('rose');orbitFeatures.setCouch(true);OrbitCouch.skipEntry();`);
 for(const route of ['home','library','settings','downloads','shelves','wheel','fullscreen'])await capture('controller-'+route,`OrbitCouch.act('${route}')`);
 await capture('controller-launch-choices',`orbitFeatures.chooseLaunch(__reviewGame.id,{title:__reviewGame.title,choices:[{id:'review:1',label:'Standard launch'},{id:'review:2',label:'Desktop mode'}]})`);
 await run(`document.querySelectorAll('dialog[open]').forEach(d=>d.close());orbitFeatures.setCouch(false);`);
 await fs.writeFile(path.join(target,'surface-catalog.json'),JSON.stringify({surfaces,checks,scope:'Desktop and Controller popup families; synthetic data; no operation submitted or real account connected.'},null,2));
 return checks;
};
