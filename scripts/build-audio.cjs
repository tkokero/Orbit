const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const folder=path.resolve(__dirname,'../src/native/capture'),compiler=path.join(process.env.SystemRoot||'C:/Windows','Microsoft.NET/Framework64/v4.0.30319/csc.exe');
execFileSync(compiler,['/nologo','/optimize+','/platform:x64','/target:exe','/reference:System.Web.Extensions.dll','/out:'+path.join(folder,'OrbitAudio.exe'),path.join(folder,'Audio.cs')],{windowsHide:true,stdio:'inherit'});
fs.writeFileSync(path.join(folder,'BUILD.json'),JSON.stringify({architecture:'x64',sha256:Object.fromEntries(['Audio.cs','OrbitAudio.exe'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(folder,file))).digest('hex')]))},null,2)+'\n');
