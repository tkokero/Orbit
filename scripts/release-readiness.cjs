/* Read-only public-feed and live integration probes. No game is launched/stopped,
   and no visible Discord activity is published by this script. */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),{FEED,installerDestination}=require('../src/updater.cjs');
async function main(){
 const target=path.resolve(root,'../readability-release');await fs.mkdir(target,{recursive:true});const report={checkedAt:new Date().toISOString(),checks:[]},add=(name,passed,details={})=>report.checks.push({name,passed,...details});
 const response=await fetch(FEED+'/latest.yml',{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Public feed returned '+response.status);
 const text=await response.text(),metadata=require('yaml').parse(text);await fs.writeFile(path.join(target,'public-latest.yml'),text);
 add('shared public feed is accessible and has an installer checksum',Boolean(metadata.version&&metadata.files?.[0]?.sha512),{version:metadata.version,feed:FEED});
 const destination=await installerDestination();add('manual installer resolves to the current public feed asset',destination===metadata.files[0].url,{destination});
 const asset=path.join(target,'public-Orbit-Setup.exe');let bytes;
 try{bytes=await fs.readFile(asset);}catch{}
 const digest=b=>crypto.createHash('sha512').update(b).digest('base64');
 if(!bytes||digest(bytes)!==metadata.files[0].sha512){const download=await fetch(destination,{signal:AbortSignal.timeout(120000)});if(!download.ok)throw Error('Public installer download failed.');bytes=Buffer.from(await download.arrayBuffer());await fs.writeFile(asset,bytes);}
 add('public installer download matches feed size and SHA-512',digest(bytes)===metadata.files[0].sha512&&bytes.length===metadata.files[0].size,{bytes:bytes.length,executed:false});
 const client=new(require('../src/discord-presence.cjs').DiscordIPC)();
 try{await client.connect(require('../src/discord-presence.cjs').APPLICATION_ID);add('real Discord desktop IPC completes the Orbit handshake',client.ready);await client.request(null);add('real Discord desktop accepts clearing QA process activity',true,{visibleActivityPublished:false});}catch(error){add('real Discord desktop IPC',false,{message:error.message});}finally{await client.close();}
 const profile=path.join(process.env.APPDATA,'Orbit'),library=JSON.parse(await fs.readFile(path.join(profile,'library.json'),'utf8')),cache=JSON.parse(await fs.readFile(path.join(profile,'library-cache.json'),'utf8'));
 const games=require('../src/library.cjs').mergeLibrary(cache.records,library.preferences),watch=new(require('../src/running-games.cjs').RunningGames)({games:()=>games,emit:()=>{}});
 try{const running=await watch.scan();add('native session scan completes without changing running games',true,{games:running.map(g=>({title:g.title,activity:g.activity})),realGameWindowVerified:running.some(g=>['foreground','fullscreen','background','minimized'].includes(g.activity)),focusChanged:false,gamesClosed:false});}catch(error){add('native session scan',false,{message:error.message});}finally{watch.stop();}
 report.passed=report.checks.every(c=>c.passed);report.manualChecks=['Physical controller navigation and real launch/exit handoff','Clean machine installation','Public update to the candidate after it is published'];
 await fs.writeFile(path.join(target,'release-readiness.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exitCode=report.passed?0:1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
