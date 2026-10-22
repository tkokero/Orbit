# Orbit

Orbit is a Windows desktop app for organizing and launching games from connected libraries and local files. It is currently a pre-release: features may change, and some integrations are still being tested.

![Orbit interface with an example library](docs/screenshots/orbit-library.png)

*Shown with example games; no personal library or account data.*

## Install and open

Download **Orbit-Setup.exe** from [Releases](https://github.com/tkokero/Orbit/releases) and run it. For portable use, extract the entire **Orbit-Windows.zip** folder before opening **Orbit.exe**. The Windows builds are unsigned.

First run opens a single Quick start screen. Choose Open library immediately, expand optional connections and preferences, or take a guided tour with an animated atom that follows each part of the interface. Reopen it from **Settings → General**. Keep any original clients your games require.

## Library and launching

- Browse **Library** and **Tools**, search titles and alternate names, or filter by platform, installation status, and other available information.
- Organize entries with favorites, collections, personal tags, and notes. Choose grid or list view.
- Detected copies stay together in game details. Select a preferred launch; automatic selection favors a working installed copy, then Steam.
- Open details to manage launch settings, choose an executable, create a desktop shortcut, or view available playtime and achievements. Right-click for quick actions, or press **Ctrl+K** for Quick launch. Use **Ctrl+F** to focus library search and **Esc** to clear it. **View** contains layout and collections; **More** contains refresh, controller view, and shortcut help. Right-click a game (or press **Shift+F10** while focused) for quick actions. Secondary file and launch controls are under **Game options** in Details.
- Add local executables or run a standalone installer. Other installations and some launch routes use the original client.

Detection identifies local installations and supported account records; finding a launcher does not prove ownership. Information and features depend on the platform, account privacy, and game. Missing information is shown as unavailable.

## News, friends, and downloads

**What’s new** shows Steam announcements for selected games in your library, with banner images and links to the original posts. News and artwork are cached; not every game has a supported feed.

**Friends** shows presence and shared activity where supported. Some platforms provide official-client controls instead of live friend lists. Account connections are optional.

Optional **Discord Rich Presence** is in **Settings → Libraries**. Enable Share activity on Discord and choose whether to share game names and elapsed time. Changes save automatically; no Application ID setup or bot is needed. Presence includes the Orbit logo and a link to this GitHub repository. Discord’s desktop app must be running. Orbit shares one detected game at a time and continues while in the tray; sharing pauses in Offline mode and clears when disabled or Orbit quits. No Discord token or client secret is needed.

**Downloads** keeps supported installation progress in one place. Transfer speed and remaining-time estimates appear when enough data is available. Use the original client for pause, resume, ordering, and bandwidth controls.

**Radar** contains a calendar of dated PC and console releases for the next 31 days from Steam and GamesRadar+, your wishlist, and featured Steam discounts. The calendar refreshes every 12 hours while Orbit runs and keeps saved dates available offline. Date tiles feature game previews, using Steam wishlist order where available and featured listings otherwise. Add, edit, or remove custom releases and their preview images for any platform; these are stored locally. Coverage varies, and planned release dates can change. Save public store links and optional target prices; check supported prices on request. Prices are regional and may be cached. Confirm the final price on the store page. Other stores can be saved as links.

## Sessions, storage, and backups

Orbit detects supported games running fullscreen, minimized, or tabbed out, including games launched outside Orbit. Multiple games can be tracked at once while Orbit is running or in the tray. Local playtime totals are used when platform hours are unavailable; platform totals are kept separate. Game details include **Game detection**, which shows expected processes and scan results and lets you choose the actual game executable. Launch feedback distinguishes a sent request from a detected running process. Detection runs periodically, so a new game may take up to 30 seconds to appear. **Activity** shows recorded sessions; **Storage** lists known installation folders and drive space, with folder sizes measured on demand.

Choose a save folder in a game’s details to create local save snapshots. Restore previews changes and keeps a recovery copy. Optional automatic snapshots run after detected sessions. Close the game before restoring, and keep another backup elsewhere.

**Settings → Manage** can back up Orbit preferences and local hours, restore hidden entries, review launch problems, and export information. Preference backups do not include game files or account credentials.

## Settings and updates

Drag the sidebar’s right edge to resize it, double-click to reset it, or focus the divider and use the arrow keys. Its width is remembered on this computer.

Settings cover discovery, startup, closing to the tray, notifications, themes, accessibility, and updates. Hover over an info icon for help, focus it with the keyboard, or click to keep the explanation open. Themes support custom image backgrounds with automatic or manually chosen accent colors. Appearance also supports a local custom interface font, with a reset to the default font. Choose from space-themed startup animations and hidden scenes or import a local MP4/WebM video up to 15 seconds, 1080p, and 64 MB. Startup scenes have optional quiet sound cues with a volume control, off by default. Playback is skippable and respects reduced-motion preferences. Custom videos remain muted and are stored separately from exported themes. The installed version can download and install published updates while games keep running. Orbit saves playtime, resumes manual timers, and keeps automatic restarts in the background during play. File operations finish before Orbit restarts. Portable updates are manual. Draft releases are not available to the public updater.

Artwork conversions run through a bounded queue, and offscreen or hidden pages release their displayed images. Cached artwork can load without starting the image decoder. Closing the window normally keeps Orbit in the tray for tracking and background tasks; the unused library window unloads after a short delay. Use the tray menu to quit. Offline mode stops new online checks; cached information may be outdated, and games retain their own authentication requirements.

System information and approximate performance estimates use the current computer’s detected hardware. FPS figures are estimates, not measured benchmarks.

The full build number and **Report an issue** are in **Settings → About**. Include reproduction steps when reporting a problem; do not share account keys or private files.

## Development versions

0.x builds are development releases; **Orbit 1** is reserved for the first stable generation. Within a generation, numbered updates contain fixes and small additions, while the .5 milestone is a larger refinement update. A new Orbit generation indicates substantial completed changes.

The original release is labeled **0.1** but retains its legacy 1.x tag and internal version for compatibility. To move from that build to 0.2, run the 0.2 installer once and quit any older tray copy first. Older 1.x updaters cannot recognize 0.2 as newer. Back up preferences before migrating.

## Source and license

Orbit is [MIT licensed](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and [THIRD_PARTY.md](THIRD_PARTY.md) for dependency notices. Source archives attached to releases contain the corresponding build’s source and tests.

Orbit releases the interface after 30 seconds hidden in the tray when no dialog or file operation is open. Game tracking and update checks continue. Reopening uses the cached library. Settings → Appearance includes a graphics-memory option; changing it requires quitting and reopening Orbit.
