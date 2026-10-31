using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Valve.VR;

// Stable D3D11 textures. SetOverlayRaw is an asynchronous image loader and can
// remove the old image while loading the next one; it is not a streaming API.
public partial class OrbitVR {
 [StructLayout(LayoutKind.Sequential)] struct TextureDesc {public uint width,height,mips,array,format,sampleCount,sampleQuality,usage,bind,cpu,misc;}
 [StructLayout(LayoutKind.Sequential)] struct MappedTexture {public IntPtr data;public uint rowPitch,depthPitch;}
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate int EnumAdapter(IntPtr self,uint index,out IntPtr adapter);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate int CreateTexture(IntPtr self,ref TextureDesc desc,IntPtr initial,out IntPtr texture);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate void UpdateTexture(IntPtr self,IntPtr resource,uint subresource,IntPtr box,IntPtr data,uint rowPitch,uint depthPitch);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate void CopyTexture(IntPtr self,IntPtr destination,IntPtr source);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate int MapTexture(IntPtr self,IntPtr resource,uint subresource,uint map,uint flags,out MappedTexture mapped);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate void UnmapTexture(IntPtr self,IntPtr resource,uint subresource);
 [UnmanagedFunctionPointer(CallingConvention.StdCall)] delegate void FlushContext(IntPtr self);
 [DllImport("dxgi.dll")] static extern int CreateDXGIFactory1(ref Guid id,out IntPtr factory);
 [DllImport("d3d11.dll")] static extern int D3D11CreateDevice(IntPtr adapter,uint driver,IntPtr software,uint flags,uint[] levels,uint count,uint version,out IntPtr device,out uint chosen,out IntPtr context);
 static T Com<T>(IntPtr instance,int slot){if(instance==IntPtr.Zero)throw new Exception("Graphics device unavailable.");return (T)(object)Marshal.GetDelegateForFunctionPointer(Marshal.ReadIntPtr(Marshal.ReadIntPtr(instance),slot*IntPtr.Size),typeof(T));}
 static void Hr(int hr,string action){if(hr<0)throw new Exception(action+" (0x"+hr.ToString("X8")+"). Update the graphics driver and SteamVR.");}
 static IntPtr graphicsDevice,graphicsContext;static UpdateTexture uploadTexture;static FlushContext flushGraphics;
 class Surface:IDisposable {
  public int width,height,index;public readonly IntPtr[] textures=new IntPtr[2];public IntPtr buffer;public byte[] last;public int uploads;
  public Surface(int w,int h){width=w;height=h;var desc=new TextureDesc{width=(uint)w,height=(uint)h,mips=1,array=1,format=87,sampleCount=1,usage=0,bind=8};try{for(int i=0;i<2;i++)Hr(Com<CreateTexture>(graphicsDevice,5)(graphicsDevice,ref desc,IntPtr.Zero,out textures[i]),"Could not create an Orbit texture");buffer=Marshal.AllocHGlobal(w*h*4);}catch{Dispose();throw;}}
  public bool Stage(byte[] bytes){if(bytes.Length!=width*height*4)throw new Exception("Wrong texture size.");if(last!=null&&EqualPixels(last,bytes))return false;index=(index+1)%2;Marshal.Copy(bytes,0,buffer,bytes.Length);uploadTexture(graphicsContext,textures[index],0,IntPtr.Zero,buffer,(uint)(width*4),0);flushGraphics(graphicsContext);last=bytes;uploads++;return true;}
  public void Dispose(){for(int i=0;i<2;i++)if(textures[i]!=IntPtr.Zero){Marshal.Release(textures[i]);textures[i]=IntPtr.Zero;}if(buffer!=IntPtr.Zero){Marshal.FreeHGlobal(buffer);buffer=IntPtr.Zero;}last=null;}
 }
 static bool EqualPixels(byte[] a,byte[] b){if(a.Length!=b.Length)return false;for(int i=0;i<a.Length;i++)if(a[i]!=b[i])return false;return true;}
 static readonly Dictionary<ulong,Surface> surfaces=new Dictionary<ulong,Surface>();
 static void InitGraphics(bool test){IntPtr factory=IntPtr.Zero,adapter=IntPtr.Zero;try{if(!test){int index=-1;system.GetDXGIOutputInfo(ref index);if(index<0)throw new Exception("SteamVR did not identify its graphics adapter.");var iid=new Guid("770aae78-f26f-4dba-a829-253c83d1b387");Hr(CreateDXGIFactory1(ref iid,out factory),"Could not open DXGI");Hr(Com<EnumAdapter>(factory,12)(factory,(uint)index,out adapter),"Could not select SteamVR's graphics adapter");}uint chosen;var levels=new uint[]{0xb000,0xa100,0xa000};Hr(D3D11CreateDevice(adapter,test?5u:0u,IntPtr.Zero,0x20,levels,(uint)levels.Length,7,out graphicsDevice,out chosen,out graphicsContext),"Could not create the Orbit graphics device");uploadTexture=Com<UpdateTexture>(graphicsContext,48);flushGraphics=Com<FlushContext>(graphicsContext,111);}finally{if(adapter!=IntPtr.Zero)Marshal.Release(adapter);if(factory!=IntPtr.Zero)Marshal.Release(factory);}}
 static void SubmitTexture(ulong handle,byte[] bgra,int width,int height,bool premultiplied){if(handle==0)return;Surface surface;if(!surfaces.TryGetValue(handle,out surface)){surface=new Surface(width,height);surfaces.Add(handle,surface);}if(surface.width!=width||surface.height!=height)throw new Exception("An overlay changed texture dimensions unexpectedly.");if(!surface.Stage(bgra))return;Check(OpenVR.Overlay.SetOverlayFlag(handle,VROverlayFlags.IsPremultiplied,premultiplied));var texture=new Texture_t{handle=surface.textures[surface.index],eType=ETextureType.DirectX,eColorSpace=EColorSpace.Gamma};Check(OpenVR.Overlay.SetOverlayTexture(handle,ref texture));}
 static void ReleaseSurface(ulong handle){Surface surface;if(surfaces.TryGetValue(handle,out surface)){surfaces.Remove(handle);surface.Dispose();}}
 static void CloseGraphics(){foreach(var s in surfaces.Values)s.Dispose();surfaces.Clear();if(graphicsContext!=IntPtr.Zero){Marshal.Release(graphicsContext);graphicsContext=IntPtr.Zero;}if(graphicsDevice!=IntPtr.Zero){Marshal.Release(graphicsDevice);graphicsDevice=IntPtr.Zero;}}
 static void GraphicsTest(){try{InitGraphics(true);using(var surface=new Surface(32,16)){var first=new byte[32*16*4];for(int i=0;i<first.Length;i++)first[i]=(byte)(i%251);if(!surface.Stage(first)||surface.Stage((byte[])first.Clone()))throw new Exception("Duplicate texture upload was not suppressed.");var desc=new TextureDesc{width=32,height=16,mips=1,array=1,format=87,sampleCount=1,usage=3,cpu=0x20000};IntPtr readback;Hr(Com<CreateTexture>(graphicsDevice,5)(graphicsDevice,ref desc,IntPtr.Zero,out readback),"Readback allocation failed");try{var copy=Com<CopyTexture>(graphicsContext,47);var map=Com<MapTexture>(graphicsContext,14);var unmap=Com<UnmapTexture>(graphicsContext,15);for(int frame=0;frame<8;frame++){var bytes=(byte[])first.Clone();bytes[0]=(byte)(frame+10);surface.Stage(bytes);copy(graphicsContext,readback,surface.textures[surface.index]);MappedTexture data;Hr(map(graphicsContext,readback,0,1,0,out data),"Texture readback failed");try{var row=new byte[32*4];for(int y=0;y<16;y++){Marshal.Copy(IntPtr.Add(data.data,(int)data.rowPitch*y),row,0,row.Length);for(int x=0;x<row.Length;x++)if(row[x]!=bytes[y*row.Length+x])throw new Exception("GPU texture pixels changed.");}}finally{unmap(graphicsContext,readback,0);}}}finally{Marshal.Release(readback);}}Emit(new{type="graphics-selftest",passed=true,warp=true,frames=8,nativeRuntime=false,nativeWindows=false});}finally{CloseGraphics();}}
}
