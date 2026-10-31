# 0.2.6 UI follow-up — October 25, 2026

The user supplied screenshots while checking the app. This pass addresses those specific screens and keeps the release unpublished. The installed session is not replaced.

## Changes

- Setup preferences use labelled, theme-aware switches, readable text and a theme selector that includes the active saved custom theme. Tray help is a separate control. A failed save restores the previous switch state.
- Take a tour has a visible Recommended badge with an accessible description. The setup header and action footer stay reachable while the content scrolls; the popup remains compact and resizable.
- Other library connections use launcher symbols and readable status cards. Existing connection statuses remain accurate; no provider is presented as authorized or connected merely because it has local data.
- Steam Storage shows drive names, actual folder paths, default-library identity, free capacity and used-space meters. The existing read-only capacity API is called once when Storage is opened, with a graceful unavailable state. Game moves retain the review step; limits still require Apply.
- Completed downloads use compact artwork cards with nearby source/date information and open the matching game's details. Clear history sits beside its heading. Polling retains existing history nodes when the history has not changed.
- Radar uses equal-width calendar/agenda and wishlist/deals columns; the calendar and agenda have equal heights. Narrow windows stack the panels. Source and date-change information remains visible; longer explanations are available through Help.
- Collections keeps one clear selector, Manage, and a short Pin action with a full accessible label. The redundant leading caption is removed.
- The controller Friends feed uses shared Online/DND filtering and ordering, excluding Away, offline and stale entries by default. All friends is an explicit local toggle. Cards use provider symbols, cached avatars with initials as fallback, clearer names and compact presence. Other Controller Home and Library layouts are unchanged.

## Validation

- 450 unit tests passed; the existing native-window fixture remains opt-in and skipped.
- 24 targeted hidden UI checks passed, with no renderer errors and no shown/focused BrowserWindows in the successful run. Cases cover theme/custom-theme preservation, setup saves and rollback, help separation, narrow layouts, 125% display scaling, storage capacity, explicit actions, history navigation, balanced Radar panels, and Friends presence policy.
- Screenshots were inspected for setup, library connections, Storage, completed downloads, Radar and the controller Friends feed. The fixtures use isolated data and account/service stubs; they do not change real downloads, installations, settings, accounts or Windows startup registration.
- The native launch/focus and Roblox tray-window playtests remain outstanding from the previous candidate. This visual pass does not claim those as completed.

Evidence: `outputs/settings-polish-ui-check/report.json`, `work/settings-polish-ui.log`, and `work/settings-polish-026-tests.log`. Package and installer results are recorded in `work/ui-polish-026-ready.json` after the final build checks.

## Packaged candidate

- All 358 packaged checks passed with exit code 0. The background guard recorded no shown/focused windows and blocked six existing native-window requests.
- All 213 source/resource files and native resources matched. The disconnected production-native probe passed without authorization.
- The 36 hidden Steam regression checks passed again, including queue controls, polling, focus, recovery, themes and scaling.
- Built `work/ui-polish-026-installer/Orbit-Setup.exe` with runAfterFinish enabled. It was not installed or uploaded; release publication remains unapproved.

Installer SHA-256: `05c30cd97b85f595a63c11fbb14e4bff537e40f1eabb508ff45164847ef2ab7e`.

App archive SHA-256: `6d659568067a1e7eefdab614e6bebc19709e41ec3b173059b94b3d1657145ec3`.
