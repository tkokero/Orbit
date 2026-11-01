# Tray menu, live taskbar icons and Windows startup

October 26, 2026. Local 0.2.6 candidate; unpublished.

## Changes

- Windows tray right-click uses a compact Orbit menu with the active theme, rounded controls, real action icons, keyboard navigation and Escape/blur dismissal. Open and Quit remain available; active clipping exposes Save and Stop with the existing callbacks and saving gate. Non-Windows builds retain their native menu.
- The tray popup is created only for an explicit right-click and destroyed when dismissed. It does not create a persistent renderer, reopen the main window merely to show a menu, or appear in the taskbar. Bounds are clamped to the relevant display's work area. IPC accepts only the popup's own main frame and enabled, known actions. The menu is painted before it is shown.
- Theme changes start icon work before waiting for preferences to finish writing. The existing settings write and error handling remain awaited. Running-window relaunch identity is complete and its icon is reapplied after the pinned shortcut refresh. No regrouping, Explorer restart, global cache deletion, or unpin/repin is used.
- A small packaged shell helper refreshes the prior icon image-cache entry and requests a flushed update of the matching shortcut. It replaces per-update PowerShell/C# compilation. Only matching Orbit pins are updated; original shortcut backups and identity checks remain intact.
- Windows login no longer passes the quick-start flag that suppressed startup animations. The selected scene/video, sound, disabled-intro choice and reduced-motion preferences remain respected. Renderer restoration and explicit background starts still skip replaying the intro.
- Independent calendar, artwork, download-history, remembered Steam connection and activity-history reads start together. Recovery warnings and failures retain their prior behavior, and readiness still waits for the required data. This removes sequential waits; actual sign-in-to-window improvement has not been benchmarked.

## Checks and limits

- Full unit suite: 480 passed, zero failed, one explicitly opt-in native fixture skipped. Includes tray display bounds, validated actions, first-frame readiness, renderer release, theme repaint ordering, and startup intro policy.
- Eight hidden menu checks passed across Orbit, Rose, Cloud and Dark, including keyboard actions, dismissal, clipping controls and viewport fit. Wide/light/dark menu screenshots were inspected.
- The offscreen screenshot fixture initially returned an Electron `UnknownVizError` for a transparent offscreen surface. Reran the renderer fixture with an opaque capture backing; product transparency remains unchanged. That fixture does not claim to verify native transparent-window composition.
- Native shell refresh passed on an isolated temporary shortcut with a temporary icon resource: 842 ms in that run, no windows created, real taskbar pins untouched. This is one helper measurement, not a user-visible taskbar latency or overall startup benchmark.
- Actual Explorer repaint and real Windows sign-in timing remain user playtests. Routine checks do not focus Orbit or interrupt a game.
- Package, quiet-install and preservation receipts are under `work/tray-startup-026-*`; UI output is under `outputs/tray-startup-ui-check`.

Build the shell helper with `scripts/build-shell-helper.ps1` after editing `src/native/shell/OrbitShell.cs`. The packaged helper is unpacked beside the existing native resources; installation verifies its exact hash.

## Installed result

358 hidden packaged regression checks passed using an isolated fresh profile with `--startup`. Resource verification matched 223 files, including the unpacked shell helper. Quiet installation completed October 26 without reopening or focusing Orbit. Both normal and dev profiles retained all checked settings and seven custom themes each; all 17 normal-profile managed files and one encrypted Discord connection were preserved. The build remains unpublished. Real Explorer repaint and login timing remain unperformed playtests.
