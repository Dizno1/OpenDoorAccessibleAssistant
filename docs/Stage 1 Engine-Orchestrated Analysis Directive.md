# Stage 1 Engine-Orchestrated Analysis Directive

## Purpose

This directive restores the original architecture and makes it enforceable across the repository.

The required sequence is:

**File or source received -> Stage 1 analysis -> required capabilities identified -> engines installed, configured, activated, or tested -> Stage 1 completed -> accessibility workflow built -> workflow executed**

Do not create another parallel analysis path. Do not patch individual transcript, caption, or rendering screens as a substitute for repairing Stage 1.

## Repository audit

Read the entire repository and all roadmap documents before editing. Trace every field in the shared media knowledge model, accessibility assessment, accessibility plan, recommendation engine, intent engine, workflow chain, provider layer, Shared Services layer, and Provider Manager.

For every analysis field, record whether it is:

- produced by direct technical inspection
- produced by a functioning local engine
- produced by a configured external provider
- inferred only from the file extension or MIME type
- hard-coded
- assigned a placeholder or optimistic default
- left unset
- treated as complete despite being unknown

Pay particular attention to speech status, speaker detection, meaningful sound detection, scene analysis, visual content, on-screen text, existing captions, existing audio description, codec support, duration, and preview support.

## Required implementation

1. Create one authoritative Stage 1 coordinator for every source.
2. Identify the source type and the unresolved accessibility-analysis questions.
3. Map those questions to explicit capabilities and engines.
4. Resolve whether each capability is genuinely available and healthy.
5. Do not equate the existence of an adapter, provider record, or scaffolded property with working availability.
6. When required engines are missing, pause before workflow construction.
7. Present one accessible setup path explaining:
   - the missing engine or capability
   - what it is needed for
   - whether it runs locally or externally
   - installation or configuration requirements
   - privacy and possible-cost implications
   - how to test it
8. Resume Stage 1 after successful setup.
9. Keep unresolved analysis values explicitly unknown until real analysis completes.
10. Build the accessibility plan only from completed analysis results.
11. Mark tasks as required, optional, unnecessary, or blocked based on analysis, not merely the file type.
12. Preserve human review checkpoints after automatic analysis and drafting.

## Prohibited shortcuts

Do not:

- default every video to transcript creation
- treat an audio track as proof that speech exists
- treat a video track as proof that audio description is required
- open transcript review because speech analysis is unavailable
- use a no-speech checkbox as the primary architectural solution
- insert canned transcript text to bypass missing analysis
- build a transcript-caption-render chain before Stage 1 completes
- expose a later action as recommended while an earlier analysis requirement is unresolved
- claim an engine is installed or ready until a real health or connection test succeeds

## Required user experience

When analysis cannot continue, the user must receive a plain-language status such as:

> Speech analysis has not been completed because no working speech-analysis engine is configured. Configure a local or connected speech-analysis engine to continue analyzing this video.

The next available action must be the setup or configuration action. Transcript review, caption creation, audio-description authoring, and rendering must not be presented as the current step until Stage 1 has established that they are appropriate.

## Acceptance tests

Test with JAWS and keyboard-only operation using at least:

- a silent video with significant visual content
- a video containing clear speech
- a video containing music and environmental sound but no speech
- a mixed video containing speech, meaningful sounds, on-screen text, and scene changes
- an unsupported or partially supported MOV file
- an image containing text
- a scanned document
- a tagged document

For each source, verify that:

- the application explains what it knows and what remains unknown
- missing engines are identified before task workflows appear
- setup controls are reachable and understandable
- Stage 1 resumes after setup
- the generated workflow matches actual analysis results
- no unavailable or premature action is announced as the next step
- one Workflow Status region communicates the current state

## Documentation and packaging

Update the README, the Accessibility Intelligence Engine documentation, and any affected phase documents so they distinguish implemented analysis from planned analysis. Do not mark Stage 1 complete until the acceptance tests pass with real engines and real files.

Return the updated repository without `.git`, development caches, editor metadata, temporary files, logs, or unrelated artifacts.
