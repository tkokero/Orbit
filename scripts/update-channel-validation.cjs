/* Exercise the packaged NsisUpdater against the real public feed (read only)
   and a loopback candidate feed/download. Never invokes an installer. */
const {app}=require('electron'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),target=path.resolve(root,'../readability-update'),resources=path.resolve(root,'../installer/win-unpacked/resources');
app.setPath('userData',path.join(target,'electron-profile'));
app.whenReady().then(async()=>{let server;try{
 await fs.mkdir(target,{recursive:true});const archive=path.join(resources,'app.asar'),pkg=require(path.join(archive,'package.json')),{NsisUpdater}=require(path.join(archive,'node_modules/electron-updater/out/main.js')),{ElectronHttpExecutor}=require(path.join(archive,'node_modules/electron-updater/out/electronHttpExecutor.js')),{OrbitUpdater,FEED}=require(path.join(archive,'src/updater.cjs')),yaml=require(path.join(archive,'node_modules/yaml'));
 const checks=[],add=(name,passed,more={})=>checks.push({name,passed,...more});
 function create(version,name){const folder=path.join(target,name),adapter={version,name:'Orbit-Update-QA',isPackaged:true,appUpdateConfigPath:path.join(resources,'app-update.yml'),userDataPath:folder,baseCachePath:folder,whenReady:()=>app.whenReady(),quit(){throw Error('Unexpected updater installation.');},relaunch(){throw Error('Unexpected updater relaunch.');},onQuit(){}};const driver=new NsisUpdater(null,adapter);driver.httpExecutor=new ElectronHttpExecutor(()=>{});const wrapper=new OrbitUpdater({driver,version,settings:()=>({autoUpdates:false,restartForUpdates:false})});driver.autoDownload=false;driver.disableDifferentialDownload=true;driver.logger=null;return {driver,wrapper};}
 const feedText=await(await fetch(FEED+'/latest.yml')).text(),publicInfo=yaml.parse(feedText);
 for(const version of ['0.2.0-pre.11','0.2.3',pkg.version]){
  const {driver,wrapper}=create(version,'public-'+version);const result=await driver.checkForUpdates();
  const expected=require(path.join(archive,'node_modules/semver')).gt(publicInfo.version,version)?'available':'current';
  add('public updater handles '+version,wrapper.snapshot().phase===expected&&result.updateInfo.version===publicInfo.version,{latest:publicInfo.version,phase:wrapper.snapshot().phase,downloaded:false});wrapper.stop();
 }
 const installer=await fs.readFile(path.resolve(root,'../installer/Orbit-Setup.exe')),digest=crypto.createHash('sha512').update(installer).digest('base64');
 let base;server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/latest.yml'){res.writeHead(200,{'Content-Type':'text/yaml'});res.end(yaml.stringify({version:pkg.version,files:[{url:base+'/Orbit-Setup.exe',sha512:digest,size:installer.length}],path:base+'/Orbit-Setup.exe',sha512:digest,releaseDate:new Date().toISOString()}));}else if(pathname==='/Orbit-Setup.exe'){res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Length':installer.length});res.end(installer);}else{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
 for(const version of ['0.2.3','0.2.5-pre.12',pkg.version,'0.2.5']){
  const {driver,wrapper}=create(version,'candidate-'+version);driver.setFeedURL({provider:'generic',url:base,channel:'latest'});driver.channel='latest';driver.allowDowngrade=false;
  const result=await driver.checkForUpdates(),expected=['0.2.3','0.2.5-pre.12'].includes(version)?'available':'current';
  add('candidate update selection from '+version,wrapper.snapshot().phase===expected&&result.updateInfo.version===pkg.version,{candidate:pkg.version,phase:wrapper.snapshot().phase});
  if(version==='0.2.3'){const files=await driver.downloadUpdate();const bytes=await fs.readFile(files[0]);add('actual updater downloads and verifies the candidate installer',bytes.length===installer.length&&crypto.createHash('sha512').update(bytes).digest('base64')===digest,{bytes:bytes.length,installerExecuted:false});}
  wrapper.stop();
 }
 const report={passed:checks.every(c=>c.passed),checks,candidatePublished:false,installerExecuted:false};await fs.writeFile(path.join(target,'updater-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));server.close();app.exit(report.passed?0:1);
}catch(error){server?.close();console.error(error.stack);await fs.mkdir(target,{recursive:true});await fs.writeFile(path.join(target,'error.txt'),error.stack);app.exit(1);}});
