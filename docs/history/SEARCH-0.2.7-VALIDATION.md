# Search popup repair — 0.2.7-dev.4

The reported Roseberry Search popup could hide its input after scrolling and leave a large unused area below its results.

## Cause and change

The saved fixed height expanded the outer popup while the inner body kept a separate 500px cap. The input, results, and count shared that scrolling body. Keyboard navigation or focusing a later result could scroll the input out of sight.

Search now uses a fixed header, fixed input, scrollable results, and a fixed result-count footer. The results fill the available area of a resized popup. Default popups remain compact; explicit saved sizes remain saved. A new query resets the results to the top. Singular result counts are corrected.

## Evidence

- Reproduced the failure in an isolated synthetic profile using separate popup sizes, Search width 98%, and fixed height 139%, matching the relevant saved sizing. Three layout assertions failed before the repair.
- All six focused layout checks passed in the packaged repair, including 24 actual scrolling results, later-result focus, editing after scrolling, and an 800px window at 125% scaling.
- All 23 Desktop feature checks passed on the packaged repair.
- Unit suite: 540 passed, 0 failed, 2 explicitly opt-in native checks skipped.
- Hidden-window guards for both packaged checks: zero windows shown or focused.
- Installer, installed-file verification, game-process continuity, and normal/dev preference preservation are recorded separately under `work/search-layout-*` in the task workspace. Those receipts determine installation status.

No real games, downloads, account authorizations, or saved credentials were manipulated for the UI tests. No public release was published.
