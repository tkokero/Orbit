const test=require('node:test'),assert=require('node:assert/strict');
const {RunningGames}=require('../src/running-games.cjs');
const started='2026-10-22T10:00:00.0000000Z';
const row=(pid,name='RobloxPlayerBeta',folder='C:\Roblox',extra={})=>({pid,name,path:folder+'\\'+name+'.exe',started,activity:'no-window',...extra});
const game={id:'roblox',title:'Roblox',kind:'game',installed:true,versions:[{source:'Roblox',installed:true,executable:'C:\Roblox\RobloxPlayerBeta.exe'}]};
function fixture(initial){let rows=initial,called=[];const running=new RunningGames({games:()=>[game],emit:()=>{},find:async()=>rows});running.sessions.set(game.id,{...initial[0],id:game.id,title:game.title});return {running,called,get rows(){return rows;},set rows(v){rows=v;},close:async(target,force)=>{called.push({pid:target.pid,force});rows=rows.filter(r=>r.pid!==target.pid);return {status:force?'forced':'requested'};}};}
test('Roblox force-close includes background players and their crash handler, while preserving Studio and other installations',async()=>{
 const f=fixture([row(1),row(2,'RobloxPlayer'),row(3,'RobloxCrashHandler',undefined,{parentPid:1}),row(4,'RobloxStudioBeta'),row(5,'RobloxCrashHandler',undefined,{parentPid:4}),row(6,'RobloxPlayerBeta','D:\OtherRoblox')]);
 assert.equal((await f.running.close('roblox',true,f.close)).status,'forced');assert.deepEqual(f.called.map(r=>r.pid),[1,2,3]);assert.ok(f.called.every(r=>r.force));assert.deepEqual(f.rows.map(r=>r.pid),[4,5,6]);assert.equal(f.running.sessions.has('roblox'),false);
});
test('Roblox does not report Game stopped when the client ignores termination or restarts',async()=>{
 const f=fixture([row(1)]);await assert.rejects(f.running.close('roblox',true,async()=>({status:'forced'})),/still running/);assert.ok(f.running.sessions.has('roblox'));
 await assert.rejects(f.running.close('roblox',true,async()=>{f.rows=[row(2)];return {status:'forced'};}),/restarted/);
});
test('Roblox normal close never force-kills a background client without a game window',async()=>{
 const f=fixture([row(1),row(3,'RobloxCrashHandler',undefined,{parentPid:1})]);const result=await f.running.close('roblox',false,async(target,force)=>{f.called.push({pid:target.pid,force});return {status:'no-window'};});assert.equal(result.status,'no-window');assert.deepEqual(f.called,[{pid:1,force:false}]);assert.equal(f.running.pendingCloseCleanup.size,0);
});
test('Roblox crash-helper cleanup waits until a normally closing game has exited',async()=>{
 const f=fixture([row(1),row(3,'RobloxCrashHandler',undefined,{parentPid:1})]);const close=async(target,force)=>{f.called.push({pid:target.pid,force});if(force)f.rows=f.rows.filter(r=>r.pid!==target.pid);return {status:force?'forced':'requested'};};assert.equal((await f.running.close('roblox',false,close)).status,'requested');assert.deepEqual(f.called,[{pid:1,force:false}]);f.rows=f.rows.filter(r=>r.pid!==1);await f.running.scan();assert.deepEqual(f.called,[{pid:1,force:false},{pid:3,force:true}]);assert.equal(f.rows.length,0);assert.equal(f.running.pendingCloseCleanup.size,0);
});
test('Roblox refuses a stale session without touching the replacement process',async()=>{const f=fixture([row(1)]);f.rows=[row(1,undefined,undefined,{started:'2026-10-22T11:00:00.0000000Z'})];await assert.rejects(f.running.close('roblox',true,f.close),/changed/);assert.equal(f.called.length,0);});

test('normal Roblox helper cleanup retries when Windows still lists the process',async()=>{const f=fixture([row(1),row(3,'RobloxCrashHandler',undefined,{parentPid:1})]);await f.running.close('roblox',false,async()=>({status:'requested'}));f.rows=f.rows.filter(r=>r.pid!==1);await f.running.scan();assert.equal(f.running.pendingCloseCleanup.get('roblox').attempts,1);f.running.stop();});
