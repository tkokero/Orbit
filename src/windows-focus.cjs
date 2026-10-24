// Target only a process already verified by RunningGames; never inspect window titles.
const script=`$ErrorActionPreference='Stop'; $targetId=[int]([Console]::In.ReadToEnd());
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class OrbitFocus { [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h,int n); [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow(); [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid); public static uint ForegroundPid(){uint p;GetWindowThreadProcessId(GetForegroundWindow(),out p);return p;} }';
$p=Get-Process -Id $targetId; $h=$p.MainWindowHandle; if($h -eq 0){throw 'No game window is available.'};
[OrbitFocus]::ShowWindowAsync($h,9)|Out-Null;
if([OrbitFocus]::ForegroundPid() -ne $targetId){[OrbitFocus]::SetForegroundWindow($h)|Out-Null};
for($attempt=0;$attempt -lt 12 -and [OrbitFocus]::ForegroundPid() -ne $targetId;$attempt++){Start-Sleep -Milliseconds 50};
if([OrbitFocus]::ForegroundPid() -ne $targetId){try{Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::AppActivate($targetId)}catch{}};
for($attempt=0;$attempt -lt 12 -and [OrbitFocus]::ForegroundPid() -ne $targetId;$attempt++){Start-Sleep -Milliseconds 50};
if([OrbitFocus]::ForegroundPid() -ne $targetId){throw 'Windows did not allow focus. Use Switch to game or Alt+Tab.'}`;
module.exports={script};
