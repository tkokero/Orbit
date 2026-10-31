const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const folder=path.resolve(__dirname,'../src/native/vr'),compiler=path.join(process.env.SystemRoot||'C:/Windows','Microsoft.NET/Framework64/v4.0.30319/csc.exe');
if(process.platform!=='win32'||!fs.existsSync(compiler))throw Error('Building the VR helper requires the Windows .NET Framework compiler.');
fs.copyFileSync(path.join(folder,'../../assets/orbit.png'),path.join(folder,'orbit.png'));
const sources=['openvr_api.cs','OrbitVR.cs','Telemetry.cs','Panels.cs','Room.cs','Desktop.cs','Textures.cs','Watch.cs','Manipulation.cs'];
execFileSync(compiler,['/nologo','/optimize+','/platform:x64','/target:exe','/reference:System.Web.Extensions.dll','/reference:System.Drawing.dll','/out:'+path.join(folder,'OrbitVR.exe'),...sources.map(file=>path.join(folder,file))],{windowsHide:true,stdio:'inherit'});
const files=[...sources,'openvr_api.dll','OPENVR-LICENSE.txt','orbit.png','OrbitVR.exe'];
fs.writeFileSync(path.join(folder,'BUILD.json'),JSON.stringify({architecture:'x64',upstream:JSON.parse(fs.readFileSync(path.join(folder,'UPSTREAM.json'),'utf8')).revision,sha256:Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(folder,file))).digest('hex')]))},null,2)+'\n');
