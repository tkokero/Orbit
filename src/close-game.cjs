const {spawn}=require('node:child_process');
function validSession(s){return Boolean(s&&Number.isSafeInteger(s.pid)&&s.pid>0&&s.path&&Number.isFinite(Date.parse(s.started))&&require('./playtime.cjs').safeGameExe(s.path));}
function closeProcess(session,force=false){
 if(!validSession(session))throw Error('The game process could not be verified. Close it from the game or Task Manager.');
 return new Promise((resolve,reject)=>{
 const script=`
$ErrorActionPreference='Stop'
$request=ConvertFrom-Json ([Console]::In.ReadToEnd())
$p=Get-Process -Id ([int]$request.pid) -ErrorAction Stop
try {
  # Keep this process handle alive throughout the verified taskkill handoff.
  $verifiedHandle=$p.Handle
  if(-not $p.Path -or $p.Path -ine $request.path -or $p.StartTime.ToUniversalTime().Ticks -ne ([DateTime]::Parse($request.started).ToUniversalTime().Ticks)){
    throw 'The game process changed. Refresh and try again.'
  }
  if($request.force){
    $taskKill=Join-Path ([Environment]::GetFolderPath('Windows')) 'System32/taskkill.exe'
    try {
      $ErrorActionPreference='Continue'
      $taskResult=& $taskKill /PID ([string]$p.Id) /F 2>&1
      $taskCode=$LASTEXITCODE
    } finally { $ErrorActionPreference='Stop' }
    if($taskCode -ne 0 -and -not $p.HasExited){throw 'Windows could not end this game task. It may require administrator permissions.'}
    if(-not $p.WaitForExit(1500)){throw 'Windows has not finished ending the game task. Try again in a moment.'}
    'forced'
  } elseif($p.CloseMainWindow()) { if($p.WaitForExit(2000)) { 'closed' } else { 'requested' } } else { 'no-window' }
} finally { $p.Dispose() }
`;
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});let output='',error='';const timer=setTimeout(()=>{child.kill();reject(Error('The game did not respond to the close request.'));},8000);
 child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>error+=b);child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('close',code=>{clearTimeout(timer);code?reject(Error(error.slice(0,400)||'Could not close the game.')):resolve({status:output.trim()});});child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify({pid:session.pid,path:session.path,started:session.started,force:Boolean(force)}));
 });
}
module.exports={validSession,closeProcess};
