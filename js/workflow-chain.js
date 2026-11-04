(function () {
  const workflowOrderByMediaType = {
    video: [
      'extract-audio',
      'create-transcript',
      'create-captions',
      'audio-description',
      'render-accessible-video',
      'accessibility-package'
    ],
    audio: ['create-transcript', 'accessibility-package'],
    image: ['generate-alt-text', 'accessibility-package'],
    document: ['accessibility-package'],
    archive: ['accessibility-package'],
    unknown: ['accessibility-package']
  };

  const reviewWorkflowIds = new Set([
    'create-transcript',
    'create-captions',
    'audio-description',
    'generate-alt-text',
    'accessibility-package'
  ]);

  function applicableOrder(mediaType) {
    return workflowOrderByMediaType[mediaType] || workflowOrderByMediaType.unknown;
  }

  function build(intents, mediaType) {
    const byWorkflow = new Map((intents || []).map((intent) => [intent.workflowId, intent]));
    const steps = applicableOrder(mediaType)
      .map((workflowId) => byWorkflow.get(workflowId))
      .filter(Boolean)
      .map((intent, index) => createStep(intent, index));

    return {
      id: `make-accessible-${Date.now()}`,
      title: 'Make This Accessible',
      mediaType,
      steps,
      currentIndex: -1,
      status: 'ready',
      startedAt: null,
      completedAt: null,
      pausedAt: null,
      pauseReason: '',
      orchestrationVersion: 1
    };
  }

  function createStep(intent, index) {
    const completed = Boolean(intent.completed);
    const canRun = Boolean(intent.capability && intent.capability.canRun) && intent.available !== false;
    return {
      id: `orchestration-step-${index + 1}`,
      workflowId: intent.workflowId,
      title: intent.title,
      description: intent.description,
      intent,
      selected: !completed,
      completed,
      blocked: !completed && !canRun,
      requiresReview: reviewWorkflowIds.has(intent.workflowId),
      state: completed ? 'completed' : canRun ? 'ready' : 'blocked',
      error: ''
    };
  }

  function refresh(chain, intents) {
    const byWorkflow = new Map((intents || []).map((intent) => [intent.workflowId, intent]));
    chain.steps.forEach((step) => {
      const current = byWorkflow.get(step.workflowId);
      if (!current || step.completed || step.state === 'in-progress') return;
      step.intent = current;
      step.title = current.title;
      step.description = current.description;
      step.completed = Boolean(current.completed);
      const canRun = Boolean(current.capability && current.capability.canRun) && current.available !== false;
      step.blocked = !step.completed && !canRun;
      step.state = step.completed ? 'completed' : step.blocked ? 'blocked' : 'ready';
    });
    return chain;
  }

  function selectedSteps(chain) {
    return chain.steps.filter((step) => step.selected && !step.completed);
  }

  function next(chain) {
    for (let index = chain.currentIndex + 1; index < chain.steps.length; index += 1) {
      const step = chain.steps[index];
      if (!step.selected || step.completed) continue;
      chain.currentIndex = index;
      if (step.blocked) {
        step.state = 'blocked';
        chain.status = 'paused';
        chain.pausedAt = new Date().toISOString();
        chain.pauseReason = `${step.title} is not available with the current source or browser capabilities.`;
        return step;
      }
      step.state = step.requiresReview ? 'review' : 'queued';
      chain.status = step.requiresReview ? 'review' : 'running';
      return step;
    }
    chain.status = 'completed';
    chain.completedAt = new Date().toISOString();
    return null;
  }

  function markRunning(chain, workflowId) {
    const step = chain.steps.find((item) => item.workflowId === workflowId);
    if (step) {
      step.state = 'in-progress';
      chain.status = 'running';
      chain.pauseReason = '';
    }
  }

  function markCompleted(chain, workflowId) {
    const step = chain.steps.find((item) => item.workflowId === workflowId);
    if (step) {
      step.completed = true;
      step.blocked = false;
      step.state = 'completed';
    }
    chain.status = 'running';
  }

  // Distinct from markCompleted: Stage 1 determining a step isn't required (e.g. no dialogue, so
  // no transcript) is not the same fact as the work having been done. Deselecting it removes it
  // from iteration (next() skips unselected steps) without claiming completion that didn't happen.
  function markNotNeeded(chain, workflowId) {
    const step = chain.steps.find((item) => item.workflowId === workflowId);
    if (step) {
      step.selected = false;
      step.completed = false;
      step.blocked = false;
      step.state = 'not-needed';
    }
    chain.status = 'running';
  }

  function markFailed(chain, workflowId, message) {
    const step = chain.steps.find((item) => item.workflowId === workflowId);
    if (step) {
      step.state = 'failed';
      step.error = message || 'This workflow could not be completed.';
    }
    chain.status = 'paused';
    chain.pausedAt = new Date().toISOString();
    chain.pauseReason = step ? step.error : 'The accessibility workflow paused because a step failed.';
  }

  function summary(chain) {
    const selected = chain.steps.filter((step) => step.selected);
    return {
      total: selected.length,
      completed: selected.filter((step) => step.completed).length,
      remaining: selected.filter((step) => !step.completed).length,
      review: selected.filter((step) => step.state === 'review').length,
      blocked: selected.filter((step) => step.state === 'blocked' || step.state === 'failed').length
    };
  }

  window.WorkflowChain = {
    build,
    refresh,
    selectedSteps,
    next,
    markRunning,
    markCompleted,
    markNotNeeded,
    markFailed,
    summary
  };
})();
