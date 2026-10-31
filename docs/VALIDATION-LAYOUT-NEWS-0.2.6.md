# Layout picker and news reader follow-up

October 25, 2026. Local 0.2.6 candidate; installed at the user's explicit request, unpublished.

## User-visible changes

- Covers, Banners, and List use three equal rounded cards with distinct layout diagrams, readable labels, a selected check, and a visible keyboard-focus outline. Saved layout, card-size, and spacing behavior is unchanged.
- Removed the picker from generic action-button decoration. Its global menu reset had erased the selected background while retaining dark selected text, causing the reported contrast failure.
- News uses a centered reading column with aligned metadata, heading, body, and consistent section spacing. Header actions remain reachable while the article scrolls. Inline photos and links retain their existing loading and security paths.
- Steam BBCode and HTML lists produce actual ordered/unordered list items. Closing item markers no longer appear as text. Literal bullet announcements, including the reported Geometry Dash style, split into readable items. Nested lists, malformed lists, and bounded media/link behavior are covered.
- News uses the existing shared popup-dismiss helper: clicking outside closes it, Escape/Back and Ctrl+W remain available, image jobs/observers are released, and focus returns to the previous control. Clicking content or dragging from content to the backdrop does not dismiss it.

## Validation

- Article parser: all 13 tests passed, including four added list-formatting/security cases.
- Full unit suite: 465 passed, zero failures, one explicitly opt-in native Roblox fixture skipped.
- Layout/news hidden fixture: all 41 checks passed, covering contrast of selected and unselected choices across Orbit, Dark, Rose, Cloud, Latte, and Ocean; layout selection; news formatting; dismissal and focus; 420/800-pixel layouts; 125% scaling; and Controller reader typography/targets.
- Controller target checks account for its existing display scaling: 18-pixel article text and at least 44 rendered pixels for header actions. The observed Back target was about 47 pixels high. No Controller Home or Library layout was changed.
- Existing Desktop collection/filter/focus fixture: all 22 checks passed, including unchanged Controller Home markup. No windows were shown or focused.
- Earlier test attempts exposed the actual generic-style conflict, which was fixed. Subsequent fixture issues concerned color-expression escaping and waiting for asynchronous dialog cleanup; final checks target the active dialog and await close events.
- Actual screenshots were inspected in Rose, a narrow window, and light/dark layouts. Evidence lives in outputs/layout-news-ui-check. Unit/build/package receipts use work/layout-news-026-* in the local workspace.
- All 358 packaged checks passed, exit code zero, with zero native windows shown/focused. All 214 packaged resources matched source. The installer was built with publication disabled; readiness receipt: work/layout-news-026-ready.json.

No native focus, game launch, account authorization, real download changes, or public publication was performed. Checks used isolated profiles.

## Authorized local installation

The user explicitly requested installation after validation. Silent installation exited successfully; installed archive and native resources matched the tested candidate. Both normal and dev profile settings and seven custom themes in each profile were preserved, as were 17 managed artwork/media files and the encrypted Discord connection. Backups and verification receipts use work/layout-news-026-install.json, work/layout-news-026-preservation-verification.json, and work/layout-news-026-credentials-preserved.json. Orbit did not reopen or take focus. The public release remains unpublished.
