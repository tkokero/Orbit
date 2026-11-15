// Windows Core Audio capture. Samples are streamed to the recorder, never written here.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace OrbitAudio {
 [ComImport,Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class EnumeratorClass {}
 [ComImport,Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Enumerator {
  void EnumAudioEndpoints(int flow,uint state,out Devices devices);void GetDefaultAudioEndpoint(int flow,int role,out Device device);void GetDevice([MarshalAs(UnmanagedType.LPWStr)] string id,out Device device);
 }
 [ComImport,Guid("0BD7A1BE-7A1A-44DB-8397-CC5392387B5E"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Devices {void GetCount(out uint count);void Item(uint index,out Device device);}
 [ComImport,Guid("D666063F-1587-4E43-81F1-B948E807363F"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Device {
  void Activate(ref Guid iid,uint context,IntPtr activation,[MarshalAs(UnmanagedType.IUnknown)] out object instance);void OpenPropertyStore(int access,out Properties properties);void GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);void GetState(out uint state);
 }
 [StructLayout(LayoutKind.Sequential)] struct PropertyKey {public Guid format;public uint id;}
 [StructLayout(LayoutKind.Explicit,Size=24)] struct Variant {[FieldOffset(0)] public ushort type;[FieldOffset(8)] public uint length;[FieldOffset(8)] public IntPtr text;[FieldOffset(16)] public IntPtr data;}
 [ComImport,Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Properties {void GetCount(out uint count);void GetAt(uint index,out PropertyKey key);void GetValue(ref PropertyKey key,out Variant value);}
 [StructLayout(LayoutKind.Sequential,Pack=2)] struct Wave {public ushort tag,channels;public uint rate,bytes;public ushort align,bits,extra;}
 [ComImport,Guid("1CB9AD4C-DBFA-4C32-B178-C2F568A703B2"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Client {
  void Initialize(int mode,uint flags,long duration,long periodicity,ref Wave format,IntPtr session);void GetBufferSize(out uint frames);void GetStreamLatency(out long latency);void GetCurrentPadding(out uint padding);[PreserveSig] int IsFormatSupported(int mode,ref Wave format,out IntPtr closest);void GetMixFormat(out IntPtr format);void GetDevicePeriod(out long normal,out long minimum);void Start();void Stop();void Reset();void SetEventHandle(IntPtr handle);void GetService(ref Guid iid,[MarshalAs(UnmanagedType.IUnknown)] out object service);
 }
 [ComImport,Guid("C8ADBD64-E71E-48A0-A4DE-185C395CD317"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Capture {
  void GetBuffer(out IntPtr data,out uint frames,out uint flags,out ulong position,out ulong clock);void ReleaseBuffer(uint frames);void GetNextPacketSize(out uint frames);
 }
 [ComImport,Guid("77AA99A0-1BD6-484F-8BC7-2C654C9A9B6F"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface SessionManager {
  void GetAudioSessionControl(IntPtr id,uint flags,out IntPtr control);void GetSimpleAudioVolume(IntPtr id,uint flags,out IntPtr volume);void GetSessionEnumerator(out Sessions sessions);
 }
 [ComImport,Guid("E2F5BB11-0570-40CA-ACDD-3AA01277DEE8"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface Sessions {void GetCount(out int count);void GetSession(int index,[MarshalAs(UnmanagedType.IUnknown)] out object control);}
 [ComImport,Guid("BFB7FF88-7239-4FC9-8FA2-07C950BE9C6D"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] interface SessionControl {
  void GetState(out int state);void GetDisplayName([MarshalAs(UnmanagedType.LPWStr)] out string name);void SetDisplayName([MarshalAs(UnmanagedType.LPWStr)] string name,IntPtr context);void GetIconPath([MarshalAs(UnmanagedType.LPWStr)] out string path);void SetIconPath([MarshalAs(UnmanagedType.LPWStr)] string path,IntPtr context);void GetGroupingParam(out Guid group);void SetGroupingParam(ref Guid group,IntPtr context);void RegisterAudioSessionNotification(IntPtr events);void UnregisterAudioSessionNotification(IntPtr events);void GetSessionIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string id);void GetSessionInstanceIdentifier([MarshalAs(UnmanagedType.LPWStr)] out string id);void GetProcessId(out uint pid);
 }
 [ComImport,Guid("72A22D78-CDE4-431D-B8CC-843A71199B6D"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] public interface Operation {void GetActivateResult(out int result,[MarshalAs(UnmanagedType.IUnknown)] out object instance);}
 [ComVisible(true),Guid("41D949AB-9862-444A-80F6-C261334DA5EB"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] public interface Completion {[PreserveSig] int ActivateCompleted(Operation operation);}
 [ComVisible(true),Guid("94EA2B94-E9CC-49E0-C0FF-EE64CA8F5B90"),InterfaceType(ComInterfaceType.InterfaceIsIUnknown)] public interface Agile {}
 [ComVisible(true),ClassInterface(ClassInterfaceType.None)] public class Activation : Completion,Agile {
  public readonly ManualResetEvent done=new ManualResetEvent(false);public object instance;public Exception error;
  public int ActivateCompleted(Operation operation){try{int hr;operation.GetActivateResult(out hr,out instance);Marshal.ThrowExceptionForHR(hr);}catch(Exception e){error=e;}finally{try{done.Set();}catch(ObjectDisposedException){}}return 0;}
 }
 // Device packets arrive in bursts and their clocks differ slightly. Keep a short
 // reservoir and interpolate continuously instead of padding every short packet.
 class PCMBuffer {
  readonly float[] samples=new float[96000];int read,write,count;double phase,rate=1;bool primed;float left,right;
  public void Clear(){read=write=count=0;primed=false;phase=0;rate=1;}
  public int Underruns,MaxQueued;public int Count {get{return count;}}
  public void Push(float[] values,int length,float gain){int frames=length/2;if(count+frames>samples.Length/2)throw new Exception("Audio capture fell behind. Recording stopped.");for(int i=0;i<length;i++){float value=values[i];samples[write]=float.IsNaN(value)||float.IsInfinity(value)?0:value*gain;write=(write+1)%samples.Length;}count+=frames;MaxQueued=Math.Max(MaxQueued,count);}
  public void Mix(float[] destination){
   if(!primed){if(count<2880)return;primed=true;rate=1;phase=0;}
   double desired=Math.Max(0.998,Math.Min(1.002,1+(count-2880)/480000.0));rate+=(desired-rate)*0.05;
   for(int i=0;i<destination.Length;i+=2){
    if(count<2){Underruns++;primed=false;phase=0;for(int j=i;j<destination.Length&&j<i+256;j+=2){float fade=1-(j-i)/256f;destination[j]+=left*fade;destination[j+1]+=right*fade;}return;}
    int next=(read+2)%samples.Length;left=(float)(samples[read]+(samples[next]-samples[read])*phase);right=(float)(samples[(read+1)%samples.Length]+(samples[(next+1)%samples.Length]-samples[(read+1)%samples.Length])*phase);destination[i]+=left;destination[i+1]+=right;
    phase+=rate;int consumed=(int)phase;phase-=consumed;read=(read+consumed*2)%samples.Length;count-=consumed;
   }
  }
 }
 interface IAudioInput : IDisposable {WaitHandle Signal {get;} void Pull();void Reset();void Mix(float[] destination);}
 // Reconnecting a source must never block the 20 ms recording clock.
 class AudioSlot : IDisposable {
  public readonly string Kind,Id;readonly Func<IAudioInput> connect;readonly Func<bool> current;IAudioInput input;Task<IAudioInput> pending;long retryAt,checkAt;volatile bool disposed;
  public bool Available {get{return input!=null;}}public WaitHandle Signal {get{return input==null?null:input.Signal;}}
  public AudioSlot(string kind,string id,Func<IAudioInput> factory,Func<bool> valid=null){Kind=kind;Id=id;connect=factory;current=valid;}
  public bool Update(long now){bool before=Available;if(disposed)return false;
   if(pending!=null&&pending.IsCompleted){var done=pending;pending=null;try{var opened=done.GetAwaiter().GetResult();try{opened.Reset();input=opened;}catch{opened.Dispose();throw;}}catch{retryAt=now+2000;}}
   if(input!=null&&current!=null&&now>=checkAt){checkAt=now+2000;if(!current()){input.Dispose();input=null;retryAt=now+2000;}}
   if(input!=null)try{input.Pull();}catch(COMException){input.Dispose();input=null;retryAt=now+2000;}
   if(input==null&&pending==null&&now>=retryAt)pending=Task.Run(connect);
   return before!=Available;
  }
  public void Mix(float[] destination){if(input!=null)input.Mix(destination);}
  public void WaitForTest(){if(pending!=null)try{pending.Wait(1000);}catch{}}
  public void Dispose(){disposed=true;if(input!=null){input.Dispose();input=null;}var task=pending;pending=null;if(task!=null)task.ContinueWith(t=>{if(t.Status==TaskStatus.RanToCompletion)t.Result.Dispose();else {var observed=t.Exception;}},TaskScheduler.Default);}
 }
 class Input : IAudioInput {
  Client client;Capture capture;readonly PCMBuffer queue=new PCMBuffer();readonly float gain;EventWaitHandle signal;float[] packet=new float[1920];
  public WaitHandle Signal {get{return signal;}}
  public Input(Client value,bool loopback,float volume,bool process){client=value;gain=volume;var format=new Wave{tag=3,channels=2,rate=48000,bytes=384000,align=8,bits=32};signal=new EventWaitHandle(false,EventResetMode.AutoReset);
   try{client.Initialize(0,0x88040000u|(loopback?0x20000u:0),process?0:2000000,0,ref format,IntPtr.Zero);client.SetEventHandle(signal.SafeWaitHandle.DangerousGetHandle());object service;var id=typeof(Capture).GUID;client.GetService(ref id,out service);capture=(Capture)service;client.Start();}catch{Dispose();throw;}
  }
  public void Pull(){uint next;capture.GetNextPacketSize(out next);while(next>0){IntPtr data;uint frames,flags;ulong position,clock;capture.GetBuffer(out data,out frames,out flags,out position,out clock);try{if(frames>48000)throw new Exception("Audio source returned an oversized packet.");int length=(int)frames*2;if(packet.Length<length)packet=new float[length];if((flags&2)==0)Marshal.Copy(data,packet,0,length);else Array.Clear(packet,0,length);queue.Push(packet,length,gain);}finally{capture.ReleaseBuffer(frames);}capture.GetNextPacketSize(out next);}}
  public void Reset(){Pull();queue.Clear();}
  public void Mix(float[] destination){queue.Mix(destination);}
  public void Dispose(){try{if(client!=null)client.Stop();}catch{}if(capture!=null)Marshal.ReleaseComObject(capture);if(client!=null)Marshal.ReleaseComObject(client);if(signal!=null)signal.Dispose();capture=null;client=null;}
 }
 class Program {
  static readonly JavaScriptSerializer Json=new JavaScriptSerializer{MaxJsonLength=32768};static volatile bool stopping;
  [DllImport("Mmdevapi.dll",CharSet=CharSet.Unicode)] static extern int ActivateAudioInterfaceAsync(string path,ref Guid iid,ref Variant parameters,Completion handler,out Operation operation);
  [DllImport("Ole32.dll")] static extern int PropVariantClear(ref Variant value);
  [DllImport("Kernel32.dll")] static extern IntPtr OpenProcess(uint access,bool inherit,int pid);
  [DllImport("Kernel32.dll",CharSet=CharSet.Unicode)] static extern bool QueryFullProcessImageName(IntPtr process,uint flags,StringBuilder path,ref int size);
  [DllImport("Kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
  static string ProcessPath(int pid){var handle=OpenProcess(0x1000,false,pid);if(handle==IntPtr.Zero)return "";try{var buffer=new StringBuilder(32768);int count=buffer.Capacity;return QueryFullProcessImageName(handle,0,buffer,ref count)?buffer.ToString():"";}finally{CloseHandle(handle);}}
  static string Name(Device device){Properties properties=null;Variant value=new Variant();try{device.OpenPropertyStore(0,out properties);var key=new PropertyKey{format=new Guid("A45C254E-DF1C-4EFD-8020-67D146A850E0"),id=14};properties.GetValue(ref key,out value);return value.type==31?Marshal.PtrToStringUni(value.text):"Audio device";}finally{PropVariantClear(ref value);if(properties!=null)Marshal.ReleaseComObject(properties);}}
  static Enumerator NewEnumerator(){return (Enumerator)new EnumeratorClass();}
  static List<object> Endpoints(int flow){var result=new List<object>();Enumerator e=NewEnumerator();Devices devices=null;try{e.EnumAudioEndpoints(flow,1,out devices);uint count;devices.GetCount(out count);for(uint i=0;i<count&&i<80;i++){Device d;devices.Item(i,out d);try{string id;d.GetId(out id);string name=Name(d);if(!String.IsNullOrWhiteSpace(id)&&!String.IsNullOrWhiteSpace(name))result.Add(new {id=id,name=name});}catch(COMException){}finally{Marshal.ReleaseComObject(d);}}}finally{if(devices!=null)Marshal.ReleaseComObject(devices);Marshal.ReleaseComObject(e);}return result;}
  static HashSet<int> AudioPids(){var result=new HashSet<int>();Enumerator e=NewEnumerator();Devices devices=null;try{e.EnumAudioEndpoints(0,1,out devices);uint count;devices.GetCount(out count);for(uint i=0;i<count&&i<80;i++){Device device=null;object manager=null;Sessions sessions=null;try{devices.Item(i,out device);var id=typeof(SessionManager).GUID;device.Activate(ref id,23,IntPtr.Zero,out manager);((SessionManager)manager).GetSessionEnumerator(out sessions);int n;sessions.GetCount(out n);for(int j=0;j<n&&j<256;j++){object control=null;try{sessions.GetSession(j,out control);var session=(SessionControl)control;int state;session.GetState(out state);uint pid;session.GetProcessId(out pid);if(state!=2&&pid>0)result.Add((int)pid);}catch{}finally{if(control!=null)Marshal.ReleaseComObject(control);}}}catch{}finally{if(sessions!=null)Marshal.ReleaseComObject(sessions);if(manager!=null)Marshal.ReleaseComObject(manager);if(device!=null)Marshal.ReleaseComObject(device);}}}finally{if(devices!=null)Marshal.ReleaseComObject(devices);Marshal.ReleaseComObject(e);}return result;}
  static List<object> Apps(){var result=new List<object>();var paths=new HashSet<string>(StringComparer.OrdinalIgnoreCase);var audio=AudioPids();int session,current;using(var own=Process.GetCurrentProcess()){session=own.SessionId;current=own.Id;}foreach(var p in Process.GetProcesses()){using(p){try{if(p.Id==current||p.SessionId!=session||p.MainWindowHandle==IntPtr.Zero&&!audio.Contains(p.Id))continue;string path=ProcessPath(p.Id);if(path.Length>0&&paths.Add(path))result.Add(new {id=path,name=System.IO.Path.GetFileNameWithoutExtension(path)});}catch{}}}return result;}
  static Client Endpoint(string id,bool microphone){Enumerator e=NewEnumerator();Device device=null;try{if(id=="default")e.GetDefaultAudioEndpoint(microphone?1:0,0,out device);else e.GetDevice(id,out device);object obj;var iid=typeof(Client).GUID;device.Activate(ref iid,23,IntPtr.Zero,out obj);return (Client)obj;}finally{if(device!=null)Marshal.ReleaseComObject(device);Marshal.ReleaseComObject(e);}}
  static Client ProcessClient(int pid){int build;using(var key=Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows NT\CurrentVersion")){if(!Int32.TryParse(Convert.ToString(key==null?null:key.GetValue("CurrentBuildNumber")),out build)||build<20348)throw new Exception("This Windows version does not support app audio. Choose an output device instead.");}var data=Marshal.AllocHGlobal(12);Operation operation=null;var callback=new Activation();try{Marshal.WriteInt32(data,0,1);Marshal.WriteInt32(data,4,pid);Marshal.WriteInt32(data,8,0);var parameters=new Variant{type=65,length=12,data=data};var iid=typeof(Client).GUID;Marshal.ThrowExceptionForHR(ActivateAudioInterfaceAsync("VAD\\Process_Loopback",ref iid,ref parameters,callback,out operation));if(!callback.done.WaitOne(7000))throw new Exception("Windows did not respond to the app-audio request.");if(callback.error!=null)throw callback.error;return (Client)callback.instance;}finally{if(operation!=null)Marshal.ReleaseComObject(operation);Marshal.FreeHGlobal(data);callback.done.Dispose();}}
  static int FindApp(string path){int selected=0;DateTime earliest=DateTime.MaxValue;int session=Process.GetCurrentProcess().SessionId;foreach(var process in Process.GetProcesses()){using(process){try{if(process.SessionId==session&&String.Equals(ProcessPath(process.Id),path,StringComparison.OrdinalIgnoreCase)&&process.StartTime<earliest){earliest=process.StartTime;selected=process.Id;}}catch{}}}if(selected==0)throw new Exception("A selected app is not running. Choose it again before recording.");return selected;}
  static void Write(Stream output,float[] samples){var bytes=new byte[samples.Length*4];float peak=1;foreach(float sample in samples)peak=Math.Max(peak,Math.Abs(sample));for(int i=0;i<samples.Length;i++)samples[i]/=peak;Buffer.BlockCopy(samples,0,bytes,0,bytes.Length);var size=BitConverter.GetBytes(bytes.Length);output.Write(size,0,4);output.Write(bytes,0,bytes.Length);output.Flush();}
  static object BufferTest(){
   var results=new List<object>();foreach(double speed in new double[]{0.9997,1.0003}){var queue=new PCMBuffer();var legacy=new Queue<float>();long generated=0;int legacyDrops=0;double energy=0,delta=0,previous=0;long measured=0;int[] jitter={0,12,4,18,0,8,20,2};
    for(int block=0;block<6000;block++){double time=block*20;long available=(long)(Math.Max(0,time-jitter[block%jitter.Length])*48*speed);int frames=(int)Math.Max(0,available-generated);var packet=new float[frames*2];for(int i=0;i<frames;i++){float value=(float)Math.Sin((generated+i)*2*Math.PI*880/48000)*0.2f;packet[i*2]=value;packet[i*2+1]=-value;legacy.Enqueue(value);}generated+=frames;queue.Push(packet,packet.Length,1);var mixed=new float[1920];queue.Mix(mixed);bool dropped=false;for(int i=0;i<960;i++){if(legacy.Count>0)legacy.Dequeue();else dropped=true;if(block>50){double value=mixed[i*2];energy+=value*value;if(measured>0)delta=Math.Max(delta,Math.Abs(value-previous));previous=value;measured++;if(Math.Abs(value+mixed[i*2+1])>0.000001)throw new Exception("Stereo audio order changed.");}}if(dropped&&block>50)legacyDrops++;}
    double rms=Math.Sqrt(energy/measured);if(queue.Underruns!=0||rms<0.139||rms>0.143||delta>0.024||speed<1&&legacyDrops==0)throw new Exception("Uneven packet delivery did not stay continuous: "+Json.Serialize(new {speed=speed,underruns=queue.Underruns,rms=rms,delta=delta,legacyDrops=legacyDrops,tail=queue.Count}));results.Add(new {clockRatio=speed,legacyDropoutBlocks=legacyDrops,underruns=queue.Underruns,rms=rms,maxAdjacentStep=delta,maxQueuedFrames=queue.MaxQueued,tailQueuedFrames=queue.Count});
   }return new {passed=true,syntheticOnly=true,microphoneOpened=false,deviceLoopbackOpened=false,cases=results};
  }
  class TestInput : IAudioInput {readonly Func<bool> present;public bool Closed;public TestInput(Func<bool> present){this.present=present;}public WaitHandle Signal {get{return null;}}public void Reset(){}public void Pull(){if(!present())throw new COMException("Fixture disconnected");}public void Mix(float[] data){for(int i=0;i<data.Length;i++)data[i]+=.125f;}public void Dispose(){Closed=true;}}
  class HotplugInput : IAudioInput {readonly Stopwatch clock;readonly Func<bool> present;readonly PCMBuffer queue=new PCMBuffer();readonly double frequency;readonly float gain;long generated;readonly double origin;
   public HotplugInput(Stopwatch clock,Func<bool> present,double frequency,float gain){this.clock=clock;this.present=present;this.frequency=frequency;this.gain=gain;origin=clock.Elapsed.TotalMilliseconds;}
   public WaitHandle Signal {get{return null;}}public void Reset(){}public void Dispose(){}
   public void Pull(){if(!present())throw new COMException("Synthetic source disconnected");long available=(long)((clock.Elapsed.TotalMilliseconds-origin)*48);int frames=(int)Math.Max(0,available-generated);var values=new float[frames*2];for(int i=0;i<frames;i++)values[i*2]=values[i*2+1]=(float)(Math.Sin((generated+i)*2*Math.PI*frequency/48000)*.2);generated+=frames;queue.Push(values,values.Length,gain);}
   public void Mix(float[] data){queue.Mix(data);}
  }
  static object HotplugTest(){bool present=false;int opens=0;var created=new List<TestInput>();var fixedInput=new TestInput(()=>true);var stable=new AudioSlot("output","selected-stable",()=>fixedInput);var missing=new AudioSlot("microphone","selected-mic",()=>{opens++;if(!present)throw new COMException("Fixture unavailable");var value=new TestInput(()=>present);created.Add(value);return value;});
   stable.Update(0);missing.Update(0);stable.WaitForTest();missing.WaitForTest();stable.Update(20);missing.Update(20);var mix=new float[1920];stable.Mix(mix);missing.Mix(mix);if(!stable.Available||missing.Available||mix[0]!=.125f)throw new Exception("Missing source blocked the selected available source.");
   present=true;missing.Update(1000);if(opens!=1)throw new Exception("Reconnect ignored its retry delay.");missing.Update(2020);missing.WaitForTest();missing.Update(2040);Array.Clear(mix,0,mix.Length);stable.Mix(mix);missing.Mix(mix);if(!missing.Available||mix[0]!=.25f)throw new Exception("Returning source did not resume.");
   present=false;missing.Update(2060);if(missing.Available||!created[0].Closed||!stable.Available)throw new Exception("Disconnected source was not released independently.");present=true;missing.Update(4060);missing.WaitForTest();missing.Update(4080);if(!missing.Available||opens!=3)throw new Exception("Repeated reconnect failed.");stable.Dispose();missing.Dispose();if(!fixedInput.Closed||!created[1].Closed)throw new Exception("Stop retained a source.");
   var absent=new AudioSlot("output","selected-missing",()=>{throw new COMException("Fixture absent");});absent.Update(0);absent.WaitForTest();absent.Update(20);Array.Clear(mix,0,mix.Length);absent.Mix(mix);if(Array.Exists(mix,n=>n!=0))throw new Exception("Missing sources used a fallback.");absent.Dispose();
   var late=new TestInput(()=>true);var gate=new ManualResetEvent(false);var opening=new AudioSlot("output","selected-pending",()=>{gate.WaitOne();return late;});opening.Update(0);opening.Dispose();gate.Set();for(int i=0;i<100&&!late.Closed;i++)Thread.Sleep(5);gate.Dispose();if(!late.Closed)throw new Exception("A pending reconnect survived Stop.");
   return new {passed=true,syntheticOnly=true,microphoneOpened=false,deviceLoopbackOpened=false,availableSourceContinues=true,missingSourceReturns=true,repeatedReconnect=true,allMissingSilent=true,noFallback=true,stoppedResourcesReleased=true};
  }
  [MTAThread] static int Main(string[] args){var inputs=new List<AudioSlot>();try{
   if(args.Length==1&&(args[0]=="--saved-cue"||args[0]=="--validate-cue")){using(var data=new MemoryStream()){using(var source=Console.OpenStandardInput()){var block=new byte[4096];int size;while((size=source.Read(block,0,block.Length))>0){if(data.Length+size>96044)throw new Exception("Sound cue is too large.");data.Write(block,0,size);}}var bytes=data.ToArray();if(bytes.Length<44||Encoding.ASCII.GetString(bytes,0,4)!="RIFF"||Encoding.ASCII.GetString(bytes,8,8)!="WAVEfmt "||BitConverter.ToInt32(bytes,16)!=16||BitConverter.ToInt16(bytes,20)!=1||BitConverter.ToInt16(bytes,22)!=1||BitConverter.ToInt32(bytes,24)!=48000||BitConverter.ToInt16(bytes,34)!=16||Encoding.ASCII.GetString(bytes,36,4)!="data"||BitConverter.ToInt32(bytes,40)!=bytes.Length-44)throw new Exception("Invalid sound cue.");if(args[0]=="--validate-cue")Console.WriteLine(Json.Serialize(new {passed=true,played=false,microphoneOpened=false,frames=(bytes.Length-44)/2}));else{data.Position=0;using(var player=new System.Media.SoundPlayer(data)){player.Load();player.PlaySync();}}}return 0;}
   if(args.Length==1&&args[0]=="--list"){Console.OutputEncoding=new UTF8Encoding(false);Console.WriteLine(Json.Serialize(new {outputs=Endpoints(0),microphones=Endpoints(1),apps=Apps()}));return 0;}
   if(args.Length==1&&args[0]=="--selftest"){var data=new float[1920];using(var output=Console.OpenStandardOutput()){for(int block=0;block<10;block++){for(int i=0;i<data.Length;i++)data[i]=(float)Math.Sin((block*960+i/2)*2*Math.PI*440/48000)*0.2f;Write(output,data);}}return 0;}
   if(args.Length==1&&args[0]=="--buffer-test"){Console.WriteLine(Json.Serialize(BufferTest()));return 0;}
   if(args.Length==1&&args[0]=="--hotplug-test"){Console.WriteLine(Json.Serialize(HotplugTest()));return 0;}
   if(args.Length==1&&args[0]=="--probe-process"){using(var input=new Input(ProcessClient(Process.GetCurrentProcess().Id),true,0,true)){Thread.Sleep(80);input.Pull();}Console.WriteLine("{\"passed\":true,\"scope\":\"helper process only\",\"microphoneOpened\":false,\"deviceLoopbackOpened\":false}");return 0;}
   if(args.Length!=1||(args[0]!="--capture"&&args[0]!="--capture-test"&&args[0]!="--capture-hotplug-test"))throw new Exception("Unknown audio command.");bool synthetic=args[0]!="--capture",hotplug=args[0]=="--capture-hotplug-test",simpleSynthetic=synthetic&&!hotplug;var hotplugClock=Stopwatch.StartNew();
   string line=Console.ReadLine();if(line==null||line.Length>16384)throw new Exception("Invalid audio selection.");var config=Json.Deserialize<Dictionary<string,object>>(line);var sources=new List<Dictionary<string,object>>();foreach(object entry in (IEnumerable)config["sources"])sources.Add((Dictionary<string,object>)entry);if(sources.Count==0||sources.Count>5)throw new Exception("Choose between one and five audio sources.");
   foreach(Dictionary<string,object> source in sources){string kind=(string)source["kind"],id=Convert.ToString(source["id"]);float gain=Math.Max(0,Math.Min(1,Convert.ToSingle(source["gain"])));if(kind!="app"&&kind!="game"&&kind!="output"&&kind!="microphone")throw new Exception("Unknown audio source.");if(simpleSynthetic)continue;if(hotplug){Func<bool> present=()=>{double t=hotplugClock.Elapsed.TotalSeconds;return !(t>=4&&t<6)&&(!(kind=="output"||kind=="app")||t>=2);};inputs.Add(new AudioSlot(kind,id,()=>{if(!present())throw new COMException("Synthetic source unavailable");return new HotplugInput(hotplugClock,present,kind=="microphone"?880:440,gain);}));continue;}DateTime? gameStarted=null;if(kind=="game"&&source.ContainsKey("started"))gameStarted=DateTime.Parse(Convert.ToString(source["started"]),null,System.Globalization.DateTimeStyles.RoundtripKind);int boundPid=0;DateTime boundStarted=DateTime.MinValue;
    inputs.Add(new AudioSlot(kind,id,()=>{if(kind=="app"){boundPid=FindApp(id);using(var process=Process.GetProcessById(boundPid))boundStarted=process.StartTime;return new Input(ProcessClient(boundPid),true,gain,true);}if(kind=="game"){int pid=Convert.ToInt32(id);using(var process=Process.GetProcessById(pid)){if(process.SessionId!=Process.GetCurrentProcess().SessionId||gameStarted.HasValue&&gameStarted.Value.ToUniversalTime()!=process.StartTime.ToUniversalTime())throw new Exception("The selected game process is unavailable.");gameStarted=process.StartTime;boundPid=pid;boundStarted=process.StartTime;}return new Input(ProcessClient(pid),true,gain,true);}return new Input(Endpoint(id,kind=="microphone"),kind=="output",gain,false);},()=>{if(kind!="game"&&kind!="app")return true;try{using(var process=Process.GetProcessById(boundPid))return !process.HasExited&&process.StartTime==boundStarted;}catch{return false;}}));}
   var watcher=new Thread(()=>{try{while(Console.ReadLine()!=null){}}finally{stopping=true;}});watcher.IsBackground=true;watcher.Start();var watch=Stopwatch.StartNew();double originMs=(DateTime.UtcNow-new DateTime(1970,1,1)).TotalMilliseconds;Console.Error.WriteLine(Json.Serialize(new {ready=true,sampleRate=48000,channels=2,originMs=originMs,latencyFrames=1920}));
   WaitHandle[] handles=new WaitHandle[0];string availability=null;var buffers=new List<PCMBuffer>();var generated=new long[sources.Count];if(simpleSynthetic)foreach(var source in sources)buffers.Add(new PCMBuffer());
   using(var output=Console.OpenStandardOutput()){long next=20;int[] jitter={0,12,4,18,0,8,20,2};while(!stopping){
    if(simpleSynthetic){for(int s=0;s<sources.Count;s++){var source=sources[s];double frequency=(string)source["kind"]=="microphone"?880:440,speed=frequency==880?1.0003:0.9997,time=watch.Elapsed.TotalMilliseconds;long available=(long)(Math.Max(0,time-jitter[(int)(time/20)%jitter.Length])*48*speed);int frames=(int)Math.Max(0,available-generated[s]);var values=new float[frames*2];for(int i=0;i<frames;i++)values[i*2]=values[i*2+1]=(float)(Math.Sin((generated[s]+i)*2*Math.PI*frequency/48000)*0.2);generated[s]+=frames;buffers[s].Push(values,values.Length,Convert.ToSingle(source["gain"]));}}
    else {bool changed=false;foreach(var input in inputs)changed|=input.Update(watch.ElapsedMilliseconds);if(changed||availability==null){var available=new List<int>();var missing=new List<int>();var signals=new List<WaitHandle>();for(int i=0;i<inputs.Count;i++){if(inputs[i].Available){available.Add(i);if(inputs[i].Signal!=null)signals.Add(inputs[i].Signal);}else missing.Add(i);}handles=signals.ToArray();string state=Json.Serialize(new {audioSources=new {available=available,missing=missing}});if(state!=availability){availability=state;Console.Error.WriteLine(state);}}}
    if(watch.ElapsedMilliseconds>=next){if(watch.ElapsedMilliseconds-next>1000)throw new Exception("The recorder cannot keep up with audio.");var mixed=new float[1920];if(simpleSynthetic)foreach(var buffer in buffers)buffer.Mix(mixed);else foreach(var input in inputs)input.Mix(mixed);Write(output,mixed);next+=20;}
    int delay=(int)Math.Max(0,Math.Min(20,next-watch.Elapsed.TotalMilliseconds));if(delay>0){if(handles.Length>0)WaitHandle.WaitAny(handles,delay);else Thread.Sleep(delay);}
   }}
   return 0;
  }catch(Exception error){string message=error.Message;var native=error as COMException;if(native!=null){uint code=unchecked((uint)native.ErrorCode);message=code==0x80070005?"Windows denied audio access. Check microphone privacy settings or choose another device.":code==0x88890004?"An audio device disconnected. Reconnect it or choose another source.":"Windows could not open a selected audio source. Close exclusive-mode audio apps or choose another source.";}Console.Error.WriteLine(Json.Serialize(new {error="Audio capture: "+message}));return 1;}finally{foreach(var input in inputs)input.Dispose();}}
 }
}
