# Newer rewrite status

**Historical preview status.** The separate app is now Orbit Rust, with native Rust interface and services. Current status: [Orbit Rust migration](../../Orbit-Rust-source/MIGRATION.md). The table below describes the older Tauri preview, which is retained for reference.

Newer is a separate app identity and profile. Its backend uses Rust and Tauri; it does not load Electron or run the old Node backend. The new interface uses WebView2. This first build is **not full Orbit feature parity**.

| Area | Current build | Remaining work |
| --- | --- | --- |
| Library | Rust merge, game identity, ownership filtering, installed Steam/Epic manifests, manual executable selection | Other launcher discovery and full account libraries |
| Organization | Favorites, collections, hide/restore and Undo for hiding | Multi-selection, bulk Undo, smart-collection editing, tags/notes editing |
| Appearance | New banner, cover and list views; card sizing; three native palettes; imported Orbit theme selection | Full theme editor, custom font controls, artwork/crop editor, shell icon choices |
| Game pages | Persistent inspector and full artwork page; stored metadata and local statistics | News reader, launch presets, troubleshooting, save tools |
| Launching | Rust builds canonical Steam/Epic routes or opens a selected executable | Live launcher-chain playtests, controller handoff, return/focus behavior |
| Activity | Rust process observation, local retention/counts/streaks and history display | History editing, recaps, extended tracking playtests |
| Settings/data | Separate protected profile, atomic saves, backups, one active process per profile, validated read-only Orbit import | Complete settings controls and migration coverage for every port |
| Friends | Not active | Read-only Discord connection, Steam friends and confirmed profile links |
| Clipping | Not active | Rust capture, audio routing, encoding/replay storage, shortcuts and the viewer/editor |
| Downloads/storage | Not active | Native transfers and Steam tools |
| VR/controller | Not active | Runtime overlay, input and controller surfaces |
| Lifecycle | Standalone installer, normal close/quit | Startup scenes/sound, tray services, login launch, full restart and updates |

Imported advanced choices remain in the copied profile even when their controls or service have not been ported. They must not be announced as active just because their saved data is retained. Credentials are not imported or silently reauthorized.

Next: validate library importing and real launch routes with an agreed playtest, then port the daily-use services and clipping. Keep the existing installed Orbit available until parity and upgrade validation are complete.
