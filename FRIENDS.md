# Friends integration

## Current capabilities

| Platform | Friends and activity in Orbit | Status changes |
| --- | --- | --- |
| Steam | Official GetFriendList + GetPlayerSummaries using a user-supplied Web API key | Official Steam Friends & Chat interface |
| Epic Games | Requires a separately registered EOS social integration; not connected in this build | Opens the official launcher for available profile/social controls |
| Discord | Requires a separately registered Social SDK integration; not connected in this build | Opens the official Discord web client |

The UI accurately labels client-only platforms. No private client tokens, passwords, browser cookies from other applications, or undocumented write APIs are used. A library connection is distinct from a social connection. Display names are never used to merge identities across platforms.

## Steam behavior

`src/social.cjs` normalizes identity, presence, and shared game names. Requests use batches of at most 100 Steam IDs, with at most two concurrent summary requests. The read cache has a 30-second minimum refresh interval. The renderer refreshes about every 60 seconds only when Friends is visible and the window is focused. It cancels scheduled refreshes when hidden or blurred; no provider background timer exists.

Offline and invisible are deliberately indistinguishable. No last-played data is substituted for current activity. Missing summaries become unavailable rather than inferred online. Errors preserve any cached rows as explicitly stale. Disconnect aborts work and rejects late results by generation.

Credentials are memory-only unless Remember is selected. Persisted API keys use Electron safeStorage (Windows DPAPI) in `social-credentials.json`. API keys do not enter snapshots, exports, logs, or renderer storage. Friend lists are held in memory and never written to disk. Steam profile avatars and game icons are fetched lazily from Valve CDN URLs and cached as small local images. Initials and a neutral game placeholder remain when images are unavailable. Recent game details use GetRecentlyPlayedGames, are held in memory for five minutes, and load only for visible cards with two card workers. Total hours and hours from the past two weeks are distinct; a recent-game entry never implies current activity. Private or missing data stays unavailable. Disconnect clears the details cache; cached avatar/icon files remain on disk.

Status buttons use fixed, allowlisted destinations. They do not programmatically modify a persona or assert success. Users choose status in the official client. No code sends messages, friend requests, or game invites.

## Extending providers

The provider capabilities are explicit in `providers()` in `src/social.cjs`. A future Epic or Discord adapter must use an authorized, registered integration and the platform's permissions. Add an independent platform-scoped identity, read capability, and explicit status-write capability only after the provider confirms support. Do not mark an adapter connected because a game library was scanned. Keep the renderer bridge narrow and do not accept arbitrary URLs or executable commands.

## Sources

- [Steam IPlayerService](https://partner.steamgames.com/doc/webapi/IPlayerService)

- [Steam Web API ISteamUser](https://partner.steamgames.com/doc/webapi/ISteamUser)
- [Steam Friends & Chat](https://help.steampowered.com/en/faqs/view/595C-42F4-3B66-E02F)
- [Epic Account Services setup](https://dev.epicgames.com/docs/epic-online-services/accounts-and-social/eos-epic-account-services/getting-started)
- [Discord Social SDK client](https://discord.com/developers/docs/social-sdk/classdiscordpp_1_1Client.html)
