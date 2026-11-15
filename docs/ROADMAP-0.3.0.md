# 0.3.0 — Clipping

Development started November 4, 2026. This is a development plan, not a public release announcement.

**November 13 priority:** polish and validate regular Orbit for 0.3.0. Orbit Rust remains a separate, incomplete preview; its migration does not block fixes to the existing app. The release review covers UI, CPU/RAM, startup/background behavior, clipping, storage/network and experimental VR. Hardware checks and comparable performance measurements remain separate from fixture results.

Latest review: [broad polish and validation](VALIDATION-0.3.0-BROAD-POLISH.md).

## First development build

**Optional Desktop Workspace (dev.18):** a separate app composition with a Library grid and side inspector, plus Clips, Downloads, Friends and Settings pages. Current UI remains the default. Launching, recording, account management and advanced utility dialogs use existing services. Workspace presentation choices are saved independently. This is regular Orbit; it does not replace or finish the separate Rust preview.

0.3.0-dev.1 implements the first game-aware replay path:

- Enable game clipping for the current Orbit session. Wait for a verified, detected game window; capture stops when that game exits and waits for the next game.
- Press F8 to save a replay while buffering continues. Stop from Clips, the tray, or the configurable emergency shortcut.
- Save capture settings: 15/30/60/120 seconds, 720p/1080p, 30/60 FPS, system audio, shortcuts and output folder.
- Select manual window/display capture through ephemeral local previews. Never fall back to desktop capture automatically.
- Browse local video previews, filter by game, play in Orbit and show saved files.
- Handle Start/Stop races, shortcut conflicts, source-owner changes and rejected packet batches without creating overlapping recorders or partial buffer entries.

The capture flow takes inspiration from [Medal's game detection and replay shortcut](https://support.medal.tv/support/solutions/articles/48001157618-how-to-make-clips). Orbit keeps its own interface and local storage. Automatic event highlights, uploads and a social feed are outside this first build.

See [how to use clipping](CLIPPING.md) and [what was checked](VALIDATION-0.3.0-dev.1.md). Fixture tests do not establish real-game performance or universal capture support.

## Next development work

1. Playtest verified game-window capture, exclusive fullscreen, minimize/restore, game exit, shortcut conflicts and audio on supported hardware. Measure the same game scene with clipping off/on, including the whole Orbit process tree and GPU/frame times.
2. Playtest the dev.12 session/library storage limits, low-space stop and interrupted-session retention. Saved recordings are never automatically deleted.
3. Add start/end trim and separate-file export, preserving originals, with cancellation and recovery.
4. Add metadata correction and per-game capture preferences from actual use. The dev.9 viewer now provides search, date groups, previous/next playback, and return to the saved gallery position.
5. Validate supported upgrade paths, settings preservation, helper cleanup, sleep/wake and the final installer before a public candidate.

Full sessions, bookmarks, per-game preferences and optional startup arming are implemented in dev.12. Separate microphone tracks, automatic highlights and advanced editing remain planned. Optional microphone capture is part of one mixed audio track. Startup arming requires an explicit choice; it is off by default.

The [recording-mode research](CLIPPING-RESEARCH.md) records what was learned and what dev.12 implements. Quick Start now includes appearance, startups, library preferences, optional clipping arming and the real app tour. See [Quick Start](QUICK-START.md).

The [long-term roadmap](ROADMAP-TO-1.0.md) retains clipping as the headline for 0.3.0. The [Rust/Tauri rebuild](RUST-MIGRATION.md) was approved on November 10 and remains separate from the current regular Orbit release-polish priority. Replacement depends on feature compatibility and upgrade checks, rather than waiting for 0.5.0. The working installed app remains available while its services are ported.

The separate [Newer build](../rust/NEWER.md) adds a new Playnite-inspired Desktop interface and Rust library services. It coexists with the installed app. Its [porting status](../rust/NEWER-PORTS.md) records what works and what remains; it is not a feature-complete replacement yet.
