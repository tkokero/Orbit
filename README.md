# Orbit

Orbit is a Windows desktop app for viewing, organizing, and launching games from connected libraries and local files. This version is a pre-release.

<img width="1441" height="959" alt="image" src="https://github.com/user-attachments/assets/3d6c36df-f84b-43a9-9ab8-8fbf21ea19b4" />

## Install and open

Download **Orbit-Setup.exe** from [Releases](https://github.com/tkokero/Orbit/releases/tag/v1.0.0-pre.1) and run it. For portable use, download **Orbit-Windows.zip**, extract the whole folder, and open **Orbit.exe**.

The setup guide covers library discovery and optional account connections. You can reopen it from **Settings → General**. Keep any original clients that your games require.

## Use the library

- Browse Games or Tools, search by title, or filter by platform and installation status.
- Open a game’s details to launch it, choose a copy, view available information, or locate its executable.
- Use **Ctrl+K** for quick launch. Right-click an entry for more actions.
- Use favorites and collections to organize entries. Hidden entries can be restored in Settings.
- Switch between grid and list views. List view shows status, playtime, last played, and achievements when available.

**Launch settings** can set a preferred executable, arguments, supporting tools, and Orbit’s controller view. Store-controlled launches may still use their original client’s settings. Controller view changes navigation in Orbit, not controls inside a game.

Playtime, achievements, friends, installation progress, and other information depend on the source and account privacy settings. Missing information is shown as unavailable. Local playtime tracking requires Orbit to remain running. A detected running game has a session timer and a **Return to game** control.

## Settings and offline use

Settings cover startup, closing to the tray, discovery, notifications, appearance, and updates. Closing the window normally leaves Orbit in the system tray; use the tray menu to quit.

After the first scan, Orbit can open its cached library and refresh in the background. **Offline mode** keeps discovery local and stops new online checks. Cached information may be out of date. Each game still has its own offline and authentication requirements.

System requirements and FPS estimates use detected hardware. Estimates are approximate and are not measured benchmarks.

## Backups and troubleshooting

In **Settings → Manage**, create or restore a backup of Orbit settings, custom entries, collections, themes, and local hours. These backups exclude account credentials and game files. Restore shows a preview and keeps a recovery copy first.

For game saves, open **Save backups** in the game’s details and choose its save folder. Close the game before backing up or restoring. Restore previews file differences, keeps newer saves by default, and creates a recovery copy. Snapshots stay on this computer; keep another copy elsewhere if needed.

**Launch help** checks missing folders, executable paths, and launch arguments. **Review library** finds missing targets and duplicate launch paths. Cleanup hides selected entries; it does not delete game files. Client authentication and game-specific errors may require the original client’s repair tools.

## Updates and feedback

The installed version can download updates and restart into the new build. Update controls are in **Settings → General**. Portable builds require manual updates. Quit an older tray copy before opening an updated installation.

Report problems in [Issues](https://github.com/tkokero/Orbit/issues) with the Orbit version, affected game or platform, and steps to reproduce them. Do not include account keys or private files.

## Source and license

See [Contributing](CONTRIBUTING.md) for build instructions. Orbit is licensed under the [MIT License](LICENSE). Third-party notices are in [THIRD_PARTY.md](THIRD_PARTY.md).
