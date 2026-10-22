# Contributing

Install Node.js 22.12 or newer on Windows, then run `npm ci`, `npm test`, and `npm start`.

The source is MIT licensed. The repository is https://github.com/tkokero/Orbit. Report bugs through GitHub Issues, and include reproduction steps and your app version. Keep the license and third-party notices intact when sharing changes.

Key modules:

- `src/discovery.cjs`: registered installations and local manifests.
- `src/catalogs.cjs`: local game catalogs, history, achievements, and shortcuts.
- `src/library.cjs`: identity merging, classification, preferences, and launch validation.
- `src/artwork.cjs`: validated thumbnail/banner/icon caching and repair.
- `src/accounts.cjs`: the isolated Steam web account connector.
- `src/main.cjs` / `src/preload.cjs`: Electron lifecycle and a narrow IPC bridge.
- `src/scan-worker.cjs`: short-lived discovery/thumbnail worker, terminated after its result is received.
- `src/ui/`: the interface; library pages contain at most 30 cards.

For provider changes, keep authentication in the provider's supported sign-in flow. Do not read another application's credential database, fabricate ownership, or treat a catalog image as an entitlement. Keep missing stats explicit.

Add regression coverage for identity, installation, parsing, or image changes. The Electron smoke mode checks real local discovery, UI behavior, image decoding, and launch routing without starting a game. It uses a separate temporary profile. Run with `ORBIT_SMOKE_DIR` set to a scratch output directory.

Avoid background polling, unbounded image decoding, full-library detail payloads, or blocking UI work. Open achievement details and artwork only when needed. Use `npm run package` to create the portable Windows app in `outputs/installer/win-unpacked`. The same build rules trim unused browser languages and compress Chromium notices without discarding their contents.

Theme contributions use the public schema in THEMES.md. Keep presets readable in both text and button states. Avoid adding runtime dependencies for visual effects.


## Publishing Windows updates

Run `npm ci`, `npm test`, then `npm run dist`. Publish `Orbit-Setup.exe`, its `.blockmap`, and `latest.yml` from `outputs/installer/` on the existing `v1.0.0-pre.1` release. Upload the installer and blockmap before publishing the metadata. The feed is fixed to that release's HTTPS download URL.

Every new update must have a greater `package.json` version. Use `npm version prerelease --preid=pre --no-git-tag-version` before building the next prerelease; the release page can remain consolidated. Never reuse a package version for different update contents. Keep the updater feed and per-user NSIS installation format compatible. The Windows ZIP is a manual portable distribution, not an update payload.

Update metadata contains the version and installer checksum. Keep previous installers recoverable during publication, and do not ship credentials or a GitHub token in the app. The app uses the public release feed.

Update `src/release-notes.json` when preparing a build. `npm run dist` includes those notes in the update feed as well as the app.

## Developer menu

Run `npm run dev` from the source directory, then press **Ctrl+Shift+D**, or open **Settings → About → Developer tools**. This opt-in source launch uses a separate `Orbit-Dev` data folder. Automatic account connections and automatic updates start disabled in a new development profile.

The menu provides runtime and memory statistics, a bounded operation log, DevTools, UI reload, startup replay, process detection and library refresh, layout outlines, a local report copier, and a simulated update notice. Previewing a notice never downloads or installs an update. Sampling stops when the menu closes or the renderer is hidden. Diagnostic logs omit IPC arguments, credentials, game titles, and paths.

The native debug handlers require an unpackaged app **and** `--dev-debug`. Packaged builds ignore that flag and reject every debug command. No environment variable or stored setting enables the menu in a release build.
