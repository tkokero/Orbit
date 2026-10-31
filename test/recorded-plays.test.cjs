const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {RecordedPlays,playKey}=require('../src/recorded-plays.cjs'),{ActivityHistory}=require('../src/activity-history.cjs');
test('migration counts unique verified starts and distinct legacy sessions, not daily streaks',()=>{
 const rows=[{id:'a',gameId:'g',startedAt:100,launchAt:50},{id:'b',gameId:'g',startedAt:200,launchAt:50},{id:'c',gameId:'g',startedAt:300,launchAt:250},{id:'old',gameId:'g',startedAt:400},{id:'other',gameId:'h',startedAt:400}];
 const counts=RecordedPlays.seed(rows);assert.equal(counts.count('g'),3);assert.equal(counts.count('h'),1);assert.equal(counts.count(),4);assert.equal(counts.count('unplayed'),0);assert.deepEqual(RecordedPlays.read(counts.snapshot()).snapshot(),counts.snapshot());
});
test('duplicate observations, recent restarts and retained verified starts cannot inflate totals',()=>{
 const counts=new RecordedPlays();counts.record('g','launch:100');counts.record('g','launch:100');assert.equal(counts.count('g'),1);
 for(let i=0;i<20;i++)counts.record('g','launch:'+String(200+i));assert.equal(counts.snapshot()[0].recent.length,16);
 counts.record('g','launch:100',true);assert.equal(counts.count('g'),21);assert.equal(RecordedPlays.read(counts.snapshot()).count('g'),21);
});
test('saved totals reject corrupt numbers, duplicate IDs and oversized recent identity lists',()=>{
 const row={gameId:'g',count:1,recent:['launch:100']};
 for(const value of [null,{},[{...row,count:-1}],[{...row,count:1.5}],[{...row,count:Infinity}],[{...row,count:0}],[row,row],[{...row,recent:Array(17).fill('launch:100')}],[{...row,recent:['bad']}], [{...row,recent:['launch:100','launch:100']}]] )assert.throws(()=>RecordedPlays.read(value));
 const counts=RecordedPlays.read([{...row,count:Number.MAX_SAFE_INTEGER}]);counts.record('g','launch:200');assert.equal(counts.count('g'),Number.MAX_SAFE_INTEGER);
});
test('legacy session identities stay bounded and do not put raw IDs or paths in totals',()=>{
 const row={id:'C:/private/'+ 'x'.repeat(1000),gameId:'g',startedAt:200};const key=playKey(row);assert.equal(key.length,72);assert.equal(key.includes('private'),false);assert.equal(RecordedPlays.read(RecordedPlays.seed([row]).snapshot()).count('g'),1);
});
async function fixture(t){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-recorded-plays-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));let now=Date.UTC(2026,9,20,12);return {file:path.join(dir,'history.json'),clock:()=>now,advance:n=>now+=n};}
const session=f=>({id:'g',title:'Game',pid:10,since:f.clock(),processStarted:new Date(f.clock()).toISOString()});
test('recorded totals persist after 180-day expiry and add later confirmed launches',async t=>{
 const f=await fixture(t),h=new ActivityHistory(f.file,f);await h.observe([session(f)]);await h.finish();assert.equal(h.summary('g').timesPlayed,1);
 f.advance(181*86400000);await h.save();assert.equal(h.rows.length,0);assert.equal(h.summary('g').timesPlayed,1);
 const loaded=new ActivityHistory(f.file,f);await loaded.load();await loaded.observe([session(f)]);assert.equal(loaded.summary('g').timesPlayed,2);await loaded.finish();
 const again=new ActivityHistory(f.file,f);await again.load();assert.equal(again.summary('g').timesPlayed,2);assert.equal(again.snapshot('g').sessions.length,1);
});
test('one verified process across Orbit restart, sleep and recording pauses remains one recorded play',async t=>{
 const f=await fixture(t),h=new ActivityHistory(f.file,f),s=session(f);await h.observe([s]);await h.finish({restart:true});
 f.advance(120000);const loaded=new ActivityHistory(f.file,f);await loaded.load();await loaded.observe([{...s,since:f.clock()}]);assert.equal(loaded.summary('g').timesPlayed,1);
 await loaded.finish();f.advance(120000);await loaded.observe([{...s,since:f.clock()}]);assert.equal(loaded.rows.length,2);assert.equal(loaded.summary('g').timesPlayed,1);
 await loaded.observe([],false);f.advance(120000);await loaded.observe([{...s,since:f.clock()}]);assert.equal(loaded.summary('g').timesPlayed,1);
});
test('recording opt-out adds nothing; clearing history also clears persistent totals',async t=>{
 const f=await fixture(t),h=new ActivityHistory(f.file,f);await h.observe([session(f)],false);assert.equal(h.summary('g').timesPlayed,0);
 await h.observe([session(f)]);await h.finish();f.advance(1000);await h.observe([session(f)],false);assert.equal(h.summary('g').timesPlayed,1);
 await h.clear();const loaded=new ActivityHistory(f.file,f);await loaded.load();assert.equal(loaded.summary('g').timesPlayed,0);assert.equal(loaded.rows.length,0);
});
test('older history seeds totals once without counting merged timeline rows or trimming to 100',async t=>{
 const f=await fixture(t),sessions=Array.from({length:105},(_,i)=>({id:String(i),gameId:'g',title:'Game',startedAt:f.clock()-i*1000,endedAt:f.clock()}));
 await fs.writeFile(f.file,JSON.stringify({version:1,sessions}));const h=new ActivityHistory(f.file,f);await h.load();assert.equal(h.summary('g').timesPlayed,105);assert.equal(h.snapshot('g').sessions.length,1);await h.save();
 const loaded=new ActivityHistory(f.file,f);await loaded.load();assert.equal(loaded.summary('g').timesPlayed,105);assert.equal(loaded.summary('other').timesPlayed,0);
});
