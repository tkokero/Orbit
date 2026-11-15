// Hidden sample-source checks. No real windows, microphone or desktop are captured.
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async({window,clips,target})=>{
 const js=code=>window.webContents.executeJavaScript(code),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),checks=[],baseline=process.env.ORBIT_SOURCE_BASELINE==='1';
 const check=(name,passed,details)=>checks.push({name,passed:Boolean(passed),...(details?{details}:{})});
 const until=async code=>{for(let i=0;i<80;i++){if(await js(code))return;await wait(50);}throw Error('Source fixture did not settle: '+code);};
 const shot=async name=>{await wait(180);await window.webContents.capturePage();await fs.writeFile(path.join(target,name+'.png'),(await window.webContents.capturePage()).toPNG());};
 const geometry=()=>js(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};},d=document.querySelector('#installation-dialog');return {frame:rect(d),settings:rect(d.querySelector('[data-clip-settings]')),source:rect(d.querySelector('[data-clip-source-details]')),cards:[...d.querySelectorAll('[data-source-id]')].map(b=>({id:b.dataset.sourceId,...rect(b.querySelector('span'))}))};})()`);
 const same=(a,b)=>Math.abs(a-b)<2;
 window.setMinimumSize(500,420);window.setSize(1920,1080);window.webContents.setZoomFactor(1);
 await js(`(async()=>{await orbitBoot.done;orbitFeatures.setCouch(false);chooseTheme('ember');motionEnabled=false;document.documentElement.classList.add('motion-off');OrbitPopups.resetAll();OrbitPopups.set({width:150,height:110});document.querySelectorAll('dialog[open]').forEach(d=>d.close());})()`);
 await clips.configure({mode:'source',seconds:30,height:1080,fps:60,audio:false});
 const names=['Screen 1','Screen 2','DOOM Eternal','VRChat','Discord','Music','Editor with a long project name for accessibility','Files'];
 const rows=[];
 for(const [i,name]of names.entries()){
  const preview=await js(`(()=>{const c=document.createElement('canvas');c.width=${i===1?360:640};c.height=${i===1?640:360};const x=c.getContext('2d');x.fillStyle='${['#192637','#27352d','#392b23','#2b2941'][i%4]}';x.fillRect(0,0,c.width,c.height);x.fillStyle='#111820';x.fillRect(0,0,c.width,34);x.fillStyle='#cce3ed';x.font='20px Nunito';x.fillText(${JSON.stringify(name)},20,25);x.fillStyle='#9bc2d2';for(let j=0;j<5;j++)x.fillRect(24,76+j*42,c.width*(.5+j*.04),12);x.font='18px Nunito';x.fillStyle='#e8e3d9';x.fillText('Sample preview',24,c.height-28);return c.toDataURL('image/png');})()`);
  rows.push({id:i<2?'screen:fixture-'+i+':0':'window:fixture-'+i+':0',name,screen:i<2,preview});
 }
 let current=rows;const original=clips.sources;clips.sources=async()=>current;
 try{
  await js('OrbitClips.open()');await until(`Boolean(document.querySelector('[data-clips-view]:not([data-popup-loading="true"])'))`);await js(`OrbitPopups.set({width:150,height:135,mode:'manual',fixedHeight:true,baseWidth:960},{kind:'clips'})`);await wait(200);
  const closed=await geometry();await shot('source-collapsed');
  await js(`document.querySelector('[data-clip-source-details]').open=true`);await until(`document.querySelectorAll('[data-source-id]').length===8`);await until(`[...document.querySelectorAll('[data-source-id] img')].slice(0,2).every(i=>i.complete&&i.naturalWidth>0)`);
  const opened=await geometry();await shot('source-expanded');
  check('source previews are at least 320 px wide in a wide popup',opened.cards.every(card=>card.width>=319),{widths:opened.cards.map(c=>c.width)});
  check('a wide source picker shows three columns instead of six',opened.cards.filter(c=>same(c.y,opened.cards[0].y)).length===3);
  check('source previews use the main popup scroll area without a nested scrollbar',await js(`getComputedStyle(document.querySelector('.clip-source-grid')).overflowY==='visible'`));
  check('closed and expanded source sections keep the same width and left edge',same(closed.source.width,opened.source.width)&&same(closed.source.x,opened.source.x));
  check('settings stay full width beside no empty column',same(closed.settings.width,opened.source.width)&&same(closed.settings.x,opened.source.x));
  check('opening sources keeps the outer popup fixed',same(closed.frame.width,opened.frame.width)&&same(closed.frame.height,opened.frame.height)&&same(closed.frame.y,opened.frame.y));
  await js(`document.querySelector('[data-clip-source-details]').open=false;document.querySelector('[data-clip-settings]').open=true`);await wait(120);const settings=await geometry();await shot('settings-expanded');
  check('expanding settings does not change either section width',same(settings.settings.width,closed.settings.width)&&same(settings.source.width,closed.source.width));
  await js(`document.querySelector('[data-clip-settings]').open=false;document.querySelector('[data-clip-source-details]').open=true`);await wait(120);
  const beforeRefresh=await geometry();
  await js(`(()=>{const cards=[...document.querySelectorAll('[data-source-id]')];window.sourceFixtureCards=cards;cards[1].focus({preventScroll:true});cards[1].click();window.sourceFixtureFocused=cards[1];})()`);
  current=[...rows].reverse().map(row=>({...row,name:row.id===rows[1].id?'Screen 2 · renamed':row.name}));
  await js(`document.querySelector('[data-clip-sources]').click()`);await until(`!document.querySelector('[data-clip-options]').disabled`);await wait(180);
  const refreshed=await geometry();
  check('source enumeration changes do not reorder visible cards',JSON.stringify(refreshed.cards.map(c=>c.id))===JSON.stringify(beforeRefresh.cards.map(c=>c.id)));
  check('refresh updates existing buttons without replacing their nodes',await js(`sourceFixtureCards.every(card=>card.isConnected&&document.querySelector('[data-source-id="'+card.dataset.sourceId+'"]')===card)`));
  check('preview refresh preserves keyboard focus',await js(`document.activeElement===sourceFixtureFocused`));
  check('refresh retains the selected source and updates its name',await js(`document.querySelector('[data-clip-source]').value===sourceFixtureFocused.dataset.sourceId&&document.querySelector('[data-clip-source-name]').textContent==='Screen 2 · renamed'`));
  check('refresh keeps unchanged card positions stable',refreshed.cards.every((card,i)=>same(card.x,beforeRefresh.cards[i].x)&&same(card.y,beforeRefresh.cards[i].y)));
  check('portrait screens stay contained in the preview frame',await js(`(()=>{const i=document.querySelector('[data-source-id="${rows[1].id}"] img');return i.naturalWidth===360&&i.naturalHeight===640&&getComputedStyle(i).objectFit==='contain';})()`));
  check('long source names remain available through accessible labels',await js(`(()=>{const b=document.querySelector('[data-source-id="${rows[6].id}"]');return b.getAttribute('aria-label')===${JSON.stringify(names[6])}&&b.title===${JSON.stringify(names[6])};})()`));
  if(!baseline){
   current=[...current,{...rows[0],id:'window:new-fixture:0',name:'New sample window'}];await js(`document.querySelector('[data-clip-sources]').click()`);await until(`document.querySelectorAll('[data-source-id]').length===9`);
   check('new sources append without moving existing cards',await js(`document.querySelector('[data-source-id]:last-child').dataset.sourceId==='window:new-fixture:0'&&sourceFixtureCards.every(card=>card.isConnected)`));
   current=current.filter(row=>row.id!==rows[1].id);await js(`document.querySelector('[data-clip-sources]').click()`);await until(`!document.querySelector('[data-source-id="${rows[1].id}"]')`);
   check('closed selected source clears the selection instead of starting another source',await js(`document.querySelector('[data-clip-source]').value===''&&document.querySelector('[data-clip-source-name]').textContent==='Choose a window or display'`)&&!clips.child);
   window.setSize(760,800);window.webContents.setZoomFactor(1.25);await wait(180);await shot('source-narrow');
   check('narrow source picker fits one readable column without horizontal overflow',await js(`(()=>{const d=document.querySelector('#installation-dialog'),g=d.querySelector('.clip-source-grid'),cards=[...g.querySelectorAll('button')],r=cards[0].getBoundingClientRect();return g.scrollWidth<=g.clientWidth+2&&cards[1].getBoundingClientRect().top>r.top&&r.left>=0&&r.right<=innerWidth;})()`));
   await js('OrbitInstall.close()');await wait(220);window.setSize(1440,1000);window.webContents.setZoomFactor(1);await js('OrbitPopups.resetAll();OrbitClips.open()');await until(`document.querySelector('[data-clips-view]')?.dataset.popupLoading==='false'&&document.querySelector('#installation-dialog').dataset.popupKind==='clips'&&OrbitPopups.fitState(document.querySelector('#installation-dialog')).sealed`);await wait(100);
   const automatic=await geometry();await js(`document.querySelector('[data-clip-source-details]').open=true`);await until(`document.querySelectorAll('[data-source-id]').length===8`);await wait(150);const automaticOpened=await geometry();
   check('default automatic popup stays in place when its source picker expands',same(automatic.frame.width,automaticOpened.frame.width)&&same(automatic.frame.height,automaticOpened.frame.height)&&same(automatic.frame.y,automaticOpened.frame.y));
   check('default source and settings sections retain their full width',same(automatic.settings.width,automaticOpened.settings.width)&&same(automatic.source.width,automaticOpened.source.width));
  }
  await js('OrbitInstall.close()');await wait(220);check('source checks never start recording',!clips.child&&!clips.armed);
  const report={passed:baseline?true:checks.every(c=>c.passed),baseline,fixtureOnly:true,realSourcesCaptured:false,closed,opened,refreshed,checks};await fs.writeFile(path.join(target,'clips-source-report.json'),JSON.stringify(report,null,2));return report;
 }finally{clips.sources=original;}
};
