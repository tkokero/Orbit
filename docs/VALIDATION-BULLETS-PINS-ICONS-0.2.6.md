# News bullets, collection pins, and themed native icons

October 25, 2026. Local development candidate installed under the user's standing approval; unpublished.

## Changes

- Reproduced the actual Geometry Dash Update 2.209 feed format: each bullet is wrapped in Steam `[p]` tags. These paragraph boundaries now survive normalization. Literal bullet separators and encoded bullets also split into distinct notes, including after introductory text. The actual feed renders 20 list items in one list; no publisher note is removed.
- Pin collections uses a compact default frame, readable themed checkbox rows, saved collection symbols, distinct Smart badges, and a separate footer. Long lists scroll above the actions. Explicitly saved popup heights and shared/separate sizing behavior remain respected. Save persists choices; closing without Save leaves them alone; Manage collections releases the pin-only frame when opening its editor.
- The native running-window/taskbar icon and tray icon derive colors from the saved built-in or custom theme. Super Dark and photo-theme effective colors are supported. The saved palette is restored before constructing the main window and reapplied when a tray renderer is recreated. Changes use native icon setters without showing/focusing windows. Generated icon resources are limited to four palettes; no user artwork, pinned shortcuts, or theme choices are rewritten.
- Windows may cache the static pinned shortcut icon while Orbit is closed. No claim is made that existing shortcut/installer icons are recolored, and no live Windows taskbar playtest was performed.
- Icon generation reuses the existing lazy decoder with its 8 MB cache and single-worker limit. Cached palettes load from generated PNG/ICO resources; no polling or animation loop is added.

## Validation

- Full unit suite: 471 passed, zero failed, one explicitly opt-in native Roblox fixture skipped. Targeted news/icon suite: 19 passed, including paragraph-wrapped real-format notes, encoded separators, custom palettes, resource bounds, late-render ordering, valid PNG dimensions, and transparent corners.
- All 11 hidden UI checks passed, covering compact default pins, footer separation, Save/cancel preservation, navigation to Manage collections, long-list scrolling, saved explicit heights, 800/420-pixel layouts, 125% scaling, and the actual 20-note article. No native window shown or focused. Screenshots were inspected visually.
- First UI run caught the native dialog stretching `height:auto` to its inset bounds; the default pin frame now uses `fit-content`. Separate fixture construction errors were repaired before the final passing run.
- Final packaged verification matched all 215 source/document resources. All 358 packaged checks passed, exit code zero, with zero windows shown/focused. After routing native icon generation through the bounded shared decoder, the full unit and packaged checks were rerun on that exact build. Final receipts use work/bullets-pins-icons-final-026-* and outputs/bullets-pins-icons-final-026-packaged in the local workspace. Native taskbar/tray calls are covered by injected window/image tests; visible Windows icon rendering still needs user observation.

## Epic connection review

Current Orbit detects local Epic manifests and cached entitlements and offers a manual Legendary executable import for the signed-in account library. Detection, artwork, rescan behavior, and clearer sync status can be improved independently. Epic's documented Ecom services query offers/items configured for the developer's product; they do not establish a drop-in account-wide launcher-library connection. No Epic authorization, token handling, account changes, or new Epic connection was implemented in this pass.

Reference: https://dev.epicgames.com/docs/epic-games-store/services/ecom/ecom-quick-start?lang=en-US

## Local installation

The user gave standing approval to install finished, validated builds automatically. The exact final candidate installed silently with exit code zero; archive and native resources matched the tested package. Normal and dev settings, seven custom themes in each profile, 17 managed artwork/media files, and the encrypted Discord connection were preserved. Backups and receipts use work/bullets-pins-icons-final-026-install.json, work/bullets-pins-icons-final-026-preservation-verification.json, and work/bullets-pins-icons-final-026-credentials-preserved.json. Orbit did not reopen or take focus; no public release or update feed was published.
