/* Quiet, isolated review of game-action placement. No game or account operation is submitted. */
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async({window,target})=>{
 const js=code=>window.webContents.executeJavaScript(code),wait=ms=>new Promise(r=>setTimeout(r,ms)),checks=[];
 const check=async(name,code)=>checks.push({name,passed:Boolean(await js(code))});
 const shot=async name=>{await wait(180);await window.webContents.capturePage();await wait(120);await fs.writeFile(path.join(target,name+'.png'),(await window.webContents.capturePage()).toPNG());};
 const open=`(async()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());await showDetails(window.reviewGameId||state.games.find(g=>g.kind==='game'&&g.installed).id);document.querySelector('.simple-game-options').open=true;OrbitActionDensity.apply();document.querySelectorAll('.personal-notes').forEach(d=>d.open=false);document.querySelector('.collection-choices').open=true;document.querySelector('.simple-game-options').scrollIntoView({block:'start'});})()`;
 await fs.mkdir(target,{recursive:true});window.setSize(1440,960);window.webContents.setZoomFactor(1);
 await js(`(async()=>{await orbitBoot.done;orbitFeatures.setCouch(false);chooseTheme('ember');motionEnabled=false;document.documentElement.classList.add('motion-off');window.reviewGameId=state.games.find(g=>g.kind==='game'&&g.installed).id;})()`);
 await js(open);await wait(250);
 const legacy=await js(`!!document.querySelector('.game-more-actions')`);
 if(legacy){
  await js(`document.querySelector('.game-more-actions .action-overflow-trigger').click()`);
  await shot('game-actions-before');
  const entries=await js(`document.querySelector('.game-more-actions [role=menu]').querySelectorAll('button').length`);
  const report={passed:entries>8,fixtureOnly:true,baseline:'0.3.0-dev.2',catchAllItems:entries,checks:[{name:'captured the previous catch-all menu',passed:entries>8}]};await fs.writeFile(path.join(target,'game-actions-report.json'),JSON.stringify(report,null,2));return report;
 }
 await check('no catch-all game menu remains',`!document.querySelector('.game-more-actions')&&![...document.querySelectorAll('.action-overflow-trigger')].some(b=>b.textContent.includes('More game actions'))`);
 await check('Files and Library menus each have at most five related actions',`[...document.querySelectorAll('#detail-utilities [role=menu]')].every(m=>m.querySelectorAll('button').length<=5)`);
 await check('short library action row sits inside Collections',`document.querySelector('.collection-choices .density-library-actions').querySelectorAll('button').length<=3&&!document.querySelector('.density-library-actions [role=menu]')`);
 await check('graphics lives under Performance',`[...document.querySelectorAll('[data-action-section=Performance]>button')].some(b=>b.textContent.trim()==='Graphics settings')`);
 await check('artwork and troubleshooting have separate short sections',`document.querySelector('[data-action-section=Artwork]').querySelectorAll('button').length===2&&document.querySelector('[data-action-section=Troubleshooting]').querySelectorAll('button').length===3`);
 await check('news and recaps are not repeated in Game options',`[...document.querySelectorAll('#detail-utilities button')].filter(b=>['Game news','Session recaps'].includes(b.textContent.trim())).every(b=>!b.checkVisibility())`);
 await shot('game-actions-after');
 await js(`document.querySelector('.density-library-actions').scrollIntoView({block:'center'})`);await wait(100);await shot('library-actions');
 await js(`document.querySelector('[data-action-section=Artwork]>summary').click();document.querySelector('[data-action-section=Artwork]').scrollIntoView({block:'center'})`);await wait(80);
 await check('opening Artwork exposes just its two direct actions',`[...document.querySelectorAll('[data-action-section=Artwork]>button')].every(b=>b.checkVisibility())`);
 await shot('artwork-actions');
 await js(`document.querySelector('#detail-activity').click()`);await wait(250);
 await check('Activity retains game news and recaps',`document.querySelector('#activity-news')?.checkVisibility()&&document.querySelector('#activity-recaps')?.checkVisibility()`);
 await js(`document.querySelector('#activity-news').click()`);await wait(250);
 await check('game news opens its article list',`document.querySelector('#modal[open] h2')?.textContent.includes('News')&&!!document.querySelector('#game-news')`);
 await js(open);await wait(180);await js(`document.querySelector('#detail-activity').click()`);await wait(180);await js(`document.querySelector('#activity-recaps').click()`);await wait(180);
 await check('Activity still opens session recaps',`document.querySelector('#modal[open] h2')?.textContent==='Session recaps'`);
 await js(open);await wait(160);
 await js(`window.actionControls=[...document.querySelectorAll('#detail-utilities button')].filter(b=>!b.classList.contains('action-overflow-trigger'));for(let i=0;i<4;i++){OrbitActionDensity.pause();OrbitActionDensity.resume();}`);await wait(150);
 await check('mode restoration keeps every original action connected',`actionControls.every(b=>b.isConnected)&&document.querySelectorAll('.detail-quick-actions').length===1&&document.querySelectorAll('.density-library-actions').length===1`);
 await js(`window.actionMutations=0;window.actionObserver=new MutationObserver(r=>actionMutations+=r.length);actionObserver.observe(document.querySelector('#detail-utilities'),{childList:true,subtree:true});OrbitActionDensity.apply()`);await wait(250);
 await check('settled sections do not continually reparent their contents',`actionObserver.disconnect();actionMutations<10`);
 window.setMinimumSize(500,420);window.setSize(700,800);window.webContents.setZoomFactor(1.25);await wait(120);await js(open);await wait(180);
 await check('narrow game options fit without horizontal overflow',`(()=>{const d=document.querySelector('#modal'),body=document.querySelector('#modal-body'),r=d.getBoundingClientRect();return body.scrollWidth<=body.clientWidth+2&&r.left>=0&&r.right<=innerWidth+1;})()`);
 for(const label of ['Files & installation']){
  await js(`(()=>{const b=[...document.querySelectorAll('#detail-utilities .action-overflow-trigger')].find(b=>b.textContent.includes(${JSON.stringify(label)}));b.scrollIntoView({block:'center'});})()`);await wait(100);await js(`(()=>{const b=[...document.querySelectorAll('#detail-utilities .action-overflow-trigger')].find(b=>b.textContent.includes(${JSON.stringify(label)}));b.click();})()`);await wait(100);
  await check(label+' fits the narrow viewport',`(()=>{const r=document.querySelector('.action-overflow-menu:popover-open').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1;})()`);await js(`OrbitActionDensity.close()`);
 }
 await shot('game-actions-narrow');
 await js(`orbitFeatures.setCouch(true)`);await wait(80);
 await check('Controller restores its original action controls',`!document.querySelector('#detail-utilities .action-overflow-trigger')&&actionControls.every(b=>!b.isConnected||!b.closest('[data-action-overflow]'))`);
 await js(`orbitFeatures.setCouch(false);closeModal()`);
 const report={passed:checks.every(c=>c.passed),fixtureOnly:true,checks};await fs.writeFile(path.join(target,'game-actions-report.json'),JSON.stringify(report,null,2));return report;
};
