# Theme icons on restart

October 26, 2026. Local 0.2.6 candidate; unpublished.

The user explicitly chose restart-based Windows taskbar theme changes after repeated live refresh attempts failed. This replaces the earlier immediate-update requirement.

Windows window/taskbar artwork is latched from the saved theme at process startup. It is retained when the renderer is recreated after tray unloading. The in-app theme, tray icon, and tray menu colors still update immediately. The matching pinned shortcut is updated once during startup; theme changes during the session do not cycle taskbar registration or repeatedly rewrite the shortcut. Startup theme preparation completes before constructing the main window.

The generated resource cache remains bounded to four palettes while retaining both the current tray artwork and the startup window artwork. The helper no longer contains taskbar DeleteTab/AddTab or activation methods. Existing shortcut identity, arguments, target, and pin are preserved. A short Appearance note explains that taskbar changes require restarting Orbit. The project preferences record the new user direction.

Regression tests cover repeated theme changes, a new process loading the latest saved palette, tray renderer recreation, startup-resource retention across cache eviction, shortcut identity preservation/rollback, and the absence of native taskbar regrouping. Validation results and installation receipts are recorded below when complete. A visible Windows restart/pin repaint is not exercised while a game is running.

## Results and local installation

- 484 unit tests passed; one explicitly opt-in native fixture was skipped.
- 358 hidden packaged checks passed, with the no-visible/no-focus guard passing.
- 225 packaged source/resources and unpacked native helper matched; the installed archive SHA-256 is `95c0e037a4aa17afd38cd6937f9bd4ad4b9026e4caf2830f8db05e0ed36ecd2d`.
- Quiet local installation completed October 26. Nothing was published.

The extra live-profile preservation check exposed a discrepancy that the earlier external normal/dev backup comparisons missed: a background relaunch loaded older interface choices. Before installation, an additional backup had been copied directly from the user's running Orbit. Recovery used that latest running-profile backup for user-owned choices and retained older custom themes as well, resulting in ten custom themes with Roseberry selected. It also retained the latest confirmed profile links, layout/popup/startup preferences, managed artwork, and remembered Discord connection. Before-recovery files were separately backed up. The dev profile was unchanged.

A subsequent hidden launch of the installed package passed the comparison against the latest running-profile settings, library preference fields, encrypted connection, and 17 managed artwork/startup files. Its window remained invisible and unfocused. That verification instance was then closed gracefully and the temporary diagnostic port was closed. The cause of the earlier file-view discrepancy has not been established; the failed comparison is not represented as an original preservation pass.

Receipts: `work/taskbar-restart-026-ready.json`, `work/taskbar-restart-026-settings-recovery.json`, and `work/taskbar-restart-026-live-preservation-final.json`. Actual Explorer repaint after a visible full restart remains a user check; no immediate-update claim is made.

Later correction: the ten-theme union described above exceeded the normal loader's per-setting budget. The latest running profile was subsequently restored without merging archival themes into it, and the older records were retained as separate exports. See `VALIDATION-FULL-RESTART-0.2.6.md`; do not treat the original ten-theme raw-file count as proof of a loadable live profile.
