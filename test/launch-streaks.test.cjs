const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const {launchStreaks}=require('../src/launch-streaks.cjs'),{ActivityHistory}=require('../src/activity-history.cjs');
const at=(day,hour=12)=>new Date(2026,9,day,hour).getTime(),row=(day,gameId='g',hour=12)=>({id:gameId+day+hour,gameId,title:'Game',startedAt:at(day,hour),endedAt:at(day,hour)+1000});
test('streaks count distinct local dates, including a confirmed session with no elapsed time yet',()=>{
 const rows=[row(18),row(19),row(19,'other'),{...row(20),endedAt:at(20)}];
 assert.deepEqual(launchStreaks(rows,at(20,18)),{current:3,best:3});
 assert.deepEqual(launchStreaks([],at(20)),{current:0,best:0});
});
test('yesterday keeps a streak active; a missed day resets only the current value',()=>{
 const rows=[row(14),row(15),row(16),row(18),row(19)];
 assert.deepEqual(launchStreaks(rows,at(20)),{current:2,best:3});
 assert.deepEqual(launchStreaks(rows,at(21)),{current:0,best:3});
});
test('overnight play does not invent a second launch date, but a separate launch does',()=>{
 const overnight={...row(19,'g',23),endedAt:at(20,2)};
 assert.deepEqual(launchStreaks([overnight],at(20,18)),{current:1,best:1});
 assert.deepEqual(launchStreaks([overnight,row(20,'g',2)],at(20,18)),{current:2,best:2});
});
test('invalid, future and expired start dates cannot extend a streak',()=>{
 const now=at(20),rows=[row(19),{startedAt:NaN},{startedAt:'2026-10-20'},{startedAt:now+1},{startedAt:now-181*86400000}];
 assert.deepEqual(launchStreaks(rows,now),{current:1,best:1});
});
test('calendar days stay adjacent through DST, month and year boundaries in the current time zone',()=>{
 const modulePath=require.resolve('../src/launch-streaks.cjs');
 const script=`const assert=require('node:assert/strict'),{launchStreaks}=require(${JSON.stringify(modulePath)});for(const dates of [[new Date(2026,2,7,12),new Date(2026,2,8,12),new Date(2026,2,9,12)],[new Date(2026,9,31,12),new Date(2026,10,1,12),new Date(2026,10,2,12)],[new Date(2026,11,31,12),new Date(2027,0,1,12),new Date(2027,0,2,12)]]){assert.deepEqual(launchStreaks(dates.map(d=>({startedAt:+d})),+dates[2]+1000),{current:3,best:3});}console.log('ok');`;
 for(const TZ of ['America/Chicago','Pacific/Auckland','Asia/Tokyo','UTC']){const result=spawnSync(process.execPath,['-e',script],{env:{...process.env,TZ},encoding:'utf8',windowsHide:true});assert.equal(result.status,0,TZ+': '+result.stderr);}
});
test('changing time zone consistently reinterprets retained timestamps rather than storing conflicting day keys',()=>{
 const modulePath=require.resolve('../src/launch-streaks.cjs'),times=['2026-10-19T23:30:00Z','2026-10-20T00:30:00Z'].map(Date.parse),now=Date.parse('2026-10-20T01:00:00Z');
 const script=`console.log(JSON.stringify(require(${JSON.stringify(modulePath)}).launchStreaks(${JSON.stringify(times)}.map(startedAt=>({startedAt})),${now})))`;
 for(const [TZ,expected]of [['UTC',2],['America/Chicago',1]]){const result=spawnSync(process.execPath,['-e',script],{env:{...process.env,TZ},encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).current,expected);}
});
test('history streaks use source sessions before merging or truncating the recent list and respect game filtering',()=>{
 const h=new ActivityHistory('unused',{clock:()=>at(20,18)});
 h.rows=[row(18,'older'),row(19,'older',23),{...row(20,'older',0),startedAt:at(20,0)+30000},...Array.from({length:105},(_,i)=>({...row(20,'g'+i),id:String(i)}))];
 // Simulate nearby launches on opposite sides of midnight. Their merged timeline start is yesterday.
 h.rows[1].endedAt=at(20,0);
 assert.equal(h.snapshot().sessions.length,100);
 assert.deepEqual(h.snapshot().streaks,{current:3,best:3});
 assert.deepEqual(h.snapshot('older').streaks,{current:3,best:3});
 assert.deepEqual(h.snapshot('g0').streaks,{current:1,best:1});
});
test('another game cannot fill a missed day in an individual game streak',()=>{
 const h=new ActivityHistory('unused',{clock:()=>at(20,18)});
 h.rows=[row(18,'doom'),row(20,'doom'),row(19,'vrchat'),row(20,'vrchat')];
 assert.deepEqual(h.snapshot().streaks,{current:3,best:3});
 assert.deepEqual(h.snapshot('doom').streaks,{current:1,best:1});
 assert.deepEqual(h.snapshot('vrchat').streaks,{current:2,best:2});
 assert.equal(h.snapshot('doom').sessions.every(r=>r.gameId==='doom'),true);
});
test('a game with no recorded sessions has zero streaks even when other games have a streak',()=>{
 const h=new ActivityHistory('unused',{clock:()=>at(20,18)});h.rows=[row(18),row(19),row(20)];
 assert.deepEqual(h.snapshot('unplayed').streaks,{current:0,best:0});assert.equal(h.snapshot('unplayed').sessions.length,0);
});
test('recording opt-out, restart continuity, persisted history and clearing retain their streak semantics',async t=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-streak-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));let now=at(19,23);const file=path.join(folder,'history.json'),h=new ActivityHistory(file,{clock:()=>now}),session={id:'g',title:'Game',pid:123,since:now,processStarted:new Date(now).toISOString()};
 await h.observe([session],false);assert.deepEqual(h.snapshot().streaks,{current:0,best:0});
 await h.observe([session]);await h.finish({restart:true});now=at(20,2);
 const loaded=new ActivityHistory(file,{clock:()=>now});await loaded.load();await loaded.observe([{...session,since:now}]);
 assert.equal(loaded.rows.length,1);assert.deepEqual(loaded.snapshot().streaks,{current:1,best:1});
 await loaded.clear();assert.deepEqual(loaded.snapshot().streaks,{current:0,best:0});
 const empty=new ActivityHistory(file,{clock:()=>now});await empty.load();assert.deepEqual(empty.snapshot().streaks,{current:0,best:0});
});
test('a verified start date prevents suspend or a recording pause from turning overnight play into another launch',async t=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-streak-overnight-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));let now=at(19,23);const file=path.join(folder,'history.json'),h=new ActivityHistory(file,{clock:()=>now}),session={id:'g',title:'Game',pid:123,since:now,processStarted:new Date(now).toISOString()};
 await h.observe([session]);await h.finish();now=at(20,2);await h.observe([{...session,since:now}]);
 assert.equal(h.rows.length,2);assert.deepEqual(h.snapshot().streaks,{current:1,best:1});
 const loaded=new ActivityHistory(file,{clock:()=>now});await loaded.load();assert.deepEqual(loaded.snapshot().streaks,{current:1,best:1});assert.equal(loaded.rows[1].launchAt,at(19,23));
});
test('launcher-only, failed and tool launches do not produce a streak; confirmed Endfield does',async t=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-streak-detection-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));const now=at(20),h=new ActivityHistory(path.join(folder,'history.json'),{clock:()=>now});
 const {RunningGames}=require('../src/running-games.cjs'),{mergeLibrary}=require('../src/library.cjs');
 const game=mergeLibrary([{id:'shortcut:endfield',title:'Arknights: Endfield',source:'GRYPHLINK',origin:'shortcut',installed:false,launcherAvailable:true,shortcutGameTarget:true,launcherExecutable:'C:\\GRYPHLINK\\Launcher.exe',gameExecutables:['C:\\GRYPHLINK\\Endfield.exe']}])[0];
 let processes=[],fail=false;const monitor=new RunningGames({games:()=>[game,{...game,id:'tool',kind:'tool'}],clock:()=>now,find:async()=>{if(fail)throw Error('Scan unavailable');return processes;},emit:()=>{}});t.after(()=>monitor.stop());
 await h.observe(await monitor.scan());assert.equal(h.snapshot().streaks.current,0);
 processes=[{pid:2,name:'Launcher',path:'C:\\GRYPHLINK\\Launcher.exe'}];await h.observe(await monitor.scan());assert.equal(h.snapshot().streaks.current,0);
 fail=true;await assert.rejects(monitor.scan(),/Scan unavailable/);assert.equal(h.snapshot().streaks.current,0);fail=false;
 processes=[{pid:47,name:'Endfield',path:null,started:new Date(now).toISOString(),activity:'foreground'}];await h.observe(await monitor.scan());assert.deepEqual(h.rows.map(r=>r.gameId),[game.id]);assert.deepEqual(h.snapshot().streaks,{current:1,best:1});
 processes=[];await h.observe(await monitor.scan());assert.equal(h.active.size,0);assert.equal(h.snapshot().streaks.current,1);
});
