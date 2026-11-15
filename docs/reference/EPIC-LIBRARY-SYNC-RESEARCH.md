# Epic account-library sync research

October 25, 2026. Research and proposed scope, not an implemented native connection.

## Finding

Account-wide Epic library sync is technically possible. The earlier explanation conflated Epic's product-scoped Ecom SDK with Epic Games Launcher's authenticated library services. An EOS application registration is not, by itself, a documented whole-library permission. Community launchers demonstrate the separate launcher-service route.

- Epic's Ecom quick start describes querying offers and audience items configured for the developer's product: https://dev.epicgames.com/docs/epic-games-store/services/ecom/ecom-quick-start
- Epic Account Services documents profile, presence, friends, and country permissions, not a general launcher-library scope: https://dev.epicgames.com/docs/epic-online-services/accounts-and-social/eos-epic-account-services/getting-started
- Legendary's API implementation retrieves authenticated library records and follows pagination cursors: https://github.com/legendary-gl/legendary/blob/master/legendary/api/egs.py
- Playnite's Epic connector authenticates, refreshes tokens, queries the library service, follows cursors, enriches catalog metadata, and reads playtime: https://github.com/JosefNemec/PlayniteExtensions/blob/master/source/Libraries/EpicLibrary/Services/EpicAccountClient.cs

These implementations demonstrate technical feasibility. They do not establish that Epic offers Orbit the same access through a supported public SDK or grants a dedicated read-only launcher-library token. The `/public/` endpoint name does not mean unauthenticated access.

## Current Orbit

Source inspection confirms local Epic installation manifests and offline catalog/entitlement caches are used. Orbit also has a user-selected Legendary executable import that runs `list --json`; it asks users to sign into Legendary separately. This is not a native Orbit account connection, periodic account sync, or proof of current ownership from local installation data alone.

## Implementation options

1. Improve local discovery independently. Rescan manifests on changes, validate real game targets, improve artwork matching, and distinguish installed, cached ownership, and verified account-library entries. This cannot discover the complete uninstalled account library on its own.
2. Build an optional Orbit UI around a maintained helper. First prototype the existing Legendary path with a dedicated account/profile, explicit sign-in, machine-readable list responses, cancellation, failure recovery, and no terminal required in the ordinary Orbit flow. Treat it as a third-party integration and review its authentication/storage/update behavior before bundling it. Keep dependencies and notices accurate.
3. Build Orbit's own connector. This gives more control over native UX and secure token storage, but requires maintaining launcher authentication, expiration/refresh behavior, library pagination, metadata changes, challenge handling, and account isolation. Confirm Epic's available authorization/client access before claiming official support. Do not hardcode borrowed application credentials merely because another project's source exposes them.

The recommended first milestone is an isolated proof of concept for sign-in and complete account-library reads. That resolves the highest uncertainty before building a polished connection screen or promising permanent sync.

## Proposed user experience and data flow

- Connect Epic opens Epic's own browser sign-in. Orbit does not ask users to enter their Epic password into an Orbit form. MFA and other challenges stay with Epic. Callback/code handling still needs a real prototype; seamless browser return is not established by this research.
- Import the connected account's complete library, following every page, then enrich games with catalog metadata.
- Match installations by Epic identifiers and namespace rather than fuzzy title matching. Distinguish DLC, editions, base games, bundles, and software; do not add every catalog item as an owned game.
- Preserve local installs and user organization separately from the current account's ownership snapshot. Switching accounts must not mix entitlements. Never discard a cached library because one refresh failed, and never delete artwork, tags, collections, or manual entries when a title disappears from a complete account result.
- Show the account, last successful sync, refresh/reconnect actions, and cached/offline state. Keep background work bounded and do not block the initial Desktop window on authentication or network access.
- Keep the initial feature to library browsing and organization. Continue launching and installing through the Epic client; custom downloading, purchases, cloud-save management, and Friends are separate features.

## Authentication and privacy requirements

Restrict Orbit's implemented operations to library and necessary metadata reads. Do not describe the connection as token-level read-only unless that is actually verified. A launcher-session token may be able to do more than Orbit's UI exposes.

Remembered credentials need Windows-protected storage and no token-bearing logs or exports. A helper's default storage behavior must be checked; wrapping a CLI does not automatically give its credentials DPAPI protection. Disconnect should remove Orbit's own saved session without disrupting the user's existing Epic client account.

Do not silently import Epic launcher credentials. Legendary's documented `auth --import` path can log the user out of the Epic launcher: https://github.com/legendary-gl/legendary#quickstart

No sign-in, account request, credential import, Epic purchase, or Epic account mutation was performed during this research. Any live authorization check needs a user-agreed playtest.

## Acceptance checks before calling this complete

Validate sign-in, cancellation, MFA/challenges, a library large enough to require pagination, free claimed games, uninstalled titles, DLC/edition identity, account switching, offline startup, expired/revoked sessions, interruption mid-sync, settings preservation, and clear retry behavior. No partial/failed response should erase the previous library. Verify token capabilities and actual storage behavior rather than inferring them from the limited UI.

Treat this as a separate optional integration after 0.2.6 stability work, not an already completed release feature.
