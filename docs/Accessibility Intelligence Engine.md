# Accessibility Intelligence Engine

Phase 1 establishes a shared media knowledge model that future transcript, caption, audio description, translation, and reporting features will reuse.

Guiding principle:

Analyze once. Understand completely. Recommend intelligently. Produce accessible media.


## Authoritative execution order

The knowledge model does not by itself constitute analysis. The controlling execution order is:

1. Receive the file or source.
2. Begin Stage 1 analysis.
3. Determine which capabilities and engines are required for that source and its unresolved content questions.
4. Install, configure, activate, or test missing engines.
5. Resume and complete Stage 1 analysis.
6. Build the accessibility workflow from completed analysis results.
7. Execute automatic work and required human review.

Unknown or unset fields must remain explicitly unknown. They must not be converted into workflow requirements by default. A provider adapter, placeholder property, or planned capability is not evidence that analysis occurred.

See `Stage 1 Engine-Orchestrated Analysis Directive.md` for the current corrective development assignment.
