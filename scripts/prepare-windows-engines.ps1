$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$dest = Join-Path $PSScriptRoot '..\src-tauri\resources\engines'
New-Item -ItemType Directory -Force $dest | Out-Null
$temp = Join-Path $env:RUNNER_TEMP 'odaa-engine-downloads'
New-Item -ItemType Directory -Force $temp | Out-Null
Write-Host 'Downloading FFmpeg and FFprobe for bundling.'
$ffzip = Join-Path $temp 'ffmpeg.zip'
Invoke-WebRequest 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile $ffzip
Expand-Archive $ffzip -DestinationPath (Join-Path $temp 'ffmpeg') -Force
foreach ($name in @('ffmpeg.exe','ffprobe.exe')) {
  $found = Get-ChildItem (Join-Path $temp 'ffmpeg') -Recurse -Filter $name | Select-Object -First 1
  if (-not $found) { throw "Missing $name from FFmpeg archive" }
  Copy-Item $found.FullName (Join-Path $dest $name)
}
Write-Host 'Downloading whisper.cpp Windows executable.'
$release = Invoke-RestMethod 'https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest'
$asset = $release.assets | Where-Object { $_.name -match '^whisper-bin-x64\.zip$' } | Select-Object -First 1
if (-not $asset) { throw 'whisper.cpp release has no whisper-bin-x64.zip; check upstream asset names before changing this script.' }
$wzip = Join-Path $temp 'whisper.zip'
Invoke-WebRequest $asset.browser_download_url -OutFile $wzip
Expand-Archive $wzip -DestinationPath (Join-Path $temp 'whisper') -Force
$cli = Get-ChildItem (Join-Path $temp 'whisper') -Recurse -Filter 'whisper-cli.exe' | Select-Object -First 1
if (-not $cli) { throw 'whisper-cli.exe missing from archive' }
Copy-Item $cli.FullName (Join-Path $dest 'whisper-cli.exe')
# whisper.cpp Windows binaries may depend on DLLs from the same release.
Get-ChildItem $cli.DirectoryName -Filter '*.dll' | ForEach-Object { Copy-Item $_.FullName (Join-Path $dest $_.Name) }
Write-Host 'Downloading English speech recognition model.'
Invoke-WebRequest 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin' -OutFile (Join-Path $dest 'ggml-base.en.bin')
foreach ($name in @('ffmpeg.exe','ffprobe.exe','whisper-cli.exe','ggml-base.en.bin')) {
  $file = Get-Item (Join-Path $dest $name) -ErrorAction Stop
  if ($file.Length -lt 100000) { throw "Downloaded component $name is unexpectedly small" }
  Write-Host "$name : $($file.Length) bytes"
}
