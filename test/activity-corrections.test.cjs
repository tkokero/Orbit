const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const {ActivityHistory}=require('../src/activity-history.cjs');
const {RecordedPlays}=require('../src/recorded-plays.cjs');
const DAY=86400000;
async function fixture(t){const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-correction-'));t.after(()=>fs.rm(folder,{recursive:true,force:true}));let now=new Date(2026,10,1,20).getTime();const options={clock:()=>now},h=new ActivityHistory(path.join(folder,'history.json'),options);await h.load();return {h,options,advance:n=>now+=n,row:(id,offset=0,gameId='doom',duration=60000)=>({id,gameId,title:gameId,startedAt:now-DAY+offset,endedAt:now-DAY+offset+duration})};}
const target=row=>({ids:row.sourceIds,revision:row.revision});
const select=(h,...ids)=>h.snapshot().sessions.filter(row=>ids.some(id=>row.sourceIds.includes(id))).map(target);
test('correction recovery survives reload and restores only affected recordings after later observations',async t=>{
 const {h,row,options,advance}=await fixture(t);h.rows=[row('a'),row('b',0,'vrchat')];h.counts();const {result}=await apply(h,'remove',select(h,'a'));
 const data=JSON.parse(await fs.readFile(h.file,'utf8'));assert.equal(data.correctionRecovery.before.length,1);assert.equal(data.correctionRecovery.after.length,0);
 advance(600001);const loaded=new ActivityHistory(h.file,options);await loaded.load();assert.equal(loaded.snapshot().undo.label,'Restore last session change');await loaded.observe([{id:'new',title:'New',pid:72,since:1}]);await loaded.undoCorrection(result.undo.token);
 assert.equal(loaded.rows.length,3);assert.equal(loaded.summary().timesPlayed,3);assert.equal(loaded.active.size,1);assert.equal(JSON.parse(await fs.readFile(h.file,'utf8')).correctionRecovery,undefined);
});
test('merge recovery survives reload with its gap intervals and older persistent totals intact',async t=>{
 const {h,row,options}=await fixture(t);h.rows=[row('a'),row('b',10*60000)];h.counts().games.get('doom').count+=80;const original=structuredClone(h.rows);const {result}=await apply(h,'merge',select(h,'a','b'));
 const loaded=new ActivityHistory(h.file,options);await loaded.load();assert.equal(loaded.summary().timesPlayed,81);await loaded.undoCorrection(result.undo.token);assert.deepEqual(loaded.rows,original);assert.equal(loaded.summary().timesPlayed,82);
});
test('malformed or expired recovery cannot erase valid history or its play counters',async t=>{
 const {h,row,options,advance}=await fixture(t);h.rows=[row('a'),row('b',10*60000)];await apply(h,'remove',select(h,'a'));const clean=JSON.parse(await fs.readFile(h.file,'utf8'));
 for(const invalid of [{...clean.correctionRecovery,before:[null]},{...clean.correctionRecovery,before:Array(1001).fill(row('bad'))},{...clean.correctionRecovery,expiresAt:Infinity},{...clean.correctionRecovery,createdAt:options.clock()+100000}]){
  await fs.writeFile(h.file,JSON.stringify({...clean,correctionRecovery:invalid}));const loaded=new ActivityHistory(h.file,options);await loaded.load();assert.equal(loaded.rows.length,1);assert.equal(loaded.summary().timesPlayed,1);assert.equal(loaded.snapshot().undo,null);
 }
 await fs.writeFile(h.file,JSON.stringify(clean));advance(7*DAY+1);const expired=new ActivityHistory(h.file,options);await expired.load();assert.equal(expired.snapshot().undo,null);assert.equal(expired.rows.length,1);
});
test('failed saves retain the last valid recovery and a failed Undo remains retryable after reload',async t=>{
 const {h,row,options}=await fixture(t);h.rows=[row('a'),row('b',10*60000)];const first=await apply(h,'remove',select(h,'a')),save=h.save;
 h.save=async()=>{throw Error('Disk full')};await assert.rejects(apply(h,'remove',select(h,'b')),/Disk full/);assert.equal(h.snapshot().undo.token,first.result.undo.token);await assert.rejects(h.undoCorrection(first.result.undo.token),/Disk full/);assert.equal(h.rows.length,1);h.save=save;
 const loaded=new ActivityHistory(h.file,options);await loaded.load();await loaded.undoCorrection(first.result.undo.token);assert.equal(loaded.rows.length,2);
});
test('recovery refuses to displace newer recordings when the retained history is full',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a')];const {result}=await apply(h,'remove',select(h,'a'));h.rows=Array.from({length:1000},(_,i)=>row('new-'+i,i*100));h.plays=RecordedPlays.seed(h.rows);await assert.rejects(h.undoCorrection(result.undo.token),/exceed retained/);assert.equal(h.rows.length,1000);assert.equal(h.summary().timesPlayed,1000);
});
async function apply(h,action,targets,value={}){const preview=h.review({action,targets,...value});return {preview,result:await h.applyCorrection(preview.token)};}

test('editing a displayed group updates time and streak dates while preserving its recorded play count',async t=>{
 const {h,row,options}=await fixture(t);h.rows=[row('a'),row('b',120000)];h.counts();const before=structuredClone(h.rows),start=options.clock()-2*DAY;
 const {preview,result}=await apply(h,'edit',select(h,'a'),{startedAt:start,endedAt:start+180000});
 assert.equal(preview.secondsBefore,120);assert.equal(preview.secondsAfter,180);assert.equal(h.rows.length,1);assert.equal(h.summary().timesPlayed,2);assert.equal(h.rows[0].launchAt,start);assert.equal(h.rows[0].corrected,true);
 const loaded=new ActivityHistory(h.file,options);await loaded.load();assert.equal(loaded.snapshot().totalSeconds,180);assert.equal(loaded.summary().timesPlayed,2);assert.equal(loaded.rows[0].playKeys.length,2);
 await h.undoCorrection(result.undo.token);assert.deepEqual(h.rows,before);assert.equal(h.summary().timesPlayed,2);
});
test('merge unions overlaps, excludes gaps and corrects persistent totals without erasing expired plays',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a'),row('b',10*60000),row('other',2*60000,'vrchat')];h.plays=RecordedPlays.seed(h.rows);h.plays.games.get('doom').count+=97;
 const {preview,result}=await apply(h,'merge',select(h,'a','b'));
 assert.equal(preview.secondsAfter,120);assert.equal(preview.timesPlayedBefore,99);assert.equal(preview.timesPlayedAfter,98);assert.equal(h.rows.length,2);assert.equal(h.snapshot('doom').sessions[0].seconds,120);assert.equal(h.summary('vrchat').timesPlayed,1);
 await h.undoCorrection(result.undo.token);assert.equal(h.summary('doom').timesPlayed,99);assert.equal(h.rows.length,3);
});
test('removal handles multiple games and Undo preserves observations recorded after the correction',async t=>{
 const {h,row,options,advance}=await fixture(t);h.rows=[row('a'),row('b',0,'vrchat')];h.counts();const {result}=await apply(h,'remove',select(h,'a','b'));assert.equal(h.rows.length,0);assert.equal(h.summary().timesPlayed,0);
 await h.observe([{id:'new',title:'New game',pid:22,since:1,processStarted:new Date(options.clock()).toISOString()}]);advance(10000);await h.observe([{id:'new',title:'New game',pid:22,since:1,processStarted:new Date(options.clock()-10000).toISOString()}]);
 await h.undoCorrection(result.undo.token);assert.equal(h.rows.length,3);assert.equal(h.snapshot('new').totalSeconds,10);assert.equal(h.summary().timesPlayed,3);assert.equal(h.snapshot('new').sessions[0].running,true);
});
test('deleting one fragment does not subtract a play that is still represented by another fragment',async t=>{
 const {h,row,options}=await fixture(t),launch=options.clock()-2*DAY;h.rows=[{...row('a'),launchAt:launch},{...row('b',10*60000),launchAt:launch}];h.counts();assert.equal(h.summary().timesPlayed,1);
 await apply(h,'remove',select(h,'a'));assert.equal(h.summary().timesPlayed,1);await apply(h,'remove',select(h,'b'));assert.equal(h.summary().timesPlayed,0);
});
test('stale previews and active sessions cannot be changed, including a session that becomes active after review',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a')];const preview=h.review({action:'remove',targets:select(h,'a')});h.rows[0].endedAt+=1000;await assert.rejects(h.applyCorrection(preview.token),/changed/);
 const second=h.review({action:'remove',targets:select(h,'a')});h.active.set('running',h.rows[0]);assert.throws(()=>h.review({action:'remove',targets:select(h,'a')}),/finishes/);await assert.rejects(h.applyCorrection(second.token),/finishes/);assert.equal(h.rows.length,1);
});
test('reviews expire, double apply is rejected, and only the latest correction can be undone',async t=>{
 const {h,row,advance}=await fixture(t);h.rows=[row('a'),row('b',10*60000)];let review=h.review({action:'remove',targets:select(h,'a')});advance(300001);await assert.rejects(h.applyCorrection(review.token),/expired/);
 const first=await apply(h,'remove',select(h,'a'));await assert.rejects(h.applyCorrection(first.preview.token),/expired/);const second=await apply(h,'remove',select(h,'b'));await assert.rejects(h.undoCorrection(first.result.undo.token),/no longer/);
 advance(7*DAY+1);await assert.rejects(h.undoCorrection(second.result.undo.token),/no longer/);assert.equal(h.snapshot().undo,null);
});
test('invalid ranges, duplicate targets and mixed games are rejected without writing history',async t=>{
 const {h,row,options}=await fixture(t);h.rows=[row('a'),row('b',0,'vrchat')];const targets=select(h,'a'),before=structuredClone(h.rows),startedAt=options.clock()-10000;
 for(const endedAt of [startedAt,startedAt-1,options.clock()+1,NaN,'no'])assert.throws(()=>h.review({action:'edit',targets,startedAt,endedAt}),/Choose a start/);
 assert.throws(()=>h.review({action:'merge',targets:select(h,'a','b')}),/same game/);assert.throws(()=>h.review({action:'remove',targets:[targets[0],targets[0]]}),/once/);assert.deepEqual(h.rows,before);
 await assert.rejects(fs.access(h.file));
});
test('failed correction writes roll back rows counts and resume identities and allow a safe retry',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a')];h.counts();h.resumable.set('verified','a');const before=structuredClone(h.rows),counts=h.counts().snapshot(),review=h.review({action:'remove',targets:select(h,'a')}),save=h.save;
 h.save=async()=>{throw Error('Disk unavailable');};await assert.rejects(h.applyCorrection(review.token),/Disk unavailable/);assert.deepEqual(h.rows,before);assert.deepEqual(h.counts().snapshot(),counts);assert.equal(h.resumable.get('verified'),'a');
 h.save=save;await h.applyCorrection(review.token);assert.equal(h.rows.length,0);assert.equal(h.resumable.size,0);
});
test('Undo refuses newer changes to affected rows and clearing history clears correction memory',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a'),row('b',10*60000)];const {result}=await apply(h,'merge',select(h,'a','b'));h.rows[0].endedAt+=1000;
 await assert.rejects(h.undoCorrection(result.undo.token),/newer history/);await h.clear();assert.equal(h.snapshot().undo,null);assert.equal(h.corrections.staged.size,0);
});
test('queued corrections do not drop a concurrent confirmed game observation',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a')];const review=h.review({action:'remove',targets:select(h,'a')});await Promise.all([h.applyCorrection(review.token),h.observe([{id:'new',title:'New game',pid:55,since:1}])]);assert.equal(h.rows.length,1);assert.equal(h.rows[0].gameId,'new');assert.equal(h.summary().timesPlayed,1);
});
test('staged reviews stay bounded and snapshots expose all raw identities behind combined rows',async t=>{
 const {h,row}=await fixture(t);h.rows=[row('a'),row('b',120000)];for(let i=0;i<8;i++)h.review({action:'remove',targets:select(h,'a')});assert.equal(h.corrections.staged.size,4);assert.deepEqual(new Set(h.snapshot().sessions[0].sourceIds),new Set(['a','b']));
});
