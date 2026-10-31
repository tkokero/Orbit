# 0.2.6 readiness check — October 26, 2026

The repaired candidate is installed locally. **Do not publish yet.** Windows taskbar/tray matching failed the user's visible check, and the local saved-data view discrepancy described below still needs a root-cause investigation. Automated passes do not override those findings.

## Six checks

| Area | Result |
| --- | --- |
| Settings and themes | Damaged/oversized recovery fixed and tested. Latest observed normal settings restored and verified through the real loader. Three current normal themes, seven separate dev themes, and 17 managed media files retained. Launch-context discrepancy remains unresolved. |
| Full restart and icons | Tray Restart produced a new process and returned Desktop while VRChat stayed running. User reported icons still differ, including after the constructor-icon adjustment. Intro/sound settings retained; audible playback was not separately confirmed. |
| Desktop and scaling | Library controls, focus/scroll restoration, tour, themed dropdowns, and recovery notice passed hidden checks at wide/narrow widths, including 125% scaling. |
| Downloads and detection | Downloads kept its DOM, query and filters behind Steam controls. Current read-only audit confirmed all 57 installed entries; no cached installed entry lacked fresh evidence. The earlier RV There Yet? false positive is absent. E: Steam library unavailable. |
| CPU/RAM and tray | Window unloaded approximately 2,027 ms after hiding; native processes remained alive. Dropdown churn retained no additional nodes/listeners. Measurements below are local samples, not universal performance gains. |
| Release preparation | Version exactly 0.2.6. Validated installer and checksum attached to the existing unpublished draft; remote installer digest matches the locally installed candidate. Notes, example screenshots and incomplete acceptance checks updated. No publication or existing update-feed replacement performed. |

## Changes made during this check

- Reject oversized fields and malformed theme JSON during native preference loading instead of silently omitting the theme record. Fall back to a valid saved copy; archive original primary/backup bytes and export recoverable individual themes separately.
- Reject an over-budget legacy theme merge before changing stored state or clearing the browser's choices. Reject malformed theme writes before mutating memory.
- Show a short recovery notice with Open data folder in General settings. Keep it above the regrouped settings sections, including narrow layouts.
- Create the native main window with its already-selected startup image rather than briefly creating it with the default artwork. This attempt **did not pass the user's physical taskbar/tray check**; do not describe matching Windows icons as fixed.
- Correct the draft's outdated startup description: cached opening still respects the selected intro/sound. Add full tray restart and preference recovery to the notes.

## Validation evidence

- Unit suite: **495 passed, 0 failed, 1 explicitly opt-in native-window test skipped**.
- Exact packaged app: **358 checks passed**, exit 0. Hidden-window guard recorded 0 shown, 0 focused, and 6 blocked show/focus attempts.
- Source-to-package comparison: **226 resources**, no mismatches; native helper availability checked without connecting an account.
- Hidden focused fixtures: library **22**, tour/Downloads **64**, control churn/responsive **12**, recovery screen **13** checks passed. These overlap; they are not 111 independent product features.
- The first 125% popup fixture failed because a delayed viewport resize closed the menu. Geometry showed a closed menu, not overflow. Waiting for the resized viewport before clicking passed at 1440, 800/125%, and 420 widths. No product positioning change was made for that harness timing error.
- A recovery-screen check initially showed the new notice was grouped below other settings; it now stays first and passed the hidden narrow-screen capture.
- Early work-only harness setup attempts failed before running. They are not counted as passes. No real downloads, installations, or accounts were manipulated to make fixtures pass.

Work receipts: `work/release-readiness-final-tests.log`, `outputs/release-readiness-026-packaged/{smoke-report,background-checks}.json`, the four `outputs/release-readiness-*-ui*/report.json` files, and `work/release-readiness-026-package-verification.json`.

## Live profile preservation and limitations

Before installation the actual running app used Roseberry, three custom themes, 58 visible games (72 entries including tools), and 57 installed entries. Its native preference loader retained every saved value. Its current themes occupied 1,448,483 characters, within the existing per-setting limit.

The installer completed quietly, and installed archive/unpacked helper hashes matched. The external normal/dev profile view was unchanged by installation. A subsequent quiet launch and normal shortcut launch nevertheless used an older Dark/library snapshot. This is the previously observed launch/file-view discrepancy; its cause is not established as an installer or general-user regression. Raw installer before/after equality alone is insufficient evidence that the latest live snapshot is active.

Both snapshots were backed up. The latest observed running-profile snapshot was restored explicitly, without merging older themes. Newer playtime totals were retained where greater, and newly recorded history rows after the snapshot were preserved. Credentials were neither replaced nor reauthorized. Final native UI and loader verification showed Roseberry, the same three current themes, the original visible library, seven untouched dev themes, and matching 17 artwork/startup files. The final current library audit again confirmed 57 installed entries with no missing fresh evidence. The launch-context cause remains open despite the successful local repair.

Private backups and detailed library/profile receipts stay under `work/release-readiness-026/`; do not upload them. The public draft must not contain profile files, credentials, friend identifiers, or real-user screenshots.

## Performance samples

On the installed pre-repair baseline, closing the real app to the tray unloaded its renderer approximately **2.03 seconds** after hiding. Electron-reported summed private allocation fell from **221.9 MiB to 155.2 MiB**, about **30%** in that particular close-to-tray sample. This measures the existing lifecycle behavior, not a new-versus-old build improvement or unique physical RAM.

A separate 10.04-second visible/background diagnostic interval consumed about **1.64% of one CPU core** across Electron-reported processes while VRChat was running. This short sample excludes separate non-Electron helpers and is not a reproducible idle benchmark. No 0.1.0-to-current CPU/RAM percentage is claimed.

After 500 temporary dropdowns were created and removed, forced-GC DOM counters returned to **1,943 nodes and 251 listeners**, exactly the fixture baseline. Repeated enhancement of unchanged controls produced **0 redundant disabled/label attribute writes**; reselecting the active workspace preserved its existing state and cards.

## Candidate identity and remaining work

- App archive SHA-256: `918953aeabe9f1fec43408c11b63f36aed5fb533cac811537c2bc84a5ef6d66c`.
- Installer SHA-256: `b0ca1c741e4b5787cbeeea80c940f381404e7f0e1e51f287d615049cf43c11bf`.
- Installer: `outputs/Orbit-0.2.6-draft/Orbit-Setup.exe` (116,303,055 bytes).
- Resolve and visibly verify the Windows icon mismatch. Do not restart Explorer or force taskbar regrouping.
- Read-only shortcut audit found the same correct AppUserModelID on Orbit's desktop, Start-menu and two taskbar shortcuts. Both taskbar shortcuts reference the selected themed icon, but the desktop shortcut uses the executable icon and the Start-menu shortcut references different artwork. Synchronizing all Orbit-owned shortcut icon sources at startup is the next hypothesis to test; current evidence does not prove it resolves Windows' cached group icon.
- Explain and eliminate the launch-context saved-data discrepancy before treating preservation as unattended-upgrade ready.
- A fresh 0.2.5-to-final-0.2.6 upgrade and Windows sign-out/sign-in timing were not performed in this pass. Prior user daily-use, startup, and installer feedback remains valid playtest evidence.
- No fresh account consent, game launch, game exit, or Steam restart was performed. VRChat remained running during the approved Orbit-only checks.
- Publication still requires the user's explicit approval.

Draft receipt: release ID `423118269`, [saved 0.2.6 draft](https://github.com/tkokero/Orbit/releases/tag/untagged-feb4e3f804d6690190b4), `draft=true`, two assets. GitHub reports installer size 116,303,055 bytes and the matching SHA-256 above. Screenshots reference the already-public example library and Steam controls, not the user's profile.
