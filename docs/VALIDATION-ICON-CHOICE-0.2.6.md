# Independent app icon — 0.2.6

October 26, 2026. Local development candidate; publication remains unauthorized.

Final user acceptance, October 26: the user confirmed both the normal restart/icon/intro/saved-library check and the final installer upgrade check worked. This supersedes the pending user-playtest status below; it is user-reported evidence, not an additional automated or agent-observed native check. The current installer, portable and source archives are staged for the release draft. Publication still requires explicit approval.

Appearance now offers **App icon → Match theme**. The default follows the existing interface theme without writing a migration or changing saved choices. Turning it off reveals **Icon style**, with built-in and saved custom themes, plus a preview of the actual shared Orbit glyph. Turning matching back on retains the previous manual choice for later use.

A separate icon stores a small validated color snapshot rather than a photo or another copy of the whole theme. Editing or removing its original custom theme therefore does not change the chosen icon. The setting is mirrored through the normal native preference loader and included in exported preference backups.

The running Windows taskbar/tray artwork stays fixed until a full restart. In-app and tray-menu colors still follow the interface immediately. Native generation and the Appearance preview share the same SVG and palette logic. Matching mode reuses the already-computed interface palette; it does not parse photo themes a second time.

At startup, the selected icon is also assigned to Orbit-owned desktop and Start-menu shortcuts, in addition to existing taskbar pins. Only shortcuts targeting the same installed executable and matching app identity are eligible. Game shortcuts, other profiles, and other applications stay excluded. Original shortcut bytes are backed up; arguments, working directory, identity and notification metadata remain unchanged. This performs no window activation, Explorer restart, taskbar regrouping, or pin/unpin operation.

## Checks

- 498 automated tests passed; one explicitly opt-in native-window test skipped.
- 21 hidden UI checks passed, including manual selection, theme independence, reopening, switching back to a remembered choice, and fitting 1440, 800 at 125%, and 420 widths. No renderer errors or shown/focused windows.
- Native unit coverage verifies that manual colors survive custom-theme removal, backup/export and preference-file reload; interface changes do not regenerate a fixed icon; new icon choices latch on the next service startup.
- Shortcut tests cover desktop, Start-menu and taskbar paths, deduplication, preserved launch metadata, foreign targets, backups and repeat updates.
- The package/source comparison verified 229 resources and isolated native helper availability without connecting any account.
- The exact packaged app passed 358 checks with zero shown/focused windows; six attempted show/focus calls were blocked by the quiet-check guard.

## Local installation

Quiet installation completed with app archive SHA-256 `11d0ac4c1ca6479e27087d5663c83e54980b8f22898a7140a0b278acc015933d`; installer SHA-256 `ad1aaca953b128a8a2cd631660ff3c9dfc149ae8e8c1fa46a3a3f63137a43557`. The installed archive and unpacked native resources matched the validated package.

Backups preceded installation. Both native preference loaders retained every saved interface value: Roseberry and three current normal custom themes; seven separate dev custom themes; 17 managed media files. Saved encrypted connection bytes were unchanged. Unlike the prior pass, the latest observed and external profile views matched before installation and again after the quiet background relaunch; no profile repair or theme merge was needed. The new icon preference remains absent in existing profiles until changed by the user.

A read-only audit of the running installed app confirmed that its desktop, Start-menu and two taskbar shortcuts now all reference the same selected startup icon and app identity. This verifies metadata, not the physical Windows taskbar's cached painting. The app reopened in background and unloaded its renderer; no visible native check was performed.

The previous user's visible Windows taskbar/tray mismatch is **not declared fixed** by these hidden checks. Synchronizing every owned shortcut addresses the concrete metadata inconsistency found in the previous audit, but pinned taskbar painting still requires an agreed visible check. No new visible restart or game/account check is part of this pass.

Receipts and isolated screenshots: `work/icon-choice-026-*.json`, `work/icon-choice-026-tests.log`, `outputs/icon-choice-ui/report.json`, and `outputs/icon-choice-026-packaged/`. The prior readiness draft retains its previously checked installer until a later explicit candidate refresh; this local development build does not publish or replace update-feed assets.
