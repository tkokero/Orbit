const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');
const {installationProgress,LibraryMonitor}=require('../src/library-monitor.cjs');const {riotLaunch,checkedDirectLaunch}=require('../src/game-launch.cjs');
test('completed installations ignore stale byte counters; active and paused progress stay distinct',()=>{
 assert.equal(installationProgress({StateFlags:'4',BytesToDownload:'100',BytesDownloaded:'0'}),null);
 assert.deepEqual(installationProgress({StateFlags:'256',BytesToDownload:'100',BytesDownloaded:'25'}),{phase:'Download',done:25,total:100,percent:25});
 assert.equal(installationProgress({StateFlags:'518',BytesToDownload:'100',BytesDownloaded:'10'}).phase,'Paused · Download');
 assert.equal(installationProgress({StateFlags:'6',BytesToDownload:'100',BytesDownloaded:'0'}).phase,'Queued · Download');
 assert.equal(installationProgress({StateFlags:'256',BytesToDownload:'100',BytesDownloaded:'100',BytesToStage:'200',BytesStaged:'100'}).percent,50);
 assert.equal(installationProgress({StateFlags:'1'}).percent,null);
});
test('manifest watcher batches events, ignores unrelated files, and releases watchers',async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-watch-'));const calls=[];const monitor=new LibraryMonitor(events=>calls.push(events),40);
 try{monitor.start([folder]);await fs.writeFile(path.join(folder,'ignore.txt'),'x');await new Promise(r=>setTimeout(r,80));assert.equal(calls.length,0);
  await fs.writeFile(path.join(folder,'appmanifest_12.acf'),'a');await fs.writeFile(path.join(folder,'appmanifest_12.acf'),'b');await new Promise(r=>setTimeout(r,150));assert.equal(calls.length,1);assert.equal(calls[0].length,1);
 }finally{monitor.close();}assert.equal(monitor.watchers.length,0);assert.equal(monitor.timer,null);
});
test('VALORANT verifies the actual game payload and sends fixed Riot product arguments',async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-riot-'));const client=path.join(folder,'RiotClientServices.exe'),root=path.join(folder,'VALORANT/live'),payload=path.join(root,'ShooterGame/Binaries/Win64/VALORANT-Win64-Shipping.exe'),config=path.join(folder,'installs.json');
 await fs.mkdir(path.dirname(payload),{recursive:true});await fs.writeFile(client,'fixture');await fs.writeFile(payload,'fixture');await fs.writeFile(config,JSON.stringify({associated_client:{[root]:client}}));
 const found=await riotLaunch('VALORANT',client,config);assert.equal(found.installed,true);assert.deepEqual(found.gameExecutables,[payload]);const v={...found,title:'VALORANT',source:'Riot Games'};assert.deepEqual(checkedDirectLaunch(v).args,['--launch-product=valorant','--launch-patchline=live']);
 assert.throws(()=>checkedDirectLaunch({...v,directLaunch:{executable:client,args:['--arbitrary']}}));
 await fs.unlink(payload);const unavailable=await riotLaunch('VALORANT',client,config);assert.equal(unavailable.installed,undefined);assert.equal(unavailable.directLaunchAvailable,true);
});
