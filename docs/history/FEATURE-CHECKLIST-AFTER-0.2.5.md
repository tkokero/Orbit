# Desktop feature checklist after 0.2.5

0.2.5 is already published. This checklist uses it as the baseline for future work; it does not add promises to that release. Status reflects source inspection on 2026-10-24. Local development work is not a published feature.

## Already available: improve rather than introduce again

| Feature | Status | Useful next improvement |
| --- | --- | --- |
| Controller Mode and bindings | Released in 0.2.5 | Keep maintenance fixes; Desktop remains the priority. |
| Shared or separate popup sizes | Released in 0.2.5 | Drag to move, remember positions per display, recover offscreen windows. |
| In-app Steam news | Released in 0.2.5 | Links and inline photos are in 0.2.6-dev.1; validate more article formats. |
| Context menus | Already present | Themed secondary actions are in 0.2.6-dev.1; improve keyboard access and consistency. |
| Steam controls and downloads | Already present | Redesigned tabs, download controls, and storage review are in 0.2.6-dev.1. |
| Custom artwork | Already present | Consistent banner proportions and crop controls are in 0.2.6-dev.1. |
| Discord Rich Presence | Already present | Keep sharing optional; friends authentication must be a separate connection. |
| Settings and theme preservation | Released improvement in 0.2.5 | Continue upgrade checks; a clear section reset and save status would help. |
| Windows startup and tray | Already present | Registration repair and status are in 0.2.6-dev.1; user confirmed Windows sign-in launching works on October 24, 2026. |

## Recommended for 0.2.6

- [x] **New (0.2.6-dev.8):** cover or landscape-banner library layouts with contained artwork fallbacks.
- [x] **New (0.2.6-dev.8):** persistent card-size and spacing controls.
- [x] **New (0.2.6-dev.8):** manual and smart collections pinned in the sidebar.
- [x] **New (0.2.6-dev.8):** Ctrl/Shift multi-selection, Select all results, and a selection count.
- [x] **New (0.2.6-dev.8):** bulk favorites, tags, collections, and hiding, with conflict-safe Undo.
- [ ] **Improvement:** draggable popups with saved positions per display and reachable headers/actions.
- [ ] **Improvement:** preserve scroll position and focus through game details, filtering, refreshes, and return from play.
- [ ] **Improvement:** active filter chips, result counts, Clear filters, and useful empty results.
- [ ] **Improvement:** confirm Windows sign-in startup with both visible and tray preferences.
- [ ] **Improvement:** finish validation of the current development build before publishing it.

## Friends: separate milestone with external prerequisites

A native Discord preview is now installed locally in 0.2.6-dev.2 for testing. Its friends-only authorization still needs a completed live check; this is not a released or fully validated feature.

- [ ] **New:** official Discord account linking, saved securely, with automatic reconnect and explicit disconnect.
- [ ] **New:** Discord friends and online status inside Orbit's existing combined friends list.
- [ ] **Improvement:** provider-specific connection, retry, stale-state, and privacy messages.
- [ ] **New:** official Epic Account Services authentication and friends support after product registration and review.
- [ ] **Validation:** real sign-in, cancelled sign-in, restart/reconnect, revoked access, offline use, and disconnect with the registered applications.

Discord Social SDK registration is now enabled for Orbit; the official Windows SDK is downloaded, the native helper builds, and Public Client plus the local callback are saved and verified. The initial presence bundle requested more access than the user wanted, so its live test was cancelled. A friends-only scope is implemented but its live authorization attempt timed out; compatibility remains unverified and is a release blocker. Do not ship a broader fallback. Discord SDK presence does not expose other games' activity; describe it as online status and Orbit activity, not a universal activity feed. Epic friends are limited to users who have consented to the same application. Do not promise the complete Epic launcher friend list.

## 0.2.7

- [ ] **New:** unified search for games, collections, and settings.
- [ ] **New:** named launch presets such as Normal, Modded, VR, and custom presets.
- [ ] **New:** customizable keyboard shortcuts.
- [ ] **Improvement:** consistent context actions and useful launch-error recovery.
- [ ] **Explore:** SteamVR detection, explicit launch presets, and clear runtime status through supported interfaces.

## 0.3.0

- [ ] **Main feature:** clipping with capture controls, a clips library, trimming, and export.
- [ ] **Supporting work:** storage limits, retention controls, capture indicators, and performance validation while playing.

The version assignments are recommendations. Keep release notes limited to completed, validated scope.

0.2.6-dev.3 adds a saved Overlay/Split Desktop feature-banner choice. Read-only Discord friends, refresh, and reconnect passed a local test with 52 friends; public release review remains separate.

0.2.6-dev.4 adds local, confirmed Steam/Discord profile links, name-match suggestions, and an option to keep profiles separate. Combined cards retain independent platform statuses and can be unlinked anytime.

0.2.6-dev.5 refreshes the Desktop Friends page, adds context-aware right-click menus across the app, corrects account/profile button geometry and contrast, and moves Updates into Manage.

0.2.6-dev.6 simplifies Friends into compact cards with collapsed account controls. Online excludes Away and outdated presence, with shared game activity first, DND next, and simply online friends last.

0.2.6-dev.8 adds Desktop cover/banner/list layouts, persistent card size and spacing, pinned manual/smart collections, Ctrl/Shift selection, bulk organization, and Undo.

0.2.6-dev.9 adds active filter chips, result counts, complete filter clearing, useful empty results, collection renaming, icons and theme colors, and scroll/focus restoration after closing details or refreshing the library. Appearance is included in backups. The release remains a draft; the final stable installer, upgrade review, and provider availability are separate publication checks.
