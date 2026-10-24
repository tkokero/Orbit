// Read window state only for requested game PIDs; never collect window titles.
const windowType=`using System;
using System.Runtime.InteropServices;
public class OrbitGameWindow {
 [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left,Top,Right,Bottom; }
 [StructLayout(LayoutKind.Sequential)] public struct MonitorInfo { public int Size; public Rect Monitor,Work; public uint Flags; }
 public delegate bool EnumProc(IntPtr h,IntPtr p);
 [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb,IntPtr p);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
 [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h,out Rect r);
 [DllImport("user32.dll")] static extern IntPtr MonitorFromWindow(IntPtr h,uint flags);
 [DllImport("user32.dll")] static extern bool GetMonitorInfo(IntPtr h,ref MonitorInfo m);
 public static string State(uint target) {
  IntPtr foreground=GetForegroundWindow(),chosen=IntPtr.Zero;
  EnumWindows(delegate(IntPtr h,IntPtr p){uint pid;GetWindowThreadProcessId(h,out pid);if(pid==target&&IsWindowVisible(h)){if(chosen==IntPtr.Zero||h==foreground)chosen=h;}return true;},IntPtr.Zero);
  if(chosen==IntPtr.Zero)return "no-window";
  if(IsIconic(chosen))return "minimized";
  if(chosen!=foreground)return "background";
  Rect r;MonitorInfo m=new MonitorInfo();m.Size=Marshal.SizeOf(typeof(MonitorInfo));
  if(GetWindowRect(chosen,out r)&&GetMonitorInfo(MonitorFromWindow(chosen,2),ref m)&&Math.Abs(r.Left-m.Monitor.Left)<=2&&Math.Abs(r.Top-m.Monitor.Top)<=2&&Math.Abs(r.Right-m.Monitor.Right)<=2&&Math.Abs(r.Bottom-m.Monitor.Bottom)<=2)return "fullscreen";
  return "foreground";
 }
}`;
const processScript=`[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new(); $ErrorActionPreference='SilentlyContinue'; $names=ConvertFrom-Json -InputObject ([Console]::In.ReadToEnd()); $processes=@(Get-Process -Name $names -ErrorAction SilentlyContinue); $parents=@{}; if($names -contains 'RobloxCrashHandler'){try{Get-CimInstance Win32_Process -Filter \"Name='RobloxCrashHandler.exe'\" -ErrorAction Stop | ForEach-Object {$parents[[int]$_.ProcessId]=[int]$_.ParentProcessId}}catch{}}; $windowReady=$false; if($processes.Count){try{Add-Type -TypeDefinition '${windowType}' -ErrorAction Stop; $windowReady=$true}catch{}}; $rows=@($processes | ForEach-Object { $p=$_; $exe=$null; $started=$null; $activity='running'; try{$exe=$p.Path}catch{}; try{$started=$p.StartTime.ToUniversalTime().ToString('o')}catch{}; if($windowReady){try{$activity=[OrbitGameWindow]::State([uint32]$p.Id)}catch{}}; [pscustomobject]@{pid=$p.Id;name=$p.ProcessName;path=$exe;started=$started;activity=$activity;parentPid=$parents[[int]$p.Id]} }); ConvertTo-Json -InputObject $rows -Compress`;
module.exports={processScript};
