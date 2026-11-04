(function () {
  // Real, local, deterministic analysis of a file's actual audio track, using the same Web Audio
  // decode pattern already proven in js/narration-mixer.js (AudioContext.decodeAudioData). This is
  // genuine measurement of the file, not a guess and not a question put to the person.
  //
  // What this can honestly claim, and what it can't:
  // - CAN reliably tell "this audio track is essentially silent throughout" from "this track has
  //   real acoustic content." That's a direct energy measurement across the whole track.
  // - CANNOT reliably tell speech apart from music, wind, or other non-speech sound using energy
  //   alone — that needs real speech/audio classification (a connected AI service), which this
  //   build does not run automatically. When there IS content, this returns essentiallySilent:
  //   false and stage-one-analysis.js still asks which kind of sound it is — honestly presented as
  //   what a local engine can't determine, not guessed at.
  // - Some containers (certain .mov files in particular) can't be decoded by the browser's Web
  //   Audio implementation at all. When that happens this reports supported: false rather than
  //   claiming a result it doesn't have.

  const FRAME_SECONDS = 0.05; // 50ms analysis frames
  const SILENCE_RMS_DBFS = -50; // frames quieter than this count as silent
  const SILENCE_RATIO_THRESHOLD = 0.97; // fraction of frames that must be silent to call the whole track silent

  async function analyzeAudioTrack(file) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !(file instanceof File)) return { supported: false };
    let context;
    try {
      context = new AudioContextClass();
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      const channelCount = buffer.numberOfChannels;
      const frameLength = Math.max(1, Math.round(FRAME_SECONDS * buffer.sampleRate));
      const totalFrames = Math.ceil(buffer.length / frameLength) || 1;
      let silentFrames = 0;
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
        const start = frameIndex * frameLength;
        const end = Math.min(buffer.length, start + frameLength);
        let sumSquares = 0;
        let sampleCount = 0;
        for (let channel = 0; channel < channelCount; channel += 1) {
          const data = buffer.getChannelData(channel);
          for (let i = start; i < end; i += 1) {
            sumSquares += data[i] * data[i];
            sampleCount += 1;
          }
        }
        const rms = sampleCount ? Math.sqrt(sumSquares / sampleCount) : 0;
        const dbfs = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
        if (dbfs < SILENCE_RMS_DBFS) silentFrames += 1;
      }
      const silenceRatio = silentFrames / totalFrames;
      return {
        supported: true,
        essentiallySilent: silenceRatio >= SILENCE_RATIO_THRESHOLD,
        silenceRatio
      };
    } catch (error) {
      return { supported: false, error: error && error.message };
    } finally {
      if (context && typeof context.close === 'function') context.close();
    }
  }

  window.AudioSignalAnalysis = { analyzeAudioTrack };
})();
