# Phase 34 Accessible Publication Player

## Status

Completed.

## Purpose

Phase 34 replaces the minimal native video page in rendered publication packages with a reusable accessible media player based on the proven eComBack player design. The publication package now includes both the original video and the rendered audio-described version so users can switch audio description on or off without leaving the player.

## Functional implementation

- Packages the original source video alongside the rendered audio-described video.
- Replaces the bare native player page with a dedicated accessible player.
- Adds labeled Play or Pause, Back 10 Seconds, Forward 10 Seconds, Seek, Mute, Volume, Captions, Audio Description, and Transcript controls.
- Preserves the current playback position, paused state, and caption state when switching between standard and audio-described video versions.
- Includes the completed transcript in the player and as a downloadable text file when a transcript artifact is available.
- Uses one consolidated polite live region for player state announcements.
- Provides optional keyboard shortcuts for Space, C, D, and T when focus is not inside an interactive control.
- Updates the publication manifest to package version 2 and records both video versions, the player, captions, transcript availability, and validation checklist.
- Expands the human validation checklist to cover keyboard operation, screen reader output, both playback versions, captions, transcript, and narration synchronization.

## Accessibility

The player uses native buttons and range inputs with visible labels, strong keyboard focus indicators, programmatic pressed and expanded states, a single status region, and focus return after the transcript closes. The video remains available directly when scripts are unavailable, and all media assets remain separately downloadable from the package.

## Limitations

The publication package is larger because it contains both the original and audio-described video. Switching versions depends on both files using formats supported by the user's browser. The final package still requires human playback, caption synchronization, narration placement, keyboard, and screen reader review before publication.

## Next phase

Add automated publication-player regression tests and optional visual customization presets while retaining the same accessible control structure and announcements.
