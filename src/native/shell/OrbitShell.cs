using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;

public class OrbitShell {
 [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
 struct Info { public IntPtr icon; public int index; public uint attributes; [MarshalAs(UnmanagedType.ByValTStr,SizeConst=260)] public string display; [MarshalAs(UnmanagedType.ByValTStr,SizeConst=80)] public string type; }
 [DllImport("shell32.dll",CharSet=CharSet.Unicode)] static extern IntPtr SHGetFileInfo(string path,uint attributes,ref Info info,uint size,uint flags);
 [DllImport("shell32.dll",CharSet=CharSet.Unicode)] static extern void SHUpdateImageW(string path,int index,uint flags,int imageIndex);
 [DllImport("shell32.dll",CharSet=CharSet.Unicode)] static extern void SHChangeNotify(int id,uint flags,[MarshalAs(UnmanagedType.LPWStr)]string item,IntPtr other);
 public class Change { public string path; public string oldIcon; public int oldIndex; }
 [STAThread]public static int Main() {
  try {
   var changes=new JavaScriptSerializer().Deserialize<List<Change>>(Console.In.ReadToEnd());
   if(changes==null||changes.Count>32)return 2;
   foreach(var item in changes) {
    if(!System.IO.Path.IsPathRooted(item.path)||!item.path.EndsWith(".lnk",StringComparison.OrdinalIgnoreCase))return 2;
    if(!String.IsNullOrEmpty(item.oldIcon)&&System.IO.File.Exists(item.oldIcon)) {
     var info=new Info();
     if(SHGetFileInfo(item.oldIcon,0,ref info,(uint)Marshal.SizeOf(typeof(Info)),0x4000)!=IntPtr.Zero) SHUpdateImageW(item.oldIcon,item.oldIndex,0,info.index);
    }
    SHChangeNotify(0x2000,0x1005,item.path,IntPtr.Zero);
   }
   Console.Write("{\"updated\":"+changes.Count+"}");return 0;
  } catch { return 1; }
 }
}
