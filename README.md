# Orbit

Orbit is a Windows desktop app for organizing and launching games from connected libraries and local files. It is currently a pre-release: features may change, and some integrations are still being tested.

<img width="1441" height="959" alt="Orbit library interface" src="https://github.com/user-attachments/assets/3d6c36df-f84b-43a9-9ab8-8fbf21ea19b4" />

## Install and open

Download **Orbit-Setup.exe** from [Releases](https://github.com/tkokero/Orbit/releases) and run it. For portable use, extract the entire **Orbit-Windows.zip** folder before opening **Orbit.exe**. The Windows builds are unsigned.

The setup guide covers discovery, optional connections, appearance, and startup behavior, followed by a walkthrough of the controls. Reopen it from **Settings → General**. Keep any original clients your games require.

## Library and launching

- Browse **Library** and **Tools**, search titles and alternate names, or filter by platform, installation status, and other available information.
- Organize entries with favorites, collections, personal tags, and notes. Choose grid or list view.
- Detected copies stay together in game details. Select a preferred launch; automatic selection favors a working installed copy, then Steam.
- Open details to manage launch settings, choose an executable, create a desktop shortcut, or view available playtime and achievements. Right-click for quick actions, or press **Ctrl+K** for Quick launch.
- Add local executables or run a standalone installer. Other installations and some launch routes use the original client.

Detection identifies local installations and supported account records; finding a launcher does not prove ownership. Information and features depend on the platform, account privacy, and game. Missing information is shown as unavailable.

## News, friends, and downloads

**What’s new** shows Steam announcements for selected games in your library, with banner images and links to the original posts. News and artwork are cached; not every game has a supported feed.

**Friends** shows presence and shared activity where supported. Some platforms provide official-client controls instead of live friend lists. Account connections are optional.

**Downloads** keeps supported installation progress in one place. Transfer speed and remaining-time estimates appear when enough data is available. Use the original client for pause, resume, ordering, and bandwidth controls.

**Radar** contains your wishlist and featured Steam discounts. Save public store links and optional target prices; check supported prices on request. Prices are regional and may be cached. Confirm the final price on the store page. Other stores can be saved as links.

## Sessions, storage, and backups

Local playtime tracking counts sessions while Orbit is running. **Activity** shows recorded sessions; **Storage** lists known installation folders and drive space, with folder sizes measured on demand.

Choose a save folder in a game’s details to create local save snapshots. Restore previews changes and keeps a recovery copy. Optional automatic snapshots run after detected sessions. Close the game before restoring, and keep another backup elsewhere.

**Settings → Manage** can back up Orbit preferences and local hours, restore hidden entries, review launch problems, and export information. Preference backups do not include game files or account credentials.

## Settings and updates

Settings cover discovery, startup, closing to the tray, notifications, themes, accessibility, and updates. The installed version can download published updates and restart when games and local tasks are idle. Portable updates are manual. Draft releases are not available to the public updater.

Closing the window normally keeps Orbit in the tray for tracking and background tasks. Use the tray menu to quit. Offline mode stops new online checks; cached information may be outdated, and games retain their own authentication requirements.

System information and approximate performance estimates use the current computer’s detected hardware. FPS figures are estimates, not measured benchmarks.

The full build number and **Report an issue** are in **Settings → About**. Include reproduction steps when reporting a problem; do not share account keys or private files.

## Development versions

0.x builds are development releases; **Orbit 1** is reserved for the first stable generation. Within a generation, numbered updates contain fixes and small additions, while the .5 milestone is a larger refinement update. A new Orbit generation indicates substantial completed changes.

The original release is labeled **0.1** but retains its legacy 1.x tag and internal version for compatibility. To move from that build to 0.2, run the 0.2 installer once and quit any older tray copy first. Older 1.x updaters cannot recognize 0.2 as newer. Back up preferences before migrating.

## Source and license

Orbit is [MIT licensed](LICENSE). See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and [THIRD_PARTY.md](THIRD_PARTY.md) for dependency notices. Source archives attached to releases contain the corresponding build’s source and tests.
