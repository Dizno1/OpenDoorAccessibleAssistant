(function () {
  // Reusable accessible media player for in-app preview and review. Mirrors the approved
  // eComBack-based player already used for exported publication packages (js/publication-renderer.js
  // playerHtml): the same control set, labels, aria-pressed pattern, keyboard shortcuts, and one
  // consolidated polite live region — so the app never presents a second, different control design
  // for the same job. Controls for an asset that isn't available (captions, audio description,
  // transcript) are omitted rather than shown disabled with no explanation.
  //
  // Usage:
  //   const player = window.AccessiblePlayer.create(mountElement, {
  //     mediaType: 'video' | 'audio',
  //     src, type, title,
  //     captionsUrl, captionLabel, captionLanguage,
  //     describedSrc, describedType,
  //     transcriptText
  //   });
  //   player.destroy(); // when the source changes or the viewer resets

  function format(value) {
    value = Math.max(0, Number(value) || 0);
    return Math.floor(value / 60) + ':' + String(Math.floor(value % 60)).padStart(2, '0');
  }

  // Local blob URLs and some source formats (including many .mov files) can leave duration as
  // NaN until metadata has actually loaded, or, in some Chrome versions, as Infinity until a seek
  // forces the real value to resolve. Neither should ever be displayed as "0:00" — that reads as
  // an accurate, very short duration, which is worse than saying plainly that it isn't known yet.
  function formatDurationDisplay(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 'duration unavailable';
    return format(number);
  }

  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  }

  let instanceCount = 0;

  function create(mount, options) {
    mount.innerHTML = '';
    instanceCount += 1;
    const idPrefix = `accessible-player-${instanceCount}`;
    const isVideo = options.mediaType === 'video';
    const media = document.createElement(isVideo ? 'video' : 'audio');
    media.preload = 'metadata';
    media.className = 'media-viewer accessible-player-media';
    media.setAttribute('aria-label', options.title || 'Media player');
    if (isVideo) media.playsInline = true;

    const source = document.createElement('source');
    source.src = options.src;
    if (options.type) source.type = options.type;
    media.appendChild(source);

    let track = null;
    if (isVideo && options.captionsUrl) {
      track = document.createElement('track');
      track.kind = 'captions';
      track.src = options.captionsUrl;
      track.srclang = options.captionLanguage || 'en';
      track.label = options.captionLabel || 'English';
      media.appendChild(track);
    }

    const wrap = el('div', { class: 'accessible-player' });
    wrap.appendChild(media);

    const controls = el('div', { class: 'accessible-player-controls', role: 'group', 'aria-label': 'Media controls' });
    const playButton = el('button', { type: 'button' }, 'Play');
    const backButton = el('button', { type: 'button' }, 'Back 10 seconds');
    const forwardButton = el('button', { type: 'button' }, 'Forward 10 seconds');
    const seekLabel = el('label', { class: 'sr-only', for: `${idPrefix}-seek` }, `${options.title || 'Media'} position`);
    const seek = el('input', { type: 'range', min: '0', max: '1000', value: '0', class: 'accessible-player-seek', id: `${idPrefix}-seek` });
    const time = el('span', { class: 'accessible-player-time' }, '0:00 / 0:00');
    controls.append(playButton, backButton, forwardButton, seekLabel, seek, time);

    let captionsButton = null;
    if (track) {
      captionsButton = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Captions');
      controls.appendChild(captionsButton);
    }

    let describedButton = null;
    let describedOn = false;
    const standard = { src: options.src, type: options.type || '' };
    const described = options.describedSrc ? { src: options.describedSrc, type: options.describedType || '' } : null;
    if (described) {
      describedButton = el('button', { type: 'button', 'aria-pressed': 'false' }, 'Audio description');
      controls.appendChild(describedButton);
    }

    let transcriptButton = null;
    let transcriptPanel = null;
    if (options.transcriptText) {
      transcriptButton = el('button', { type: 'button', 'aria-expanded': 'false', 'aria-controls': `${idPrefix}-transcript` }, 'Transcript');
      controls.appendChild(transcriptButton);
    }

    wrap.appendChild(controls);

    const shortcutsHelp = el('p', { class: 'help-text accessible-player-help' },
      'Keyboard shortcuts when focus is not in a control: Space plays or pauses' +
      (captionsButton ? ', C toggles captions' : '') +
      (describedButton ? ', D toggles audio description' : '') +
      (transcriptButton ? ', and T toggles the transcript' : '') + '.');
    wrap.appendChild(shortcutsHelp);

    if (transcriptButton) {
      transcriptPanel = el('div', { id: `${idPrefix}-transcript`, class: 'accessible-player-transcript', hidden: 'hidden' });
      const heading = el('div', { class: 'transcript-heading' });
      heading.appendChild(el('h3', {}, 'Transcript'));
      const closeButton = el('button', { type: 'button' }, 'Close transcript');
      heading.appendChild(closeButton);
      transcriptPanel.appendChild(heading);
      const pre = el('pre', {}, options.transcriptText);
      transcriptPanel.appendChild(pre);
      wrap.appendChild(transcriptPanel);

      function setTranscript(open) {
        transcriptPanel.hidden = !open;
        transcriptButton.setAttribute('aria-expanded', String(open));
        announce('Transcript ' + (open ? 'opened' : 'closed'));
        if (!open) transcriptButton.focus();
      }
      transcriptButton.addEventListener('click', () => setTranscript(transcriptButton.getAttribute('aria-expanded') !== 'true'));
      closeButton.addEventListener('click', () => setTranscript(false));
    }

    const status = el('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
    wrap.appendChild(status);
    let announceTimer = null;
    function announce(message) {
      status.textContent = '';
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(() => { status.textContent = message; }, 30);
    }

    function update() {
      playButton.textContent = media.paused ? 'Play' : 'Pause';
      const duration = Number(media.duration);
      const finiteDuration = Number.isFinite(duration) ? duration : 0;
      seek.value = finiteDuration ? String(Math.round((media.currentTime / finiteDuration) * 1000)) : '0';
      time.textContent = `${format(media.currentTime)} / ${formatDurationDisplay(duration)}`;
    }

    function setCaptions(on) {
      if (media.textTracks && media.textTracks[0]) media.textTracks[0].mode = on ? 'showing' : 'hidden';
      if (captionsButton) captionsButton.setAttribute('aria-pressed', String(on));
      announce('Captions ' + (on ? 'on' : 'off'));
    }

    async function toggleDescription() {
      if (!described) return;
      const currentTime = media.currentTime;
      const paused = media.paused;
      const captionsOn = Boolean(media.textTracks && media.textTracks[0] && media.textTracks[0].mode === 'showing');
      describedOn = !describedOn;
      const next = describedOn ? described : standard;
      media.pause();
      source.src = next.src;
      if (next.type) source.type = next.type;
      media.load();
      media.addEventListener('loadedmetadata', async function restore() {
        media.currentTime = Math.min(currentTime, Number(media.duration) || currentTime);
        setCaptions(captionsOn);
        if (!paused) { try { await media.play(); } catch (error) { /* playback requires a user gesture in some browsers */ } }
        update();
      }, { once: true });
      describedButton.setAttribute('aria-pressed', String(describedOn));
      announce('Audio description ' + (describedOn ? 'on' : 'off'));
    }

    playButton.addEventListener('click', () => (media.paused ? media.play() : media.pause()));
    backButton.addEventListener('click', () => { media.currentTime = Math.max(0, media.currentTime - 10); });
    forwardButton.addEventListener('click', () => { media.currentTime = Math.min(Number(media.duration) || media.currentTime + 10, media.currentTime + 10); });
    seek.addEventListener('input', () => { if (media.duration) media.currentTime = (Number(seek.value) / 1000) * media.duration; });
    if (captionsButton) captionsButton.addEventListener('click', () => setCaptions(captionsButton.getAttribute('aria-pressed') !== 'true'));
    if (describedButton) describedButton.addEventListener('click', toggleDescription);
    ['play', 'pause', 'timeupdate', 'durationchange', 'loadedmetadata', 'canplay', 'volumechange', 'ended'].forEach((name) => media.addEventListener(name, update));
    if (track) track.addEventListener('load', () => setCaptions(false));

    // A known Chrome behavior for some local blob URLs (including many .mov files): duration
    // reports as Infinity until something forces a real seek. This resolves it once, quietly, the
    // first time metadata is available, then restores the original position.
    media.addEventListener('loadedmetadata', function resolveDuration() {
      media.removeEventListener('loadedmetadata', resolveDuration);
      if (media.duration === Infinity) {
        const resume = media.currentTime;
        media.currentTime = 1e101;
        media.addEventListener('timeupdate', function restore() {
          media.removeEventListener('timeupdate', restore);
          media.currentTime = resume;
          update();
        }, { once: true });
      }
    });

    media.addEventListener('error', () => {
      announce('This media could not be loaded, so playback and duration are not available here. It may not be in a format this browser can play.');
    });

    function keydownHandler(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target && /INPUT|BUTTON|TEXTAREA|SELECT|A/.test(target.tagName)) return;
      const key = event.key.toLowerCase();
      if (key === ' ') { event.preventDefault(); playButton.click(); }
      else if (key === 'c' && captionsButton) captionsButton.click();
      else if (key === 'd' && describedButton) describedButton.click();
      else if (key === 't' && transcriptButton) transcriptButton.click();
    }
    document.addEventListener('keydown', keydownHandler);

    mount.appendChild(wrap);
    update();
    if (track) setCaptions(false);

    return {
      element: wrap,
      media,
      destroy() {
        document.removeEventListener('keydown', keydownHandler);
        window.clearTimeout(announceTimer);
        mount.innerHTML = '';
      }
    };
  }

  window.AccessiblePlayer = { create };
})();
