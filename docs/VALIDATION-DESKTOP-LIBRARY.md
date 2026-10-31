# Desktop library organization — 0.2.6-dev.8

Validated on Windows on October 24, 2026. This is a local development build, not a published release.

## Delivered

- Covers, landscape banners, and List in the existing View menu. Desktop card size and spacing persist in the interface profile and are included in settings backups.
- Landscape artwork loads on demand for nearby cards, with at most two new artwork requests in flight. Images retain their proportions; portrait fallbacks are contained. Controller Home and Library keep their existing artwork and layouts.
- Manual and smart collections can be pinned in the Desktop sidebar. Pins use the existing collection filter and disappear outside the library workspace.
- Select mode, Ctrl-click toggles, Shift-click ranges, keyboard Select all results, and selection counts. Selection carries across pages and is cleared or pruned when its results change.
- Bulk favorite/unfavorite, collection addition/removal, tag addition/removal, and hiding. These change only Orbit preferences, not game files or provider accounts.
- Native batch validation completes before any entry changes. Batches save once. Undo lasts five minutes, restores only the changed field, and rejects conflicting later edits or removed collections. Failed saves roll back in-memory changes; failed Undo can be retried.
- Context-appropriate shortcut help, responsive selection controls, and a narrow-sidebar label/count correction.

## Validation

- **433 unit tests passed** with serial test execution, including eight new tests for selection, preference normalization, batch atomicity, additive tag/collection semantics, save failures, Undo conflicts, serialization, and expiry.
- **34 offscreen UI checks passed** using isolated fixture data and the native batch model. Coverage includes all three layouts, pointer and keyboard selection, cross-page Select all, filter changes, bulk edits and Undo, pinned filtering, reopening persistence, portrait fallbacks, reduced motion, Controller/Desktop transitions, and 1440/860/600-pixel windows with Orbit, Cloud, and Roseberry themes.
- Screenshots were visually reviewed for the View menu, selected banners, narrow windows, and a light theme.
- **347 packaged regression checks passed**, including seven checks exercising the actual batch and Undo IPC handlers in an isolated smoke profile. Process exit code was 0.
- Native package verification matched **207 shipped source/resource files**, package metadata, and unpacked native resources. The disconnected Discord helper probe passed without requesting authentication.
- The Windows installer was built from the verified unpacked package with `runAfterFinish=false` and no publishing.

## Background execution and user data

All UI validation used offscreen, hidden BrowserWindows. The fixture run recorded zero shown or focused windows. The packaged regression also recorded zero shown or focused windows; its background guard blocked six attempted window actions in existing checks.

Tests used isolated profiles. The installed Orbit session was already running and was left running. This task prepared the installer without installing it, closing Orbit, opening a game, initiating account authorization, or changing the user's saved settings and themes.

## Evidence

- `work/library-dev8-tests.log`
- `outputs/library-qol-ui-check/report.json` and PNG captures
- `outputs/library-dev8-packaged/smoke-report.json`
- `outputs/library-dev8-packaged/background-checks.json`
- `work/library-dev8-smoke-exit.json`
- `work/library-dev8-package-verification.json`
- `work/library-dev8-build/win-unpacked/`
- `work/library-dev8-installer/Orbit-Setup.exe`

## Remaining roadmap items

Movable popup positions per display, unified search, named launch presets, configurable shortcuts, friend favorites, and download completion actions were not part of this implementation. Popup resizing remains available. These additions still need prioritization separately from this completed library pass.
