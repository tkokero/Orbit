# Orbit 0.2.6 release candidate

Final acceptance, October 26: the user reported the normal restart/icon/intro/settings check and the final installer upgrade both work. Final assets and concise release notes are being prepared for the existing unpublished draft. Earlier pending-playtest entries below are retained as historical validation records.

Latest installed development follow-up: [independent app icon choice](VALIDATION-ICON-CHOICE-0.2.6.md). Appearance can follow the theme or retain a separately selected icon style. Hidden checks and shortcut metadata pass; physical pinned-icon painting remains unverified.

Latest: [October 26 release-readiness check](VALIDATION-RELEASE-READINESS-0.2.6.md). The repaired candidate is installed, but Windows icon matching and the local launch-context saved-data discrepancy remain open. Keep the release unpublished.

Updated and checked October 25, 2026 (America/Chicago). The package version is exactly **0.2.6**. The release is unpublished; building this candidate does not authorize publication or replacing the running installation.

See [the UI follow-up validation](VALIDATION-0.2.6-UI-POLISH.md) for the latest screenshot-driven changes, 24 additional hidden checks, and rebuilt installer.

The [tour and Downloads follow-up](VALIDATION-0.2.6-TOUR-DOWNLOADS.md) supersedes the prior installer and records 41 additional hidden UI checks plus the final packaged regression result.

The [menu and ownership follow-up](VALIDATION-0.2.6-MENUS-OWNERSHIP.md) is now the latest candidate. It records the screenshot-driven More-menu/switch fixes, exclusion of history-only false positives, 456 passing unit tests, 357 packaged checks, focused UI coverage, and the rebuilt installer. The conditional packaged statistics check is explained there.

The [banner, tray, and README follow-up](VALIDATION-0.2.6-BANNER-TRAY-README.md) supersedes that installer with a larger Desktop banner, related organization actions, active-tab navigation preservation, themed launch-choice input, and the two-second tray unload target. It records 458 unit passes, 357 packaged checks, the isolated timing measurement, and the documentation-only GitHub commit.

## User acceptance

The user confirmed daily Orbit use, working Steam controls, satisfactory visual appearance, and a working installer. Earlier user feedback also confirmed Windows startup and DualSense navigation. These are accepted as user playtest results, rather than repeatedly interrupting games to duplicate those checks.

## Corrections in this candidate

- Steam queue responses that started before a user action can no longer overwrite the newer result of that action. Completing a focused transfer restores focus to a remaining control.
- Interrupted Steam polling retains the current cards, shows a reconnecting status, and restores Connected after a successful read. Initial connection failures leave a recoverable menu instead of an endless loading state.
- A game's Steam connection button now opens the connection explanation and explicit restart action. It no longer skips straight to restarting Steam.
- Discord closes local authentication after expired/revoked tokens or unexpected scopes, and rejects a mismatch between the authorized account and the signed-in desktop account.
- Saved Discord sign-ins retry temporary client failures with a cooldown instead of repeated immediate reconnections. Expired credentials ask for an explicit new connection. Returning from Offline mode resumes the saved connection.
- The production Discord gate is enabled for the verified minimal-scope integration. The numbered-development override remains separate; the plain 0.2.6 build does not depend on it. Availability also validates the bundled scope and transport declarations.

## Startup and Desktop reopening follow-up

- Added the hidden Goatkero startup scene, unlocked by typing `kokeroisgoatkero` outside editable controls or entering it in a search field. Unlocking selects and previews it; the selection survives reloads. Existing secret scenes remain independent.
- The original theme-aware SVG uses finite, interruptible animations, shared startup sound controls, cleanup on Skip, and a static reduced-motion frame. Screenshots were inspected at wide and narrow sizes, with dark, light, and Roseberry themes.
- Packaged 0.2.6 performs a one-time migration of the old start-minimized default to visible startup. Other settings and themes remain intact, and a disabled Windows startup registration is not enabled. Later changes to start-minimized remain respected.
- Windows login and updater launches request Desktop mode, including when another Orbit instance is already running. Explicit background requests and renderer restoration remain separate.
- Updates reopen visibly; automatic update restarts while a game is running use showInactive instead of activating Orbit. The new installer was built with runAfterFinish=true; the updater already forces relaunch.
- Native focus, real sign-in startup, and installer execution were not repeated in this follow-up. These paths have unit and hidden-renderer coverage; actual post-update foreground behavior remains a user playtest. The installed session and Windows startup registrations were not changed by validation.

## Live integration checks (previous candidate)

**Steam:** a read-only check of the trusted loopback connection found nine downloads, five folders, and all expected queue-control methods. It did not pause/resume a real download, reorder the queue, restart Steam, move an installation, or uninstall a game. The user's daily-use feedback covers live mutation behavior.

**Discord:** the user approved a fresh sign-in test. The registered application returned exactly `identify` and `relationships.read`; identity matched the local desktop account. Sign-in and refresh returned 52 friends. Encrypted storage and reconnect passed. The reconnect check followed a 65-second quiet interval; the initial immediate reconnect encountered a temporarily unavailable local connection. No extra scope fallback was used, and no credentials were included in friend snapshots or logs.

The isolated test credential was removed afterward. The normal Orbit encrypted credential remained byte-for-byte unchanged. The old isolated test credential could not resume; that did not affect the normal profile and led to clearer expired-credential handling.

Protocol references used during review: [Discord's RPC documentation](https://github.com/discord/discord-api-docs/blob/main/developers/topics/rpc.mdx) and [official RPC connection implementation](https://github.com/discord/discord-rpc/blob/master/src/rpc_connection.cpp). Scope names are checked against the actual OAuth authorization response, not inferred from registration alone.

## Automated validation

- 450 unit tests passed, with no failures. One native-window fixture is explicitly skipped by default, as described below.
- 36 hidden Steam UI checks passed, including state/action correctness, polling races, interruption/recovery, focus after completion, empty queues, tab switching, restart review, narrow/wide layouts, themes, and 100/125/150/200 percent page scale.
- 33 hidden copy/popup checks and 66 Friends/context-menu checks passed. All fixture runs recorded zero shown/focused windows and no unexpected renderer errors.
- 16 additional hidden startup/Desktop checks passed, including secret discovery, persistence, theme/viewport fit, reduced motion, audio cleanup, and the Desktop launch override. They recorded zero shown/focused windows and no renderer errors.
- The exact rebuilt packaged candidate passed all 358 regression checks. Its background guard recorded no shown/focused windows; six attempted window actions in existing checks were blocked.
- All 214 shipped source/resource files, package metadata, and unpacked native resources matched the candidate. The disconnected production-native helper probe passed without requesting authorization.

### Native-window check still outstanding

The existing Windows Roblox tray fixture creates native windows, including minimizing and hiding a Windows Forms test process. It ran as part of the old default unit suite and timed out waiting for the hidden/tray state. The result has not been claimed as a product fix or a passing test.

The fixture is now opt-in using `ORBIT_NATIVE_WINDOW_PLAYTEST=1`. It must only be run during a user-agreed native playtest. Mocked running-game and session tests still execute in the normal suite. The tray fixture needs a separate controlled investigation before it can be considered validated; the running game or normal Orbit session was not intentionally manipulated for this check.

## Evidence

- `work/release-026-live-read-check.json`
- `work/release-026-discord-auth-check.json`
- `work/release-026-discord-tests.log`
- `work/tour-026-tests.log`
- `outputs/goatkero-ui-check/report.json`
- `work/goatkero-026-ready.json`
- `outputs/steam-menu-ui-check/report.json`
- `outputs/copy-ui-check/report.json`
- `outputs/friends-quiet-ui-check/report.json`
- `outputs/tour-026-release-check/smoke-report.json`
- `outputs/tour-026-release-check/background-checks.json`
- `work/tour-026-package-verification.json`
- `work/tour-026-release-check-exit.json`
- `work/tour-026-build/win-unpacked/`
- `work/tour-026-installer/Orbit-Setup.exe`

No installer was run over the active session. Settings, themes, artwork, layouts, collection preferences, profile links, and remembered normal-account connections were not reset. No release asset upload, code/tag push, or publication was performed.

Installer SHA-256: `29e56997a5d5d1d6aadffb5884ea897eabe4345ef8db48aa2adc18592aa06ac7`.

App archive SHA-256: `484d1343a6a559808268006a7cc24328653b838ac29e9cd60c1aa4e1f36588c1`.

The workspace `AGENTS.md` was expanded after validation to retain the user's repeated design, preservation, quiet-check, input-mode, integration-permission, and release-draft preferences. It records the latest accepted choices, including confirmed profile matching rather than automatic merging.
