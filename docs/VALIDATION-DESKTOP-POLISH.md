# Desktop filters and collections — 0.2.6-dev.9

This local development build continues the 0.2.6 Desktop work. Release notes are prepared as an unpublished 0.2.6 draft; final installer/upgrade review and provider availability remain release checklist items.

## Changes

- Active filter chips cover search, installation/favorite views, platform, manual/smart collections, tags, genres, controller/multiplayer support, playtime, and size. Remove individual constraints or clear every filtering layer together.
- Results show counts. Empty searches explain recovery; an empty library offers Add and Refresh actions. The existing Clear filters action now also resets advanced and collection filters.
- The Desktop collection manager shows memberships, create/edit/remove actions, removal confirmation, and access to smart rules. Manual collection renames preserve memberships, selected filters, sidebar pins, and custom appearance.
- Manual and smart collections can use an existing Orbit icon and a theme color. Active sidebar styling preserves the chosen color. Smart collection names and rules remain editable through their existing rule editor.
- Appearance is validated natively, saved in the profile, and included in settings backup/restore. Invalid names, duplicate rename targets, unknown collections, and unsupported styling are rejected before mutation.
- Closing details restores the prior Desktop scroll position and card focus. If the card was removed, focus moves to a nearby remaining card. Refreshes preserve scroll/focus within the same view. Controller Home and Library layouts remain unchanged.

## Validation

- 438 unit tests passed in serial execution, including five new tests covering rename semantics, atomic rejection, theme-aware presentation, Unicode identifiers, and backup preservation.
- 22 hidden collection/filter UI checks passed: layered clearing, individual removal, result counts, empty states, creation, rename, conflicts, membership and pin preservation, chosen active colors, removal confirmation, detail return, refresh, fallback focus, narrow windows, light/dark themes, and Controller/Desktop transitions.
- The existing 34 hidden Desktop library UI checks also passed against these changes.
- All 351 final packaged regression checks passed, with process exit code 0. They exercise the real collection edit/details IPC and the actual empty-results recovery action in an isolated profile, in addition to existing regressions. The initial candidate caught a changed collection form identifier; restoring the existing identifier fixed that compatibility regression before the final package was built.
- All 210 shipped source/resource files, package metadata, and unpacked native resources matched the final candidate. A disconnected native Discord helper probe passed without authentication.
- Fixture UI runs and the packaged regression recorded zero shown or focused windows. The packaged background guard blocked six attempted window actions in existing checks.

## Release preparation

The source remains labeled 0.2.6-dev.9. The final public installer must be built as 0.2.6 and validated before publication. The Discord friends production gate remains unchanged; its final availability and preview labels require review. No live sign-in or native focus playtest was performed during this work.

Checkups use hidden/offscreen windows and isolated profiles. The existing installed Orbit session, games, settings, themes, artwork, and remembered connections are not modified by these tests. The development installer uses runAfterFinish=false and is not automatically installed.

## Evidence

- work/library-dev9-tests.log
- outputs/library-polish-ui-check/report.json and screenshot captures
- outputs/library-qol-ui-check/report.json and screenshot captures
- outputs/library-dev9-packaged-final/smoke-report.json
- outputs/library-dev9-packaged-final/background-checks.json
- work/library-dev9-final-package-verification.json
- work/library-dev9-final-smoke-exit.json
- docs/RELEASE-NOTES-0.2.6-DRAFT.md
