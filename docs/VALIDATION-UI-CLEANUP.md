# Interface cleanup and disclosure alignment

Candidate: 0.2.6-dev.10, October 24, 2026. This is a development preview; the 0.2.6 release remains an unpublished draft.

## Changes

- Removed repeated descriptions, decorative subtitles, unnecessary empty rows, and duplicate labels from settings, details, Friends, Steam controls, setup, and related dialogs. Kept actionable instructions, errors, privacy explanations, destructive-action warnings, attribution, and license information.
- Corrected Quick start disclosure rows: icons and titles stay together on the left, provider metadata stays clear of the arrow, and expanded content fits narrow windows. Libraries and Preferences use their corresponding icons. The narrow footer keeps secondary controls on one row and gives the main action its own row.
- Stopped subtitle rules from sizing decorative summary icons. The same issue affected Game options below 1150 pixels and could hide Steam summary icons at narrow widths.
- Retained an obvious disclosure arrow for Customize appearance after removing its duplicate Customize label.
- Added packaged regression checks for Quick start alignment, metadata separation, semantic icons, and Game options icon geometry.

## Validation

- 438 unit tests passed in serial execution.
- 33 hidden copy/layout checks passed, including collapsed and expanded setup at 1440, 860, 600, and 420 pixels; Orbit, Cloud, and Rose themes; narrow Game options; settings actions; privacy guidance; Steam warnings; and Controller settings.
- 22 hidden filters/collections/focus checks and 34 hidden Desktop library checks passed again. These cover empty-result recovery, collection edits, preserved membership/pins, details return focus, library layouts, sizing, selection, bulk actions, Undo, saved preferences, and reduced motion.
- Fixture runs recorded no shown or focused native windows and no unexpected renderer errors. Screenshots were inspected for the reported popup defect, narrow expanded setup, and game details.
- Package verification matched all 210 shipped source/resource files, package metadata, and unpacked native resources. The disconnected Discord helper probe passed without authentication.

- All 355 packaged regression checks passed, including four new disclosure-layout regressions. The process exited with code 0. Its background guard recorded zero shown/focused windows and blocked six attempted window actions in existing tests.
- The development installer built successfully with `runAfterFinish=false`. It has not been installed into the user's active session.

App archive SHA-256: `33bdfd2f0e6deef28c61dc0412aea68997887cbd98d3369e0480eaa75ee013ec`.

Installer SHA-256: `9c8fc5fa18d836ab690756511275b0efc337c9a7120b9d6cdb0c87008bd80ff2`.

## Evidence

- `work/copy-dev10-tests.log`
- `outputs/copy-ui-check/report.json` and screenshot captures
- `outputs/library-polish-ui-check/report.json`
- `outputs/library-qol-ui-check/report.json`
- `outputs/copy-dev10-packaged/smoke-report.json`
- `outputs/copy-dev10-packaged/background-checks.json`
- `work/copy-dev10-smoke-exit.json`
- `work/copy-dev10-package-verification.json`
- `work/copy-dev10-build/win-unpacked/`
- `work/copy-dev10-installer/Orbit-Setup.exe`

## User data and release status

All checks use isolated profiles and hidden/offscreen windows. The installed Orbit session and its settings, themes, artwork, and remembered connections are left untouched. No game launch, live account authorization, native focus playtest, installation, or release publication is part of this pass. The preview installer is configured not to reopen Orbit after installation.

Final 0.2.6 versioned binaries, installation/upgrade validation, and provider availability review remain release gates in the existing draft checklist. This validation does not claim that every possible display configuration or unknown UI defect has been eliminated.
