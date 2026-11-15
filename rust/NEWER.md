# Orbit Rust

Newer has been renamed **Orbit Rust**. Its current standalone source is [Orbit-Rust-source](../../Orbit-Rust-source/README.md).

The current application has a native Rust interface and Rust services. It uses neither the historical Tauri renderer in this folder nor Electron. Classic and Newer are layout choices inside the native application.

All original Orbit features remain migration requirements. See the [current migration status](../../Orbit-Rust-source/MIGRATION.md) before using it as a replacement. Keep the normal Orbit installation until feature parity and preservation are validated.

`scripts/build-newer.ps1` redirects to the native project. Files retained here document the earlier Tauri experiment and are not bundled in Orbit Rust.