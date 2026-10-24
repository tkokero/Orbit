/* Real Windows process/window integration using a disposable QA application.
   This does not launch, focus, or close any user game. */
const {app,BrowserWindow}=require('electron'),fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
if(!process.argv.includes('--interactive-checks')){console.error('Native focus validation is interactive. Run with --interactive-checks only during an agreed playtest.');app.exit(2);}
const {RunningGames}=require('../src/running-games.cjs'),{ControllerHandoff}=require('../src/controller-handoff.cjs');
const target=path.resolve(__dirname,'../../readability-native'),wait=ms=>new Promise(r=>setTimeout(r,ms));
app.setPath('userData',path.join(target,'electron-profile'));
function command(file,args,input){return new Promise((resolve,reject)=>{const p=spawn(file,args,{windowsHide:true,stdio:['pipe','ignore','pipe']});let error='';p.stderr.on('data',b=>error+=b);p.on('error',reject);p.on('close',code=>code?reject(Error(error)):resolve());p.stdin.end(input);});}
app.whenReady().then(async()=>{
 let child,watch,launcher;const report={passed:true,checks:[],realUserGameTested:false},check=(name,passed)=>{report.checks.push({name,passed:Boolean(passed)});report.passed&&=Boolean(passed);};
 try{
  await fs.mkdir(target,{recursive:true});const executable=path.join(target,'Orbit-Handoff-QA.exe');
  const source='using System; using System.Threading; using System.Windows.Forms; public class Game { [STAThread] public static void Main(){Thread.Sleep(1800);Application.EnableVisualStyles();var f=new Form();f.Text="Orbit handoff validation";f.Width=640;f.Height=360;var timer=new System.Windows.Forms.Timer();timer.Interval=7000;timer.Tick+=(s,e)=>f.Close();f.Shown+=(s,e)=>timer.Start();Application.Run(f);} }';
  const csFile=path.join(target,'Handoff.cs');await fs.writeFile(csFile,source);
  const compiler=path.join(process.env.WINDIR,'Microsoft.NET/Framework64/v4.0.30319/csc.exe');await command(compiler,['/nologo','/target:winexe','/out:'+executable,'/reference:System.Windows.Forms.dll',csFile]);
  launcher=new BrowserWindow({width:700,height:400,show:false,webPreferences:{sandbox:true}});await launcher.loadURL('data:text/html,<title>Orbit handoff check</title><body style="background:%2310141b;color:%23eef4fc;font:24px sans-serif;padding:40px">Orbit handoff check</body>');launcher.show();launcher.focus();
  let hidden=false,restored=false;const phases=[];
  const handoff=new ControllerHandoff({hold:()=>{launcher.setAlwaysOnTop(true,'screen-saver');launcher.show();launcher.focus();},release:()=>launcher.setAlwaysOnTop(false),transition:async()=>{check('Orbit stays on top until the transition starts',launcher.isAlwaysOnTop());await wait(100);},focus:async id=>{try{launcher.focus();return await watch.focus(id);}catch(error){report.focusError=error.message;throw error;}},hide:()=>{hidden=true;launcher.minimize();},restore:()=>{restored=true;launcher.restore();launcher.setFullScreen(true);launcher.show();launcher.focus();},notify:s=>phases.push(s.phase)});
  const game={id:'native-qa',title:'Orbit Handoff QA',kind:'game',installed:true,versions:[{executable}]};watch=new RunningGames({games:()=>[game],emit:rows=>handoff.observe(rows)});
  handoff.begin(game.id);child=await require('../src/game-process.cjs').launchGameProcess({value:executable});let noWindow=false,windowReady=false,focused=false;
  for(let i=0;i<60&&!restored;i++){
   const rows=await watch.scan(),row=rows[0];if(row?.activity==='no-window'){noWindow=true;check('launcher stays visible while the native process has no game window',!hidden);}
   if(row&&['foreground','fullscreen','background','minimized'].includes(row.activity))windowReady=true;
   if(hidden){await wait(80);const r=await watch.scan();focused||=r.some(g=>['foreground','fullscreen'].includes(g.activity));}
   await wait(200);
  }
  check('real startup process is observed before a window exists',noWindow);check('real native game window is detected',windowReady);check('native foreground focus succeeds before minimizing the launcher',hidden&&focused&&phases.includes('playing'));check('launcher restores fullscreen after confirmed QA process exit',restored&&!launcher.isMinimized()&&launcher.isFullScreen());
  report.phases=phases;await fs.writeFile(path.join(target,'native-handoff.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }catch(error){report.passed=false;report.error=error.message;await fs.writeFile(path.join(target,'native-handoff.json'),JSON.stringify(report,null,2));console.error(error);}finally{watch?.stop();if(child?.exitCode===null)child.kill();launcher?.destroy();app.exit(report.passed?0:1);}
});
