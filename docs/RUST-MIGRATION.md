# Rust migration

Approved November 8, 2026: a Rust backend with Tauri, retaining Orbit's existing HTML/CSS/JavaScript interface. On November 10, the owner made the rebuild the current development priority, rather than waiting for 0.5.0. The installed app remains 0.3.0-dev.12 until the replacement passes its required compatibility checks.

Tauri supports this separation through a Rust core and the system webview, including WebView2 on Windows. This does not turn the interface itself into Rust or establish any performance improvement. [Tauri architecture](https://v2.tauri.app/concept/architecture/)

## Current foundation

- A separate Cargo workspace under `rust/`, with a reusable `orbit-core` library and a Tauri desktop shell.
- Rust cached-library grouping, ownership filtering, game IDs, selected copies, statistics, favorites and organization preferences.
- Bounded profile reads, validated interface settings, atomic saves with backups and preservation of unknown saved fields.
- Read-only session history, per-game streaks, lifetime recorded-play counts and Activity timelines. Saved history and correction recovery stay untouched. Live tracking and session editing are separate ports.
- A shared-UI adapter generated from Orbit's current bridge: 224 command mappings, 16 event names and 108 UI scripts. Mapping a command does not mean its service is ported.
- Preview profiles are separate. Normal/dev profile paths and their resolved locations are blocked as write targets. Credentials, recordings and live game processes are untouched.

The Rust core passes its compatibility checks. The Tauri shell now builds with the installed Microsoft C++ tools and runs the existing interface in hidden WebView2 checks. Native screenshots and saved-choice/reopen checks are complete. Physical input, game/capture/VR parity and comparable resource measurements remain unperformed. See [native validation](VALIDATION-RUST-PREVIEW.md) and the [earlier core checks](VALIDATION-RUST-FOUNDATION.md).

The November 10 history slice also passes 30 comparison cases, 26 views of copied saved history, and 25 hidden native reopen checks. See [history validation with before/after images](VALIDATION-RUST-HISTORY.md). This completes history viewing, not live tracking or correction editing.

## Migration order

| Stage | Work | Acceptance gate |
| --- | --- | --- |
| 1. Profile and library foundation | Current Rust core, Tauri adapter, scoped artwork loading | Build the native shell; test the actual UI hidden; retain settings and stable identities after reopening |
| 2. Games and history | Discovery, provider cache readers, launch validation, launcher chains, active sessions and history | Same detected library and launch behavior; no false ownership; accurate exit tracking and recovery |
| 3. Desktop services | Startup, tray, full restart/intros, icons, shortcuts, notifications and background unloading | Quiet automated fixtures plus agreed native playtests; existing working preferences stay intact |
| 4. Connections | Provider services, read-only Discord friends and protected remembered connections | Same permissions and privacy; supported encrypted migration without plaintext credential files |
| 5. Capture | Native Windows capture, audio routing, encoders, replay buffers, sessions, bookmarks and playback/export | Same quality and consent; interrupted-file recovery; comparable real-game overhead and cleanup checks |
| 6. VR | Native panel rendering, textures, input, wrist attachment, gaze visibility and tools | Hardware-tested input, readable panels and stable frame pacing at equivalent quality |
| 7. Replacement | Installer, signed updater flow, Electron-to-Tauri transition, rollback and normal/dev profiles | Tested clean install, upgrade, interrupted update and recovery; explicit approval before publishing |

The rebuild now takes priority over expanding Electron features. Port working services in the order above; keep Electron changes limited to needed repairs and migration support. Clipping remains the 0.3.0 headline. Replacement readiness is decided by compatibility and upgrade checks, rather than waiting for the 0.5.0 number. Keep a recoverable Electron release until all required checks pass; choose the replacement release number after reviewing its actual coverage.

## Important boundaries

The current recorder uses Electron capture APIs. The VR renderer also relies on Electron-specific surfaces. Both require dedicated ports; keeping their UI does not make those backends work in Tauri.

Do not treat Electron-encrypted credentials as directly portable. Validate supported decrypt/reprotect handoff in memory, or request sign-in where secure transfer is unavailable. Preserve consent and never broaden Discord scopes to make a port work.

Tauri's updater uses its own metadata and signing model. Electron's `latest.yml` is not a drop-in update path. Plan a verified transition installer and rollback before replacing any release feed. [Tauri updater documentation](https://v2.tauri.app/plugin/updater/)

Keep the core backend independent of the UI transport. Use events for changing service state, bounded blocking workers for disk/scanning work, cancellation for long operations and scoped native commands. Start optional capture/VR helpers only when requested.
## Performance review

No savings are claimed yet. Compare release builds with equivalent features, library data, image caches, capture quality and VR workload. Count every Orbit, WebView2 and helper process. Record private memory separately from working set, and include startup, warm reopen, tray, recording and VR frame-time samples.

Lower usage obtained by leaving services unported is not a valid comparison. Use the [release optimization checklist](RELEASE-OPTIMIZATION-CHECKLIST.md) when the preview reaches comparable feature coverage.
