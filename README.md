# Orbit

Orbit brings your game libraries into one place. Find installed games, organize your collection, and launch the copy you want without searching through separate apps.

## Get started

1. Download **Orbit-Setup.exe** from [Releases](https://github.com/tkokero/Orbit/releases/tag/v1.0.0-pre.1) and run it once. Orbit installs for your Windows account and opens automatically.
2. Orbit prepares your library behind its startup screen. Follow the setup guide, or skip optional connections and return from **Settings → General**.
3. Choose a game and select **Play**, or open **Details** for more options.

## Updates

The installed app checks for updates at startup and every six hours, downloads them in the background, saves its state, then closes and opens the new version. Your library settings and tracked hours stay in your existing profile. Orbit does not close your games.

**Settings → General** lets you disable automatic checks or automatic restarts. Use **Check for updates** to check manually, or **Restart now** when an update is ready. A failed download leaves the current app in place.

If you used the older ZIP build, install **Orbit-Setup.exe** once to enable this. The ZIP is still available for manual portable use; it does not replace itself automatically. Quit any older tray copy before opening the installed version.

## Your library

- Browse games and tools separately, search by title, and filter your collection.
- Combine duplicate entries while keeping their original sources visible. Installed copies take priority.
- Favorite games, hide entries, or add an executable manually.
- Use the recently played section to continue where you left off.
- Press **Ctrl+K** for quick launch across games and tools.
- Group games into **Playing**, **Backlog**, **Finished**, or your own collections.
- Switch to **Controller view** for larger controls, arrow-key navigation, or a standard gamepad. A selects and B goes back. This controls Orbit, not the game itself.
- Right-click a game for quick actions and library management.

## Offline access

After the first scan, Orbit opens your cached library without waiting for online services. It refreshes quietly in the background. **Settings → General → Offline mode** keeps discovery local and pauses online connections and update checks. Cached information can be out of date; a game still depends on its own offline support and authentication.

## Game details

View available playtime, achievements, artwork, installation information, and launch options in one place. **Launch settings** lets you select an executable, supply arguments, choose Orbit’s preferred view, and open supporting tools alongside a game. Arguments use a JSON array, for example `["--windowed"]`; store-controlled launches retain their own client settings.

Detected running games show a session timer and **Return to game**. Detection requires a known game executable; Windows may restrict bringing another app to the foreground. When a platform does not provide playtime, use Orbit's local tracking while Orbit is running. Information depends on what each library makes available; private or missing data remains unavailable.

## Install and manage

Open installation actions from game details or choose a standalone installer file. Account-based downloads may open the original store or launcher. Supported downloads show progress and time estimates when sufficient data is available. Confirmed completion can notify you; clicking the notification opens the game’s controls. Enable or disable this in **Settings → General**. Downloads managed by unsupported clients retain their own notifications.

Check published system requirements against your computer where supported. Some components require manual comparison. Browse available discounts and confirm pricing on the store before purchasing.

## Save backups and launch help

Open a game’s details and select **Save backups**. Choose its save folder, close the game, and select **Back up now**. Snapshots are stored locally inside Orbit’s data folder, separately from your installed game. Orbit does not guess where a game stores saves or automatically upload them.

**Preview restore** shows missing, different, and newer files. Newer saves stay in place unless you explicitly choose to replace them. Restoring makes a recovery snapshot first and leaves extra files untouched. Keep another copy outside this computer for protection against disk failure.

**Launch help** checks missing folders, executable paths, and conflicting launch arguments. It also appears when Orbit receives a launch error. Client authentication, game crashes after launch, and anti-cheat issues may still require the original client’s troubleshooting tools.

List view shows installation status, playtime, last played, and achievements when available, alongside platform information and a launch button. Narrow windows prioritize the essential columns.

## Backup and cleanup

In **Settings → Manage**, choose **Create backup** to save your settings, custom entries, collections, themes, and local playtime to a JSON file. Game files and account credentials are excluded. **Restore backup** shows a preview before replacing your Orbit data, and saves a recovery copy of the current data first. Reconnect accounts and locate moved executables as needed on another computer.

**Review library** checks for missing files, unavailable drives, and duplicate launch targets. Review copies or select entries to hide; it never deletes game files. Restore hidden entries from the same settings section. Reconnect an external drive before treating its games as missing.

## Make it yours

Choose a built-in theme or create, import, and export your own palette. Settings include startup behavior and animation, automatic library discovery, friends preloading and presence refresh, motion preferences, and display options. Reopen the setup guide whenever you need it.

## Friends

Connect supported accounts to view available friends, activity, and recent games. Privacy settings and platform support determine what appears. Status controls use the platform's official interface where available.

## Open source

Orbit is licensed under the MIT License. The repository contains the application code, documentation, and tests. See [Contributing](CONTRIBUTING.md) to build or modify the app. Release source archives are also available.

This is a Windows pre-release. The build is unsigned. Keep your original launchers installed when a game requires them for installation, updates, authentication, or launch.
