# Orbit

A Windows launcher for keeping your game libraries in one place. Orbit finds supported local installations, combines duplicate titles, and opens the installed copy. Your games, tools, and friends each have their own view.

## Download and start

Download the current **Windows build** from [GitHub Releases](https://github.com/tkokero/Orbit/releases/tag/v1.0.0-pre.1). Extract the ZIP, then open `Orbit-win32-x64/Orbit.exe`. Keep the entire folder together. This pre-release is unsigned.

Orbit scans supported library locations when it starts. Use **Refresh** after connecting a drive or installing a game. **Settings → Libraries** shows which sources were found and offers account setup where supported. Finding a local library does not mean its full online account is connected.

## Everyday use

- **Games** is your combined library. Steam and Epic Games have their own filters; other sources appear under **Others**. Game details retain the original source.
- **Tools** keeps mod managers and utilities out of the game list.
- **Continue playing** shows recent games, their available hours, and when you last played. Select a recent game to feature it, then choose **Play** or **Details**.
- Search by title, filter installed games or favorites, and switch between grid and list views.
- Right-click a game for launch options, preferred copy, executable location, artwork repair, classification, or hiding. Use **Settings → Hidden** to restore hidden entries. **Shift+F10** opens the same menu from the keyboard.

Installed copies take priority when a title appears in multiple libraries. Sequels, editions, and remasters remain separate. **Launcher ready** means Orbit found a launcher entry; it does not confirm the full game is installed.

## Install games

Orbit can work without Steam for games distributed independently or through other stores.

| Source | How installation works |
| --- | --- |
| Standalone installers | Choose **Install from file** in Add game, game details, or Settings → Libraries. Select an `.exe` or `.msi`, review its location, then finish setup in the installer window. |
| Epic Games and other stores | Use the game's **Install** action when a supported install link is available. Settings → Libraries also opens official clients or account pages for downloads. Each store handles its own account, purchase, and installation. |
| GOG offline downloads | Download the offline installer from your GOG account, keep its accompanying data files together, then use **Install from file**. |
| Steam purchases | Steam downloads and authenticates Steam games. Orbit opens the supported Steam install action. |

After setup, select **Refresh**. If automatic discovery does not find the game, use **Add game → Choose executable**, or **Locate executable** in an existing game's details. Select the installed game executable, not its setup file.

Starting an installer does not mark a game installed. Orbit never runs silent installs or claims an installation completed without detecting the result. Follow any Windows permission prompts yourself.

## Downloads and time estimates

The **Installations** panel shows progress reported by supported launchers. Steam byte counts can provide transferred size, observed speed, and an estimated time remaining after at least two useful updates. Estimates follow the download or installation phase and reset after pauses, restarts, or stale samples.

These are estimates from launcher manifest updates, not continuous network measurements. Queued, paused, and unsupported downloads do not receive invented timers. Use **Open downloads** for the launcher's full controls. Other stores may expose only a general installation state.

## Steam deals

Expand **Steam deals** to load featured discounted games from Steam's store feed. Choose a store region to see its currency, original price, and discount price. Select a game to open its Steam store page.

The feed loads on request and is cached for 30 minutes. Check the displayed region and timestamp; Steam confirms the final price, availability, and purchase terms. Orbit does not purchase games or collect payment details.

## System requirements

Open a Steam-matched game's details and choose **Check system requirements**. Orbit displays the publisher's minimum and recommended requirements beside a local PC snapshot.

RAM and available storage are compared automatically when the publisher provides readable numbers. Storage refers to the detected installation drive, or the Windows system drive when no location is known. CPU, GPU, operating system, and DirectX entries may need manual review. A model name alone cannot establish relative performance, driver support, or expected frame rate. Missing requirements remain **Not listed**.

Hardware checks run on request and stay on your computer. Steam receives the game ID, not your PC specifications. Hardware snapshots are cached briefly; game requirements are cached for a day. This is a comparison aid, not a benchmark or a guarantee that a game will run.

## Hours and achievements

Orbit uses supported platform statistics when available. Missing achievements are not estimated. For games without platform hours, Orbit can track the game process while it remains open. Use **Local playtime → Choose game executable** if detection needs help, or start the clearly labeled manual timer.

Local tracking starts with Orbit; it cannot recover previous sessions. Closing Orbit stops tracking. Manual timers continue until stopped or Orbit closes. Store totals take precedence if they become available.

## Friends

Connect Steam friends using your SteamID64 and Steam Web API key. Library sign-in and social access are separate. Steam's privacy settings determine which friends, presence, avatars, recent games, and playtime are shared. Current activity stays separate from recent history.

Keys are memory-only unless **Remember securely** is selected, which uses Windows encrypted storage. Friends refresh only while their view is visible and focused. Avatars and game icons are cached locally; missing images retain a fallback. Disconnect clears the active connection and remembered social key.

Status controls open the official client, where you choose your status. Epic Games and Discord currently provide client controls only; they do not supply live friend feeds in Orbit.

## Make it yours

**Settings → Appearance** includes 14 built-in palettes, a custom color editor, and JSON theme import/export. Motion can be disabled and respects Windows reduced-motion preferences. **Settings → General** includes startup, minimize-on-play, remembered views, and automatic discovery options.

Automatic discovery watches supported folders rather than repeatedly scanning the whole computer. Artwork is cached, card lists are bounded, and store and hardware requests run only when needed. Electron has a baseline memory cost; the separate demo's measurements do not represent every desktop workload.

## Troubleshooting and backups

| Problem | Try this |
| --- | --- |
| Missing game | Refresh, check the drive is connected, then add its executable manually. |
| Wrong copy launches | Open Details or right-click and select the preferred copy. |
| Missing artwork | Right-click → Repair image, or use Settings → Manage → Repair images. |
| Hours do not update | Check the game executable and keep Orbit open. Platform statistics can update later. |
| Private or unavailable friend details | Check Steam privacy settings and reconnect if needed. |
| Store or requirements unavailable | Try again later; the library remains usable without these optional services. |

Use **Settings → Manage → Open data folder** to find your local profile. Back it up with Orbit closed. Keep credential files private. Exporting the catalog preserves library information; it does not copy installed games or their save files.

## Build and contribute

Orbit's application code is MIT licensed. Download the attached **source ZIP** from the release for the complete application; GitHub's automatic source downloads reflect the repository tag and may differ from the attached build.

```sh
npm ci
npm start
npm test
npm run package
```

Run these commands in the extracted source folder with Node.js and npm installed. Packaging targets Windows x64. The source archive includes `CONTRIBUTING.md`, `THEMES.md`, `FRIENDS.md`, and `THIRD_PARTY.md` for development, customization, integration details, and third-party notices. Store artwork and platform trademarks belong to their respective owners.

The standalone demo uses sample data and original placeholder artwork. It cannot launch games, run installers, connect accounts, or change Windows settings. Sample deal prices and specifications are illustrative, not live offers.
