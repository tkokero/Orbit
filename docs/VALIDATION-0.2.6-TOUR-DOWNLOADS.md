# Tour and Downloads follow-up — October 25, 2026

The user's screenshot showed an empty Downloads page behind Steam Storage. A hidden fixture reproduced the failure before the fix: opening the sidebar Steam utility changed the workspace to Library, detached the Downloads DOM and hid the workspace page. The baseline is retained in `work/tour-downloads-baseline.log`.

## Corrections

- Steam's utility button has a dedicated brand attribute, rather than pretending to be a game-platform filter. Sidebar navigation is scoped to the actual library navigation controls. Its Steam logo is preserved.
- Downloads retains its existing DOM, cards and filter controls across the Steam popup and workspace changes. Leaving the page stops its polling timer and releases observed icons; returning refreshes the retained view instead of rebuilding it. The legacy Downloads entry opens the same dedicated workspace, avoiding duplicate download centers.
- The Desktop tour has 23 short steps covering library controls, layouts, bulk selection, game options, Downloads, Steam, completed downloads, Radar, wishlist, offers, Friends, tools, activity, storage and settings. Targets are resolved after their workspace opens, including controls created later in startup.
- Closing the guide restores the original workspace, library filters, selection, scroll and keyboard focus. It does not launch games, authorize accounts, change themes or perform download/storage actions.
- Tour placement batches geometry reads before writes, coalesces scroll/resize updates into one animation frame and observes changing target/card sizes. Explanations update immediately without a fade-out delay. All motion and observers stop on close; reduced motion remains supported.
- Tour text uses shared theme colors and readable type, with viewport-constrained cards and reachable actions at narrow widths and display scaling.

## Validation

Validation uses isolated profiles and service stubs, with protected offscreen BrowserWindows. The normal Orbit session, accounts, games, downloads and Windows startup registration are not manipulated.

- 450 unit tests passed. The existing native-window fixture remains opt-in and skipped.
- 41 targeted hidden UI checks passed, with no renderer errors and zero shown/focused windows. They cover the original Steam-sidebar failure, retained Downloads state, idle polling, all 23 guide steps, real Activity/Storage targets, restoring filters/selection/focus, newer navigation winning over guide restoration, themes, narrow windows and 125% scaling.
- Closing the guide no longer lets an unfinished restoration overwrite a newer page choice. The original focus/selection snapshot is released after the guide closes.
- An initial packaged run flagged toolbar geometry. Diagnostics showed both measured controls were hidden, rather than overlapping. The flow check now waits for guide restoration and explicitly establishes Desktop mode before measuring the Desktop toolbar. Follow-up diagnostics found the underlying cause: the CSS toolbar rule matched any Downloads host, including the new cached hidden host. It now matches only a visible Downloads host, and a targeted check verifies that Library actions return. Geometry remains recorded for review.

Evidence includes `outputs/tour-downloads-ui-check/report.json`, its screenshots, `work/tour-026-tests.log`, and `work/tour-026-ready.json`. Final package and installer results are recorded in the ready receipt. The existing native Roblox tray-window and actual launch/focus playtests remain outstanding; this pass does not claim them as completed. The 0.2.6 release remains unpublished and the candidate is not automatically installed.

## Final packaged candidate

- All 358 packaged checks passed with exit code 0 in `outputs/tour-026-release-check`. The background guard recorded no shown/focused windows and blocked six existing native-window requests.
- All 214 shipped source/resource files and native resources matched. The disconnected production-native probe passed without authorization.
- Final installer: `work/tour-026-installer/Orbit-Setup.exe`, built with runAfterFinish enabled. It was not installed, uploaded or published.
- Installer SHA-256: `29e56997a5d5d1d6aadffb5884ea897eabe4345ef8db48aa2adc18592aa06ac7`.
- App archive SHA-256: `484d1343a6a559808268006a7cc24328653b838ac29e9cd60c1aa4e1f36588c1`.
