(function () {
  function confidence(level, reason) {
    return { level, reason };
  }

  function buildKnowledgeModel(inspection) {
    const isLocal = inspection.sourceType !== 'url';
    const mediaType = inspection.mediaType;

    const baseModel = {
      version: 2,
      source: {
        type: inspection.sourceType || 'file',
        name: inspection.name,
        mediaType,
        mimeType: inspection.mimeType,
        extension: inspection.extension,
        size: inspection.size,
        durationSeconds: inspection.durationSeconds,
        width: inspection.width,
        height: inspection.height,
        local: isLocal
      },
      accessibility: {
        captions: {
          present: Boolean(inspection.hasCaptions),
          confidence: confidence('low', 'The current browser inspection cannot reliably inspect embedded or sidecar captions.')
        },
        transcript: {
          present: Boolean(inspection.hasTranscript),
          confidence: confidence('low', 'The current browser inspection cannot confirm whether a separate transcript exists.')
        },
        audioDescription: {
          present: Boolean(inspection.hasAudioDescription),
          confidence: confidence('low', 'The current browser inspection cannot reliably identify an audio-description track.')
        },
        imageDescription: {
          present: false,
          status: mediaType === 'image' ? 'not-created' : 'not-applicable',
          confidence: confidence('low', 'No reviewed image description has been created in this workspace yet.')
        }
      },
      audio: {
        present: Boolean(inspection.hasAudio),
        speech: { status: inspection.hasAudio ? 'not-analyzed' : 'not-applicable' },
        speakers: { status: inspection.hasAudio ? 'not-analyzed' : 'not-applicable', count: null },
        language: { status: inspection.hasAudio ? 'not-analyzed' : 'not-applicable', value: null },
        music: { status: inspection.hasAudio ? 'not-analyzed' : 'not-applicable' },
        silence: { status: inspection.hasAudio ? 'not-analyzed' : 'not-applicable' },
        nonSpeechSignificant: { status: inspection.hasAudio ? 'not-analyzed' : 'not-applicable' }
      },
      visual: {
        present: Boolean(inspection.hasVideo || inspection.hasImages),
        sceneChanges: { status: inspection.hasVideo ? 'not-analyzed' : 'not-applicable' },
        onScreenText: { status: inspection.hasVideo || inspection.hasImages ? 'not-analyzed' : 'not-applicable' },
        importantVisuals: { status: inspection.hasVideo || inspection.hasImages ? 'not-analyzed' : 'not-applicable' }
      },
      analysis: {
        completed: ['source', 'technical-metadata'],
        pending: pendingAnalysis(inspection),
        createdAt: new Date().toISOString()
      },
      results: [],
      history: []
    };

    const storedModel = window.SharedKnowledge ? window.SharedKnowledge.load(baseModel.source) : null;
    return window.SharedKnowledge ? window.SharedKnowledge.merge(baseModel, storedModel) : baseModel;
  }

  function pendingAnalysis(inspection) {
    const pending = [];
    if (inspection.hasAudio) pending.push('speech', 'speakers', 'language', 'music', 'silence');
    if (inspection.hasVideo || inspection.hasImages) pending.push('scene-changes', 'on-screen-text', 'important-visuals');
    return pending;
  }

  window.AccessibilityIntelligence = { buildKnowledgeModel };
})();
