# Release-notes layout validation

## 0.2.6-dev.7

The notes popup reused `release-list`, a calendar agenda class with a fixed inner scroll area and a decorative empty-state star. A shared tall popup preset then left a large unused area beneath that inner list.

- Release notes now have a separate document/list class and a content-height dialog, with the configured popup height acting as its maximum. Long notes scroll in the main dialog body only.
- Text is larger and uses theme colors, with a compact build-version badge. Repeated development-build entries were consolidated into eight user-visible feature summaries.
- The calendar's empty-state rules are explicitly scoped to its agenda. Its original display remains covered by the UI check.
- The saved `menu-release-notes` sizing key is retained. Width and height limits still use the existing shared/separate popup model; dragging the natural-height reader adjusts the height limit without resetting the common preset to its smaller content height.
- Modal class changes are cleared when opening other menus. Tests verify that release-reader styles do not carry into Settings.

## Checks

- 15 hidden UI checks passed: dedicated class and saved sizing key, no calendar illustration, natural height under a tall shared preset, no inner list scroller, resize grip, 1440/860/600 pixel layouts and three themes, shared-height resize stability, Settings isolation, long notes, escaped text/available notes, Controller typography, and calendar isolation. The final fixture window recorded zero show/focus events.
- All 425 unit tests passed in a serial run. An unchanged Discord fake-IPC timing test failed during the initial parallel run alongside UI validation; its isolated 12-test file and the complete serial suite passed. No production Discord behavior was changed for this correction.


## Installed result

- All 340 packaged regressions passed. The final offscreen window recorded zero shown/focused events.
- All 202 shipped source/resource files matched the candidate; the packaged no-account native probe passed. Silent installer exited 0 and verified installed archive/native resources against the tested package.
- Installed app.asar SHA-256: be67d85c359d0f13e0deb41c8f7e89803f51e196c888648a883101f85ea086eb.
- Both profiles retain interface/native/per-game preferences and seven custom themes each. Orbit's 17 managed artwork files and its encrypted Discord connection were preserved. No new authorization was requested. Orbit was left closed; nothing was published.
- Receipts: ../../../work/friends-dev7-install.json, ../../../work/friends-dev7-preservation-verification.json, ../../../work/friends-dev7-credentials-preserved.json. Backup: ../../../work/user-settings-install-friends-dev7-20261024-180711.
