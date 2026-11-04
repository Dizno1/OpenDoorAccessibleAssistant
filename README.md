# OpenDoorAccessibleAssistant

An accessibility-first media workflow application that analyzes media and helps users accomplish captioning, transcription, audio description, compression, conversion, and AI preparation through goal-oriented workflows.

## Current Milestone

Phase 32 of the executable accessibility workflow roadmap is complete. Sprint 6 (Provider Integration Correction), Sprint 7 (Health-Aware Provider Selection), Sprint 8 (Confirmed Production Bug Fixes), Phase 33 (Assistant-First Experience, three increments plus two corrections), Phase 35 (Intent-Driven Interaction, plus two tightening passes and a workflow-continuation root-cause fix), a Workflow Intelligence pass, a Reviewer-First Workflow pass, an optional Local Production Engine (tested, working FFmpeg rendering), and a Workflow Polish pass (Current Task summary, corrected focus management, and a second-provider audio-description critique pass) have also been completed.

The application now includes:

- Goal-first workflow architecture.
- Local file and web address source abstraction.
- Browser-based media inspection and viewing.
- Shared Knowledge persistence for source analysis, completed work, workflow history, and output metadata.
- Accessibility assessment and dependency-aware planning.
- Prioritized recommendations that adapt to workflow state.
- A Workflow Execution Engine with a queue, step execution, progress, errors, cancellation, and completion notifications.
- An Output Manager that registers generated artifacts, associates them with their source and workflow, and exposes runtime outputs to later workflows.
- The first complete production workflow: Extract Audio.
- A production Accessibility Package workflow that creates a portable ZIP from Shared Knowledge, workflow history, and approved outputs.
- An accessible pre-export review with artifact selection, package naming, privacy confirmation, and final manifest regeneration.
- A complete Create Transcript workflow with an accessible editing and review workspace, validation, plain-text export, Output Manager registration, and Shared Knowledge updates.
- A complete Create Captions workflow with transcript reuse, an accessible timed-cue editor, timing validation, reviewed WebVTT export, a caption review record, Output Manager registration, and Shared Knowledge updates.
- A complete Audio Description workflow with an accessible timed narration editor, placement and timing validation, reviewed script and review-record exports, Output Manager registration, Shared Knowledge updates, and recommendation completion tracking.
- An outcome-based Workflow Chain coordinator that orders dependent accessibility work, skips completed actions, preserves human review checkpoints, continues automatically after successful steps, and pauses safely on failure or cancellation.
- An AI Provider Layer with capability discovery, preferred-provider selection, a private on-device assistance provider, and an optional connected JSON provider for transcription, caption, visual-analysis, and audio-description drafting.
- An accessible Project Workspace that organizes multiple related sources, source-level Shared Knowledge summaries, generated artifact counts, workflow history, and project readiness status under one persistent project.
- Project-aware Accessibility Intelligence that evaluates every source, calculates completion, detects missing or blocked work, identifies stale accessibility packages, and prioritizes the best next actions across the active project.
- Automatic provider guidance that keeps provider selection under the hood, favors private and no-additional-cost methods, warns before external processing or possible charges, securely stores connected-service credentials for the browser session only, and preserves provider overrides inside Advanced assistance settings.
- Project-aware Human Review and Approval that automatically creates review records for completed transcript, caption, audio-description, and package work; supports assignments, comments, approval, rejection, and revision history; and prevents publication readiness until required reviews are approved.
- Publication Readiness validation that combines workflow completion, accessibility intelligence, human approvals, and package freshness into a single project readiness score with clear blocking reasons and plain-language next steps.
- Executable connected transcription that sends the selected local audio or video content only after privacy and cost confirmation, then places the returned text into the existing accessible review workspace.
- A complete Describe This Picture workflow that sends the selected image only after confirmation, receives an editable description, requires human review, and exports a registered plain-text artifact.
- A built-in OpenAI service adapter, configured only in Advanced assistance settings, that performs direct audio and video transcription and image analysis without requiring a custom intermediary endpoint.
- Plain-language direct goal execution after source inspection, including Transcribe This, Describe This Picture, Create Captions, Create Audio Description, Extract Audio, Create an Accessibility Package, and Make This Accessible.
- Automatic provider selection that can choose the built-in adapter while preserving privacy and possible-cost confirmation before any source leaves the browser.
- Automatic timed caption drafting from provider speech timestamps, with readable cue segmentation and a transcript-based fallback when exact timing is unavailable.
- Automatic timed audio-description drafting from locally sampled video frames and available transcript context, with all narration returned to the existing mandatory review workspace.
- Reviewed narration synthesis through the built-in OpenAI adapter, with voice and speed controls, explicit cost and privacy confirmation, and a no-cost manual-recording alternative.
- Local browser-based audio mixing that ducks the original soundtrack during narration cues and exports a described-audio WAV file while preserving the reviewed script and review record.
- Local accessible-video rendering that combines the original picture with the approved described-audio soundtrack, then creates a publication ZIP containing the rendered WebM, selectable WebVTT captions, an accessible HTML player, a manifest, and a final validation checklist.
- A complete Make This Accessible orchestrator that builds a media-specific plan, skips completed work, runs automatic steps, pauses only for required human review, resumes after approval, refreshes dependencies after every result, renders the accessible video when possible, and creates the final accessibility package.
- Advanced accessibility analysis that scores scene understanding, speaker recognition, caption quality, audio-description quality, visual accessibility, and narration optimization; reports measurable reading-speed and cue-density indicators; refreshes after completed work; and optionally performs deeper provider analysis after privacy and cost confirmation.
- A complete Publication Pipeline with selectable export profiles, project-wide readiness validation, delivery targets, accessible blocking reports, portable ZIP packaging, source and workflow inventories, review records, deployment instructions, available runtime artifacts, and SHA-256 checksums.
- Persistent resumable jobs with centralized state transitions, checkpoints, recoverable errors, retry limits, startup crash recovery, accessible resume controls, batch records and controls, chronological project event history, and duplicate-worker protection for browser-background execution.
- A project-level Accessibility Advisor that reviews completed work like an accessibility consultant, identifies critical, major, and minor risks, recommends improvements, scores six readiness categories, assigns an overall accessibility-readiness score, detects stale reviews, records final reviewer acceptance, and blocks publication until the current review is accepted.
- A secure Provider Manager with copy-and-paste configuration for OpenAI, Azure OpenAI, and Google Gemini; encrypted browser-profile storage; connection testing; clear controls; automatic capability-based selection; and no credential storage in repositories or project exports.
- A complete Provider Manager workspace with show-or-hide key controls, configured and last-tested status, multiple named Azure resources, Anthropic support, optional local Ollama and Whisper detection, and automatic migration of existing Phase 29 Azure settings.
- Shared Services integration that imports existing Open Door Design OpenAI, Gemini, Azure Speech, and Azure Vision configuration through one accessible folder or file selection, preserves the original files, encrypts the imported copy in the browser profile, and registers Azure Speech transcription plus Azure Vision image analysis and OCR with automatic provider selection.


## Phase 30 Provider Manager

Phase 30 makes provider setup directly discoverable inside Advanced assistance settings. Users can paste credentials into protected fields, reveal a key only while editing, save it to encrypted browser-profile storage, test the connection, and clear it without touching repository files. Azure OpenAI supports multiple named resource profiles. Anthropic, local Ollama, and local Whisper are now registered with the capability-selection layer.

The normal workflow remains provider-neutral. Automatic selection asks which configured method can perform the required task and continues to require privacy and possible-cost confirmation before external processing. See `docs/Phase 30 Provider Manager.md` for implementation details, migration behavior, accessibility notes, and local-service limitations.

## Phase 31 Shared Services Integration

Phase 31 adds an accessible one-step import for existing Open Door Design provider files. Choose the SharedServices folder, or select the known files together when folder selection is unavailable. OpenAI and Gemini are imported into their existing encrypted provider records. Azure Speech and Azure Vision are stored in a dedicated encrypted record and become available to the existing capability-selection engine.

The browser requires an explicit folder or file choice and cannot silently search a Windows path. The importer leaves every original file unchanged. See `docs/Phase 31 Shared Services Integration.md` for supported filenames, security boundaries, provider capabilities, accessibility behavior, testing, and limitations.


## Design Principle

Users choose outcomes. The application builds and executes the workflow.

Implementation details such as media tracks, codecs, containers, browser recording APIs, and processing providers remain behind plain-language goals.

## Getting the Application Running

1. Copy the project source into a local folder. The `.git` directory is not required to run the application.
2. Open the folder in a current version of Chrome, Edge, or Firefox.
3. Start a simple local web server from the project folder. Python users can run `python -m http.server 8000`. Node users can run `npx serve .`. A local server is recommended because browser security restrictions can block media, module, and file features when `index.html` is opened directly.
4. Open the address reported by the server, commonly `http://localhost:8000`.
5. Choose a local media file. The original file remains on the device unless a connected assistance feature is explicitly confirmed.
6. To use connected AI assistance, open Advanced assistance settings and paste an OpenAI, Azure OpenAI, or Google Gemini credential. Credentials are encrypted in this browser profile on this computer and are never written into project source or exported packages. Use each provider's Test connection button before starting paid work.
7. Leave provider selection on Automatic, recommended. The application chooses the available provider and displays privacy and possible-cost confirmation before external processing.
8. Enter a plain-language goal such as `Make this video accessible`, then review each required human checkpoint.
9. Keep the browser tab open while long media jobs run. Generated runtime files remain available only for the current browser session, so download important outputs before closing the tab.
10. For narration mixing, use a browser that can decode the source video's audio track through the Web Audio API. MP4 and WebM support depends on the browser and operating system codecs. If decoding fails, create a browser-compatible copy of the source and run the workflow again.

No build step or package installation is required for the application itself.

## Local Processing Requirements

Extract Audio requires a supported local video containing an audio track and a browser that supports `MediaRecorder` and media stream capture. Described-audio mixing requires `AudioContext`, `OfflineAudioContext`, and browser support for decoding the selected source audio. The described-audio result is exported as WAV. Accessible-video rendering requires `MediaRecorder`, video `captureStream`, Web Audio routing, and WebM encoding support. Rendering runs in real time. Selectable captions are delivered through the included accessible HTML player and external WebVTT track because browser MediaRecorder does not reliably embed selectable captions or create MP4 files.

## Architecture

### Source and inspection

`media-inspector.js` creates the source inspection used throughout the application. `shared-knowledge.js` merges that inspection with saved source knowledge.

### Authoritative Stage 1 Architecture: File, Analysis, Engines, Workflow

This sequence is the controlling architecture for every supported source type. It is not optional, and later workflow logic must not bypass it.

1. **Receive the file or web source.** Identify the source type, container, format, basic technical properties, and whether the browser can inspect or preview it.
2. **Begin Stage 1 analysis.** Determine what is actually present in the source and what still must be analyzed. For media, this can include speech, speakers, meaningful non-speech audio, scenes, actions, objects, on-screen text, existing captions, existing audio description, and other accessibility-relevant content. For documents, websites, and images, Stage 1 must use the equivalent source-specific analysis.
3. **Determine the required capabilities and engines.** Stage 1 maps the source type and unresolved analysis questions to the engines needed to answer them. Examples include FFmpeg or browser media inspection, speech recognition, speaker identification, audio-event analysis, visual analysis, OCR, document parsing, accessibility-tree inspection, caption analysis, and audio-description analysis.
4. **Check engine availability.** The application must determine whether each required capability is available through a working local engine, browser capability, Shared Service, or configured provider. A capability is not considered available merely because scaffolding or a provider adapter exists.
5. **Install, configure, activate, or test missing engines.** When a required capability is unavailable, the normal workflow pauses and routes the user to an accessible Engine or Provider setup path. The application must explain what is missing, why it is needed, whether processing is local or external, and any privacy or cost implications.
6. **Resume and complete Stage 1 analysis.** After the required engine becomes available, analysis resumes automatically or through one clearly labeled continuation action. Unknown analysis fields must remain unknown until produced by real inspection or a functioning engine.
7. **Build the accessibility workflow from completed analysis.** Only after Stage 1 has enough reliable results may the application decide which accessibility tasks are required, optional, unnecessary, or blocked.
8. **Execute the workflow and preserve human review.** Automatic work may proceed, but transcript, caption, audio-description, remediation, and publication decisions still require the appropriate human checkpoints.

The application must never replace missing analysis with a fixed transcript-caption-render pipeline. It must never treat an unset analysis field as evidence that analysis was completed. It must never ask the user to invent content simply because the engine that should have produced or evaluated that content is unavailable.

For example, a video upload does not automatically prove that a transcript is required. Stage 1 must first determine whether speech analysis was actually completed. If the speech-analysis capability is unavailable, the application must say so and direct the user to engine setup rather than opening transcript review as though spoken content had already been detected.

Implementation status: this architecture is the established project direction, but the current repository does not yet enforce it end to end. Existing inspection, assessment, provider, and workflow components contain portions of the design. The immediate development priority is to connect them into this authoritative sequence and remove paths that construct workflows from file type, defaults, placeholders, or unset analysis values.

### Assessment, planning, and recommendations

The accessibility assessment identifies relevant improvements. The accessibility plan orders dependent work. The Recommendation Engine combines those results with provider availability, completed history, and active jobs.

Recommendations now distinguish between:

- Ready to execute
- In progress
- Completed
- Blocked

Completed workflows are removed from unfinished recommendations automatically.

### Workflow Execution Engine

`execution-engine.js` owns the workflow queue and active job. It:

- Queues jobs.
- Starts queued work in order.
- Routes progress, completion, failure, and cancellation events.
- Cancels queued or active work.
- Starts the next queued job when the current job ends.

`workflow-runner.js` validates jobs, executes workflow steps, invokes the selected provider, reports progress, handles cancellation, and sends successful outputs to the Output Manager.

### Output Manager

`output-manager.js` registers each generated artifact with:

- Artifact and job identifiers.
- Originating workflow.
- Originating source key and source name.
- Provider.
- MIME type, size, duration, and creation time when available.
- Runtime URL or readable content.

Persistent output metadata and workflow history are stored in Shared Knowledge. Runtime file URLs remain available during the current browser session.


### Project Workspace

`project-workspace.js` provides a persistent project layer above individual source records. It:

- Creates, selects, renames, archives, restores, and deletes projects stored in the browser.
- Adds the current source to the active project automatically after inspection.
- Keeps separate Shared Knowledge for each source while exposing project-level summaries.
- Records completed workflows and their artifact names in project history.
- Reports project state as Incomplete, In Progress, Review Required, Ready to Publish, or Archived.
- Preserves project membership and history across browser visits without storing the original media file.

The workspace uses native form controls, headings, lists, status regions, and keyboard-operable actions. Selecting a project never changes or deletes the source currently open in the application.

### Extract Audio pipeline

The production Extract Audio workflow:

1. Validates that the source is a supported local video with audio.
2. Queues and starts a workflow job.
3. Reads the source media and captures its audio track.
4. Creates an Opus audio-only WebM or Ogg file, depending on browser support.
5. Reports accessible progress and errors.
6. Allows cancellation while processing.
7. Registers the artifact with the Output Manager.
8. Records workflow history and output metadata in Shared Knowledge.
9. Updates recommendations so Extract Audio becomes Completed.

### Accessibility Package pipeline

The production Accessibility Package workflow:

1. Collects Shared Knowledge and workflow history for the current source.
2. Identifies completed accessibility work, remaining gaps, and recommended follow-up actions.
3. Collects generated files whose runtime data is still available in the browser session.
4. Creates a readable `manifest.md` and machine-readable `manifest.json`.
5. Builds a portable ZIP locally without a network request or third-party dependency.
6. Registers the ZIP with the Output Manager and records completion in Shared Knowledge.
7. Becomes available again automatically when later workflow work makes the existing package stale.

The original source is not included automatically. Persisted output records whose temporary browser file data is unavailable are listed clearly in the manifest.

## Accessibility

New execution controls use native buttons, labeled status messages, a programmatic progress bar, keyboard-operable cancellation, focus management, and polite live-region announcements. Existing screen-reader and keyboard behavior is preserved.

## Accessibility Intelligence Engine Roadmap

### Phase 1 - Accessibility Intelligence Engine - Completed

One shared media knowledge model supports every task.

### Phase 2 - Accessibility Assessment - Completed

Shared Knowledge is converted into plain-language accessibility findings and confidence statements.

### Phase 3 - Accessibility Plan - Completed

Assessment results become an ordered, dependency-aware plan.

### Phase 4 - Shared Knowledge - Completed

Completed work and output metadata persist for the same source.

### Phase 5 - Recommendation Engine - Completed

Recommendations use Shared Knowledge, dependencies, completed work, and provider availability.

### Phase 6 - Workflow Execution and Extract Audio - Completed

The execution queue, cancellation, progress pipeline, Output Manager, automatic knowledge updates, state-aware recommendations, and production Extract Audio workflow are implemented.

### Phase 7 - Accessibility Package - Completed

The application creates a portable ZIP containing readable and machine-readable manifests, available generated files, completed accessibility work, remaining gaps, workflow history, and recommended follow-up actions.

## Development Progress Rule

Every development cycle must begin by reading this README and the full repository. Update this README before returning the project ZIP so it records the completion state and identifies the next phase.

### Phase 8 - Package Review and Export Controls - Completed

The Accessibility Package workflow now opens an accessible review before execution. Users can inspect available artifacts, include or exclude files, rename the ZIP, review privacy notices, and confirm sensitive inclusions. The final selection is passed through the existing execution pipeline, both manifests are regenerated from the approved contents, exclusions are recorded, and Shared Knowledge stores the export choices.

### Phase 9 - Create Transcript Production Workflow - Completed

Create Transcript is now a complete production workflow. It opens a keyboard-accessible transcript editor beside the existing media viewer, requires transcript content and an explicit accuracy review, executes through the Workflow Execution Engine, creates a reviewed plain-text transcript, registers the artifact with the Output Manager, and records completion, word count, and review time in Shared Knowledge. Recommendations stop offering transcription once the completed transcript is recorded.

### Phase 10 - Create Captions Production Workflow - Completed

Create Captions is now a complete production workflow. It reuses a completed transcript when one is available, creates starter timed cues, and opens a keyboard-accessible cue editor with individually labeled start time, end time, and caption text controls. Users can add and remove cues, review the source in the existing Viewer, and confirm the completed caption set. Validation blocks empty cues, invalid timestamps, end times before start times, overlaps, and cues that extend beyond the source duration. The Workflow Execution Engine exports a reviewed WebVTT file and a readable caption review record, registers both outputs with the Output Manager, and records caption completion, cue count, review time, and high-confidence status in Shared Knowledge. Recommendations automatically stop offering Create Captions after completion.

### Phase 11 - Audio Description Production Workflow - Completed

Audio Description is now a complete production workflow. It provides a keyboard-accessible timed narration editor with labeled start and end times, narration placement choices, production notes, add and remove controls, review confirmation, and live validation feedback. The workflow validates timestamp format, chronology, source duration, narration content, and review confirmation. The Workflow Execution Engine exports a reviewed Markdown audio description script and a separate review record, registers both artifacts with the Output Manager, records cue count and review time in Shared Knowledge, and automatically marks the recommendation complete.

### Phase 12 - Workflow Chaining - Completed

Users can now choose the complete "Prepare media for accessibility" outcome instead of starting every workflow separately. The application builds an ordered chain from current recommendations, skips work already recorded in Shared Knowledge, and coordinates Extract Audio, Create Transcript, Create Captions, Audio Description, and Accessibility Package. Transcript, caption, audio description, and package creation remain human review checkpoints. The chain continues automatically after successful execution, announces each transition, and pauses safely when a step fails or the user cancels.

### Phase 13 - AI Provider Layer - Completed

Interchangeable assistance providers now register standard capabilities without changing workflow definitions. The application selects an appropriate provider automatically, while advanced users can review provider details, configure an optional HTTPS JSON endpoint, or deliberately override the automatic choice. A local on-device provider creates caption drafts and audio-description review checkpoints from existing Shared Knowledge. Connected credentials remain in session storage only. All generated material remains a draft and must pass the existing accessible human-review controls before the Workflow Execution Engine records completion.


### Phase 14 - Intelligent Project Workspace - Completed

The application now supports persistent projects containing multiple related media sources. Users can create and select projects, rename or archive them, and review project-level source counts, recorded artifact counts, completed workflow counts, and readiness status. Every inspected source is added automatically to the active project, while its detailed Shared Knowledge remains source-specific. Completed jobs are recorded in project workflow history with their source and created artifact names. The workspace recognizes Incomplete, In Progress, Review Required, Ready to Publish, and Archived states and restores the active project on later visits.

### Phase 15 - Project Accessibility Intelligence - Completed

The active workspace now receives project-wide accessibility guidance. Every source is evaluated against media-appropriate deliverables, with completion percentages calculated at source and project level. The intelligence layer distinguishes missing, blocked, in-progress, complete, and stale work; prioritizes dependencies such as transcript before captions; and detects when an accessibility package must be regenerated because newer transcript, caption, or audio-description work was completed. The Project Workspace presents an accessible summary, progress facts, and an ordered list of next actions that recalculates automatically as work changes.

### Phase 16 - Provider Guidance, Cost Awareness, and Secure Configuration - Completed

Automatic provider guidance, privacy and cost confirmation, session-only credentials, and advanced overrides are complete.

### Phase 17 - Human Review and Approval - Completed

Project-aware review records, assignments, comments, approval, rejection, and revision history are complete.

### Phase 18 - Publication Readiness - Completed

Workflow completion, approvals, package freshness, blocking reasons, and project readiness scoring are combined into one plain-language evaluation.

### Phase 19 - Executable Transcription and Image Description - Completed

Connected transcription now receives the actual selected audio or video source, and Describe This Picture is a complete accessible workflow with source transfer, editable AI draft, human review, export, Output Manager registration, and Shared Knowledge updates. Provider choice remains hidden during normal use. External processing and possible charges are disclosed before source content leaves the browser.

## Remaining Roadmap

- Add built-in adapters for supported transcription and vision services so users do not need to provide a custom endpoint contract.
- Generate or record narration and combine it with the source media.
- Render and export a final accessible video package.

### Phase 20 - Built-in Provider Adapters and Direct Goal Execution - Completed

The application now includes a built-in OpenAI adapter for direct transcription and image description. Credentials remain in session storage, provider choice remains inside Advanced assistance settings, and every external request requires a privacy and possible-cost confirmation. After a source is inspected, users can type a plain-language goal and begin the matched workflow without selecting providers or understanding workflow order. Existing accessible transcript and image-description review checkpoints remain mandatory before final artifacts are saved.

New files and subsystems:

- `js/openai-provider.js` provides direct OpenAI transcription and visual-analysis capabilities.
- The direct goal form in `index.html` maps plain-language outcomes to existing intents and workflow chains.
- `js/app.js` coordinates goal matching, provider configuration, disclosure, and accessible focus/status behavior.

### Phase 21 - Automatic Caption and Audio Description Drafting - Completed

The built-in provider adapter can now create timed caption drafts from speech segment timestamps and useful timed audio-description drafts from locally sampled video frames. Caption text is divided into readable cues without overlapping timing. When exact speech timing is unavailable, the application can create an explicitly identified transcript-based fallback draft. Audio-description drafting combines timestamped frame samples with available transcript context to reduce duplication of spoken information. Both workflows continue through the existing accessible human-review, validation, approval, export, Output Manager, Shared Knowledge, workflow-chain, and project-review systems.

New files and subsystems:

- `js/caption-drafting.js` normalizes provider speech segments, creates readable timed cues, and supplies the transcript-based fallback.
- `js/ad-drafting.js` samples local video frames in the browser and normalizes timed narration drafts.
- `js/openai-provider.js` now provides built-in `caption-draft` and `audio-description-draft` capabilities in addition to transcription and image analysis.
- `js/app.js` now supplies the selected local source to timed caption drafting after the required privacy and cost confirmation.

### Phase 22 - Narration Generation and Accessible Audio Mixing - Completed

Phase 22 converts a reviewed audio-description script into synthesized narration clips and a locally mixed described-audio WAV file. It adds voice, speed, narration-volume, and source-ducking controls; requires explicit privacy and possible-cost confirmation before synthesis; preserves a no-cost manual-recording path; and uses browser-native audio decoding and offline rendering so the original source audio is mixed locally.

New architecture includes `js/narration-mixer.js`, the `narration-audio` provider capability, synthesized cue handling in the built-in OpenAI adapter, and optional narration production within the existing audio-description review checkpoint.

See `docs/Phase 22 Narration Generation and Accessible Audio Mixing.md`.

## Remaining Roadmap

- Add resilient large-file processing, resumable rendering, and provider-specific size-limit guidance.
- Add narration preview, per-cue regeneration, pronunciation overrides, and cue-specific gain controls.
- Add additional publication presets and optional server-side MP4/HLS export adapters.
- Add automated playback inspection and caption synchronization diagnostics.

### Phase 23 - Accessible Video Rendering and Publication Export - Completed

Phase 23 adds a production Render Accessible Video workflow for local video sources. The workflow validates that reviewed WebVTT captions and a described-audio WAV are available in the current browser session, combines the original picture with the approved described soundtrack, and records a new WebM locally. It then creates a publication ZIP containing the rendered video, selectable WebVTT captions, an accessible native HTML video player, a machine-readable publication manifest, and a readable final validation checklist.

The workflow reports real-time progress, supports cancellation, registers outputs through the Output Manager, records completion in Shared Knowledge and project history, and keeps all rendering local to the browser.

New files and subsystems:

- `js/publication-renderer.js` performs synchronized local picture and described-audio rendering and builds the publication package.
- `workflows/render-accessible-video.json` defines the production workflow contract.
- `docs/Phase 23 Accessible Video Rendering and Publication Export.md` documents behavior, accessibility, browser requirements, and limitations.
- `js/media-inspector.js`, `js/workflow-registry.js`, `js/intent-engine.js`, `js/browser-provider.js`, `js/workflow-runner.js`, and `js/app.js` expose, validate, execute, and track the new goal.

See `docs/Phase 23 Accessible Video Rendering and Publication Export.md`.

## Phase 24 - Make This Accessible Orchestrator - Completed

Phase 24 completes the unified goal-driven orchestration workflow. Choosing Make This Accessible now starts the required media-specific plan directly. The application skips completed work, executes non-review steps automatically, opens existing accessible human-review checkpoints only when judgment is required, and resumes after approved work is saved.

The video plan now coordinates Extract Audio, Create Transcript, Create Captions, Audio Description, Render Accessible Video, and Accessibility Package. Audio and image sources receive smaller media-appropriate plans. Provider availability and Shared Knowledge are refreshed after every completed step so downstream work can use newly created artifacts. Blocked, failed, and cancelled work pauses safely without discarding completed outputs.

New architecture and workflow changes:

- `js/workflow-chain.js` now owns media-specific orchestration order, dynamic step refresh, review pauses, blocked states, failure states, and completion summaries.
- `js/app.js` starts Make This Accessible directly, resumes it after each completed job, and defaults orchestrated audio-description review to narration production so accessible-video rendering can use the described soundtrack.
- Existing execution, provider, review, Shared Knowledge, Output Manager, project, rendering, and packaging systems are reused.
- `docs/Phase 24 Make This Accessible Orchestrator.md` documents the completed behavior and architecture.

## Phase 25 - Advanced AI Analysis - Completed

Phase 25 adds an accessible quality-analysis panel that runs automatically after source inspection and refreshes after workflow completion. The local analysis uses inspection data and Shared Knowledge to score scene understanding, speaker recognition, caption quality, audio-description quality, visual accessibility, and narration optimization. It reports measurable indicators including estimated reading speed and cue density, plus actionable findings.

A Run deeper AI analysis action uses the existing provider layer. The application keeps provider choice under the hood, requires the existing privacy and possible-cost confirmation, normalizes structured provider findings, and stores the completed report in Shared Knowledge. The built-in OpenAI adapter now supports the `advanced-accessibility-analysis` capability.

New files and subsystems:

- `js/advanced-analysis.js` provides local scoring, quality findings, metrics, accessible rendering, deeper provider execution, normalization, and persistence.
- `docs/Phase 25 Advanced AI Analysis.md` documents behavior, architecture, accessibility, and limitations.
- `index.html`, `css/styles.css`, `js/app.js`, and `js/openai-provider.js` integrate the new panel and provider capability.

See `docs/Phase 25 Advanced AI Analysis.md`.

## Phase 26 - Publication Pipeline - Completed

Phase 26 adds a project-level Publication Pipeline that turns approved accessibility work into a delivery-ready package. The active project can be validated against one of three export profiles: Accessible Web Publication, Learning Platform Delivery, or Accessible Archive Master. Validation checks every source for media-appropriate required work, rejected or pending reviews, workflow history, and package completion. Blocking issues prevent final export and are presented in an accessible, focusable report with a readiness score, warnings, and passed checks.

The completed pipeline supports four delivery targets: local download, web-hosting handoff, learning-platform handoff, and records archive. The package is built locally in the browser and includes a machine-readable publication manifest, plain-text readiness report, source inventory, workflow history, human-review records, delivery instructions, all currently available runtime artifacts, and SHA-256 checksums when browser support is available. No source or credential is transmitted during packaging.

New files and subsystems:

- `js/publication-pipeline.js` provides export profiles, delivery targets, project validation, accessible results, packaging, checksums, and publication history records.
- `index.html` adds the project-level Publication Pipeline interface.
- `css/styles.css` adds responsive, keyboard-visible publication controls and validation presentation.
- `js/output-manager.js` now exposes available runtime artifacts to the publication packager.
- `docs/Phase 26 Publication Pipeline.md` documents architecture, behavior, accessibility, package contents, and limitations.

See `docs/Phase 26 Publication Pipeline.md`.

## Phase 27 - Production Features - Completed

Phase 27 extends the existing execution engine and Project Workspace with durable browser-based production state. Jobs now use a centralized state model, persistent checkpoints, completed and pending step tracking, recoverable errors, retry limits, resume controls, startup interruption detection, batch records, aggregate progress, accessible batch actions, and chronological project event history. Duplicate execution is prevented by the existing single queue plus job-ID checks. Processing may continue while users navigate elsewhere in the open application, but the browser must remain open. Paid, destructive, and publication operations never restart silently.

Storage changes are additive and versioned. Existing Phase 26 projects and settings remain intact. Because browsers cannot safely persist local `File` objects, a fully restarted browser may require the original source to be chosen again before resume.

New and modified files:

- `js/production-features.js` adds job persistence, state transitions, checkpoints, recovery, batches, history, retries, and accessible rendering.
- `js/job.js` creates production-ready job records and initial checkpoints.
- `js/execution-engine.js` adds duplicate protection, pause, resume-safe queue behavior, and batch updates.
- `js/workflow-runner.js` skips completed steps and writes execution-boundary checkpoints.
- `js/project-workspace.js` adds persistent project event history.
- `index.html`, `css/styles.css`, and `js/app.js` integrate accessible controls, announcements, resume context, and lifecycle persistence.
- `docs/Phase 27 Production Features.md` documents architecture, migration, testing, accessibility, and limitations.

See `docs/Phase 27 Production Features.md`.

## Phase 28 - Accessibility Advisor - Completed

Phase 28 adds a persistent, project-level Accessibility Advisor that evaluates the evidence produced by the existing orchestration, analysis, review, production, and publication systems. The Advisor identifies accessibility issues by severity, explains remaining risks, recommends specific improvements, records completed strengths, calculates category scores, and assigns an overall accessibility-readiness score.

A final reviewer can accept a current Advisor report for publication when no critical issues remain. Reports are fingerprinted against source snapshots, workflow history, human-review records, and publication records so later project changes make an earlier report visibly stale. The Publication Pipeline now blocks export until a current Advisor review has been accepted and includes the Advisor report in both JSON and plain-text formats inside the final package.

New and modified files:

- `js/accessibility-advisor.js` provides project evaluation, severity-based findings, recommendations, category scoring, overall readiness scoring, report persistence, staleness detection, final reviewer acceptance, accessible rendering, and plain-text report export.
- `index.html` adds the Accessibility Advisor review and decision interface.
- `css/styles.css` adds accessible report, severity, stale-state, and decision presentation.
- `js/app.js` refreshes Advisor and publication state when project evidence changes.
- `js/publication-pipeline.js` requires a current accepted Advisor review and includes Advisor records in publication packages.
- `docs/Phase 28 Accessibility Advisor.md` documents architecture, behavior, accessibility, testing, storage, and limitations.

See `docs/Phase 28 Accessibility Advisor.md`.

## Phase 29 - Secure Provider Manager - Completed

Phase 29 adds an accessible Advanced assistance settings interface for copying and pasting OpenAI, Azure OpenAI, and Google Gemini credentials. Provider settings are encrypted with a non-exportable AES-GCM key and saved in IndexedDB for the current browser profile. Password fields clear after saving, existing credentials are preserved when non-secret settings change, and each provider includes Save, Test connection, and Clear controls.

Provider selection remains automatic during normal workflows. The AI Provider Layer can use configured capabilities while preserving the existing privacy and possible-cost confirmation. Credentials never enter project files, Shared Knowledge, workflow history, publication packages, or returned ZIP archives.

New and modified files:

- `js/secure-credential-store.js` provides encrypted IndexedDB credential storage using the Web Crypto API.
- `js/azure-openai-provider.js` adds a built-in Azure OpenAI adapter and connection test.
- `js/gemini-provider.js` adds a built-in Gemini adapter and connection test.
- `js/openai-provider.js` now persists its credential through the secure store and includes connection testing.
- `index.html` adds labeled OpenAI, Azure OpenAI, and Gemini provider controls.
- `js/app.js` coordinates save, test, clear, status announcements, and restored provider availability.
- `docs/Phase 29 Secure Provider Manager.md` documents security, behavior, accessibility, testing, and limitations.

See `docs/Phase 29 Secure Provider Manager.md`.

## Phase 30 - Complete Provider Manager - Completed

Phase 30 turns provider configuration into a complete, discoverable workspace. It adds protected copy-and-paste fields, show-or-hide controls, configured and last-tested status, multiple named Azure OpenAI resources, an Anthropic adapter, and optional local Ollama and Whisper detection. Existing Phase 29 Azure settings migrate automatically into the new profile structure.

New and modified files:

- `js/provider-manager-ui.js` coordinates provider configuration status, key visibility, Azure resource profiles, and local-service detection.
- `js/azure-openai-provider.js` now supports multiple encrypted Azure resource profiles and migration from the Phase 29 single-resource format.
- `js/anthropic-provider.js` adds Anthropic visual-analysis, audio-description, and accessibility-analysis capabilities.
- `js/local-service-provider.js` adds optional local Ollama and Whisper capability registration and connection detection.
- `js/openai-provider.js` and `js/gemini-provider.js` persist last-tested status.
- `index.html` adds provider shortcuts, status text, profile controls, Anthropic configuration, and local-service configuration.
- `css/styles.css` adds Provider Manager navigation and status presentation.
- `docs/Phase 30 Provider Manager.md` documents behavior, migration, accessibility, security, and limitations.

See `docs/Phase 30 Provider Manager.md`.

## Phase 31 - Shared Services Integration - Completed

Phase 31 adds one-step import of existing Open Door Design provider settings. Users can choose a SharedServices folder or select the recognized provider files together. The application imports OpenAI, Gemini, Azure Speech, and Azure Vision settings into the existing encrypted browser credential store without modifying the original files.

Azure Speech and Azure Vision now register directly with the existing AI Provider Layer. Azure Speech can create transcription drafts, while Azure Vision can create image-description and OCR results. A provider-neutral `ODDSharedServices` facade gives future Open Door Design applications a common entry point for transcription, image description, and OCR.

New and modified files:

- `js/shared-services.js` provides SharedServices import, parsing, encrypted persistence, Azure Speech and Azure Vision adapters, connection tests, and the provider-neutral facade.
- `js/shared-services-ui.js` provides the accessible folder/file import workflow, status reporting, and Azure connection-test controls.
- `index.html` adds the SharedServices import workspace and loads the new modules.
- `css/styles.css` adds the SharedServices import presentation.
- `docs/Phase 31 Shared Services Integration.md` documents architecture, security boundaries, accessibility, testing, and limitations.

See `docs/Phase 31 Shared Services Integration.md`.

## Phase 32 - First-Time Experience and Shared Services Discovery - Completed

Phase 32 replaces the direct SharedServices-folder workflow with an accessible first-time setup experience. The user selects the parent Open Door Design Apps folder once. The application discovers SharedServices, imports the recognized provider settings, remembers the approved folder handle in the browser profile, and tests configured connections.

The normal interface now reports which provider services are ready and keeps technical controls inside collapsed disclosures. The provider layer continues to choose services automatically during goal-driven workflows.

New and modified files:

- `js/shared-services.js` adds Apps-folder discovery, known-application fallback discovery, persisted directory handles, reconnect behavior, and grouped connection testing.
- `js/shared-services-ui.js` adds the first-time setup state, maintenance state, plain-language connection results, and remembered-folder status.
- `index.html` replaces the direct folder importer with the accessible setup and maintenance interface.
- `css/styles.css` adds setup and status presentation.
- `docs/Phase 32 First-Time Experience and Shared Services Discovery.md` documents the implementation, security boundaries, accessibility behavior, and limitations.

See `docs/Phase 32 First-Time Experience and Shared Services Discovery.md`.

## Sprint 6 - Provider Integration Correction - Completed

Real testing of the Phase 31/32 Shared Services import against live Open Door
Design provider files surfaced four problems: OpenAI reported HTTP 401 with
no explanation, Gemini reported that an obsolete model identifier was not
found, Azure Vision reported a bare "Failed to fetch" for every attempt, and
the Provider Manager summary undercounted configured services because it did
not include Azure Speech or Azure Vision imported through Shared Services.
This sprint corrects the reporting and, where possible, the underlying
behavior, without adding a new orchestration layer or a new phase.

- **Provider status is now consistent.** The Provider Manager summary
  counts Azure Speech and Azure Vision imported through Shared Services, so
  it no longer disagrees with the Shared Services import summary.
- **OpenAI connection results are plain-language.** HTTP 401 is reported as
  "Authentication failed," with a note that a ChatGPT subscription does not
  grant API access. Network failures are distinguished from HTTP error
  responses. A missing key is reported as "Configuration file did not
  contain a recognized API key."
- **Gemini model handling is self-correcting.** The Gemini adapter queries
  Gemini's model list, keeps a user-configured model when it is still
  supported, and falls back to a currently supported model (preferring
  `gemini-2.5-flash`) when an imported or previously saved model has been
  retired. This runs on import/save and again automatically if a live
  request reports a model as unavailable.
- **Azure Vision failures are diagnosed, not just reported.** The connection
  test now distinguishes a malformed endpoint, an authentication failure,
  and a network-level failure. Because most Azure Computer Vision resources
  do not allow direct browser-to-Azure requests, a network failure against
  what looks like a genuine endpoint is now reported as a likely
  cross-origin restriction, with the existing configuration preserved for a
  future local helper or backend rather than silently discarded.
- **A hardcoded personal folder path was removed.** The first-time setup
  announcement and setup panel previously named one person's Windows
  username and folder path directly; both now use generic wording.

New and modified files:

- `js/provider-manager-ui.js` counts Shared Services providers and refreshes
  on Shared Services updates.
- `js/openai-provider.js` reports plain-language, distinguishable connection
  results.
- `js/gemini-provider.js` adds live model discovery and fallback.
- `js/shared-services.js` distinguishes Azure Speech and Azure Vision
  failure modes instead of reporting every failure as "Failed to fetch."
- `js/shared-services-ui.js` and `index.html` remove the hardcoded personal
  path.
- `docs/Sprint 6 Notes.md` documents the specific fixes, what was already
  correct and left unchanged, and known limitations.

See `docs/Sprint 6 Notes.md` for full detail, including a known limitation
where automatic provider selection can still try an available-but-invalid
OpenAI key before falling back to Azure Speech within a single run, and the
Azure Vision cross-origin limitation, both left for a future phase.

## Sprint 7 - Health-Aware Provider Selection - Completed

Sprint 7 corrects the automatic-selection limitation identified at the end
of Sprint 6, in service of the long-term-vision goal that "Transcribe this
audio" should automatically select the healthiest compatible provider.

- The OpenAI, Gemini, Azure Speech, and Azure Vision adapters each expose a
  `health()` accessor (`connected`, `failed`, or `unknown`) based on the
  most recent real connection test or real usage attempt.
- A failed connection test is now persisted, not only a successful one, and
  a real (non-test) request that is rejected for authentication also
  updates the recorded health.
- Automatic selection scoring in the AI Provider Layer now scores a
  provider with demonstrated `failed` health below an alternative, so a
  broken credential no longer keeps winning automatic selection over a
  working one. A provider that has never been tested is not penalized.
- When a confirmed request to a specific provider fails, the resulting
  status message now names the next-best available alternative provider
  for that task, so the person is told what happened and what they can try
  next. The application does not silently substitute a different external
  provider after consent was given to a specific one, since Azure Speech
  and OpenAI each carry their own required disclosure.

New and modified files:

- `js/ai-provider-layer.js` adds health-aware scoring, an alternative-provider
  lookup, and error tagging with the attempted provider and capability.
- `js/openai-provider.js`, `js/gemini-provider.js`, and `js/shared-services.js`
  add `health()` accessors and persist failed test/usage results.
- `js/app.js` names a concrete next step in transcript, caption,
  audio-description, and image-description failure messages.
- `docs/Sprint 7 Notes.md` documents the change, what was intentionally not
  done and why, and current status against the long-term-vision priorities.

See `docs/Sprint 7 Notes.md` for full detail, including why automatic
cross-provider retry-after-failure within a single request was considered
and rejected.

## Sprint 8 - Confirmed Production Bug Fixes - Completed

A real test session (a 2 minute 36 second video, "Make this video
accessible") surfaced several confirmed defects. This sprint fixes the
bounded, verifiable ones:

- A Perplexity key was being imported and used as an OpenAI key because the
  importer matched any generically-named `key` property in `openai.json`
  with no format check. The importer now classifies a candidate key by its
  own format and refuses to assign a key positively identified as a
  different provider's, reporting exactly which file had the mismatch
  instead of silently skipping it.
- Provider error text could still leak a masked credential fragment in a
  few remaining code paths (this is what exposed part of the Perplexity
  key). Every provider adapter now throws only a sanitized, categorized
  message built from the HTTP status, never from response body text.
- A provider with confirmed-failed health could still win automatic
  selection. It is now excluded from automatic selection entirely until it
  is re-tested successfully or its credential is replaced.
- No workflow could previously be blocked from starting without an active
  project; this is now enforced at both central workflow-start points.
- Cancelling an individual review checkpoint (transcript, caption, audio
  description, package) previously discarded the entire remaining
  accessibility plan, identically to the dedicated "Cancel this workflow"
  button. It now pauses only that step; the plan resumes correctly when the
  goal is chosen again.
- The progress region stayed visible with stale content after a job
  finished, failed, or was cancelled. It is now hidden at that point.
- Entering transcript review now automatically requests an AI-assisted
  draft (with the existing confirmation) when a compatible provider is
  available, so automatic provider selection is actually reached from
  "Make this video accessible" and "Transcribe this audio" rather than
  requiring an extra manual click first.

See `docs/Sprint 8 Notes.md` for full detail, including a deliberate scope
note: the uploaded Phase 33 direction (a full redesign of the opening
experience around a single "Add content" section and an editable
natural-language request combo box) was not attempted this sprint. It is a
different scale of work than a corrective bug-fix sprint and deserves its
own dedicated, scoped phase rather than being rushed alongside these fixes.

## Phase 33 - Assistant-First Experience (first increment) - Completed

Sprint 8 added a requirement that an active project must exist before any
workflow could start. The project owner corrected this: projects are an
internal implementation detail and must never be a precondition the user
has to satisfy. **That requirement has been reversed.** A project (called
"Your work" in the interface) is now created automatically and invisibly
the first time content is successfully added — the user is never asked to
create, name, or select one first. `js/project-workspace.js`'s existing
`create()` function already required nothing but a name, so this needed no
new architecture, only different application logic: `ensureWorkItem()`
replaces the old blocking `ensureActiveProject()` gate, auto-creating a
project named from the source instead of stopping and asking.

This phase also implemented the core first-interaction model described in
the Phase 33 direction document:

- **Add content.** The separate "Start with a file" panel and its own URL
  sub-form are now one "Add content" section. Only a file or a URL is
  needed, never both — the URL field's incorrect `required` attribute was
  removed, and submitting the form with neither now shows "Choose a file or
  enter a web address." instead of relying on (or bypassing) browser
  validation for what was never actually a required field.
- **The editable request combo box.** "What would you like me to do?" is
  now backed by a native HTML `<input list>` / `<datalist>` pair rather
  than a plain text field. This is deliberately a native combo box, not a
  custom ARIA widget: browsers and screen readers (including JAWS and NVDA)
  support the native pattern reliably, where custom ARIA combobox
  implementations are a common source of screen-reader bugs. The assistant
  still pre-fills the most likely request after inspecting the content, the
  suggestion list offers alternatives, and any plain-language text can be
  typed instead — nothing is restricted to the list. The accessible
  description states exactly that: "A suggested request is already
  entered. You can use it, choose another suggestion from the list, or
  type your own request in plain language."
- **Suggestions are honest, not aspirational.** The suggestion list for
  each content type only includes requests that `matchDirectGoal()`
  actually recognizes today (for example, video offers "Make this video
  accessible," "Transcribe this video," "Create captions," "Create audio
  description," and "Extract the audio" — not "Make the video smaller,"
  which nothing in the application currently handles from typed text). A
  suggestion that silently fails to match would be worse than no
  suggestion.
- **Reading order.** The primary path — Your work, Add content, the
  request combo box, goal cards, the workflow chain, progress, every review
  checkpoint, and results — now appears before technical and advanced
  sections in the page's actual DOM order (not just visually): local
  quality-analysis panels, the Accessibility Advisor, the publication
  pipeline, assistance/provider settings, and jobs/batches/project history
  all now come after the primary path, matching how a screen-reader user
  reading top to bottom, or a JAWS/NVDA user tabbing through headings,
  encounters the page.

## What was intentionally not done this increment

The Phase 33 direction document describes considerably more than this
increment implements. Not yet done, in the order given in the direction
document:

- **Restoration/reconnection.** Selecting previous work does not yet fully
  restore pending review state, next-recommended-action, or prompt to
  reconnect a source file. The underlying data (history, artifacts,
  sources) is already recorded per project; presenting it as a guided
  "resume" flow with reconnection is a distinct, non-trivial feature.
- **Long-form/chunked processing.** The 50 MB connected-service limit,
  local-only large-file handling, audio chunking, and resumable chunk
  processing are unchanged. This is a substantial processing-pipeline
  change, not a UI change.
- **Time reporting (elapsed/estimated-remaining, historical learning).**
  Progress is still percentage-only. This needs its own scoped
  implementation, including where per-provider historical timing data would
  be stored.
- **Walk-away behavior** (wake lock, completion/review notifications,
  grouped review) is not implemented.
- **Publication title and other still-required fields.** `publication-title`
  and a few other fields remain `required` in their own forms; these were
  not touched this increment because unlike the URL field, they are not
  mutually-exclusive alternatives to another field, and generating a good
  automatic default deserves its own pass rather than simply removing
  `required`.

## Testing performed

- `node --check` on every JavaScript file in the repository (all pass).
- The HTML section reorder was performed programmatically (extracting and
  splicing whole `<section>...</section>` blocks) rather than by hand, and
  verified by: confirming the count of `<section>`/`</section>` tags is
  unchanged, confirming an order-independent (sorted-line) diff between the
  original and reordered file shows no content difference beyond blank
  lines, and confirming every element ID referenced from `js/app.js` via
  `getElementById` still exists in the reordered file (four IDs referenced
  in `app.js` were already missing from `index.html` before this change —
  a pre-existing issue, not introduced here, and not investigated further
  in this pass).
- Live testing was **not** performed — this environment has no network
  access and no real provider credentials or Shared Services files.

## Phase 33 - Assistant-First Experience (second increment) - Completed

Real JAWS testing of the first increment surfaced concrete problems: the
Add content experience was still effectively two separate controls under
one heading (a visible drop zone, a separately-labeled "Choose a file"
button, and a distinct URL form with an "or" divider between them); the
Accessibility Advisor, Publication pipeline, and Assistance settings
sections announced their full content (including, for the Advisor, a
report already showing "Critical: No sources in the project" before any
content had even been added) immediately, with no way to collapse them;
Publication title was still `required`; and the project workspace
("Project workspace" section) was the very first heading a screen reader
user encountered, before Add content — the opposite of the agreed
direction. This increment fixes all of those, based directly on that
testing session.

- **Add content is now genuinely one control cluster.** The separately
  labeled "Choose a file" button (which duplicated what the drop zone
  already did) was removed; the drop zone alone now triggers the file
  picker, and the file `<input>` is hidden (`hidden` + `aria-hidden` +
  `tabindex="-1"`) and only ever opened programmatically — this is a
  standard, reliable pattern (`.click()` on a hidden file input still opens
  the native picker in every major browser). The "or" divider between file
  and URL entry was removed. What remains is the minimum two native
  controls a browser actually requires (a file input cannot accept typed
  text, and a text input cannot open the OS file picker), presented as one
  unbroken "Add content" experience with one shared instruction, rather
  than two separate forms.
- **Genuine progressive disclosure, not just reordering.** The Accessibility
  Advisor, Publication pipeline, Assistance settings (including Shared
  Services import), and Jobs/batches/project history sections are now
  native `<details>` disclosures, collapsed by default. Their headings are
  still discoverable by heading-list navigation, but their controls and
  content no longer compete with the primary workflow until a person
  deliberately opens them. Native `<details>`/`<summary>` was used rather
  than a custom ARIA disclosure widget, for the same reliability reason the
  request combo box uses native `<datalist>`.
- **"Your work" (the project workspace) is no longer first, and is now
  collapsed too.** It was moved to the very last section in the page and
  wrapped in the same collapsed-by-default `<details>` pattern, renamed
  from "Project workspace" to "Your work" in its heading. A screen reader
  user browsing headings from the top now reaches Add content first, not
  project management.
- **Publication title is no longer `required`.** It was already
  auto-populated from the active project's name (unchanged, pre-existing
  behavior); a defensive fallback to the project name was added at package
  creation in case the field is ever empty regardless.
- **Elapsed and estimated-remaining time reporting.** A new live region
  reports elapsed time and an approximate remaining-time range (for
  example, "Elapsed: 2 minutes 14 seconds. Estimated remaining time:
  approximately 4 to 7 minutes. Overall progress: 34 percent."), updating
  every 20 seconds rather than on every progress-bar tick, so it doesn't
  add to announcement noise. The estimate is a simple, clearly-labeled
  approximation from elapsed time and current progress percentage — not
  the historical per-provider learning model described in the product
  direction, which needs its own scoped implementation and a place to
  store real timing data across sessions. That remains future work.

### What is still deferred

Long-form/chunked processing, wake-lock/walk-away notifications,
restoration/reconnection of in-progress review state, and historical
time-estimate learning are all still not implemented, for the same reason
given in the first increment: each is independently substantial and
deserves its own scoped pass rather than a partial version bolted onto a
UI-focused sprint.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- The two HTML section moves (collapsing four sections into `<details>`,
  and relocating and collapsing the project workspace section) were done
  with the same script-based extract-and-splice approach as the first
  increment's reorder, verified the same way: section and `<details>` tag
  counts balanced, an order-independent diff showing no content lost
  beyond blank lines, and every `getElementById` reference from `app.js`
  still resolving.
- Manual inspection confirming every `.focus()` call that targets an
  element now living inside a collapsed `<details>` is only reachable from
  a handler on a control inside that same section (so the section is
  already open by the time focus would move there).
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser to drive JAWS or
  NVDA against directly. All of the above responds to a real JAWS testing
  session's findings but has not been re-verified against JAWS itself.

## Design Philosophy

These principles govern every interaction design decision in this
application, not just the ones explicitly called out in a given phase.

- **Screen Reader First.** The first question is never "what does this
  look like." It is "what does the user hear." A design that works well
  read top to bottom, one thing at a time, is the target — not a visual
  layout that gets an accessibility pass afterward.
- **Assistant First, not a tool collection.** The application behaves like
  something that understands a goal and does the work, not like a set of
  separate accessibility utilities the user has to know how to operate.
- **Task First.** The application exists to help someone finish
  accessibility work. Internal concepts — projects, workflow IDs,
  providers, checkpoints, publication packages — exist because the
  software requires them, not because the user should need to understand
  them. They surface only when they provide real value to the person, not
  by default.
- **Progressive Disclosure.** Only what is useful at the user's current
  stage is presented. Controls for later stages, or for configuration most
  people never touch, are collapsed rather than removed — discoverable
  when wanted, silent otherwise.
- **Reduce Cognitive Load.** Every live-region announcement, every visible
  control, and every decision presented to the user has to earn its place.
  If it doesn't help the person understand what's happening or decide what
  to do next, it is noise, and noise has a real cost for someone listening
  to the whole page rather than scanning it visually.
- **The Assistant Suggests. The User Decides.** Wherever the application
  has an opinion about what someone probably wants (the pre-filled request,
  the suggested provider, the default publication title), that opinion is
  offered, never enforced. Plain-language input always overrides a
  suggestion.
- **The user is never forced to understand the implementation.** Success
  is not "the user learned how workflows, providers, and projects work."
  Success is "the user got their file made accessible and never had to
  think about any of that."
- **Providers Remain Behind the Scenes.** Normal users never choose among
  OpenAI, Azure Speech, Gemini, Azure Vision, Anthropic, Whisper, or
  Ollama during an active workflow. The assistant selects the healthy
  compatible provider; provider identity only matters at initial setup or
  during troubleshooting in More options.
- **Internal Architecture Must Not Dictate User Experience.** Projects,
  workflow IDs, providers, checkpoints, and publication packages exist
  because the software requires them internally. None of them get to
  decide what the person sees, hears, or has to do first — the user
  experience is designed from the task backward, never from the
  implementation outward.
- **Drop In, Edit, Walk Away.** The primary user model this application is
  designed around: add content, accept or adjust the suggested request,
  start, and leave. The application continues on its own and only asks
  for the user's attention when something genuinely needs a human
  decision.

### Intent-Driven Interaction

The request combo box is not a workflow picker. It represents the user's
intent, expressed however they choose to express it, through three
equally valid paths:

1. **Accept the assistant's proposal.** After content is inspected, the
   combo box is already pre-filled with the most likely request. Pressing
   Start requires no typing at all.
2. **Choose a different suggestion.** Opening the combo box's suggestion
   list shows other things the assistant can do with this specific piece
   of content — the suggestions double as a teaching tool, showing the
   range of what's possible without requiring the user to already know it.
3. **Type anything, in plain language.** The suggestion list is never a
   restriction. Whatever is typed is what gets interpreted.

The assistant suggests. The user decides. Users should never need to
understand workflows, providers, projects, processing pipelines, or any
other internal architecture to say what they want and get it done.

This interaction model — one editable combo box, content-aware
suggestions, free-form text always accepted — is intended to become the
standard interaction pattern across future Open Door Design assistants,
not just this one: Document Remediation, Website Accessibility, VPAT
generation, and CPACC study assistance are all expected to eventually
share it. One interaction model, many capabilities.

**Current honesty note:** request interpretation today is pattern
matching against a fixed set of recognized phrasings (`matchDirectGoal()`
in `js/app.js`), not general language understanding. Requests that map to
a real, implemented capability (transcribe, describe, caption, audio
description, extract audio, compress, or the full "make this accessible"
chain) work regardless of exact wording. Open-ended requests with no
corresponding capability yet — translation, meeting-note generation, VPAT
drafting, and similar — are not interpreted; the person is told plainly
what is understood today rather than the system silently failing or
pretending to have done something it didn't. Genuine open-ended language
understanding (interpreting arbitrary novel requests and either mapping
them to existing capabilities or explaining what would be needed to
support them) is future work.

## Phase 33 - Assistant-First Experience (third increment) - Completed

This increment is a refinement pass, not new functionality, aimed at
eliminating friction and unnecessary speech in the first-time experience.

- **The "Current source" section is gone.** It rendered an eleven-row
  technical fact grid (file name, type, size, duration, dimensions,
  contains-audio, contains-video, contains-images, readable-text-likely,
  captions-found) immediately after every file or URL was added — before
  the person had even been asked what they wanted to do. It provided a
  heading and a full data table for information most people don't need at
  that moment. It's been removed entirely, per "if it provides no
  meaningful information, remove it; only introduce a heading if it
  genuinely improves navigation."
- **One concise spoken summary replaces it.** The existing status region
  (which needed no heading of its own — it's a live region, not a
  navigation landmark) now reports a single sentence identifying what was
  found (for example, "I found a video with duration 2 minutes 36
  seconds.") plus the suggested request, instead of three separate,
  overlapping announcements (a file-selected message, a checking message,
  and a "your suggested goal is ready" message that duplicated what the
  suggestion field already showed).
- **Removed a duplicate announcement.** The request combo box's status
  region no longer pre-announces "a suggested goal is ready" on every
  successful content add — that fact was already conveyed by the concise
  summary and by the field itself being visibly pre-filled. The status
  region is reserved for things that need saying: errors, confirmations,
  and the result of starting a request.
- **One internal-architecture term removed from user-visible text.** A
  workflow step in the publication package process was labeled "Collect
  Shared Knowledge" — "Shared Knowledge" is this application's internal
  name for its cross-workflow context model, not something a user should
  ever need to know exists. It now reads "Collect what has been learned
  about this source."

### What was reviewed and left unchanged

Per "does every announcement help the user, does every visible control
help complete the current task" — the provider/service name shown in the
external-processing confirmation dialog ("Continue with Azure Speech
from Shared Services?") was deliberately kept. That is not implementation
jargon; knowing which outside company is about to receive your audio or
image is the actual content of an informed-consent decision, not an
internal detail to hide.

### What is still deferred

Contextual/dynamic combo-box suggestion wording (the suggestion list
already varies by content type; making the surrounding help text itself
reference the detected type by name was judged low-value relative to its
risk of becoming another redundant announcement) and full walk-away
architecture (notifications, wake lock) remain future work, for the same
reasons given in the previous two increments.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed every `getElementById` reference from `app.js` still resolves
  in `index.html` after removing the "Current source" section (the same
  four pre-existing missing IDs from earlier increments remain, and no new
  ones were introduced).
- Confirmed the top-level section count decreased by exactly one (30 to
  29), matching the one section that was removed, with `<details>` tag
  counts unchanged.
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser to drive JAWS or
  NVDA directly.

## Phase 35 - Intent-Driven Interaction - Completed

This phase reframes the request combo box as the center of the
application and closes real gaps in how forgiving it is. See the
"Intent-Driven Interaction" design section above for the philosophy.

- **Heading and label changed** from "What would you like me to do?" to
  "What can I help you accomplish today?" throughout `index.html`.
- **A real, previously-unreachable capability is now reachable by typed
  request.** `compress-video` already existed as a working, no-additional-
  cost local capability (offered as a goal card, using the Browser
  Provider) but `matchDirectGoal()` had no phrase mapped to it — typing
  "Compress this video" or similar simply fell through to "not
  recognized." It's now matched by `/compress|smaller|reduce.*size|shrink/`
  and added to the video suggestion list.
- **Filenames and local paths pasted into the web-address field are now
  interpreted, not just rejected.** `looksLikeLocalFileReference()`
  recognizes a bare filename with an extension (`Movie.mp4`), a Windows
  drive path (`C:\Users\...`), and a UNC path (`\\server\share\...`), and
  responds with a specific explanation — that browsers don't allow web
  pages to open local files directly, and to use "Choose a file" instead —
  rather than a generic invalid-URL error from a failed `new URL()` call.
- **The "not recognized" message now names what is actually understood**
  (including the newly-added compress-video phrasing) instead of a
  shorter, staler list.
- **Documented plainly, not glossed over:** request interpretation is
  still pattern matching against known phrasings, not general language
  understanding. The examples in the phase direction document that don't
  correspond to an implemented capability (translation, VPAT drafting,
  meeting notes, "find every slide transition") are not functional yet —
  see the honesty note in the Intent-Driven Interaction section.

### Testing performed

- `node --check` on every JavaScript file in the repository (all pass).
- Manually traced `matchDirectGoal()`'s new compress-video branch against
  the intent list to confirm `compress-video` is registered for video
  sources and does not require external provider configuration to run.
- Manually verified `looksLikeLocalFileReference()` against the specific
  examples in the phase direction document (`Movie.mp4`, a Windows drive
  path) and against valid URLs, to confirm it doesn't misclassify a real
  web address.
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available.

## Phase 35 Correction - One Opening Experience, Not Three - Completed

The previous increment implemented the intent combo box but left it
running alongside the pre-existing per-capability "goal cards" list (a
separate section with one button per available action, plus its own
"Make this accessible" chain button) — the code shipped with two
different UI surfaces for the same decision, one of them now redundant.
That was a real defect, not a matter of DOM position: the fix is removal,
not relabeling.

- **The goal-cards section (`goals-section`/`renderGoals()`) has been
  deleted**, not hidden, not deprioritized. There is now exactly one place
  to decide what to do: the intent combo box.
- **No capability was lost in the removal.** The goal cards exposed
  several capabilities the combo box's request matcher didn't yet
  recognize by typed phrase: audio compression and volume normalization,
  image OCR/compression/resizing, document OCR and text extraction,
  archive inspection, and AI-preparation packaging. `matchDirectGoal()`
  now recognizes all of them (disambiguating ambiguous words like
  "compress" or "OCR" by the current source's media type), and
  `suggestionsFor()` offers the relevant ones per content type. The "Make
  this accessible" full-workflow chain, previously only reachable via the
  goal-cards section's dedicated button, is unchanged in that it was
  always also reachable through the combo box's own "make ... accessible"
  matching — that path already existed and needed no change.
- **A pre-existing bug surfaced and was fixed in the process:** the
  default suggested request for documents and archives was "Review
  accessibility," which matched no recognized phrase at all and would
  always have failed. Documents now default to "Extract the text" and
  archives to "List what is inside," both of which are real, working
  requests.
- Every `goalsSection.focus()` call (used to return focus to the decision
  point after cancelling a review step) now focuses the intent combo box
  section instead, since that is the sole decision point remaining.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed no reference to the removed section's IDs (`goals-section`,
  `goals-heading`, `goals-intro`) remains anywhere in `index.html`,
  `js/app.js`, or `css/styles.css`.
- Manually cross-checked every `workflowId` the removed goal-cards list
  could reach (via `inferCapabilities()` in `js/media-inspector.js`)
  against the expanded `matchDirectGoal()` to confirm each has a
  corresponding recognized phrase.
- Confirmed every `getElementById` reference from `app.js` still resolves
  in `index.html` after the removal (the same four pre-existing missing
  IDs from earlier increments remain; no new ones were introduced).
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available.

## Phase 35 Correction 2 - One Secondary Heading, Not Five - Completed

Real testing of the previous correction showed the actual problem
hadn't been fully fixed: collapsing the Accessibility Advisor,
Publication pipeline, Assistance settings, Jobs/batches/history, and Your
work sections individually still left five separate headings — each
announced as "collapsed button" — sitting in the reading order on a
completely fresh page load, before any content had been added and before
the person had done anything at all. Collapsing each one was not the same
as getting them out of the way.

- **All five sections are now nested inside one single collapsed
  disclosure, "More options."** A first-time user on a fresh page load now
  encounters exactly one additional heading after the primary Add
  content/request flow, not five. Opening "More options" reveals the same
  five sections as before, each still individually collapsible — nothing
  about their functionality changed, only how many headings stand between
  a new user and getting started.
- Each of the five sections' own heading was demoted from `<h2>` to `<h3>`,
  since they are now genuinely subsections of "More options" rather than
  top-level sections in their own right — this keeps the heading hierarchy
  accurate for headings-list navigation, not just visually nested.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- The consolidation was done by script (extracting the exact contiguous
  line range covering all five sections and wrapping it, rather than
  manual retyping), verified by an order-independent diff confirming no
  content was lost — only the wrapper and demoted heading levels were
  added — and by confirming `<section>`/`<details>` tag counts remained
  balanced.
- Confirmed every `getElementById` reference from `app.js` still resolves
  after the change.
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available.

## Phase 35 Correction 3 - One Field for Content - Completed

The Add content experience was still two visually-stacked controls (a
drop zone that doubled as a fake button, and a separate URL text field
below it), each with its own label and help text. The person testing this
asked for something more specific: one edit field, into which a file can
be dropped or a web address typed or pasted, regardless of type — video,
audio, image, PDF, text, Word document — with the assistant determining
what it is.

**What a browser will and will not allow.** JavaScript cannot read a
local file's contents because its name or path was typed or pasted into a
text field — that is a browser security boundary, not a design choice,
and no amount of UI work changes it. The two ways a web page can actually
receive a real file are the native file-picker dialog and a genuine
drag-and-drop of the file object. Given that constraint, the closest
correct implementation of "one field, anything works" is: one text field
that accepts a typed or pasted web address *and* is itself a live drop
target for a dragged file, plus one small button for people who'd rather
click than drag.

- **`content-input` replaces both `url-input` and the old fake-button drop
  zone.** It is a real, always-focusable text field. Typing or pasting a
  web address and pressing Enter (or clicking "Add") inspects it, exactly
  as before.
- **The surrounding `drop-zone` container is now purely a drop target**,
  not also a keyboard-activatable fake button — the old
  `role="button" tabindex="0"` plus a manual Enter/Space keydown handler
  was a non-standard reimplementation of what a real `<button>` already
  does. Dropping a file anywhere on it inspects the file immediately, the
  same as before.
- **"Choose a file" is now a real `<button>`**, not a `role="button"` div,
  triggering the same hidden native file input as before. This is more
  reliable with JAWS/NVDA than the div-with-ARIA-role pattern it replaced,
  not just simpler.
- **Dropping a link (not a file) onto the control also works.** If
  something is dragged that isn't a file — a link dragged from a browser
  tab, for example — the drop handler now reads `text/uri-list` or
  `text/plain` from the drag data and treats it as a pasted address.
- One shared label ("File or web address"), one shared help paragraph, one
  form. There is no longer a second, separately-labeled sub-form.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed no reference to the removed `url-input`, `url-help`,
  `url-form`, or `drop-help` IDs remains anywhere in `index.html`,
  `js/app.js`, or `css/styles.css`.
- Manually traced both the file path (drop and native picker) and the
  URL path (typed/pasted, plus a dragged link) through to `handleFile()`
  and `handleUrl()` respectively, to confirm both still reach the same
  inspection logic as before the change.
- Confirmed every `getElementById` reference from `app.js` still resolves
  in `index.html` after the rewrite (the same four pre-existing missing
  IDs from earlier increments remain; no new ones were introduced).
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available to
  actually drag a file onto the control or drive it with JAWS/NVDA.

## Phase 35 Tightening - Unified Opening Interaction and Transcript Fallback - Completed

This pass responds to a comprehensive review of the running application
against a full set of acceptance tests. It tightens the opening experience
into the single interaction the tests describe, and implements the two
correctness requirements — transcript validation and automatic provider
fallback — needed to trust the result of "Make this video accessible."

- **The intent combo box and universal content input are now one always-
  visible section**, not a two-stage reveal where the request field only
  appeared after content existed. On page load the person now hears, in
  order: the heading, "What can I help you accomplish today?", the
  editable combo box, the content input area, "Choose a file," and
  "Start" — matching the specified reading order exactly. The request
  field is not required to have a value up front; submitting it empty is
  handled by existing guard logic, not native browser validation.
- **"Start" now does double duty.** If content was typed or pasted into
  the content field but never explicitly submitted, pressing Start checks
  it first before evaluating the request — so a person who fills in both
  fields and presses one button gets the expected result, rather than
  being told to "add content" when they just did.
- **Filename and Windows-path detection now uses the exact specified
  wording**, distinguishing a bare filename ("That looks like the name of
  a local file...") from a Windows-style path ("That looks like a local
  Windows path. Browsers cannot open it directly...") instead of one
  generic message for both.
- **The content-acknowledgement message now follows the specified
  concise pattern** — "{name} selected. {Type} detected. Duration:
  {duration}. Suggested request: {suggestion}." for a local file, "{Type}
  address detected. ... Suggested request: {suggestion}." for a URL —
  built by a single shared function instead of the looser prose summary
  used before.
- **Transcript text is now validated before it can reach the transcript
  editor.** Empty text, whitespace-only text, text that looks like raw
  JSON, and text that looks like an error or status string are all
  rejected as "not a usable transcript," never inserted into the editable
  field.
- **Automatic provider fallback with one confirmation, implemented for
  transcription specifically** (the capability named in the acceptance
  test). If a request fails or returns an unusable result, the assistant
  now automatically identifies the next healthy compatible provider via
  the existing `getAlternative()` lookup, asks one concise
  provider-specific question ("X did not produce a transcript. Y can try
  next. The audio will be sent to an outside service and charges may
  apply. Continue?"), and retries automatically on confirmation — without
  sending the person to Advanced assistance settings or discarding the
  audio that was already extracted. This required no new architecture:
  `run()` already accepted a specific `providerId` override, and
  `getAlternative()` already existed from an earlier sprint.
- **Design principles explicitly named and documented in the README:**
  Providers Remain Behind the Scenes, Internal Architecture Must Not
  Dictate User Experience, and Drop In / Edit / Walk Away, added to the
  existing Design Philosophy section.
- **The next-development-priorities roadmap is now explicit and ordered**
  (Audio Accessibility, then Document Accessibility, each with its full
  goal list) rather than only present as narrative future-vision text.

### What was reviewed and intentionally not implemented this pass

- **The full six-state provider health model** (Healthy / Untested /
  Authentication failed / Temporarily unavailable / Unsupported for this
  task / Disabled) as its own named taxonomy was not built. The existing
  three-state model (connected / failed / unknown) already drives
  automatic-selection exclusion correctly for the tested scenario;
  building and threading a six-state enum through every provider adapter
  is real work that was judged lower priority than the correctness fixes
  above, given this pass's scope.
- **Automatic fallback was implemented for transcription only**, not
  generalized to every capability (captions, audio description, visual
  analysis). The pattern (`getAlternative()` plus a specific-provider
  retry) generalizes directly; doing so for every capability was left for
  a future pass rather than risking a rushed, less-tested version of each.
- **Large/long-form video processing (chunked transcription, provider
  duration limits, frame sampling by scene) and walk-away infrastructure
  (Wake Lock, browser notifications, resume-after-refresh) remain
  unimplemented**, as stated explicitly in the assignment's own scope
  boundary ("do not begin the audio or document phases"; these are
  adjacent, larger pieces of the same "real long-form video" problem).

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed the merged opening section's `<section>`/`<details>` tag
  counts remain balanced and every `getElementById` reference from
  `app.js` still resolves (the same four pre-existing missing IDs from
  earlier increments remain; no new ones were introduced).
- Manually traced the "Start does double duty" path, the filename/path
  detection branches, and the transcript-fallback retry path through the
  code to confirm each reaches the intended function with the intended
  arguments.
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available to
  actually exercise a live Azure Speech failure, a JAWS/NVDA session, or
  a real file drag-and-drop.

## Phase 35 Tightening 2 - Paste-a-File Bug, Reading Order - Completed

A real JAWS session pasting a file from Windows File Explorer directly
into the content field surfaced the actual reason "the video did not
appear as an active file": copying a file in a file manager (Ctrl+C) and
pasting it (Ctrl+V) into a web page does not produce filename text to
paste — it produces a real file object, delivered through
`clipboardData.files`, not `clipboardData` text data. The content field's
`paste` handling only ever existed implicitly as plain text entry; a
pasted file had nothing to land in and silently did nothing, which is
exactly what the transcript showed: "Type in text. Pasted from
clipboard," then the field remained blank.

- **`content-input` now has its own `paste` handler that checks
  `event.clipboardData.files` first.** If a real file was pasted (copied
  in the OS file manager, pasted with Ctrl+V), it goes straight to
  `handleFile()`, exactly like a dropped file or one chosen from the
  native picker. Only when no file is present does paste fall through to
  normal text entry (a typed or pasted web address). This is a third,
  previously-missing content-acquisition path — file picker, drag-and-
  drop, and now OS-level copy/paste of a file — alongside the
  already-working typed/pasted URL path.
- **Reading order swapped: content input now comes before the request
  field.** Real use showed the natural order is add content first, then
  say what you want — not the reverse implied by the acceptance test's
  literal wording. The placeholder and help text for both fields were
  updated to match ("Add content above" instead of "Add content below").

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed `getElementById` reference integrity is unchanged (the same
  four pre-existing missing IDs remain; no new ones were introduced).
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available to
  actually paste a copied file, which is exactly the scenario this fix
  addresses. This fix is a direct, targeted response to a real JAWS
  session's exact reproduction steps, but has not itself been re-run.

## Workflow Continuation Bug - Root Cause Fixed - Completed

Real testing produced this sequence: Azure Speech attempted transcription
and returned nothing; the assistant correctly offered Gemini as the next
provider; Gemini produced a transcript; the transcript was reviewed and
saved; the workflow then reported "Create transcript could not be
completed" and paused the accessibility plan anyway — despite the
transcript having been genuinely created.

**Root cause, found by inspecting the workflow completion path rather than
adding a workaround around the symptom:** `createTranscript()` in
`js/browser-provider.js` — the function that packages an approved
transcript into its saved output file — referenced a variable named
`description`. That variable was never declared anywhere in that
function; the actual reviewed text was held in a different, correctly-
named variable, `transcriptText`, which was checked for existence but
never actually used. Every single approved transcript, from every
provider, threw a `ReferenceError` at that line while building the output
artifact — after the real work (drafting, review, approval) had already
succeeded, and before the job could reach its normal completion path.
`workflow-runner.js`'s existing error handling caught that exception
exactly as it's supposed to catch a genuine failure and reported
"Create transcript could not be completed," which was truthful about the
exception it caught but wrong about what actually happened.

**Why this fix, by itself, satisfies the full list of required
corrections:** the job-completion path this crash was preventing already
does everything asked for — `completeProgress()` in `js/app.js` already
calls `SharedKnowledge.recordJob()` (saving the artifact into Shared
Knowledge and rebuilding the accessibility plan and assessment from it),
and already calls `WorkflowChain.markCompleted()` followed immediately by
`continueWorkflowChain()` when the job belongs to an active "Make This
Accessible" chain, which advances the plan to the next available step
automatically without pausing. None of that machinery was broken; it
simply never ran, because the job crashed one step before reaching it.
Provider health was already being updated correctly by the Gemini/Azure
Speech adapters themselves (from an earlier sprint), independent of this
bug. The only genuinely missing piece — nothing in the job recorded which
provider had actually produced the successful draft — is now filled in
directly: `js/app.js` remembers the provider name from a successful
`AIProviderLayer.run()` result, includes it when the transcript is saved,
and `createTranscript()` writes a `Provider:` line into the saved
artifact alongside the transcript text.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Manually confirmed no other occurrence of this exact bug pattern exists:
  searched every reference to a bare `description` variable in
  `js/browser-provider.js` and confirmed the one other function that uses
  it (`createImageDescription`) correctly declares its own local
  `description` variable, unlike `createTranscript`, which did not.
- Manually traced the full completion path from a successful
  `createTranscript()` return through `OutputManager.register()`,
  `finishJob()`, `onComplete`, and `completeProgress()` to confirm
  `SharedKnowledge.recordJob()` and `WorkflowChain.markCompleted()` +
  `continueWorkflowChain()` are both reached on success, with nothing
  else in that path throwing.
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser to actually run
  the reported Azure Speech → Gemini → review → save sequence end to end.
  This is a precise fix for a specifically diagnosed defect, not a
  guess, but it has not itself been re-verified live.

## Workflow Intelligence Pass - Completed

- **Fixed a genuine SharedServices state contradiction.** The application
  could report "No Apps folder is remembered" while simultaneously
  reporting Azure Speech and Azure Vision as "Available," because
  availability was based solely on whether credentials happened to be
  cached from a past import, entirely independent of whether the Apps
  folder connection itself was still remembered. `js/shared-services.js`
  now maintains a synchronously-readable cached flag for whether the
  folder is remembered (the underlying check is inherently async —
  IndexedDB — but `isAvailable()` must answer synchronously, since it's
  called throughout automatic provider selection), populated at startup
  and kept in sync on choose/reconnect/clear. Azure Speech and Azure
  Vision now report available only when both a credential exists and the
  folder connection is remembered. Clearing SharedServices already only
  touched its own credential store and directory handle — verified by
  inspection that OpenAI, Gemini, and Anthropic each manage their own
  separate credential store keys, so this was already correctly isolated.
- **Provider fallback now continues through a full ranked list, not one
  hop.** Previously, if the first-choice provider failed, the assistant
  offered exactly one named alternative and stopped there regardless of
  whether further healthy providers existed. `getAlternative()` now
  accepts a list of already-tried provider IDs, and the transcript
  fallback chain threads a growing list through each retry, continuing
  until a usable result is produced or every healthy compatible provider
  has been tried. This also directly satisfies "if OpenAI is healthy it
  must participate": it was always registered and scored, it simply never
  got a turn under the old one-hop logic. A provider that previously
  failed authentication and later passes a real test was already correctly
  cleared of its stale failed status (verified by inspection — each
  provider's successful test overwrites its own recorded health) needing
  no change.
- **Caption cues are now validated and automatically repaired before
  review**, not dumped raw into the editable list. `CaptionReview.repair()`
  fixes what's mechanically fixable — cues overlapping the previous one,
  cues extending past the media's actual duration — and only drops a cue
  outright when it has no parseable timing at all to repair from. The
  person doing the review now sees corrected timing with a note about
  what was fixed, not dozens of invalid cues to fix by hand. This same
  pattern was not yet applied to audio-description cues, which share a
  similar structure; that is flagged as straightforward future work
  rather than done here, to keep this pass scoped to what was reported.

### What was already correct (verified, not changed)

- Workflow continuation on a saved, approved transcript — fixed in the
  prior pass (a `ReferenceError` in `createTranscript()`); confirmed still
  working by re-reading the completion path.
- Elapsed/estimated-remaining progress reporting — implemented in an
  earlier phase.
- Shared Knowledge reuse of completed-stage output — `completeProgress()`
  already calls `SharedKnowledge.recordJob()` on every successful job.
- Automatic continuation of "Make This Accessible" after a review
  checkpoint is approved — already wired through `continueWorkflowChain()`.

### What was not addressed this pass

**Provider presentation (Issue 2)** — reframing the provider list from
"selection" language to "status" language throughout the Assistance
settings section was not done. The section is already collapsed behind
"More options" and automatic selection is already the default behavior;
auditing every remaining piece of picker-style wording in that section
was judged lower priority than the four correctness issues above, given
this pass's scope, and was not touched to avoid a rushed, partial pass at
it.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Manually traced `chooseAppsDirectory()`, `reconnectSavedDirectory()`,
  `clear()`, and `initialize()` to confirm the cached remembered-folder
  flag is set or cleared on every path that changes it.
- Manually traced the multi-hop transcript fallback with a simulated
  three-provider scenario (by reading the code, not running it) to
  confirm `triedProviderIds` grows correctly and `getAlternative()`
  excludes everything already tried.
- Manually verified `CaptionReview.repair()` against constructed edge
  cases (an end time past the source duration, two overlapping cues, one
  cue with an unparseable timestamp) by tracing the logic by hand.
- Confirmed every `getElementById` reference from `app.js` still resolves
  (the same four pre-existing missing IDs remain; no new ones were
  introduced).
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser available.

## Reviewer-First Workflow - Completed

This pass changes the core relationship between the application and the
person using it. The user is the accessibility **reviewer**, not the
author. The application is designed for blind users; a blind reviewer
cannot look at a video and invent a visual description, and cannot
usefully review dozens of raw timestamp fields one at a time. Both of
those were real problems in the running application, not hypothetical
ones — one produced a genuine accessibility failure (see below).

- **The blank-narration-field bug is fixed.** Opening audio-description
  review previously always populated one empty, required narration text
  field with no explanation of what it was for. A blind reviewer who
  couldn't see the video had no way to know what belonged there, and
  entering anything just to satisfy the required field became the entire
  audio description. This is gone. Opening audio-description review now
  always attempts a real AI-generated draft first (with automatic
  fallback across every healthy compatible provider) and never shows a
  cue-editing field until either a real draft exists or every provider
  has genuinely failed.
- **Captions and audio description are now reviewed, not authored, by
  default.** Both review screens open with a concise summary — cue count,
  duration covered, validation status — not an expanded list of every
  timestamp and text field. Detailed per-cue editing exists behind an
  explicit "Edit individual caption cues" / "Edit individual
  audio-description cues" disclosure, closed by default.
- **A quality gate on audio-description drafts.** A multi-minute video
  that comes back with only one narration cue is treated as suspicious,
  not accepted — the assistant automatically tries another provider
  rather than presenting a single accidental-looking cue as a finished
  draft.
- **Multi-hop provider fallback, matching the transcript pattern, for
  both captions and audio description.** Each keeps trying healthy
  compatible providers, with one confirmation per new external provider,
  until a usable result exists or every provider has failed. Manual
  authoring is only ever revealed as an explicit last resort, with the
  specific stated language: "manual authoring is available as an advanced
  option... you may need help from someone who can review the visual
  content."
- **Every cue field has a complete, self-contained accessible name** —
  "Caption cue 3 start time," "Audio-description cue 2 narration" — not a
  generic "Start time" that depends on fieldset/legend grouping being
  announced.
- **Focus moves to meaning, not into a field.** Opening a review screen
  focuses the summary. A validation problem focuses a concise summary
  ("3 caption cues have a timing or text problem...") with automatic
  repair attempted first, not a per-cue announcement or focus dropped
  into the first invalid field. A successful save announces "Captions
  saved. Continuing the accessibility workflow," not silence or a jump to
  the top of the page.
- **Durations are spoken in words, not digits.** The single biggest
  concrete complaint behind this pass: duration was being rendered as
  colon-separated digits ("2:36") in the very first thing a person hears
  after adding content, which is not a naturally spoken or readable
  format for someone who can't glance at it. `MediaInspector`'s duration
  formatter now produces "2 minutes 36 seconds" everywhere it's used in
  live spoken summaries. Precise `00:00:00.000` timestamps still exist
  inside the caption/audio-description VTT and script data itself — that
  format is a real technical requirement of those file formats, not a
  display choice, and only appears now inside the collapsed, explicitly-
  opened advanced cue editors, never in a summary or announcement.

### What was not addressed this pass

The direction documents describe a considerably larger vision: a true
multi-stage visual-analysis pipeline (scene segmentation, dialogue-gap
detection, an accessibility-relevance reasoning stage, a second AI
provider critiquing the first one's draft before the human ever sees it),
coordinated multi-provider division of labor by capability, and a quality
scoring model based on genuine coverage rather than file existence. None
of that was built this pass. What exists today is a single-stage
AI-generates-then-validates loop with multi-provider fallback and one
crude quality gate (cue count vs. video length) — a real improvement on
what existed before, and a defensible step toward the described vision,
but not the vision itself. Building the full multi-stage pipeline with a
second-provider critique step is substantial, independent work and would
need its own scoped phase rather than being layered onto this pass.

Two other things flagged and intentionally left alone: the downloadable
publication-manifest and accessibility-package text files still use
`MM:SS`-style timestamps for chapter/section markers (a written document
convention, not a live announcement); and the video-player scrubber's
time display in the Viewer was not touched, since a native media
element's own time display is standard and expected there.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed the collapsed cue-editor `<details>` elements and their
  summary/detail wiring are structurally sound (tag counts balanced,
  every referenced ID resolves).
- Manually traced the audio-description open path for both branches (a
  compatible provider available vs. none available) to confirm neither
  one populates a blank required field — the one specifically reported.
- Manually traced the caption and audio-description save paths to confirm
  a validation failure attempts automatic repair before falling back to a
  concise summary, and that a successful save announces completion before
  handing off to workflow continuation.
- Live testing was **not** performed — this environment has no network
  access, no real provider credentials, and no browser to actually
  exercise these flows with JAWS or NVDA.

## Local Production Engine (Optional) - Completed

An optional local helper (`tools/local-production-helper/production_helper.py`,
Python standard library only, no dependencies) detects and uses the
person's own installed FFmpeg/FFprobe to render a real MP4 with the
original video, the approved described-audio mix, an alternate original-
audio track, and captions muxed in as a selectable track — instead of the
browser-only MediaRecorder re-recording approach, which still exists and
is used automatically whenever the helper isn't running or FFmpeg isn't
found. **This was genuinely built and tested in this environment**, not
only traced by hand: a real render was executed end to end (upload →
FFmpeg mux → FFprobe-verified output with the correct video, dual audio,
and subtitle streams) against synthetic test files, since this sandbox
happens to have FFmpeg installed.

- **Security model:** binds to `127.0.0.1` only; never uses a shell; every
  FFmpeg/FFprobe invocation is one of two fixed argument-list templates
  (probe, render) — the browser can select which one to run and supply
  asset IDs and simple booleans, never raw command-line arguments or a
  client-supplied path. All files are referenced by server-generated
  UUIDs written into a single temporary working directory.
- **`js/local-production.js`** is the browser-side client — a separate
  namespace (`window.LocalProduction`), never registered with
  `AIProviderLayer`, since FFmpeg is a local production engine, not an AI
  provider.
- **A "Local production" status is shown inside More options** (found in
  the Publication pipeline subsection): ready, not running, or FFmpeg not
  found, with technical executable paths/versions behind their own
  further disclosure, and a "Locate FFmpeg" action that explains why the
  helper can't accept an arbitrary browser-supplied path (the same reason
  it never accepts raw commands) and points to a real fix.
- **Honest limitation found during testing:** FFmpeg (this build) does not
  reliably apply the `-metadata:s:a:N title=...` track-title tags in the
  MP4 muxer, even though the tracks themselves, their order, and their
  language/codec are all correct. Track selection by a player still works
  correctly by order and language; only the human-readable title label is
  unreliable. Documented rather than silently dropped or claimed to work.
- **Not implemented:** true chunked/checkpointed rendering (a single
  render is one FFmpeg invocation — it either completes or it doesn't;
  genuine mid-render checkpointing would require chunked processing,
  which is a separate, larger piece of work), and automatic discovery
  beyond PATH and a short list of common Windows install locations (no
  registry search).

## Workflow Polish Pass - Completed

Direct, specific feedback after real use of the reviewer-first workflow:

1. **Focus no longer returns to "What can I help you accomplish today?"
   after completing, pausing, or cancelling a step in an active
   accessibility plan.** It moves to the new Current Task summary
   instead (see below). This was a real, confirmed bug —
   `continueWorkflowChain()`, `cancelWorkflowChain()`, and
   `pauseWorkflowChainStep()` all called `directGoalSection.focus()`
   unconditionally.
2. **A new "Current Task" summary** shows what's completed and the single
   next recommended action, with one button — not a requirement to
   navigate through Accessibility Assessment, Smart Recommendations, or
   reports to find what to do next. Those five sections (assessment,
   recommendations, plan, shared knowledge, advanced analysis) are now
   consolidated behind one collapsed "More details" disclosure, the same
   pattern used for "More options."
3. **Audio-description generation now includes a second-provider critique
   pass** when a second healthy compatible provider is available: the
   first provider drafts, the second is asked specifically to find
   missing visuals, redundancy, timing conflicts, and subjective wording
   and return an improved version, and the improved version is used only
   if it validates at least as well as the original. This is real,
   working "generate, critique, improve," not a placeholder — but it is
   one critique pass with the existing transcript/knowledge context, not
   the full multi-stage scene-segmentation/OCR/object-detection pipeline
   described in earlier direction documents, which this application does
   not implement.
4. **Rendering architecture already matches what was asked:** browser-
   based rendering remains the default and always-available path: the
   local FFmpeg engine (see above) is tried first only when genuinely
   available and falls back automatically and silently to the existing
   browser renderer otherwise. The user-visible experience (a downloadable
   accessible video) is identical either way.
5. **Shared Knowledge / "Future analysis required" consistency (issue 16
   from an earlier pass) was not re-verified this pass** — flagged
   honestly rather than claimed fixed without checking.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- The local production helper was actually run and exercised end to end
  in this environment (see above) — the one piece of this pass verified
  by execution rather than only by reading the code.
- Manually traced all three focus-fix call sites
  (`continueWorkflowChain`, `cancelWorkflowChain`,
  `pauseWorkflowChainStep`) to confirm each now focuses Current Task
  when it has content, rather than unconditionally focusing the request
  field.
- Manually traced the audio-description critique path to confirm the
  original validated draft is kept if the critique call throws, returns
  no cues, or returns a worse-validating result — a critique pass cannot
  make a previously-good draft fail.
- Confirmed section/details tag balance and full `getElementById`
  reference integrity after consolidating five sections into "More
  details" (the same four pre-existing missing IDs remain; none new).
- Live testing of the browser application itself was **not** performed —
  no browser available in this environment. Only the local production
  helper was actually executed; everything else was verified by reading
  and tracing the code.

## "Render Accessible Video Is Not Available" - Root Cause Fixed

Real testing showed "Make This Accessible" starting, running, and then
immediately pausing with "Render accessible video is not available with
the current source or browser capabilities" — before any rendering was
ever attempted.

**Root cause:** `render-accessible-video` was fully implemented in
`BrowserProvider.execute()` (`createPublicationExport()`, which calls
`PublicationRenderer.render()`) but was missing from that provider's
`workflows` list in `js/provider-manager.js` — the list
`getCapability()` uses to decide whether a workflow can run at all. Every
other workflow the Browser Provider implements was listed; this one
wasn't. The result: `capability.canRun` was `false` unconditionally,
regardless of whether the browser actually supported rendering, and the
workflow chain blocked the step before ever calling the rendering code.
This is the same class of bug as the `create-transcript` `description`
variable found in an earlier pass — real functionality that was
implemented but never actually reachable, for an unrelated, narrow
reason.

**Fix:** added `'render-accessible-video'` to the Browser Provider's
`workflows` list. Cross-checked every other workflow ID `js/intent-
engine.js` defines against every provider's `workflows` list to confirm
this was the only orphaned one.

**What this fix does and does not guarantee:** the chain will now
genuinely attempt to render instead of refusing to try. Whether the
render itself succeeds depends on real browser support
(`MediaRecorder`, `video.captureStream()`, `AudioContext`) or the local
FFmpeg helper being available — neither of which could be exercised in
this environment (no browser here). This fix removes a false block; it
does not, by itself, prove the render will complete successfully on a
real machine.

### Testing performed

- `node --check` on `js/provider-manager.js` and every other JavaScript
  file (all pass).
- Extracted every `workflowId` from `js/intent-engine.js` and every
  `workflows` array from `js/provider-manager.js` and confirmed all 17
  intent workflow IDs now have a matching provider entry — before the
  fix, `render-accessible-video` was the only one with none.
- Live testing was **not** performed — no browser available in this
  environment to confirm the render itself completes.

## Restored-Work Quality Gates - Completed

Real testing restored old browser data containing a one-cue audio-
description script and found the application treated it as a completed,
production-ready audio description — queuing final rendering with known-
insufficient AD, and recommending package creation while rendering was
still pending.

- **Root cause:** completion status for audio description was determined
  by presence alone (`model.accessibility.audioDescription.present`), with
  no quality check — in `js/recommendation-engine.js`'s `isPresent()`,
  used both for fresh work and anything restored from Shared Knowledge.
  A single accidental cue and a fully reviewed script looked identical to
  every part of the app that asked "is this done."
- **Fixed at the source and at the gate.** `js/shared-knowledge.js` no
  longer records a saved audio description as `'complete'`/high-confidence
  when it has fewer than two cues — it's recorded as `'needs review'` with
  an honest reason. `js/recommendation-engine.js`'s `isPresent()` applies
  the same two-cue floor when reading back *any* stored record, including
  one restored from old data saved before this fix existed, and audio
  description's completion no longer falls back to a historical "was
  marked completed once" shortcut the way other workflows still do —
  presence-with-quality is now the only source of truth for this one.
- **Rendering now enforces production readiness directly.**
  `createPublicationExport()` in `js/browser-provider.js` checks for a
  present transcript, present captions, and a present audio description
  with at least two cues before calling the renderer at all, throwing a
  specific "still needed: ..." error naming what's missing rather than
  attempting to render incomplete work. Because the workflow chain
  re-evaluates completion state on every continuation, a render that fails
  this check causes audio description to correctly reappear as the next
  step rather than the chain simply stopping.
- **Current Task's next-action selection no longer suggests package
  creation ahead of rendering.** `pickNextAction()` explicitly prefers
  `render-accessible-video` over `accessibility-package` when both are
  technically available, and prefers whatever step an active workflow
  chain is already on over any other suggestion.
- **Stale Working state is now fully cleared on failure and cancellation,
  not just on success.** `failProgress()` and `cancelProgress()` now also
  refresh Current Task and move focus there (or to the request field as a
  fallback) — previously only a successful completion did this, so a
  failure or cancellation could leave focus stranded after the Working
  section was hidden.

### What was not addressed this pass

- **Issue 4 (mapping deeper analysis into granular Shared Knowledge
  fields like `visual.sceneChanges`, `visual.dialogueGaps`,
  `audio.speakers.count`)** was not implemented. This application's
  current advanced-analysis result shape does not yet produce that level
  of structured field data to map from — building it is a data-model
  change, not a wiring fix, and was judged too large to do safely in this
  pass alongside the quality-gate fixes above.
- **Issue 6 (full artifact provenance and supersession — fingerprint,
  origin, review/quality state, dependencies, current/superseded/invalid
  status on every artifact)** was not implemented. The two-cue floor
  added this pass is a real, working quality gate, but it is a narrower,
  more targeted fix than a general provenance model that could invalidate
  any artifact type for any reason without deleting it. That remains
  future work.
- **Issue 7's exact end-to-end scenario** (real restored browser data,
  live regeneration, live rendering) was reasoned through by reading the
  code, not executed — this environment has no browser and no real
  Shared Knowledge data to restore.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Manually traced a constructed one-cue audio-description record through
  `isPresent()`, `workflowIsComplete()`, and `createPublicationExport()`
  to confirm it is now identified as incomplete at every one of those
  points, not just one.
- Manually traced a two-or-more-cue record through the same three points
  to confirm it is still correctly treated as complete — the fix narrows
  what counts as sufficient, it does not make everything insufficient.
- Confirmed every `getElementById` reference from `app.js` still resolves
  (the same four pre-existing missing IDs remain; no new ones were
  introduced).
- Live testing was **not** performed — no browser, no real Shared
  Knowledge data, and no way to reproduce the exact restored-work scenario
  in this environment.

## Narration Styles Replace Provider Voice Names - Completed

The narration voice selector previously exposed raw OpenAI TTS voice
identifiers — Alloy, Ash, Coral, Echo, Fable, Nova, Onyx, Sage, Shimmer —
directly to the user. Those are implementation detail, not something a
person choosing how their video should sound needs to know about.

- **`js/narration-style.js`** is a new, small catalog module mapping nine
  human-friendly styles (Automatic, Professional documentary, Educational,
  Friendly guide, Warm conversational, Corporate training, Expressive
  storytelling, Children's educational, Calm neutral) to a specific
  provider and voice. Provider/voice names never appear in the normal
  workflow — only inside the collapsed "Voice details" disclosure.
- **Automatic remains the default** and resolves to a specific style
  using a best-effort, filename-based content hint (for example,
  "training" or "onboarding" in the filename suggests Corporate training;
  "museum" or "tour" suggests Friendly guide). This is explicitly *not*
  real content understanding — the application does not analyze video
  content to choose a narration style — and the code and this README both
  say so rather than overstating it. It is a low-cost, always-overridable
  starting suggestion, not a claim of content awareness.
- **Preview** synthesizes and plays a short sample ("Welcome to the Media
  Workflow Assistant. This is a sample of the [Style] narration style.")
  using the same consent flow as narration generation elsewhere in the
  app — if it requires a connected service or may cost money, that's
  explained before anything is generated, via the existing
  `confirmAssistanceUse()` pattern. Preview does not move focus; status
  updates in place.
- **The preference is saved** (`localStorage`) and used as the default
  style for future audio-description reviews, per the requirement that
  future projects should default to a saved style.
- **Changing narration style never regenerates the audio-description
  script.** This didn't need new code — voice selection was already a
  separate form field from the narration cues themselves; selecting a
  style only changes what gets passed to narration synthesis at save
  time.
- **Honesty about provider order:** the direction document specifies a
  preferred order of Azure Speech, then OpenAI, then Gemini, then local
  voices. Only OpenAI's narration-audio capability actually exists in
  this codebase — Azure Speech, Gemini, and local text-to-speech are not
  implemented. Every style currently resolves to an OpenAI voice; the
  module's shape (`resolveVoice()` returning a provider/voice pair per
  style) is intentionally ready for other providers to be added later
  without changing how styles are presented, but no other engine was
  built or claimed to exist.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Confirmed no remaining reference to the removed `narration-voice`
  element anywhere in `index.html` or `js/app.js`.
- Manually traced `resolveVoice('automatic', sourceName)` against several
  constructed filenames to confirm the content-hint suggestions match the
  documented examples, and that an unrecognized filename correctly falls
  back to Automatic's default voice rather than guessing.
- Confirmed every `getElementById` reference from `app.js` still resolves
  (the same four pre-existing missing IDs remain; no new ones were
  introduced).
- Live testing was **not** performed — no network access, no real OpenAI
  credentials, and no browser available to actually play a preview clip
  in this environment.

## Render Job Permanently Stuck In Queue - Fixed

Real testing showed a render job announced as "queued," then "queued at
position 2," with elapsed time frozen at 0 seconds for almost two
minutes — no progress, no rendering, no validation, nothing. The analysis
that came with this report was correct: this was not an audio-description
problem, not FFmpeg, not a provider — it was the job queue itself.

**Two real, structural bugs in `js/execution-engine.js`, both fixed:**

1. **No guaranteed cleanup if `runner.run(job)` ever rejects.**
   `processNext()` had no `try`/`catch`/`finally` around
   `await runner.run(job)`. `WorkflowRunner.run()` is designed to always
   resolve, never reject — it catches every error internally — but it
   still calls two callbacks (`onComplete`, `onError`) as part of that
   same try block, and if *either callback itself* ever threw, that
   exception would escape `run()` uncaught. When that happens, the two
   lines that reset the engine's state (`this.activeJob = null;
   this.processing = false;`) — which sat *after* the `await` with no
   protection — would simply never execute. `this.processing` would stay
   `true` forever, and every job enqueued after that point would sit in
   the queue with literally nothing ever checking it again. This is
   exactly the reported symptom: a queue that exists with no worker
   consuming it. `processNext()` now wraps the run in `try/finally`, so
   the engine's state is *guaranteed* to reset no matter what happens
   inside a job — including something that shouldn't be possible today.
2. **A race in how the next job gets picked up.** `enqueue()` called
   `processNext()` synchronously. `enqueue()` is frequently called from
   *inside* another job's own completion handling (a workflow-chain step
   finishing calls `continueWorkflowChain()`, which calls `runIntent()`
   for the next step, which calls `enqueue()`) — and that entire chain
   runs synchronously, still on the call stack of the *previous* job's
   `processNext()`, before that call has resettled `this.processing`.
   Simulated both the old and new versions directly in Node to confirm:
   the old synchronous call actually self-corrected in a simple two-job
   case (verified — it is not, by itself, the cause of a multi-minute
   stall), but it is a genuine race condition that made the system more
   fragile than necessary. `enqueue()` now defers its `processNext()`
   call to a microtask (`Promise.resolve().then(...)`), so it always
   checks state that has already settled rather than state mid-unwind.
- **The misleading "Elapsed: 0 seconds" display is also fixed.**
  `job.startedAt` is only ever set once a job actually begins running,
  not while it's sitting in the queue — so a genuinely queued (not
  stuck, just waiting its turn) job was already reporting a frozen "0
  seconds," which looks identical to a hung timer. It now reports "Still
  waiting in the queue" instead of a fabricated zero.
- **Instrumentation added, as requested:** `[job-queue]` console logging
  at queue insertion, worker pickup, completion, failure, and
  cancellation, so this class of problem is directly observable next
  time rather than inferred from symptoms.

**What this fix does and does not prove:** the `try/finally` guarantee
in `processNext()` closes off an entire class of "queue jams forever"
failure the old code had no protection against, and the deferred
`enqueue()` removes a genuine (if usually self-correcting) race. What
this fix cannot do from this environment is confirm which of these was
the *actual* historical trigger, or rule out a genuine hang (as opposed
to an uncaught rejection) inside the render step itself — no browser is
available here to reproduce "queued at position 2" against real FFmpeg
or MediaRecorder rendering.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- **Actually simulated the queue logic in Node**, not just read by eye:
  built a minimal standalone reproduction of both the old and new
  `enqueue()`/`processNext()` interaction with a mock job runner whose
  completion synchronously enqueues the next job (mirroring workflow-
  chain continuation exactly), confirmed the new deferred version
  correctly drains a two-job chain, and confirmed the old synchronous
  version happens to self-correct in that same simple case — narrowing
  down which of the two fixes is the structural guarantee versus the
  robustness improvement, rather than asserting both fixed the bug
  without checking.
- Confirmed every `getElementById` reference from `app.js` still resolves
  (the same four pre-existing missing IDs remain; no new ones were
  introduced).
- Live testing against the real render pipeline was **not** performed —
  no browser available in this environment to reproduce the exact
  reported freeze end to end.

## Automatic Final Rendering, With an Honest Browser Limitation - Completed

Real testing showed a render step that automatically failed with a
generic "could not be completed" message, and a manual retry button that
appeared not to do anything. The root technical cause is a genuine
browser platform restriction, not a bug that can be coded around: modern
browsers only allow `video.play()`, `audio.play()`, and
`AudioContext.resume()` — all required by the browser-based renderer —
when they happen as a direct, immediate result of a real click. By the
time automatic chain continuation reaches the render step, several
asynchronous layers (the job queue, provider dispatch, artifact fetching)
have already happened, and that "this was a real click" permission is
gone. This is why it failed automatically, and why a delayed retry could
still fail too.

- **Rendering still starts automatically by default.** Nothing changed
  about that — render is still just the next chain step, run the same way
  every other step is.
- **A brief, cancellable pause was added before it starts**, with a
  "Render later" button. If nothing is clicked, rendering proceeds
  automatically after a few seconds — this is an opt-out, not a
  requirement to click through. If Render later is clicked, every
  completed artifact is preserved, no render job is created, and a single
  "Render now" button is offered afterward.
- **The specific browser-permission failure is now caught and handled
  honestly, not reported as a failed accessibility plan.**
  `PublicationRenderer.render()` tags this specific error
  (`error.needsUserActivation`), and `failProgress()` in `js/app.js`
  branches on it: instead of "the accessibility plan paused because X
  could not be completed," the person hears "Final browser rendering
  requires one activation," with focus landing directly on a dedicated
  "Start final rendering" button — not folded into the generic failure
  path, and not silently retried without saying why.
- **"Your accessible video is ready" is now announced specifically when
  rendering completes**, with results shown immediately, before the chain
  continues automatically to package creation — previously this specific
  announcement only existed for a job run outside an active chain, so a
  chain-driven render (the normal case) never actually said it.
- **Genuine, stated limitation:** even the dedicated "Start final
  rendering" button cannot *guarantee* the browser will honor the click,
  because meaningful async work (checking the job queue, re-validating
  production readiness, fetching artifact blobs) still happens between
  the click and the actual `play()`/`resume()` calls — full preservation
  of "this was a real click" all the way through several async layers
  was not attempted this pass, since restructuring the job queue itself
  to support a synchronous fast-path was judged too large a change to do
  safely alongside this fix. The local FFmpeg production helper avoids
  this limitation entirely (it never needs browser playback at all) and
  remains the recommended path when it's running.
- **Interview speaker context (documented, not built, as directed).**
  A future improvement: before transcription, let the person optionally
  list speaker names in speaking order (for example, "First speaker:
  Dean. Second speaker: David Marcano. Third speaker: Joe McCormick"),
  used to guide speaker labeling in the transcript. Not implemented this
  pass — explicitly deferred per the direction not to delay the rendering
  correction to build reusable voice recognition now.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Manually traced the render-later timer path (both "let it proceed" and
  "click Render later before it fires") to confirm neither path creates a
  render job prematurely and both leave completed artifacts untouched.
- Manually traced a constructed `NotAllowedError` through
  `PublicationRenderer.render()` → `ProviderManager.execute()` →
  `WorkflowRunner.run()` → `failProgress()` to confirm the
  `needsUserActivation` tag survives being caught and re-thrown at each
  layer (each layer passes the original error object through rather than
  wrapping it in a new one, which is what makes this work).
- Confirmed every `getElementById` reference from `app.js` still resolves
  (the same four pre-existing missing IDs remain; no new ones were
  introduced), and that `<section>` tag counts remain balanced after
  adding the new Render later / Start final rendering buttons.
- Live testing was **not** performed — no browser available in this
  environment to confirm real Chrome autoplay-policy behavior, whether
  six seconds is a reasonable pause duration in practice, or whether
  "Start final rendering" actually succeeds where automatic rendering
  failed.

## Two Confirmed Bugs From Real Testing - Fixed

Real testing showed the render step failing again with the old, generic
"could not be completed" message — not the new "Start final rendering"
retry path from the previous pass — and, separately, focus jumping back
to the very top of the page after running deeper AI analysis.

**Render still fell back to a dead end.** The previous pass only offered
the direct-retry path when the specific error was a `NotAllowedError`.
Real testing shows the render can fail for other reasons too (possibly
`AbortError` from an interrupted `play()`, or something else in browser
media setup) — reasons that were never confirmed, only inferred, since
this environment has no browser to reproduce them in. Rather than keep
guessing at the exact error name, the fix was broadened: **any**
render-accessible-video failure now offers the same direct "Start final
rendering" retry, with the real error message included rather than a
generic one, instead of only the one specific case detected before. A
`console.error` was also added logging the real underlying error, so the
exact cause is directly observable next time instead of inferred.

**Focus jumping to the top of the page — root cause found and fixed.**
`runDeepAnalysis()` in `js/advanced-analysis.js` never moved focus
anywhere after finishing: it rewrites a large section of the page
(`render()` replaces the analysis output's entire `innerHTML`) while
focus stayed wherever it happened to be — on the "Run deeper AI analysis"
button. A screen reader encountering a large, unmanaged DOM rewrite like
that can lose its place and restart reading from the top of the page,
which is what the transcript showed. Focus now moves explicitly to the
status message when analysis finishes (success, failure, or
unavailable), which is the standard fix for this class of problem —
anchoring focus to something meaningful stops the reader from having
nowhere reliable to land.

### Testing performed

- `node --check` on every JavaScript file (all pass).
- Manually traced a constructed non-`NotAllowedError` render failure
  through `failProgress()` to confirm it now reaches the direct-retry
  path with the real error message included, not the old generic
  "accessibility plan paused" dead end.
- Manually confirmed `advanced-analysis-status` has `tabindex="-1"` and is
  the target of `.focus()` on every exit path of `runDeepAnalysis()`
  (success, failure, and the unavailable-capability early return).
- Confirmed every `getElementById` reference from `app.js` still resolves
  (the same four pre-existing missing IDs remain; no new ones were
  introduced).
- Live testing was **not** performed — this environment has no browser,
  so the exact original error behind the render failure was not
  confirmed, only made survivable regardless of what it turns out to be;
  and the focus fix could not be re-verified against real JAWS.

## Remaining Roadmap

### Phase 33 - Automated Playback Quality Assurance

Inspect completed media playback, caption timing, track availability, audio-description placement, packaging integrity, and delivery behavior with repeatable diagnostics before release.

## Next Development Phase

Stage 1 Engine-Orchestrated Analysis Correction. This work takes priority over Automated Playback Quality Assurance because later workflow and publication testing cannot be trusted while Stage 1 can still construct an accessibility plan from incomplete or placeholder analysis.

## Next Development Priorities

**Immediate: Enforce the Authoritative Stage 1 Architecture**

- Audit every Stage 1 field and identify whether it comes from real inspection, a functioning engine, a hard-coded default, a placeholder, or an unset value.
- Map every supported source type to the analysis capabilities and engines it may require.
- Add a single engine-availability resolver used by inspection, assessment, planning, recommendations, and workflow chaining.
- Prevent workflow construction when required analysis is incomplete.
- Route missing capabilities to accessible engine or provider setup, including local installation guidance where applicable.
- Resume Stage 1 after setup and build the workflow only from completed analysis.
- Remove the assumption that every video requires transcript creation.
- Verify the complete sequence with JAWS using silent, speech-heavy, music-only, and mixed-content videos before marking the correction complete.

After this correction, continue with Automated Playback Quality Assurance and the source-type roadmap below.

The current assignment's priority is completing the real, end-to-end "Make
this video accessible" workflow — provider health and fallback, transcript
validation, and the assistant-first interface. Audio and document work are
explicitly not started; they are next, in this order:

**Next: Audio Accessibility**

- Transcribe audio
- Speaker identification
- Timestamped transcript
- Meaningful sound notation
- Summary and meeting notes
- Audio cleanup and normalization
- Caption generation when appropriate

**After audio: Document Accessibility**

- Detect scanned versus tagged documents
- OCR
- Reading order
- Headings, lists, tables
- Language, title, bookmarks
- Decorative versus meaningful graphics
- Alternative text drafting
- Form-field detection, accessible labels, tab order
- Fillable PDF creation
- Human review for low-confidence structure
- Accessible output and remediation report


# Long-Term Vision

The Open Door Accessible Assistant is the first implementation of a broader Open Door Design vision: an Open Door Accessible Assistant.

The long-term objective is to allow users to describe an accessibility goal in plain language while the application determines the appropriate workflow, coordinates the required technologies, selects the most appropriate AI providers, and produces the most accessible result possible. Users should not need to understand AI providers, accessibility techniques, or processing pipelines. The assistant should automate repetitive work and involve the user only when human judgment is required.

## Future Accessibility Goals

Examples of future capabilities include:

- Upload a video and say "Make this video accessible."
  - Analyze media
  - Generate transcripts
  - Create synchronized captions
  - Detect speakers
  - Draft audio descriptions
  - Generate narration
  - Produce an accessible video
  - Create a publication package
  - Perform a final accessibility review

- Upload an audio recording and say "Transcribe this interview."
  - Speaker identification
  - Timestamped transcript
  - Confidence review
  - Multiple export formats

- Upload an image and say "Describe this image."
  - Draft alternative text
  - Detect decorative versus meaningful images
  - OCR embedded text
  - Offer extended descriptions when appropriate

- Upload a scanned PDF and say "Make this document accessible."
  - OCR scanned pages
  - Build or repair the tag tree
  - Detect headings, lists, tables, reading order, language, and document title
  - Distinguish decorative images from meaningful images
  - Draft alternative text
  - Detect and repair bookmarks
  - Produce an accessibility report
  - Preserve the original document

- Upload a PDF form and say "Make this form fillable."
  - Detect likely form fields
  - Create accessible controls
  - Associate labels
  - Preserve logical tab order
  - Identify areas requiring human review

- Upload a Word, PowerPoint, Excel, EPUB, or PDF document and say "Make this accessible."
  - Detect accessibility issues
  - Apply high-confidence corrections automatically
  - Explain suggested corrections
  - Preserve document appearance
  - Produce remediation reports

- Enter a website address and say "Evaluate this website."
  - Crawl pages
  - Group WCAG findings
  - Recommend remediation
  - Generate VPAT-ready evidence
  - Track improvements over time

## Design Philosophy

The objective is not to replace accessibility professionals. The objective is to eliminate repetitive work so specialists can focus on review, quality, and informed decision-making.

The assistant should always distinguish between:

- High-confidence automatic corrections
- Suggested corrections requiring human review
- Decisions that should remain under human control

Every future enhancement should support one guiding principle:

Does this help someone accomplish an accessibility goal with less technical knowledge and less repetitive work?


## Core Interaction Model (Project Direction)

The primary user interaction with the Open Door Accessible Assistant is an editable combo box driven by natural language.

The assistant should inspect the supplied content first and propose the most likely accessibility goal.

Examples

Video
Default:
- Make this video accessible

Suggestions:
- Make this video accessible
- Transcribe this video
- Create captions
- Generate audio descriptions
- Extract the audio
- Compress this video

Audio
Default:
- Transcribe this audio

Scanned PDF
Default:
- Make this PDF accessible

Website
Default:
- Evaluate this website

Design Principles

- The control MUST be an editable combo box, not a restricted drop-down.
- Suggestions are recommendations, never limitations.
- Users may accept the suggestion, choose another suggestion, or type any request in plain language.
- The assistant is responsible for interpreting the request, selecting workflows, choosing healthy providers, and coordinating execution.
- Users should never need to understand workflow names, AI providers, or internal architecture.
- Suggestions should adapt to the supplied content and eventually learn from previous usage.

### Phase 34 - Accessible Publication Player - Completed

Rendered publication ZIP packages now use a reusable accessible media player based on the eComBack player design instead of a bare native video element. Each package includes the original video and the rendered audio-described version, allowing the Audio Description control to switch between them while preserving playback position, paused state, and captions. The player also provides labeled play or pause, ten-second movement, seek, mute, volume, captions, transcript, keyboard shortcuts, visible focus, and one consolidated polite status region.

When a completed transcript artifact is available, it is included in the player and exported as a separate text file. The publication manifest is now version 2, and the validation checklist includes both video versions, keyboard and screen reader operation, captions, transcript, and narration synchronization.

Implementation:

- `js/publication-renderer.js` builds the dual-video accessible player and expanded publication package.
- `docs/Phase 34 Accessible Publication Player.md` documents behavior, accessibility, package contents, and limitations.

### Phase 36 - Screen Reader First Workflow Correction - In Progress

Started against the "OpenDoorAccessibleAssistant Screen Reader First Workflow" directive, which asked for a full audit of the Make This Accessible workflow, progress announcements, next-action guidance, focus management, and the accessible media player.

Current-state workflow map, traced from the repository as it stood at the start of this phase:

- Source selection (`js/app.js` file/URL handling) hands off to inspection, then to `renderGoalSuggestions` and the direct-goal combo box. Automatic vs. review-required is decided by `js/intent-engine.js` and `js/workflow-chain.js`.
- `Make This Accessible` (`startWorkflowChain` / `continueWorkflowChain` in `js/app.js`, backed by `js/workflow-chain.js`) automatically runs steps that don't need a person, and stops at steps `requiresReview` marks, or at capability-blocked steps.
- Individual review workspaces (`js/transcript-review.js`, `js/caption-review.js`, `js/audio-description-review.js`, and their `js/app.js` wiring) already move focus into the relevant labelled section on open, and back to the Workflow Status heading / Current Task summary after approval.
- Progress and time reporting flow through `js/workflow-runner.js` → `updateProgress` in `js/app.js`. The accessible publication player (`js/publication-renderer.js`, Phase 34) is the approved eComBack-based design and is only used in exported publication packages, not yet inside the in-app review/preview experience.
- `pickNextAction` / `renderCurrentTask` in `js/app.js` already treat an active paused/review chain as taking priority over any other suggestion, so a later step is not offered as "next" while an earlier one is blocking.

Fixed in this pass:

- **Noisy, repeated announcements.** `js/publication-renderer.js`'s render-progress monitor reports position roughly every 750ms, and this was going straight into a live region on every tick — the direct cause of things like "less than a minute" being re-announced for minutes at a time. `updateProgress` in `js/app.js` now only writes to the one live Workflow Status region (`job-status`) when the step changes or the overall percentage crosses a 10/25/50/75/90/100 boundary; in-between ticks still update the visible percentage and elapsed/remaining text silently.
- **Two live regions announcing the same event.** Several Make This Accessible transitions (chain start, paused-for-review, complete) were writing near-identical text into both the top status banner and the Workflow Status region, or into a hidden region and the banner, at the same moment. These now go through a single `announceWorkflowStatus` helper, and chain completion/pause now speaks once, through the Current Task summary that already receives focus at that point.
- **`job-time-status` was a second live region.** It updated in lockstep with `job-status` on every tick. It's no longer a live region — it's a plain, continuously-updated visual field for elapsed time, remaining-time estimate, and percentage; only `job-status` (job-status heading: "Workflow Status") is announced, and only at the meaningful transitions above.
- **Generic "Working" heading.** Renamed to "Workflow Status" to match the directive's named region and to give the heading itself meaning when a screen reader user tabs to it.
- **Focus on workflow start.** `startWorkflowChain` / `submitWorkflowChain` now move focus to the Workflow Status heading immediately after announcing that Make This Accessible has started, instead of leaving focus wherever it was on the combo box.
- **Player was a bare native element, not the approved design.** The initial file/URL preview (`renderViewer` in `js/app.js`) used a plain `<video controls>` / `<audio controls>` element with default browser controls, and stayed visible unchanged through every transcript/caption/audio-description review step — the only place that used the approved eComBack pattern was the exported publication package. Added `js/accessible-player.js`, a reusable in-app player built to the same control set, labels, `aria-pressed` pattern, keyboard shortcuts (Space/C/D/T), and single consolidated live region as `js/publication-renderer.js`'s player. All four preview paths (local video, local audio, direct-URL video, direct-URL audio) now use it, including Back 10 Seconds / Forward 10 Seconds, which the native controls didn't expose at all. Since the viewer stays visible through review, this is also what a person uses to play the source while reviewing the transcript, captions, or audio-description script.

Not yet done (deferred to a following session, in the order the directive specifies):

- The in-app player currently runs in Standard-video/audio-only mode (matching what actually exists at preview time). It does not yet pick up captions or the transcript once they're approved and re-render itself with the Captions/Transcript controls, the way the exported publication player does — that needs the exact artifact-lookup API (`OutputManager.listForSource` content shape) confirmed against real saved output before wiring it, rather than guessed at.
- A full focus-management audit across every remaining transition (errors, cancellation, individual workflow completion outside the chain) beyond the chain-level ones above.
- A full label/instruction audit against Phase Seven's specific list.
- Real JAWS/NVDA/keyboard-only testing per Phase Eight — the changes above are based on tracing the code, not a live screen reader session, since that verification needs to happen on your machine.

See `docs/ScreenReaderFirstWorkflow.md` for the announcement and focus behavior this phase established, written from the user's perspective.

### Phase 37 - Render Readiness Root Cause - Completed

Your JAWS test surfaced three messages that contradicted each other: "Create a transcript requires your review," "Next recommended action: Render accessible video," and then, after activating rendering, "Create and review captions before rendering the accessible video." Traced to one root cause, not three separate bugs:

`render-accessible-video` had no entry in `js/accessibility-plan.js`'s task list, so `dependencyStatus()` in `js/recommendation-engine.js` always returned `'clear'` for it — there was nothing to check against. That made it look "available" the moment a provider existed, regardless of whether captions or described audio actually existed yet. `js/workflow-runner.js`'s `validateJob` already had the real, correct check (captions text present, described-audio mix present) — but only at the moment rendering actually started, after the Current Task section had already offered it as "next" and shown a working-looking button.

Fixed:

- Added `renderPrerequisitesMet(model)` to `js/recommendation-engine.js`, using the exact same check `validateJob` uses (captions `text/vtt` artifact with content, `audio/wav` described-audio artifact with a URL), and gated `render-accessible-video`'s `available` flag on it. This is the one place "is render actually ready" is now decided; the recommendation list, Current Task, and Make This Accessible chain all read from it instead of each recomputing their own (inconsistent) answer.
- `js/app.js`'s `pickNextAction` and `js/workflow-chain.js`'s `createStep`/`refresh` now also check `available`, not just raw provider capability, so render-accessible-video can't be offered as "next," built into a chain as unblocked, or auto-run before its prerequisites exist.
- Typing a direct request that maps to render-accessible-video before it's ready now shows the real reason ("Render Accessible Video is unavailable until the transcript and captions are approved.") instead of running the job and surfacing the internal validation error.

Checked and not a bug: the JAWS transcript listed "Workflow Status" and "Current task" headings more than once. The DOM has exactly one of each (`#progress-heading`, `#current-task-heading`) — that repetition in the transcript reflects JAWS re-visiting the same heading during navigation, not duplicate elements.

Not independently verified: the review section (Review Transcript) not "providing a clear action," per your test, appears to be a consequence of the routing bug above — you were directed to Render instead of into transcript review, so the review controls were never actually reached. `js/app.js`'s `openTranscriptReview` already sets an orientation sentence and moves focus to the section on open; this needs a real test now that the routing is fixed, rather than a second guess at what's wrong.

Still outstanding, lower priority: the "Strongly recommended" vs. "required" labeling Chip flagged under Accessibility Assessment (in More Details, not required for the current task), and the caption/transcript-aware in-app player upgrade from Phase 36.

### Phase 38 - Fixed-Pipeline Critique and Transcript-for-Silent-Media - Partial

Your "Walk about the house and front yard.MOV" test raised a real architectural point, and one concrete, fixable bug.

**The architectural point is correct and not yet addressed.** `js/workflow-chain.js`'s `workflowOrderByMediaType.video` is a fixed sequence — every video gets extract-audio → transcript → captions → audio-description → render, regardless of content. `js/media-inspector.js`'s `hasAudio` field is literally `mediaType === 'audio' || mediaType === 'video'` — it doesn't inspect the audio track at all, let alone detect speech. `model.audio.speech.status`, referenced in `js/accessibility-plan.js`, is never actually set anywhere in the codebase. The "intelligence" your test exposed is aspirational scaffolding, not a working analysis step — you're right that it's currently a checklist, not an assistant.

**What I didn't do, and why:** build real speech/scene/object detection now. Two honest options exist, and I didn't want to fake a third:

1. A connected AI provider (the OpenAI adapter and similar infrastructure already exist in the app for transcription/visual-analysis drafts) could genuinely answer "does this have speech," "what's in frame," etc. — but that's an opt-in, possibly-billed, privacy-confirmed path the person has to configure, not something to silently run by default.
2. A local heuristic (e.g., WebAudio energy analysis to guess "silent vs. not") can reliably detect a *genuinely silent* audio track, but cannot reliably distinguish quiet dialogue from wind and footsteps. Shipping that as if it were real speech detection would mean the app could silently decide a video with real, quiet dialogue doesn't need a transcript — for an accessibility tool, a wrong "skip this" is worse than an unnecessary "review this." I didn't build this without being able to verify it against real recordings.

Building this correctly is a real project, not a quick fix: it needs a decision, with you, about whether it leans on connected AI (option 1) and how much a browser-only heuristic (option 2) is trusted to gate anything automatically versus only ever suggesting.

**What I did fix**, since it was the one piece of this test with a concrete, verifiable defect: the transcript review screen assumed dialogue exists. The text field was HTML-`required`, so if there genuinely isn't any spoken content, there was no way to approve and move on — you'd be stuck. Added a checkbox, "There is little or no spoken dialogue in this recording," to `js/app.js`'s transcript review; checking it lets you save without typing anything, filling in an honest, accurate statement rather than inventing dialogue. The instructions above the field now say to check that box instead of leaving it blank, rather than assuming spoken content is there to describe.

**The "0:00 / 0:00" duration bug**, also fixed defensively even though I can't confirm the exact cause without a browser to test in: `js/accessible-player.js` now also listens for `loadedmetadata` and `canplay` (previously only `durationchange`, which some local blob URLs — `.mov` files in particular — don't reliably fire), applies the standard workaround for Chrome occasionally reporting `Infinity` for a local blob's duration until a seek forces it to resolve, and — if the file genuinely can't be decoded — announces that plainly instead of silently displaying "0:00" forever with no explanation. If this was actually a `.mov` decoding limitation in Chrome itself rather than a timing bug in the player, this won't fix playback, but it will now tell you that instead of showing a duration that looks valid but isn't.

### Phase 39 - Stage 1 Media Analysis Coordinator - Partial, First Implementation

Implements the beginning of `docs/Stage 1 Engine-Orchestrated Analysis Directive.md`. Not marked complete — acceptance tests in that document have not been run against real engines and real files, and only the speech question is covered; visual/scene analysis is not.

- `js/stage-one-analysis.js`: the authoritative Stage 1 coordinator. Resolves whether speech-presence is known for a source — by a real, currently-healthy connected transcription engine (`AIProviderLayer.getCapability('transcription-draft')`, which genuinely requires a configured external or local service; there is no default/always-on speech engine in this app) or by a direct, recorded human answer. Never inferred from media type or audio-track presence alone.
- New **Media Analysis** section (`index.html`, positioned right after the Viewer) shows what's known and, when the speech question is unresolved, gives the two real paths the directive specifies: configure an engine, or answer directly.
- **Make This Accessible now refuses to build a chain** until Stage 1 resolves the speech question — `js/app.js`'s `matchDirectGoal` returns `{ stageOneBlocked: true }` and routes focus to Media Analysis instead. When the person has recorded "little or no spoken dialogue," `create-transcript` and `create-captions` are excluded from the chain entirely, rather than being run and then producing a placeholder transcript.

**Note on how this was tested**: the previous JAWS test that reported "still fundamentally wrong" was run against a build that did not yet contain this work — it was written but not shipped in that session. The corrections below were found by tracing that older build's code, not by re-deriving Stage 1's design.

### Phase 40 - Corrections From an Un-Shipped-Build JAWS Test

- **`create-captions` had the same missing-dependency gap `render-accessible-video` had in Phase 37**, from the other direction: it has a real plan dependency on `create-transcript`, but the `available` flag never consulted it — only raw provider capability. Since captions score higher than transcript in `accessibilityPriority`, this let "Next recommended action: Create captions" appear before a transcript existed. Fixed in `js/recommendation-engine.js`, gated the same way render was: `available` now also requires the transcript to actually have usable content (or a recorded "no dialogue" answer). `audio-description` was deliberately left alone — its plan dependency runs through visual analysis, which has no real engine in this build and never reaches `'complete'`; gating on that would make a working, manually-authored workflow permanently unavailable instead of fixing anything.
- **Opening transcript review auto-requested an AI transcription draft unconditionally**, even when the person had just told the app there's no dialogue. `js/app.js`'s `openTranscriptReview` now checks the recorded Stage 1 answer first and skips the request entirely when it's "reported-none."
- **The same auto-request could fail into a confirm dialog well after the workflow had already started**, when the file exceeded a connected provider's size limit. That limit is now checked before the automatic attempt starts, showing a plain message instead of letting the attempt begin and fail mid-flow.
- **Opening caption review auto-requested an AI caption draft from a transcript that was just the "no spoken dialogue" placeholder**, producing a meaningless blank cue. Skipped in that case, with an explanation and the existing manual/request-anyway options still available for meaningful environmental sounds.
- **The transcript-review confirmation checkbox always said "I reviewed this transcript,"** even when the no-speech box was checked and there was nothing to review. It now reads "I confirmed that this recording has little or no spoken dialogue" in that case, updated live as the no-speech checkbox is toggled.
- **Two live regions announcing the same "draft ready" event together, right before a focus move onto newly-inserted form fields** (in caption-draft success) — reduced to one live announcement, and the caption-draft auto-request is now deferred one tick after the initial focus-move announcement so the two don't overlap.

**Not confirmed fixed**: the report of every caption-review control's accessible name collapsing to the status text ("Creating a caption draft using the best available method."). Each cue's markup builds correct, unique labels — I could not find a static labeling bug. My best explanation is a JAWS announcement collision from inserting ~12 cue fields via `innerHTML` in the same synchronous block as two live-region writes and a focus move, which the changes above should reduce, but I can't confirm this is fully resolved without a real screen reader testing it. If it recurs, the next thing to check is whether it happens specifically right after that burst of DOM insertion.

**Not addressed**: a general pre-flight capability/limit check for every provider and every workflow (only the transcription-draft size case above was fixed); a single authoritative workflow-state resolver replacing the several places that currently compute "current step / next action" independently (Current Task, Workflow Status, and the chain each still derive their own view, even though the specific contradiction found this round is fixed).

### Phase 41 - Stage 1 Becomes a Branching Decision, Not a Checkbox Gate

Chip's point was correct: a "no dialogue" answer was being treated as a prerequisite to satisfy (unlock the same transcript-then-captions pipeline) instead of a branch that changes what work is needed. Implemented the actual decision tree:

```
Speech present?
  Yes -> transcript needed -> dialogue captions needed
  No  -> transcript NOT needed -> meaningful non-speech audio present?
           Yes -> captions needed (for that non-speech audio)
           No  -> captions not required
```

- `js/stage-one-analysis.js` now asks a second question — meaningful non-speech audio — but only once speech has been confirmed absent (no point asking otherwise). No local engine can answer this (no audio-event-detection engine exists in this build), so it's always a direct question, same pattern as speech.
- `create-transcript` and `create-captions` are now independent exclusions in the Make This Accessible chain (`js/app.js` `matchDirectGoal`), and `js/recommendation-engine.js`'s captions availability now checks Stage 1's actual verdict plus the real execution prerequisite (a completed transcript, only when captions are needed because of dialogue — not when they're needed for non-speech audio, which has no transcript to wait for).
- **Retired the mechanism from Phase 38/40 that saved a placeholder sentence as a "completed" transcript artifact.** That was architecturally backwards once Stage 1 exists: confirming "no dialogue" is a Stage 1 fact, not a finished transcript. `js/app.js`'s `submitTranscriptReview` no longer creates any artifact or marks `create-transcript` complete when there's nothing to transcribe — it records the Stage 1 answer and closes out.
- Audio description's ranking now gets a boost when Stage 1 has established there's no dialogue, since it becomes the primary accessibility task for that kind of source rather than one option among several — a small nudge, not a guarantee it'll always rank first.

**Known limitation, not fixable from here**: if you re-test with the same "Walk about the house and front yard.MOV" file you've been using, it may still show "Completed: Create a transcript." That's a real saved artifact from an earlier test round, back when the old placeholder mechanism existed — it's sitting in this browser's local storage for that specific file (keyed by name/size/duration) and gets correctly restored as genuine prior work, the same as any other saved transcript would be. Going forward, new "no dialogue" answers won't create that artifact, but I can't reach into your browser's storage to remove the old one. A fresh copy of the file (or clearing that source's saved data) would show the corrected behavior cleanly.

**Still not implemented**: visual analysis (what audio-description actually needs to determine "is this appropriate for this source"), the full decision tree extending into audio-description itself (right now it's a priority nudge, not a Stage-1-resolved branch the way speech/captions are), and a single authoritative state resolver replacing the several places that still separately compute "current step."

### Phase 42 - A Real Local Analysis Engine, and a Real Bug Fix

Direct response to: "stop treating user answers as the primary Stage 1 analysis system... implement or configure the engines that allow the assistant to make the initial determination itself," and to the specific code contradiction Chip found (a comment saying "must not mark create-transcript completed," followed a few lines later by code that did exactly that).

**The code contradiction was real.** `js/app.js`'s no-dialogue path called `window.WorkflowChain.markCompleted(activeWorkflowChain, 'create-transcript')` — a genuine bug, not just a misleading comment. `js/workflow-chain.js` had no way to say "this step isn't needed" that wasn't also "this step is done," so skipping a step and completing it were forced through the same flag. Added `markNotNeeded`, a real distinct state, and switched the call to it.

**Added a real local analysis engine**, not a heuristic dressed up as one: `js/audio-signal-analysis.js` decodes the actual audio track (the same Web Audio `decodeAudioData` pattern already proven in `js/narration-mixer.js`) and measures real signal energy across the whole file. It runs automatically the moment a local file is selected — no question asked, no button to press.

What it can honestly claim, stated plainly because overclaiming here would cause real harm: it can reliably tell "this track is essentially silent throughout" from "this track has real acoustic content." That's a direct measurement. It **cannot** reliably tell speech apart from music, wind, or footsteps using energy alone — that needs real audio/speech classification, which means a connected AI service, which this build doesn't run automatically. So:

- If the track measures as essentially silent, both the speech and non-speech-audio questions resolve automatically and instantly — no manual questions at all. This is the case that matches "Walk about the house and front yard.MOV" if that recording is in fact near-silent.
- If the track has real audio content, the automated analysis says so plainly ("found real sound content, but this build cannot automatically tell spoken dialogue apart from music, wind, or other non-speech sound") and the manual question becomes a clearly-labeled fallback for that specific unresolved case — not the default interaction for every file, and not presented as if analysis had determined the answer.
- If the browser can't decode the file's audio at all (the same class of container/codec issue already flagged for `.mov` playback), that's stated honestly too, and falls back the same way.

**What this is not**: real speech recognition, real audio-event classification, or real scene/visual analysis. Those need an actual trained model — either a connected AI service (already-existing infrastructure in this app) or, if you want a fully local answer, a real ML model shipped and run in-browser, which is a materially larger undertaking than this energy measurement. I did not build a fake classifier that guesses "probably speech" from pitch or rhythm heuristics — a wrong guess there is worse than an honest "I don't know," especially for a tool whose whole purpose is not letting things slip through.

**Not done**: the visual side of Stage 1 (the same local-engine-first pattern, applied to determining whether audio description is warranted) — still entirely unimplemented, and audio-description's ranking is still a priority nudge, not a resolved branch.

### Phase 43 - Analysis Results Reported Separately From Workflow Artifacts

Scoped to exactly the one refinement requested: Current Task must never word a Stage 1 analysis result as if it were a completed workflow artifact.

- `js/stage-one-analysis.js` gained `describeResults(model)`: short, honest lines for each resolved question ("Speech analysis: little or no spoken dialogue", "Audio event analysis: no meaningful non-speech sounds"), entirely separate from artifact completion.
- `js/app.js`'s `renderCurrentTask` now reports two distinct sentences: `Completed: ...` lists only real workflow artifacts (unchanged — `item.completed` already meant "an actual artifact exists," via `recommendation-engine.js`'s `isPresent`/`hasUsableArtifactText`), and analysis results are appended as their own sentence, never merged into that list.

**This does not retroactively fix an already-contaminated test source.** If "Create a transcript" still appears in Completed for the same file you've been re-testing, that's the same stale placeholder artifact from before Phase 42 — it's a real saved artifact sitting in that source's local storage, genuinely satisfying "an artifact exists," so it's not wrong for the app to report it as completed even though it shouldn't have been created in the first place. Going forward, no new source will accumulate that kind of artifact. I can't clear existing browser storage from here.

Kept to this one change tonight, as directed — no other architectural changes made this round.

### Phase 44 - Fixed a Real Dead End When a Speech Engine IS Configured

Found the bug immediately: `js/stage-one-analysis.js`'s speech question listed `'engine-available'` as a status that would count as resolved, but nothing anywhere ever set that status — so when a transcription engine (OpenAI, in this case) was actually configured and healthy, the question stayed unresolved forever. Media Analysis showed "1 question must be resolved," offered no button, and its own message ("speech analysis will run using OpenAI service when you begin") directly contradicted the permanently-blocked state around it. Make This Accessible could never start.

Fixed: a configured, healthy transcription engine now resolves the question directly — deferred to actually run when the transcript step executes, matching what the message already said. No status value needed to be invented and never set.

### Phase 45 - Yesterday's Fix Was Half Right and Caused This

Phase 44 fixed a real dead end (a configured engine could leave Media Analysis permanently blocked with no button). But the fix itself was wrong in a way that caused this test: it treated "a transcription engine is configured" as resolving the speech question, with no check on whether that engine could actually handle *this* file. For a file over the 50 MB connected-service limit, the app declared "speech analysis will run using OpenAI service when you begin," let Make This Accessible start, ran the whole audio-extraction step, and only then — inside transcript review — discovered what could have been known immediately: it can't run for this file. That's a regression I introduced, not a pre-existing issue.

Fixed: `js/app.js` now checks file size against the connected engine's known limit *before* Stage 1 decides anything (`updateEngineFileCompatibility`, using the exact same check `openTranscriptReview` already made at execution time). `js/stage-one-analysis.js`'s speech question no longer counts as resolved when the configured engine can't accept this file — it falls through to the direct question immediately, in Media Analysis, before the workflow starts. Also stopped it from short-circuiting on "an engine exists" while the free local silence analysis (Phase 42) is still running, since that one costs nothing and should get first chance to answer instead of being preempted by a slower, possibly-billed engine.

**What this doesn't change**: for a file that's both too large for a connected engine *and* has real, non-silent audio content the local engine honestly can't classify (footsteps, ambient house sounds — not total silence), one direct question is still the accurate state of things, not a bug. That's the same fallback Chip endorsed. It should now show up exactly once, in Media Analysis, before anything else runs — not after audio extraction, not buried inside transcript review.

### Phase 46 - Transcription Now Uses the Extracted Audio, Not the Raw Video

Chip's factual point was correct: `CONNECTED_SERVICE_MAX_BYTES` (50 MB) is a single blanket application-level transport safeguard, not a real per-provider API limit — it was never derived from OpenAI's, Azure's, or Gemini's actual documented limits. That part of the critique was right, and it's fixed by not needing that number to represent "the" universal limit anymore (see below).

**But raising the number, or trying each provider in turn with the same payload, would not have fixed a 500 MB-1 GB video.** Here's the real constraint underneath the constant: every connected-service request in this app reads the whole file into memory, converts it to a base64 string in a JS loop, and sends it as one JSON body (`js/app.js`'s `readSourceData`). That approach breaks down well before any provider's nominal size limit, for any provider — encoding and holding a gigabyte-scale base64 string in a browser tab is a real memory/performance wall regardless of whose API receives it. Chunked, resumable, provider-specific upload (Azure batch transcription, Gemini's Files API, true audio splitting with timestamp-preserving merge) is genuinely the correct long-term answer Chip described, and it's a real, multi-session engineering project — I'm not going to claim I built that tonight.

**What's actually fixed, and does address the 500 MB-1 GB case directly**: transcription and caption drafting now send the already-extracted audio-only copy instead of the original video, when one exists. `extract-audio` already runs automatically before `create-transcript` in the Make This Accessible chain, and produces a separate file that scales with duration, not with video resolution/bitrate — a video's audio track is typically a small fraction of the total file size regardless of how large the video itself is. `js/app.js` now looks for that artifact (`findExtractedAudioArtifact`) and routes `transcription-draft`, `caption-draft`, and caption-critique requests through it (`preferExtractedAudio: true`); `audio-description-draft` and `visual-analysis` still correctly use the original video, since those need the actual picture, not just sound.

Also fixed the premature-question problem this caused: before audio extraction has run, the app no longer judges compatibility by the raw video's size at all (`effectiveTranscriptionSourceSize` returns "not yet known" for video pre-extraction) — it waits until extraction completes and checks the real, much smaller file, rather than asking a question upfront based on a number that was never going to be what's actually sent.

**One more thing already in this codebase that's worth knowing about**: automatic fallback to the next configured provider on failure (`handleTranscriptFailure` / `AIProviderLayer.getAlternative`) already existed before tonight — Chip's "if OpenAI can't, try Azure, then Gemini, then local" is already how failures are handled, with one confirmation per new external provider tried. It just wasn't getting a fair chance before, because the size check was being applied to the video instead of the audio.

**Not done, stated plainly**: true per-provider limit awareness (this build's safeguard is still one number, not Azure's actual limit vs. Gemini's actual limit vs. a local endpoint's actual limit), and chunked audio processing for audio that's still too large even after extraction (a multi-hour recording's audio track can still exceed 50 MB). Both are real next steps, not implemented tonight.
