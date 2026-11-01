# Steam menu refresh

Development preview: 0.2.6-dev.11. The public 0.2.6 release remains an unpublished draft.

## User-visible changes

- One branded Steam header with connection status, followed by Downloads, Storage, and Connection tabs. Removed the duplicate overview heading.
- Downloads use rounded cards with proportion-preserving artwork, status, percentage, and one main action. Active downloads show speed and time remaining; queued downloads offer Download now rather than an ineffective Pause control. Paused downloads retain Resume.
- A compact overflow button opens the existing Orbit menu for queue priority, ordering, and removal. Aggregate state counts replace the idle zero-speed label.
- Storage uses consistent rounded sections for library folders, moving a game, and download limits. Narrow menus keep refresh accessible without overflowing the tab row.
- Progress refreshes retain the same artwork, action controls, and keyboard focus. Queue polling restarts after returning from another tab and continues when an empty queue receives new downloads. Global pause/resume updates the queue in place.

## Validation

- 438 unit tests passed with serial execution. Steam backend operations and their confirmation behavior are unchanged.
- 25 targeted hidden UI checks passed: active/queued/paused states, action dispatch, polling continuity and focus, scoped overflow menus, storage controls, empty-to-populated queues, connection warnings, Desktop and Controller modes, and narrow/wide layouts in Orbit, Cloud, and Rose themes.
- The previous 33 hidden popup/copy checks passed again against this redesign.
- Inspected active and queued download screenshots, a 420-pixel popup, and the light-theme Storage tab. Portrait thumbnails remain contained instead of being stretched into landscape artwork.
- Added packaged regressions for the single branded header, active download state/percentage/action, and accessible overflow menu. The earlier panel test now verifies the compact active card rather than the removed oversized banner.

- All 358 packaged regression checks passed; the process exited with code 0. The background guard recorded zero shown/focused windows and blocked six attempted window actions in existing tests.
- All 210 shipped source/resource files, package metadata, and native resources matched the current source. A disconnected native Discord helper probe passed without authentication.
- The preview installer built successfully with `runAfterFinish=false`. Installer SHA-256: `e1bca6c94bebb0d96e3d5b5a912741b54b5df3c2926234a74103c3a08afdf19f`.
- App archive SHA-256: `6b755108af221d4db76acc9dd5119219fa003917f1a39a6c6d071ffe89998a4e`.

## Evidence

- `work/steam-dev11-tests.log`
- `outputs/steam-menu-ui-check/report.json` and PNG captures
- `outputs/copy-ui-check/report.json`
- `outputs/steam-dev11-packaged/smoke-report.json`
- `outputs/steam-dev11-packaged/background-checks.json`
- `work/steam-dev11-smoke-exit.json`
- `work/steam-dev11-package-verification.json`
- `work/steam-dev11-final-build/win-unpacked/`
- `work/steam-dev11-installer/Orbit-Setup.exe`

## Isolation and release status

Checks use isolated profiles and hidden/offscreen windows. No live Steam connection was enabled or restarted; no real download, installed game, account authorization, saved theme, or user preference was changed. The existing installed Orbit session is left running. Native game/focus checks were not performed.

The preview installer is configured not to reopen Orbit after installation. It is prepared for review without installing over the user's running session. No release was published, and final 0.2.6 installer/upgrade and provider-availability gates remain in the existing draft checklist.
