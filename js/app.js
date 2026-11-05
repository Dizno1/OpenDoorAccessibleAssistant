(function () {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const chooseFileButton = document.getElementById('choose-file-button');
  const contentInput = document.getElementById('content-input');
  const contentHelp = document.getElementById('content-help');
  const statusRegion = document.getElementById('status-region');
  const inspectionOutput = document.getElementById('inspection-output');
  const assessmentSection = document.getElementById('assessment-section');
  const assessmentSummary = document.getElementById('assessment-summary');
  const assessmentOutput = document.getElementById('assessment-output');
  const recommendationsSection = document.getElementById('recommendations-section');
  const recommendationsSummary = document.getElementById('recommendations-summary');
  const recommendationsOutput = document.getElementById('recommendations-output');
  const planSection = document.getElementById('plan-section');
  const planSummary = document.getElementById('plan-summary');
  const planOutput = document.getElementById('plan-output');
  const knowledgeSection = document.getElementById('knowledge-section');
  const knowledgeSummary = document.getElementById('knowledge-summary');
  const knowledgeOutput = document.getElementById('knowledge-output');
  const viewerSection = document.getElementById('viewer-section');
  const viewerOutput = document.getElementById('viewer-output');
  const mediaAnalysisSection = document.getElementById('media-analysis-section');
  const mediaAnalysisSummary = document.getElementById('media-analysis-summary');
  const mediaAnalysisQuestions = document.getElementById('media-analysis-questions');
  const directGoalSection = document.getElementById('direct-goal-section');
  const directGoalForm = document.getElementById('direct-goal-form');
  const directGoalInput = document.getElementById('direct-goal-input');
  const directGoalSuggestions = document.getElementById('direct-goal-suggestions');
  const currentTaskSection = document.getElementById('current-task-section');
  const currentTaskSummary = document.getElementById('current-task-summary');
  const currentTaskNextButton = document.getElementById('current-task-next-button');
  const renderLaterButton = document.getElementById('render-later-button');
  const startFinalRenderingButton = document.getElementById('start-final-rendering-button');

  // The single place a person should be able to find "what's next" without navigating through
  // assessment, recommendations, or reports. Shows what's already done and offers exactly one
  // button for the next available action, if any.
  // Package creation must never be suggested ahead of rendering the actual accessible video —
  // a package before the video exists is a utility action jumping the queue, not genuine
  // progress. If a chain is actively running or paused, that step always wins over any other
  // suggestion, since it's the thing already in progress.
  function pickNextAction(remaining) {
    if (activeWorkflowChain && ['running', 'review', 'paused'].includes(activeWorkflowChain.status)) {
      const step = activeWorkflowChain.steps[activeWorkflowChain.currentIndex];
      if (step && !step.completed) {
        const match = remaining.find((item) => item.workflowId === step.intent.workflowId);
        if (match) return match;
      }
    }
    // item.available (when present) is the recommendation engine's own readiness verdict, which
    // already accounts for real prerequisites like render-accessible-video needing approved
    // captions and described audio, not just whether a provider is technically installed.
    // item.capability.canRun alone would say "yes" for render the moment a provider exists, even
    // with nothing yet to render.
    const isReady = (item) => item.capability && item.capability.canRun && item.available !== false;
    const renderStep = remaining.find((item) => item.workflowId === 'render-accessible-video' && isReady(item));
    if (renderStep) return renderStep;
    return remaining.find((item) => item.workflowId !== 'accessibility-package' && isReady(item))
      || remaining.find((item) => isReady(item));
  }

  function renderCurrentTask() {
    if (!currentInspection) { currentTaskSection.hidden = true; return; }
    const intents = currentRecommendations ? currentRecommendations.recommendations : window.IntentEngine.getIntents(currentInspection);
    const completed = intents.filter((item) => item.completed);
    const remaining = intents.filter((item) => !item.completed);
    const nextAvailable = pickNextAction(remaining);
    // Do not advertise a generic utility action as the answer to a user's explicit goal.
    const explicitGoal = directGoalInput.dataset.userEdited === 'true' && directGoalInput.value.trim();
    const analysisResults = currentKnowledgeModel ? window.StageOneAnalysis.describeResults(currentKnowledgeModel) : [];
    if (!completed.length && !analysisResults.length && !nextAvailable) { currentTaskSection.hidden = true; return; }
    currentTaskSection.hidden = false;
    // Two different categories, reported as two different sentences: what analysis has determined
    // is never worded as if it were a created artifact ("Create Transcript"), and a created
    // artifact is never worded as if it were merely an analysis result.
    const completedText = completed.length ? `Completed: ${completed.map((item) => `${item.title}`).join(', ')}.` : 'No workflow artifacts completed yet.';
    const analysisText = analysisResults.length ? ` ${analysisResults.join('. ')}.` : '';
    const summaryPrefix = `${completedText}${analysisText}`;
    if (explicitGoal) {
      currentTaskSummary.textContent = `${summaryPrefix} Your request: ${explicitGoal}. Select Start to check whether it can be performed.`;
      currentTaskNextButton.hidden = true;
    } else if (nextAvailable) {
      currentTaskSummary.textContent = `${summaryPrefix} Next recommended action: ${nextAvailable.title}.`;
      currentTaskNextButton.hidden = false;
      currentTaskNextButton.textContent = nextAvailable.actionLabel || nextAvailable.title;
      currentTaskNextButton.onclick = () => runIntent(nextAvailable);
    } else {
      currentTaskSummary.textContent = remaining.length
        ? `${summaryPrefix} The remaining work needs an assistance service configured in Advanced assistance settings.`
        : `${summaryPrefix} All available work is complete.`;
      currentTaskNextButton.hidden = true;
    }
  }

  const directGoalStatus = document.getElementById('direct-goal-status');
  const progressSection = document.getElementById('progress-section');
  const jobStatus = document.getElementById('job-status');
  const jobTimeStatus = document.getElementById('job-time-status');
  const progressBar = document.getElementById('progress-bar');
  const progressSteps = document.getElementById('progress-steps');
  let progressTimer = null;
  // Tracks what was last announced in the one live Workflow Status region (job-status), so
  // frequent progress ticks (e.g. a render reporting position every 750ms) update the visible
  // percentage and time without re-announcing anything. A new announcement is only made when the
  // step changes, the percent crosses a meaningful interval (10/25/50/75/90/100), or the
  // remaining-time category changes.
  let lastAnnouncedStepIndex = null;
  let lastAnnouncedPercentBucket = -1;
  let lastAnnouncedRemainingCategory = '';
  const PERCENT_INTERVALS = [10, 25, 50, 75, 90, 100];
  const cancelJobButton = document.getElementById('cancel-job');
  const transcriptReviewSection = document.getElementById('transcript-review-section');
  const transcriptReviewForm = document.getElementById('transcript-review-form');
  const transcriptReviewSummary = document.getElementById('transcript-review-summary');
  const transcriptTitleInput = document.getElementById('transcript-title');
  const transcriptNoSpeechInput = document.getElementById('transcript-no-speech');
  const transcriptTextInput = document.getElementById('transcript-text');
  const transcriptReviewedInput = document.getElementById('transcript-reviewed');
  const transcriptReviewedLabelText = document.getElementById('transcript-reviewed-label-text');
  const transcriptReviewStatus = document.getElementById('transcript-review-status');
  const cancelTranscriptReviewButton = document.getElementById('cancel-transcript-review');
  const imageDescriptionReviewSection = document.getElementById('image-description-review-section');
  const imageDescriptionReviewForm = document.getElementById('image-description-review-form');
  const imageDescriptionReviewSummary = document.getElementById('image-description-review-summary');
  const imageDescriptionTitleInput = document.getElementById('image-description-title');
  const imageDescriptionTextInput = document.getElementById('image-description-text');
  const imageDescriptionReviewedInput = document.getElementById('image-description-reviewed');
  const imageDescriptionStatus = document.getElementById('image-description-status');
  const draftImageDescriptionButton = document.getElementById('draft-image-description');
  const cancelImageDescriptionButton = document.getElementById('cancel-image-description');
  const captionReviewSection = document.getElementById('caption-review-section');
  const captionReviewForm = document.getElementById('caption-review-form');
  const captionReviewSummary = document.getElementById('caption-review-summary');
  const captionCueEditor = document.getElementById('caption-cue-editor');
  const captionTitleInput = document.getElementById('caption-title');
  const captionCues = document.getElementById('caption-cues');
  const addCaptionCueButton = document.getElementById('add-caption-cue');
  const captionsReviewedInput = document.getElementById('captions-reviewed');
  const captionReviewStatus = document.getElementById('caption-review-status');
  const cancelCaptionReviewButton = document.getElementById('cancel-caption-review');
  const audioDescriptionReviewSection = document.getElementById('audio-description-review-section');
  const audioDescriptionReviewForm = document.getElementById('audio-description-review-form');
  const audioDescriptionReviewSummary = document.getElementById('audio-description-review-summary');
  const audioDescriptionCueEditor = document.getElementById('audio-description-cue-editor');
  const audioDescriptionTitleInput = document.getElementById('audio-description-title');
  const audioDescriptionNotesInput = document.getElementById('audio-description-notes');
  const audioDescriptionCues = document.getElementById('audio-description-cues');
  const addAudioDescriptionCueButton = document.getElementById('add-audio-description-cue');
  const audioDescriptionReviewedInput = document.getElementById('audio-description-reviewed');
  const audioDescriptionReviewStatus = document.getElementById('audio-description-review-status');
  const generateNarrationMixInput = document.getElementById('generate-narration-mix');
  const narrationStyleInput = document.getElementById('narration-style');
  const narrationStyleDetails = document.getElementById('narration-style-details');
  const narrationStyleTechnical = document.getElementById('narration-style-technical');
  const previewNarrationStyleButton = document.getElementById('preview-narration-style');
  const narrationPreviewStatus = document.getElementById('narration-preview-status');
  const narrationSpeedInput = document.getElementById('narration-speed');
  const narrationVolumeInput = document.getElementById('narration-volume');
  const sourceDuckingInput = document.getElementById('source-ducking');
  const aiProviderSection = document.getElementById('ai-provider-section');
  const aiProviderOptions = document.getElementById('ai-provider-options');
  const aiProviderStatus = document.getElementById('ai-provider-status');
  const automaticProviderStatus = document.getElementById('automatic-provider-status');
  const openaiApiKey = document.getElementById('openai-api-key');
  const openaiTranscriptionModel = document.getElementById('openai-transcription-model');
  const openaiVisionModel = document.getElementById('openai-vision-model');
  const azureOpenAIEndpoint = document.getElementById('azure-openai-endpoint');
  const azureOpenAIDeployment = document.getElementById('azure-openai-deployment');
  const azureOpenAIKey = document.getElementById('azure-openai-key');
  const geminiApiKey = document.getElementById('gemini-api-key');
  const geminiModel = document.getElementById('gemini-model');
  const connectedProviderName = document.getElementById('connected-provider-name');
  const connectedProviderEndpoint = document.getElementById('connected-provider-endpoint');
  const connectedProviderModel = document.getElementById('connected-provider-model');
  const connectedProviderKey = document.getElementById('connected-provider-key');
  const connectedProviderCost = document.getElementById('connected-provider-cost');
  const testConnectedProviderButton = document.getElementById('test-connected-provider');
  const draftTranscriptButton = document.getElementById('draft-transcript');
  const draftCaptionsButton = document.getElementById('draft-captions');
  const draftAudioDescriptionButton = document.getElementById('draft-audio-description');
  const cancelAudioDescriptionReviewButton = document.getElementById('cancel-audio-description-review');

  const packageReviewSection = document.getElementById('package-review-section');
  const packageReviewForm = document.getElementById('package-review-form');
  const packageReviewSummary = document.getElementById('package-review-summary');
  const packageNameInput = document.getElementById('package-name');
  const packageArtifactOptions = document.getElementById('package-artifact-options');
  const packagePrivacyNotices = document.getElementById('package-privacy-notices');
  const packagePrivacyConfirm = document.getElementById('package-privacy-confirm');
  const packageReviewStatus = document.getElementById('package-review-status');
  const cancelPackageReviewButton = document.getElementById('cancel-package-review');
  const workflowChainSection = document.getElementById('workflow-chain-section');
  const workflowChainForm = document.getElementById('workflow-chain-form');
  const workflowChainSummary = document.getElementById('workflow-chain-summary');
  const workflowChainSteps = document.getElementById('workflow-chain-steps');
  const workflowChainStatus = document.getElementById('workflow-chain-status');
  const cancelWorkflowChainButton = document.getElementById('cancel-workflow-chain');
  const resultsSection = document.getElementById('results-section');
  const resultsOutput = document.getElementById('results-output');
  const projectWorkspaceSummary = document.getElementById('project-workspace-summary');
  const projectSelect = document.getElementById('project-select');
  const createProjectForm = document.getElementById('create-project-form');
  const newProjectName = document.getElementById('new-project-name');
  const projectWorkspaceStatus = document.getElementById('project-workspace-status');
  const projectDashboard = document.getElementById('project-dashboard');
  const projectFacts = document.getElementById('project-facts');
  const projectSources = document.getElementById('project-sources');
  const projectHistory = document.getElementById('project-history');
  const projectReviewSummary = document.getElementById('project-review-summary');
  const projectReviewStatus = document.getElementById('project-review-status');
  const projectReviews = document.getElementById('project-reviews');
  const projectIntelligenceSummary = document.getElementById('project-intelligence-summary');
  const projectIntelligenceFacts = document.getElementById('project-intelligence-facts');
  const projectIntelligenceActions = document.getElementById('project-intelligence-actions');
  const renameProjectButton = document.getElementById('rename-project');
  const archiveProjectButton = document.getElementById('archive-project');
  const deleteProjectButton = document.getElementById('delete-project');

  let currentFile = null;
  let currentSource = null;
  let currentInspection = null;
  let activeJob = null;
  let pendingTranscriptIntent = null;
  let lastTranscriptProviderName = '';
  let pendingImageDescriptionIntent = null;
  let pendingCaptionIntent = null;
  let captionCueCounter = 0;
  let pendingAudioDescriptionIntent = null;
  let audioDescriptionCueCounter = 0;
  let pendingPackageIntent = null;
  let currentPackageReview = null;
  let currentKnowledgeModel = null;
  let currentAssessment = null;
  let currentPlan = null;
  let currentRecommendations = null;
  let activeWorkflowChain = null;
  const executionEngine = new window.WorkflowExecutionEngine({
    onQueued: queuedProgress,
    onUpdate: updateProgress,
    onComplete: completeProgress,
    onError: failProgress,
    onCancel: cancelProgress
  });


  window.ProductionFeatures.init({
    engine: executionEngine,
    announce: setStatus,
    contextProvider: (snapshot) => {
      if (!currentInspection || !currentSource) return null;
      const sourceName = currentFile ? currentFile.name : (currentSource.name || currentInspection.name || '');
      const expectedName = snapshot.inputReferences && snapshot.inputReferences[0] ? snapshot.inputReferences[0].name : '';
      if (expectedName && sourceName !== expectedName) return null;
      const intent = window.IntentEngine.getIntents(currentInspection).find((item) => item.workflowId === snapshot.workflowId);
      if (!intent) return null;
      const job = window.createJob(intent, currentFile || currentSource, currentInspection);
      job.id = snapshot.id;
      job.projectId = snapshot.projectId || (activeProject() ? activeProject().id : '');
      job.knowledgeModel = currentKnowledgeModel;
      job.assessment = currentAssessment;
      job.accessibilityPlan = currentPlan;
      return job;
    }
  });

  function setStatus(message) {
    statusRegion.textContent = message;
  }

  // The Workflow Status region (progress-section / job-status) is the one live region for
  // Make This Accessible chain-level transitions (start, paused-for-review, complete). Routing
  // these through here instead of also calling setStatus() for the same event avoids two
  // different live regions announcing the same thing back to back.
  function announceWorkflowStatus(message) {
    progressSection.hidden = false;
    jobStatus.textContent = message;
  }


  function activeProject() {
    return window.ProjectWorkspace.getActive();
  }

  function syncCurrentSourceToProject() {
    const project = activeProject();
    if (!project || !currentSource || !currentKnowledgeModel) return;
    window.ProjectWorkspace.addOrUpdateSource(project.id, currentSource, currentKnowledgeModel);
    renderProjectWorkspace();
  }

  function renderProjectWorkspace(message) {
    const projects = window.ProjectWorkspace.list();
    let active = activeProject();
    projectSelect.innerHTML = '<option value="">No active project</option>' + projects.map((project) =>
      `<option value="${escapeHtml(project.id)}" ${active && active.id === project.id ? 'selected' : ''}>${escapeHtml(project.name)}${project.archived ? ' (Archived)' : ''}</option>`
    ).join('');

    if (message) projectWorkspaceStatus.textContent = message;
    if (!active) {
      projectDashboard.hidden = true;
      projectWorkspaceSummary.textContent = 'Create or select a project to organize related sources, workflow history, and generated artifacts.';
      return;
    }

    window.ProjectReview.ensureForProjectHistory(active.id);
    active = activeProject();
    const summary = window.ProjectWorkspace.summary(active);
    projectDashboard.hidden = false;
    projectWorkspaceSummary.textContent = `${active.name} is ${summary.status.toLowerCase()}. It contains ${summary.sourceCount} source${summary.sourceCount === 1 ? '' : 's'} and ${summary.artifactCount} recorded artifact${summary.artifactCount === 1 ? '' : 's'}.`;
    const intelligence = window.ProjectAccessibilityIntelligence.analyze(active);
    projectFacts.innerHTML = [
      ['Project status', intelligence.status],
      ['Sources', String(summary.sourceCount)],
      ['Recorded artifacts', String(summary.artifactCount)],
      ['Completed workflows', String(summary.workflowCount)],
      ['Approved reviews', `${summary.approvalCount} of ${summary.reviewCount}`],
      ['Last updated', formatWorkspaceDate(active.updatedAt)]
    ].map(([label, value]) => fact(label, value)).join('');

    projectIntelligenceSummary.textContent = intelligence.summary;
    projectIntelligenceFacts.innerHTML = [
      ['Accessibility completion', `${intelligence.percentComplete}%`],
      ['Remaining actions', String(intelligence.recommendations.length)],
      ['Out-of-date packages', String(intelligence.stalePackages)],
      ['Pending reviews', String(intelligence.reviewSummary.pending)],
      ['Rejected reviews', String(intelligence.reviewSummary.rejected)]
    ].map(([label, value]) => fact(label, value)).join('');
    projectIntelligenceActions.innerHTML = intelligence.recommendations.length
      ? `<ol class="workspace-list intelligence-action-list">${intelligence.recommendations.map((item) => `<li><h5>${escapeHtml(item.title)} - ${escapeHtml(item.sourceName)}</h5><p><strong>${escapeHtml(titleCase(item.state))}</strong></p><p>${escapeHtml(item.reason)}</p></li>`).join('')}</ol>`
      : '<p>There are no remaining project-wide accessibility actions.</p>';


    const reviews = Array.isArray(active.reviews) ? active.reviews.slice().reverse() : [];
    const reviewSummary = window.ProjectReview.summary(active);
    projectReviewSummary.textContent = reviews.length
      ? `${reviewSummary.pending} pending, ${reviewSummary.approved} approved, and ${reviewSummary.rejected} rejected review${reviews.length === 1 ? '' : 's'}.`
      : 'Completed transcript, caption, audio description, and package work will be added here for human approval.';
    projectReviews.innerHTML = reviews.length ? `<div class="review-list">${reviews.map((review) => {
      const comments = Array.isArray(review.comments) ? review.comments : [];
      const revisions = Array.isArray(review.revisions) ? review.revisions : [];
      return `<article class="review-card" data-review-id="${escapeHtml(review.id)}" aria-labelledby="review-title-${escapeHtml(review.id)}">
        <h4 id="review-title-${escapeHtml(review.id)}">${escapeHtml(review.title)} - ${escapeHtml(review.sourceName)}</h4>
        <p><strong>Status: ${escapeHtml(titleCase(review.status))}</strong></p>
        <p>${review.artifactNames && review.artifactNames.length ? `Files: ${escapeHtml(review.artifactNames.join(', '))}.` : 'No artifact names were recorded.'}</p>
        <form class="review-assignment-form">
          <label for="assignee-${escapeHtml(review.id)}">Assign reviewer</label>
          <input id="assignee-${escapeHtml(review.id)}" name="assignee" type="text" maxlength="100" value="${escapeHtml(review.assignee || '')}">
          <button type="submit">Save assignment</button>
        </form>
        <form class="review-comment-form">
          <div class="form-field"><label for="comment-author-${escapeHtml(review.id)}">Comment author</label><input id="comment-author-${escapeHtml(review.id)}" name="author" type="text" maxlength="100" value="${escapeHtml(review.assignee || review.reviewedBy || '')}"></div>
          <div class="form-field"><label for="comment-${escapeHtml(review.id)}">Review comment</label><textarea id="comment-${escapeHtml(review.id)}" name="comment" rows="3" required></textarea></div>
          <button type="submit">Add comment</button>
        </form>
        <form class="review-decision-form">
          <div class="form-field"><label for="reviewer-${escapeHtml(review.id)}">Reviewer name</label><input id="reviewer-${escapeHtml(review.id)}" name="reviewer" type="text" maxlength="100" value="${escapeHtml(review.reviewedBy || review.assignee || '')}" required></div>
          <div class="form-field"><label for="decision-note-${escapeHtml(review.id)}">Decision note</label><textarea id="decision-note-${escapeHtml(review.id)}" name="note" rows="3">${escapeHtml(review.decisionNote || '')}</textarea></div>
          <div class="next-actions"><button type="submit" name="decision" value="approved">Approve</button><button type="submit" name="decision" value="rejected">Reject and request revision</button><button type="submit" name="decision" value="pending">Return to pending</button></div>
        </form>
        <details><summary>Comments and revision history</summary>
          <h5>Comments</h5>${comments.length ? `<ol>${comments.map((comment) => `<li><strong>${escapeHtml(comment.author)}</strong>: ${escapeHtml(comment.text)} <span class="muted">${escapeHtml(formatWorkspaceDate(comment.createdAt))}</span></li>`).join('')}</ol>` : '<p class="muted">No comments yet.</p>'}
          <h5>Revision history</h5>${revisions.length ? `<ol>${revisions.slice().reverse().map((revision) => `<li><strong>${escapeHtml(titleCase(revision.status))}</strong>: ${escapeHtml(revision.note || 'Status changed.')} <span class="muted">${escapeHtml(formatWorkspaceDate(revision.changedAt))}</span></li>`).join('')}</ol>` : '<p class="muted">No revision history recorded.</p>'}
        </details>
      </article>`;
    }).join('')}</div>` : '<p class="muted">No human reviews have been created yet.</p>';

    const sources = Array.isArray(active.sources) ? active.sources : [];
    projectSources.innerHTML = sources.length ? `<ul class="workspace-list">${sources.map((source) => {
      const knowledge = source.knowledge || {};
      const completed = [
        knowledge.transcriptComplete ? 'Transcript' : '',
        knowledge.captionsComplete ? 'Captions' : '',
        knowledge.audioDescriptionComplete ? 'Audio description' : '',
        knowledge.packageComplete ? 'Accessibility package' : ''
      ].filter(Boolean);
      return `<li><h4>${escapeHtml(source.name)}</h4><p><strong>${escapeHtml(titleCase(source.mediaType || source.type || 'source'))}</strong></p><p>${completed.length ? `Completed: ${escapeHtml(completed.join(', '))}.` : 'No completed accessibility workflows recorded yet.'}</p><p class="muted">${Number(knowledge.resultCount || 0)} artifact${Number(knowledge.resultCount || 0) === 1 ? '' : 's'} recorded. Updated ${escapeHtml(formatWorkspaceDate(source.updatedAt))}.</p></li>`;
    }).join('')}</ul>` : '<p class="muted">No sources have been added. The next source you open will be added automatically.</p>';

    const history = Array.isArray(active.history) ? active.history.slice().reverse() : [];
    projectHistory.innerHTML = history.length ? `<ol class="workspace-list">${history.map((entry) => `<li><h4>${escapeHtml(entry.title)}</h4><p>${escapeHtml(entry.sourceName || 'Source')} - ${escapeHtml(entry.status || 'completed')}</p><p class="muted">${escapeHtml(formatWorkspaceDate(entry.completedAt))}${entry.artifactNames && entry.artifactNames.length ? `. Created ${escapeHtml(entry.artifactNames.join(', '))}.` : ''}</p></li>`).join('')}</ol>` : '<p class="muted">No completed workflows are recorded for this project yet.</p>';
    archiveProjectButton.textContent = active.archived ? 'Restore project' : 'Archive project';
    if (window.AccessibilityAdvisor) window.AccessibilityAdvisor.refresh();
    document.dispatchEvent(new CustomEvent('publication-pipeline-refresh'));
  }

  function formatWorkspaceDate(value) {
    if (!value) return 'Unknown';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
  }

  function renderAIProviders() {
    const providers = window.AIProviderLayer.list();
    const mode = window.AIProviderLayer.getSelectionMode();
    aiProviderOptions.innerHTML = `
      <div class="provider-choice">
        <label><input type="radio" name="aiProvider" value="automatic" ${mode === 'automatic' ? 'checked' : ''}> <strong>Automatic, recommended</strong></label>
        <p>The application chooses the best available method for each task and warns you before external processing or possible charges.</p>
      </div>` + providers.map((provider) => `
      <div class="provider-choice">
        <label><input type="radio" name="aiProvider" value="${escapeHtml(provider.id)}" ${provider.selected ? 'checked' : ''} ${provider.available ? '' : 'aria-describedby="provider-state-' + escapeHtml(provider.id) + '"'}> <strong>${escapeHtml(provider.name)}</strong></label>
        <p>${escapeHtml(provider.description)}</p>
        <p id="provider-state-${escapeHtml(provider.id)}" class="help-text">${provider.available ? 'Available' : 'Needs configuration'}. ${escapeHtml(provider.costMessage)}. ${escapeHtml(provider.privacy)}</p>
      </div>`).join('');
    aiProviderOptions.querySelectorAll('input[name="aiProvider"]').forEach((input) => input.addEventListener('change', () => {
      window.AIProviderLayer.select(input.value);
      aiProviderStatus.textContent = input.value === 'automatic' ? 'Automatic assistance selection enabled.' : `${input.closest('.provider-choice').querySelector('strong').textContent} selected as an advanced override.`;
      renderAIProviders();
    }));
    const openaiConfig = window.OpenAIProvider.getConfiguration();
    openaiTranscriptionModel.value = openaiConfig.transcriptionModel;
    openaiVisionModel.value = openaiConfig.visionModel;
    const azureConfig = window.AzureOpenAIProvider.getConfiguration();
    azureOpenAIEndpoint.value = azureConfig.endpoint;
    azureOpenAIDeployment.value = azureConfig.deployment;
    const geminiConfig = window.GeminiProvider.getConfiguration();
    geminiModel.value = geminiConfig.model;
    const config = window.ConnectedAIProvider.getConfiguration();
    connectedProviderName.value = config.serviceName;
    connectedProviderEndpoint.value = config.endpoint;
    connectedProviderModel.value = config.model;
    connectedProviderCost.value = config.costCategory;
    const summaries = ['transcription-draft', 'caption-draft', 'audio-description-draft', 'visual-analysis', 'narration-audio'].map((capability) => window.AIProviderLayer.getCapability(capability));
    const available = summaries.filter((item) => item.canRun).length;
    automaticProviderStatus.textContent = mode === 'automatic'
      ? `Automatic selection is active. ${available} of ${summaries.length} drafting tasks currently have an available method. Privacy and cost notices appear before any connected service runs.`
      : 'An advanced provider override is active. Return to Automatic, recommended to let the application choose for each task.';
  }

  function describeAssistanceError(error) {
    const base = error && error.message ? error.message : 'The request could not be completed.';
    if (!error || !error.capability) return base;
    const alternative = window.AIProviderLayer.getAlternative(error.capability, error.providerId);
    if (!alternative) return `${base} No other configured method is currently available for this task.`;
    return `${base} ${alternative.name} is also available for this task in Advanced assistance settings, if you would like to try it instead.`;
  }

  function confirmAssistanceUse(capability, statusElement) {
    const notice = window.AIProviderLayer.getExecutionNotice(capability);
    if (!notice.canRun) {
      statusElement.textContent = notice.message;
      return null;
    }
    if (!notice.confirmationRequired) return { confirmed: true, notice };
    statusElement.textContent = notice.notice;
    const confirmed = window.confirm(notice.confirmationText);
    if (!confirmed) {
      statusElement.textContent = 'Assistance request cancelled. No information was sent and no service charge was requested.';
      return null;
    }
    return { confirmed: true, notice };
  }

  // extract-audio (which runs before create-transcript in the Make This Accessible chain for
  // video) produces a separate, much smaller audio-only artifact - a video's audio track is
  // typically a small fraction of the video's total size, and scales with duration rather than
  // resolution/bitrate. Speech-related capabilities should send that instead of the original
  // video wherever it exists, rather than being blocked by a limit that was never really about
  // the video file itself.
  function findExtractedAudioArtifact() {
    if (!currentKnowledgeModel || !currentKnowledgeModel.source || !window.OutputManager) return null;
    return window.OutputManager.listForSource(currentKnowledgeModel.source)
      .find((artifact) => artifact.workflowId === 'extract-audio' && artifact.mimeType && artifact.mimeType.indexOf('audio/') === 0 && artifact.url);
  }

  function effectiveTranscriptionSourceSize() {
    const audioArtifact = findExtractedAudioArtifact();
    if (audioArtifact && Number.isFinite(audioArtifact.size)) return audioArtifact.size;
    // For video, extract-audio runs automatically first in the Make This Accessible chain and
    // produces a file that's typically a small fraction of the original's size. Before that's
    // happened, the honest answer is "not yet known" rather than judging by the raw video, which
    // would otherwise ask an avoidable question before extraction even had a chance to run.
    if (currentInspection && currentInspection.mediaType === 'video') return null;
    return currentFile instanceof File ? currentFile.size : null;
  }

  async function aiContext(includeSourceData, options) {
    const preferExtractedAudio = Boolean(options && options.preferExtractedAudio);
    const transcriptArtifacts = window.OutputManager.listForSource(currentKnowledgeModel && currentKnowledgeModel.source)
      .filter((artifact) => artifact.workflowId === 'create-transcript');
    const transcript = transcriptTextInput.value.trim() || (transcriptArtifacts.find((artifact) => artifact.content) || {}).content || '';
    return {
      sourceName: currentFile ? currentFile.name : (currentInspection ? currentInspection.name : ''),
      mediaType: currentInspection ? currentInspection.mediaType : '',
      durationSeconds: currentInspection ? currentInspection.durationSeconds : 0,
      transcriptText: transcript.replace(/^.*?\n\nSource:.*?\nCreated:.*?\nReviewed:.*?\n\n/s, ''),
      knowledge: currentKnowledgeModel || {},
      sourceData: includeSourceData ? await readSourceData(currentFile, preferExtractedAudio) : null
    };
  }

  const CONNECTED_SERVICE_MAX_BYTES = 50 * 1024 * 1024;

  async function readSourceData(file, preferExtractedAudio) {
    let sourceFile = file;
    let sourceLabel = 'the original file';
    if (preferExtractedAudio) {
      const audioArtifact = findExtractedAudioArtifact();
      if (audioArtifact) {
        const blob = await (await fetch(audioArtifact.url)).blob();
        sourceFile = new File([blob], audioArtifact.name || 'extracted-audio', { type: audioArtifact.mimeType });
        sourceLabel = 'the extracted audio copy';
      }
    }
    if (!(sourceFile instanceof File)) throw new Error('This task requires a file from your device.');
    if (sourceFile.size > CONNECTED_SERVICE_MAX_BYTES) {
      const suggestion = preferExtractedAudio && sourceLabel === 'the original file'
        ? ' Running Extract the Audio first usually produces a much smaller file this can use instead.'
        : '';
      throw new Error(`This connected-service build currently supports files up to 50 MB, and ${sourceLabel} is larger than that.${suggestion} Use a smaller copy or a local service endpoint that accepts larger requests.`);
    }
    const buffer = await sourceFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    return { name: sourceFile.name, mimeType: sourceFile.type || 'application/octet-stream', size: sourceFile.size, base64: btoa(binary) };
  }

  // A request completing without throwing does not mean it produced a usable transcript.
  // Empty text, whitespace-only text, raw JSON, or a status/error-shaped string must not reach
  // the transcript editor.
  function isUsableTranscriptText(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return false;
    if (/^[{[]/.test(trimmed)) return false; // looks like raw JSON
    if (/^(error|failed|failure|http\s*\d{3})/i.test(trimmed)) return false; // looks like a status/error string
    return true;
  }

  async function requestTranscriptDraft() {
    // The bundled local engine is first choice; it does not need cloud consent.
    if (window.__TAURI__?.core?.invoke && currentFile instanceof File) {
      draftTranscriptButton.disabled = true;
      try {
        const invoke = window.__TAURI__.core.invoke;
        const engine = await invoke('transcription_engine_status');
        if (!engine.ready) throw new Error(engine.details);
        transcriptReviewStatus.textContent = 'Transcribing locally. This can take several minutes. Your file stays on this device.';
        const bytes = new Uint8Array(await currentFile.arrayBuffer());
        let binary = '';
        for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
        const srt = await invoke('transcribe_local', { fileName: currentFile.name, fileBase64: btoa(binary) });
        if (!isUsableTranscriptText(srt)) throw new Error('The local engine returned no usable speech.');
        // Keep timestamped SRT for review and downstream caption export.
        transcriptTextInput.value = srt;
        // Persist the generated artifact independently of the review UI and WebView storage.
        try {
          const savedPath = await invoke('workspace_save_transcript', { fileName: currentFile.name, srt });
          transcriptReviewStatus.textContent = `Local transcription finished. Transcript saved to ${savedPath}. Review the text below.`;
        } catch (saveError) {
          transcriptReviewStatus.textContent = `Transcription finished, but saving to Documents failed: ${saveError.message || saveError}. The text remains in the editor.`;
        }
        lastTranscriptProviderName = 'Bundled local Whisper engine';

        // Keep focus where the user left it; announce the completed result instead.
      } catch (error) {
        transcriptReviewStatus.textContent = `Automatic transcription failed. The assistant has not determined whether speech is present. ${error.message || error} You can retry the automatic draft; manual entry is optional.`;
      } finally { draftTranscriptButton.disabled = false; }
      return;
    }
    const approval = confirmAssistanceUse('transcription-draft', transcriptReviewStatus);
    if (!approval) return;
    draftTranscriptButton.disabled = true;
    transcriptReviewStatus.textContent = 'Creating an editable transcript draft using the best available method.';
    try {
      await attemptTranscriptDraft(approval.confirmed, null, []);
    }
    finally { draftTranscriptButton.disabled = false; }
  }

  async function attemptTranscriptDraft(confirmed, forceProviderId, triedProviderIds) {
    let result;
    try {
      const options = { confirmed };
      if (forceProviderId) options.providerId = forceProviderId;
      result = await window.AIProviderLayer.run('transcription-draft', await aiContext(true, { preferExtractedAudio: true }), options);
    } catch (error) {
      const attempted = forceProviderId || (error && error.providerId);
      return handleTranscriptFailure(error, attempted ? triedProviderIds.concat(attempted) : triedProviderIds, confirmed);
    }
    const text = String(result.text || '').trim();
    if (!isUsableTranscriptText(text)) {
      const failure = new Error(`${result.providerName} did not produce a usable transcript.`);
      failure.providerId = result.providerId;
      return handleTranscriptFailure(failure, triedProviderIds.concat(result.providerId), confirmed);
    }
    transcriptTextInput.value = text;
    lastTranscriptProviderName = result.providerName;
    transcriptReviewStatus.textContent = `${result.providerName} returned a draft. Review every word before confirming completion.`;
    transcriptTextInput.focus();
  }

  // Required fallback behavior: on failure or an unusable result, build a ranked list of healthy
  // compatible providers and keep trying, with one concise confirmation per new external provider,
  // until a usable result is produced or every healthy provider has been tried — not just one hop.
  async function handleTranscriptFailure(error, triedProviderIds, confirmed) {
    const message = (error && error.message) || 'That attempt did not produce a transcript.';
    const alternative = window.AIProviderLayer.getAlternative('transcription-draft', triedProviderIds);
    if (!alternative) {
      transcriptReviewStatus.textContent = triedProviderIds.length > 1
        ? `${message} Every available method has been tried. You can try again, enter the transcript manually, or open Advanced assistance settings.`
        : describeAssistanceError(error);
      return;
    }
    const costNote = alternative.external ? ' The audio will be sent to an outside service and charges may apply.' : ' This stays on this device.';
    const proceed = window.confirm(`${message} ${alternative.name} can try next.${costNote}\n\nContinue?`);
    if (!proceed) { transcriptReviewStatus.textContent = `${message} You can try again, or open Advanced assistance settings to choose a specific method.`; return; }
    transcriptReviewStatus.textContent = `Trying ${alternative.name} next.`;
    await attemptTranscriptDraft(true, alternative.id, triedProviderIds);
  }

  async function requestCaptionDraft() {
    draftCaptionsButton.disabled = true;
    captionReviewStatus.textContent = 'Creating an editable caption draft using the best available method.';
    try {
      await attemptCaptionDraft(null, []);
    }
    finally { draftCaptionsButton.disabled = false; }
  }

  async function attemptCaptionDraft(forceProviderId, triedProviderIds) {
    const approval = confirmAssistanceUse('caption-draft', captionReviewStatus);
    if (!approval) return;
    let result;
    try {
      const options = { confirmed: approval.confirmed };
      if (forceProviderId) options.providerId = forceProviderId;
      result = await window.AIProviderLayer.run('caption-draft', await aiContext(true, { preferExtractedAudio: true }), options);
    } catch (error) {
      const attempted = forceProviderId || (error && error.providerId);
      return handleCaptionFailure(error, attempted ? triedProviderIds.concat(attempted) : triedProviderIds);
    }
    const errors = window.CaptionReview.validate(result.cues || [], currentInspection.durationSeconds);
    let cues = result.cues || [];
    let repairNote = '';
    if (errors.length) {
      const repaired = window.CaptionReview.repair(cues, currentInspection.durationSeconds);
      cues = repaired.cues;
      repairNote = repaired.removedCount
        ? ` Timing was automatically corrected; ${repaired.removedCount} cue${repaired.removedCount === 1 ? '' : 's'} without usable timing ${repaired.removedCount === 1 ? 'was' : 'were'} removed.`
        : ' Timing was automatically corrected to fit the media duration.';
    }
    if (!cues.length) {
      const failure = new Error(`${result.providerName} did not produce usable caption timing.`);
      failure.providerId = result.providerId;
      return handleCaptionFailure(failure, triedProviderIds.concat(result.providerId));
    }
    captionCueCounter = 0; captionCues.innerHTML = '';
    cues.forEach((cue) => addCaptionCue(cue));
    captionCueEditor.open = false;
    const durationCovered = cues.length ? formatDuration((window.CaptionReview.timestampToSeconds(cues[cues.length - 1].end) || 0) * 1000) : '0 seconds';
    // captionReviewSummary is the one live announcement for this event, and receives focus right
    // after — a second live region (captionReviewStatus) announcing the same "draft ready" news at
    // the same moment risks exactly the kind of announcement collision a screen reader can garble
    // when it lands alongside a burst of newly-inserted cue fields.
    captionReviewSummary.textContent = `Caption draft ready from ${result.providerName}. ${cues.length} cue${cues.length === 1 ? '' : 's'}. Duration covered: ${durationCovered}. Timing validation ${errors.length ? 'repaired automatically' : 'passed'}.${repairNote} Review with the Viewer, then confirm and save, or use Edit individual caption cues for detailed changes.`;
    /* Focus remains with the user; status is announced without navigation. */
  }

  // Required fallback behavior, matching the transcript pattern: keep trying healthy compatible
  // providers, with one confirmation per new external provider, until a usable draft exists or
  // every provider has failed. Manual cue authoring is only ever revealed as a last resort, never
  // shown by default, and never silently.
  async function handleCaptionFailure(error, triedProviderIds) {
    const message = (error && error.message) || 'That attempt did not produce usable captions.';
    const alternative = window.AIProviderLayer.getAlternative('caption-draft', triedProviderIds);
    if (!alternative) {
      captionReviewStatus.textContent = 'Automated generation could not produce a usable caption draft after trying every available method. Manual authoring is available as an advanced option below. You may need help from someone who can review the video to caption it manually.';
      captionCueEditor.open = true;
      if (!captionCues.children.length) addCaptionCue();
      /* Focus remains with the user; status is announced without navigation. */
      return;
    }
    const costNote = alternative.external ? ' The video or audio will be sent to an outside service and charges may apply.' : ' This stays on this device.';
    const proceed = window.confirm(`${message} ${alternative.name} can try next.${costNote}\n\nContinue?`);
    if (!proceed) { captionReviewStatus.textContent = `${message} You can try again, or open Advanced assistance settings to choose a specific method.`; return; }
    captionReviewStatus.textContent = `Trying ${alternative.name} next.`;
    await attemptCaptionDraft(alternative.id, triedProviderIds);
  }

  async function requestAudioDescriptionDraft() {
    draftAudioDescriptionButton.disabled = true;
    audioDescriptionReviewSummary.textContent = 'Creating an audio-description draft using the best available method.';
    try {
      await attemptAudioDescriptionDraft(null, []);
    }
    finally { draftAudioDescriptionButton.disabled = false; }
  }

  async function attemptAudioDescriptionDraft(forceProviderId, triedProviderIds) {
    const approval = confirmAssistanceUse('audio-description-draft', audioDescriptionReviewStatus);
    if (!approval) return;
    let result;
    try {
      const options = { confirmed: approval.confirmed };
      if (forceProviderId) options.providerId = forceProviderId;
      result = await window.AIProviderLayer.run('audio-description-draft', await aiContext(true), options);
    } catch (error) {
      const attempted = forceProviderId || (error && error.providerId);
      return handleAudioDescriptionFailure(error, attempted ? triedProviderIds.concat(attempted) : triedProviderIds);
    }
    let cues = Array.isArray(result.cues) ? result.cues.filter((cue) => String(cue.text || '').trim()) : [];
    // Quality gate: a multi-minute, visually active video with only one narration cue is
    // suspicious, not a complete draft — most likely a placeholder or a truncated response.
    // Require another attempt rather than presenting it as finished.
    const suspiciouslyThin = Number(currentInspection.durationSeconds) > 120 && cues.length <= 1;
    if (!cues.length || suspiciouslyThin) {
      const failure = new Error(cues.length
        ? `${result.providerName} returned only ${cues.length} narration cue for a longer video, which is not enough coverage to be a complete draft.`
        : `${result.providerName} did not produce usable audio-description narration.`);
      failure.providerId = result.providerId;
      return handleAudioDescriptionFailure(failure, triedProviderIds.concat(result.providerId));
    }
    const errors = window.AudioDescriptionReview.validate(cues, currentInspection.durationSeconds);
    let finalCues = cues;
    let producedBy = result.providerName;
    // "Use multiple providers as a team": when a second healthy provider is available, ask it to
    // critique and improve the first draft rather than presenting the first response untouched.
    // If the critique fails or returns something unusable, the original validated draft is kept —
    // a critique pass is a quality improvement attempt, never a new point of failure.
    const critic = window.AIProviderLayer.getAlternative('audio-description-draft', [result.providerId]);
    if (critic) {
      try {
        audioDescriptionReviewStatus.textContent = `Asking ${critic.name} to review the draft for missing visuals, redundancy, and timing conflicts.`;
        const critiqueContext = Object.assign(await aiContext(true, { preferExtractedAudio: true }), { priorDraftCues: cues });
        const critiqueResult = await window.AIProviderLayer.run('audio-description-draft', critiqueContext, { confirmed: true, providerId: critic.id });
        const critiqued = Array.isArray(critiqueResult.cues) ? critiqueResult.cues.filter((cue) => String(cue.text || '').trim()) : [];
        const critiqueErrors = window.AudioDescriptionReview.validate(critiqued, currentInspection.durationSeconds);
        if (critiqued.length && critiqueErrors.length <= errors.length) {
          finalCues = critiqued;
          producedBy = `${result.providerName}, reviewed and revised by ${critiqueResult.providerName}`;
        }
      } catch (error) { /* Critique is best-effort; keep the original validated draft on any failure. */ }
    }
    const finalErrors = window.AudioDescriptionReview.validate(finalCues, currentInspection.durationSeconds);
    audioDescriptionCueCounter = 0; audioDescriptionCues.innerHTML = '';
    finalCues.forEach((cue) => addAudioDescriptionCue(cue));
    audioDescriptionCueEditor.open = false;
    audioDescriptionReviewSummary.textContent = `Audio-description draft ready for review. ${finalCues.length} narration cue${finalCues.length === 1 ? '' : 's'}. ${finalErrors.length ? 'Some cue timing needs attention — open Edit individual audio-description cues to review it.' : 'Timing validation passed.'} Review with the Viewer, then approve, request another draft, or use Edit individual audio-description cues for detailed changes.`;
    audioDescriptionReviewStatus.textContent = `${producedBy} created this draft.`;
    /* Focus remains with the user; status is announced without navigation. */
  }

  // Required behavior: never leave a blind user facing a blank required narration field. Keep
  // trying every healthy compatible provider, with one confirmation per new external provider,
  // until a usable draft exists or all have failed — matching the transcript and caption pattern.
  async function handleAudioDescriptionFailure(error, triedProviderIds) {
    const message = (error && error.message) || 'No usable audio-description draft was generated.';
    const alternative = window.AIProviderLayer.getAlternative('audio-description-draft', triedProviderIds);
    if (!alternative) {
      audioDescriptionReviewSummary.textContent = 'The assistant could not generate a reliable audio-description draft after trying every available method. Manual authoring is available as an advanced option below. A blind user may need assistance from someone who can review the visual content to write descriptions manually.';
      audioDescriptionReviewStatus.textContent = '';
      /* Focus remains with the user; status is announced without navigation. */
      return;
    }
    const costNote = alternative.external ? ' The video will be sent to an outside service and charges may apply.' : ' This stays on this device.';
    audioDescriptionReviewStatus.textContent = `${message} Trying another available service.`;
    const proceed = window.confirm(`${message} ${alternative.name} can try next.${costNote}\n\nContinue?`);
    if (!proceed) { audioDescriptionReviewStatus.textContent = `${message} You can try again, or open Advanced assistance settings to choose a specific method.`; return; }
    audioDescriptionReviewStatus.textContent = `Trying ${alternative.name} next.`;
    await attemptAudioDescriptionDraft(alternative.id, triedProviderIds);
  }


  async function requestImageDescriptionDraft() {
    const approval = confirmAssistanceUse('visual-analysis', imageDescriptionStatus);
    if (!approval) return;
    draftImageDescriptionButton.disabled = true;
    imageDescriptionStatus.textContent = 'Analyzing the selected image and creating an editable description draft.';
    try {
      const result = await window.AIProviderLayer.run('visual-analysis', await aiContext(true), { confirmed: approval.confirmed });
      imageDescriptionTextInput.value = String(result.description || result.text || '').trim();
      imageDescriptionStatus.textContent = `${result.providerName} returned a draft. Review it against the image before saving.`;
      imageDescriptionTextInput.focus();
    } catch (error) { imageDescriptionStatus.textContent = describeAssistanceError(error); }
    finally { draftImageDescriptionButton.disabled = false; }
  }

  async function saveSourceToWorkspace(file) {
    if (!window.__TAURI__?.core?.invoke || !(file instanceof File)) return;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
      const path = await window.__TAURI__.core.invoke('workspace_import', { fileName: file.name, fileBase64: btoa(binary) });
      if (currentFile === file) contentHelp.textContent = `${file.name} selected. A working copy was saved to ${path}. Your original file is unchanged.`;
    } catch (error) {
      if (currentFile === file) contentHelp.textContent = `${file.name} selected. The original file is unchanged. Workspace copy failed: ${error.message || error}`;
    }
  }

  async function handleFile(file) {
    if (!file) return;

    currentFile = file;
    currentSource = { type: 'file', name: file.name, file };
    currentInspection = null;
    currentKnowledgeModel = null;
    currentAssessment = null;
    currentPlan = null;
    currentRecommendations = null;
    activeJob = null;
    resetViewer();
    resetKnowledge();
    resetAssessment();
    resetMediaAnalysis();
    resetRecommendations();
    resetPlan();
    resetProgress();
    resetResults();
    resetTranscriptReview();
    resetImageDescriptionReview();
    resetCaptionReview();
    resetAudioDescriptionReview();
    resetPackageReview();
    resetWorkflowChain();

    contentInput.value = file.name;
    contentInput.dataset.loadedSource = file.name;
    contentHelp.textContent = `${file.name} selected. The file stays on this device.`;
    // Store a discoverable working copy in Documents without changing the original.
    void saveSourceToWorkspace(file);

    setStatus(`Checking ${file.name}.`);
    inspectionOutput.hidden = false;
    inspectionOutput.innerHTML = '<p class="muted">Checking the file...</p>';

    try {
      currentInspection = await window.MediaInspector.inspect(file);
      renderInspection(currentInspection);
      renderAssessment(currentInspection);
      renderMediaAnalysis();
      runAutomaticAudioAnalysis(file);
      renderPlan(currentInspection);
      renderRecommendations(currentInspection);
      renderKnowledge();
      window.AdvancedAccessibilityAnalysis.setContext(currentInspection, currentKnowledgeModel, currentFile);
      ensureWorkItem();
      syncCurrentSourceToProject();
      await renderViewer(file, currentInspection);
      directGoalSection.hidden = false;
      renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
      if (directGoalInput.dataset.userEdited !== 'true') directGoalInput.value = suggestedGoal(currentInspection.mediaType);
      directGoalStatus.textContent = '';
      setStatus(buildContentAcknowledgement(currentInspection, false) + lastRestorationNote);
    } catch (error) {
      console.error(error);
      setStatus('This file could not be checked. Try another file.');
      inspectionOutput.innerHTML = '<p role="alert">This file could not be checked. Try another file.</p>';
    }
  }

  // Interpret what was typed before rejecting it: a bare filename or a Windows-style local path
  // is a common, reasonable thing to paste where a web address was expected, and deserves a
  // specific explanation rather than a generic "invalid URL" message.
  function buildContentAcknowledgement(inspection, isUrl) {
    const type = titleCase(inspection.mediaType);
    const parts = isUrl ? [`${type} address detected.`] : [`${inspection.name} selected.`, `${type} detected.`];
    if (inspection.durationSeconds) parts.push(`Duration: ${inspection.durationLabel}.`);
    if (inspection.mediaType !== 'unknown') parts.push(`Suggested request: ${suggestedGoal(inspection.mediaType)}.`);
    return parts.join(' ');
  }

  function looksLikeLocalFileReference(value) {
    return localFileReferenceKind(value) !== '';
  }

  function localFileReferenceKind(value) {
    if (/^[a-zA-Z]:[\\/]/.test(value)) return 'windows-path'; // C:\... or C:/...
    if (/^\\\\/.test(value)) return 'windows-path'; // \\server\share style path
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) return ''; // has a real scheme already
    if (/[\\/]/.test(value)) return ''; // has a path separator but no scheme; not a bare filename
    return /\.[A-Za-z0-9]{2,5}$/.test(value) ? 'filename' : ''; // e.g. "Movie.mp4" with no spaces or separators
  }

  function describeLocalFileReference(value) {
    return localFileReferenceKind(value) === 'windows-path'
      ? 'That looks like a local Windows path. Browsers cannot open it directly. Choose the file from your computer to continue.'
      : 'That looks like the name of a local file. Choose the file from your computer to continue.';
  }

  async function handleUrl(rawUrl) {
    const value = String(rawUrl || '').trim();
    if (!value) { contentHelp.textContent = 'Choose a file or enter a web address.'; contentInput.focus(); return; }
    if (currentFile && value === contentInput.dataset.loadedSource) {
      contentHelp.textContent = `${currentFile.name} is already loaded and ready.`;
      return;
    }
    if (looksLikeLocalFileReference(value)) {
      contentHelp.textContent = describeLocalFileReference(value);
      chooseFileButton.focus();
      return;
    }

    contentInput.dataset.loadedSource = '';
    currentFile = null;
    currentSource = null;
    currentInspection = null;
    currentKnowledgeModel = null;
    currentAssessment = null;
    currentPlan = null;
    currentRecommendations = null;
    activeJob = null;
    resetViewer();
    resetKnowledge();
    resetAssessment();
    resetMediaAnalysis();
    resetRecommendations();
    resetPlan();
    resetProgress();
    resetResults();
    resetTranscriptReview();
    resetImageDescriptionReview();
    resetCaptionReview();
    resetAudioDescriptionReview();
    resetPackageReview();
    resetWorkflowChain();

    inspectionOutput.hidden = false;
    inspectionOutput.innerHTML = '<p class="muted">Checking the web address...</p>';
    setStatus('Checking the web address.');

    try {
      currentInspection = await window.MediaInspector.inspectUrl(value);
      currentSource = {
        type: 'url',
        name: currentInspection.name,
        url: currentInspection.sourceUrl
      };
      contentInput.value = currentInspection.sourceUrl;
      contentInput.dataset.loadedSource = currentInspection.sourceUrl;
      contentHelp.textContent = `Using ${currentInspection.sourceHost}.`;
      fileInput.value = '';

      renderInspection(currentInspection);
      renderAssessment(currentInspection);
      renderMediaAnalysis();
      renderPlan(currentInspection);
      renderRecommendations(currentInspection);
      renderKnowledge();
      window.AdvancedAccessibilityAnalysis.setContext(currentInspection, currentKnowledgeModel, currentFile);
      ensureWorkItem();
      syncCurrentSourceToProject();
      await renderViewer(currentSource, currentInspection);
      directGoalSection.hidden = false;
      renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
      if (directGoalInput.dataset.userEdited !== 'true') directGoalInput.value = suggestedGoal(currentInspection.mediaType);
      directGoalStatus.textContent = '';
      setStatus(buildContentAcknowledgement(currentInspection, true) + lastRestorationNote);
    } catch (error) {
      console.error(error);
      currentSource = null;
      setStatus('That web address could not be used. Check it and try again.');
      inspectionOutput.innerHTML = `<p role="alert">${escapeHtml(error.message || 'That web address could not be used. Check it and try again.')}</p>`;
      contentInput.focus();
    }
  }

  function renderInspection(inspection) {
    inspectionOutput.hidden = true;
    inspectionOutput.innerHTML = '';
  }

  function fact(label, value) {
    return `<div class="fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }


  let lastRestorationNote = '';

  function renderAssessment(inspection) {
    const baseModel = window.AccessibilityIntelligence.buildKnowledgeModel(inspection);
    const storedModel = window.SharedKnowledge.load(baseModel.source);
    currentKnowledgeModel = storedModel ? window.SharedKnowledge.merge(baseModel, storedModel) : baseModel;
    lastRestorationNote = '';
    if (storedModel) {
      const categories = ['transcript', 'captions', 'audioDescription', 'imageDescription'];
      let restoredTextCount = 0;
      categories.forEach((category) => {
        const record = currentKnowledgeModel.accessibility && currentKnowledgeModel.accessibility[category];
        if (record && Array.isArray(record.artifacts) && record.artifacts.length) {
          const beforeCount = window.OutputManager.listForSource(currentKnowledgeModel.source).length;
          window.OutputManager.restore(currentKnowledgeModel.source, record.artifacts);
          restoredTextCount += window.OutputManager.listForSource(currentKnowledgeModel.source).length - beforeCount;
        }
      });
      // Honest about the actual gap: text content (transcript, captions, AD script) survives a
      // page reload and is usable immediately. Generated audio — the described-audio mix and any
      // narration clips — does not; it only ever existed as an in-memory blob URL in the browser
      // tab that created it, and that is gone once the session ends. Restoring audio safely would
      // need a different, larger storage approach than what saves everything else, and has not
      // been built. Saying so directly here is the alternative to a person discovering it only
      // after "Make This Accessible" runs all the way to rendering and fails.
      const hadAudioMix = Boolean(currentKnowledgeModel.audio && currentKnowledgeModel.audio.describedMix);
      lastRestorationNote = restoredTextCount
        ? ` Previously completed work was found and restored: ${restoredTextCount} saved text result${restoredTextCount === 1 ? '' : 's'} (such as transcript, captions, or the audio-description script). Older saved work without usable text will need to be created again. Generated audio, including any described-audio mix, does not survive a page reload and will need to be created again${hadAudioMix ? ' before rendering can continue' : ''}.`
        : ' Previously completed work was found for this source, but none of it had restorable text content, so it will need to be created again.';
    }
    currentAssessment = window.AccessibilityAssessment.assess(currentKnowledgeModel);
    assessmentSection.hidden = false;
    assessmentSummary.textContent = currentAssessment.summary;

    if (!currentAssessment.items.length) {
      assessmentOutput.innerHTML = '<p>No assessment items are available for this source yet.</p>';
      return;
    }

    assessmentOutput.innerHTML = `
      <p class="muted">This first assessment uses the source type and technical details already available. Deeper speech and visual analysis will improve future recommendations.</p>
      <ul class="assessment-list">
        ${currentAssessment.items.map((entry) => `
          <li>
            <h3>${escapeHtml(entry.title)}</h3>
            <p><strong>${escapeHtml(entry.status)}</strong></p>
            <p>${escapeHtml(entry.reason)}</p>
            <p class="muted">${escapeHtml(entry.confidence)}</p>
          </li>
        `).join('')}
      </ul>
      <p class="analysis-status">Initial analysis completed. ${currentAssessment.pendingAnalysis} deeper analysis area${currentAssessment.pendingAnalysis === 1 ? '' : 's'} remain.</p>
    `;
  }

  function resetAssessment() {
    assessmentSection.hidden = true;
    assessmentSummary.textContent = 'The assessment will appear after the source is checked.';
    assessmentOutput.innerHTML = '';
  }

  // Stage 1, per docs/Stage 1 Engine-Orchestrated Analysis Directive.md: shows what is actually
  // known about the source and, for anything unresolved, either explains that a real engine will
  // resolve it or offers a direct, explicit question — never silently assumes a fixed pipeline
  // (e.g. "video has audio, so a transcript is required") from the media type alone.
  // Runs real local audio-signal analysis (js/audio-signal-analysis.js) automatically once per
  // source, instead of asking the person a question the assistant could answer itself. Only
  // resolves anything when the measurement is reliable (essentially silent); otherwise it leaves
  // the question genuinely unresolved and explains why, rather than guessing.
  async function runAutomaticAudioAnalysis(file) {
    if (!currentKnowledgeModel || !currentKnowledgeModel.audio || !currentKnowledgeModel.audio.present) return;
    if (currentKnowledgeModel.audio.speech.status !== 'not-analyzed') return; // already resolved, e.g. restored from a prior session
    if (!window.AudioSignalAnalysis || !(file instanceof File)) return;
    const analyzedFile = file;
    currentKnowledgeModel.audio.speech.analyzing = true;
    renderMediaAnalysis();
    const result = await window.AudioSignalAnalysis.analyzeAudioTrack(file);
    // If the source changed while this was running, the result no longer applies to what's on screen.
    if (currentFile !== analyzedFile || !currentKnowledgeModel) return;
    currentKnowledgeModel.audio.speech.analyzing = false;
    if (result.supported && result.essentiallySilent) {
      currentKnowledgeModel.audio.speech.status = 'silence-detected';
      window.SharedKnowledge.save(currentKnowledgeModel);
    } else {
      currentKnowledgeModel.audio.speech.localAnalysisNote = result.supported ? 'has-audio-content' : 'unsupported';
    }
    renderMediaAnalysis();
    renderCurrentTask();
  }

  // Keeps model.audio.speech.engineFileTooLarge in sync with reality, so Stage 1 never claims "an
  // engine will handle this automatically" for a file that's already known to exceed that engine's
  // size limit - the same check openTranscriptReview makes before actually attempting a draft,
  // run here too so the mismatch is caught before the person is routed into a workflow expecting
  // it to just work.
  function updateEngineFileCompatibility() {
    if (!currentKnowledgeModel || !currentKnowledgeModel.audio) return;
    const capability = window.AIProviderLayer.getCapability('transcription-draft');
    const effectiveSize = effectiveTranscriptionSourceSize();
    const tooLarge = Boolean(capability.canRun && capability.provider && capability.provider.external
      && Number.isFinite(effectiveSize) && effectiveSize > CONNECTED_SERVICE_MAX_BYTES);
    if (currentKnowledgeModel.audio.speech.engineFileTooLarge !== tooLarge) {
      currentKnowledgeModel.audio.speech.engineFileTooLarge = tooLarge;
    }
  }

  function renderMediaAnalysis() {
    if (!currentKnowledgeModel) { mediaAnalysisSection.hidden = true; return; }
    updateEngineFileCompatibility();
    const status = window.StageOneAnalysis.resolve(currentKnowledgeModel);
    if (!status.questions.length) { mediaAnalysisSection.hidden = true; return; }
    mediaAnalysisSection.hidden = false;

    if (!status.unresolved.length) {
      mediaAnalysisSummary.textContent = 'Available media checks have finished. Speech and meaningful sound analysis may still be pending.';
      mediaAnalysisQuestions.innerHTML = status.questions.map(describeResolvedQuestion).join('');
      return;
    }

    mediaAnalysisSummary.textContent = 'Some media properties are not yet verified. Select Start to begin available analysis and accessibility work. No answer is required from you.';
    mediaAnalysisQuestions.innerHTML = status.questions.map((question) => {
      if (question.resolved) return describeResolvedQuestion(question);
      if (question.id === 'speech') {
        return `<div class="media-analysis-question"><p>Speech presence has not yet been verified. The assistant will analyze the audio automatically. No answer is required from you.</p></div>`;
      }
      if (question.id === 'nonSpeechAudio') {
        return `<div class="media-analysis-question"><p>Meaningful non-speech sounds have not yet been assessed automatically. This remains an open accessibility task.</p></div>`;
      }
      return '';
    }).join('');

    const configureButton = document.getElementById('configure-speech-engine');
    if (configureButton) configureButton.addEventListener('click', openAssistanceSettings);
    const presentButton = document.getElementById('report-speech-present');
    if (presentButton) presentButton.addEventListener('click', () => recordSpeechAnswer('reported-present'));
    const noneButton = document.getElementById('report-speech-none');
    if (noneButton) noneButton.addEventListener('click', () => recordSpeechAnswer('reported-none'));
    const nonSpeechPresentButton = document.getElementById('report-non-speech-present');
    if (nonSpeechPresentButton) nonSpeechPresentButton.addEventListener('click', () => recordNonSpeechAudioAnswer('reported-present'));
    const nonSpeechNoneButton = document.getElementById('report-non-speech-none');
    if (nonSpeechNoneButton) nonSpeechNoneButton.addEventListener('click', () => recordNonSpeechAudioAnswer('reported-none'));
  }

  function describeResolvedQuestion(question) {
    if (question.id === 'speech') {
      const label = question.status === 'silence-detected'
        ? 'Automated audio analysis found this recording is essentially silent throughout, so it has neither spoken dialogue nor significant other sound.'
        : question.status === 'reported-none'
          ? 'You indicated this recording has little or no spoken dialogue.'
          : question.status === 'reported-present'
            ? 'You indicated this recording has spoken dialogue.'
            : `Speech analysis will run using ${escapeHtml(question.providerName || 'the configured assistance service')} when you begin.`;
      return `<p>${escapeHtml(label)}</p>`;
    }
    if (question.id === 'nonSpeechAudio') {
      const label = question.status === 'silence-detected'
        ? '' // already covered by the speech question's message above
        : question.status === 'reported-present'
          ? 'You indicated there are meaningful non-speech sounds, so captions will be created for them.'
          : 'You indicated there are no meaningful non-speech sounds, so captions are not required for this recording.';
      return label ? `<p>${escapeHtml(label)}</p>` : '';
    }
    return '';
  }

  function recordNonSpeechAudioAnswer(status) {
    if (!currentKnowledgeModel) return;
    if (!currentKnowledgeModel.audio.nonSpeechSignificant) currentKnowledgeModel.audio.nonSpeechSignificant = {};
    currentKnowledgeModel.audio.nonSpeechSignificant.status = status;
    window.SharedKnowledge.save(currentKnowledgeModel);
    renderMediaAnalysis();
    renderCurrentTask();
    /* Focus remains with the user; status is announced without navigation. */
  }

  function openAssistanceSettings() {
    const outerDetails = aiProviderSection.querySelector('details');
    if (outerDetails) outerDetails.open = true;
    const advancedDetails = document.getElementById('advanced-provider-settings');
    if (advancedDetails) advancedDetails.open = true;
    aiProviderSection.scrollIntoView();
    document.getElementById('ai-provider-heading').focus();
  }

  function recordSpeechAnswer(status) {
    if (!currentKnowledgeModel) return;
    currentKnowledgeModel.audio.speech.status = status;
    window.SharedKnowledge.save(currentKnowledgeModel);
    renderMediaAnalysis();
    /* Focus remains with the user; status is announced without navigation. */
  }

  function resetMediaAnalysis() {
    mediaAnalysisSection.hidden = true;
    mediaAnalysisSummary.textContent = '';
    mediaAnalysisQuestions.innerHTML = '';
  }

  function renderPlan(inspection) {
    const intents = window.IntentEngine.getIntents(inspection);
    currentPlan = window.AccessibilityPlan.build(currentKnowledgeModel, currentAssessment, intents);
    planSection.hidden = false;
    planSummary.textContent = currentPlan.summary;

    if (!currentPlan.steps.length) {
      planOutput.innerHTML = '<p>No accessibility plan is available for this source yet.</p>';
      return;
    }

    planOutput.innerHTML = `
      <p class="muted">The assistant ordered this work so later steps can reuse earlier analysis instead of starting over.</p>
      <ol class="accessibility-plan-list">
        ${currentPlan.steps.map((step) => `
          <li>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.purpose)}</p>
            <p><strong>Status:</strong> ${escapeHtml(planStatusLabel(step.status))}</p>
            <p class="muted">${escapeHtml(step.availability)}</p>
            ${step.dependencies.length ? `<p class="muted"><strong>Uses:</strong> ${escapeHtml(step.dependencies.map((dependency) => planStepTitle(dependency)).join(', '))}</p>` : ''}
          </li>
        `).join('')}
      </ol>
      <p class="analysis-status">The future single action will be called "${escapeHtml(currentPlan.recommendedAction)}." It will run only the work that is needed and available.</p>
    `;
  }


  function renderRecommendations(inspection) {
    const intents = window.IntentEngine.getIntents(inspection);
    currentRecommendations = window.RecommendationEngine.build(
      currentKnowledgeModel,
      currentAssessment,
      currentPlan,
      intents
    );

    recommendationsSection.hidden = false;
    recommendationsSummary.textContent = currentRecommendations.summary;

    if (!currentRecommendations.recommendations.length) {
      recommendationsOutput.innerHTML = '<p>No recommendations are available for this source yet.</p>';
      return;
    }

    recommendationsOutput.innerHTML = `
      <p class="muted">Recommendations are ranked from Shared Knowledge, missing accessibility features, workflow order, completed work, and provider availability.</p>
      <ol class="smart-recommendation-list">
        ${currentRecommendations.recommendations.map((item) => `
          <li data-recommendation-level="${escapeHtml(item.recommendationLevel.toLowerCase().replace(/\s+/g, '-'))}">
            <h3>${escapeHtml(item.title)}</h3>
            <p><strong>${escapeHtml(item.recommendationLevel)}</strong></p>
            <p>${escapeHtml(item.recommendationReason)}</p>
            ${item.isTopRecommendation ? '<p class="analysis-status">Best next action for this source.</p>' : ''}
          </li>
        `).join('')}
      </ol>
    `;
  }

  function resetRecommendations() {
    currentRecommendations = null;
    recommendationsSection.hidden = true;
    recommendationsSummary.textContent = 'Prioritized recommendations will appear after the source is checked.';
    recommendationsOutput.innerHTML = '';
  }

  function resetPlan() {
    currentPlan = null;
    planSection.hidden = true;
    planSummary.textContent = 'The plan will appear after the source is checked.';
    planOutput.innerHTML = '';
  }

  function planStatusLabel(status) {
    return ({
      complete: 'Complete',
      ready: 'Available now',
      'template-only': 'Preparation only',
      planned: 'Planned'
    })[status] || 'Planned';
  }

  function planStepTitle(id) {
    const definition = window.AccessibilityPlan.taskDefinitions[id];
    return definition ? definition.title : id;
  }



  function renderKnowledge() {
    if (!currentKnowledgeModel) {
      resetKnowledge();
      return;
    }

    const summary = window.SharedKnowledge.summarize(currentKnowledgeModel);
    const results = Array.isArray(currentKnowledgeModel.results) ? currentKnowledgeModel.results : [];
    knowledgeSection.hidden = false;
    knowledgeSummary.textContent = summary.results
      ? `${summary.results} created result${summary.results === 1 ? '' : 's'} are saved in the shared knowledge for this source.`
      : 'The source inspection is saved in shared knowledge. Created results will be added here and reused by later actions.';

    knowledgeOutput.innerHTML = `
      <p><strong>Completed knowledge areas:</strong> ${summary.completed}</p>
      ${summary.restored ? '<p class="analysis-status">Previous work for this source was restored from this browser.</p>' : ''}
      ${results.length ? `
        <h3>Results available to later actions</h3>
        <ul class="results-list">
          ${results.map((result) => `
            <li>
              <strong>${escapeHtml(result.name)}</strong>
              <span>${escapeHtml(result.type || 'Created result')}</span>
              <p>${escapeHtml(result.description || '')}</p>
            </li>
          `).join('')}
        </ul>
      ` : '<p class="muted">No workflow results have been created for this source yet.</p>'}
    `;
  }

  function resetKnowledge() {
    knowledgeSection.hidden = true;
    knowledgeSummary.textContent = 'Saved analysis and results will appear here.';
    knowledgeOutput.innerHTML = '';
  }

  let currentAccessiblePlayer = null;

  async function renderViewer(source, inspection) {
    viewerSection.hidden = false;
    if (currentAccessiblePlayer) { currentAccessiblePlayer.destroy(); currentAccessiblePlayer = null; }
    viewerOutput.innerHTML = '';

    if (inspection.sourceType === 'url') {
      renderUrlViewer(source, inspection);
      return;
    }

    const file = source;
    const objectUrl = URL.createObjectURL(file);
    const type = inspection.mediaType;

    if (type === 'video') {
      currentAccessiblePlayer = window.AccessiblePlayer.create(viewerOutput, {
        mediaType: 'video',
        src: objectUrl,
        type: file.type,
        title: `Video preview for ${file.name}`
      });
      return;
    }

    if (type === 'audio') {
      currentAccessiblePlayer = window.AccessiblePlayer.create(viewerOutput, {
        mediaType: 'audio',
        src: objectUrl,
        type: file.type,
        title: `Audio player for ${file.name}`
      });
      return;
    }

    if (type === 'image') {
      const image = document.createElement('img');
      image.src = objectUrl;
      image.alt = `Selected image: ${file.name}`;
      image.className = 'image-viewer';
      viewerOutput.appendChild(image);
      return;
    }

    if (file.type === 'application/pdf' || inspection.extension === 'pdf') {
      const frame = document.createElement('iframe');
      frame.src = objectUrl;
      frame.title = `PDF viewer for ${file.name}`;
      frame.className = 'document-viewer';
      viewerOutput.appendChild(frame);

      const fallback = document.createElement('p');
      fallback.className = 'help-text';
      fallback.textContent = 'If the PDF does not appear here, open the original file with your usual PDF reader.';
      viewerOutput.appendChild(fallback);
      return;
    }

    if (
      file.type.startsWith('text/') ||
      ['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm'].includes(inspection.extension)
    ) {
      try {
        const text = await file.text();
        const pre = document.createElement('pre');
        pre.className = 'text-viewer';
        pre.tabIndex = 0;
        pre.textContent = text;
        viewerOutput.appendChild(pre);
      } catch (error) {
        viewerOutput.innerHTML = '<p>This text file could not be displayed.</p>';
      }
      return;
    }

    viewerOutput.innerHTML = '<p>This file cannot be shown here yet. The file details and available choices are still available below.</p>';
  }

  function renderUrlViewer(source, inspection) {
    const url = inspection.sourceUrl;

    if (inspection.youtubeId) {
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(inspection.youtubeId)}`;
      frame.title = `Video viewer for ${inspection.name}`;
      frame.className = 'video-embed';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      viewerOutput.appendChild(frame);
      appendOpenLink(url, 'Open the video on its website');
      return;
    }

    if (inspection.mediaType === 'video' && inspection.isDirectMedia) {
      currentAccessiblePlayer = window.AccessiblePlayer.create(viewerOutput, {
        mediaType: 'video',
        src: url,
        title: `Video from ${inspection.sourceHost}`
      });
      appendOpenLink(url, 'Open the original video');
      return;
    }

    if (inspection.mediaType === 'audio' && inspection.isDirectMedia) {
      currentAccessiblePlayer = window.AccessiblePlayer.create(viewerOutput, {
        mediaType: 'audio',
        src: url,
        title: `Audio from ${inspection.sourceHost}`
      });
      appendOpenLink(url, 'Open the original audio');
      return;
    }

    if (inspection.mediaType === 'image' && inspection.isDirectMedia) {
      const image = document.createElement('img');
      image.src = url;
      image.alt = `Image from ${inspection.sourceHost}`;
      image.className = 'image-viewer';
      viewerOutput.appendChild(image);
      appendOpenLink(url, 'Open the original image');
      return;
    }

    if (inspection.extension === 'pdf') {
      const frame = document.createElement('iframe');
      frame.src = url;
      frame.title = `PDF viewer for ${inspection.name}`;
      frame.className = 'document-viewer';
      viewerOutput.appendChild(frame);
      appendOpenLink(url, 'Open the PDF in a new tab');
      return;
    }

    const card = document.createElement('div');
    card.className = 'viewer-link-card';
    card.innerHTML = '<p>This web source cannot be displayed safely inside the assistant. You can open it in a new tab and continue using the choices below.</p>';
    viewerOutput.appendChild(card);
    appendOpenLink(url, 'Open this web source');
  }

  function appendOpenLink(url, label) {
    const paragraph = document.createElement('p');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'web-source-link';
    link.textContent = label;
    paragraph.appendChild(link);
    viewerOutput.appendChild(paragraph);
  }

  function resetViewer() {
    viewerSection.hidden = true;
    if (currentAccessiblePlayer) { currentAccessiblePlayer.destroy(); currentAccessiblePlayer = null; }
    viewerOutput.innerHTML = '';
  }

  function suggestedGoal(mediaType) {
    if (mediaType === 'audio') return 'Transcribe this audio';
    if (mediaType === 'image') return 'Describe this picture';
    if (mediaType === 'video') return 'Make this video accessible';
    if (mediaType === 'document') return 'Extract the text';
    if (mediaType === 'archive') return 'List what is inside';
    return '';
  }

  // Only requests that matchDirectGoal() actually recognizes are offered as suggestions.
  // A suggestion that does not work would be worse than no suggestion at all.
  function suggestionsFor(mediaType) {
    if (mediaType === 'video') return ['Make this video accessible', 'Transcribe this video', 'Create captions', 'Create audio description', 'Extract the audio', 'Compress this video'];
    if (mediaType === 'audio') return ['Transcribe this audio', 'Compress this audio', 'Normalize the volume'];
    if (mediaType === 'image') return ['Describe this picture', 'Detect text in this image', 'Compress this image', 'Resize this image'];
    if (mediaType === 'document') return ['Extract the text', 'Detect text in this document'];
    if (mediaType === 'archive') return ['List what is inside'];
    return [];
  }

  function renderGoalSuggestions(mediaType) {
    directGoalSuggestions.innerHTML = suggestionsFor(mediaType).map((text) => `<option value="${escapeHtml(text)}"></option>`).join('');
  }

  function matchDirectGoal(value) {
    const text = String(value || '').trim().toLowerCase();
    const intents = currentRecommendations ? currentRecommendations.recommendations : window.IntentEngine.getIntents(currentInspection);
    if (/make .*accessible|accessib.*video|prepare .*publication|complete accessibility/.test(text)) {
      // Start is the trigger for analysis, not a reward for completing it. Unknown
      // speech must remain unknown, but must never become a user-facing prerequisite.
      // The transcript step runs the available engine and can establish speech later.
      updateEngineFileCompatibility();
      const transcriptionNeeded = !currentKnowledgeModel || window.StageOneAnalysis.transcriptionNeeded(currentKnowledgeModel);
      const captionsNeeded = !currentKnowledgeModel || window.StageOneAnalysis.captionsNeeded(currentKnowledgeModel);
      const excluded = new Set();
      if (!transcriptionNeeded) excluded.add('create-transcript');
      if (!captionsNeeded) excluded.add('create-captions');
      const chainIntents = excluded.size ? intents.filter((item) => !excluded.has(item.workflowId)) : intents;
      const plan = window.WorkflowChain.build(chainIntents, currentInspection.mediaType);
      if (window.WorkflowChain.selectedSteps(plan).length) return { chain: plan };
    }
    const mediaType = currentInspection.mediaType;
    const workflowId = /transcrib|speech.*text|audio.*text/.test(text) ? 'create-transcript'
      : /describe|alt text|image description|picture/.test(text) ? 'generate-alt-text'
      : /publish|publication|render.*accessible|final.*video/.test(text) ? 'render-accessible-video'
      : /caption|subtitle/.test(text) ? 'create-captions'
      : /audio description|describe.*video|narration/.test(text) ? 'audio-description'
      : /extract.*audio|save.*audio/.test(text) ? 'extract-audio'
      : /normalize|loudness|volume/.test(text) ? 'normalize-audio'
      : /compress|smaller|reduce.*size|shrink/.test(text) ? (mediaType === 'audio' ? 'compress-audio' : mediaType === 'image' ? 'compress-image' : 'compress-video')
      : /resize|dimensions|scale.*image/.test(text) ? 'resize-image'
      : /ocr|detect.*text|read.*text/.test(text) ? (mediaType === 'document' ? 'ocr-document' : 'ocr-image')
      : /extract.*text|plain text|text file/.test(text) ? 'extract-document-text'
      : /what.*inside|list.*file|archive.*content/.test(text) ? 'inspect-archive'
      : /ready for ai|ai.?ready|prepare.*ai/.test(text) ? 'prepare-for-ai'
      : /package|publish|accessibility report/.test(text) ? 'accessibility-package' : '';
    return workflowId ? { intent: intents.find((item) => item.workflowId === workflowId && !item.completed) } : null;
  }

  async function submitDirectGoal(event) {
    event.preventDefault();
    if (currentFile && contentInput.value.trim() !== contentInput.dataset.loadedSource) {
      directGoalStatus.textContent = 'The source field has changed. Choose the new file or restore the loaded filename before starting.';
      return;
    }
    if (!currentInspection) {
      const pendingValue = contentInput.value.trim();
      if (pendingValue && looksLikeLocalFileReference(pendingValue)) {
        directGoalStatus.textContent = describeLocalFileReference(pendingValue);
        chooseFileButton.focus();
        return;
      }
      if (pendingValue) {
        directGoalStatus.textContent = 'Checking the content first.';
        await handleUrl(pendingValue);
      }
      if (!currentInspection) {
        directGoalStatus.textContent = pendingValue ? 'That content could not be used. Check it and try again.' : 'Add content before starting a request.';
        return;
      }
    }
    const requestedGoal = directGoalInput.value.trim();
    if (currentInspection.mediaType === 'document' && /(?:fill(?:able)?|interactive|form fields?|checkboxes|check boxes)/i.test(requestedGoal)) {
      directGoalStatus.textContent = 'You requested an accessible fillable document. This build can display the PDF, but it cannot yet create or validate interactive PDF form fields. No form was changed or saved. A local PDF form-remediation engine must be installed and verified before this operation can run.';
      return;
    }
    const match = matchDirectGoal(requestedGoal);
    if (!match || (!match.intent && !match.chain)) {
      // Requests beyond what matchDirectGoal recognizes (translation, VPAT drafts, summaries, and
      // similar open-ended requests) are not yet interpreted by real language understanding — this
      // is still pattern matching against a fixed set of phrasings, not a general assistant. Being
      // specific about what is understood is more honest than implying anything typed will work.
      directGoalStatus.textContent = 'That request is not recognized yet. Try one of the suggestions in the list, or a request like Transcribe this, Describe this picture, Create captions, Compress this, Detect text in this, or Make this accessible.';
      directGoalInput.focus(); return;
    }
    // startWorkflowChain makes its own single announcement in the Workflow Status region — an
    // extra announcement here in a second live region would say the same thing twice.
    if (match.chain) { startWorkflowChain(match.chain); return; }
    if (!match.intent.capability.canRun || match.intent.available === false) {
      directGoalStatus.textContent = match.intent.recommendationReason || match.intent.capability.message || 'That task needs an assistance service configured in Advanced assistance settings.';
      return;
    }
    directGoalStatus.textContent = `${match.intent.title} selected.`;
    runIntent(match.intent);
  }

  function ensureWorkItem() {
    if (activeProject()) return activeProject();
    const name = currentFile ? currentFile.name : (currentInspection ? currentInspection.name : 'Untitled work');
    const project = window.ProjectWorkspace.create(name);
    renderProjectWorkspace(`${project.name} was created automatically to keep this work organized. You can rename or organize it later in Your work.`);
    return project;
  }

  function startWorkflowChain(chain) {
    if (!chain || !window.WorkflowChain.selectedSteps(chain).length) {
      setStatus('No unfinished accessibility work is available for this source.');
      return;
    }
    ensureWorkItem();
    activeWorkflowChain = chain;
    activeWorkflowChain.status = 'running';
    activeWorkflowChain.startedAt = new Date().toISOString();
    workflowChainSection.hidden = true;
    announceWorkflowStatus('Accessibility processing started. Media properties not yet verified will be assessed during processing where supported.');
    /* Focus remains with the user; status is announced without navigation. */
    continueWorkflowChain();
  }

  function openWorkflowChainReview(chain) {
    // Expert mode: execute the proposed plan, rather than asking the user to select tasks.
    startWorkflowChain(chain);
  }

  function submitWorkflowChain(event) {
    event.preventDefault();
    if (activeWorkflowChain) startWorkflowChain(activeWorkflowChain);
  }

  function continueWorkflowChain() {
    if (!activeWorkflowChain || !['running', 'review'].includes(activeWorkflowChain.status)) return;
    const refreshedIntents = window.IntentEngine.getIntents(currentInspection);
    const refreshedRecommendations = window.RecommendationEngine.build(currentKnowledgeModel, currentAssessment, currentPlan, refreshedIntents);
    window.WorkflowChain.refresh(activeWorkflowChain, refreshedRecommendations.recommendations);
    activeWorkflowChain.status = 'running';
    const step = window.WorkflowChain.next(activeWorkflowChain);
    if (!step) {
      const summary = window.WorkflowChain.summary(activeWorkflowChain);
      progressSection.hidden = true;
      activeWorkflowChain = null;
      renderGoalSuggestions(currentInspection.mediaType);
      renderCurrentTask();
      // Focus is about to land on the Current Task summary, which is itself a live region — that
      // single announcement is enough. Prepend the completion line to it rather than also
      // announcing "complete" in the banner and the (now hidden) Workflow Status region first.
      currentTaskSummary.textContent = `Make This Accessible is complete. ${summary.completed} workflow${summary.completed === 1 ? '' : 's'} completed. ${currentTaskSummary.textContent}`;
      /* Focus remains with the user; status is announced without navigation. */
      return;
    }
    if (step.blocked) {
      progressSection.hidden = true;
      renderGoalSuggestions(currentInspection.mediaType);
      renderCurrentTask();
      currentTaskSummary.textContent = `Make This Accessible paused before ${step.title}. ${activeWorkflowChain.pauseReason} ${currentTaskSummary.textContent}`;
      /* Focus remains with the user; status is announced without navigation. */
      return;
    }
    if (step.intent.workflowId === 'render-accessible-video') { offerRenderLaterPause(step.intent); return; }
    announceWorkflowStatus(step.requiresReview
      ? `${step.title} requires your review. Make This Accessible will resume automatically after approval.`
      : `${step.title} is running as the next Make This Accessible step.`);
    runIntent(step.intent);
  }

  let renderLaterTimer = null;

  // A brief, cancellable window before final rendering starts automatically, so the person can
  // defer it without needing to interrupt anything already running. If nothing is clicked, it
  // proceeds automatically — this is not a hard requirement to click through, only an opt-out.
  function offerRenderLaterPause(intent) {
    renderCurrentTask();
    currentTaskSummary.textContent = 'Final rendering will begin automatically in a few seconds. Everything completed so far has been saved.';
    renderLaterButton.hidden = false;
    currentTaskNextButton.hidden = true;
    currentTaskSection.hidden = false;
    /* Focus remains with the user; status is announced without navigation. */
    renderLaterTimer = window.setTimeout(() => {
      renderLaterTimer = null;
      renderLaterButton.hidden = true;
      runIntent(intent);
    }, 6000);
  }

  function cancelRenderLaterPause() {
    if (renderLaterTimer) { window.clearTimeout(renderLaterTimer); renderLaterTimer = null; }
    renderLaterButton.hidden = true;
  }

  renderLaterButton.addEventListener('click', () => {
    cancelRenderLaterPause();
    setStatus('Final rendering was postponed. Completed work was saved.');
    currentTaskSummary.textContent = 'Final rendering was postponed. Completed work was saved.';
    currentTaskNextButton.hidden = false;
    currentTaskNextButton.textContent = 'Render now';
    currentTaskNextButton.onclick = () => {
      const intents = currentRecommendations ? currentRecommendations.recommendations : window.IntentEngine.getIntents(currentInspection);
      const renderIntent = intents.find((item) => item.workflowId === 'render-accessible-video');
      if (renderIntent) runIntent(renderIntent);
    };
    /* Focus remains with the user; status is announced without navigation. */
  });

  function renderWorkflowChainState() {
    if (!activeWorkflowChain) return;
    const step = activeWorkflowChain.steps[activeWorkflowChain.currentIndex];
    if (step) jobStatus.textContent = `Accessibility plan: ${step.title}. Status: ${step.state}.`;
  }

  function cancelWorkflowChain(message) {
    if (!activeWorkflowChain) return;
    activeWorkflowChain.status = 'cancelled';
    activeWorkflowChain = null;
    workflowChainSection.hidden = true;
    workflowChainStatus.textContent = '';
    setStatus(message || 'The remaining accessibility plan was cancelled. Completed work was kept.');
    renderCurrentTask();
    /* No automatic focus movement on workflow completion or cancellation. */
  }

  function resetWorkflowChain() {
    activeWorkflowChain = null;
    workflowChainSection.hidden = true;
    workflowChainSteps.innerHTML = '';
    workflowChainStatus.textContent = '';
  }

  function runIntent(intent) {
    if (!currentSource || !currentInspection || !intent.capability.canRun) return;
    ensureWorkItem();

    if (intent.workflowId === 'create-transcript') {
      openTranscriptReview(intent);
      return;
    }
    if (intent.workflowId === 'generate-alt-text') {
      openImageDescriptionReview(intent);
      return;
    }
    if (intent.workflowId === 'create-captions') {
      openCaptionReview(intent);
      return;
    }
    if (intent.workflowId === 'audio-description') {
      openAudioDescriptionReview(intent);
      return;
    }
    if (intent.workflowId === 'accessibility-package') {
      openPackageReview(intent);
      return;
    }
    startIntentJob(intent, null);
  }

  function startIntentJob(intent, exportOptions) {
    resetProgress();
    resetResults();
    resetTranscriptReview();
    resetImageDescriptionReview();
    resetCaptionReview();
    resetAudioDescriptionReview();
    resetPackageReview();
    activeJob = window.createJob(intent, currentFile || currentSource, currentInspection);
    activeJob.exportOptions = exportOptions || null;
    if (activeWorkflowChain) {
      activeJob.chainId = activeWorkflowChain.id;
      activeJob.chainWorkflowId = intent.workflowId;
      window.WorkflowChain.markRunning(activeWorkflowChain, intent.workflowId);
      renderWorkflowChainState();
    }
    activeJob.transcriptOptions = intent.workflowId === 'create-transcript' ? (exportOptions || null) : null;
    activeJob.imageDescriptionOptions = intent.workflowId === 'generate-alt-text' ? (exportOptions || null) : null;
    activeJob.captionOptions = intent.workflowId === 'create-captions' ? (exportOptions || null) : null;
    activeJob.audioDescriptionOptions = intent.workflowId === 'audio-description' ? (exportOptions || null) : null;
    activeJob.publicationOptions = intent.workflowId === 'render-accessible-video' ? (exportOptions || { preset: 'web-standard', language: 'en', captionLabel: 'English', title: `Accessible video: ${currentFile ? currentFile.name : currentInspection.name}`, videoBitrate: 4000000, audioBitrate: 128000 }) : null;
    activeJob.knowledgeModel = currentKnowledgeModel;
    activeJob.assessment = currentAssessment;
    activeJob.accessibilityPlan = currentPlan;
    currentKnowledgeModel.activeJobs = Array.isArray(currentKnowledgeModel.activeJobs) ? currentKnowledgeModel.activeJobs : [];
    currentKnowledgeModel.activeJobs.push({ jobId: activeJob.id, workflowId: intent.workflowId, status: 'queued' });
    window.SharedKnowledge.save(currentKnowledgeModel);
    renderProgress(activeJob);
    refreshAfterJobStateChange();
    syncCurrentSourceToProject();
    progressSection.hidden = false;
    /* Focus remains with the user; status is announced without navigation. */
    executionEngine.enqueue(activeJob);
  }

  function updateTranscriptReviewedLabel() {
    transcriptReviewedLabelText.textContent = transcriptNoSpeechInput.checked
      ? 'I confirmed that this recording has little or no spoken dialogue.'
      : 'I reviewed this transcript for accuracy and completeness.';
  }

  function openTranscriptReview(intent) {
    pendingTranscriptIntent = intent;
    const review = window.TranscriptReview.build(currentFile ? currentFile.name : currentInspection.name);
    const alreadyReportedNone = Boolean(currentKnowledgeModel && currentKnowledgeModel.audio && currentKnowledgeModel.audio.speech && currentKnowledgeModel.audio.speech.status === 'reported-none');
    transcriptTitleInput.value = review.suggestedTitle;
    transcriptNoSpeechInput.checked = false; // Historical user reports do not override automatic detection.
    transcriptNoSpeechInput.closest("label").hidden = true;
    transcriptTextInput.value = '';
    transcriptReviewedInput.checked = false;
    transcriptReviewStatus.textContent = '';
    updateTranscriptReviewedLabel();
    transcriptReviewSummary.textContent = 'The assistant will attempt automatic local speech recognition. Review or correct the resulting transcript if needed. Manual entry is an optional fallback, not a prerequisite.';
    transcriptReviewSection.hidden = false;
    // Do not move focus when the editor appears.
    // If a compatible transcription provider is already available, request a draft right away
    // instead of waiting for a separate manual click, so goal-driven workflows like "Transcribe
    // this audio" and "Make this video accessible" actually reach automatic provider selection
    // and speech recognition. The person still reviews, edits, and approves before it is saved,
    // and the existing Draft with AI button remains available to retry. Never do this when the
    // person (or Media Analysis) has already established there's little or no dialogue here —
    // attempting speech transcription after that answer is exactly backwards. Also skip when the
    // file is already known to exceed what the connected service accepts, rather than starting the
    // attempt and failing mid-flow into a confirm dialog — the same fact should be known before
    // the attempt starts, not discovered partway through it.
    // Re-run analysis even when an earlier session contained a manual speech report.
    const capability = window.AIProviderLayer.getCapability('transcription-draft');
    if (!capability.canRun && !window.__TAURI__?.core?.invoke) {
      transcriptReviewStatus.textContent = 'Automatic transcription is unavailable in this environment. The assistant cannot yet determine whether speech is present.';
      return;
    }
    const effectiveSize = effectiveTranscriptionSourceSize();
    if (capability.provider && capability.provider.external && Number.isFinite(effectiveSize) && effectiveSize > CONNECTED_SERVICE_MAX_BYTES) {
      const usingExtractedAudio = Boolean(findExtractedAudioArtifact());
      transcriptReviewStatus.textContent = `${usingExtractedAudio ? 'The extracted audio copy of this recording' : (currentFile ? currentFile.name : 'This file')} is larger than the 50 MB limit for ${capability.provider.name}. Enter the transcript manually, or configure a local service without that limit in Advanced assistance settings.`;
      return;
    }
    requestTranscriptDraft();
  }

  function submitTranscriptReview(event) {
    event.preventDefault();
    if (!pendingTranscriptIntent) return;
    const text = window.TranscriptReview.normalizeText(transcriptTextInput.value);
    if (!text && transcriptNoSpeechInput.checked) {
      // Nothing was actually transcribed - record the Stage 1 fact and close out. This must not
      // create a transcript artifact or mark create-transcript "completed"; no transcript exists.
      if (currentKnowledgeModel) {
        currentKnowledgeModel.audio.speech.status = 'reported-none';
        window.SharedKnowledge.save(currentKnowledgeModel);
      }
      pendingTranscriptIntent = null;
      resetTranscriptReview();
      setStatus('Confirmed: little or no spoken dialogue. No transcript was created, since there was nothing to transcribe.');
      renderMediaAnalysis();
      renderCurrentTask();
      if (activeWorkflowChain) {
        window.WorkflowChain.markNotNeeded(activeWorkflowChain, 'create-transcript');
        continueWorkflowChain();
      } else {
        /* Focus remains with the user; status is announced without navigation. */
      }
      return;
    }
    if (!text) {
      transcriptReviewStatus.textContent = 'Enter transcript text before saving, or check "little or no spoken dialogue in this recording" if there is nothing to transcribe.';
      transcriptTextInput.focus();
      return;
    }
    if (!transcriptReviewedInput.checked) {
      transcriptReviewStatus.textContent = 'Confirm that you reviewed the transcript before saving it as complete.';
      transcriptReviewedInput.focus();
      return;
    }
    const options = {
      title: transcriptTitleInput.value.trim() || `Transcript for ${currentFile ? currentFile.name : currentInspection.name}`,
      text,
      wordCount: window.TranscriptReview.wordCount(text),
      reviewed: true,
      reviewedAt: new Date().toISOString(),
      provider: lastTranscriptProviderName || 'Entered manually'
    };
    const intent = pendingTranscriptIntent;
    startIntentJob(intent, options);
  }

  function resetTranscriptReview() {
    pendingTranscriptIntent = null;
    lastTranscriptProviderName = '';
    transcriptReviewSection.hidden = true;
    transcriptTitleInput.value = '';
    transcriptNoSpeechInput.checked = false;
    transcriptTextInput.value = '';
    transcriptReviewedInput.checked = false;
    transcriptReviewStatus.textContent = '';
    updateTranscriptReviewedLabel();
  }


  function openImageDescriptionReview(intent) {
    pendingImageDescriptionIntent = intent;
    imageDescriptionTitleInput.value = `Image description for ${currentFile ? currentFile.name : currentInspection.name}`;
    imageDescriptionTextInput.value = '';
    imageDescriptionReviewedInput.checked = false;
    imageDescriptionStatus.textContent = '';
    imageDescriptionReviewSummary.textContent = `Review ${currentFile ? currentFile.name : currentInspection.name}, request a draft when an assistance service is available, and edit the result before saving.`;
    imageDescriptionReviewSection.hidden = false;
    imageDescriptionReviewSection.focus();
  }

  function submitImageDescriptionReview(event) {
    event.preventDefault();
    if (!pendingImageDescriptionIntent) return;
    const description = imageDescriptionTextInput.value.trim();
    if (!description) { imageDescriptionStatus.textContent = 'Enter an image description before saving.'; imageDescriptionTextInput.focus(); return; }
    if (!imageDescriptionReviewedInput.checked) { imageDescriptionStatus.textContent = 'Confirm that you reviewed the description against the image.'; imageDescriptionReviewedInput.focus(); return; }
    const intent = pendingImageDescriptionIntent;
    startIntentJob(intent, { title: imageDescriptionTitleInput.value.trim(), description, reviewed: true, reviewedAt: new Date().toISOString() });
  }

  function resetImageDescriptionReview() {
    pendingImageDescriptionIntent = null;
    imageDescriptionReviewSection.hidden = true;
    imageDescriptionTitleInput.value = '';
    imageDescriptionTextInput.value = '';
    imageDescriptionReviewedInput.checked = false;
    imageDescriptionStatus.textContent = '';
  }

  function openCaptionReview(intent) {
    pendingCaptionIntent = intent;
    const review = window.CaptionReview.build(
      currentFile ? currentFile.name : currentInspection.name,
      currentInspection.durationSeconds,
      currentKnowledgeModel,
      currentKnowledgeModel.source
    );
    captionTitleInput.value = review.suggestedTitle;
    captionCueCounter = 0;
    captionCues.innerHTML = '';
    captionCueEditor.open = false;
    captionsReviewedInput.checked = false;
    captionReviewStatus.textContent = '';
    captionReviewSection.hidden = false;
    const reportedNoSpeech = Boolean(currentKnowledgeModel && currentKnowledgeModel.audio && currentKnowledgeModel.audio.speech && currentKnowledgeModel.audio.speech.status === 'reported-none');
    if (reportedNoSpeech) {
      // A transcript confirmed to hold no spoken dialogue has nothing for an AI caption draft to
      // work from — requesting one produces a meaningless blank cue. Ask directly instead of
      // auto-running a draft that can't succeed.
      captionCueEditor.open = true;
      captionReviewSummary.textContent = 'The transcript for this recording was confirmed to have little or no spoken dialogue, so a caption draft was not requested automatically. If there are meaningful environmental sounds worth captioning, use Request timed caption draft or add cues manually below. Otherwise, captions may not be needed for this recording.';
      /* Focus remains with the user; status is announced without navigation. */
    } else if (window.AIProviderLayer.getCapability('caption-draft').canRun) {
      captionReviewSummary.textContent = 'Creating a caption draft using the best available method.';
      /* Focus remains with the user; status is announced without navigation. */
      // Deferred one tick so the draft's own DOM insertion and live-region updates don't start
      // while this focus-move announcement is still being spoken.
      window.setTimeout(requestCaptionDraft, 0);
    } else if (review.reusedTranscript) {
      review.cues.forEach((cue) => addCaptionCue(cue));
      captionCueEditor.open = true;
      captionReviewSummary.textContent = 'No caption-generation service is currently available. Starter cues were created from the completed transcript instead. Review every cue against the Viewer and correct the timing and text.';
      /* Focus remains with the user; status is announced without navigation. */
    } else {
      captionReviewSummary.textContent = 'No caption-generation service is currently available, and no completed transcript exists to create starter cues from. Manual authoring is available as an advanced option below. You may need help from someone who can review the video to caption it manually.';
      captionCueEditor.open = true;
      addCaptionCue();
      /* Focus remains with the user; status is announced without navigation. */
    }
  }

  function addCaptionCue(cue = {}) {
    captionCueCounter += 1;
    const cueId = captionCueCounter;
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'caption-cue';
    fieldset.dataset.cueId = String(cueId);
    fieldset.innerHTML = `
      <legend>Caption cue ${cueId}</legend>
      <div class="caption-time-fields">
        <div class="form-field">
          <label for="caption-start-${cueId}">Caption cue ${cueId} start time</label>
          <input id="caption-start-${cueId}" class="caption-start" type="text" inputmode="decimal" value="${escapeHtml(cue.start || '00:00:00.000')}" aria-describedby="caption-time-format-${cueId}" required>
        </div>
        <div class="form-field">
          <label for="caption-end-${cueId}">Caption cue ${cueId} end time</label>
          <input id="caption-end-${cueId}" class="caption-end" type="text" inputmode="decimal" value="${escapeHtml(cue.end || '00:00:04.000')}" aria-describedby="caption-time-format-${cueId}" required>
        </div>
      </div>
      <p id="caption-time-format-${cueId}" class="help-text">Format: 00:00:00.000</p>
      <div class="form-field">
        <label for="caption-text-${cueId}">Caption cue ${cueId} text</label>
        <textarea id="caption-text-${cueId}" class="caption-text" rows="3" required>${escapeHtml(cue.text || '')}</textarea>
      </div>
      <button type="button" class="remove-caption-cue">Remove caption cue ${cueId}</button>
    `;
    fieldset.querySelector('.remove-caption-cue').addEventListener('click', () => {
      if (captionCues.children.length === 1) {
        captionReviewStatus.textContent = 'At least one caption cue is required.';
        return;
      }
      const nextFocus = fieldset.previousElementSibling || fieldset.nextElementSibling || addCaptionCueButton;
      fieldset.remove();
      renumberCaptionCues();
      captionReviewStatus.textContent = 'Caption cue removed.';
      nextFocus.focus();
    });
    captionCues.appendChild(fieldset);
  }

  function renumberCaptionCues() {
    Array.from(captionCues.children).forEach((fieldset, index) => {
      const cueId = index + 1;
      fieldset.querySelector('legend').textContent = `Caption cue ${cueId}`;
      fieldset.querySelector('label[for^="caption-start-"]').textContent = `Caption cue ${cueId} start time`;
      fieldset.querySelector('label[for^="caption-end-"]').textContent = `Caption cue ${cueId} end time`;
      fieldset.querySelector('label[for^="caption-text-"]').textContent = `Caption cue ${cueId} text`;
      fieldset.querySelector('.remove-caption-cue').textContent = `Remove caption cue ${cueId}`;
    });
  }

  function collectCaptionCues() {
    return Array.from(captionCues.querySelectorAll('.caption-cue')).map((fieldset) => ({
      start: fieldset.querySelector('.caption-start').value.trim(),
      end: fieldset.querySelector('.caption-end').value.trim(),
      text: fieldset.querySelector('.caption-text').value.trim()
    }));
  }

  function submitCaptionReview(event) {
    event.preventDefault();
    if (!pendingCaptionIntent) return;
    let cues = collectCaptionCues();
    let errors = window.CaptionReview.validate(cues, currentInspection.durationSeconds);
    if (errors.length) {
      const repaired = window.CaptionReview.repair(cues, currentInspection.durationSeconds);
      const reErrors = window.CaptionReview.validate(repaired.cues, currentInspection.durationSeconds);
      if (!reErrors.length && repaired.cues.length) {
        cues = repaired.cues;
        captionCueCounter = 0; captionCues.innerHTML = '';
        cues.forEach((cue) => addCaptionCue(cue));
        captionReviewStatus.textContent = `Timing was automatically corrected (${errors.length} issue${errors.length === 1 ? '' : 's'} fixed). Review the corrected cues, then save again.`;
        captionCueEditor.open = true;
        /* Focus remains with the user; status is announced without navigation. */
        return;
      }
      const types = Array.from(new Set(errors.map((message) => message.replace(/^Cue \d+/, 'A cue')))).slice(0, 3);
      captionReviewStatus.textContent = `${errors.length} caption cue${errors.length === 1 ? ' has' : 's have'} a timing or text problem: ${types.join(' ')} Open Edit individual caption cues to find and fix the specific cue.`;
      captionCueEditor.open = true;
      /* Focus remains with the user; status is announced without navigation. */
      return;
    }
    if (!captionsReviewedInput.checked) {
      captionReviewStatus.textContent = 'Confirm that you reviewed the caption text and timing before saving the captions as complete.';
      captionsReviewedInput.focus();
      return;
    }
    const options = {
      title: captionTitleInput.value.trim() || `Captions for ${currentFile ? currentFile.name : currentInspection.name}`,
      cues,
      cueCount: cues.length,
      reviewed: true,
      reviewedAt: new Date().toISOString(),
      webVtt: window.CaptionReview.toWebVtt(captionTitleInput.value, currentFile ? currentFile.name : currentInspection.name, cues)
    };
    const intent = pendingCaptionIntent;
    captionReviewStatus.textContent = 'Captions saved. Continuing the accessibility workflow.';
    startIntentJob(intent, options);
  }

  function resetCaptionReview() {
    pendingCaptionIntent = null;
    captionReviewSection.hidden = true;
    captionTitleInput.value = '';
    captionCues.innerHTML = '';
    captionsReviewedInput.checked = false;
    captionReviewStatus.textContent = '';
  }

  function renderNarrationStyleOptions() {
    if (narrationStyleInput.options.length) return;
    narrationStyleInput.innerHTML = window.NarrationStyle.list()
      .map((style) => `<option value="${escapeHtml(style.id)}">${escapeHtml(style.label)}</option>`)
      .join('');
  }

  function updateNarrationStyleDetails() {
    const sourceName = currentFile ? currentFile.name : (currentInspection ? currentInspection.name : '');
    const resolved = window.NarrationStyle.resolveVoice(narrationStyleInput.value, sourceName);
    const styleUsed = narrationStyleInput.value === 'automatic' ? `${resolved.style.label} (chosen automatically)` : resolved.style.label;
    narrationStyleTechnical.textContent = `Style: ${styleUsed}. Using: ${resolved.providerName}. Voice: ${titleCase(resolved.voice)}.`;
  }

  async function previewNarrationStyle() {
    const approval = confirmAssistanceUse('narration-audio', narrationPreviewStatus);
    if (!approval) return;
    previewNarrationStyleButton.disabled = true;
    const sourceName = currentFile ? currentFile.name : (currentInspection ? currentInspection.name : '');
    const resolved = window.NarrationStyle.resolveVoice(narrationStyleInput.value, sourceName);
    narrationPreviewStatus.textContent = `Creating a sample of the ${resolved.style.label} narration style.`;
    try {
      const result = await window.AIProviderLayer.run('narration-audio', {
        narrationCues: [{ text: `Welcome to the Open Door Accessible Assistant. This is a sample of the ${resolved.style.label} narration style.` }],
        narrationVoice: resolved.voice,
        narrationSpeed: Number(narrationSpeedInput.value) || 1
      }, { confirmed: approval.confirmed });
      const clip = result.clips && result.clips[0];
      if (!clip) throw new Error('No preview audio was returned.');
      const audio = new Audio(`data:${clip.mimeType};base64,${clip.base64}`);
      await audio.play();
      narrationPreviewStatus.textContent = `Playing a sample of the ${resolved.style.label} narration style.`;
    } catch (error) {
      narrationPreviewStatus.textContent = describeAssistanceError(error);
    } finally {
      previewNarrationStyleButton.disabled = false;
    }
  }

  function openAudioDescriptionReview(intent) {
    pendingAudioDescriptionIntent = intent;
    const review = window.AudioDescriptionReview.build(currentFile ? currentFile.name : currentInspection.name);
    audioDescriptionTitleInput.value = review.suggestedTitle;
    audioDescriptionNotesInput.value = '';
    audioDescriptionCueCounter = 0;
    audioDescriptionCues.innerHTML = '';
    audioDescriptionCueEditor.open = false;
    audioDescriptionReviewedInput.checked = false;
    generateNarrationMixInput.checked = Boolean(activeWorkflowChain);
    renderNarrationStyleOptions();
    narrationStyleInput.value = window.NarrationStyle.getSavedPreference() || window.NarrationStyle.suggestStyleId(currentFile ? currentFile.name : currentInspection.name) || 'automatic';
    updateNarrationStyleDetails();
    narrationPreviewStatus.textContent = '';
    narrationSpeedInput.value = '1';
    narrationVolumeInput.value = '100';
    sourceDuckingInput.value = '35';
    audioDescriptionReviewStatus.textContent = '';
    audioDescriptionReviewSection.hidden = false;
    if (window.AIProviderLayer.getCapability('audio-description-draft').canRun) {
      audioDescriptionReviewSummary.textContent = 'Creating an audio-description draft using the best available method.';
      /* Focus remains with the user; status is announced without navigation. */
      requestAudioDescriptionDraft();
    } else {
      // No blank narration field is ever shown here. Nothing exists to generate a draft with,
      // so this states that plainly and reveals manual authoring only as an explicit, explained
      // last resort — never silently.
      audioDescriptionReviewSummary.textContent = 'No audio-description generation service is currently available, so no draft could be created. Manual authoring is available as an advanced option below. A blind user may need assistance from someone who can review the visual content to write descriptions manually.';
      audioDescriptionCueEditor.open = true;
      addAudioDescriptionCue();
      /* Focus remains with the user; status is announced without navigation. */
    }
  }

  function addAudioDescriptionCue(cue = {}) {
    audioDescriptionCueCounter += 1;
    const cueId = audioDescriptionCueCounter;
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'audio-description-cue';
    fieldset.innerHTML = `
      <legend>Audio-description cue ${cueId}</legend>
      <div class="caption-time-fields">
        <div class="form-field"><label for="ad-start-${cueId}">Audio-description cue ${cueId} start time</label><input id="ad-start-${cueId}" class="ad-start" type="text" inputmode="decimal" value="${escapeHtml(cue.start || '00:00:00.000')}" required></div>
        <div class="form-field"><label for="ad-end-${cueId}">Audio-description cue ${cueId} end time</label><input id="ad-end-${cueId}" class="ad-end" type="text" inputmode="decimal" value="${escapeHtml(cue.end || '00:00:04.000')}" required></div>
      </div>
      <div class="form-field"><label for="ad-placement-${cueId}">Audio-description cue ${cueId} placement</label><select id="ad-placement-${cueId}" class="ad-placement"><option>During a pause</option><option>Before the scene</option><option>After the scene</option><option>Extended description</option></select></div>
      <div class="form-field"><label for="ad-text-${cueId}">Audio-description cue ${cueId} narration</label><textarea id="ad-text-${cueId}" class="ad-text" rows="4" required>${escapeHtml(cue.text || '')}</textarea></div>
      <button type="button" class="remove-audio-description-cue">Remove audio-description cue ${cueId}</button>`;
    fieldset.querySelector('.ad-placement').value = cue.placement || 'During a pause';
    fieldset.querySelector('.remove-audio-description-cue').addEventListener('click', () => {
      if (audioDescriptionCues.children.length === 1) {
        audioDescriptionReviewStatus.textContent = 'At least one description cue is required.';
        return;
      }
      const nextFocus = fieldset.previousElementSibling || fieldset.nextElementSibling || addAudioDescriptionCueButton;
      fieldset.remove();
      renumberAudioDescriptionCues();
      audioDescriptionReviewStatus.textContent = 'Audio-description cue removed.';
      nextFocus.focus();
    });
    audioDescriptionCues.appendChild(fieldset);
  }

  function renumberAudioDescriptionCues() {
    Array.from(audioDescriptionCues.children).forEach((fieldset, index) => {
      const cueId = index + 1;
      fieldset.querySelector('legend').textContent = `Audio-description cue ${cueId}`;
      fieldset.querySelector('label[for^="ad-start-"]').textContent = `Audio-description cue ${cueId} start time`;
      fieldset.querySelector('label[for^="ad-end-"]').textContent = `Audio-description cue ${cueId} end time`;
      fieldset.querySelector('label[for^="ad-placement-"]').textContent = `Audio-description cue ${cueId} placement`;
      fieldset.querySelector('label[for^="ad-text-"]').textContent = `Audio-description cue ${cueId} narration`;
      fieldset.querySelector('.remove-audio-description-cue').textContent = `Remove audio-description cue ${cueId}`;
    });
  }

  function collectAudioDescriptionCues() {
    return Array.from(audioDescriptionCues.querySelectorAll('.audio-description-cue')).map((fieldset) => ({
      start: fieldset.querySelector('.ad-start').value.trim(),
      end: fieldset.querySelector('.ad-end').value.trim(),
      placement: fieldset.querySelector('.ad-placement').value,
      text: fieldset.querySelector('.ad-text').value.trim()
    }));
  }

  async function submitAudioDescriptionReview(event) {
    event.preventDefault();
    if (!pendingAudioDescriptionIntent) return;
    const cues = collectAudioDescriptionCues();
    const errors = window.AudioDescriptionReview.validate(cues, currentInspection.durationSeconds);
    if (errors.length) {
      const types = Array.from(new Set(errors.map((message) => message.replace(/^Description cue \d+/, 'A cue')))).slice(0, 3);
      audioDescriptionReviewStatus.textContent = `${errors.length} description cue${errors.length === 1 ? ' has' : 's have'} a timing or narration problem: ${types.join(' ')} Open Edit individual audio-description cues to find and fix the specific cue.`;
      audioDescriptionCueEditor.open = true;
      /* Focus remains with the user; status is announced without navigation. */
      return;
    }
    if (!audioDescriptionReviewedInput.checked) {
      audioDescriptionReviewStatus.textContent = 'Confirm that you reviewed the script and narration placement before saving it as complete.';
      audioDescriptionReviewedInput.focus();
      return;
    }
    audioDescriptionReviewStatus.textContent = 'Audio description saved. Continuing the accessibility workflow.';
    const sourceName = currentFile ? currentFile.name : currentInspection.name;
    const resolvedVoice = window.NarrationStyle.resolveVoice(narrationStyleInput.value, sourceName);
    window.NarrationStyle.savePreference(narrationStyleInput.value);
    const options = {
      title: audioDescriptionTitleInput.value.trim() || `Audio description script for ${sourceName}`,
      notes: audioDescriptionNotesInput.value.trim(),
      cues,
      cueCount: cues.length,
      reviewed: true,
      reviewedAt: new Date().toISOString(),
      scriptMarkdown: window.AudioDescriptionReview.toMarkdown(audioDescriptionTitleInput.value, sourceName, cues, audioDescriptionNotesInput.value),
      generateNarrationMix: generateNarrationMixInput.checked,
      narrationVoice: resolvedVoice.voice,
      narrationStyleId: narrationStyleInput.value,
      narrationStyleLabel: resolvedVoice.style.label,
      narrationSpeed: Number(narrationSpeedInput.value) || 1,
      narrationVolume: Number(narrationVolumeInput.value) || 100,
      sourceDucking: Number(sourceDuckingInput.value) || 35
    };
    if (options.generateNarrationMix) {
      const approval = confirmAssistanceUse('narration-audio', audioDescriptionReviewStatus);
      if (!approval) return;
      try {
        audioDescriptionReviewStatus.textContent = 'Creating narration clips. The reviewed script remains available if narration generation fails.';
        const result = await window.AIProviderLayer.run('narration-audio', {
          narrationCues: cues,
          narrationVoice: options.narrationVoice,
          narrationSpeed: options.narrationSpeed
        }, { confirmed: approval.confirmed });
        options.narrationClips = result.clips;
        options.narrationProviderName = result.providerName;
      } catch (error) {
        audioDescriptionReviewStatus.textContent = error.message;
        return;
      }
    }
    const intent = pendingAudioDescriptionIntent;
    startIntentJob(intent, options);
  }

  function resetAudioDescriptionReview() {
    pendingAudioDescriptionIntent = null;
    audioDescriptionReviewSection.hidden = true;
    audioDescriptionTitleInput.value = '';
    audioDescriptionNotesInput.value = '';
    audioDescriptionCues.innerHTML = '';
    audioDescriptionReviewedInput.checked = false;
    generateNarrationMixInput.checked = false;
    narrationStyleInput.value = 'automatic';
    narrationSpeedInput.value = '1';
    narrationVolumeInput.value = '100';
    sourceDuckingInput.value = '35';
    narrationPreviewStatus.textContent = '';
    audioDescriptionReviewStatus.textContent = '';
  }

  function openPackageReview(intent) {
    pendingPackageIntent = intent;
    currentPackageReview = window.PackageReview.build(
      currentKnowledgeModel,
      currentKnowledgeModel.source,
      currentInspection,
      currentPlan
    );

    packageNameInput.value = currentPackageReview.suggestedName;
    packagePrivacyConfirm.checked = false;
    packageReviewStatus.textContent = '';
    packageReviewSummary.textContent = `${currentPackageReview.availableArtifacts.length} generated file${currentPackageReview.availableArtifacts.length === 1 ? '' : 's'} can be included. The package will also contain two manifests, ${currentPackageReview.historyCount} workflow history record${currentPackageReview.historyCount === 1 ? '' : 's'}, and ${currentPackageReview.remainingGapCount} remaining accessibility gap${currentPackageReview.remainingGapCount === 1 ? '' : 's'}.`;

    if (currentPackageReview.availableArtifacts.length) {
      packageArtifactOptions.innerHTML = currentPackageReview.availableArtifacts.map((artifact) => `
        <div class="package-option">
          <label>
            <input type="checkbox" name="packageArtifact" value="${escapeHtml(artifact.id)}" checked>
            <strong>${escapeHtml(artifact.name)}</strong>
          </label>
          <p>${escapeHtml(artifact.type)}${Number.isFinite(artifact.size) ? `, ${escapeHtml(formatBytes(artifact.size))}` : ''}</p>
          ${artifact.description ? `<p class="muted">${escapeHtml(artifact.description)}</p>` : ''}
        </div>
      `).join('');
    } else {
      packageArtifactOptions.innerHTML = '<p>No generated files are available in this browser session. The manifests, history, completed work, remaining gaps, and follow-up actions can still be packaged.</p>';
    }

    const privacyItems = currentPackageReview.availableArtifacts.filter((artifact) => artifact.privacyNotice);
    packagePrivacyNotices.innerHTML = privacyItems.length
      ? `<ul>${privacyItems.map((artifact) => `<li><strong>${escapeHtml(artifact.name)}:</strong> ${escapeHtml(artifact.privacyNotice)}</li>`).join('')}</ul>`
      : '<p>No selected generated files have a specific privacy warning. Review the manifest information before export.</p>';

    packageReviewSection.hidden = false;
    packageReviewSection.focus();
  }

  function submitPackageReview(event) {
    event.preventDefault();
    if (!pendingPackageIntent || !currentPackageReview) return;

    const selectedArtifactIds = Array.from(packageArtifactOptions.querySelectorAll('input[name="packageArtifact"]:checked'))
      .map((input) => input.value);
    const selectedSensitive = currentPackageReview.availableArtifacts
      .some((artifact) => selectedArtifactIds.includes(artifact.id) && artifact.privacyNotice);

    if (selectedSensitive && !packagePrivacyConfirm.checked) {
      packageReviewStatus.textContent = 'Confirm the privacy review before creating a package that includes source-derived files.';
      packagePrivacyConfirm.focus();
      return;
    }

    const packageName = window.PackageReview.normalizeName(packageNameInput.value, currentPackageReview.suggestedName);
    const options = {
      packageName,
      selectedArtifactIds,
      privacyConfirmed: packagePrivacyConfirm.checked,
      reviewedAt: new Date().toISOString()
    };
    const intent = pendingPackageIntent;
    startIntentJob(intent, options);
  }

  function resetPackageReview() {
    pendingPackageIntent = null;
    currentPackageReview = null;
    packageReviewSection.hidden = true;
    packageArtifactOptions.innerHTML = '';
    packagePrivacyNotices.innerHTML = '';
    packageReviewStatus.textContent = '';
    packagePrivacyConfirm.checked = false;
  }

  function queuedProgress(job, position) {
    if (window.ProductionFeatures) window.ProductionFeatures.saveJob(job);
    jobStatus.textContent = position > 1 ? `${job.intent.title} is queued at position ${position}.` : `${job.intent.title} is queued and ready to start.`;
  }

  function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) return `${seconds} second${seconds === 1 ? '' : 's'}`;
    if (seconds === 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    return `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}`;
  }

  // A simple, clearly-approximate estimate from elapsed time and current progress. Not the
  // historical-learning model described in the product direction — that needs its own scoped
  // implementation with somewhere to store real per-provider timing data. This gives an honest,
  // continuously-updating "about this long" figure in the meantime, rather than percentage only.
  // Returns both the sentence to display and a short, stable category name. The category only
  // changes when the estimate genuinely moves into a different bucket (not on every recalculation),
  // so callers can tell a real change from routine noise.
  function estimateRemaining(job) {
    const elapsedMs = Date.now() - (job.startedAt ? new Date(job.startedAt).getTime() : Date.now());
    const progress = Number(job.progress) || 0;
    if (progress < 5 || elapsedMs < 4000) return { text: 'Estimating remaining time.', category: 'estimating' };
    const totalEstimateMs = (elapsedMs / progress) * 100;
    const remainingMs = Math.max(0, totalEstimateMs - elapsedMs);
    const low = remainingMs * 0.75;
    const high = remainingMs * 1.25;
    if (high < 20000) return { text: 'Estimated remaining time: less than a minute.', category: 'less-than-a-minute' };
    // Bucket to the minute so the category (and therefore whether we re-announce) is stable even
    // though the exact low/high figures keep drifting slightly from one recalculation to the next.
    const lowMinutes = Math.round(low / 60000);
    const highMinutes = Math.round(high / 60000);
    return {
      text: `Estimated remaining time: approximately ${formatDuration(low)} to ${formatDuration(high)}.`,
      category: `${lowMinutes}-${highMinutes}`
    };
  }

  // Updates the visible elapsed/remaining/percent text every time it's called (this is not a live
  // region, so that's safe to do often). Returns true only when the remaining-time category
  // actually changed, so the caller can decide whether this update is worth a live announcement.
  function updateTimeStatus(job) {
    if (!job.startedAt) {
      jobTimeStatus.textContent = `Still waiting in the queue. Overall progress: ${Math.round(Number(job.progress) || 0)} percent.`;
      return false;
    }
    const elapsedMs = Date.now() - new Date(job.startedAt).getTime();
    const remaining = estimateRemaining(job);
    jobTimeStatus.textContent = `Elapsed: ${formatDuration(elapsedMs)}. ${remaining.text} Overall progress: ${Math.round(Number(job.progress) || 0)} percent.`;
    const changed = remaining.category !== lastAnnouncedRemainingCategory;
    lastAnnouncedRemainingCategory = remaining.category;
    return changed;
  }

  function stopProgressTimer() {
    if (progressTimer) { window.clearInterval(progressTimer); progressTimer = null; }
  }

  function renderProgress(job) {
    progressSection.hidden = false;
    jobStatus.textContent = `${job.intent.title} is starting.`;
    progressBar.style.width = '0%';
    cancelJobButton.disabled = false;
    progressSteps.innerHTML = job.intent.steps.map((step) => `
      <li data-step-status="pending">
        <span class="step-state">Waiting</span>
        <span>${escapeHtml(step)}</span>
      </li>
    `).join('');
    stopProgressTimer();
    lastAnnouncedStepIndex = null;
    lastAnnouncedPercentBucket = -1;
    lastAnnouncedRemainingCategory = '';
    updateTimeStatus(job);
    // The visible elapsed/remaining/percent text refreshes every 20 seconds. This never announces
    // by itself — updateTimeStatus reports back only whether the remaining-time category changed,
    // and only then does this become a live announcement, appended to whatever is currently shown
    // rather than replacing it.
    progressTimer = window.setInterval(() => {
      if (updateTimeStatus(job) && !jobStatus.textContent.includes('Estimated remaining time')) {
        jobStatus.textContent = `${jobStatus.textContent} ${estimateRemaining(job).text}`;
      }
    }, 20000);
  }

  function updateProgress(job, detail) {
    if (window.ProductionFeatures) window.ProductionFeatures.saveJob(job);
    // The one live announcement (job-status) only updates at a meaningful transition: a new step
    // starting, or the overall percentage crossing one of the standard intervals. Frequent
    // in-between progress reports (e.g. a render reporting its position every fraction of a
    // second) still update the visible percentage and elapsed/remaining text below, just silently.
    const percent = Math.round(Number(job.progress) || 0);
    const crossedBucket = PERCENT_INTERVALS.find((mark) => percent >= mark && lastAnnouncedPercentBucket < mark);
    const isNewStep = detail.stepIndex !== lastAnnouncedStepIndex;
    if (isNewStep || crossedBucket) {
      jobStatus.textContent = detail.message;
      lastAnnouncedStepIndex = detail.stepIndex;
      if (crossedBucket) lastAnnouncedPercentBucket = crossedBucket;
    }
    updateTimeStatus(job);
    updateActiveJobStatus(job, job.status);
    progressBar.style.width = `${job.progress}%`;
    const meter = progressBar.parentElement;
    if (meter) meter.setAttribute('aria-valuenow', String(job.progress));

    Array.from(progressSteps.children).forEach((item, index) => {
      let state = 'pending';
      let label = 'Waiting';

      if (index < job.currentStepIndex) {
        state = 'done';
        label = 'Done';
      } else if (index === job.currentStepIndex) {
        state = 'current';
        label = 'Now';
      }

      item.dataset.stepStatus = state;
      item.querySelector('.step-state').textContent = label;
    });
  }

  function completeProgress(job) {
    if (window.ProductionFeatures) { window.ProductionFeatures.saveJob(job); window.ProductionFeatures.recordHistory(job, 'Job completed'); }
    removeActiveJob(job.id);
    currentKnowledgeModel = window.SharedKnowledge.recordJob(currentKnowledgeModel, job);
    job.knowledgeModel = currentKnowledgeModel;
    const project = activeProject();
    if (project) {
      window.ProjectWorkspace.recordWorkflow(project.id, currentSource, job, currentKnowledgeModel);
      window.ProjectReview.ensureForWorkflow(project.id, job);
    }
    renderProjectWorkspace();
    currentAssessment = window.AccessibilityAssessment.assess(currentKnowledgeModel);
    currentPlan = window.AccessibilityPlan.build(currentKnowledgeModel, currentAssessment, window.IntentEngine.getIntents(currentInspection));
    renderAssessment(currentInspection);
    renderMediaAnalysis();
    renderPlan(currentInspection);
    renderRecommendations(currentInspection);
    renderKnowledge();
    renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
    window.AdvancedAccessibilityAnalysis.setContext(currentInspection, currentKnowledgeModel, currentFile);

    jobStatus.textContent = `${job.intent.title} finished. Your file is ready.`;
    progressBar.style.width = '100%';
    const meter = progressBar.parentElement;
    if (meter) meter.setAttribute('aria-valuenow', '100');

    Array.from(progressSteps.children).forEach((item) => {
      item.dataset.stepStatus = 'done';
      item.querySelector('.step-state').textContent = 'Done';
    });

    cancelJobButton.disabled = true;
    progressSection.hidden = true;
    stopProgressTimer();
    if (job.intent.workflowId === 'render-accessible-video') {
      setStatus('Your accessible video is ready.');
      renderResults(job);
    }
    if (activeWorkflowChain && job.chainId === activeWorkflowChain.id) {
      window.WorkflowChain.markCompleted(activeWorkflowChain, job.chainWorkflowId);
      if (job.intent.workflowId !== 'render-accessible-video') setStatus(`${job.intent.title} completed. The accessibility plan is continuing.`);
      continueWorkflowChain();
    } else if (job.intent.workflowId !== 'render-accessible-video') {
      renderResults(job);
    }
  }

  function failProgress(job, error) {
    if (error && job.intent && job.intent.workflowId === 'render-accessible-video') {
      if (window.ProductionFeatures) { window.ProductionFeatures.saveJob(job); window.ProductionFeatures.recordHistory(job, 'Rendering needs a direct retry', error.message); }
      removeActiveJob(job.id);
      refreshAfterJobStateChange();
      cancelJobButton.disabled = true;
      progressSection.hidden = true;
      stopProgressTimer();
      setStatus(error.needsUserActivation ? 'Final browser rendering requires one activation.' : `Rendering did not finish. ${error.message}`);
      renderCurrentTask();
      currentTaskSummary.textContent = error.needsUserActivation
        ? 'Everything is ready. Press Start final rendering to complete the video.'
        : error.message;
      currentTaskNextButton.hidden = true;
      renderLaterButton.hidden = true;
      startFinalRenderingButton.hidden = false;
      startFinalRenderingButton.textContent = 'Start final rendering';
      startFinalRenderingButton.onclick = () => startFinalRendering(job.intent);
      currentTaskSection.hidden = false;
      startFinalRenderingButton.focus();
      return;
    }
    if (window.ProductionFeatures) { window.ProductionFeatures.saveJob(job); window.ProductionFeatures.recordHistory(job, job.status === 'paused' ? 'Job paused' : 'Error encountered', error.message); }
    removeActiveJob(job.id);
    refreshAfterJobStateChange();
    cancelJobButton.disabled = true;
    progressSection.hidden = true;
    stopProgressTimer();
    jobStatus.textContent = `This action could not be completed. ${error.message}`;
    if (activeWorkflowChain && job.chainId === activeWorkflowChain.id) {
      window.WorkflowChain.markFailed(activeWorkflowChain, job.chainWorkflowId, error.message);
      setStatus(`The accessibility plan paused because ${job.intent.title} could not be completed. Completed work was kept.`);
    }
    renderCurrentTask();
    /* No automatic focus movement on workflow completion or cancellation. */
  }

  // The retry path for when browser rendering needs a fresh, direct user gesture: calling
  // runIntent() synchronously from this click handler, with nothing awaited first, gives the
  // browser the best possible chance of honoring the activation for the playback/AudioContext
  // calls that happen several async layers downstream.
  function startFinalRendering(intent) {
    startFinalRenderingButton.hidden = true;
    runIntent(intent);
  }

  function cancelProgress(job) {
    if (window.ProductionFeatures) { window.ProductionFeatures.saveJob(job); window.ProductionFeatures.recordHistory(job, 'Job cancelled'); }
    removeActiveJob(job.id);
    refreshAfterJobStateChange();
    cancelJobButton.disabled = true;
    progressSection.hidden = true;
    stopProgressTimer();
    jobStatus.textContent = 'The workflow was cancelled. No output was saved.';
    if (activeWorkflowChain && job.chainId === activeWorkflowChain.id) cancelWorkflowChain('The current workflow and remaining accessibility plan were cancelled. Completed work was kept.');
    renderCurrentTask();
    /* No automatic focus movement on workflow completion or cancellation. */
  }

  function updateActiveJobStatus(job, status) {
    const entry = (currentKnowledgeModel.activeJobs || []).find((item) => item.jobId === job.id);
    if (entry) entry.status = status;
    window.SharedKnowledge.save(currentKnowledgeModel);
    syncCurrentSourceToProject();
    renderRecommendations(currentInspection);
    renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
  }

  function removeActiveJob(jobId) {
    currentKnowledgeModel.activeJobs = (currentKnowledgeModel.activeJobs || []).filter((item) => item.jobId !== jobId);
    window.SharedKnowledge.save(currentKnowledgeModel);
    syncCurrentSourceToProject();
  }

  function refreshAfterJobStateChange() {
    currentAssessment = window.AccessibilityAssessment.assess(currentKnowledgeModel);
    currentPlan = window.AccessibilityPlan.build(currentKnowledgeModel, currentAssessment, window.IntentEngine.getIntents(currentInspection));
    renderRecommendations(currentInspection);
    renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
    renderKnowledge();
  }

  function renderResults(job) {
    resultsSection.hidden = false;

    resultsOutput.innerHTML = `
      <section class="result-explanation" aria-labelledby="result-explanation-heading">
        <h3 id="result-explanation-heading">What happened</h3>
        <p>${escapeHtml(job.intent.title)} finished. Your file is ready.</p>
        <p class="muted">The original file stayed on this device.</p>
      </section>

      <h3>Files created</h3>
      <ul class="results-list">
        ${job.outputs.map((output, index) => `
          <li>
            <strong>${escapeHtml(output.name)}</strong>
            <span>${escapeHtml(output.type)}</span>
            <p>${escapeHtml(output.description)}</p>
            ${output.url ? `<button type="button" data-download-index="${index}">Download ${escapeHtml(output.name)}</button>` : ''}
            ${output.content ? `<button type="button" data-preview-index="${index}">Read ${escapeHtml(output.name)}</button>` : ''}
            ${output.content ? `<button type="button" data-copy-index="${index}">Copy the text</button>` : ''}
          </li>
        `).join('')}
      </ul>

      <section id="file-preview" class="artifact-preview" aria-labelledby="file-preview-heading" hidden>
        <h3 id="file-preview-heading">File preview</h3>
        <pre id="file-preview-content" tabindex="0"></pre>
      </section>

      <div class="next-actions" aria-label="Next steps">
        <button type="button" id="choose-another-goal">Do something else with this file</button>
        <button type="button" id="choose-another-file">Choose another file</button>
      </div>
    `;

    Array.from(resultsOutput.querySelectorAll('[data-download-index]')).forEach((button) => {
      button.addEventListener('click', () => {
        const artifact = job.outputs[Number(button.dataset.downloadIndex)];
        try {
          window.ProviderManager.downloadArtifact(artifact);
          setStatus(`${artifact.name} download started. Check your Downloads folder.`);
        } catch (error) {
          setStatus(error.message);
        }
      });
    });

    Array.from(resultsOutput.querySelectorAll('[data-preview-index]')).forEach((button) => {
      button.addEventListener('click', () => {
        const artifact = job.outputs[Number(button.dataset.previewIndex)];
        const preview = document.getElementById('file-preview');
        const previewContent = document.getElementById('file-preview-content');
        preview.hidden = false;
        previewContent.textContent = artifact.content || 'No preview is available.';
        setStatus(`${artifact.name} is open below.`);
        previewContent.focus();
      });
    });

    Array.from(resultsOutput.querySelectorAll('[data-copy-index]')).forEach((button) => {
      button.addEventListener('click', async () => {
        const artifact = job.outputs[Number(button.dataset.copyIndex)];
        try {
          await navigator.clipboard.writeText(artifact.content || '');
          setStatus('The text was copied.');
        } catch (error) {
          setStatus('Copy failed. Open the file preview and copy the text manually.');
        }
      });
    });

    document.getElementById('choose-another-goal').addEventListener('click', () => {
      directGoalSection.focus();
    });

    document.getElementById('choose-another-file').addEventListener('click', () => {
      fileInput.click();
    });

    // Results are announced without moving the keyboard cursor.
  }

  function resetProgress() {
    progressSection.hidden = true;
    stopProgressTimer();
    jobStatus.textContent = 'Nothing is running.';
    progressBar.style.width = '0%';
    progressSteps.innerHTML = '';
    cancelJobButton.disabled = true;
    const meter = progressBar.parentElement;
    if (meter) meter.setAttribute('aria-valuenow', '0');
  }

  function resetResults() {
    resultsSection.hidden = true;
    resultsOutput.textContent = 'No result yet.';
  }

  function titleCase(value) {
    return String(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function yesNo(value) {
    return value ? 'Yes' : 'No';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  chooseFileButton.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('is-dragging');
      setStatus('Drop the file to continue.');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('is-dragging');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) { handleFile(event.dataTransfer.files[0]); return; }
    const text = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
    if (text) { contentInput.value = text.trim(); handleUrl(text.trim()); }
  });

  fileInput.addEventListener('change', (event) => {
    handleFile(event.target.files[0]);
  });

  contentInput.addEventListener('paste', (event) => {
    const files = event.clipboardData && event.clipboardData.files;
    if (files && files.length) {
      // A file copied in the operating system's file manager (Ctrl+C) and pasted here (Ctrl+V)
      // arrives as a real File object via clipboardData.files, not as text — there is no
      // filename text to read, so this must be checked before falling back to the text value.
      event.preventDefault();
      handleFile(files[0]);
    }
  });

  contentInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleUrl(contentInput.value);
    }
  });

  directGoalInput.addEventListener('input', () => {
    directGoalInput.dataset.userEdited = 'true';
    if (currentInspection) renderCurrentTask();
  });
  // A datalist suggestion must not be concatenated with existing text when users type.
  directGoalInput.addEventListener('focus', () => {
    if (directGoalInput.dataset.userEdited !== 'true' && directGoalInput.value) directGoalInput.select();
  });
  workflowChainForm.addEventListener('submit', submitWorkflowChain);
  cancelWorkflowChainButton.addEventListener('click', () => cancelWorkflowChain());
  directGoalForm.addEventListener('submit', submitDirectGoal);
  document.getElementById('save-openai-provider').addEventListener('click', async () => {
    try {
      await window.OpenAIProvider.configure({ apiKey: openaiApiKey.value, transcriptionModel: openaiTranscriptionModel.value, visionModel: openaiVisionModel.value });
      openaiApiKey.value = '';
      aiProviderStatus.textContent = 'OpenAI service saved securely in this browser profile. Automatic selection can now use it for transcription and image description.';
      renderAIProviders();
      if (currentInspection) renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
    } catch (error) { aiProviderStatus.textContent = error.message; }
  });
  document.getElementById('clear-openai-provider').addEventListener('click', async () => {
    await window.OpenAIProvider.clear(); openaiApiKey.value = '';
    if (window.AIProviderLayer.getSelectionMode() === 'openai-direct') window.AIProviderLayer.select('automatic');
    aiProviderStatus.textContent = 'OpenAI service configuration cleared.'; renderAIProviders();
    if (currentInspection) renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask();
  });
  document.getElementById('test-openai-provider').addEventListener('click', async () => {
    aiProviderStatus.textContent = 'Testing OpenAI connection.';
    try { const result = await window.OpenAIProvider.testConnection(); aiProviderStatus.textContent = `${result.message} No workflow was started.`; }
    catch (error) { aiProviderStatus.textContent = error.message; }
  });
  document.getElementById('save-azure-provider').addEventListener('click', async () => {
    try {
      await window.AzureOpenAIProvider.configure({ profileId: document.getElementById('azure-profile-select').value, name: document.getElementById('azure-profile-name').value, endpoint: azureOpenAIEndpoint.value, deployment: azureOpenAIDeployment.value, apiKey: azureOpenAIKey.value });
      azureOpenAIKey.value = '';
      aiProviderStatus.textContent = 'Azure OpenAI settings saved securely in this browser profile.';
      renderAIProviders(); if (window.ProviderManagerUI) window.ProviderManagerUI.render();
    } catch (error) { aiProviderStatus.textContent = error.message; azureOpenAIEndpoint.focus(); }
  });
  document.getElementById('test-azure-provider').addEventListener('click', async () => {
    aiProviderStatus.textContent = 'Testing Azure OpenAI connection.';
    try { const result = await window.AzureOpenAIProvider.testConnection(); aiProviderStatus.textContent = `${result.message} No workflow was started.`; if (window.ProviderManagerUI) window.ProviderManagerUI.render(); }
    catch (error) { aiProviderStatus.textContent = error.message; }
  });
  document.getElementById('clear-azure-provider').addEventListener('click', async () => {
    await window.AzureOpenAIProvider.clear(); azureOpenAIEndpoint.value = ''; azureOpenAIDeployment.value = ''; azureOpenAIKey.value = '';
    if (window.AIProviderLayer.getSelectionMode() === 'azure-openai-direct') window.AIProviderLayer.select('automatic');
    aiProviderStatus.textContent = 'Azure OpenAI configuration cleared.'; renderAIProviders();
  });
  document.getElementById('save-gemini-provider').addEventListener('click', async () => {
    try {
      await window.GeminiProvider.configure({ apiKey: geminiApiKey.value, model: geminiModel.value });
      geminiApiKey.value = '';
      aiProviderStatus.textContent = 'Gemini settings saved securely in this browser profile.';
      renderAIProviders();
    } catch (error) { aiProviderStatus.textContent = error.message; }
  });
  document.getElementById('test-gemini-provider').addEventListener('click', async () => {
    aiProviderStatus.textContent = 'Testing Gemini connection.';
    try { const result = await window.GeminiProvider.testConnection(); aiProviderStatus.textContent = `${result.message} No workflow was started.`; }
    catch (error) { aiProviderStatus.textContent = error.message; }
  });
  document.getElementById('clear-gemini-provider').addEventListener('click', async () => {
    await window.GeminiProvider.clear(); geminiApiKey.value = ''; geminiModel.value = 'gemini-2.5-flash';
    if (window.AIProviderLayer.getSelectionMode() === 'gemini-direct') window.AIProviderLayer.select('automatic');
    aiProviderStatus.textContent = 'Gemini configuration cleared.'; renderAIProviders();
  });
  document.addEventListener('provider-credentials-ready', () => { renderAIProviders(); if (currentInspection) renderGoalSuggestions(currentInspection.mediaType);
    renderCurrentTask(); });
  document.getElementById('save-connected-provider').addEventListener('click', () => {
    try {
      window.ConnectedAIProvider.configure({ serviceName: connectedProviderName.value, endpoint: connectedProviderEndpoint.value, model: connectedProviderModel.value, apiKey: connectedProviderKey.value, costCategory: connectedProviderCost.value });
      connectedProviderKey.value = '';
      aiProviderStatus.textContent = 'Connected service settings saved for this browser tab. Automatic selection remains in control unless you choose an advanced override.';
      renderAIProviders();
    } catch (error) { aiProviderStatus.textContent = error.message; connectedProviderEndpoint.focus(); }
  });
  testConnectedProviderButton.addEventListener('click', async () => {
    testConnectedProviderButton.disabled = true;
    aiProviderStatus.textContent = 'Testing the connected service.';
    try {
      const result = await window.ConnectedAIProvider.testConnection();
      aiProviderStatus.textContent = `${result.message} No workflow was started.`;
    } catch (error) { aiProviderStatus.textContent = error.message; }
    finally { testConnectedProviderButton.disabled = false; }
  });
  document.getElementById('clear-connected-provider').addEventListener('click', () => {
    window.ConnectedAIProvider.clear(); connectedProviderName.value = ''; connectedProviderEndpoint.value = ''; connectedProviderModel.value = ''; connectedProviderKey.value = ''; connectedProviderCost.value = 'may-charge';
    if (window.AIProviderLayer.getSelectionMode() === 'connected-json') window.AIProviderLayer.select('automatic');
    aiProviderStatus.textContent = 'Connected service configuration cleared. Automatic selection is active.'; renderAIProviders();
  });
  draftTranscriptButton.addEventListener('click', requestTranscriptDraft);
  transcriptNoSpeechInput.addEventListener('change', () => {
    updateTranscriptReviewedLabel();
    if (currentKnowledgeModel) {
      currentKnowledgeModel.audio.speech.status = transcriptNoSpeechInput.checked ? 'reported-none' : 'not-analyzed';
      window.SharedKnowledge.save(currentKnowledgeModel);
    }
  });
  draftImageDescriptionButton.addEventListener('click', requestImageDescriptionDraft);
  draftCaptionsButton.addEventListener('click', requestCaptionDraft);
  draftAudioDescriptionButton.addEventListener('click', requestAudioDescriptionDraft);
  previewNarrationStyleButton.addEventListener('click', previewNarrationStyle);
  narrationStyleInput.addEventListener('change', updateNarrationStyleDetails);
  renderAIProviders();

  transcriptReviewForm.addEventListener('submit', submitTranscriptReview);
  imageDescriptionReviewForm.addEventListener('submit', submitImageDescriptionReview);
  cancelImageDescriptionButton.addEventListener('click', () => { resetImageDescriptionReview(); directGoalSection.focus(); setStatus('Image description cancelled.'); });
  captionReviewForm.addEventListener('submit', submitCaptionReview);
  audioDescriptionReviewForm.addEventListener('submit', submitAudioDescriptionReview);
  addAudioDescriptionCueButton.addEventListener('click', () => { addAudioDescriptionCue(); audioDescriptionReviewStatus.textContent = 'Description cue added.'; });
  function pauseWorkflowChainStep(message) {
    if (activeWorkflowChain) { activeWorkflowChain.status = 'paused'; workflowChainSection.hidden = true; }
    setStatus(message);
    renderCurrentTask();
    /* No automatic focus movement on workflow completion or cancellation. */
  }

  cancelAudioDescriptionReviewButton.addEventListener('click', () => { resetAudioDescriptionReview(); if (activeWorkflowChain) pauseWorkflowChainStep('The audio description checkpoint was left incomplete. Choose the goal again to resume; the rest of the accessibility plan was kept.'); else directGoalSection.focus(); });
  addCaptionCueButton.addEventListener('click', () => { addCaptionCue(); captionCues.lastElementChild.querySelector('.caption-start').focus(); });
  cancelCaptionReviewButton.addEventListener('click', () => { resetCaptionReview(); if (activeWorkflowChain) pauseWorkflowChainStep('The caption checkpoint was left incomplete. Choose the goal again to resume; the rest of the accessibility plan was kept.'); else directGoalSection.focus(); });
  cancelTranscriptReviewButton.addEventListener('click', () => {
    resetTranscriptReview();
    if (activeWorkflowChain) pauseWorkflowChainStep('The transcript checkpoint was left incomplete. Choose the goal again to resume; the rest of the accessibility plan was kept.');
    else { directGoalSection.focus(); setStatus('Transcript creation cancelled.'); }
  });
  packageReviewForm.addEventListener('submit', submitPackageReview);

  cancelPackageReviewButton.addEventListener('click', () => {
    resetTranscriptReview();
    resetImageDescriptionReview();
    resetCaptionReview();
    resetAudioDescriptionReview();
    resetPackageReview();
    if (activeWorkflowChain) pauseWorkflowChainStep('The publication package checkpoint was left incomplete. Choose the goal again to resume; the rest of the accessibility plan was kept.');
    else { directGoalSection.focus(); setStatus('Package review cancelled.'); }
  });

  cancelJobButton.addEventListener('click', () => {
    if (activeJob) executionEngine.cancel(activeJob.id);
  });

  createProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const project = window.ProjectWorkspace.create(newProjectName.value);
      newProjectName.value = '';
      if (currentSource && currentKnowledgeModel) window.ProjectWorkspace.addOrUpdateSource(project.id, currentSource, currentKnowledgeModel);
      renderProjectWorkspace(`${project.name} created and selected.`);
      projectSelect.focus();
    } catch (error) {
      projectWorkspaceStatus.textContent = error.message;
      newProjectName.focus();
    }
  });

  projectSelect.addEventListener('change', () => {
    window.ProjectWorkspace.select(projectSelect.value);
    syncCurrentSourceToProject();
    renderProjectWorkspace(projectSelect.value ? 'Active project changed.' : 'No project is active.');
  });

  renameProjectButton.addEventListener('click', () => {
    const project = activeProject();
    if (!project) return;
    const name = window.prompt('Enter a new project name.', project.name);
    if (name === null) return;
    try {
      const updated = window.ProjectWorkspace.rename(project.id, name);
      renderProjectWorkspace(`${updated.name} renamed.`);
    } catch (error) {
      projectWorkspaceStatus.textContent = error.message;
    }
  });

  archiveProjectButton.addEventListener('click', () => {
    const project = activeProject();
    if (!project) return;
    const updated = window.ProjectWorkspace.setArchived(project.id, !project.archived);
    renderProjectWorkspace(updated.archived ? `${updated.name} archived.` : `${updated.name} restored.`);
  });

  deleteProjectButton.addEventListener('click', () => {
    const project = activeProject();
    if (!project) return;
    if (!window.confirm(`Delete ${project.name} from this browser? Source files and generated downloads are not deleted.`)) return;
    window.ProjectWorkspace.remove(project.id);
    renderProjectWorkspace(`${project.name} deleted from the workspace.`);
    projectSelect.focus();
  });

  projectReviews.addEventListener('submit', (event) => {
    const card = event.target.closest('[data-review-id]');
    if (!card) return;
    event.preventDefault();
    const project = activeProject();
    if (!project) return;
    const reviewId = card.dataset.reviewId;
    try {
      if (event.target.classList.contains('review-assignment-form')) {
        const data = new FormData(event.target);
        window.ProjectReview.assign(project.id, reviewId, data.get('assignee'));
        renderProjectWorkspace('Review assignment updated.');
      } else if (event.target.classList.contains('review-comment-form')) {
        const data = new FormData(event.target);
        window.ProjectReview.addComment(project.id, reviewId, data.get('author'), data.get('comment'));
        renderProjectWorkspace('Review comment added.');
      } else if (event.target.classList.contains('review-decision-form')) {
        const data = new FormData(event.target);
        const decision = event.submitter ? event.submitter.value : 'pending';
        window.ProjectReview.setDecision(project.id, reviewId, decision, data.get('reviewer'), data.get('note'));
        renderProjectWorkspace(`Review marked ${decision}.`);
      }
    } catch (error) {
      projectReviewStatus.textContent = error.message;
    }
  });

  function renderLocalProduction() {
    const status = document.getElementById('local-production-status');
    const technical = document.getElementById('local-production-technical');
    const locateButton = document.getElementById('locate-ffmpeg-button');
    if (!status || !window.LocalProduction) return;
    const health = window.LocalProduction.getStatus();
    if (!health) { status.textContent = 'Checking for local video production...'; return; }
    if (!health.helperRunning) {
      status.textContent = 'Local video production is not ready because the local production helper is not running. Accessible-video rendering will use browser-based rendering instead when available. See Technical details for how to start the local production helper.';
      technical.textContent = 'Run "python production_helper.py" from the tools/local-production-helper folder included with this application, then choose Check again.';
      locateButton.hidden = true;
    } else if (health.ffmpeg && health.ffmpeg.found && health.ffprobe && health.ffprobe.found) {
      status.textContent = 'Local production ready. FFmpeg and FFprobe were detected. Accessible-video rendering will use them automatically.';
      technical.textContent = `FFmpeg: ${health.ffmpeg.version || health.ffmpeg.path}. FFprobe: ${health.ffprobe.version || health.ffprobe.path}.`;
      locateButton.hidden = true;
    } else {
      status.textContent = 'Local video production is not ready because FFmpeg could not be located on this computer. Accessible-video rendering will use browser-based rendering instead when available.';
      technical.textContent = 'The local production helper is running but did not find FFmpeg on the system PATH or in common install locations.';
      locateButton.hidden = false;
    }
  }

  document.addEventListener('local-production-updated', renderLocalProduction);
  const retestLocalProductionButton = document.getElementById('retest-local-production-button');
  if (retestLocalProductionButton) retestLocalProductionButton.addEventListener('click', async () => {
    retestLocalProductionButton.disabled = true;
    try { await window.LocalProduction.checkHealth(); } finally { retestLocalProductionButton.disabled = false; }
  });
  const locateFfmpegButton = document.getElementById('locate-ffmpeg-button');
  if (locateFfmpegButton) locateFfmpegButton.addEventListener('click', () => {
    // The local production helper only trusts FFmpeg found on PATH or in its own known install
    // locations, for the same reason it never accepts an arbitrary client-supplied path: doing so
    // would mean executing whatever executable the browser page points it at. Guide the person to
    // a real fix instead of accepting an unchecked path from the browser.
    document.getElementById('local-production-technical').textContent = 'Install FFmpeg so it is available on the system PATH (or in C:\\ffmpeg\\bin), then choose Check again. The local production helper only runs FFmpeg it can verify itself, for security reasons — it cannot accept a folder location typed into the browser.';
    document.getElementById('local-production-details').open = true;
  });
  renderLocalProduction();

  renderProjectWorkspace();
})();
