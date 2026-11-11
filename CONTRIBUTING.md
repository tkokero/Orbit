# Contributing to Orbit

Orbit is an open-source Windows game launcher built with Electron, Node.js, and vanilla web standards (HTML5/CSS3/JavaScript), licensed under [MIT](LICENSE).

---

## Getting Started

### Prerequisites
* **Node.js**: Version 22.12 or newer.
* **Operating System**: Windows 10 / 11 (x64).

### Setup and Development Commands
```powershell
# Install dependencies
npm ci

# Run test suite
npm test

# Launch Orbit in development mode
npm start

# Run with developer tools and diagnostics enabled
npm run dev

# Package an unpacked directory build
npm run package

# Build the production NSIS installer
npm run dist
```

---

## Code Architecture

| Area | Primary Files |
| --- | --- |
| **Main Process & App Lifecycle** | `src/main.cjs`, `src/preload.cjs`, `src/app-restart.cjs` |
| **Library Discovery & Merging** | `src/discovery.cjs`, `src/library.cjs`, `src/catalogs.cjs` |
| **Integrations (Steam, Discord, Roblox)** | `src/steam-bridge.cjs`, `src/social-discord.cjs`, `src/roblox.cjs` |
| **Activity Tracking & Playtime** | `src/activity-history.cjs`, `src/playtime.cjs` |
| **User Interface (Renderer)** | `src/ui/` (HTML views, CSS styles, JavaScript modular controllers) |
| **Native Addons & Helpers** | `native/discord/` (C++ RPC bridge), `src/native/` |

---

## Testing & Quality Guidelines

1. **Automated Tests:** Always run `npm test` before committing changes. All tests in `test/*.test.cjs` should pass cleanly.
2. **Smoke & Integration Tests:** In development, Electron smoke tests can be run using flags like `--smoke-test` with isolated profiles.
3. **Data Preservation:** User preferences, themes, artwork caches, and session history must always be preserved across restarts and updates.
4. **Performance & Resources:**
   - Keep background CPU and RAM minimal.
   - Defer non-critical scans and load artwork on-demand.
   - The UI automatically targets a low-maintenance background state when inactive.
5. **Accessibility & Layouts:** Test UI views with varying window bounds (narrow and wide), high DPI scaling, theme contrast, and reduced motion settings.

---

## Issues & Pull Requests

* **Bug Reports:** When reporting issues, please include your Windows build, Orbit version, and clear steps to reproduce the problem. Never post API keys, passwords, or personal credentials.
* **Pull Requests:** Keep PRs focused, preserve documentation integrity, and ensure automated tests pass.
