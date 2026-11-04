# Screen Reader First Workflow

This document describes the Make This Accessible workflow from the perspective of a blind, keyboard-only user — what gets announced, when, and where focus lands. It is written against the state of the application as of Phase 36. It is not yet complete; see "Not yet covered" at the end.

## Starting the workflow

After a source is selected and inspected, the announcement is:

> "Source selected. Review the file information, then activate Make This Accessible."

Activating "Make This Accessible":

1. Announces once, in the Workflow Status region: "Make This Accessible started. The application will continue automatically and pause only when your review is required."
2. Moves focus to the Workflow Status heading.

## While automatic steps run

The Workflow Status region contains: the current task, overall progress, elapsed time, an estimated remaining time (or "Estimating remaining time" until there's enough data to trust one), and a Cancel button.

Only the current-task line is announced, and only when:

- a step starts,
- the overall percentage crosses 10, 25, 50, 75, 90, or 100 percent,
- the remaining-time estimate moves into a genuinely different range (not on every recalculation), or
- the workflow pauses, errors, or completes.

Elapsed time and the remaining-time estimate update visually far more often than that, but are not announced on their own — you can navigate into the region and read the current figures at any time without being interrupted by a running timer.

"Estimated remaining time: less than a minute" is only announced once the estimate has actually stabilized below a minute — not as a generic fallback, and not repeatedly while it stays in that range.

## When your review is required

The workflow stops and the Current Task summary states, in one place:

- what's already completed,
- what needs review,
- the exact button to activate, and
- what happens after.

A later step (for example, rendering the final video) is never offered as the next action while an earlier approval — like the transcript — is still outstanding.

Opening a review workspace (Review Transcript, Review Captions, Review Audio Description) moves focus to that workspace's heading, not into an editable field.

After you approve a step, focus returns to the Workflow Status heading and the next automatic task is announced once; the workflow then resumes on its own.

## Completion

When Make This Accessible finishes, focus moves to the Current Task summary, which announces completion once along with what's ready.

## The player

Wherever the source video or audio is shown — initial preview, and throughout every review step, since the viewer stays visible — it uses the same reusable player (`js/accessible-player.js`), built to the same control set and behavior as the approved eComBack-based player used in the exported publication package: labeled Play/Pause, Back 10 Seconds, Forward 10 Seconds, a seek control, current time and duration, and keyboard shortcuts (Space, C, D, T) when focus isn't inside a control. A control for an asset that doesn't exist yet — captions, audio description, transcript — is left off entirely rather than shown disabled.

Right now the in-app player only ever runs in standard video/audio mode, since captions and the transcript aren't wired back into it once you approve them. That's the next concrete gap — see the README's Phase 36 entry.

## Not yet covered by this document

- Automatically upgrading the in-app player to show Captions/Transcript controls once those are approved, matching what the exported publication player already does.
- Error and cancellation focus behavior outside the Make This Accessible chain.
- A full pass against every label listed in the directive's Phase Seven.

This document should be updated as those are completed, and corrected against real JAWS/NVDA output rather than left as a prediction of what the code does.
