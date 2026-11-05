/* Screen-reader-first timed text editing. No live announcements during typing. */
(function () {
  const root = document.getElementById('timed-text-editor');
  if (!root) return;
  const list = root.querySelector('#timed-segment-list');
  const editor = root.querySelector('#timed-segment-text');
  const info = root.querySelector('#timed-segment-info');
  const start = root.querySelector('#timed-segment-start');
  const end = root.querySelector('#timed-segment-end');
  const status = root.querySelector('#timed-editor-status');
  const source = document.getElementById('transcript-text');
  const file = root.querySelector('#timed-import');
  let segments = [];
  let selected = -1;
  const time = (ms) => {
    const total = Math.max(0, Math.round(ms));
    const h = Math.floor(total / 3600000);
    const m = Math.floor(total / 60000) % 60;
    const s = Math.floor(total / 1000) % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(total % 1000).padStart(3, '0')}`;
  };
  const parseTime = (value) => {
    const match = /^(\d{1,3}):(\d{2}):(\d{2})[.,](\d{3})$/.exec(value.trim());
    if (!match || +match[2] > 59 || +match[3] > 59) return null;
    return (+match[1] * 3600 + +match[2] * 60 + +match[3]) * 1000 + +match[4];
  };
  function parse(text) {
    const blocks = text.replace(/\r/g, '').replace(/^\uFEFF/, '').replace(/^WEBVTT[^\n]*\n/, '').trim().split(/\n\s*\n/);
    const result = [];
    for (const block of blocks) {
      const lines = block.split('\n');
      const i = lines.findIndex((line) => /-->/.test(line));
      if (i < 0) continue;
      const match = /^\s*(\d{1,3}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,3}:\d{2}:\d{2}[.,]\d{3})/.exec(lines[i]);
      if (!match) continue;
      const a = parseTime(match[1]);
      const b = parseTime(match[2]);
      if (a === null || b === null || b <= a) continue;
      result.push({ start: a, end: b, text: lines.slice(i + 1).join('\n').trim() });
    }
    return result;
  }
  function saveSelected() {
    if (selected < 0) return true;
    const a = parseTime(start.value);
    const b = parseTime(end.value);
    if (a === null || b === null || b <= a) {
      status.textContent = 'Invalid time. Use HH:MM:SS.mmm. End time must be later than start time.';
      return false;
    }
    segments[selected] = { start: a, end: b, text: editor.value };
    return true;
  }
  function refresh() {
    list.replaceChildren();
    segments.forEach((segment, i) => {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `Segment ${i + 1} of ${segments.length}. ${time(segment.start)}. ${segment.text.replace(/\s+/g, ' ').slice(0, 100)}`;
      list.append(option);
    });
    if (selected >= 0 && selected < segments.length) list.selectedIndex = selected;
  }
  function choose(index, focusText = false) {
    if (index < 0 || index >= segments.length) return;
    selected = index;
    const segment = segments[index];
    list.selectedIndex = index;
    info.textContent = `Segment ${index + 1} of ${segments.length}. Timing available on request.`;
    editor.value = segment.text;
    start.value = time(segment.start);
    end.value = time(segment.end);
    if (focusText) editor.focus();
  }
  function move(delta) {
    if (!saveSelected()) return;
    refresh();
    choose(Math.max(0, Math.min(segments.length - 1, selected + delta)), true);
  }
  root.querySelector('#timed-open').addEventListener('click', () => {
    const parsed = parse(source.value);
    if (!parsed.length) {
      status.textContent = 'No timed segments found. Import an SRT or WebVTT file, or paste timed captions into the transcript field.';
      return;
    }
    segments = parsed;
    selected = -1;
    root.querySelector('#timed-workspace').hidden = false;
    refresh();
    choose(0);
    list.focus();
    status.textContent = `Loaded ${segments.length} timed segments. Use Up and Down Arrow to navigate, Enter to edit text.`;
  });
  file.addEventListener('change', async () => {
    if (!file.files.length) return;
    const text = await file.files[0].text();
    const parsed = parse(text);
    if (!parsed.length) { status.textContent = 'No valid timed segments found in the selected file.'; return; }
    segments = parsed;
    selected = -1;
    root.querySelector('#timed-workspace').hidden = false;
    refresh();
    choose(0);
    list.focus();
    status.textContent = `Imported ${segments.length} timed segments.`;
  });
  list.addEventListener('change', () => {
    const next = list.selectedIndex;
    if (!saveSelected()) { list.selectedIndex = selected; return; }
    refresh();
    choose(next);
  });
  list.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); editor.focus(); }
  });
  editor.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'PageDown') { event.preventDefault(); move(1); }
    if (event.ctrlKey && event.key === 'PageUp') { event.preventDefault(); move(-1); }
    if (event.key === 'Escape') { event.preventDefault(); saveSelected(); refresh(); list.focus(); }
  });
  root.querySelector('#timed-next').addEventListener('click', () => move(1));
  root.querySelector('#timed-previous').addEventListener('click', () => move(-1));
  root.querySelector('#timed-save').addEventListener('click', () => {
    if (!saveSelected()) return;
    refresh();
    source.value = segments.map((s) => `${time(s.start)} --> ${time(s.end)}\n${s.text}`).join('\n\n');
    status.textContent = `${segments.length} segments copied into the transcript field. Review and save the transcript using the existing controls.`;
  });
  function download(format) {
    if (!saveSelected()) return;
    const body = segments.map((s, i) => `${format === 'srt' ? `${i + 1}\n` : ''}${time(s.start).replace('.', format === 'srt' ? ',' : '.')} --> ${time(s.end).replace('.', format === 'srt' ? ',' : '.')}\n${s.text}`).join('\n\n');
    const content = format === 'vtt' ? `WEBVTT\n\n${body}\n` : `${body}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Timed Transcript.${format}`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = `${format.toUpperCase()} export prepared.`;
  }
  root.querySelector('#timed-export-srt').addEventListener('click', () => download('srt'));
  root.querySelector('#timed-export-vtt').addEventListener('click', () => download('vtt'));
})();
