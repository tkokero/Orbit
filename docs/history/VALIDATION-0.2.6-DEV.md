# Orbit 0.2.6 development validation

Build: **0.2.6-dev.1**. The user authorized replacing the installed app after validation. The development build is now installed, and Orbit was left closed. No release was published.

## Changes

- Game news retains BBCode, HTML, and plain web links. Links dispatch through a validated cached-article index, and open in the default browser. Image references support Steam BBCode, HTML photos, and linked images; viewport loading watches image figures rather than empty image elements. Failed photos have a readable fallback, and cached article photos can be requested offline.
- Library context menus use themed renderer popovers, keyboard navigation, viewport bounds, and checked collection membership. They emphasize secondary actions instead of repeating Play, Details, and Favorite. Menus opened from modal dialogs remain inside the modal's interaction scope.
- Custom banners render at 1240 × 400 and use the same 3.1:1 display footprint as regular Desktop banners. Existing artwork files and crop choices are preserved. The editor has separate cover/banner previews and properly spaced crop controls, without a duplicate decorative banner.
- Steam has Downloads, Storage, and Connection sections, supported Steam-client actions when disconnected, queue actions in the themed menu, and stable controls during progress updates. The experimental connection is optional and is not enabled by opening the page. Existing confirmation and running-game guards remain in place.
- Windows startup uses a stable registration name, verifies approval status, persists the preference, can repair a stale executable path, and does not override an existing Windows-disabled registration. Duplicate login invocations do not bring Orbit forward. Settings explain tray startup next to the startup switch.

## Evidence

- **379 unit checks passed:** `../../../work/desktop026-all-tests.log`.
- **25 targeted UI checks passed:** `../../desktop026-ui-check/report.json`. The actual UI was exercised with isolated fixtures in offscreen windows, including links, photos, nested menus, queue actions, stable polling controls, move confirmation, artwork ratios, reduced motion, Controller reader styling, and 940/1920-pixel Dark/Cloud layouts. No renderer errors were logged; no windows were shown or focused.
- **338 packaged regression checks passed:** `../../desktop026-packaged-final/smoke-report.json`. This includes the updated Steam fallback check and development-version release notes. The final startup-note grouping refinement was then covered by the targeted UI suite and included in the final package sync.
- Packaged native-window protection: `../../desktop026-packaged-final/background-checks.json`; zero shown, focused, visible, or currently focused windows. Six attempted native activation calls were blocked by the validation guard.
- Packaged source verification: `../../../work/desktop026-package-verification.json`. Source files, bundled assets, required user documentation, and package version/entry point/dependencies are compared against the local archive.
- Windows startup registration was backed up and re-registered for the installed 0.2.5 executable, then read back through Electron's native API: `../../../work/startup-native-repair.json`. It is registered and enabled under `io.github.tkokero.orbit`; no window was created and the installed app was not restarted. Registry backup: `../../../work/startup-registry-backup-20261024.json`.

## Installation

- The silent installer completed successfully with automatic reopening disabled. The installed archive matches the validated candidate SHA-256 exactly: `2bc5cedad662fd4c3e95ed25e3958bb13d931dff4d86ad067b39e7c8edf8b8ec`.
- Receipt: `../../../work/desktop026-install.json`; preservation checks: `../../../work/desktop026-preservation-verification.json`.
- Both Orbit and Orbit-Dev retain unchanged interface settings, native settings, per-game preferences, and all seven custom theme records per profile. All 17 managed artwork files in Orbit also match their backup bytes.
- Settings backup: `../../../work/user-settings-install-026dev-20261024-050521`.
- The Windows startup command still points to the installed Orbit executable. No installed Orbit processes were reopened after replacement.

## Remaining real-world checks

- A future Windows sign-in must confirm actual login launching. Start minimized is currently enabled in the user's existing profile, so startup is configured to use the tray. That preference was preserved.
- No real Steam restart, download mutation, installation move, or uninstall was performed during validation. The redesigned UI uses isolated fixtures; the existing guarded native integration remains opt-in.
- No new physical-controller or native focus/game-launch playtest was performed during this work.

The proposed card layouts, sizing controls, pinned collections, multi-selection, bulk editing, and per-display popup positions remain roadmap work, not implemented features of this candidate. See [the 0.2.6 proposal](ROADMAP-0.2.6.md).
