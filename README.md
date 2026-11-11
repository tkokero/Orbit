# Orbit

A Windows launcher for your game libraries, local games, and tools. Organize your collection, customize your desktop, and launch titles from one place.

![Orbit Desktop Library](docs/screenshots/orbit-library.png)

## Features

- **Library & Organization:** Browse covers, banners, or lists with adjustable card sizing and spacing. Organize titles into collections with drag-and-drop, multi-selection, and full Undo support.
- **Desktop Layouts:** Switch between Gallery, Workspace, and Shelf presets. Reorder sections, toggle sidebars, and configure resizable popups.
- **Controller Mode:** Fullscreen gamepad navigation with customizable bindings, on-screen keyboard, and game launch transitions.
- **Friends & Presence:** Unified Steam and Discord friends list with profile linking and configurable Discord Rich Presence privacy controls.
- **Activity Tracking:** Local playtime and streak tracking, with tools to edit session times, merge split recordings, and restore edits.
- **Steam & Downloads:** Follow download progress, manage drive storage, and control Steam queues directly from Orbit.
- **Themes & Appearance:** Custom color palettes, image backgrounds, animated startup scenes, custom fonts, and matching taskbar icons.
- **Experimental Tools:** Optional SteamVR dashboard overlay, game graphics configuration presets, and local hardware FPS estimates.

## Screenshots

![Organizing Games](docs/screenshots/orbit-organization.png)

![Controller Mode](docs/screenshots/orbit-controller.png)

![Friends View](docs/screenshots/orbit-friends.png)

![Themes](docs/screenshots/orbit-appearance.png)

## Installation

Download the latest release from [GitHub Releases](https://github.com/tkokero/Orbit/releases):

- **Installer:** Download `Orbit-Setup.exe` for automatic installation and updates.
- **Portable:** Download and extract `Orbit-Windows.zip`, then open `Orbit.exe`.

## Quick Start

- **Ctrl+K:** Search games, collections, settings, and actions.
- **Ctrl+Shift+P:** Open Quick Launch.
- **Settings → Appearance:** Choose themes, layout presets, and startup animations.

## Building from Source

Requirements: Node.js 22.12 or newer on Windows x64.

```powershell
# Install dependencies
npm ci

# Run test suite
npm test

# Start Orbit
npm start
```

See [Contributing](CONTRIBUTING.md) for architecture details and testing guidance.

## Documentation

- [User Guide](docs/GUIDE.md): Library, desktop layouts, activity history, friends, and themes.
- [Controller Mode](docs/CONTROLLER.md): Gamepad controls, shortcuts, and navigation settings.
- [Experimental Features](docs/EXPERIMENTS.md): SteamVR overlay, graphics presets, and FPS estimates.
- [Roadmap](ROADMAP.md): Milestones leading to Orbit 1.0.
- [Changelog](CHANGELOG.md): Release notes and version history.
- [Contributing](CONTRIBUTING.md): Build instructions and development guidelines.
- [Privacy Policy](PRIVACY.md): Local storage and connection handling.

## License

Orbit is licensed under the [MIT License](LICENSE).
