# Full startup restart and matched Windows icons

Local 0.2.6 candidate, October 26, 2026. Unpublished.

The user clarified that Restart Orbit must include the normal startup sequence. The previous implementation created a new process but incorrectly used the update-resume path, which suppresses the intro.

The tray action now uses a dedicated `--restart-orbit` launch argument. It still checkpoints and resumes tracked sessions, saves preferences, and shuts down gracefully. Its new process opens Desktop mode through normal startup, without the renderer's resume/quickstart shortcut. The selected startup scene/video, sound settings, intro toggle, and reduced-motion preferences retain their normal behavior. Restoring an unloaded tray renderer still skips the intro; automatic update behavior is unchanged.

Both Windows shell icons now use the same startup icon image until a full restart. Previously the tray image continued changing live while the taskbar kept its startup image, creating the reported mismatch. In-app theme and tray-menu colors remain immediate. The Appearance note and project preferences describe this behavior.

Validation includes restart/session-handoff tests, matching icon source tests across repeated theme changes, and a hidden native two-process fixture that runs the real startup-scene/boot scripts with a selected scene after relaunch. The real user's visible taskbar is not manipulated during validation; no immediate Explorer refresh is claimed.

## Results and installation

- 492 unit tests passed; one explicitly opt-in visible-window fixture skipped.
- 358 hidden packaged checks passed using the new restart argument, with the hidden/unfocused window guard passing.
- The isolated native relaunch fixture resumed its handoff in a different process, played the selected Startrail scene without the resume/quickstart shortcut, and waited for the actual boot scene and exit to finish. Its hidden native-image check confirmed identical window/ICO artwork and the matching resized tray pixels after a live theme change; menu colors still followed the new theme. Zero show/focus calls occurred. The first work-only harness returned a non-cloneable function from an injected setup script; that harness result was corrected before the passing run.
- 226 packaged resources and the native helper matched. Quiet installation completed with archive SHA-256 `8b9fe384b0d14c929482c1b21023d7d9b9fa98704eb52542f0218576848cf356`. Nothing was published.

## Preference correction

The latest running-profile backup had Dark selected and three current custom themes. An older external file view had Roseberry selected and ten combined themes. The previous repair had incorrectly merged older theme snapshots: its 4,905,620-character theme value exceeded the existing 4 MiB per-setting limit and would be omitted by the normal loader. Its earlier raw-file comparison was insufficient to establish loadable preservation. This was a repair mistake, not evidence that the new restart implementation erased themes.

After installation, the latest running interface preferences were restored exactly, within the existing storage budget, with Dark selected and the same three current custom themes. All ten older theme records were exported separately, and the complete pre-repair file and backup were retained under `work/full-restart-026-before-ui-repair`. A read through the normal `UiPreferences` loader then matched every latest saved value. The seven-theme dev profile was unchanged. Native/library preferences and 17 managed artwork/startup files matched the latest running-profile backup. No credentials were replaced or authorized; their current file view remained unchanged through installation. The previously documented preexisting connection/file-view discrepancy is not claimed as an authentication pass.

Receipts: `work/full-restart-026-ready.json`, `work/full-restart-native-fixture/report.json`, `work/full-restart-026-install.json`, `work/full-restart-026-ui-repair.json`, and `work/full-restart-026-latest-profile-verification.json`. The user's visible Windows taskbar after reopening is not asserted as playtested.
