const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {UpdateRestart,readyForUpdate,backgroundRestart,RESUME_WINDOW}=require('../src/update-restart.cjs');
const {OrbitUpdater}=require('../src/updater.cjs');
const {PlaytimeTracker}=require('../src/playtime.cjs');
const {ActivityHistory}=require('../src/activity-history.cjs');
const visibleWindow={isDestroyed:()=>false,isVisible:()=>true,isMinimized:()=>false,webContents:{executeJavaScript:async()=>true}};
async function fixture(t){const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-update-restart-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));return folder;}

test('updates only wait for Orbit startup and file operations, allowing background games and timers',async()=>{
 const context={window:visibleWindow,customArtwork:{},startupMedia:{},saveBackups:{},backupScheduler:{pending:new Set()},runningGames:{sessions:new Map([['game',{}]])},tracker:{ledger:{sessions:new Map([['timer',{}]])}}};
 assert.equal(await readyForUpdate(context),true);
 for(const key of ['customArtwork','startupMedia','saveBackups'])assert.equal(await readyForUpdate({...context,[key]:{busy:true}}),false);
 assert.equal(await readyForUpdate({...context,backupScheduler:{running:true,pending:new Set()}}),false);
 assert.equal(await readyForUpdate({...context,backupScheduler:{pending:new Set(['backup'])}}),false);
 assert.equal(await readyForUpdate({...context,window:{...visibleWindow,webContents:{executeJavaScript:async()=>false}}}),false);
 assert.equal(await readyForUpdate({...context,window:{...visibleWindow,webContents:{executeJavaScript:async()=>{throw Error('Renderer closed');}}}}),false);
 assert.equal(await readyForUpdate({...context,window:null}),true);
});

test('update restarts reopen visibly, without activation during an automatic restart in play',()=>{
 assert.equal(backgroundRestart({automatic:true,window:visibleWindow,playing:true}),true);
 assert.equal(backgroundRestart({automatic:false,window:visibleWindow,playing:true}),false);
 assert.equal(backgroundRestart({automatic:true,window:visibleWindow,playing:false}),false);
 assert.equal(backgroundRestart({automatic:false,window:{...visibleWindow,isMinimized:()=>true}}),false);
 assert.equal(backgroundRestart({automatic:false,window:{...visibleWindow,isVisible:()=>false}}),false);
 assert.equal(backgroundRestart({automatic:false,window:null}),false);
});

test('update restart state is short-lived, one-use, and ignored during ordinary launches',async t=>{
 const folder=await fixture(t);let now=100000;
 const handoff=new UpdateRestart(path.join(folder,'handoff.json'),{clock:()=>now});
 await handoff.save(true);assert.deepEqual(await handoff.consume(true),{resume:true,background:true});
 assert.deepEqual(await handoff.consume(true),{resume:false,background:false});
 await handoff.save(true);assert.deepEqual(await handoff.consume(false),{resume:false,background:false});
 await handoff.save(true);now+=RESUME_WINDOW+1;assert.deepEqual(await handoff.consume(true),{resume:false,background:false});
 await fs.writeFile(handoff.file,'not valid JSON');assert.deepEqual(await handoff.consume(true),{resume:false,background:false});
});

for(const automatic of [false,true])test((automatic?'automatic':'manual')+' update preserves a live game session and manual timer without counting installer downtime',async t=>{
 const folder=await fixture(t),timeFile=path.join(folder,'time.json'),historyFile=path.join(folder,'history.json');
 let elapsed=0,now=Date.now();
 const game={id:'detected',title:'Detected game',kind:'game',installed:true,playtimeKnown:false,versions:[{executable:'C:\\Games\\Example.exe'}]},manual={...game,id:'manual',title:'Manual game'};
 const process={id:game.id,title:game.title,pid:123,started:new Date(now-5000).toISOString(),processStarted:new Date(now-5000).toISOString(),since:now,activity:'background'};
 const tracker=new PlaytimeTracker(timeFile,()=>{},{isAlive:()=>true}),history=new ActivityHistory(historyFile,{clock:()=>now});
 tracker.ledger.clock=()=>elapsed;
 t.after(()=>tracker.shutdown());
 await tracker.observeRunning([game,manual],[process]);await tracker.manual(manual);await history.observe([process]);
 elapsed+=12000;now+=12000;await history.observe([process]);
 const sessionId=history.snapshot().sessions[0].id;
 const handoff=new UpdateRestart(path.join(folder,'handoff.json'));
 class Driver extends EventEmitter{setFeedURL(){}quitAndInstall(){this.install=tracker.shutdown({restart:true});}}
 const driver=new Driver();
 const updater=new OrbitUpdater({driver,version:'0.2.3-pre.1',settings:()=>({restartForUpdates:automatic}),canRestart:()=>readyForUpdate({window:visibleWindow}),beforeRestart:async options=>{assert.equal(options.automatic,automatic);await tracker.checkpoint();await history.finish({restart:true});await handoff.save(backgroundRestart({automatic,window:visibleWindow,playing:true}));}});
 driver.emit('update-downloaded',{version:'0.2.3-pre.2'});await updater.restart(automatic);await driver.install;
 assert.equal(updater.snapshot().phase,'restarting');assert.equal(tracker.timer,null);
 const launch=await handoff.consume(true);assert.equal(launch.background,automatic);
 now+=120000;
 const reopened=new PlaytimeTracker(timeFile,()=>{},{isAlive:()=>true}),reopenedHistory=new ActivityHistory(historyFile,{clock:()=>now});
 let nextElapsed=0;reopened.ledger.clock=()=>nextElapsed;t.after(()=>reopened.shutdown());
 await reopened.load({updated:launch.resume});await reopened.resumeAfterUpdate([game,manual]);
 assert.equal(reopened.ledger.sessions.get(manual.id).mode,'manual');
 await reopened.observeRunning([game,manual],[process]);await reopenedHistory.load();await reopenedHistory.observe([process]);
 nextElapsed+=10000;now+=10000;await reopened.tick();await reopenedHistory.observe([process]);
 assert.equal(reopened.ledger.total(game.id),22);assert.equal(reopened.ledger.total(manual.id),22);
 assert.equal(reopenedHistory.snapshot().sessions.length,1);assert.equal(reopenedHistory.snapshot().sessions[0].id,sessionId);assert.equal(reopenedHistory.snapshot().totalSeconds,22);
});

test('ordinary quits and expired update checkpoints never resume manual timers',async t=>{
 const folder=await fixture(t),file=path.join(folder,'time.json'),game={id:'manual',kind:'game',playtimeKnown:false};
 const tracker=new PlaytimeTracker(file);await tracker.manual(game);await tracker.shutdown({restart:true});
 const ordinary=new PlaytimeTracker(file);await ordinary.load();await ordinary.resumeAfterUpdate([game]);assert.equal(ordinary.ledger.sessions.size,0);await ordinary.shutdown();
 const data=JSON.parse(await fs.readFile(file,'utf8'));data.sessions=[{id:game.id,mode:'manual'}];data.updateRestartAt=Date.now()-RESUME_WINDOW-1;await fs.writeFile(file,JSON.stringify(data));
 const stale=new PlaytimeTracker(file);await stale.load({updated:true});await stale.resumeAfterUpdate([game]);assert.equal(stale.ledger.sessions.size,0);await stale.shutdown();
});

test('manual timer recovery respects tracking opt-out and native platform hours',async t=>{
 const folder=await fixture(t),file=path.join(folder,'time.json'),game={id:'manual',kind:'game',playtimeKnown:false};
 for(const native of [false,true]){
  const first=new PlaytimeTracker(file);await first.manual(game);await first.shutdown({restart:true});
  const next=new PlaytimeTracker(file,()=>{},{enabled:()=>native});await next.load({updated:true});await next.resumeAfterUpdate([{...game,storePlaytimeKnown:native}]);assert.equal(next.ledger.sessions.size,0);await next.shutdown();
 }
});
