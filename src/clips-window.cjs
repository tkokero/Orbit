const {spawn}=require('node:child_process');
// Bind a chosen window to its owner. A recycled HWND must not capture another app.
function windowIdentity(sourceId){
 const handle=/^window:(\d+):\d+$/.exec(sourceId||'')?.[1];
 if(!handle||handle==='0')return Promise.reject(Error('Choose an available game window.'));
 const script=`$ErrorActionPreference='Stop';Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class OrbitClipOwner{[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);[DllImport("user32.dll")]public static extern bool IsWindow(IntPtr h);}';$h=[IntPtr]::new([long]([Console]::In.ReadToEnd()));if(-not [OrbitClipOwner]::IsWindow($h)){throw 'Window closed'};$ownerId=[uint32]0;[void][OrbitClipOwner]::GetWindowThreadProcessId($h,[ref]$ownerId);$owner=Get-Process -Id $ownerId;@{pid=[int]$ownerId;started=$owner.StartTime.ToUniversalTime().ToString('o')}|ConvertTo-Json -Compress`;
 return new Promise((resolve,reject)=>{
  const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,shell:false,stdio:['pipe','pipe','ignore']});let output='',done=false;
  const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(value);};
  const timer=setTimeout(()=>{child.kill();finish(Error('Could not verify the selected window. Choose it again.'));},7000);
  child.on('error',e=>finish(e));child.stdout.on('data',b=>{output+=b;if(output.length>4096){child.kill();finish(Error('Invalid window response.'));}});
  child.on('close',code=>{try{if(code)throw Error();const value=JSON.parse(output);if(!Number.isSafeInteger(value.pid)||value.pid<=0||!Number.isFinite(Date.parse(value.started)))throw Error();finish(null,value);}catch{finish(Error('The selected window closed or could not be verified.'));}});
  child.stdin.on('error',()=>{});child.stdin.end(handle);
 });
}
function sameOwner(a,b){return Boolean(a&&b&&a.pid===b.pid&&Number.isFinite(Date.parse(a.started))&&Date.parse(a.started)===Date.parse(b.started));}
function gameSource(sessions,sources,currentId){
 const eligible=sessions.filter(s=>s.windowHandle&&s.activity!=='no-window'&&s.activity!=='minimized');
 const current=eligible.find(s=>s.id===currentId),ordered=current?[current,...eligible.filter(s=>s!==current)]:eligible.sort((a,b)=>Number(['foreground','fullscreen'].includes(b.activity))-Number(['foreground','fullscreen'].includes(a.activity)));
 for(const game of ordered){const source=sources.find(s=>s.id.startsWith('window:')&&s.id.split(':')[1]===String(game.windowHandle));if(source)return {game,source};}
 return null;
}
module.exports={windowIdentity,sameOwner,gameSource};
