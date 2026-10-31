# Desktop 0.2.7 development

This work is in the local **0.2.7-dev.3** build. It is not a published release. The published 0.2.6 files and updater feed are unchanged.

## Implemented

- **Search Orbit:** games, tools, manual and smart collections, selected settings, and actions. Enter opens a result; Shift+Enter launches a selected game. Hidden entries stay excluded.
- **Keyboard shortcuts:** change Search, Quick launch, Add game, and Refresh while Orbit is focused. Duplicate and reserved bindings are rejected. Existing editing and selection controls remain available.
- **Launch options:** optional named executable targets, literal arguments, starting folders, existing store launch modes, supporting tools, and optional SteamVR preparation. No options are created automatically. The Default launch remains separate; removing the selected alternate returns to Default.
- **Launch recovery:** focused explanations for missing executables, unavailable folders, permission problems, outdated launch modes, and SteamVR startup. Locate repairs the selected custom target rather than silently changing another copy.
- **Popup positions:** drag a Desktop header or use its Move control with arrows; Home centers. Positions are scoped to the native display, bounded, and restored within the current viewport. Existing corner resizing and shared/separate sizes remain intact.
- **Context-menu keyboard access:** type to select an action, use arrows for groups, and Escape to restore the previous focus. Search game results use the existing relevant game actions.
- **SteamVR:** find its installed Tool, check the runtime process, start it, or opt into preparing it before a game. No headset connection, automatic VR mode selection, or full SteamVR SDK integration is claimed.

Earlier 0.2.7 work is retained: upgraded Void, and detection of launcher-linked Arknights: Endfield. An alternate bootstrap such as SKSE retains detection of the real game and is not itself counted as that game.

## Validation

- Unit suite: **540 passed, 0 failed, 2 native opt-in tests skipped**. Log: `work/desktop-027-tests-final.log` in the task workspace.
- Source UI: synthetic games and files in a fresh profile. `outputs/desktop-027-ui6/desktop-tools-report.json` records shortcut changes, real form/IPC saves, launch resolution without executing a game, popup movement, retained size, picker stability, context focus, recovery, SteamVR scope, and 800px/125% layouts.
- Hidden-window guards record zero windows shown or focused. Automated checks do not alter real downloads, accounts, games, or credentials.
- Earlier source checks exposed an injected banner in the utility editor, inaccessible Save actions at higher scaling, an outdated accessibility shortcut guide, and a stale/churning hero picker. These were repaired. The synthetic UI fixture also needed to complete its own onboarding before checking focus; that was a test setup issue.
- Packaged regression: **358 passed**. The last two visual changes only set the SteamVR action icons and group its buttons. An archive comparison confirmed those exact changes and no program-logic change; **all 23 focused UI checks passed on the installed candidate**. Receipt: `work/desktop-027-final-validation.json`.
- Installed quietly with installer exit code 0. The installed ASAR and unpacked resources match the candidate; three checks loaded the actual installed modules. VRChat PID 21048 remained running. Orbit reopened with `--background`, PID 29484, and no main window handle. Nothing was published.
- Both normal and dev preferences passed the normal loader and retained their UI, library-choice, artwork/media, and remembered-connection hashes. Normal remains Roseberry with three custom themes and Big Bang; dev remains Dark with seven custom themes. The strict connection comparison was recorded after the background reopen and still matched the pre-install bytes. Backups: `work/desktop-027-preservation`. Combined receipt: `work/desktop-027-ready.json`.

Native SteamVR launches, headset behavior, external game launches through custom targets, real multi-display movement, and interactive controller behavior are **not playtested by this pass**. Controller Home and Library layouts are unchanged.

## Performance

Search builds its index only when used, caches it while open, precomputes normalized labels, ranks into bounded buckets, renders at most 24 results, and coalesces typing with a short interruptible delay. Closing or hiding Search releases its index and pending work. Launch-option caching is bounded to 32 games. SteamVR is checked on demand and has no new periodic renderer poll. Popup resize observers disconnect when dialogs close.

A synthetic 20,000-entry model benchmark recorded a 13.936ms index build, query medians of 0.515–0.940ms, and 95th percentiles of 0.566–1.263ms. This excludes DOM rendering, startup, and native process calls. No overall CPU/RAM reduction or speedup percentage is claimed.

## Remaining scope

Collect daily-use feedback before release planning. Keep clipping as the 0.3.0 headline. Native playtests should be explicitly agreed, and a dev installation does not authorize publication.
