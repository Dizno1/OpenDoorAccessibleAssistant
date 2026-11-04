# Windows Migration and DesignRepo Alignment

## Source boundaries

Only Open Door Accessible Assistant is modified. DesignPhilosophyAndStandards is a read-only standards source.

## Verified existing architecture

The assistant uses a single index.html, CSS, and ordered browser scripts. Existing modules include stage-one-analysis.js, accessibility-intelligence.js, shared-knowledge.js, provider-manager.js, local-service-provider.js, and workflow-runner.js. The repository includes a Python local production helper, but no prior Tauri configuration was present in the supplied archive.

## DesignRepo requirements used

- Application Patterns/Media Workflow Assistant/Accessibility Requirements.md: WCAG 2.2 AA, keyboard support, announcements, visible focus, progress, interruptible workflows.
- Application Patterns/Media Workflow Assistant/Keyboard Model.md: Ctrl+O to open; Escape to cancel; F1 for help as suggested bindings. Only Ctrl+O is implemented in this increment.
- Patterns/Focus Management.md: no unexpected focus movement, focus restoration after dialogs, no focus in hidden elements, no positive tabindex.
- Patterns/Live Regions.md and Patterns/Status Messages.md: review before integrating long-running processing.

## Architecture decisions

Tauri 2 shell first, with existing frontend retained. The app must not imply local engines are ready merely because a provider is configured. Do not send source content to cloud providers without explicit permission. Projects remain optional. Do not silently create artifacts from analysis findings.

## Accessibility acceptance checklist

1. Keyboard-only: open file, enter goal, start, cancel, review and export.
2. JAWS and NVDA: controls have correct name, role, state and stable focus.
3. Ctrl+O is available but the visible Choose a file button remains the equivalent action.
4. Status changes are announced without duplicate chatter or focus theft.
5. Dialogs restore focus to the initiating control.
6. Native Windows menus and their shortcuts are discoverable.
7. Large files are handled through native paths/streams rather than Base64 JSON payloads.
8. Engine diagnostics distinguish ready, installed but unconfigured, unavailable, and failed.
9. User consents before any cloud upload.
10. An error does not create a phantom transcript, caption, or other output.

## Known limits of increment 1

The shell is uncompiled and untested. It is NOT a working standalone installer and does NOT yet bundle processing dependencies. The existing app still uses browser-oriented file handling. Subsequent increments must replace transport bottlenecks rather than treating the desktop wrapper alone as the fix.
