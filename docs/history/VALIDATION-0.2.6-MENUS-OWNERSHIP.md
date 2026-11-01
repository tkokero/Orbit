# 0.2.6 menu and ownership follow-up

Checked October 25, 2026. This is the latest local candidate; it remains unpublished and has not replaced the running installation.

## Corrections

- More now has three readable, themed actions with specific Refresh, gamepad, and keyboard symbols. Redundant headings are removed. Width and height are constrained to the viewport. Arrow keys follow action order; Home/End reach the endpoints; Escape restores the trigger.
- Swap Confirm and Back uses one compact themed row and a native switch. Label clicks and Space toggle the original form field; saving still uses the existing binding configuration.
- Steam local play history no longer creates an entry when ownership is unverified, including old cached records. Its statistics can enrich the same provider/record ID when an independent installed, account, manual, or import record exists. A title match alone is insufficient. History cannot replace the authoritative identity or installation fields. The raw history, preferences, themes, and artwork are retained.
- Catalog status now describes history as statistics instead of implying an owned library.

## Validation

- 456 unit tests passed, zero failed; one native-window fixture intentionally skipped. Six new ownership tests cover history-only exclusion, cached records, installed/account enrichment, explicit additions, and mismatched provider/ID cases.
- 18 focused hidden UI checks passed: menu structure/icons, narrow and wide layout at 100/125/150% page zoom, dark/light/Roseberry themes, keyboard order/dismissal, shortcut action, switch alignment/input, a confirmed entry's statistics panel, and preserved Controller Home.
- 41 hidden guide/Downloads regression checks passed after these changes.
- 357 packaged checks passed. The previous package ran 358: its conditional lazy-statistics check was not entered this time because the fresh-profile library had no qualifying achievement/playtime entry after unverified history was removed. The confirmed-entry fixture covers that panel separately; the missing conditional case is not counted as a package pass.
- 214 shipped source/resource files matched the package, with no mismatches. The disconnected production Discord helper probe passed without account authorization.
- Guards recorded zero shown/focused windows. Six attempted native window changes in the packaged regression were blocked. No real downloads, installations, account credentials, or profile settings were mutated.

## Candidate and evidence

- Installer: `work/menu-ownership-026-installer/Orbit-Setup.exe`
- Unpacked application: `work/menu-ownership-026-build/win-unpacked/`
- Receipt: `work/menu-ownership-026-ready.json`
- Unit log: `work/menu-ownership-026-tests.log`
- Focused UI report and screenshots: `outputs/menu-ownership-ui-check/`
- Guide/Downloads report: `outputs/tour-downloads-ui-check/report.json`
- Packaged report: `outputs/menu-ownership-026-packaged/smoke-report.json`
- Guard report: `outputs/menu-ownership-026-packaged/background-checks.json`
- Resource verification: `work/menu-ownership-026-package-verification.json`

Installer SHA-256: `9e7d518b8712759126e107fbd4528b8934a8783ecf88c9c29d5c832d563ca2c0`.

Application archive SHA-256: `aa7eb6889c5f5c20af9d6c4cff9695281e4a0f2e9f4534d2eeabcd037f2672a8`.

The existing Roblox native tray/window fixture remains unvalidated and opt-in. No native game-handoff, Windows login, or installer foreground check was repeated. Earlier user playtest evidence remains recorded in the candidate document. Nothing was uploaded, pushed, published, or installed during this follow-up.

## Illustrated history

`outputs/Orbit-history/Orbit-history-0.1-to-0.2.6.md` and its self-contained HTML edition reconstruct this chat's early release history, including the recorded 0.1 rename and locally used 0.2.4 prereleases. Ten original reference captures are included with captions and a provenance/hash manifest. Retained measurements are scoped to their original workloads; no cumulative or whole-app gain is invented.
