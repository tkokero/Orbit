# Restart Orbit in the tray menu

Local 0.2.6 candidate, October 26, 2026. Unpublished.

Restart Orbit sits immediately above Quit Orbit in the existing tray action group, with a themed circular-arrow icon. Both the custom Windows tray menu and the native fallback use the same action. Keyboard navigation and short-display scrolling continue to use the shared tray renderer.

A manual restart first checks that Orbit has no active file operation, installer download, or recording. It waits for saved preferences/library writes, checkpoints playtime, and writes the existing session-resume handoff. It schedules a full process relaunch and uses normal graceful shutdown rather than quitting to the tray. Running games are not terminated. Duplicate requests share a single pending restart; save or relaunch errors keep Orbit open and show a useful error. The relaunched process returns to Desktop mode without repeating a startup/background/game-launch command. This also applies the saved taskbar theme at startup.

Tests cover action grouping, save-before-exit ordering, duplicate clicks, busy/save/relaunch failures, and clean packaged/development relaunch arguments. Hidden themed renderer checks cover the new icon/action, four theme palettes, keyboard navigation, clipping controls, and short displays. A real user-window relaunch is not invoked during routine validation.

## Results

- 492 unit tests passed; one explicitly opt-in native-window fixture skipped.
- 358 hidden packaged checks passed, with the hidden/unfocused window guard passing.
- Ten tray renderer checks passed. The Roseberry screenshot was reviewed for grouping, icon clarity, spacing, and fit.
- An isolated native Electron fixture saved its state, completed asynchronous graceful shutdown, released its single-instance lock, and relaunched as a different process. It created zero windows and did not use the user's profile or restart the normal Orbit instance as a test.
- Packaged verification matched 226 resources and the unpacked native helper. Quiet installation completed with archive SHA-256 `d81a824695a622b8c81d1a43b1b961e4188af3639dccaa0fca3f3b05b9514b9b`.
- Both normal and dev profiles matched their immediate pre-install settings/theme/artwork backups (ten and seven custom themes respectively). Existing encrypted connection bytes were unchanged by installation. The latest running-profile interface/native choices and 17 managed files also matched, allowing additional previously retained custom themes.

The previously documented file-view discrepancy still exists for a remembered connection: the live-process backup differed from the external file view before installation. No connection was replaced, restored, authorized, or used for a sign-in check in this pass. The current file view was compared before/after installation and remained unchanged. That is preservation evidence, not a new authentication test.

The initial rebuild attempt encountered an isolated running validation process holding a packaged DLL. The outdated run completed and the final package was rebuilt and revalidated afterward; only final receipts are release gates. A work-only tray UI script initially had an invalid insertion and was corrected before its passing run.

Receipts: `work/tray-restart-026-ready.json`, `outputs/tray-restart-ui-check/report.json`, `work/tray-restart-native-fixture/report.json`, and `work/tray-restart-026-install.json`. Local build installed; release remains unpublished. The user's actual tray-click/visible relaunch is not asserted as playtested.
