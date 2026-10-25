# Historical validation records

These are dated snapshots, not current release guarantees. Return to the [validation guide](../../VALIDATION.md) for running checks.

# Orbit 0.2.5 release validation

October 23, 2026. The numbered 0.2.5 release retains Orbit's existing 0.x pre-release convention.

- **360 Node tests**, **338 packaged regression checks**, **186 packaged popup/icon checks**, and **36 packaged resizing checks** passed. Reports: `work/release025-tests.log`, `outputs/release025-regression/smoke-report.json`, `outputs/release025-popups/popup-report.json`, and `outputs/release025-resize/popup-scale-report.json`.
- Both focused UI runs recorded zero native show/focus events. Checkups stayed offscreen and did not launch or close a real game.
- **8 updater checks passed**, including actual installer download and checksum verification against a loopback candidate feed, update selection from 0.2.3 and a 0.2.5 prerelease, and avoiding a downgrade from the current version. The installer was not executed (`outputs/readability-update/updater-report.json`).
- `npm ci`, `npm test`, and `npm run dist` succeeded. All **185 packaged files checked** match source (`work/release025-package-verification.json`). Archive SHA-256: `373E4D4D7ACB5FFFFF5F2154AEFE6F510DEBA02D846BB0FEFCA2A1975B46EB67`.
- The user confirmed DualSense navigation and functional game launch on the preceding installed candidate. Clean-machine/manual installer testing remains planned; the prior local silent installation and preference-preservation results below do not substitute for that test. A stable public build/update-path check follows publication.

Release assets include matching source and a portable Windows build. The legacy compatibility feed remains at `v0.2.0-pre.1`, with an absolute installer URL for the numbered release; older release assets remain recoverable. No foreground restart or native launch/exit playtest was performed during release preparation.

---

# 0.2.5 release readiness — user playtest update

October 23, 2026. Following the installed 0.2.5-pre.17 build, the user reports:

- **DualSense navigation: passed.** User confirmed that navigation works.
- **Game launch: works.** Recorded as user-reported functional behavior; no additional transition defect was specified. Game-exit detection and automatic return were not separately described in this feedback.
- **Installation and installer testing: pending.** The user plans to test these. The existing local silent-upgrade result below does not establish a clean-machine installation result.

Remaining release work includes the planned installer/installation tests and final stable 0.2.5 package/update verification. No stable build or public release was created by this status update. Earlier sections retain the validation state at the time those checks ran.

---

# 0.2.5-pre.17 — Desktop game-details resizing

October 23, 2026, Windows. Removed superseded Desktop sizing rules that forced game details to nearly the entire window and took precedence over the shared popup geometry. Game details now obeys both corner dragging and separate saved width/height presets. The earlier popup tests checked frame bounds but did not assert the actual game-details dimensions; new checks cover that gap.

- **36 packaged resizing checks passed**, including renderer mouse input on an actual game-details popup after closing Settings, separate game-details dimensions, reopening, and expanding Game options (`outputs/pre17-resizing-packaged/popup-scale-report.json`). Hidden captures were reviewed.
- **186 packaged popup/icon checks passed**, including compact game-details dimensions across Desktop/Controller Mode, both themes, and all three window sizes (`outputs/pre17-popups-packaged/popup-report.json`). Both focused runs recorded **zero native show/focus events** in their background reports.
- **360 Node tests passed** (`work/pre17-tests.log`). `npm run dist` succeeded; all **185 packaged files checked** match source (`work/pre17-package-verification.json`). Archive SHA-256: `46A394BC8B824F10BFC049B8A88D4BD01AB3059651A2541CC10EF9AFA6767B9A`.

Silent installation exited **0**. The installed archive matches the validated build; all interface settings, native settings, and **7 custom themes** in each of the Orbit and Orbit-Dev profiles were preserved (`work/pre17-install.json`, `work/pre17-preservation-verification.json`). Orbit was left closed. No real game or native focus/launch playtest was run. The proposed user-facing 0.2.5 notes are saved in `RELEASE-NOTES-0.2.5-DRAFT.md`; nothing was published.

---

# 0.2.5-pre.16 — Resizable popups and saved menu sizes

October 23, 2026, Windows. Desktop popup frames have a bottom-right resize handle, including regular forms and game menus. Dragging adjusts the centered frame without shrinking text, remains bounded by the available window, and follows the actual edge when a saved size is constrained by the screen. Handles stay at the visible corner while content scrolls or the app window changes size. Pointer capture, cancel/blur restoration, keyboard arrows, and double-click/Home reset are supported. Controller Home, Library, startup scenes, and the game handoff view keep their layouts.

**Settings → Appearance → Popup size** includes **Share sizes across popups**. Shared mode uses a common size preset; separate mode remembers presets by menu type and exposes a menu selector. Switching modes preserves separate presets. Width and height are independent, fonts retain their readable size, and shared or separate presets are backed up through Orbit's existing native preference storage. Older shared-size preferences migrate without being lost. Controller Appearance exposes the same preferences; pointer-only resize handles stay hidden during controller input.

Validation:

- **360 Node tests passed**, including legacy migration, safe dimensions, centered resizing, independent presets, and preserving separate presets when switching sharing modes (`work/pre16-tests.log`).
- **32 final packaged resizing checks passed** (`outputs/pre16-resizing-release/popup-scale-report.json`). These cover real renderer mouse input on the visible corner, pointer-release persistence and cancellation, keyboard resizing, shared/separate controls, independent menu sizes, scroll/window corner alignment, reduced motion, narrow-window constraints, and recovery from the native profile after clearing browser storage. Native show/focus counts are **zero** (`background-checks.json` in the same folder).
- **174 final packaged popup/icon checks passed** across both modes, themes, and narrow/wide windows (`outputs/pre16-popup-release/popup-report.json`), with **zero native show/focus events**. **82 controller interaction checks passed** with the new Appearance controls (`outputs/pre16-interaction-final-source/interaction-report.json`).
- **338 final packaged regression checks passed** (`outputs/pre16-regression-release/smoke-report.json`).
- `npm run dist` succeeded. All **185 packaged files checked** match source (`work/pre16-package-verification.json`); archive SHA-256: `323A3849E4ED475AE3CEE8E43AFC5E6DF9A717685114CDD687049CF02B1BEA4E`.

Silent installation exited **0**, and the installed archive matches the validated package. Every interface setting, native setting, and all **7 custom themes** in each of the Orbit and Orbit-Dev profiles were preserved (`work/pre16-install.json`, `work/pre16-preservation-verification.json`). Orbit was not reopened after installation.

The native controller/game focus playtest and separate public-release checks below remain pending. This validation did not launch or close a real game or bring up native checkup windows.

---

# 0.2.5-pre.15 — Bounded popups and launcher symbols

October 23, 2026, Windows. Larger Settings, game-details, and news frames use the user's reference size of approximately **1280 × 680 pixels**, centered and constrained by available window space. Other modal forms, launch choices, installation controls, controller choices/keyboards, and anchored menus use compact content-appropriate frames. Text and input targets retain their readable sizes. Container queries reflow content within the actual popup rather than the monitor width. Long bodies scroll while action footers stay available; game-details and Settings frames remain stable when sections expand. Controller Home/Library layouts and the game handoff screen remain intact.

Steam, Epic Games, and Roblox use the existing bundled filled brand paths instead of outline approximations. Sidebar marks share a 28-pixel frame and a 22-pixel glyph, retain readable selected-state contrast, and do not rotate on hover.

Validation:

- **174 packaged popup/icon checks passed** across Desktop and Controller Mode, Dark and Cloud themes, and 2550 × 1389, 1920 × 1080, and 940 × 720 windows (`outputs/pre15-popups-packaged/popup-report.json`). These cover frame size/centering, all Settings categories, scrollable installation bodies with visible actions, launch choices/footer, game details/options, controller dropdowns and keyboard, and sidebar brand dimensions/contrast.
- **338 final packaged regression checks passed** (`outputs/pre15-regression-packaged/smoke-report.json`). An additional **82 controller interaction checks passed** with the new popup layouts (`outputs/reference-interaction-source/interaction-report.json`). Actual hidden captures of Settings and launch choices were reviewed. The packaged popup run records **zero native show/focus events** (`outputs/pre15-popups-packaged/background-checks.json`).
- `npm run dist` succeeded. All **180 packaged files checked** match source (`work/pre15-package-verification.json`). The package SHA-256 is `6443E5C367BAAA25FEFFCB05259A12AD8BF1C3D3ABE9ABBDA7414C520B9055E0`.

Installation and preference verification are recorded in `work/pre15-install.json` and `work/pre15-preservation-verification.json`. Native focus/launch playtesting and the separate release checks listed below remain pending; no real game was launched or closed by this validation.

---

# 0.2.5-pre.14 — Controller navigation and background validation

October 23, 2026, Windows. Settings now uses semantic rows and grid columns, retains the focused setting per category, and adjusts numeric controls without visiting their pointer-only utility buttons. Launch mode cards, Remember, Cancel, and Play have controller focus and binding-aware hints. Input cannot open the sidebar behind an ordinary modal. Controller startup holds Orbit above launcher/cloud-save windows, waits for a stable detected game window, animates departure, verifies foreground activation before minimizing, and confirms process exit before returning fullscreen.

Checkups render offscreen by default. Native show/focus/restore requests are blocked, screenshots use `stayHidden`, and focused validation reports record actual show/focus events. Interactive memory and native handoff validation require an explicit playtest flag. The user's preference to avoid interruption while gaming is also recorded in the project instructions.

Executed validation:

- **352 Node tests passed**, including handoff cancellation/readiness/exit timing and background-window protection (`work/pre14-unit-tests.log`).
- **338 final packaged regression checks passed** (`outputs/pre14-packaged-final-background/smoke-report.json`).
- **82 focused packaged controller interaction checks passed**, including synthetic DualSense navigation, actual dry-run launch IPC, and custom binding hints (`outputs/pre14-interaction-packaged/interaction-report.json`).
- **97 controller/flow checks**, **48 alignment checks**, and **46 readability checks** passed. Reports are in `outputs/pre14-flow-controller-fixed`, `outputs/pre14-alignment-fixed`, and `outputs/pre14-readability-background`. Background reports in these folders and the focused interaction folder each record **zero native show events and zero native focus events**. Screenshots were reviewed without displaying native windows. Offscreen timing is not a physical frame-presentation or hardware controller latency measurement.
- `npm run dist` succeeded. All **178 packaged source/assets/documents** checked match source. The installed archive matches the package SHA-256: `FEF5AEB96B8F42EA833BF071BD842784E532220A5343A3EE92EF2045D3CE52D5` (`work/pre14-package-verification.json`).
- Silent installation exited **0**. Orbit was left closed, with no foreground restart. Both installed and developer profiles retain every interface setting, native setting, and all **7 custom themes** each. The backup and verification are recorded in `work/pre14-install.json` and `work/pre14-preservation-verification.json`.

Remaining: physical controller feel and a real user-initiated launch/exit playtest. An earlier disposable native QA application verified startup waiting and fullscreen return after exit, but Windows rejected its automatic foreground activation. Orbit retains an explicit Switch to game fallback and does not minimize on a rejected activation. That native focus check was not repeated after the user requested uninterrupted gaming. Stable 0.2.5 publication, post-publication updating, and clean-machine installation remain separate release checks; no public release was changed.

---

# 0.2.5-pre.6 — Controller home, dedicated destinations, artwork, and frame pacing

October 23, 2026, Windows. Controller Mode now separates its recent-game/discovery home from a bounded cover-grid Library. Sidebar destinations use controller-specific surfaces for Downloads, Favorites, Settings, Shuffle, Download & play, personal shelves, Guest mode, Display, and the quick wheel. Desktop returns to the normal interface. Settings has a persistent category rail and controls tied to the existing settings/input services. Game selection, membership/exclusions, game action dialogs, close confirmations, and desktop download rows prioritize available artwork over captions. Progress labels use readable decimal precision. Selected-game transfer pages update their own progress without exposing unrelated queue entries. Download snapshots preserve Steam app identity for these scoped controls. Native installer transfers retain cancel/run confirmation paths.

Performance changes keep the sidebar mounted, remove backdrop blur and exit clones, update only selected cards and delayed artwork during movement, and avoid rebuilding a dashboard on each session update. Running-game changes update their own cards; unchanged catalog data does not replace the grid. Hidden desktop surfaces/news are released during Controller Mode. News thumbnail work is limited to two near-viewport jobs. Geometry is bypassed for ordinary grid/rail movement, focus repair runs for discrete actions rather than every held frame, and no-op scroll requests avoid creating animations. Hardware rendering is the default for new profiles; explicit graphics-memory preferences are supported. The local installed/developer profiles were switched to hardware rendering for this update.

Three new controller-only arrivals—Orbital Relay, Nebula Bloom, and Starfold—use a single canvas capped at 1,000 pixels wide, 96 particles, cached glow sprites, and the active theme's accent/cool/warm colors. They reuse optional desktop audio cues, support preview/skipping/reduced motion, and release animation/audio work when stopped or hidden. Remembered Controller Mode bypasses the ordinary desktop intro before its controller arrival. Automatic desktop Quick start no longer appears over an active controller surface. Guest mode omits private game artwork/news, friend activity and desktop keyboard shortcuts that could reveal private library entries.

Executed checks:

- **317 Node tests passed** (`work/controller-redesign-final-tests.log`), including the additional download identity/artwork regression test and revised rendering-default coverage.
- **35 focused source UI checks passed with hardware rendering**, and **35 passed with software rendering**. Reports: `outputs/controller-redesign-focused/controller-report.json` and `outputs/controller-redesign-software/controller-report.json`.
- **234 packaged-app regression checks passed** (`outputs/controller-redesign-verified/smoke-report.json`), including the new controller surfaces, settings persistence, focus/device handoff, game information, artwork priority, selected-transfer live progress/scoping, and the prior desktop/install/theme/game-close checks.
- After the last Guest filtering/shortcut fixes and focus-row styling, the rebuilt final package passed **42 focused controller checks** (`outputs/controller-redesign-final/controller-report.json`). These also verify valid selection after removing a focused game and keeping the same sidebar DOM node across routes.
- `npm run dist` succeeded. Fourteen changed runtime files extracted from the final application archive matched source byte for byte. Build log: `work/controller-redesign-build.log`.
- Reviewed actual application captures of the home, grid library, sidebar, dedicated Settings, game page, and all three arrivals. Final screenshots are beside the final controller report.

Visible-window frame sampling (hardware rendering, final package): the 1.8-second sidebar/navigation sample collected 261 animation frames, averaging **6.91 ms** between callbacks, with **7.10 ms p95** and **7.20 ms worst**. Scene samples at 1,000 × 667 pixels collected 96 frames each; mean canvas drawing cost was approximately **0.06 / 0.16 / 0.09 ms** for Relay/Bloom/Starfold and frame p95 was 7.10 ms. The software-rendered focused run also passed; its navigation sample had 7.0 ms p95 and 13.9 ms worst. These short warm renderer samples are not end-to-end controller latency or proof that every physical display frame was presented. An earlier hidden-window timing attempt was throttled and is excluded from performance conclusions. GPU feature reporting confirmed compositing/canvas acceleration in the hardware run.

The final 0.2.5-pre.6 installer exited **0**, and the installed application archive matched the tested package by SHA-256 (`work/controller-redesign-install.json`). Installed Orbit and the developer source instance were reopened; visible main windows were verified. Both local rendering preference files report `lowMemoryRendering: false`. Physical USB/Bluetooth controller feel, driver-specific mappings and external authentication/Windows dialogs still require hands-on testing. No actual game was launched or terminated, no real download/install action was requested, and clipping remains developer-only. Existing older inline-style CSP warnings appeared in the broad smoke run; this update does not relax the CSP. Public releases were not modified.

---

# 0.2.5-pre.5 — Controller navigation, illustrated sidebar, and game pages

October 23, 2026, Windows. The controller implementation stays inside Orbit's existing Electron/plain-JavaScript renderer, reusing trusted launch/preferences/history IPC, cached artwork, themes, and existing installation controls. No dependency was added. Detailed architecture, controls, diagnostics, and limitations are in `CONTROLLER.md`.

The Browser Gamepad API is sampled by one requestAnimationFrame loop while the window is focused and visible. Normalization covers standard-mapped Xbox, PlayStation, and Nintendo prompts, one active device with idle/disconnect handoff, deadzones, direction hysteresis, edge-only confirmation, configurable repeat timing, shoulders, menu taps/holds, and right-stick scrolling. Controller activity hides the cursor; actual pointer movement or keyboard activity hands input back without a focus reset. Held controls must return to neutral across handoffs and overlays.

Geometry focus prioritizes alignment, filters unavailable controls, supports explicit overrides, confines modal focus, and restores targets after overlays. Retargetable scrolling replaces pending scroll work instead of accumulating animations. Game-card movement updates selection/title/backdrop without rebuilding the library. Controller Mode enters native fullscreen with an original skippable atom sequence, then restores the previous fullscreen state on exit. Reduced motion is respected. Menu closing releases logical focus immediately while an inert visual copy completes the slide-out.

The sidebar uses original SVG illustrations colored by the selected theme, fixed search/help regions, and an independently scrollable action list. Short Menu/Options opens it; holding that button opens selected-game actions. Library and Favorites retain independent selections, and Favorites no longer gets replaced by an ordinary library repaint. Selecting a game opens a hero page with a separate Play control and themed lower information cards: available description/metadata, launch choices and settings, achievement totals/details, local session history, installation copies, and personal library notes. Supporting reads run concurrently and ignore detached views. Guest pages omit personal activity, notes, installation paths, and custom arguments.

Executed verification:

- **316 Node tests passed**, including controller normalization, configured timing bounds, deadzone/repeat behavior, rapid direction changes, device handoff/disconnection, and spatial alignment. Log: `work/controller-complete-tests.log`.
- **219 source-app checks passed** before the final sidebar transition/focus refinements. Report: `outputs/controller-source-final/smoke-report.json`.
- **222 final packaged-app checks passed**, including short/held Menu behavior, unique sidebar illustrations, immediate focus restoration during exit, nested keyboard/dropdown interaction, artwork game pages, real supporting information, right-stick page scrolling, shoulder tabs, cursor handoff, Guest filtering, skippable entry, and independent Library/Favorites selections. Existing desktop, installation, theme, and close-game smoke checks also passed. Report: `outputs/controller-complete-verified/smoke-report.json`.
- Reviewed packaged screenshots for the sidebar, hero page, and lower information cards. Additional UI captures are in that report directory.
- `npm run dist` completed successfully. Log: `work/controller-complete-build.log`.
- Silent local installation exited **0**. Installed `app.asar` matched the tested package by SHA-256. Record: `work/controller-complete-install.json`. Installed Orbit and the source developer instance were reopened.

These checks used synthetic controller states in an isolated smoke profile. No actual game was launched/killed, no real download was changed, and no physical USB/Bluetooth controller or high-refresh display was benchmarked. Diagnostics report renderer frame rate and synchronous action-processing time, not physical input-to-display latency. Native fullscreen behavior, device-specific drivers, controller feel, external Windows dialogs, and game/publisher windows still need hands-on validation. Existing nonfatal CSP warnings from older inline-style paths appeared in the smoke logs; this change does not weaken the content-security policy. Clipping and synthetic controller injection remain developer/smoke-only. Public releases and their update feeds were not changed.

---

# 0.2.5-pre.4 — Drive space, controller switches and joystick navigation

October 23, 2026, Windows. Library-folder cards now request available and total volume capacity through a trusted native handler. Only Steam's discovered library folders are used; the renderer cannot submit arbitrary filesystem paths. Reads are deduplicated per volume, bounded to 32 entries and given a 2.5-second response timeout. Unmounted/unreadable drives display an unavailable message rather than zero space. A live read of the local C: volume succeeded. UI fixture capacities are isolated to smoke mode.

Controller switches now retain a 52 x 30 pixel pill shape rather than inheriting the general 48-pixel minimum button height. Focused setting rows receive a theme-colored outline. The controller loop samples at approximately 60 Hz only while Controller Mode is visible and connected. Input handling applies an initial dead zone, release hysteresis, diagonal-axis stability, immediate directional response, a 320 ms initial repeat delay, and adaptive repeat speed. A/B remain edge-triggered; holding either does not repeatedly activate controls or click through from the quick wheel into the next menu.

Shelf navigation moves between primary game tiles horizontally and the nearest aligned game in adjacent shelves vertically, avoiding accidental jumps into each game's options button. Focus and mouse hover update one persistent selected-card highlight, a small lift, the selected title, and dim background artwork. Focus-driven scrolling is smooth and respects reduced motion. Menus continue using directional geometry with a visible focus outline. Opening Controller Mode dismisses prior dialogs before focusing a game; the first packaged check exposed an old dialog focus trap and verified the need for this handoff. Mouse hover is suppressed after controller navigation until actual pointer movement, preventing smooth scrolling from stealing selection.

311 Node tests passed. New tests cover drift, immediate response, repeat timing, direction reversal, button edges, diagonal stability, drive deduplication, full drives, and unavailable/malformed drive entries. Packaged UI checks additionally cover drive capacity labels, keyboard folder selection, persistent game selection and compact controller settings. No physical controller or real game was operated for validation; hardware feel still requires hands-on testing.

Final verification: 311 Node tests and 203 packaged UI checks passed. An isolated test profile left in Controller Mode caused two unrelated desktop-layout assertions to fail in an earlier run. Resetting only the isolated controller/guest preferences restored the baseline; the final package passed the full suite. Reports: `work/controller-final-tests.log`, `outputs/controller-final-clean/smoke-report.json`. Screenshots in that directory include the drive-space cards and controller selection.

Installed with exit code 0 and verified installed app.asar against the tested package by SHA-256. Reopened installed Orbit and the source developer instance; both visible main windows were verified. Installation record: `work/controller-navigation-install.json`. Public releases remain unchanged.

---

# 0.2.5-pre.3 — Controller home, personal shelves, and themed installation folders

October 23, 2026, Windows. Added a dedicated controller home with artwork shelves, bounded library pages, search, full-screen control, visible button prompts, game actions, and access to Downloads, Favorites and Settings. The existing controller loop handles navigation; no second gamepad polling loop was added. Holding a configurable standard-mapping button opens a four-route quick wheel. The wheel uses directional focus, A/Cross to activate, and B/Circle to dismiss. Polling remains suspended when hidden and outside controller mode.

Orbit Shuffle supports installed games, installed favorites, and games not played within 30 days, with per-game exclusions. Personal shelves support named rows, game membership, removal and ordering through buttons usable by keyboard/controller. Preferences remain local. Guest home hides recent activity, personal shelves, editing controls and explicitly private/hidden games; Favorites and Downloads require leaving Guest mode. Guest mode is a presentation feature, not an authentication boundary or protection for other applications. Guest state remains active until explicitly left.

Couch return registers a validated library game ID in the native process. It waits until that game has been observed running before treating its disappearance as completion, then restores Orbit and focuses that game's card. Leaving controller mode cancels the watch. No game is killed by returning to Orbit. Running games have Return and Close controls on the controller home. The shared close confirmation and process verification are reused.

Download & play queries Steam's queue before listing installed candidates, excluding reported incomplete Steam transfers and installation progress. It refuses to claim verification if the bridge is unavailable. Sign-in, DRM, publisher and network requirements are not inferred. Its optional Steam bandwidth limit is explicitly labeled as global and persistent until changed/cleared; this build does not automatically restore a prior bandwidth setting or guarantee offline play. No real Steam bandwidth mutation or game installation was performed during validation.

Steam installation/move destinations now use themed folder cards with a selected state and checkmark. The native select remains hidden as the authoritative value used by existing validation. Keyboard arrows select folders; controller activation uses the same button handlers. No default path or installation request is changed merely by opening the menu.

306 Node tests passed. The first packaged run passed 200 UI checks, including the controller home, configurable hold wheel, guest content, shelf controls, Shuffle scopes, native watch validation and folder selection. Screenshots were visually reviewed. A final rebuild additionally refreshes the home when library data arrives, preserves game focus during refresh, validates saved shelf entries and displays running-game controls. Physical gamepad usability and actual game-exit-to-return behavior still need real-game testing; automated input checks are not a hardware validation claim.

Reports: `work/couch-tests.log`, `outputs/couch-folders-verified/smoke-report.json`. Screenshots: `outputs/couch-folders-verified/orbit-controller-home.png` and `orbit-install-folder-cards.png`. The final rebuild also passed all 200 packaged checks (`outputs/couch-final-verified/smoke-report.json`). Installed locally with exit code 0; installed app.asar matched the tested package by SHA-256. Reopened installed Orbit and the source developer instance when no developer recorder was active. Installation record: `work/couch-install.json`. Public releases remain unchanged.

---

# 0.2.5-pre.2 — Shared photo backgrounds and visible color controls

October 23, 2026, Windows. Custom theme images now render once across the shared library/sidebar shell. Main content and the sidebar are transparent over that image; solid themes retain the sidebar surface. Removing or changing the photo resets the surface token without leaving stale image styling.

Color rows show a swatch, an editable six-digit hex code, and a Change button that opens the native picker. The native input no longer depends on the stretched browser swatch UI for its visible presentation. Hex edits update the native value, live preview and swatch. Picker edits synchronize the visible hex code. Invalid hex values block form submission. Automatic image-accent mode disables its corresponding hex field and Change button consistently. Preview, discard, save and import paths synchronize the new controls.

303 Node tests passed. Final packaged checks cover color synchronization in both directions, hex validation, and photo coverage behind the sidebar, alongside the existing theme save/discard checks. 191 packaged checks passed; reviewed the rendered swatch/hex/Change layout. Reports: `work/theme-controls-tests.log`, `outputs/theme-controls-verified/smoke-report.json`. Screenshot: `outputs/theme-controls-verified/orbit-theme-colors.png`.

Local installation exited with code 0 and the installed archive matched the tested package by SHA-256. Reopened installed Orbit and restarted the source developer instance after verifying that no developer recorder was active. Installation record: `work/theme-controls-install.json`. Public releases remain unchanged.

---

# 0.2.5-pre.1 — Settings navigation and developer-only clipping

October 23, 2026, Windows. Reworked Settings into a wider layout with a persistent category rail, independently scrolling panels, grouped General preferences, and a responsive two-column toggle layout. Narrow windows use horizontal category navigation and a single column. Search covers all categories and opens the actual existing control rather than a duplicated setting. Selecting a result opens its category and scrolls/focuses its heading. Escape clears the query; Arrow Down enters results; empty results are announced. Controls retain their existing save handlers and theme tokens.

Clipping UI is now capability-gated. Normal builds do not initialize the Clips controller, expose the sidebar entry, or allow clipping IPC. The standalone packaged recorder entry point exits without recording. Source-only `npm run dev` retains access in the separate Orbit-Dev profile. Isolated smoke mode can inspect the UI, but recording remains disabled. This is a development availability boundary, not an account authentication system.

303 Node tests passed. A preload mock was updated to model the new native capability check. One unrelated timing-sensitive Discord test failed under build load; the full rerun passed. The first navigation UI check contained a querySelector/querySelectorAll error in the harness; it was corrected. Package checks cover grouped controls, search across categories, result navigation/focus, empty results, and narrow layouts. 187 final packaged UI checks passed. Normal and smaller supported window layouts were reviewed visually. The final packaged recorder entry point was independently launched and correctly refused recording with exit code 1. Existing CSP inline-style warnings appeared in isolated smoke logging; no renderer errors were reported by the suite. Reports: `work/settings-nav-tests-final.log`, `outputs/settings-search-verified/smoke-report.json`. Screenshots: `outputs/settings-search-verified/orbit-settings-navigation.png` and `orbit-settings-narrow.png`.

Installed locally with exit code 0; installed app.asar matches the tested package by SHA-256. Reopened the installed Orbit app and verified its visible main window. Installation record: `work/settings-search-install.json`. Public releases remain unchanged.

---

# 0.2.4-pre.11 — Local clipping prototype and verified game sessions

Validated October 23, 2026 on Windows. 303 Node tests and 180 final packaged-app UI checks passed, including real Windows process/window checks and normal/narrow layouts. The final rebuild includes Roblox tray session detection. Installer: `outputs/installer/Orbit-Setup.exe`. Installation exited successfully, the installed application archive matched the tested package by SHA-256 (`988DA55C4DB1CACC3EEAAF20677D99EA4AB6A86872D98472A31E451BCC750F89`), and the installed Orbit app reopened with a visible main window. Installation record: `work/clips-roblox-install.json`.

- Added an optional local replay recorder with an explicitly chosen window/display, a 30- or 60-second buffer, 720p/1080p capture up to 30 FPS, optional system audio, MP4 saves, and a local gallery. Ctrl+Alt+F8 saves; Ctrl+Alt+F9 stops. Recording is off by default. A separate, lazily started Electron recorder preserves hardware acceleration even when Orbit uses its low-memory renderer mode. The main library does not load the media library while clipping is off.
- Encoded packets stream into a bounded disk buffer grouped by keyframes. Snapshot pins allow capture to continue while saving; export remuxes compressed packets without re-encoding. Packet sizes, IPC batches, pending memory, buffer/output size, free space, and write positions are bounded. Output uses exclusive partial files, finalized by rename; failure cleanup also handles a failed rename. Graceful stop releases tracks, encoders, shortcuts, temporary groups, and the recorder process. Updates wait until recording stops.
- A real Windows window-capture test recorded a controlled animated QA window for 35 seconds, saved approximately 31.1 seconds at the nearest retained keyframe, decoded video, sought into the MP4, and confirmed the recorder stopped. A packaged synthetic video/audio test produced playable AVC/AAC output with non-silent stereo 48 kHz audio. Tests used an owned animation and generated tone; no microphone, private desktop content, or unrelated audio was recorded. Decoder validation confirmed a valid AAC track, non-silent samples, and video playback.
- Recorder IPC accepts only named operations from its own capture frame, with a selected source revalidated in the recorder process. Window capture matches the native window handle across Electron's process-dependent source identifiers. File destinations are controlled by the main process, gallery operations validate known filenames, and navigation/network access is blocked in the recording renderer. System audio is a separate explicit opt-in and may include all desktop sound; the prototype does not capture a microphone or upload clips.
- Normal Close game now waits for the window-close result and checks the process list again before reporting a completed close. Force close also checks for the original process or a replacement game executable. Unavailable verification preserves the running session instead of claiming success. Controlled Windows Forms fixtures covered accepted and refused close requests; disposable helper processes covered verified force close and Roblox background/client/helper cleanup without closing real user games.
- A Roblox player with a verified `no-window` state no longer counts as a running game. Minimizing, changing focus, or an unavailable window-state probe keeps the session active. The shared detection result ends activity history and automatic local playtime, updates Discord activity, and prevents tray-only discovery/launch watching from starting a timer. Reopening the same Roblox process starts a fresh observed session without adding the tray gap. Other games and Roblox Studio retain their existing process detection. The standard detection interval applies (normally 15 seconds while a game is active).
- A native Windows test used a disposable Windows Forms executable named RobloxPlayerBeta in an isolated folder. Its visible, minimized, hidden-with-notification-icon, and reopened states were detected through the actual Windows process/window scanner. The tray transition ended the Orbit session while leaving the process alive; the minimized window remained active. An initial fixture assertion assumed a reopened window would always be in the background; it was corrected to accept either foreground or background. Product behavior did not require a workaround.
- Prototype limits: real-game performance and protected/exclusive-fullscreen compatibility are not yet benchmarked. Hardware encoding is requested but depends on the system; unsupported codecs/sources report an error. Replay boundaries follow keyframes, so saved duration can vary slightly. Normal shutdown cleans temporary buffers; an abrupt process/OS termination can leave a temporary run directory.

Reports: `work/clips-roblox-final-tests.log`, `outputs/clips-roblox-verified/smoke-report.json`, `outputs/clips-capture-qa/validation.json`, `outputs/clips-prototype-test/audio-validation.json`. Screenshots: `outputs/clips-roblox-verified/orbit-clips.png` and `orbit-clips-narrow.png`. Public releases and the updater feed remain unchanged.

---

# 0.2.4-pre.10 — Live progress while downloads are visible

Validated October 23, 2026 on Windows. 287 Node tests and 176 packaged-app checks passed. Installer: `outputs/installer/Orbit-Setup.exe`. Installation exited successfully, the installed archive matched the tested package by SHA-256, and the installed Orbit app reopened with a visible main window.

- Visible game download panels and Steam controls request progress approximately once per second. Downloads uses the same shorter refresh cadence and cache interval. Progress uses reported bytes and percentages; it does not simulate downloaded data.
- Visible polling suspends when the document is hidden and resumes immediately on visibility restoration. Closing or replacing a dialog releases its timeout, visibility listener, close listener, and mutation observer. Reads do not overlap, transient failures can recover, and an in-flight response cannot restart a disposed watcher.
- Progress labels retain tenths of a percent and the bar uses a one-second linear width transition. Reduced-motion settings continue to disable the transition. Artwork and action elements stay mounted when their content is unchanged, including controls whose HTML was normalized by the browser; keyboard focus is preserved during progress updates.
- Lifecycle checks cover hiding/restoring, closing/replacing menus, in-flight disposal, overlapping refresh prevention, and recovery from a transient error. The packaged UI checks exercise fractional progress updates, stable bar/artwork/button identity and keyboard focus, and automatic queue refresh through real IPC in isolated smoke mode.
- The first packaged run exposed a screenshot-fixture race: faster automatic refresh correctly replaced the sample transfer with the isolated queue before capture. The static screenshot fixture now suspends polling while it is captured and restores document visibility afterward. Automatic polling has its own separate check.
- A read-only live Steam check reported no active or scheduled queue head during this run. No download was started, paused, removed, or otherwise changed for this validation.

Reports: `work/live-download-tests.log`, `outputs/live-download-final/smoke-report.json`. Screenshot: `outputs/live-download-final/orbit-game-download.png`. Public releases and the updater feed are unchanged.

---

# 0.2.4-pre.9 — Steam download starts, connection speed, and game controls

Validated locally on Windows. 283 Node tests and 173 packaged-app checks passed. The rebuilt installer is `outputs/installer/Orbit-Setup.exe`. Installation exited successfully, the installed archive matched the tested package by SHA-256, and the installed Orbit app reopened with a visible main window.

- Download commands now explicitly address Steam's local client (`"0"`), matching the installed Steam UI's native calls. A bounded live resume check on the existing paused Cyberpunk 2077 queue entry made that game active and increased its downloaded bytes. The original global pause was restored afterward; no unrelated download was deliberately started.
- The revised control path checks Steam's returned queue before reporting a start, pause, scheduling, removal, or accepted installation request. Mock checks cover ignored requests and paused/missing rows so a dispatched command alone cannot produce a false success message. Newly accepted installation rows can resume the selected game when the queue was globally paused.
- A separate live check of the final control path measured a 336 ms initial queue connection and an 86 ms accepted resume request. Other read-only samples measured 39 ms for a fresh snapshot after connection and 0 ms for its cached repeat. These are local samples, not performance guarantees.
- Replaced repeated `Get-NetTCPConnection` lookups with a bounded listener/PID check. Executable identity under the discovered Steam installation is cached for five seconds only while the listener owners remain unchanged. Every new socket connection still checks local listener ownership; non-loopback listeners and unexpected executable paths are rejected. Requests remain serialized, duplicate reads coalesce, mutations invalidate read caches, and stale reads cannot populate a newer cache generation.
- Snapshots finish when their initial callbacks arrive, with a bounded readiness timeout and subscription cleanup. The Downloads page renders its available installation data while a Steam probe runs in the background. It no longer waits for that probe before rendering.
- A game's download opens a dedicated themed panel for that app ID. The fixture deliberately includes another active game: only the selected title, progress, and start/pause, priority, and queue-removal actions appear. Folder management, other games, global pause/resume, and bandwidth settings stay in the separate Steam controls panel. Failed actions remain in the selected game's menu and report their error.
- No new Steam game installation, move, or uninstall was performed for validation. License, sign-in, storage, and publisher confirmations can still require Steam. The public release and updater feed remain unchanged.

Reports: `outputs/steam-game-download-verified/smoke-report.json`, `work/steam-game-download-final-tests.log`, `work/steam-fixed-control-check.log`. Screenshot: `outputs/steam-game-download-verified/orbit-game-download.png`.

---

# 0.2.4-pre.8 — Active download banner and Steam queue repair

Validated locally on Windows, October 22, 2026. Rebuilt and installed the installer; the installed application archive matched the tested package by SHA-256. Reopened the installed Orbit app with a visible main window.

- 276 Node tests and 169 packaged app checks passed. Coverage includes active-first ordering, queue pagination, featured-transfer deduplication, progress/rate display, native installer actions, and the themed Steam queue controls.
- A live, read-only Steam snapshot confirmed the client now wraps downloads in local-client records. The parser extracts valid app IDs, excludes remote clients, resolves library titles, and reads network progress separately from disk/staging phases. Eight valid local queue entries were recovered; none had an undefined app ID.
- The current transfer appears above the queue in a shared banner with progress, speed, estimated time, and controls. Steam artwork is requested with a header fallback; the main screenshot showed its themed gradient fallback, while the Steam-controls screenshot successfully displayed artwork. Artwork availability is network-dependent.
- Queue snapshots are cached/coalesced. The visible Downloads page and Steam controls refresh at eight-second intervals; hidden/closed views stop refreshing. Normalization removes Steam's large sample history before sending data to the UI.
- No real Steam installation, removal, move, pause, resume, or priority change was performed during validation. The installed client's live queue was read only. Public releases and the update feed were left unchanged.

Reports: `outputs/download-banner-final/smoke-report.json`, `work/download-banner-tests.log`. Screenshots: `outputs/download-banner-final/orbit-downloads-active.png`, `outputs/download-banner-final/orbit-steam-controls.png`.

---

# 0.2.4-pre.7 — Experimental Steam client bridge

Validated October 22, 2026 on Windows. Built, installed, verified the installed archive hash against the tested package, and reopened Orbit.

- 272 Node tests and 166 packaged app checks passed. Reviewed the actual themed Steam controls panel using isolated example data. Fixed the asynchronous connection/chooser check and prevented a late connection response from reopening a cancelled menu.
- Live, read-only checks against the installed Steam client succeeded in both Node and Electron: five library folder records, download items, and download overview. Confirmed the installed client exposes the required installation, folder, queue, console, and settings methods. Confirmed `app_install` is in the live console command list.
- With user authorization, restarted Steam gracefully in silent mode with CEF debugging enabled. Verified its listener binds to 127.0.0.1:8080. No Steam files, launch shortcuts, login credentials or firewall rules were patched.
- Bridge requests verify the listener belongs to Steam under the discovered Steam installation, reject non-loopback WebSocket destinations, serialize requests, bound waits, close sockets, and accept only named operations with validated numeric arguments. Renderer code cannot submit arbitrary JavaScript or console commands.
- Controls include existing library folder selection, adding a user-chosen library folder, install requests, moving and uninstalling games, pause/resume, global pause/resume, queue priority/order, unscheduling and a temporary console bandwidth limit. Mutating installation actions require confirmation and a running-game check. Operations report requests rather than claiming installation/removal completion from a dispatched command.
- Supported client routes remain explicit; an unavailable experimental bridge does not silently open a Steam window. Bridge startup refuses to force-close Steam and blocks when detected games are running.
- No real game was installed, moved or uninstalled for validation. Mutation behavior has unit/IPC guard coverage and UI checks, but is not claimed as live end-to-end verified. Advanced settings, sign-in, license agreements and publisher prompts may still require Steam's UI; this is not complete Steam feature parity.
- No new background polling runs when the controls are closed. Steam may drop the debugging flag after a restart/update; the UI then offers reconnection. Quit Steam and reopen normally to disable the debugging channel.

Interface references: [community-maintained Steam client definitions](https://github.com/SteamDeckHomebrew/decky-frontend-lib/tree/main/src/globals/steam-client), verified against local Steam UI code and live method enumeration. [Valve's public ISteamApps reference](https://partner.steamgames.com/doc/api/ISteamApps) is distinct from this private interface. Compatibility with future Steam builds is not guaranteed.

Reports: `outputs/steam-bridge-final/smoke-report.json`, `work/steam-bridge-tests.log`, `work/steam-electron-readonly.log`. Screenshot: `outputs/steam-bridge-final/orbit-steam-controls.png`. Public release unchanged.

---

# 0.2.4-pre.6 — Hybrid installation controls, Storage, and performance

Validated locally on Windows, October 22, 2026. Installed and reopened the verified build; installed `app.asar` matches the packaged artifact (SHA-256).

- **268 Node tests passed**, including installer confirmation, registration revalidation, transfer cancellation, partial-file cleanup, destination collision protection, download-history persistence, and cached/coalesced folder availability probes.
- **164 packaged app checks passed**. Exercised the real IPC and renderer controls for Storage filtering/pagination, hybrid install choices, local installer confirmation, all installer entry points, per-copy removal choices, download filtering, retained controls during progress updates, and bounded long queues.
- Visually reviewed full-size Storage, Downloads and installation menus, plus narrow Storage and removal dialogs. Drive cards scroll horizontally in narrow windows; menus follow existing theme tokens, entrance motion and reduced-motion settings.
- Direct installer downloads stream to disk with two concurrent transfers, HTTPS-only links/redirects, a 16 GiB limit, explicit setup confirmation, and a bounded local history. Downloading never runs a file automatically. Clearing history preserves downloaded files.
- Native removal opens one matching registered uninstaller, with a fresh registration/path check before execution. MSI removal uses the documented product-code form of [Microsoft's msiexec command](https://learn.microsoft.com/windows-server/administration/windows-commands/msiexec). Steam, Epic and unsupported registrations retain their original-client or Windows handoff. No game folders are deleted by Orbit.
- All actual game installs/removals were left untouched during validation. Uninstaller tests use injected executors and isolated fixtures; publisher setup and store completion are not claimed as end-to-end tested.
- Performance changes include stable download controls and thumbnails across updates, forty-row pages, short-lived folder availability checks, streamed directory enumeration instead of full directory arrays, and avoiding unnecessary playtime decoration and registry probes.
- Electron's real `net.fetch` response stream was checked against the Node stream pipeline using a tiny local HTTP fixture, without downloading or executing an installer.
- Packaged tray test passed: zero library renderers while hidden, background tracking retained, and restored library controls clickable. Private committed memory in this isolated run: 232.1 MiB visible and 165.8 MiB in the tray. These are lifecycle measurements, not a before/after benchmark against an earlier version.

Artifacts: `outputs/hybrid-pre6-verified/smoke-report.json`, `outputs/hybrid-pre6-memory/memory-report.json`, and menu screenshots in the same verification folder. Build: `outputs/installer/Orbit-Setup.exe`. Public release unchanged.

---

# Orbit 0.2.4-pre.5 Roblox close validation

- Passed all 258 Node tests and all 147 packaged-app checks. Rebuilt and installed the local preview, verified the installed archive matches the build, and reopened Orbit.
- Roblox force close includes verified RobloxPlayer and RobloxPlayerBeta processes from the selected installation, including clients without a window. Crash helpers are included only when their parent belongs to those verified players and their executable is in that same installation directory. Studio and other installation folders remain separate.
- Force close checks a fresh process list before reporting Game stopped. A surviving or restarted Roblox client produces an error instead of a success message. Ordinary game termination also checks for remaining processes at the same executable path.
- A normal Orbit close request cleans captured Roblox crash helpers after the game client exits. It does not force a still-running game closed through the normal-close path. Cleanup uses the existing scan loop, with bounded pending entries and retries; process-parent lookup runs only when Roblox crash helpers are explicitly queried.
- Windows integration tests used isolated processes named after Roblox players, a crash-handler child, and Studio. Both test players and their child helper were terminated, while the process representing Studio remained running. Other tests cover stale identity, restart detection, normal-close behavior, and deferred cleanup verification.
- Read-only inspection identified the user's background Roblox player and its crash-handler child. They exited before the guarded live-close test ran, so the live test was skipped. No newly started Roblox session was interrupted during verification.
- Corrected mixed encoding in native-menu labels encountered during validation. Public release 0.2.3 is unchanged. Packaged screenshots and report are under outputs/roblox-close-final in the workspace.

# Orbit 0.2.4-pre.4 local close controls and dialog motion

- Passed all 251 Node tests and all 147 packaged-app checks. The installed app archive matches the final build, and the updated Orbit window was reopened.
- Force close now runs the Windows taskkill command with /PID and /F. The process path and start time are verified again before termination, with a process handle retained through the handoff. The command does not target an executable name or request an entire process tree.
- Windows integration tests launched two temporary Node helpers. A stale identity was refused, normal close reported no window, force close stopped only the chosen helper, and the other helper with the same executable name remained alive. No user games were closed during validation.
- Game-close confirmations use an Orbit dialog over the current screen, with Cancel initially focused. Do not show again is saved only after confirmation, independently for normal close and force close. General settings can re-enable either warning. Packaged checks cover confirmation enforcement, cancellation, persistence, skipped warnings, and independent settings.
- Launch mode selection replays the shared bubbly entrance even when it replaces another open menu. Repeated opening cancels the earlier entrance; completed animations are released, and reduced-motion preferences remain respected.
- Preview screenshots and the packaged report are saved under outputs/taskkill-dialog-final in the workspace. Public release 0.2.3 remains unchanged.

# Orbit 0.2.4-pre.3 local menu polish

- Passed all 140 packaged-app checks, including the revised launch chooser, native radio selection, narrow-window footer visibility, and startup volume track endpoints.
- Inspected cropped app screenshots in Orbit, Dark, and Latte themes, plus a 540-pixel-wide window. Launch choices are shown together as selectable cards with a separate Steam-default row. Remember, Cancel, and Play share a consistent footer; long mode lists can scroll while actions remain available.
- Removed radio and range inputs from the generic text-input rule. That rule had added padding, background, and borders around the sound slider. The sound track now fills to the control edges at its maximum and clears at its minimum. Saved volume values and audio gain remain unchanged.
- Rebuilt and installed the local preview, verified that the installed app archive matches the build, and opened the installed Orbit window. Public release 0.2.3 is unchanged.
- Screenshots and the packaged report are saved under outputs/mode-menu-final in the workspace.

# Orbit 0.2.4-pre.2 local preview

- Passed all 248 Node tests and all 133 packaged-app checks. Checks cover mode parsing for Steam appinfo versions 39–41, Windows-only filtering, executable and working-directory containment, process identity validation, the native mode picker, launch profile saving, and close IPC isolation in smoke mode.
- Read the installed Steam cache and verified two available VRChat launch modes against local executables. No user games were launched or closed during validation.
- Close-process integration was tested using a temporary Node helper: a normal close returned no-window, then an explicitly requested force close stopped that helper only. Graceful shutdown of an actual game and VR/DirectX gameplay were not live-tested.
- Orbit requests a normal game-window close first. Force close has its own warning and checks PID, executable path, and process start time again in PowerShell before acting. Processes without verifiable path/start data are refused. Steam and other launchers are excluded from game closure.
- Launch modes are loaded lazily from Steam’s read-only local appinfo cache, with a 64 MB input limit and at most 32 cached app descriptions. Supported modes run their installed executable with the recorded arguments, working directory, and Steam app environment. A remembered choice also applies to Orbit desktop shortcuts; Ask each time is shown in the interactive app. Steam-default launch remains available for unsupported modes, updates, or client-specific requirements.
- This preview was built and installed locally. Public release 0.2.3 remains unchanged.

# Orbit 0.2.4-pre.1 local launch preview

- Passed all 241 Node tests and all 130 packaged-app checks.
- Steam launches use the detected client with `-silent -applaunch <AppID>` and literal argument strings through a shell-free spawn. Missing clients retain URL launching without options and report a clear error if options cannot be forwarded.
- Launch options use a quoted text field; existing saved argument arrays round-trip without migration. Tests cover Windows paths, spaces, empty arguments, literal quotes, and shell characters. Packaged checks exercise the actual editor and save IPC.
- Detection help accepts Steam options without requiring a preferred executable. Preferred executable overrides and non-Steam routing retain their existing behavior.
- Steam may still show game-specific prompts and may also apply options saved in Steam. No Steam configuration files are modified. Game startup with user-specific arguments was not live-tested; launch routing was checked without starting games.
- This is a local preview; the published 0.2.3 release is unchanged.

# Orbit 0.2.3 release validation

- The final 0.2.3 build passed all 237 Node.js tests and all 128 packaged-app checks.
- Startup validation includes 44 scene checks across three themes and a separate 20-check playback run. Guidance and hover-help validation includes 62 UI checks. Final source and installer files are verified against the release archive before publication.
- The application version, release metadata, installer bootstrap link, updater metadata, and source archives identify 0.2.3. The public README describes overall capabilities and general usage.
- Windows x64 builds are unsigned. Orbit remains in pre-release. The earlier background-update test notes below record the scope and remaining limits of that validation.

Previous local build validation (0.2.3-pre.5):

- Enhanced the three existing secret startups without changing their durations or soundtracks. Singularity adds curved lens arcs, orbiting light knots, and tapered twin jets. Supernova adds surface plasma loops, irregular rolling shells, and glowing debris. Big Bang adds six orbiting worlds that collapse into the seed and unfurl as galaxy arms.
- All new effects reuse the existing single bounded canvas and cached glow sprites. The sprite cache now covers the three theme colors; it is rebuilt only when the palette changes and released after playback. No new raster assets, dependencies, persistent timers, or secondary canvases were added.
- 44 targeted checks passed across Orbit, Plum, and Cloud themes at 1600 × 1000 with hardware acceleration disabled, covering rendering, theme changes, held final frames, normal exits, skip cleanup, and reduced motion. Visual review covered gathering, collapse, release, and final arrival phases.
- The initial capture run averaged 71.7–136.3 FPS, with canvas drawing costs of 0.2–0.6 ms at the 95th percentile. That run included screenshot capture during the Orbit-theme sequences; the separate performance run measures playback without capture. Measurements describe this machine and test harness, not a performance guarantee.
- All 20 checks in the final playback run passed. Without screenshot capture, Singularity averaged 123.2 FPS, Supernova 113.0 FPS, and Big Bang 136.8 FPS. The 95th-percentile canvas drawing cost was 0.3 ms for each.
- Removed unintended fallback ripple circles from the three secret scenes so their own choreography supplies the rings.
- All 128 packaged-app checks passed. The packaged animation renderer, stylesheet, startup timing, audio, and release metadata matched the source. The 0.2.3-pre.5 installer exited successfully, the installed archive matched the verified build by SHA-256, and Orbit reopened with a visible main window.
- This is a local development build; published releases and the public updater feed have not been changed.

Previous validation (0.2.3-pre.4):

- 237 Node.js tests passed with serial execution.
- 54 targeted UI checks passed for hover/focus help, pointer travel into the help panel, click pinning, Escape dismissal, all 15 tour targets, interrupted navigation, responsive placement, reduced motion, larger navigation controls, and startup resource release.
- Eight additional checks passed for controller-sized navigation, an empty first-run library, nested help without toggling preferences, dismissing help within Quick start, delayed workspace loading, closing the guide during a pending transition, and immediate hover re-entry after dismissal.
- Nebula Drift averaged 135.3–140.6 FPS in local software-rendered checks across Orbit, Plum, and Cloud themes. The 95th-percentile drawing cost was 0.2 ms. Measurements describe this machine and fixture, not a performance guarantee.
- The nebula uses two 384 × 240 cached cloud/dust layers and one canvas capped at approximately 680,000 pixels. Texture generation runs at playback/theme changes; the animation, listeners, textures, and canvas are released after playback or skipping. No extra background animation runs while the app is idle.
- Offline rendering of Nebula Drift at the maximum supported volume measured a 0.060 peak, a 0.0049 maximum adjacent-sample change, and a silent tail. The sequence now lasts 3.2 seconds and retains the gentle original sound phrase.
- Visual review used dark, purple, and light themes, with 940 × 680 and 1280 × 900 window layouts. Real-nebula reference: [NASA’s Webb Pillars of Creation](https://science.nasa.gov/asset/webb/pillars-of-creation-nircam-image/). The rendered clouds are procedural; no external imagery or new runtime dependency is bundled.
- All 128 final packaged-app checks passed. The initial packaged run caught a delayed popover-close event canceling an immediate hover re-entry; the event handling was repaired and covered by both an additional UI regression check and the final packaged run.
- All ten changed packaged scripts/styles/metadata files matched the source bytes; the packaged version is 0.2.3-pre.4. The local silent installer exited successfully, the installed app archive matched the built archive by SHA-256, and Orbit reopened with a visible main window.
- This is a local development build. Published 0.2.2 assets and the public update feed have not been changed.

Previous validation (0.2.3-pre.3):

- 237 Node.js tests passed with serial execution. One existing wall-clock Discord rate-limit test failed in the initial parallel run; its isolated file and the complete serial rerun passed. Discord transport code was not changed.
- 25 new UI/audio checks passed for both new animations, secret visibility and unlocks, persistence, reduced motion, skipping, resource release, readable Settings cards, info popovers, keyboard access and viewport placement.
- The Big Bang sequence averaged 117.9 FPS in the local software-rendering check, with a 95th-percentile frame gap of 13.1 ms and canvas drawing cost of 0.3 ms. It uses one canvas with a bounded pixel count and releases it after playback. Measurements describe this test machine, not a performance guarantee.
- Offline audio rendering at the maximum supported volume confirmed bounded peaks (Nebula Drift: 0.059; Big Bang: 0.086), small adjacent-sample changes and silent tails. Sound defaults and the volume limit are unchanged.
- 124 packaged-app checks passed, including startup choices, the new secret, accessible help text, popup dismissal and ordinary app workflows.
- The rebuilt 0.2.3-pre.3 installer was installed locally. The installed application archive matched the built archive, and Orbit reopened successfully.
- Explanatory copy is on demand; live statuses, error messages, project acknowledgments and confirmation details remain available.
- This is a local development build. The published 0.2.2 assets and public update feed have not been changed.

Previous validation (0.2.3-pre.2 and earlier):

- 237 Node.js tests passed.
- 39 startup UI checks passed across all seven built-in scenes, interrupted intros, slow library loading, custom video, reduced motion, and Settings previews. The destination remained opaque at its final layout, and input stayed blocked until the splash was removed.
- Live frame sampling at 1600 × 1000 with hardware acceleration disabled confirmed continuously decreasing scale. Warp averaged 135 FPS; Supernova interrupted during its burst averaged 50 FPS, with a 95th-percentile frame gap of 27.8 ms. These measurements describe this test machine, not a performance guarantee.
- The five packaged startup scripts/styles matched the source files byte for byte.
- The 0.2.3-pre.2 installer was rebuilt and installed locally. Its installed application archive matched the built archive, and Orbit was reopened successfully.
- Update restart coverage includes ongoing game history, manual timer recovery, exclusion of installer downtime, readiness during Orbit file operations, and background versus visible restarts.
- The update restart marker is one-use and expires after 15 minutes. Ordinary launches and stale checkpoints do not resume manual timers.
- The preceding 0.2.3-pre.1 build passed 120 packaged-app checks. Its real updater downloaded and verified the installer, and NSIS installed the update while a detected, harmless background game fixture remained alive. The installed application archive matched that package.
- A direct updated launch of the installed app consumed the restart marker and stayed hidden in the tray. The NSIS-triggered relaunch did not consume the QA harness marker in this environment, so the complete automatic background relaunch still needs an in-app live check.
- The harmless fixture was stopped after verification, and the updated Orbit app was reopened.
- This is a local development build; the published 0.2.2 assets and public update feed have not been changed.


## Controller console and original UI audio — 0.2.5-pre.7

- 323 Node tests passed, including six sound checks for signal bounds, smooth attacks/tails, distinct cues, independent volume defaults/clamping, rapid-repeat suppression, preview deduplication, stopping active voices, stale stop timers, and leaving during context resume.
- The broad packaged Electron run passed 247 checks, including the controller destinations and existing launch/download/storage/settings behavior. Its report is `../../outputs/controller-console-packaged/smoke-report.json`.
- All six cues also rendered through Chromium's OfflineAudioContext. At 50% gain their measured peaks were 0.071–0.111, the largest adjacent-sample change was below 0.009, and the final 64 samples were silent. This verifies signal continuity and headroom; it is not a subjective listening assessment on the user's speakers.
- Visually reviewed Settings, Sound & feel, Downloads, the sidebar, game information/activity/controls, game actions, Shuffle, Shelves, and the quick wheel. Fixed focused Play contrast and kept the featured transfer's progress alongside its artwork. Home and Library stay outside the secondary menu styling.
- No actual game launches, game termination, Steam installation/removal, or transfer queue changes were performed. Download checks use isolated fixtures.
- Full-app smoke logs retain existing CSP reports from older inline-style markup. The content security policy was not weakened.
- Visible renderer timing samples are short warm-window RAF callback measurements, not physical gamepad-to-display latency or guaranteed presented FPS. Physical controller and speaker testing remains useful.

- After the final audio lifecycle adjustment, the final packaged controller run passed all 53 checks (`../../outputs/controller-console-final/controller-report.json`). Its warm visible-window navigation sample averaged 6.91 ms between RAF callbacks, with 7.10 ms p95 and 7.20 ms maximum over 261 callbacks.
- Eleven packaged controller/UI files matched source byte for byte.
- The rebuilt 0.2.5-pre.7 installer completed locally with exit code 0. Installed and built application archives share SHA-256 `82FCC3B7241115BE9B13BCD0E16FD78C2A8AF42A1CE7CF329917E343A3ED22EC`. Installed Orbit and the existing source dev instance were reopened; the unrelated codec probe was preserved.


## Plain UI text — 0.2.5-pre.8

Removed decorative taglines and redundant headings from controller menus, game pages, empty states, and related desktop status messages. Labels and instructions now describe their actions directly. All 53 packaged controller checks passed. Verified the changed packaged UI text matches source. Physical gamepad polling is disabled only in the smoke harness so a connected controller cannot interfere with synthetic navigation or screenshots. No new behavior tests were added for this text edit.


## Desktop redesign and artwork/layout audit — 0.2.5-pre.9

Desktop now shares controller iconography, theme colors, rounded controls, and finite focus/press motion while using compact pointer/keyboard layouts. Shared artwork follows its intrinsic dimensions, with bounded portrait/square fallbacks. Launch profile fields have separate labels and help controls. Desktop dropdowns retain the source select and form events, use an anchored popover, and support arrows, Escape, Tab, disabled state, and focus return.

- 323 Node tests passed (`../../work/desktop-redesign-tests.log`).
- The final packaged app passed all 265 checks (`../../outputs/desktop-controller-final/smoke-report.json`). This includes 53 controller checks and the added desktop layout/interaction checks, plus the existing launch, download, settings, storage, and security regressions.
- Added renderer coverage for intrinsic wide/portrait/square image ratios and frames, compact help controls in both modes, accessible launch-field labels, dropdown commit/arrow navigation/disabled state, primary fill under focus, and reduced motion.
- Reviewed Library, Settings, launch settings and its dropdown, Storage, Downloads, Friends, Radar, controller game menus, and controller downloads. Desktop captures cover 940, 1280, and 1920 pixels. Reviewed Cloud and Dark themes. Narrow-window checks and custom-photo background checks also passed.
- Corrected inherited controller spacing in desktop downloads, hidden native-select alignment checks, duplicate download headers, primary-button contrast, clipped narrow sidebar counts, decorative icons applied to utility controls, forced artwork frames, missing artwork placeholders, and release-date selection contrast. Artwork requests remain near-viewport and bounded; skipped requests can resume when scrolled back into view.
- Twelve packaged source/UI files matched source byte for byte.
- Performance samples below measure warm visible-window RAF callback intervals, not physical input-to-display latency or guaranteed presented FPS. No actual game launches, game termination, installation/removal, or download queue mutations were performed; mutation checks use the isolated smoke environment.
- Existing CSP warnings from older inline-style markup remain in the broad smoke log. The policy was not relaxed.
- Desktop: 145 callbacks, 6.94 ms mean, 7.00 ms p95, 7.20 ms maximum.
- Controller: 261 callbacks, 6.90 ms mean, 7.10 ms p95, 7.20 ms maximum.
- The 0.2.5-pre.9 installer completed locally with exit code 0. Installed and built archives share SHA-256 `EBBBBFFE6F1E8537A11D3326F2F384B9BBF1F23DFBCA55483AB2951BFEA2EDE1`. Installed Orbit and the existing source development instance were reopened; the unrelated codec probe was preserved.


## Navigation, artwork, and UI consistency — 0.2.5-pre.10

Desktop content and workspace headers share a centered width and balanced scrollbar gutters. News thumbnails use a consistent 16:9 crop; full news imagery remains available in the article view. Collections has a visible library selector and management action. Desktop game covers are larger. Storage uses consistent compact banners with contained portrait fallbacks, while download cards keep their artwork proportions and adapt to the available space.

Controller scrolling follows the latest target with one interruptible RAF per scrolling container. It cancels when routes change, respects reduced motion, and finishes without getting stuck on rounded scroll positions. Grid movement stops at row edges. Matching library cards and decoded artwork remain mounted through filtering in both modes; image release still occurs when the app is hidden. Large controller route surfaces no longer animate as one layer. Mode-switch observers receive the updated mode before enhancing controls.

Game details use a stable outer window with internal scrolling when Game options expands. Nested summaries use one header/frame. Additional action buttons, shell controls, and forms share the icon, focus, spacing, and theme system. Download progress preserves decorated action buttons and keyboard focus between samples.

- All 323 Node tests passed (`../../work/ui-consistency-final-tests.log`).
- All 313 final packaged checks passed (`../../outputs/ui-consistency-final-packaged/smoke-report.json`).
- Added checks for Installed card retention in both modes, repeat selection, keyed card reorder/update/removal, continuous held-stick travel, row boundaries, scroll reversal and completion, mode-switch event order, stable detail-window size, single-frame summaries, download focus retention, compact storage banners, and responsive artwork cards.
- Desktop geometry checks cover 940, 1280, 1920, and 2559 pixels; Downloads is also captured at 940 and 1920. Controller secondary menus are checked for centered content. Existing narrow-window, theme contrast, reduced-motion, and custom-background checks pass. Reviewed the captures for Library, news, storage, downloads, game details/options, Add game, Appearance, and controller menus.
- Nineteen packaged source/document files match byte for byte; packaged application identity and version also match (`../../work/ui-consistency-package-files.json`).
- Warm visible-window timing: controller 6.90 ms mean / 7.10 ms p95; desktop 6.85 ms mean / 7.00 ms p95. These are short RAF callback samples, not measured presentation FPS or physical controller-to-display latency. Held-stick validation uses simulated Gamepad input; hardware feel still depends on the user's controller and display.
- User game/transfer mutations are not exercised against the live account; mutation checks use isolated smoke fixtures. Existing inline-style CSP warnings remain in the broad smoke log; the policy was not relaxed.
- The final local installer exited with code 0. Installed and built archives share SHA-256 `6CCF1F030CACB608F0A85EDE9C8E28EBF46483605E620311202910F047A172EE`. Installed Orbit was reopened. No source dev instance was active to restart.


## Controller launch, news, privacy, and preference recovery — 0.2.5-pre.11

Controller launches retain Orbit while waiting for a verified game window. The handoff focuses that process before minimizing Orbit, keeps an explicit switch action when Windows refuses focus, tolerates process replacement gaps, and restores the originating menu after the detected session ends. Keep browsing leaves the launch running and retains return tracking. The renderer stays available during tracked controller sessions. Desktop minimize-on-play preferences remain unchanged. Supporting tools do not minimize Orbit during a controller handoff.

Select, Back, Menu, Quick wheel, and tab bindings are configurable in both settings interfaces. Assignments are validated against conflicts, prompt labels follow the mapped physical buttons, and legacy wheel preferences migrate. Settings categories and choice lists use logical vertical movement, right enters the selected category, left returns from its controls, and shoulders switch tabs/categories. Input gestures reset after focus loss. Desktop gamepad navigation uses the same focus and scrolling implementation.

Steam announcements open in an in-app article reader from Home, What's new, and game news lists. The reader formats Steam BBCode into a static vocabulary, strips source HTML and executable content, loads approved Steam images through two bounded cache jobs, supports right-stick and directional article scrolling, and restores the originating focus on Back. Full article images retain their proportions and use a separate larger cache size. Only the explicit browser action opens the original trusted Steam URL.

Menu canvases use the available width; game details and settings retain stable full-window bounds. More has a separate leading symbol, an aligned chevron, matching action height, and safe spacing. Hover/focus no longer expands long controller buttons into neighbors. Launcher controls have recognizable platform symbols and startup choices have distinct space illustrations. Controller Home and Library structures remain intact.

Discord controls are in Privacy in both modes. The disclosure provides names/time/menu/background visibility, per-game exclusions, and an optional selected-games policy. Hidden library games and Guest mode clear activity. Presence describes the current workspace or game instead of 'In Orbit'. Existing opt-in state is retained. Configuration and privacy tests use fake/local IPC transports; no real Discord account is changed by validation.

Interface settings now mirror to an atomic native profile file with previous-copy recovery. Library saves also retain a previous valid copy. Migration salvages valid themes individually and preserves the current active theme. Manual interface backups include controller/startup/sound choices. The photo-theme editing/export budget matches the durable preference budget, allowing all recovered themes to remain editable.

- All 344 Node tests passed: `../../work/ui-handoff-unit.log`.
- All 338 final packaged checks passed: `../../outputs/handoff-release-validation/smoke-report.json`.
- Packaged tests include custom/conflicting bindings, category navigation, Desktop gamepad scope, menu alignment, Privacy game selection, handoff screen states, full Steam article rendering, executable-content rejection, Back focus restoration, and actual renderer reload after clearing browser local storage. Themes and controller choices recover from the native profile.
- Existing wide/narrow geometry (940–2559 px), artwork ratios, card retention, theme contrast, reduced motion, nested dialogs, focus preservation, sounds, and bounded startup scenes remain covered. Captures for bindings, launch handoff, news, Privacy, launcher symbols, and startup icons were reviewed.
- 154 packaged JavaScript/CSS/HTML/JSON source files match the source tree byte for byte: `../../work/handoff-packaged-files.json`.
- Final controller navigation RAF sample: mean 7.21 ms, p95 7.20 ms. Desktop: mean 7.03 ms, p95 7.10 ms. These short callback samples are not physical input latency or presentation FPS.
- Launch readiness/exit tests use verified-state fixtures and injected focus outcomes; no real user game is launched or terminated. Game-window detection cannot report shader compilation or an internal loading percentage. Physical controller feel still requires testing on the user's controller/display.
- Initial profile backup: `../../work/user-settings-backup-20261023-173148`. Final pre-install backup: `C:\Users\terry\Documents\Codex\2026-10-18\wr\work\user-settings-before-pre11-20261023-181700`. Both profiles retain all scalar interface choices, unchanged native settings, and their active theme; seven valid custom themes are now available in each profile. Installed Orbit completed native bootstrap with a previous-copy backup. The inactive development profile is seeded for its next launch. Details: `../../work/pre11-preservation-verification.json`.
- Installer exited 0. Installed and built archives match SHA-256 `2269DCC40CAA7046372EF6BE67655099E27100B6DEBD708E5D3314FA7329C166`. Installed Orbit was reopened and has a responding visible main window. No source development instance was active to restart.


## Startup cards, launch chooser, and privacy alignment — 0.2.5-pre.12

Startup choices use intrinsic rows with separate icon and label columns, consistent compact sizing, readable theme ink, and no legacy icon rotation or dark-on-dark fills. Custom video follows the same card footprint. The launch chooser groups artwork and mode choices in one responsive layout, keeps the footer across the full form width, reserves space for focus rings, and scrolls its content while retaining footer access in small windows. Artwork proportions and radio/remember-choice behavior are preserved.

Discord visibility uses one disclosure frame with an inset keyboard/controller focus ring and a consistent chevron. Its component opts out of generic summary decoration without increasing the specificity of rules used by other detail headers. Expanded content retains spacing and fits inside the frame.

- All 344 Node tests passed: `../../work/alignment-unit.log`.
- All 48 final packaged alignment checks passed: `../../outputs/alignment-packaged-final/alignment-report.json`. Coverage includes dark/light themes, 940/1920 px windows, icon/label bounds, equal card footprints, launch gaps and footer access in desktop/controller modes, radio selection, and closed/open disclosure geometry.
- All 46 desktop regression checks passed: `../../outputs/alignment-desktop-final/desktop-report.json`, including unchanged detail-header frames, stable game options, artwork proportions, responsive widths, and reduced motion. Final startup, chooser, and privacy captures were visually reviewed.
- 156 packaged source files match byte for byte; installer exited 0 and installed/built archive SHA-256 matches `1D6E45A18C9CD0A883BB8A671788EA454B0EED8A1D2E7693243AF3F6952F7AF4`. Installed Orbit was reopened with a responding visible main window. No source development instance was active to restart.
- Current settings were backed up to `C:\Users\terry\Documents\Codex\2026-10-18\wr\work\user-settings-before-pre12-20261023-183542`. Both profiles retain every scalar interface choice, unchanged native settings, their selected theme, and seven custom themes: `../../work/pre12-preservation-verification.json`.
# 0.2.5-pre.13 readability and release checks

- Bundled the unmodified Nunito variable font and its SIL OFL notice. The rounded default works offline; an existing custom font still takes precedence. Desktop body text is 15px, settings labels 15px, notes at least 13px; secondary controller menus use 18px body/labels and 16px notes. Utility icons retain their own compact sizing. Controller Home and Library geometry is preserved.
- Added slightly smaller popups, aligned library controls, readable section headings, and separate scrolling for expanded content. Settings and game details retain fixed bounds when options expand. Theme secondary text gets a rendering-only contrast adjustment to at least 4.5:1 on ordinary background/panel pairs without rewriting the saved theme.
- 347 unit tests pass. Focused source readability checks cover font loading, custom font precedence, text sizes, light/dark palettes, 940/1920 widths, horizontal clipping, utility icons, popup insets, and reduced motion. The desktop regression checks cover additional widths and artwork proportions.
- The apparently old `v0.2.0-pre.1` update address is the intentional shared public feed used by existing installations. It currently advertises 0.2.3. Verified the public installer download against its actual size and SHA-512. The manual installer action now follows validated official asset metadata and falls back to the official releases page when unavailable. Build and runtime feed configuration share the same source.
- The packaged NsisUpdater was exercised against the real public feed from an older release, the current public release, and this candidate. A loopback feed serves the actual candidate installer: older releases and pre.12 discover it, its download passes the updater's verification, and pre.13/final 0.2.5 do not downgrade. No installer was executed by this harness and no public release/feed was modified.
- A real Discord desktop connection completed the Orbit application handshake and acknowledged clearing activity for the QA process. No visible activity, game title, privacy preference, or account setting was published/changed by the probe. Policy and per-game privacy combinations remain covered by automated tests.
- A disposable native Windows application exercised the real process scanner and Win32 focus helper. Orbit stays visible while a process has no window, focuses the ready window before minimizing, and restores after the process exits and the grace period passes. This goes beyond injected window-state fixtures; it does not claim a real game or physical controller playtest.
- Physical DualSense navigation and a real game launch/exit cycle remain for the user, who agreed to test after installation. A clean profile is checked separately from a clean Windows machine; no Windows Sandbox is available here. The public 0.2.5 update path must be rechecked after publication; local validation does not publish the candidate.

Final pre.13 evidence:

- 347 unit checks: `../../work/readability-unit-final.log`.
- 338 full packaged checks from a new isolated profile: `../readability-packaged-full/smoke-report.json`; 46 focused typography checks: `../readability-packaged-type/readability-report.json`; 48 popup/alignment checks: `../readability-packaged-alignment/alignment-report.json`. All 432 checks passed; captures were visually reviewed in dark/light palettes and narrow/wide windows. No renderer errors were logged in these final runs.
- Public asset and live Discord checks: `../readability-release/release-readiness.json`. Native Win32 process/window check: `../readability-native/native-handoff.json`. Eight packaged updater selection/download checks: `../readability-update/updater-report.json`.
- All 169 source/assets plus README and third-party notices match the package byte for byte; packaged version, entry point, and dependencies match the source manifest (electron-builder normalizes package metadata): `../../work/pre13-package-verification.json`.
- Installer exited 0, and the updated installed application reopened with a responding visible main window. Built and installed archive SHA-256: `EEA29CE4B663CFA1D021AFEAE540E32948C1CE41AC348ADBC8CA7F8D792F5044`.
- Settings were backed up immediately before installation to `../../work/user-settings-install-pre13-20261023-190208`. Both Orbit and Orbit-Dev retain unchanged interface/native settings, their selected theme, and seven byte-equivalent custom theme records: `../../work/pre13-preservation-verification.json`. No source development instance was active to restart.

