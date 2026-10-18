Orbit

Your games in one simple Windows library. Orbit combines supported local libraries, favors installed copies when games overlap, and keeps Games and Tools separate.

## Get started

1. Extract `Orbit-Windows.zip`.
2. Open `Orbit-win32-x64/Orbit.exe`.
3. Keep the application folder together; the executable needs its accompanying files.

Orbit scans your computer at startup. Select **Refresh** after installing or moving games. Local libraries connect automatically when supported data is available. Full online libraries may require signing in through **Settings**. Steam and Epic Games appear in the sidebar; other sources are grouped under **Others**. Each game's details show its original source.

## Your library

- Search, sort, or switch between grid and list views.
- Filter installed games, favorites, or platforms from the sidebar.
- Select a game to view its available statistics, copies, and launch options.
- Use **Play** for installed games or **Install** to open their store.
- Use **Add game** or **Add tool** to choose an executable manually.
- Move misclassified entries between Games and Tools from their details or right-click menu.

Installed copies take priority over uninstalled copies. Different editions, remasters, and sequels stay separate. A launcher-ready entry opens its own launcher and does not guarantee that the game is installed.

## Right-click actions

Right-click a game card, recent game, or featured banner for its available actions: play, view details, favorite, open its folder, locate its executable, select a preferred copy, repair artwork, move between Games and Tools, copy its title, or hide it. Use **Settings → Hidden** to restore hidden entries.

Right-click empty library space to add an item, refresh, change views, or open Settings. Keyboard users can open the menu with **Shift+F10** on a focused card.

## Playtime and achievements

Orbit displays hours and achievements supplied by supported sources. Availability depends on each library and its local cache or account connection. Missing achievements remain unavailable rather than being estimated.

For games without store-provided hours, Orbit measures local playtime while it is open. Launching a game through Orbit starts looking for its game process; the timer starts when that process is detected and stops when it exits. Games already running when Orbit opens can also be detected when their executable is known.

If detection needs help, right-click the game and select **Local playtime → Choose game executable**. Choose the actual game executable, rather than its store or launcher. You can also start and stop a clearly labeled manual timer from this menu or the game's details.

Local time begins with Orbit tracking; it cannot recover earlier sessions. Automatic process checks run about every five seconds, totals save every thirty seconds and on exit, and sleep time is excluded. Keep Orbit open during play. Closing Orbit stops tracking; it does not guess time spent playing while closed. A manual timer continues until stopped or Orbit closes. Store-provided totals take precedence if they later become available.

## Artwork and settings

Covers are cached locally. Right-click a game and select **Repair image** for damaged artwork, or use **Settings → Repair images** for the library. Settings also provides account connections, catalog import/export, and hidden entries.

Steam account connection can add owned games missing from local history. Epic's full library import uses an optional supported account helper, with setup available in Settings. Connecting one library does not sign in to other services automatically.

## Local data and resources

Preferences, artwork, and library data are stored in `%APPDATA%\Orbit`. Local playtime and executable choices are stored in `playtime.json` there. Back up this folder to preserve your settings and hours. Catalog export is a list of games, not a complete backup of these files.

Orbit loads artwork as needed, displays a limited page of cards, and scans on startup or request. Playtime monitoring is active only while a game is being tracked or awaited; it stops polling when idle. No game process is modified.

## Open source

Orbit's application source is MIT licensed. See `LICENSE` and `THIRD_PARTY.md` for dependency and artwork notices. Game artwork and platform trademarks belong to their owners. This build is unsigned.

To run from source, install Node.js, open the source folder, then run:

```powershell
npm install
npm start
```

Run checks with `npm test`. Create a portable Windows build with `npm run package`.
