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
Write-Host 'Preparing whisper.cpp Windows x64 CPU engine.'
$release = Invoke-RestMethod 'https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest'
# Always compile a portable CPU binary. A prebuilt release passed --help on the
# GitHub runner but crashed with 0xC000001D during model initialization on the user PC.
$engineDir = Join-Path $temp 'whisper-engine'
New-Item -ItemType Directory -Force $engineDir | Out-Null
$source = Join-Path $temp 'whisper-src'
& git clone --depth 1 --branch $release.tag_name https://github.com/ggml-org/whisper.cpp.git $source
if ($LASTEXITCODE -ne 0) { throw 'whisper.cpp source checkout failed' }
$build = Join-Path $temp 'whisper-build'
& cmake -S $source -B $build -A x64 -DWHISPER_BUILD_TESTS=OFF -DWHISPER_BUILD_EXAMPLES=ON -DGGML_NATIVE=OFF -DGGML_AVX=OFF -DGGML_AVX2=OFF -DGGML_FMA=OFF -DGGML_F16C=OFF -DGGML_CUDA=OFF -DGGML_VULKAN=OFF
if ($LASTEXITCODE -ne 0) { throw 'Portable whisper.cpp CMake configuration failed' }
& cmake --build $build --config Release --target whisper-cli --parallel 2
if ($LASTEXITCODE -ne 0) { throw 'Portable whisper.cpp compilation failed' }
$found = Get-ChildItem $build -Recurse -File -Filter 'whisper-cli.exe' | Where-Object { $_.FullName -match 'Release' } | Select-Object -First 1
if (-not $found) { throw 'Compiled whisper-cli.exe not found' }
Copy-Item $found.FullName (Join-Path $engineDir 'whisper-cli.exe') -Force
Get-ChildItem $build -Recurse -File -Filter '*.dll' | Where-Object { $_.FullName -match 'Release' } | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $engineDir $_.Name) -Force
}
Write-Host 'Built portable CPU Whisper engine with AVX, AVX2, FMA, F16C and native tuning disabled.'
Copy-Item (Join-Path $engineDir '*') $dest -Force
# Verify the engine actually launches; this catches missing runtime DLLs.
& (Join-Path $dest 'whisper-cli.exe') --help 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Bundled whisper-cli.exe did not launch (exit $LASTEXITCODE). Check DLL dependencies." }
Write-Host "Whisper engine launch verified; bundled $(@(Get-ChildItem $dest -Filter '*.dll').Count) DLLs."
Write-Host 'Downloading English speech recognition model.'
Invoke-WebRequest 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin' -OutFile (Join-Path $dest 'ggml-base.en.bin')
# Exercise model initialization, not merely --help. A successful runner test does
# not prove compatibility with every user CPU, but detects missing DLLs and bad models.
$smokeAudio = Join-Path $temp 'whisper-smoke.wav'
& (Join-Path $dest 'ffmpeg.exe') -nostdin -y -f lavfi -i 'anullsrc=r=16000:cl=mono' -t 1 -c:a pcm_s16le $smokeAudio 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot generate Whisper smoke-test audio' }
& (Join-Path $dest 'whisper-cli.exe') -ng -m (Join-Path $dest 'ggml-base.en.bin') -f $smokeAudio -nt 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Whisper model initialization smoke test failed (exit $LASTEXITCODE)" }
Write-Host 'Whisper model initialization smoke test passed on build runner.'
foreach ($name in @('ffmpeg.exe','ffprobe.exe','whisper-cli.exe','ggml-base.en.bin')) {
  $file = Get-Item (Join-Path $dest $name) -ErrorAction Stop
  if ($file.Length -lt 100000) { throw "Downloaded component $name is unexpectedly small" }
  Write-Host "$name : $($file.Length) bytes"
}
