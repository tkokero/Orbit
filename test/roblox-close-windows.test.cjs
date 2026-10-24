const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {spawn}=require('node:child_process'),{once}=require('node:events');
const {RunningGames}=require('../src/running-games.cjs');
const {findProcesses}=require('../src/playtime.cjs');
const {closeProcess}=require('../src/close-game.cjs');

test('Windows Roblox cleanup ends background players and their crash child while leaving Studio running',{skip:process.platform!=='win32',timeout:30000},async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-roblox-close-')),children=[];
 const exe=name=>path.join(root,name+'.exe');
 try{
  for(const name of ['RobloxPlayerBeta','RobloxPlayer','RobloxCrashHandler','RobloxStudioBeta'])await fs.link(process.execPath,exe(name)).catch(()=>fs.copyFile(process.execPath,exe(name)));
  const script='const {spawn}=require("node:child_process"); const child=spawn(process.argv[1],["-e","setInterval(()=>{},1000)"],{detached:true,stdio:"ignore",windowsHide:true}); child.on("spawn",()=>{process.stdout.write(String(child.pid));child.unref();}); setInterval(()=>{},1000);';
  const primary=spawn(exe('RobloxPlayerBeta'),['-e',script,exe('RobloxCrashHandler')],{windowsHide:true,stdio:['ignore','pipe','ignore']});children.push(primary);
  await once(primary.stdout,'data');
  for(const name of ['RobloxPlayer','RobloxStudioBeta']){const child=spawn(exe(name),['-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'});children.push(child);await once(child,'spawn');}
  const game={id:'test-roblox',title:'Roblox',kind:'game',installed:true,versions:[{source:'Roblox',installed:true,executable:exe('RobloxPlayerBeta'),gameExecutables:[exe('RobloxPlayer')]}]};
  const running=new RunningGames({games:()=>[game],emit:()=>{}});await running.scan();assert.equal(running.sessions.size,0,'tray-only helpers do not count as sessions');
  // Exercise cleanup independently: a user may close a detected game just as its window disappears.
  const target=(await findProcesses(['RobloxPlayerBeta.exe'])).find(r=>r.pid===primary.pid);running.sessions.set(game.id,{...target,id:game.id,title:game.title});
  assert.equal((await running.close(game.id,true)).status,'forced');
  const remaining=await findProcesses(['RobloxPlayerBeta.exe','RobloxPlayer.exe','RobloxCrashHandler.exe','RobloxStudioBeta.exe']);
  assert.deepEqual(remaining.filter(r=>path.dirname(r.path||'').toLowerCase()===root.toLowerCase()).map(r=>r.name),['RobloxStudioBeta']);
  assert.equal(children[2].exitCode,null,'Studio stays running');assert.equal(process.kill(children[2].pid,0),true);
 }finally{
  const exiting=children.filter(child=>child.exitCode===null).map(child=>{const done=once(child,'exit');child.kill();return done;});await Promise.all(exiting);
  const helpers=await findProcesses(['RobloxCrashHandler.exe']);for(const helper of helpers)if(helper.path&&path.dirname(helper.path).toLowerCase()===root.toLowerCase())await closeProcess(helper,true).catch(()=>{});
  assert.equal(path.dirname(path.resolve(root)).toLowerCase(),path.resolve(os.tmpdir()).toLowerCase());await fs.rm(root,{recursive:true,force:true});
 }
});
