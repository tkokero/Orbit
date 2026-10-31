# Tray recent games and page shortcuts

October 26, 2026. Local 0.2.6 candidate; unpublished.

The Windows tray menu now groups up to five recent playable games above Open Orbit, Library, Downloads, Friends and Settings, followed by Quit. Active clipping retains its contextual Save/Stop actions. Hidden entries, tools, never-played entries, duplicates and entries with no playable route are excluded from the recent group. Cached game artwork is used when available; opening the menu does not fetch remote images or rescan installed games.

Open Orbit retains its resume behavior. Page shortcuts open the requested Desktop surface. Recent game commands wait for renderer readiness and use the existing `play` function, preserving remembered launch choices, launch-mode prompts, installation handling and errors. Hidden or removed games are rechecked at the renderer. User-requested navigation can skip an intro that is already playing; normal Windows startup continues to play its selected intro.

The menu has themed dividers, distinct page icons, readable targets and ellipsis for long names with the full name available as a tooltip. Separators are excluded from keyboard selection and command dispatch. Menu height accounts for dividers, clamps to the current display, and scrolls on short work areas. Changes to clipping state resize an open menu. A native fallback preserves access to Open/Quit if the custom menu cannot load.

## Validation

- Full unit suite: 482 passed, zero failed, one explicitly opt-in native fixture skipped.
- Nine hidden tray-renderer checks cover four themes, keyboard selection/dismissal, active clipping and scrolling to Quit on a short display. Reference images use real game names; no real games were launched.
- 103 hidden application checks include actual page navigation to Downloads/Friends/Settings and a recent-game action opening the existing launch-mode prompt without starting a game before a choice. Existing guide restoration, stable action placement and neutral popup-backdrop checks still pass.
- Native show/focus operations remain outside routine validation. Fixtures recorded zero shown/focused windows and use isolated data. No real account or download changes were used to test the feature.
- Packaged and installation receipts are under `work/tray-shortcuts-026-*`, with UI receipts under `outputs/tray-shortcuts-ui-check` and `outputs/tray-navigation-ui-check`.

The previously documented real Explorer repaint and Windows sign-in timing checks remain separate user playtests.

## Installed result

358 hidden packaged checks passed on an isolated fresh startup profile. 225 packaged resources matched source, including native helpers. Quiet installation completed October 26 without reopening/focusing Orbit. Both normal and dev profiles preserved checked settings and seven custom themes each; all 17 normal-profile managed files and the existing encrypted Discord connection were unchanged. Release remains unpublished.
