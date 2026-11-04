(function () {
  // The authoritative Stage 1 coordinator. See
  // docs/Stage 1 Engine-Orchestrated Analysis Directive.md for the full architecture this
  // implements. Its job: for a given source, determine which accessibility-analysis questions are
  // genuinely resolved (by real inspection, a real local engine, a real connected engine, or a
  // direct human answer as the documented fallback) versus still unresolved — and use the answer
  // to decide what work is actually needed, not just to unlock a fixed pipeline.
  //
  // Decision tree this implements for audio:
  //
  //   Speech present?
  //     Yes -> transcript needed -> dialogue captions needed
  //     No  -> transcript NOT needed -> meaningful non-speech audio present?
  //              Yes -> captions needed (for that non-speech audio)
  //              No  -> captions not required
  //
  // js/audio-signal-analysis.js runs automatically on file selection and can resolve both
  // questions at once when it reliably measures the track as essentially silent — silence has
  // neither speech nor meaningful non-speech audio. When the track has real content, that engine
  // honestly cannot tell speech apart from music or ambient sound, so the speech question still
  // needs either a connected transcription engine or a direct answer — asked as a fallback for
  // that specific residual case, not as the default interaction for every file.
  //
  // Visual analysis (scene content, on-screen text, whether audio description is warranted) is not
  // implemented yet - model.visual fields stay 'not-analyzed' and are not gated on here. See the
  // README's Phase 39/41/42 entries for what's real versus planned.

  function speechQuestion(model) {
    if (!model.audio || !model.audio.present) return null;
    const status = (model.audio.speech && model.audio.speech.status) || 'not-analyzed';
    const speechCapability = window.AIProviderLayer ? window.AIProviderLayer.getCapability('transcription-draft') : { canRun: false };
    const analyzing = Boolean(model.audio.speech && model.audio.speech.analyzing);
    const engineFileTooLarge = Boolean(model.audio.speech && model.audio.speech.engineFileTooLarge);
    const engineAvailable = Boolean(speechCapability.canRun) && !engineFileTooLarge;
    // A real, answered result always counts. Otherwise, a configured and healthy transcription
    // engine that can actually accept this file also resolves this - deferred to run when the
    // transcript step executes, per the "will run using X when you begin" message. Two conditions
    // that previously caused a silent dead end are now excluded from that shortcut: while the free
    // local silence analysis (js/audio-signal-analysis.js) is still running - it can resolve this
    // for nothing and shouldn't be preempted by a slower, possibly-billed engine - and when the
    // file is already known to exceed the engine's size limit, since "will run automatically" was
    // never true for that file and claiming it resolved just delayed discovering the same problem.
    const resolved = ['reported-present', 'reported-none', 'silence-detected'].includes(status) || (!analyzing && engineAvailable);
    return {
      id: 'speech',
      resolved,
      analyzing,
      engineAvailable,
      engineFileTooLarge,
      providerName: speechCapability.provider ? speechCapability.provider.name : '',
      status
    };
  }

  // Only asked once speech has been established as absent - if there's dialogue, captions are
  // already known to be needed and this question is moot. A local silence measurement resolves
  // this automatically too: true silence has no meaningful non-speech audio either.
  function nonSpeechAudioQuestion(model) {
    const speech = speechQuestion(model);
    if (!speech || !speech.resolved || speech.status === 'reported-present') return null;
    if (speech.status === 'silence-detected') {
      return { id: 'nonSpeechAudio', resolved: true, engineAvailable: false, status: 'silence-detected' };
    }
    if (speech.status !== 'reported-none') return null;
    const status = (model.audio.nonSpeechSignificant && model.audio.nonSpeechSignificant.status) || 'not-analyzed';
    return {
      id: 'nonSpeechAudio',
      resolved: ['reported-present', 'reported-none'].includes(status),
      engineAvailable: false, // no audio-event-classification engine exists in this build; a direct fallback question
      status
    };
  }

  function resolve(model) {
    const questions = [speechQuestion(model), nonSpeechAudioQuestion(model)].filter(Boolean);
    return {
      questions,
      unresolved: questions.filter((question) => !question.resolved)
    };
  }

  function isReady(model) {
    return resolve(model).unresolved.length === 0;
  }

  // A dialogue transcript is only needed when speech is actually present (or not yet ruled out and
  // an engine will determine it at execution time).
  function transcriptionNeeded(model) {
    const speech = speechQuestion(model);
    if (!speech) return false; // no audio present at all
    return !['reported-none', 'silence-detected'].includes(speech.status);
  }

  // Captions are needed for dialogue OR for meaningful non-speech audio - never assumed just
  // because the source is a video with an audio track, and never true for a track measured as
  // essentially silent.
  function captionsNeeded(model) {
    const speech = speechQuestion(model);
    if (!speech) return false;
    if (speech.status === 'silence-detected') return false;
    if (speech.status !== 'reported-none') return true; // dialogue present or still to be determined
    const nonSpeech = nonSpeechAudioQuestion(model);
    return Boolean(nonSpeech && nonSpeech.status === 'reported-present');
  }

  // Short, human-readable analysis-result lines for resolved questions - deliberately separate
  // from workflow artifact completion (Current Task must never call a Stage 1 result a completed
  // "Create Transcript" or "Create Captions", since no artifact exists for a question that was
  // only analyzed or answered, not produced).
  function describeResults(model) {
    const status = resolve(model);
    return status.questions.filter((question) => question.resolved).map((question) => {
      if (question.id === 'speech') {
        if (question.status === 'silence-detected') return 'Speech analysis: recording is essentially silent';
        if (question.status === 'reported-none') return 'Speech analysis: little or no spoken dialogue';
        if (question.status === 'reported-present') return 'Speech analysis: spoken dialogue present';
        return 'Speech analysis: in progress';
      }
      if (question.id === 'nonSpeechAudio') {
        if (question.status === 'silence-detected') return null; // covered by the speech line above
        return question.status === 'reported-present'
          ? 'Audio event analysis: meaningful non-speech sounds present'
          : 'Audio event analysis: no meaningful non-speech sounds';
      }
      return null;
    }).filter(Boolean);
  }

  window.StageOneAnalysis = { resolve, isReady, transcriptionNeeded, captionsNeeded, describeResults };
})();
