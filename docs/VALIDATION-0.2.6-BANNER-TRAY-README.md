# 0.2.6 banner, tray, and README follow-up

Checked October 25, 2026. This supersedes the prior local installer. The application release remains unpublished. Initial validation did not replace the installation; the user-authorized installation follow-up below records the later installation.

## Changes

- Enlarged the Desktop Overlay banner from a 250px minimum to a responsive 280–340px minimum, with centered content and more padding. Landscape Split artwork uses an 8:3 frame. Portrait/square fallback handling, crop choices, saved Overlay/Split preference, and Controller layouts remain separate.
- Grouped Select with collection organization actions. Search, sort, and layout controls remain together as result controls. No additional heading or explanatory copy was added.
- Selecting the already active workspace tab no longer resets search, page, or scrolling. Programmatic navigation and tour restoration remain available.
- Made Remember my choice a readable, rounded, themed checkbox row. It retains its native checkbox, label behavior, keyboard access, and existing saved-choice action.
- Reduced normal tray renderer idle delay from 30 seconds to 2 seconds. Existing safety gates postpone unloading during dialogs, startup, controller handoff, and protected operations such as artwork/startup-media/save work. Native tracking and update services remain outside the renderer lifecycle.
- Added a generation check so an old asynchronous sleep decision cannot destroy a window that was reopened and hidden again. Reopening starts a new full wait.
- Recorded the user's clarification: intrusive development checkups concerned this testing workflow, not a confirmed ordinary-user regression. AGENTS.md now records that distinction, consistent visual checks, related-action grouping, artwork prominence, and the tray target.
- Replaced a roughly 1,956-word public README with approximately 640 words, removing repeated sections and grouping feature explanations. Six actual hidden app captures use sample games/profiles: Desktop library, organization, Friends, Steam, appearance, and Controller library. An original vector illustration supplies the new example banner; covers use the local example-art system with matching fictional titles.

## Validation

- 458 unit tests passed, zero failed, one opt-in native Roblox window fixture skipped. The idle tests include the two-second default, safe retry while busy, reopen cancellation, and asynchronous reopen/hide races.
- 11 focused hidden checks passed: banner fit at 1600/1440/900/600 widths, dark/light/Roseberry themes, 125% page scale, retained Split layout, grouped actions, active-tab state preservation, remembered-choice styling/label behavior, and renderer unloading.
- A real timer in an isolated hidden/offscreen window released that renderer in 2,015ms in the final run. A background fixture timer continued. This proves the isolated timer/lifecycle path, not a fresh RAM benchmark or a native game-session playtest.
- 41 guide/Downloads regression checks passed after the action grouping and navigation changes.
- 357 checks passed in the exact packaged candidate. As in the previous follow-up, one conditional statistics-panel case had no qualifying fresh-profile entry after unverified history was excluded; it is not counted as a package pass.
- All 214 shipped source/resource files matched. The disconnected production Discord helper probe passed without new authorization.
- Hidden guards recorded zero shown/focused windows. Six existing native-window actions in packaged checks were blocked.
- Installer built successfully from the verified package, with no installer execution or release upload.

## GitHub documentation update

The user's README request was applied to main in commit [69353af](https://github.com/tkokero/Orbit/commit/69353af35d2fddcab03906c18f43609f59e6ec18). The commit changes only README.md and six docs/screenshots PNGs. No app code, release/tag, or update-feed asset was published. The README explicitly identifies development screenshots and notes that published builds may differ.

## Evidence and candidate

- `work/banner-tray-026-ready.json`
- `work/banner-tray-026-tests.log`
- `outputs/banner-readme-ui-check/report.json` and reference captures
- `outputs/tour-downloads-ui-check/report.json`
- `outputs/banner-tray-026-packaged/smoke-report.json`
- `outputs/banner-tray-026-packaged/background-checks.json`
- `work/banner-tray-026-package-verification.json`
- `work/banner-tray-026-build/win-unpacked/`
- `work/banner-tray-026-installer/Orbit-Setup.exe`

Installer SHA-256: `174ae981b504ed064bbbd20d4822ee372f8fc8b7f8a3e71564fb07cfab4fc175`.

Application archive SHA-256: `d31b4c0d3ab950cc4504891995d6b94ce7038d9f92ffb0649aab637b6c5aa853`.

Normal/dev user profiles, saved settings, themes, artwork and crop choices, popup preferences, profile links, and authorized credentials were not reset or changed by validation. Native Windows login, game handoff, the outstanding Roblox fixture, and post-update foreground behavior were not repeated.

## User-authorized installation and real-game documentation follow-up

The user explicitly requested installation after the candidate was ready. The verified installer was run silently with no force-run flag. Installer exit was zero, the installed app.asar matched the tested archive, and unpacked native resources matched. Orbit did not reopen; no game or publisher client was deliberately stopped.

Both Orbit and Orbit-Dev passed preservation checks for interface settings, native settings, per-game preferences, collections, themes, and managed artwork/startup files. Each retained seven custom themes. The normal profile's encrypted remembered-connection file remained byte-for-byte unchanged. Backup locations and detailed receipts remain local in work/banner-tray-026-install.json, work/banner-tray-026-preservation-verification.json, and work/banner-tray-026-credentials-preserved.json.

At the user's request, README examples now use DOOM, Call of Duty, Portal 2, Halo: The Master Chief Collection, Skyrim Special Edition, ELDEN RING, Stardew Valley, and Hades with publisher Steam artwork. Profiles, playtime, download amounts, and installation states remain explicitly labeled sample data. These were hidden isolated captures, not edits to the real library. The artwork source manifest is work/real-games-readme-art/manifest.json and capture checks are outputs/real-games-readme-check/report.json.

Documentation-only commit: https://github.com/tkokero/Orbit/commit/566cc6f32d9e1e540006844123486edbc851aaad. It changes only README.md and the six screenshots. This later documentation edit does not change the verified installed application archive. No app release, tag, or feed was published.
