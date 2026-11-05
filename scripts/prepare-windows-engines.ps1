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
# Upstream uses platform-specific names, such as whisper-bin-win-x64.zip.
# Prefer a stable CPU x64 package and report available assets if none matches.
$release = Invoke-RestMethod 'https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest'
$assets = @($release.assets)
$asset = $assets | Where-Object {
  $_.name -match '^whisper-bin-(win-)?x64\.zip$'
} | Select-Object -First 1
if (-not $asset) {
  $available = ($assets | ForEach-Object { $_.name }) -join ', '
  throw "No compatible Windows x64 CPU whisper.cpp asset in release $($release.tag_name). Available assets: $available"
}
Write-Host "Selected whisper.cpp $($release.tag_name) asset: $($asset.name)"
$wzip = Join-Path $temp 'whisper.zip'
Invoke-WebRequest $asset.browser_download_url -OutFile $wzip
Expand-Archive $wzip -DestinationPath (Join-Path $temp 'whisper') -Force
$cli = Get-ChildItem (Join-Path $temp 'whisper') -Recurse -Filter 'whisper-cli.exe' | Select-Object -First 1
if (-not $cli) { throw 'whisper-cli.exe missing from archive' }
Copy-Item $cli.FullName (Join-Path $dest 'whisper-cli.exe')
# whisper.cpp Windows binaries may depend on DLLs from the same release.
Get-ChildItem $cli.DirectoryName -Filter '*.dll' | ForEach-Object { Copy-Item $_.FullName (Join-Path $dest $_.Name) -Force }
# Verify the executable and its neighboring libraries were included before packaging.
Write-Host "Bundled whisper-cli.exe with $(@(Get-ChildItem $dest -Filter '*.dll').Count) DLL dependencies."
Write-Host 'Downloading English speech recognition model.'
Invoke-WebRequest 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin' -OutFile (Join-Path $dest 'ggml-base.en.bin')
foreach ($name in @('ffmpeg.exe','ffprobe.exe','whisper-cli.exe','ggml-base.en.bin')) {
  $file = Get-Item (Join-Path $dest $name) -ErrorAction Stop
  if ($file.Length -lt 100000) { throw "Downloaded component $name is unexpectedly small" }
  Write-Host "$name : $($file.Length) bytes"
}
