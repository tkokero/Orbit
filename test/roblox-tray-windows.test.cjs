const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{spawn,execFile}=require('node:child_process'),{promisify}=require('node:util');
const {RunningGames}=require('../src/running-games.cjs');

// This fixture creates and minimizes native windows. Run only in an agreed playtest.
test('Windows distinguishes a minimized Roblox window from its remaining tray process',{skip:process.platform!=='win32'||process.env.ORBIT_NATIVE_WINDOW_PLAYTEST!=='1',timeout:40000},async t=>{
 const compiler='C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';try{await fs.access(compiler);}catch{return t.skip('Windows Forms compiler unavailable');}
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'orbit-tray-window-')),exe=path.join(root,'RobloxPlayerBeta.exe'),source=path.join(root,'fixture.cs');let child;
 try{
  await fs.writeFile(source,`using System;using System.Threading;using System.Windows.Forms;using System.Drawing;
class Test { [STAThread] static void Main() {
 var f=new Form();f.Text="Orbit tray verification (test window)";f.Width=320;f.Height=130;f.StartPosition=FormStartPosition.Manual;f.Left=-20000;f.Top=-20000;
 var tray=new NotifyIcon();tray.Icon=SystemIcons.Application;tray.Text="Orbit tray verification";
 f.Shown+=(s,e)=>{new Thread(()=>{string cmd;while((cmd=Console.ReadLine())!=null){var c=cmd;f.BeginInvoke((Action)(()=>{if(c=="tray"){tray.Visible=true;f.Hide();}else if(c=="minimize"){tray.Visible=false;f.Show();f.WindowState=FormWindowState.Minimized;}else if(c=="show"){tray.Visible=false;f.Show();f.WindowState=FormWindowState.Normal;}else if(c=="exit")f.Close();}));}}){IsBackground=true}.Start();};
 f.FormClosed+=(s,e)=>tray.Dispose();Application.Run(f);
}}`);
  await promisify(execFile)(compiler,['/nologo','/target:winexe','/r:System.Windows.Forms.dll','/r:System.Drawing.dll','/out:'+exe,source],{windowsHide:true});
  child=spawn(exe,[],{windowsHide:false,stdio:['pipe','ignore','ignore']});child.stdin.on('error',()=>{});
  const game={id:'g',title:'Roblox',kind:'game',installed:true,versions:[{source:'Roblox',executable:exe}]};
  const r=new RunningGames({games:()=>[game],configs:()=>({g:{executables:[exe]}}),emit:()=>{}});
  const state=async expected=>{const allowed=Array.isArray(expected)?expected:[expected],deadline=Date.now()+10000;while(Date.now()<deadline){await r.scan();const row=r.lastRows.find(p=>p.pid===child.pid);if(allowed.includes(row?.activity))return row;await new Promise(resolve=>setTimeout(resolve,100));}assert.fail('Window state did not reach '+allowed.join('/'));};
  await state(['background','foreground']);assert.ok(r.sessions.has('g'));
  child.stdin.write('minimize\n');await state('minimized');assert.ok(r.sessions.has('g'),'minimizing preserves the session');
  child.stdin.write('tray\n');await state('no-window');assert.equal(r.sessions.size,0,'the tray process is not an active game');assert.equal(child.exitCode,null,'ending the session does not kill Roblox');
  child.stdin.write('show\n');await state(['background','foreground']);assert.ok(r.sessions.has('g'),'the same process can start a new session');r.stop();
 }finally{if(child&&child.exitCode===null){child.kill();await new Promise(resolve=>child.once('exit',resolve));}await fs.rm(root,{recursive:true,force:true});}
});
