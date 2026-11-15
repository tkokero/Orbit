# Orbit Rust preview

An in-progress Rust backend and Tauri shell for Orbit's existing interface. It is separate from the installed Electron app and cannot write its normal or dev profile.

**Checked:** cached library grouping, stable game IDs, profile saves, organization preferences and custom-theme preservation in the Rust core.

**Built and checked:** the native Tauri shell and shared UI adapter now run in WebView2. The Microsoft C++ tools installed successfully. Nineteen hidden reopen checks cover the library, saved choices, settings, game details and simulated popup resizing. See the [native preview validation](../docs/VALIDATION-RUST-PREVIEW.md).

Launching, scanning, tracking, capture, VR, accounts and Windows integrations are not ported. Unimplemented commands return an explicit error. Do not use this preview as a daily-use replacement.

## Build and check

Install the [Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/#windows), including Microsoft C++ Build Tools, WebView2 and the MSVC Rust toolchain. Rust 1.99.1 is pinned; dependencies are locked in Cargo.lock.

From this folder:

```powershell
cargo test -p orbit-core --locked
node scripts/prepare-ui.cjs
node scripts/check-bridge.cjs
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1 -Target desktop
```

The UI preparation step copies the current Orbit interface into ignored `web/` assets and records its service contract. Node is a development tool for that step, not a runtime dependency of the proposed Tauri app.

The executable accepts `--profile C:\absolute\isolated-profile`. Use a copy containing only `library.json`, `library-cache.json` and `ui-preferences.json`; credentials and recordings are not migrated by this prototype. Local cached artwork paths still need a scoped asset service. The checked screenshots use bundled sample artwork.

`--smoke --profile ... --report ...` keeps the window hidden and enables fixture reporting. Native UI testing is explicitly separate from the core test command. Hidden checks passed; physical pointer behavior and other native playtests remain unperformed.

[Migration plan](../docs/RUST-MIGRATION.md) · [Native validation](../docs/VALIDATION-RUST-PREVIEW.md) · [Earlier core checks](../docs/VALIDATION-RUST-FOUNDATION.md)
