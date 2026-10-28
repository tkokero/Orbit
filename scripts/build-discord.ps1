param([Parameter(Mandatory=$true)][string]$SdkPath,[Parameter(Mandatory=$true)][string]$ZigPath)
$ErrorActionPreference='Stop'
$sourceRoot=Split-Path $PSScriptRoot -Parent
$nativeRoot=Join-Path $sourceRoot 'native/discord'
$destination=Join-Path $sourceRoot 'src/native/discord'
New-Item -ItemType Directory -Force $destination | Out-Null
& $ZigPath c++ -std=c++20 -O2 -target x86_64-windows-gnu -I (Join-Path $SdkPath 'include') (Join-Path $nativeRoot 'main.cpp') (Join-Path $SdkPath 'lib/release/discord_partner_sdk.lib') -lcrypt32 -o (Join-Path $destination 'orbit-discord.exe')
if($LASTEXITCODE -ne 0){throw 'Discord helper build failed'}
Copy-Item -LiteralPath (Join-Path $SdkPath 'bin/release/discord_partner_sdk.dll') -Destination $destination
Copy-Item -LiteralPath (Join-Path $SdkPath 'License-Notices.txt') -Destination (Join-Path $destination 'Discord-LICENSE-NOTICES.txt')
Copy-Item -LiteralPath (Join-Path $nativeRoot 'vendor/LICENSE-json') -Destination (Join-Path $destination 'JSON-LICENSE.txt')
'Native Discord helper built; no sign-in or authorization was opened.'
