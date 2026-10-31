/* Explicit smoke-only fixture: local synthetic history, hidden windows, no game or account actions. */
const fs=require('node:fs/promises'),path=require('node:path');
module.exports=async({window,target,history,store})=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),run=s=>window.webContents.executeJavaScript(s),checks=[],check=(name,passed,detail)=>checks.push({name,passed:Boolean(passed),...(detail?{detail}:{})});
 await run(`(async()=>{await window.orbitBoot?.done;window.orbitFeatures.setCouch(false);motionEnabled=false;document.documentElement.classList.add('motion-off');closeModal();})()`);
 const {id,second,empty}=await run(`({id:state.games.find(g=>g.title==='DOOM Eternal').id,second:state.games.find(g=>g.title==='VRChat').id,empty:state.games.find(g=>g.title==='Cyberpunk 2077').id})`),day=offset=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate()+offset,12).getTime();};
 history.rows=[-3,-2,-1].map((offset,i)=>({id:'streak-day-'+i,gameId:id,title:'DOOM Eternal',launchAt:day(offset),startedAt:day(offset),endedAt:day(offset)+60000}));
 history.rows.push(...Array.from({length:105},(_,i)=>({id:'streak-duplicate-'+i,gameId:id,title:'DOOM Eternal',launchAt:day(-1),startedAt:day(-1)+i*180000,endedAt:day(-1)+i*180000+60000})));
 history.rows.push(...[-2,-1].map((offset,i)=>({id:'second-game-'+i,gameId:second,title:'VRChat',launchAt:day(offset),startedAt:day(offset),endedAt:day(offset)+60000})));
 history.rows.push({id:'doom-another-launch',gameId:id,title:'DOOM Eternal',launchAt:day(-1)+6*3600000,startedAt:day(-1)+6*3600000,endedAt:day(-1)+6*3600000+60000});
 history.plays=null;await history.save();
 await run(`(async()=>{chooseTheme('dark');state.settings=await window.orbit.updateSettings({launchStreaks:true});await window.orbitCompanion.activity();})()`);await wait(100);
 check('Activity displays distinct-date streaks from the real history IPC',await run(`(()=>{const r=document.querySelector('#activity-body');return /3\\s+days/.test(r.querySelector('[data-activity-streak=current]').textContent)&&/3\\s+days/.test(r.querySelector('[data-activity-streak=best]').textContent);})()`));
 check('help explains confirmation, retention, time zone and history clearing',await run(`(()=>{const help=document.querySelector('[data-activity-streak=current] [data-orbit-help]')?.dataset.orbitHelp||'';return ['not when Play is clicked','180 days','time zone','Clearing history'].every(s=>help.includes(s));})()`));
 const layout=()=>run(`(()=>{const r=document.querySelector('#activity-body'),summary=r.querySelector('.activity-summary'),cards=[...summary.children],rect=summary.getBoundingClientRect();return {passed:cards.every(c=>{const b=c.getBoundingClientRect();return b.left>=rect.left-1&&b.right<=rect.right+1&&c.scrollWidth<=c.clientWidth+1;})&&r.scrollWidth<=r.clientWidth+1,columns:getComputedStyle(summary).gridTemplateColumns,cards:cards.length};})()`);
 let geometry=await layout();check('five summary cards fit a normal popup',geometry.passed&&geometry.cards===5,geometry);await fs.writeFile(path.join(target,'activity-streaks-dark.png'),(await window.webContents.capturePage()).toPNG());
 const choose=async value=>{await run(`(()=>{const picker=document.querySelector('#activity-game-filter');picker.value=${JSON.stringify(value)};picker.dispatchEvent(new Event('change',{bubbles:true}));})()`);for(let n=0;n<80;n++){if(await run(`document.querySelector('#activity-game-filter')?.value===${JSON.stringify(value)}`))break;await wait(30);}await wait(50);};
 await run(`showDetails(${JSON.stringify(id)})`);await wait(60);
 check('game details show the streak and total recorded plays beside existing statistics',await run(`(()=>{const grid=document.querySelector('.stats-grid'),count=grid.querySelector('[data-detail-stat=plays] strong'),streak=grid.querySelector('[data-detail-stat=streak] strong');return grid.children.length===6&&count.textContent.trim()==='4'&&streak.textContent.trim()==='3 days';})()`));
 check('play count help explains its source, persistence and privacy limits',await run(`(()=>{const help=document.querySelector('[data-detail-stat=plays] [data-orbit-help]').dataset.orbitHelp;return ['starting with saved session history','older history expires','Clearing session history'].every(value=>help.includes(value));})()`));
 await run(`document.querySelector('.stats-grid').scrollIntoView({block:'center',behavior:'instant'})`);await wait(60);
 await fs.writeFile(path.join(target,'game-detail-session-stats.png'),(await window.webContents.capturePage()).toPNG());
 check('game details exposes Activity beside its main actions rather than inside Notes',await run(`Boolean(document.querySelector('.detail-actions #detail-activity'))&&!document.querySelector('.personal-notes [data-game-activity]')`));
 await run(`document.querySelector('#detail-activity').click()`);for(let n=0;n<80;n++){if(await run(`document.querySelector('#activity-game-filter')?.value===${JSON.stringify(id)}`))break;await wait(30);}
 check('details opens the chosen game with its own streak and sessions',await run(`(()=>{const r=document.querySelector('#activity-body');return r.querySelector('#activity-game-filter').value===${JSON.stringify(id)}&&r.querySelector('.activity-summary').children.length===4&&r.querySelector('[data-activity-streak=current] strong').textContent.trim()==='3 days'&&[...r.querySelectorAll('.activity-session-game')].every(n=>n.textContent==='DOOM Eternal');})()`));
 await fs.writeFile(path.join(target,'game-streaks-doom.png'),(await window.webContents.capturePage()).toPNG());
 await choose(second);
 check('switching games shows independent streaks and restores picker focus',await run(`(()=>{const p=document.querySelector('#activity-game-filter'),r=document.querySelector('#activity-body');return r.querySelector('[data-activity-streak=current] strong').textContent.trim()==='2 days'&&r.querySelector('[data-activity-streak=best] strong').textContent.trim()==='2 days'&&[...r.querySelectorAll('.activity-session-game')].every(n=>n.textContent==='VRChat')&&document.activeElement===(p.hidden?p.nextElementSibling:p);})()`));
 check('game picker excludes tools',await run(`![...document.querySelector('#activity-game-filter').options].some(o=>o.textContent==='SteamVR')`));
 await fs.writeFile(path.join(target,'game-streaks-vrchat.png'),(await window.webContents.capturePage()).toPNG());
 const historyCount=history.rows.length;
 const awaitScope=async value=>{for(let n=0;n<80;n++){if(await run(`document.querySelector('#activity-game-filter')?.value===${JSON.stringify(value)}`))return;await wait(30);}throw Error('Activity scope did not change.');};
 await run(`document.querySelector('.activity-week [data-activity-game=${JSON.stringify(second)}]').click()`);await awaitScope('');
 check('clicking the selected weekly game returns to All games',await run(`document.querySelector('.activity-summary').children.length===5&&!document.querySelector('#activity-all-games')`));
 await choose(second);await run(`document.querySelector('#activity-all-games').click()`);await awaitScope('');
 check('All games action clears a game filter and restores keyboard focus',await run(`(()=>{const p=document.querySelector('#activity-game-filter');return p.value===''&&document.activeElement===(p.hidden?p.nextElementSibling:p);})()`));
 await choose(second);await run(`document.querySelector('.activity-session-game').click()`);await awaitScope('');
 check('clicking the game name in a filtered session also returns to all games',await run(`document.querySelector('#activity-game-filter').value===''&&document.querySelectorAll('.activity-session-game').length>0`));
 check('clearing an Activity filter changes no recorded history',history.rows.length===historyCount);
 await wait(100);await fs.writeFile(path.join(target,'activity-all-games.png'),(await window.webContents.capturePage()).toPNG());
 const refreshRows=history.rows.slice();history.rows.push(...Array.from({length:45},(_,i)=>({id:'refresh-page-'+i,gameId:id,title:'DOOM Eternal',launchAt:day(-10)+i*10800000,startedAt:day(-10)+i*10800000,endedAt:day(-10)+i*10800000+60000})));await history.save();
 await choose(id);await run(`document.querySelector('#activity-more').click();document.querySelector('#modal-body').scrollTop=250;window.__activityRefreshRoot=document.querySelector('#activity-body');window.__activityRefreshScroll=document.querySelector('#modal-body').scrollTop;document.querySelector('#activity-refresh').click();`);await wait(200);
 check('Refresh retains the Activity body, expanded session count and scroll position',await run(`document.querySelector('#activity-body')===window.__activityRefreshRoot&&document.querySelectorAll('.activity-session-game').length===40&&Math.abs(document.querySelector('#modal-body').scrollTop-window.__activityRefreshScroll)<2`));
 check('Refresh retains keyboard access to its action',await run(`document.activeElement===document.querySelector('#activity-refresh')`));
 await fs.writeFile(path.join(target,'activity-refreshed.png'),(await window.webContents.capturePage()).toPNG());history.rows=refreshRows;await history.save();
 await choose(empty);
 check('an unplayed game shows zero streaks and a clear empty state',await run(`document.querySelector('[data-activity-streak=current] strong').textContent.trim()==='0 days'&&document.querySelector('.activity-list').textContent.includes('No sessions recorded')`));
 await choose('');
 check('All games returns to the overall streak without changing history',await run(`document.querySelector('[data-activity-streak=current] strong').textContent.trim()==='3 days'&&document.querySelector('.activity-summary').children.length===5`));
 await run(`(async()=>{closeModal();showSettings();document.querySelector('#tab-privacy').click();document.querySelector('[data-setting=launchStreaks]').click();for(let n=0;n<80&&state.settings.launchStreaks!==false;n++)await new Promise(r=>setTimeout(r,30));})()`);
 check('Privacy switch hides statistics without disabling history',await run(`state.settings.launchStreaks===false&&state.settings.recordHistory!==false`));
 const loaded=new Promise(resolve=>window.webContents.once('did-finish-load',resolve));window.webContents.reload();await loaded;
 await run(`(async()=>{await window.orbitBoot?.done;window.orbitFeatures.setCouch(false);await window.orbitCompanion.activity();})()`);
 check('streak visibility stays disabled after renderer reload',await run(`!document.querySelector('[data-activity-streak]')&&state.settings.launchStreaks===false`));
 await run(`window.orbitCompanion.activity(${JSON.stringify(second)})`);check('hiding streaks also hides per-game counters',await run(`!document.querySelector('[data-activity-streak]')`));
 check('hiding game streaks lets the remaining cards use the full summary width',await run(`(()=>{const summary=document.querySelector('.activity-summary'),r=summary.getBoundingClientRect(),cards=[...summary.children];return cards.length===2&&cards.every(c=>c.getBoundingClientRect().width>=r.width/2-8);})()`));
 await run(`showDetails(${JSON.stringify(second)})`);
 check('Privacy hides the details streak while retaining recorded plays',await run(`!document.querySelector('[data-detail-stat=streak]')&&document.querySelector('[data-detail-stat=plays] strong').textContent.trim()==='2'`));
 await run(`window.orbitCompanion.activity(${JSON.stringify(second)})`);
 check('hiding streaks retains the recorded value',await run(`(async()=>{const d=await window.orbit.history();return d.streaks.current===3&&d.streaks.best===3;})()`));
 await run(`(async()=>{state.settings=await window.orbit.updateSettings({launchStreaks:true,recordHistory:false});await window.orbitCompanion.activity();})()`);
 check('paused recording keeps existing streaks and shows its state',await run(`document.querySelector('.activity-recording').textContent==='Recording paused'&&!!document.querySelector('[data-activity-streak]')`));
 window.setMinimumSize(640,420);window.setSize(800,700);window.webContents.setZoomFactor(1.25);
 await run(`(async()=>{closeModal();chooseTheme('rose');await showDetails(${JSON.stringify(second)});})()`);await wait(80);
 check('details cards fit a narrow popup at 125% scaling',await run(`(()=>{const grid=document.querySelector('.stats-grid'),box=grid.getBoundingClientRect();return grid.children.length===6&&[...grid.children].every(card=>{const r=card.getBoundingClientRect();return r.left>=box.left-1&&r.right<=box.right+1&&card.scrollWidth<=card.clientWidth+1;});})()`));
 await run(`document.querySelector('.stats-grid').scrollIntoView({block:'center',behavior:'instant'})`);await wait(60);
 await fs.writeFile(path.join(target,'game-detail-session-stats-narrow.png'),(await window.webContents.capturePage()).toPNG());
 await run(`(async()=>{closeModal();chooseTheme('rose');OrbitPopups.set({width:95,height:85},{kind:'menu-activity'});await window.orbitCompanion.activity(${JSON.stringify(second)});})()`);await wait(100);geometry=await layout();check('statistics wrap in Roseberry without clipping at 800px and 125% scaling',geometry.passed&&await run("activeTheme==='rose'"),geometry);await fs.writeFile(path.join(target,'activity-streaks-narrow.png'),(await window.webContents.capturePage()).toPNG());
 await run(`(async()=>{closeModal();chooseTheme('cloud');await window.orbitCompanion.activity(${JSON.stringify(second)});})()`);await wait(80);geometry=await layout();check('light theme retains readable labels and contained cards',geometry.passed&&await run(`getComputedStyle(document.querySelector('.activity-summary strong')).color!==getComputedStyle(document.querySelector('.activity-summary>div')).backgroundColor`),geometry);await fs.writeFile(path.join(target,'activity-streaks-light.png'),(await window.webContents.capturePage()).toPNG());
 const archived='archived-sample-game',archivedTitle='A remembered game with a very long title — '+ 'LongTitle'.repeat(12);
 history.rows.push({id:'archived-session',gameId:archived,title:archivedTitle,launchAt:day(-1),startedAt:day(-1),endedAt:day(-1)+60000});await history.save();
 await run(`(async()=>{await window.orbitCompanion.activity(${JSON.stringify(archived)});})()`);await wait(120);
 check('a historical game absent from the library has the correct selected filter label',await run(`(()=>{const p=document.querySelector('#activity-game-filter');return p?.value===${JSON.stringify(archived)}&&p.selectedOptions[0].textContent===${JSON.stringify(archivedTitle)};})()`));
 check('long session game names wrap inside their card at 125 percent scale',await run(`(()=>{const b=document.querySelector('.activity-session-game'),p=b?.closest('.activity-session-copy');return Boolean(b&&p)&&b.scrollWidth<=p.clientWidth+1&&b.getBoundingClientRect().right<=p.getBoundingClientRect().right+1;})()`));
 await fs.writeFile(path.join(target,'activity-archived-game.png'),(await window.webContents.capturePage()).toPNG());
 await run(`(async()=>{await window.orbit.clearPrivateData({kind:'history',confirmed:true});await window.orbitCompanion.activity();})()`);
 check('clearing local history also resets streaks through the real privacy IPC',await run(`(async()=>{const d=await window.orbit.history();return d.streaks.current===0&&d.streaks.best===0&&d.sessions.length===0&&d.timesPlayed===0;})()`));
 check('streak visibility is saved as a boolean application preference',store.settings.launchStreaks===true);
 await run(`(()=>{closeModal();localStorage.setItem('orbit-remember-view','on');localStorage.setItem('orbit-view',JSON.stringify({section:'games',view:'installed',source:'Steam',sort:'recent',list:false}));localStorage.setItem('orbit-resume-workspace','tools');localStorage.setItem('orbit-resume-scroll','800');})()`);
 await window.loadFile(path.join(__dirname,'ui/index.html'),{query:{resume:'1'}});
 await run(`(async()=>{await window.orbitBoot?.done;await new Promise(r=>setTimeout(r,80));})()`);
 check('fresh background bootstrap preserves newer Games filters against a stale Tools checkpoint',await run(`state.section==='games'&&state.view==='installed'&&state.source==='Steam'&&JSON.parse(localStorage.getItem('orbit-view')).section==='games'`));
 await run(`(()=>{localStorage.setItem('orbit-remember-view','off');localStorage.setItem('orbit-resume-workspace','tools');})()`);
 await window.loadFile(path.join(__dirname,'ui/index.html'),{query:{resume:'1','restore-workspace':'1'}});
 await run(`(async()=>{await window.orbitBoot?.done;await new Promise(r=>setTimeout(r,80));})()`);
 check('a released renderer still restores its exact Tools workspace when remembering views is off',await run(`window.orbitShell.current()==='tools'`));
 const report={passed:checks.every(c=>c.passed),checks,method:'Hidden isolated synthetic library/history; no real game launches, native focus or account actions.'};await fs.writeFile(path.join(target,'activity-report.json'),JSON.stringify(report,null,2));return report;
};
