# Guide visibility and popup backdrop

October 25, 2026. Local 0.2.6 candidate; unpublished.

The tour previously stayed in the lower-right corner. It now stays horizontally centered, with a viewport-aware bottom margin of 16–48 CSS pixels. The card, Next/Back actions and copy retain their existing sizing. All 23 steps keep the same action position at a fixed viewport. Content reserves enough scroll space for the centered card; scroll padding is applied to the actual scroll container. Closing the guide still restores the original workspace, filters, selection, scroll and focus.

The shared popup backdrop entrance keyframes previously animated a background color, ending at a theme-colored wash before returning to the normal neutral backdrop. This caused a transient colored flash. Entrance and dismissal now animate opacity only; the backdrop's existing background remains unchanged. Theme choices and popup sizes are not modified.

## Validation

- Full unit suite: 475 passed, zero failed, one explicitly opt-in native fixture skipped.
- Hidden UI fixture checks all 23 guide steps for centering, readability, viewport fit and stable Next position; checks restoration and cancellation, plus 1440px, 800px at 125% scale, and 420px layouts. Screenshots inspected at wide and narrow widths.
- Motion-enabled backdrop samples at opening and during/after the fade retain the same neutral background in Orbit, Rose, Cloud and Dark. Reduced-motion disables backdrop animation.
- UI fixture uses isolated data and creates no shown/focused windows. Existing Downloads/Steam workspace preservation checks pass.
- Package, installation and settings-preservation receipts are recorded under `work/guide-visibility-026-*`; UI results and screenshots are under `outputs/guide-visibility-ui-check`.

No release publication or live game/account playtest is part of this change.

## Installed result

99 hidden UI checks and 358 packaged regression checks passed. Installed archive matches the validated package. Both profiles retained settings and seven custom themes each; all 17 normal-profile managed artwork/video files and one encrypted Discord connection were preserved. Quiet installation completed at 20:18 local time without reopening a foreground window. Release remains unpublished.
