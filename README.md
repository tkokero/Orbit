Orbit

A Windows launcher with separate Games and Tools libraries. The interface groups platforms into Steam, Epic Games, and Others while retaining the exact source in game details. Installed copies take priority. Covers, available Steam statistics, and recent-game banners are included. The source code is MIT licensed; see LICENSE and THIRD_PARTY.md.

## Start

1. Extract `Orbit-Windows.zip` if you downloaded the ZIP.
2. Open `Orbit-win32-x64/Orbit.exe`.
3. Keep the entire `Orbit-win32-x64` folder together; the EXE needs its accompanying files.

The portable app runs without Node.js or an installer. It is unsigned. It scans at startup. Use Refresh for an immediate rescan; there is no background polling or automatic rescan when you switch windows.

## Automatic connections

| Source | Automatically available | Additional setup or limits |
| --- | --- | --- |
| Steam | Installed games on registered drives; the most recently used local account's play history, hours, achievement cache, and artwork | Connect your Steam account for owned games never played locally |
| Epic Games | Installation manifests, offline account catalog entries, existing Legendary/Heroic metadata, and cover metadata | A signed-in Legendary import is needed for the full online library; Epic statistics are not integrated |
| Ubisoft Connect | Registered installations and cached launchable base games; non-launchable DLC is excluded | Refresh its catalog in Ubisoft Connect; online statistics are not integrated |
| EA, GOG, Battle.net | Registered Windows game installations when available | Full online libraries and statistics are not integrated; additional titles can be imported |
| GRYPHLINK, Riot, Roblox, standalone games | Recognized game-specific Start menu/desktop shortcuts whose executable exists | Original launchers handle sign-in, game downloads, updates, and unavailable statistics |
| Xbox and other sources | Manually added executables and imported catalogs | No automatic Xbox account integration |

Local discovery and online account authentication have separate status messages in Sources & settings. Steam history can include refunded, removed, or family-shared games; cached catalogs can be stale. Each game version shows its provenance. Catalog artwork alone is never used as proof of ownership.

Orbit does not read passwords from other apps, copy their browser cookies, change privacy settings, or log you out of a store client.

### Connect Steam's full library

Open **Sources & settings → Connect Steam account** and sign in on Steam's own page in the separate window. Orbit keeps this separate browser session and reuses it on later launches.

Alternatively, expand the Web API form and supply a SteamID64 and Steam Web API key. The API-key method needs public Steam Game details. The key is used once and is not saved.

The web connector resolves owned app IDs using local Steam metadata or the store. Known DLC/tool records are excluded. If a title cannot be resolved, the source status reports the unresolved count. The authenticated flow requires your own sign-in and was not verified with a signed-in account during automated testing.

### Connect Epic's full library

Install [Legendary](https://github.com/legendary-gl/legendary), run `legendary auth`, and sign in to Epic. Choose **Sources & settings → Import via Legendary**, then select `legendary.exe`. Orbit runs `list --json`. It does not use Legendary's option to import Epic credentials or log you out of Epic. Legendary is optional and is not bundled.

Play opens the game through the Epic client. Install opens Epic's library so you can select the title. A Legendary-only installation is not automatically claimed as playable through Epic.

## Standalone launchers and Endfield

Orbit discovers supported game-specific `.lnk` files in Start menus and desktops. **Arknights: Endfield** opens its existing GRYPHLINK shortcut with the original Endfield arguments. VALORANT similarly uses its Riot shortcut.

These cards say **Launcher ready** and offer **Open launcher**. A valid launcher shortcut does not establish that the full game is downloaded, so these entries are separate from verified installations. A verified installed copy takes priority.

Use **Add a game** for another local executable. **Locate executable** adds a playable local copy to an existing card and makes it preferred. Games needing DRM, anti-cheat, or special arguments should use their original launcher integration.

## Hours, achievements, and game details

Open a card to see available:

- Playtime and its source, last-played timestamp, and recent playtime when supplied.
- Achievement totals, completion percentage, cached unlocked/upcoming achievements, unlock dates, descriptions, rarity, and icons.
- Installation size, a short description, installation folder, and every store copy.

The current automatic statistics integration uses **Steam's local account cache**. Detailed achievement lists can be partial even when a total is known; the UI states this. Missing statistics show **Unavailable**. A zero-total cache is described as having no cached achievement set.

Online statistics for Epic, Ubisoft, EA, GOG, Battle.net, Riot, Roblox, and GRYPHLINK are not integrated. Orbit does not infer hours from launcher uptime. Original clients remain responsible for achievements, cloud saves, downloads, updates, authentication, and DRM.

The banner defaults to the latest game with a recorded store play timestamp. Five recent-game buttons let you switch it. Orbit records a launch request separately, so clicking Play does not claim that gameplay occurred or increase hours.

## Covers

Artwork lookup uses Steam's local cache, including hashed asset folders; Steam's official asset CDN; Epic and Ubisoft metadata; and supported official game website images. Exact-title Steam store lookup is a fallback. Using Steam artwork for another store's game does not add a Steam ownership claim.

Images are decoded and validated before use, then cached as standard JPEG thumbnails (at most 320 × 480), banners (1200 × 450), or achievement icons (64 × 64). New hashed Steam asset folders and AVIF/WebP sources are supported. Corrupt images fall back to other available sources. Broken visible covers trigger a repair attempt. Use Repair image in an entry or Settings → Repair images to rebuild cached art. Matching uses an exact normalized title or explicit app ID; editions and sequels stay distinct. Artwork belongs to its owners. Offline or unavailable images fall back to a title card.

## Library controls and duplicates

- Games and Tools have separate navigation and counts. Steam application/tool metadata and known utility names determine the default category. Use Move to Tools / Move to Games in details to correct it; your choice persists.
- Search with `/`, filter by Steam/Epic/Others or installation status, favorite entries, sort, or switch grid/list views. The exact launcher remains visible on each card and in details.
- Matching ignores capitalization, punctuation, trademark symbols, and `&` versus `and`.
- Sequel numbers, demos, remasters, and edition names remain distinct.
- Explicit cross-store Steam IDs can identify a renamed version of the same game.
- Selection prefers installed copies, then working game-specific launcher shortcuts, then your source preference between equally available copies.
- Combining duplicates never deletes installed game files.
- Hide entries in game details; restore them through Sources & settings → Hidden games.

## Import and export

Import a JSON array or an object containing a `games` array:

```json
[
  { "title": "Portal 2", "source": "Steam", "appId": "620" },
  {
    "title": "Your GOG game",
    "source": "GOG",
    "appId": "your-product-id",
    "installUrl": "https://www.gog.com/account"
  }
]
```

Steam requires a numeric app ID and receives automatic Play/Install links. Other entries may supply supported `launchUrl` and `installUrl` values. Imported files cannot claim a game is installed or supply executable shell commands. Catalog export contains game/store links; it is not a full profile or achievement backup.

## Data and troubleshooting

Packaged data is stored in `%APPDATA%\Orbit`:

- `library.json`: imports, remembered titles, favorites, hidden entries, and source preferences.
- `artwork/`: downloaded covers.
- `Partitions/`: Orbit's separate Steam browser session, if connected.

Development uses the package name for its profile. Smoke tests use a separate temporary profile. Library writes use a temporary file and rename; unreadable existing library files are backed up.

For missing games, refresh after opening their original client and reconnect unavailable drives. Scan notices identify unreadable paths; this PC currently has an unavailable `E:\SteamLibrary` entry. Remembered games remain listed after uninstalling. Full owned libraries can require account setup even when local games were detected.

If a safe launch target cannot be determined, use Locate executable or the original store integration. Refresh after playing to pick up newly written cache data.

## Develop and test

Requires Windows and Node.js 22.12 or newer:

```powershell
npm install
npm start
npm test
npm run scan
npm run package
```

Run the Electron UI/integration checks with:

```powershell
$env:ORBIT_SMOKE_DIR = "$PWD\smoke-output"
.\node_modules\.bin\electron.cmd . --smoke-test
```

The smoke run checks discovery, filters, favorites, source dialogs, recent-game order, statistics panels, cover image decoding, and dry-run Play/Install/shortcut routing. It writes `smoke-report.json`, `orbit-preview.png`, and `orbit-game-details.png`. It does not launch games or authenticate accounts.

The renderer is sandboxed with context isolation and a narrow preload bridge. The main process validates targets and launches executables without a command shell. Recognized shortcuts are opened through Windows to preserve their original arguments.

References: [Electron isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation), [Steam API](https://partner.steamgames.com/doc/webapi/IPlayerService), [Steam appinfo format](https://github.com/xPaw/SteamAppInfo), [Playnite format references](https://github.com/JosefNemec/PlayniteExtensions), and [Legendary](https://github.com/legendary-gl/legendary).
## Resource use

- Library pages contain at most 30 cards. Only images in or near the viewport load.
- Achievement details are requested when an entry is opened; the initial library payload contains summaries.
- Achievement icons are fetched only when they become visible. Closing details releases their DOM nodes.
- Covers and banners are bounded JPEGs, avoiding repeated full-resolution image decoding.
- Two image workers run at most; libvips concurrency is one and its memory cache is limited to 8 MB.
- Cached local art is preferred before network requests. Valid thumbnails are reused without rewriting them.
- The merged library is computed once per change. Remembered catalogs retain compact achievement summaries.
- Startup and manual scans run in a short-lived worker. It exits after transferring its result, releasing parser and image-preparation allocations.
- There are no background scans, animation loops, auto-rotating banners, remote fonts, or backdrop blur effects. Hidden windows use Electron's normal background throttling.

Electron still has a Chromium runtime baseline. This build reduces work within that architecture; it does not claim to match the footprint of a native launcher. See performance-report.json in the deliverables for a local before/after sample when supplied.

## Open-source distribution

Original Orbit source is MIT licensed. The source ZIP includes LICENSE, THIRD_PARTY.md, CONTRIBUTING.md, tests, and the lockfile. No hosted public repository has been created. You can publish a fork with the license and notices preserved. Game art and brand trademarks are excluded from Orbit's source license.
