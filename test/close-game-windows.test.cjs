const test=require('node:test'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const {findProcesses}=require('../src/playtime.cjs');
const {closeProcess}=require('../src/close-game.cjs');

test('Windows force close ends only the verified PID and refuses stale process identity',{skip:process.platform!=='win32',timeout:25000},async()=>{
 const helpers=[0,1].map(()=>spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'}));
 try {
  await Promise.all(helpers.map(child=>once(child,'spawn')));
  const rows=await findProcesses(['node.exe']);
  const target=rows.find(row=>row.pid===helpers[0].pid);
  assert.ok(target?.path&&target.started,'the helper identity is available');
  await assert.rejects(closeProcess({...target,started:'2000-01-01T00:00:00.0000000Z'},true),/process changed/i);
  assert.equal(helpers[0].exitCode,null,'a failed identity check does not stop the helper');
  assert.equal((await closeProcess(target,false)).status,'no-window');
  const exited=once(helpers[0],'exit');
  assert.equal((await closeProcess(target,true)).status,'forced');
  await exited;
  assert.equal(helpers[1].exitCode,null,'another process with the same name remains running');
  assert.equal(process.kill(helpers[1].pid,0),true);
 } finally { for(const child of helpers)if(child.exitCode===null)child.kill(); }
});
