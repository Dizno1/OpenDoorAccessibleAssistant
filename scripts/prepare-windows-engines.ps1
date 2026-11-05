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
$assets = @($release.assets)
# Discover candidates by platform, architecture, and package type rather than exact filename.
# Try each candidate and inspect its contents; a filename alone is not proof of compatibility.
$candidates = @($assets | Where-Object {
  $n = $_.name.ToLowerInvariant()
  $windows = $n -match 'win(dows)?|mingw|msvc'
  $x64 = $n -match 'x64|x86[_-]?64|amd64'
  $bad = $n -match 'arm|aarch64|cuda|vulkan|openvino|sycl|metal'
  $archive = $n -match '\.(zip|7z)$'
  $windows -and $x64 -and -not $bad -and $archive
} | Sort-Object @{ Expression = { if ($_.name -match 'cpu') { 0 } else { 1 } } }, name)
$cli = $null
$engineDir = Join-Path $temp 'whisper-engine'
New-Item -ItemType Directory -Force $engineDir | Out-Null
foreach ($candidate in $candidates) {
  Write-Host "Inspecting release asset: $($candidate.name)"
  $archive = Join-Path $temp ('whisper-candidate-' + [guid]::NewGuid().ToString('N') + [IO.Path]::GetExtension($candidate.name))
  $extract = Join-Path $temp ('whisper-extract-' + [guid]::NewGuid().ToString('N'))
  try {
    Invoke-WebRequest $candidate.browser_download_url -OutFile $archive
    if ($archive.EndsWith('.zip')) {
      Expand-Archive $archive -DestinationPath $extract -Force
    } elseif (Get-Command 7z -ErrorAction SilentlyContinue) {
      & 7z x $archive "-o$extract" -y | Out-Null
      if ($LASTEXITCODE -ne 0) { throw '7z extraction failed' }
    } else { throw '7z archive support unavailable' }
    $found = Get-ChildItem $extract -Recurse -File -Filter 'whisper-cli.exe' | Select-Object -First 1
    if (-not $found) { Write-Host 'No whisper-cli.exe in candidate; trying next asset.'; continue }
    Copy-Item $found.FullName (Join-Path $engineDir 'whisper-cli.exe') -Force
    Get-ChildItem $extract -Recurse -File -Filter '*.dll' | ForEach-Object {
      Copy-Item $_.FullName (Join-Path $engineDir $_.Name) -Force
    }
    $cli = Join-Path $engineDir 'whisper-cli.exe'
    Write-Host "Selected whisper.cpp asset: $($candidate.name)"
    break
  } catch {
    Write-Warning "Cannot use $($candidate.name): $_"
  }
}
if (-not $cli) {
  Write-Host "No usable prebuilt whisper.cpp executable in $($release.tag_name). Building from source."
  # Pin source to the release tag discovered above; do not assume binary release names.
  $source = Join-Path $temp 'whisper-src'
  & git clone --depth 1 --branch $release.tag_name https://github.com/ggml-org/whisper.cpp.git $source
  if ($LASTEXITCODE -ne 0) { throw 'whisper.cpp source checkout failed' }
  $build = Join-Path $temp 'whisper-build'
  & cmake -S $source -B $build -A x64 -DCMAKE_BUILD_TYPE=Release -DWHISPER_BUILD_TESTS=OFF -DWHISPER_BUILD_EXAMPLES=ON -DGGML_CUDA=OFF -DGGML_VULKAN=OFF
  if ($LASTEXITCODE -ne 0) { throw 'whisper.cpp CMake configuration failed' }
  & cmake --build $build --config Release --target whisper-cli --parallel 2
  if ($LASTEXITCODE -ne 0) { throw 'whisper.cpp compilation failed' }
  $found = Get-ChildItem $build -Recurse -File -Filter 'whisper-cli.exe' | Where-Object { $_.FullName -match 'Release' } | Select-Object -First 1
  if (-not $found) { $found = Get-ChildItem $build -Recurse -File -Filter 'whisper-cli.exe' | Select-Object -First 1 }
  if (-not $found) { throw 'Compiled whisper-cli.exe not found' }
  Copy-Item $found.FullName (Join-Path $engineDir 'whisper-cli.exe') -Force
  Get-ChildItem $build -Recurse -File -Filter '*.dll' | Where-Object { $_.FullName -match 'Release' } | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $engineDir $_.Name) -Force
  }
  $cli = Join-Path $engineDir 'whisper-cli.exe'
}
Copy-Item (Join-Path $engineDir '*') $dest -Force
# Verify the engine actually launches; this catches missing runtime DLLs.
& (Join-Path $dest 'whisper-cli.exe') --help 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Bundled whisper-cli.exe did not launch (exit $LASTEXITCODE). Check DLL dependencies." }
Write-Host "Whisper engine launch verified; bundled $(@(Get-ChildItem $dest -Filter '*.dll').Count) DLLs."
Write-Host 'Downloading English speech recognition model.'
Invoke-WebRequest 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin' -OutFile (Join-Path $dest 'ggml-base.en.bin')
foreach ($name in @('ffmpeg.exe','ffprobe.exe','whisper-cli.exe','ggml-base.en.bin')) {
  $file = Get-Item (Join-Path $dest $name) -ErrorAction Stop
  if ($file.Length -lt 100000) { throw "Downloaded component $name is unexpectedly small" }
  Write-Host "$name : $($file.Length) bytes"
}
