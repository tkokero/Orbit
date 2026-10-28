$ErrorActionPreference='Stop'
$shellProject=Split-Path -Parent $PSScriptRoot
$shellCompiler=Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
& $shellCompiler /nologo /optimize+ /target:exe /reference:System.Web.Extensions.dll /out:"$shellProject\src\native\shell\orbit-shell.exe" "$shellProject\src\native\shell\OrbitShell.cs"
if($LASTEXITCODE -ne 0){throw 'Orbit shell helper compilation failed'}
