const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {RunningGames}=require('../src/running-games.cjs'),{PlaytimeTracker,isSessionProcess}=require('../src/playtime.cjs'),{ActivityHistory}=require('../src/activity-history.cjs');
const game={id:'roblox',title:'Roblox',kind:'game',installed:true,playtimeKnown:false,versions:[{source:'Roblox',installed:true,executable:'C:\\Roblox\\RobloxPlayerBeta.exe'}]};
const player={pid:42,name:'RobloxPlayerBeta',path:game.versions[0].executable,started:'2026-10-23T01:00:00Z'};

test('only windowless Roblox players are excluded; minimized games and unknown window state remain active',()=>{
 for(const name of ['RobloxPlayerBeta','RobloxPlayer']){assert.equal(isSessionProcess({name,activity:'no-window'}),false);for(const activity of ['foreground','fullscreen','background','minimized','running',undefined])assert.equal(isSessionProcess({name,activity}),true);}
 for(const name of ['RobloxStudioBeta','ExampleGame'])assert.equal(isSessionProcess({name,activity:'no-window'}),true);
});

test('Roblox ends its running session in the tray and starts fresh when the same process reopens',async()=>{
 let now=Date.parse('2026-10-23T02:00:00Z'),rows=[{...player,activity:'foreground'}],fail=false;
 const r=new RunningGames({games:()=>[game],clock:()=>now,emit:()=>{},find:async()=>{if(fail)throw Error('probe failed');return rows;}});
 await r.scan();const since=r.snapshot()[0].since;assert.equal(since,now);
 for(const activity of ['minimized','background']){now+=15000;rows=[{...player,activity}];await r.scan();assert.equal(r.snapshot()[0].since,since);}
 fail=true;await assert.rejects(r.scan(),/probe failed/);assert.equal(r.snapshot().length,1);fail=false;
 now+=15000;rows=[{...player,activity:'no-window'}];await r.scan();assert.equal(r.snapshot().length,0);
 const diagnosis=await r.diagnose(game.id);assert.equal(diagnosis.status,'Session finished');assert.match(diagnosis.note,/tray/);
 now+=300000;rows=[{...player,activity:'background'}];await r.scan();assert.equal(r.snapshot()[0].since,now);assert.equal(r.snapshot()[0].seconds,0);r.stop();
});

test('a windowed Roblox client wins over a former tray client and Studio remains separate',async()=>{
 const studio={...game,id:'studio',title:'Roblox Studio',versions:[{executable:'C:\\Roblox\\RobloxStudioBeta.exe'}]};
 let rows=[{...player,activity:'foreground'}];const r=new RunningGames({games:()=>[game,studio],emit:()=>{},find:async()=>rows});await r.scan();
 rows=[{...player,activity:'no-window'},{...player,pid:43,activity:'minimized'},{...player,pid:44,name:'RobloxStudioBeta',path:studio.versions[0].executable,activity:'no-window'}];await r.scan();assert.equal(r.sessions.get(game.id).pid,43);assert.ok(r.sessions.has(studio.id));r.stop();
});

test('tray-only Roblox does not start timers from launch watching or discovery',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-tray-watch-'));let rows=[{...player,activity:'no-window'}];const tracker=new PlaytimeTracker(path.join(root,'time.json'),()=>{},{find:async()=>rows,isAlive:()=>true});t.after(async()=>{await tracker.shutdown();await fs.rm(root,{recursive:true,force:true});});
 await tracker.watch(game);assert.equal(tracker.ledger.sessions.size,0);await tracker.discoverRunning([game]);assert.equal(tracker.ledger.sessions.size,0);
 rows=[{...player,activity:'foreground'}];await tracker.lookup();assert.equal(tracker.ledger.sessions.size,1);assert.equal(tracker.ledger.sessions.get(game.id).detected,true);
 await tracker.observeRunning([game],[]);assert.equal(tracker.ledger.sessions.size,0);assert.equal(tracker.timer,null);
});

test('tray transition finishes activity history and local playtime without counting the tray gap',async t=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-tray-history-'));let now=Date.parse('2026-10-23T02:00:00Z'),rows=[{...player,activity:'foreground'}],updates=Promise.resolve();
 const tracker=new PlaytimeTracker(path.join(root,'time.json'),()=>{},{isAlive:()=>true});tracker.ledger.clock=()=>now;const history=new ActivityHistory(path.join(root,'history.json'),{clock:()=>now});
 const running=new RunningGames({games:()=>[game],clock:()=>now,find:async()=>rows,emit:sessions=>{updates=Promise.all([tracker.observeRunning([game],[...running.sessions.values()]),history.observe(sessions)]);}});
 t.after(async()=>{running.stop();await updates;await tracker.shutdown();await fs.rm(root,{recursive:true,force:true});});
 await running.scan();await updates;now+=15000;await running.scan();await updates;now+=15000;rows=[{...player,activity:'no-window'}];await running.scan();await updates;
 assert.equal(history.snapshot().sessions[0].running,false);assert.equal(tracker.ledger.sessions.size,0);assert.equal(history.snapshot().totalSeconds,30);assert.equal(tracker.ledger.total(game.id),30);
 now+=300000;await running.scan();await updates;assert.equal(tracker.ledger.total(game.id),30);assert.equal(history.snapshot().totalSeconds,30);
 rows=[{...player,activity:'foreground'}];await running.scan();await updates;now+=15000;await running.scan();await updates;assert.equal(history.snapshot().sessions.length,2);assert.equal(history.snapshot().totalSeconds,45);assert.equal(tracker.ledger.total(game.id),45);
});
