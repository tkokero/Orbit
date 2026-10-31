using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public partial class OrbitVR {
 [StructLayout(LayoutKind.Sequential)] struct Rect {public int left,top,right,bottom;}
 [StructLayout(LayoutKind.Sequential)] struct Point {public int x,y;}
 [StructLayout(LayoutKind.Sequential)] struct MouseInput {public int dx,dy;public uint data,flags,time;public UIntPtr extra;}
 [StructLayout(LayoutKind.Sequential)] struct KeyInput {public ushort key,scan;public uint flags,time;public UIntPtr extra;}
 [StructLayout(LayoutKind.Explicit)] struct InputUnion {[FieldOffset(0)]public MouseInput mouse;[FieldOffset(0)]public KeyInput key;}
 [StructLayout(LayoutKind.Sequential)] struct InputEvent {public uint type;public InputUnion input;}
 [DllImport("user32.dll")] static extern bool IsWindow(IntPtr w);
 [DllImport("user32.dll")] static extern bool IsIconic(IntPtr w);
 [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr w,out uint p);
 [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr w);
 [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(Point p);
 [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr w,uint flags);
 [DllImport("user32.dll")] static extern int GetSystemMetrics(int index);
 [DllImport("user32.dll")] static extern uint SendInput(uint count,InputEvent[] input,int size);
 [DllImport("user32.dll")] static extern bool SetProcessDpiAwarenessContext(IntPtr context);
 [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr w,int attr,out Rect rect,int size);
 static string WindowIdentity(IntPtr w){if(!IsWindow(w)||IsIconic(w))throw new Exception("That window is closed or minimized.");uint pid;GetWindowThreadProcessId(w,out pid);using(var p=Process.GetProcessById((int)pid))return pid+":"+p.StartTime.ToUniversalTime().Ticks;}
 static void SendEvents(InputEvent[] events){if(SendInput((uint)events.Length,events,Marshal.SizeOf(typeof(InputEvent)))!=events.Length)throw new Exception("Windows blocked input. Elevated windows cannot be controlled.");}
 static InputEvent Key(ushort code,bool up,bool unicode){return new InputEvent{type=1,input=new InputUnion{key=new KeyInput{key=unicode?(ushort)0:code,scan=unicode?code:(ushort)0,flags=(up?2u:0u)|(unicode?4u:0u)}}};}
 static object DesktopCommand(Dictionary<string,object> c){string type=Text(c,"type");if(type=="media"){string action=Text(c,"action");ushort code=action=="play-pause"?(ushort)0xB3:action=="next"?(ushort)0xB0:action=="previous"?(ushort)0xB1:(ushort)0;if(code==0)throw new Exception("Unknown media action.");if(!fixture)SendEvents(new[]{Key(code,false,false),Key(code,true,false)});return new{sent=true,fixture=fixture};}
  long raw;if(!long.TryParse(Text(c,"hwnd"),out raw)||raw<=0)throw new Exception("Choose a live window.");var w=new IntPtr(raw);string identity=fixture?"fixture:window":WindowIdentity(w);if(type=="window-identity")return new{identity=identity};if(Text(c,"identity")!=identity)throw new Exception("The selected window changed. Choose it again.");if(Text(c,"enabled").ToLower()!="true")throw new Exception("Window control is off.");string kind=Text(c,"event");if(!new List<string>{"move","click","scroll","text"}.Contains(kind))throw new Exception("Unsupported window input.");if(fixture)return new{sent=true,fixture=true};
  // Explicit user input only. Never redirect to a different or obscured window.
  if(GetAncestor(GetForegroundWindow(),2)!=GetAncestor(w,2)){if(kind=="move")return new{sent=false};SetForegroundWindow(w);if(GetAncestor(GetForegroundWindow(),2)!=GetAncestor(w,2))throw new Exception("Windows kept another app in front. Select the window on Desktop first.");}
  if(kind=="text"){string text=Text(c,"text");if(text.Length>128)throw new Exception("Text is too long.");var events=new List<InputEvent>();foreach(char ch in text){if(char.IsControl(ch))continue;events.Add(Key(ch,false,true));events.Add(Key(ch,true,true));}if(events.Count>0)SendEvents(events.ToArray());return new{sent=true};}
  try{SetProcessDpiAwarenessContext(new IntPtr(-4));}catch(EntryPointNotFoundException){}
  Rect r;if(DwmGetWindowAttribute(w,9,out r,Marshal.SizeOf(typeof(Rect)))!=0||r.right<=r.left||r.bottom<=r.top)throw new Exception("The window bounds are unavailable.");
  int x=r.left+(int)(Bound(c,"x",.5,0,1)*(r.right-r.left-1)),y=r.top+(int)(Bound(c,"y",.5,0,1)*(r.bottom-r.top-1));
  if(GetAncestor(WindowFromPoint(new Point{x=x,y=y}),2)!=GetAncestor(w,2)){if(kind=="move")return new{sent=false};throw new Exception("Another window covers that point. Input was not sent.");}
  int vx=GetSystemMetrics(76),vy=GetSystemMetrics(77),vw=GetSystemMetrics(78),vh=GetSystemMetrics(79);if(vw<2||vh<2)throw new Exception("Desktop coordinates unavailable.");
  var move=new InputEvent{type=0,input=new InputUnion{mouse=new MouseInput{dx=(int)((long)(x-vx)*65535/(vw-1)),dy=(int)((long)(y-vy)*65535/(vh-1)),flags=0xC001}}};
  if(kind=="move")SendEvents(new[]{move});else if(kind=="click")SendEvents(new[]{move,new InputEvent{input=new InputUnion{mouse=new MouseInput{flags=2}}},new InputEvent{input=new InputUnion{mouse=new MouseInput{flags=4}}}});
  else SendEvents(new[]{move,new InputEvent{input=new InputUnion{mouse=new MouseInput{flags=0x800,data=unchecked((uint)(int)-Bound(c,"delta",0,-640,640))}}}});
  return new{sent=true};
 }
}
