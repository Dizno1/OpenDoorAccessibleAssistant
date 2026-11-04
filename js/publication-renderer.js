(function () {
  async function render(sourceFile, artifacts, options, signal, onProgress) {
    if (!(sourceFile instanceof File)) throw new Error('Publication rendering requires the original local video file.');
    const captions = findArtifact(artifacts, (item) => item.mimeType === 'text/vtt' || /captions\.vtt$/i.test(item.name));
    const describedAudio = findArtifact(artifacts, (item) => item.mimeType === 'audio/wav' || /described-audio\.wav$/i.test(item.name));
    const transcript = findArtifact(artifacts, (item) => item.mimeType === 'text/plain' && /transcript/i.test(item.name) && !/review/i.test(item.name));
    if (!captions || !captions.content) throw new Error('Create and review WebVTT captions before rendering the publication export.');
    if (!describedAudio || !describedAudio.url) throw new Error('Create the described-audio mix before rendering the publication export.');

    if (window.LocalProduction) {
      try {
        const health = await window.LocalProduction.checkHealth();
        if (health.helperRunning && health.ffmpeg && health.ffmpeg.found) {
          if (onProgress) onProgress({ progress: 10, message: 'Rendering locally with FFmpeg.' });
          const describedAudioBlob = await (await fetch(describedAudio.url)).blob();
          const result = await window.LocalProduction.renderAccessibleVideo({
            videoFile: sourceFile,
            describedAudioBlob,
            captionsText: captions.content,
            keepOriginalAudio: true,
            outputName: `${safeBase(sourceFile.name)}-accessible`,
            onProgress: (update) => { if (onProgress) onProgress({ progress: 60, message: update.message || 'Rendering.' }); }
          });
          if (onProgress) onProgress({ progress: 95, message: 'Downloading the rendered video from the local production helper.' });
          const videoResponse = await fetch(result.downloadUrl);
          const videoBlob = await videoResponse.blob();
          if (!videoBlob.size) throw new Error('The local production helper did not return a usable video file.');
          return buildOutputs(sourceFile, videoBlob, captions.content, transcript && transcript.content ? transcript.content : '', options, 'mp4');
        }
      } catch (error) {
        // Local rendering is a preferred path, not the only path. Fall through to the existing
        // browser-only rendering below rather than failing the whole workflow.
        if (onProgress) onProgress({ progress: 10, message: `Local rendering was not used (${error.message}). Trying browser-based rendering instead.` });
      }
    }

    if (!window.MediaRecorder) throw new Error('This browser does not support local video rendering with MediaRecorder.');

    const mimeType = chooseMimeType();
    if (!mimeType) throw new Error('This browser cannot create a WebM publication video.');
    const video = document.createElement('video');
    const audio = document.createElement('audio');
    const sourceUrl = URL.createObjectURL(sourceFile);
    video.src = sourceUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    audio.src = describedAudio.url;
    audio.preload = 'auto';

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('This browser does not support the audio routing required for publication rendering.');
    const context = new AudioContextClass();
    let sourceNode;
    let destination;
    try {
      await Promise.all([waitForMedia(video), waitForMedia(audio)]);
      checkCancelled(signal);
      const capture = video.captureStream ? video.captureStream() : video.mozCaptureStream ? video.mozCaptureStream() : null;
      if (!capture || !capture.getVideoTracks().length) throw new Error('This browser cannot capture the source video picture for local rendering.');
      sourceNode = context.createMediaElementSource(audio);
      destination = context.createMediaStreamDestination();
      sourceNode.connect(destination);
      sourceNode.connect(context.destination);
      const stream = new MediaStream([...capture.getVideoTracks(), ...destination.stream.getAudioTracks()]);
      const chunks = [];
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: Number(options.videoBitrate) || 4000000,
        audioBitsPerSecond: Number(options.audioBitrate) || 128000
      });
      const completed = new Promise((resolve, reject) => {
        recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
        recorder.onerror = () => reject(recorder.error || new Error('The browser stopped publication rendering.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });
      const cancel = () => {
        video.pause(); audio.pause();
        if (recorder.state !== 'inactive') recorder.stop();
      };
      if (signal) signal.addEventListener('abort', cancel, { once: true });
      recorder.start(1000);
      try {
        await context.resume();
        video.currentTime = 0; audio.currentTime = 0;
        if (onProgress) onProgress({ progress: 10, message: 'Started local accessible-video rendering.' });
        await Promise.all([video.play(), audio.play()]);
      } catch (error) {
        console.error('[render] playback/audio-context setup failed:', error);
        if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
          const activationError = new Error('Final browser rendering requires one activation.');
          activationError.needsUserActivation = true;
          throw activationError;
        }
        throw error;
      }
      await monitor(video, recorder, signal, onProgress);
      audio.pause();
      if (recorder.state !== 'inactive') recorder.stop();
      const videoBlob = await completed;
      if (signal) signal.removeEventListener('abort', cancel);
      checkCancelled(signal);
      if (!videoBlob.size) throw new Error('The browser did not create a publication video file.');
      if (onProgress) onProgress({ progress: 90, message: 'Building the publication package with selectable captions.' });
      return buildOutputs(sourceFile, videoBlob, captions.content, transcript && transcript.content ? transcript.content : '', options);
    } finally {
      video.pause(); audio.pause();
      URL.revokeObjectURL(sourceUrl);
      if (sourceNode) sourceNode.disconnect();
      if (context.close) context.close();
    }
  }

  async function buildOutputs(sourceFile, videoBlob, captionsText, transcriptText, options, extension) {
    const sourceName = sourceFile.name;
    const base = safeBase(sourceName);
    const sourceExtension = sourceName.includes('.') ? sourceName.split('.').pop().toLowerCase() : 'mp4';
    const originalName = `${base}-original.${sourceExtension}`;
    const videoName = `${base}-audio-described.${extension || 'webm'}`;
    const captionsName = `${base}-captions.vtt`;
    const transcriptName = transcriptText ? `${base}-transcript.txt` : '';
    const playerName = 'index.html';
    const manifestName = 'publication-manifest.json';
    const validationName = 'publication-validation.txt';
    const player = playerHtml(sourceName, originalName, sourceFile.type, videoName, captionsName, transcriptName, transcriptText, options);
    const manifest = JSON.stringify({
      packageVersion: 2,
      createdAt: new Date().toISOString(),
      sourceName,
      preset: options.preset || 'web-standard',
      originalVideo: originalName,
      audioDescribedVideo: videoName,
      captions: captionsName,
      transcript: transcriptName || null,
      player: playerName,
      captionLanguage: options.language || 'en',
      captionLabel: options.captionLabel || 'English',
      describedAudioIncluded: true,
      captionsSelectable: true,
      accessiblePlayerControls: true,
      validation: validationName
    }, null, 2);
    const validation = [
      `Publication export for ${sourceName}`,
      '',
      'Validation status: Ready for human playback review',
      'Original video: Included for the standard playback option',
      'Audio-described video: Included as a selectable playback option',
      'Captions: Included as a selectable WebVTT track',
      `Transcript: ${transcriptText ? 'Included in the player and as a text file' : 'Not available in this export'}`,
      `Caption language: ${options.language || 'en'}`,
      'Player controls: Play or pause, seek, volume, mute, captions, audio description, and transcript',
      '',
      'Required final check: Open index.html through a web server, test every control with keyboard and a screen reader, play both video versions, enable captions, verify synchronization, and confirm narration placement before publication.',
      ''
    ].join('\n');

    const [sourceBytes, videoBytes] = await Promise.all([sourceFile.arrayBuffer(), videoBlob.arrayBuffer()]);
    const encoder = new TextEncoder();
    const entries = [
      { name: originalName, data: new Uint8Array(sourceBytes) },
      { name: videoName, data: new Uint8Array(videoBytes) },
      { name: captionsName, data: encoder.encode(captionsText) },
      { name: playerName, data: encoder.encode(player) },
      { name: manifestName, data: encoder.encode(manifest) },
      { name: validationName, data: encoder.encode(validation) }
    ];
    if (transcriptText) entries.splice(3, 0, { name: transcriptName, data: encoder.encode(transcriptText) });
    const zipBytes = window.ZipBuilder.create(entries);
    const zipBlob = new Blob([zipBytes], { type: 'application/zip' });
    const isMp4 = /\.mp4$/i.test(videoName);
    const producedBy = isMp4 ? 'Locally rendered with FFmpeg' : 'A locally rendered WebM';
    return [
      { name: videoName, type: 'Accessible publication video', mimeType: videoBlob.type || (isMp4 ? 'video/mp4' : 'video/webm'), description: `${producedBy} containing the original picture and approved described-audio soundtrack${isMp4 ? ', with the original audio retained' : ''}.`, url: URL.createObjectURL(videoBlob), size: videoBlob.size },
      { name: `${base}-publication.zip`, type: 'Publication-ready accessible video package', mimeType: 'application/zip', description: 'A portable package containing standard and audio-described video versions, selectable WebVTT captions, an accessible HTML player, an optional transcript, a manifest, and a validation checklist.', url: URL.createObjectURL(zipBlob), size: zipBlob.size },
      { name: validationName, type: 'Publication validation checklist', mimeType: 'text/plain', description: 'A readable final playback, controls, caption, transcript, and audio-description verification checklist.', content: validation }
    ];
  }

  function playerHtml(sourceName, originalName, originalType, describedName, captionsName, transcriptName, transcriptText, options) {
    const title = escapeHtml(options.title || `Accessible video: ${sourceName}`);
    const language = escapeHtml(options.language || 'en');
    const captionLabel = escapeHtml(options.captionLabel || 'English');
    const defaultType = escapeHtml(originalType || (/\.webm$/i.test(originalName) ? 'video/webm' : 'video/mp4'));
    const describedType = /\.mp4$/i.test(describedName) ? 'video/mp4' : 'video/webm';
    const transcriptMarkup = transcriptText
      ? `<div id="transcript-panel" class="transcript" hidden><div class="transcript-heading"><h2>Transcript</h2><button type="button" id="close-transcript">Close transcript</button></div><pre>${escapeHtml(transcriptText)}</pre><p><a href="${encodeURI(transcriptName)}" download>Download transcript</a></p></div>`
      : '';
    return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{font-family:Arial,sans-serif;line-height:1.5;color:#111;background:#f5f5f5}*{box-sizing:border-box}body{margin:0;padding:1rem}.player{max-width:70rem;margin:0 auto}.video-wrap{background:#000;border-radius:.75rem;overflow:hidden}video{display:block;width:100%;height:auto;background:#000}.controls{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;padding:1rem;background:#111;color:#fff}.controls button,.controls input{font:inherit}.controls button{min-height:2.75rem;padding:.55rem .8rem;border:2px solid #fff;border-radius:.4rem;background:#111;color:#fff;cursor:pointer}.controls button[aria-pressed="true"]{background:#fff;color:#111}.controls button:focus-visible,.controls input:focus-visible,a:focus-visible{outline:4px solid #f5c400;outline-offset:3px}.time{min-width:7.5rem}.seek{flex:1 1 18rem}.volume{width:8rem}.transcript{margin-top:1rem;padding:1rem;border:2px solid #111;border-radius:.5rem;background:#fff}.transcript-heading{display:flex;justify-content:space-between;gap:1rem;align-items:center}.transcript h2{margin:0}.transcript pre{white-space:pre-wrap;font:inherit}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.help{margin-top:1rem}
</style>
</head>
<body>
<main class="player">
<h1>${title}</h1>
<div class="video-wrap">
<video id="video" preload="metadata" playsinline aria-label="${title}">
<source id="video-source" src="${encodeURI(originalName)}" type="${defaultType}">
<track id="caption-track" kind="captions" src="${encodeURI(captionsName)}" srclang="${language}" label="${captionLabel}">
<p>Your browser does not support HTML video. Download the video files and captions from this package.</p>
</video>
<div class="controls" role="group" aria-label="Media controls">
<button type="button" id="play">Play</button>
<button type="button" id="back">Back 10 seconds</button>
<button type="button" id="forward">Forward 10 seconds</button>
<label class="sr-only" for="seek">Video position</label><input class="seek" id="seek" type="range" min="0" max="1000" value="0">
<span class="time" id="time">0:00 / 0:00</span>
<button type="button" id="mute" aria-pressed="false">Mute</button>
<label for="volume">Volume</label><input class="volume" id="volume" type="range" min="0" max="1" step="0.05" value="1">
<button type="button" id="captions" aria-pressed="false">Captions</button>
<button type="button" id="description" aria-pressed="false">Audio description</button>
${transcriptText ? '<button type="button" id="transcript" aria-expanded="false" aria-controls="transcript-panel">Transcript</button>' : ''}
</div>
</div>
<p class="help">Keyboard shortcuts when focus is not in a control: Space plays or pauses, C toggles captions, D toggles audio description, and T toggles the transcript.</p>
${transcriptMarkup}
<div id="status" class="sr-only" aria-live="polite" aria-atomic="true"></div>
</main>
<script>
(function(){
const video=document.getElementById('video'),source=document.getElementById('video-source'),play=document.getElementById('play'),seek=document.getElementById('seek'),time=document.getElementById('time'),mute=document.getElementById('mute'),volume=document.getElementById('volume'),captions=document.getElementById('captions'),description=document.getElementById('description'),status=document.getElementById('status'),track=document.getElementById('caption-track');
const standard={src:${JSON.stringify(originalName)},type:${JSON.stringify(defaultType)}},described={src:${JSON.stringify(describedName)},type:${JSON.stringify(describedType)}};let describedOn=false;
function announce(message){status.textContent='';setTimeout(()=>status.textContent=message,30)}
function format(value){value=Math.max(0,Number(value)||0);return Math.floor(value/60)+':'+String(Math.floor(value%60)).padStart(2,'0')}
function update(){play.textContent=video.paused?'Play':'Pause';mute.textContent=video.muted?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(video.muted));const duration=Number(video.duration)||0;seek.value=duration?Math.round((video.currentTime/duration)*1000):0;time.textContent=format(video.currentTime)+' / '+format(duration)}
function setCaptions(on){if(video.textTracks[0])video.textTracks[0].mode=on?'showing':'hidden';captions.setAttribute('aria-pressed',String(on));announce('Captions '+(on?'on':'off'))}
async function toggleDescription(){const currentTime=video.currentTime,paused=video.paused,captionsOn=video.textTracks[0]&&video.textTracks[0].mode==='showing';describedOn=!describedOn;const next=describedOn?described:standard;video.pause();source.src=next.src;source.type=next.type;video.load();video.addEventListener('loadedmetadata',async function restore(){video.currentTime=Math.min(currentTime,Number(video.duration)||currentTime);setCaptions(Boolean(captionsOn));if(!paused)try{await video.play()}catch(e){}update()},{once:true});description.setAttribute('aria-pressed',String(describedOn));announce('Audio description '+(describedOn?'on':'off'))}
play.addEventListener('click',()=>video.paused?video.play():video.pause());document.getElementById('back').addEventListener('click',()=>video.currentTime=Math.max(0,video.currentTime-10));document.getElementById('forward').addEventListener('click',()=>video.currentTime=Math.min(Number(video.duration)||video.currentTime+10,video.currentTime+10));seek.addEventListener('input',()=>{if(video.duration)video.currentTime=(Number(seek.value)/1000)*video.duration});mute.addEventListener('click',()=>video.muted=!video.muted);volume.addEventListener('input',()=>{video.volume=Number(volume.value);video.muted=false});captions.addEventListener('click',()=>setCaptions(captions.getAttribute('aria-pressed')!=='true'));description.addEventListener('click',toggleDescription);['play','pause','timeupdate','durationchange','volumechange','ended'].forEach(name=>video.addEventListener(name,update));
const transcriptButton=document.getElementById('transcript'),panel=document.getElementById('transcript-panel'),close=document.getElementById('close-transcript');function setTranscript(open){if(!panel)return;panel.hidden=!open;transcriptButton.setAttribute('aria-expanded',String(open));announce('Transcript '+(open?'opened':'closed'))}if(transcriptButton){transcriptButton.addEventListener('click',()=>setTranscript(transcriptButton.getAttribute('aria-expanded')!=='true'));close.addEventListener('click',()=>{setTranscript(false);transcriptButton.focus()})}
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|BUTTON|A/.test(event.target.tagName))return;const key=event.key.toLowerCase();if(key===' '){event.preventDefault();play.click()}else if(key==='c')captions.click();else if(key==='d')description.click();else if(key==='t'&&transcriptButton)transcriptButton.click()});
track.addEventListener('load',()=>setCaptions(false));update();setCaptions(false);
})();
</script>
</body>
</html>`;
  }

  function waitForMedia(element) {
    if (element.readyState >= 1) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const done = () => { cleanup(); resolve(); };
      const fail = () => { cleanup(); reject(new Error('A required media file could not be decoded.')); };
      const cleanup = () => { element.removeEventListener('loadedmetadata', done); element.removeEventListener('error', fail); };
      element.addEventListener('loadedmetadata', done, { once: true });
      element.addEventListener('error', fail, { once: true });
      element.load();
    });
  }
  function monitor(video, recorder, signal, onProgress) {
    return new Promise((resolve, reject) => {
      const tick = () => {
        if (signal && signal.aborted) return reject(new DOMException('Cancelled', 'AbortError'));
        if (video.ended || recorder.state === 'inactive') return resolve();
        const duration = Number(video.duration) || 0;
        const progress = duration ? 10 + Math.min(75, Math.round((video.currentTime / duration) * 75)) : 20;
        if (onProgress) onProgress({ progress, message: `Rendering accessible video at ${formatTime(video.currentTime)} of ${formatTime(duration)}.` });
        window.setTimeout(tick, 750);
      };
      video.addEventListener('error', () => reject(new Error('The source video could not be rendered.')), { once: true });
      tick();
    });
  }
  function chooseMimeType() { return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((type) => MediaRecorder.isTypeSupported(type)) || ''; }
  function findArtifact(items, predicate) { return (items || []).filter(predicate).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null; }
  function safeBase(name) { return String(name || 'video').replace(/\.[^.]+$/, '').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'video'; }
  function formatTime(seconds) { const value = Math.max(0, Number(seconds) || 0); const minutes = Math.floor(value / 60); return `${minutes}:${String(Math.floor(value % 60)).padStart(2, '0')}`; }
  function checkCancelled(signal) { if (signal && signal.aborted) throw new DOMException('Cancelled', 'AbortError'); }
  function escapeHtml(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
  window.PublicationRenderer = { render };
})();
