# Pinned taskbar theme icon follow-up

October 25, 2026. Local candidate; validation and installation receipts are recorded separately.

The running window/tray theme code did not update an existing Windows taskbar pin. Read-only inspection of this PC confirmed Orbit.lnk used the installed Orbit executable as its target, the same application ID as the running app, and no explicit icon; Windows therefore continued using the executable's static icon.

The new Windows helper updates only existing shortcuts that point to the exact installed Orbit executable and compatible application ID. Game shortcuts, debug/smoke instances, other applications, and other profile identities are skipped. It changes only the icon path/index using Electron's update operation, preserves and verifies all launch fields, saves the original shortcut once, and restores original bytes if verification fails. It does not create/delete/move/reorder pins or restart Explorer. A targeted shell notification requests refresh for the changed shortcut only.

Theme updates synchronize the pin before pruning generated icon resources. Failed pin refreshes can retry without regenerating the same palette. Taskbar synchronization starts asynchronously during app startup so the initial Desktop window does not wait for a shell-notification helper. The helper runs only in normal packaged Windows builds, not routine smoke/dev checks.

References:

- https://www.electronjs.org/docs/latest/api/shell#shellwriteshortcutlinkshortcutpath-operation-options-windows
- https://learn.microsoft.com/en-us/windows/win32/properties/props-system-appusermodel-relaunchiconresource
- https://learn.microsoft.com/en-us/windows/win32/api/shlobj_core/nf-shlobj_core-shchangenotify

Targeted unit tests cover shortcut identity preservation, skipping unrelated pins, one-time backups, no redundant notifications, rollback, cache-path restrictions, and retry behavior. A native shell test updated an isolated temporary shortcut, preserved its target/arguments/working directory/description/application ID, and created zero windows. It did not touch real taskbar pins. Real pin repair and installed-resource/profile verification are recorded when performed. Visual Explorer rendering is not claimed solely from shortcut metadata checks.

## Completed local validation and installation

- Unit suite: 475 passed, zero failed, one explicitly opt-in native fixture skipped.
- Packaged regression: 358 checks passed. Background guard recorded zero shown or focused windows; process exited successfully.
- Package verification: 216 resources matched; native disconnected-helper probe passed.
- Quiet installation completed October 25, 2026 at 20:02 local time. Installed archive SHA-256: `66ede401be4d702d8eb71dc9de2766bd90590edd4e84830be44cd26948d727e7`. No automatic foreground reopening or publication occurred.
- Both normal and dev profiles retained interface/native/per-game settings and seven custom themes each. All 17 normal-profile managed artwork/video files and the existing encrypted Discord connection were preserved.
- The actual existing Orbit taskbar pin now references the icon generated from the saved Dark theme. Target, arguments, working directory, description, application ID and toast identity were verified unchanged. The original pin was backed up, a targeted shell refresh was requested, and zero windows were created. Explorer was not restarted. Visible shell painting remains unobserved.
- Receipts: `work/taskbar-theme-026-ready.json`, `work/taskbar-theme-026-install.json`, `work/taskbar-theme-026-preservation-verification.json`, `work/taskbar-theme-026-credentials-preserved.json`, and `work/taskbar-theme-026-real-pin-verification.json`.
