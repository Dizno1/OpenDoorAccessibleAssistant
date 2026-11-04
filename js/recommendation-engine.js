(function () {
  const accessibilityPriority = {
    'create-captions': 100,
    'create-transcript': 95,
    'audio-description': 85,
    'generate-alt-text': 85,
    'ocr-document': 80,
    'ocr-image': 75,
    'extract-document-text': 65,
    'extract-audio': 45,
    'compress-video': 35,
    'compress-audio': 35,
    'normalize-audio': 35,
    'compress-image': 30,
    'resize-image': 25,
    'inspect-archive': 25,
    'accessibility-package': 40,
    'save-file-information': 15
  };

  function build(model, assessment, plan, intents) {
    const assessmentByIntent = new Map(
      ((assessment && assessment.items) || [])
        .filter((item) => item.intentId)
        .map((item) => [item.intentId, item])
    );

    const planByIntent = new Map();
    ((plan && plan.steps) || []).forEach((step) => {
      if (step.intentId && !planByIntent.has(step.intentId)) planByIntent.set(step.intentId, step);
    });

    const history = Array.isArray(model.history) ? model.history : [];
    const activeJobs = Array.isArray(model.activeJobs) ? model.activeJobs : [];
    const completedWorkflows = new Set(
      history.filter((entry) => entry.status === 'completed').map((entry) => entry.workflowId)
    );

    const recommendations = (intents || []).map((intent) => {
      const assessmentItem = assessmentByIntent.get(intent.id);
      const planStep = planByIntent.get(intent.id);
      const completed = workflowIsComplete(model, intent.workflowId, completedWorkflows);
      const inProgress = activeJobs.some((entry) => entry.workflowId === intent.workflowId && ['queued', 'running'].includes(entry.status));
      const rawAvailable = Boolean(intent.capability && intent.capability.canRun);
      // render-accessible-video has no plan step, so dependencyStatus() always reports 'clear' for
      // it — that alone made it look "ready" the moment a provider was available, regardless of
      // whether captions or described audio actually existed yet. This mirrors the same prerequisite
      // check workflow-runner.js's validateJob already enforces at execution time, so a person is
      // never shown "next: render" (or offered a working-looking button) before it would actually
      // be allowed to run.
      //
      // create-captions has the same class of gap from the other direction: it DOES have a plan
      // step with a real dependency on create-transcript, but 'available' never consulted
      // dependencyState, only raw provider capability — so a caption-capable provider being
      // configured was enough to rank captions as "next," ahead of an unfinished transcript, purely
      // because captions scores higher (accessibilityPriority). audio-description is deliberately
      // NOT given the same treatment: its plan dependency chain runs through visual analysis, which
      // has no real engine in this build and never reaches 'complete' — gating on that would make a
      // working, manually-authored workflow permanently unavailable instead of fixing anything.
      const available = intent.workflowId === 'render-accessible-video'
        ? rawAvailable && renderPrerequisitesMet(model)
        : intent.workflowId === 'create-captions'
          ? rawAvailable && captionsReadyToRun(model)
          : rawAvailable;
      const dependencyState = dependencyStatus(planStep, plan);
      const score = calculateScore(intent, assessmentItem, planStep, completed, available, dependencyState, model);
      const state = completed ? 'completed' : inProgress ? 'in-progress' : (available && dependencyState === 'clear') ? 'ready' : 'blocked';

      return {
        ...intent,
        score,
        completed,
        inProgress,
        state,
        available,
        dependencyState,
        recommendationLevel: recommendationLevel(score, completed, available, inProgress, dependencyState),
        recommendationReason: buildReason(intent, assessmentItem, planStep, completed, available, dependencyState, inProgress)
      };
    });

    recommendations.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.available !== b.available) return a.available ? -1 : 1;
      return b.score - a.score || a.title.localeCompare(b.title);
    });

    recommendations.forEach((item, index) => {
      item.rank = index + 1;
      item.isTopRecommendation = index === 0 && !item.completed;
    });

    const remaining = recommendations.filter((item) => !item.completed);
    const ready = remaining.filter((item) => item.available);
    const completed = recommendations.length - remaining.length;

    return {
      recommendations,
      topRecommendation: ready[0] || remaining[0] || null,
      summary: buildSummary(recommendations.length, ready.length, completed),
      createdAt: new Date().toISOString()
    };
  }

  function workflowIsComplete(model, workflowId, completedWorkflows) {
    if (['create-transcript', 'create-captions', 'audio-description'].includes(workflowId)) return isPresent(model, workflowId);
    if (workflowId !== 'accessibility-package') {
      return completedWorkflows.has(workflowId) || isPresent(model, workflowId);
    }

    const packageRecord = model.analysis && model.analysis.accessibilityPackage;
    if (!packageRecord || packageRecord.status !== 'complete' || !packageRecord.createdAt) return false;
    const packageTime = Date.parse(packageRecord.createdAt) || 0;
    const laterWork = (model.history || []).some((entry) => {
      if (entry.workflowId === 'accessibility-package' || entry.status !== 'completed') return false;
      return (Date.parse(entry.completedAt || entry.createdAt) || 0) > packageTime;
    });
    return !laterWork;
  }

  function calculateScore(intent, assessmentItem, planStep, completed, available, dependencyState, model) {
    let score = accessibilityPriority[intent.id] || accessibilityPriority[intent.workflowId] || 20;
    if (assessmentItem) score += assessmentItem.rating * 10;
    if (planStep) score += Math.max(0, 20 - planStep.order);
    if (available) score += 25;
    if (dependencyState === 'waiting') score -= 20;
    if (completed) score -= 250;
    if (intent.workflowId === 'audio-description' && model && model.audio && model.audio.speech && ['reported-none', 'silence-detected'].includes(model.audio.speech.status)) score += 40;
    return score;
  }

  function dependencyStatus(planStep, plan) {
    if (!planStep || !planStep.dependencies || !planStep.dependencies.length) return 'clear';
    const stepMap = new Map(((plan && plan.steps) || []).map((step) => [step.id, step]));
    return planStep.dependencies.every((id) => {
      const dependency = stepMap.get(id);
      return dependency && dependency.status === 'complete';
    }) ? 'clear' : 'waiting';
  }

  function hasUsableArtifactText(record) {
    return Boolean(record && record.present && Array.isArray(record.artifacts) && record.artifacts.some((artifact) => String(artifact && artifact.content || '').trim()));
  }

  // 'Needed' (Stage 1's decision tree) and 'ready to run right now' are different questions.
  // Captions driven by dialogue additionally need the transcript itself to be complete first;
  // captions driven by meaningful non-speech audio have no transcript prerequisite, since they
  // aren't authored from a dialogue transcript at all.
  function captionsReadyToRun(model) {
    if (!window.StageOneAnalysis.captionsNeeded(model)) return false;
    const speechStatus = model.audio && model.audio.speech && model.audio.speech.status;
    if (speechStatus === 'reported-none') return true; // needed because of confirmed non-speech audio; no transcript to wait for
    return hasUsableArtifactText(model.accessibility.transcript);
  }

  // Same two checks js/workflow-runner.js's validateJob performs immediately before actually
  // rendering (hasCaptions / hasDescribedAudio), reused here so a workflow is never recommended,
  // offered as "next", or shown as an enabled button before it would actually be allowed to run.
  function renderPrerequisitesMet(model) {
    if (!model || !model.source || !window.OutputManager) return false;
    const artifacts = window.OutputManager.listForSource(model.source);
    const hasCaptions = artifacts.some((artifact) => artifact.mimeType === 'text/vtt' && String(artifact.content || '').trim());
    const hasDescribedAudio = artifacts.some((artifact) => artifact.mimeType === 'audio/wav' && artifact.url);
    return hasCaptions && hasDescribedAudio;
  }

  function isPresent(model, workflowId) {
    if (workflowId === 'create-transcript') return hasUsableArtifactText(model.accessibility.transcript);
    if (workflowId === 'create-captions') return hasUsableArtifactText(model.accessibility.captions);
    if (workflowId === 'audio-description') {
      // Presence alone is not completion: a restored or historical audio-description record with
      // only one narration cue (an accidental cue, or a stale draft from before this quality gate
      // existed) must not be treated as a finished audio description, the same way a freshly
      // generated single-cue draft is already rejected before it's ever shown for review.
      const record = model.accessibility.audioDescription;
      if (!record.present) return false;
      const cueCount = Number(record.cueCount);
      return Number.isFinite(cueCount) && cueCount >= 2;
    }
    return false;
  }

  function recommendationLevel(score, completed, available, inProgress, dependencyState) {
    if (completed) return 'Completed';
    if (inProgress) return 'In progress';
    if (!available || dependencyState === 'waiting') return 'Blocked';
    if (available) return 'Ready to execute';
    if (score >= 135) return 'Recommended first';
    if (score >= 90) return 'Recommended next';
    return 'Optional';
  }

  function buildReason(intent, assessmentItem, planStep, completed, available, dependencyState, inProgress) {
    if (completed) return 'This work is already recorded in Shared Knowledge, so it does not need to be started again.';
    if (inProgress) return 'This workflow is currently queued or running. Its result will update Shared Knowledge automatically.';
    if (!available) {
      if (intent.workflowId === 'render-accessible-video' && intent.capability && intent.capability.canRun) {
        return 'Render Accessible Video is unavailable until the transcript and captions are approved.';
      }
      if (intent.workflowId === 'create-captions' && intent.capability && intent.capability.canRun) {
        return 'Create Captions is unavailable until the transcript is created and reviewed.';
      }
      return assessmentItem
        ? `${assessmentItem.reason} The required processing provider is not connected yet.`
        : 'This may be useful for the source, but the required processing provider is not connected yet.';
    }
    if (dependencyState === 'waiting') {
      return 'This action is available, but earlier analysis in the accessibility plan should be completed first so the result can reuse it.';
    }
    if (assessmentItem) return assessmentItem.reason;
    if (planStep) return `${planStep.purpose} This action is available now.`;
    return `${intent.description} This action is available now.`;
  }

  function buildSummary(total, ready, completed) {
    const remaining = total - completed;
    if (!remaining) return 'All currently recognized work is already recorded as complete.';
    const parts = [`${remaining} remaining recommendation${remaining === 1 ? '' : 's'}`];
    if (ready) parts.push(`${ready} available now`);
    if (completed) parts.push(`${completed} already complete`);
    return `${parts.join(', ')}.`;
  }

  window.RecommendationEngine = { build };
})();
