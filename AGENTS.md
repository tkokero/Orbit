# Orbit project preferences

These instructions consolidate the user’s recurring preferences and explicit product decisions. Apply the latest explicit user direction when it supersedes an earlier choice. A requested feature is not evidence that it is implemented or authorized for an unrelated task. Keep implementation status, current version, release approvals and detailed plans in the roadmap and validation records rather than treating historical chat statements as current state.

## Priorities and user data

- Prioritize Desktop mode. Controller work can wait unless explicitly requested. Preserve the existing Controller Home and Library layouts unless the user requests changes to them.
- Preserve existing settings and custom themes across updates, dev-build replacements, migrations, and repairs. Do not replace saved choices with defaults on startup or after an update.
- Preservation includes artwork and crop choices, library layouts and density, collections and pins, popup preferences, privacy settings, profile-link decisions, startup/tray choices, and authorized remembered connections. Check existing normal and dev profiles when changing persistence.
- Validate repaired preferences through the normal loader and its storage limits. Do not blindly merge archival themes into a live profile; honor the latest saved choices and retain older copies separately when they do not fit.
- Keep features that already work intact while polishing them. Distinguish implemented features, proposed additions, and checks that still need a playtest.
- Clipping defines the 0.3.0 release direction. Keep the active release scope in the roadmap; do not add unrelated major features to a polish pass. The latest priority is regular Orbit and release polish across UI, CPU/RAM, startup, clipping, background behavior and relevant VR regressions.

## Quiet validation and installation

- Intrusive development checkups were reported in this user's testing workflow, not established as a problem for ordinary users. Keep development findings separate from product-wide claims.
- Target renderer unloading two seconds after closing to the tray, while retaining safety gates for active work and keeping native background services alive.

- Run checkups and UI validation hidden, without showing or focusing native windows. Do not interrupt a running game or focus Orbit for a routine check or validation install.
- Normal user updates should reopen Orbit visibly in Desktop mode, and Windows sign-in should open Desktop mode when Launch at login is enabled. Retain the one-time 0.2.6 start-minimized migration where needed; do not repeat it on every startup or enable disabled Windows startup entries. Automatic updates during a game should reopen without taking focus from the game.
- Run native focus, game-launch, and account-authorization checks only during a user-agreed playtest. Keep native-window test fixtures explicitly opt-in; a routine unit-test command must not silently start them.
- Use isolated profiles and fixture data for automated UI checks. Do not manipulate real downloads, game installations, accounts, or saved credentials to make a test pass.
- A user's daily-use and installer feedback counts as playtest evidence. Avoid repeating disruptive checks without a concrete reason. Record skipped, failed, and unperformed checks honestly.
- The user has given standing approval to install each finished, validated Orbit build locally. Install it automatically after required checks pass; do not ask for installation approval again. Show the setup window for these development installs, as requested on November 9, 2026; do not use silent installation. Back up and preserve both normal and dev profiles, and verify the installed files and saved settings. Keep routine validation hidden and do not close or interrupt games.
- Installation approval does not authorize publication. Keep an unapproved release in draft until the user explicitly approves publishing that release. Earlier published versions and old approvals are history, not a standing publication grant.

## Shared design and text

- Check changed surfaces against the shared visual language on every UI pass. Group related actions by purpose and keep featured game artwork prominent.
- Keep established major layouts after a UI review. Prefer small, evidence-based fixes to spacing, states, labels, and unnecessary elements; change a major UI only when needed to resolve a clear problem or when the user explicitly requests it.

- Orbit should feel rounded, bubbly, expressive, and polished. Use shared theme colors, original space illustrations, clear icons, consistent spacing, and restrained feedback rather than bland controls or generic decoration.
- Keep buttons, icons, logos, and custom appearance controls consistent with the shared theme and saved customization choices.
- Follow the shared dashboard cleanup reference on Desktop: reduce repeated icon bubbles, stacked outlines, decorative badges, and arbitrary motion. Let typography, spacing, real artwork, and clear states establish hierarchy. Reserve accent emphasis for selection and primary actions; retain Orbit’s rounded identity and chosen theme.
- Keep the Windows taskbar and tray icons matched to the same startup artwork; apply their selected theme together when Orbit fully restarts. In-app and tray-menu colors still change immediately. Do not force live taskbar regrouping or restart Explorer to refresh icons.
- Appearance should let users match the app icon to their theme or choose an independent icon style. Save the independent choice without changing the interface theme; apply shell icon choices on full restart.
- Restart Orbit must perform a full process restart and the normal startup sequence, including the selected intro with existing sound, animation and reduced-motion preferences respected. Preserve settings and active session tracking across the restart.
- Keep UI text simple and direct. Use descriptive labels and short instructions. Remove useless or repeated descriptions, decorative subtitles, duplicate headings, marketing copy, playful taglines, and unnecessary space metaphors.
- Do not add persistent taglines or routine how-to sentences beneath headings and controls. Use self-descriptive labels, actual status, the tour, and on-demand help. Keep privacy and safety details beside the relevant choice without repeating them across the menu.
- Tours should cover implemented features in short, plain-language steps, point to real controls, and restore the user's page, filters, selection, scroll position and keyboard focus when closed. Keep Next/Back in a stable position and group steps by workspace so users do not chase moving controls.
- Keep useful status, errors, recovery actions, privacy explanations, and destructive-action warnings. Simplifying copy must not remove information needed to make a decision.
- Text must be easy to read, with a rounded typeface, clear weight and hierarchy, and adequate contrast. Do not shrink text to compensate for a poorly sized layout.
- Give launchers their actual symbols and themes/startup scenes icons that match their names. Avoid using the same generic symbol for unrelated actions.
- Keep info icons, overflow controls, close buttons, and other utility controls separate from full-size action-button decoration. Icons, labels, arrows, and optional subtitles must occupy separate, stable layout areas.
- Group related settings together instead of splitting closely related controls into separate categories (for example, themes with app icon choices). Use Miscellaneous only for controls with no suitable category, and omit empty categories.
- Related action buttons should share a horizontal row when space permits. Wrap naturally at narrow widths; do not force separate rows with redundant wrappers.
- Buttons need enough spacing for hover, focus, and press effects without colliding with adjacent controls. Avoid overlaps, clipping, accidental gaps, and empty detail pages.
- Keep frequent actions close to the content they affect. Prefer readable action targets to tiny links at the far edge of a page, and keep popup primary actions reachable while its content scrolls.
- Keep motion responsive and inexpensive. Logical focus changes immediately, animations can be interrupted, and reduced motion is respected. Avoid large live blurs and perpetual animation on unfocused controls.
- Use the selected Glide direction for shared menu motion: a short lift with a soft settle, stable outer frames during internal navigation, and a startup handoff that preserves the selected intro and sound.
- Remove duplicate visible routes and ambiguous shortcuts. Keep a clear route to each useful feature, including an alternative when its usual navigation is unavailable, and label return actions with their destination.
- Keep the visible action set small across menus. Group occasional tools by purpose, show form Save actions when there are unsaved changes, and keep primary, emergency-stop, and confirmation actions reachable. Reduce repeated button rows without hiding useful features behind unclear routes.
- Reducing buttons must not create a long catch-all menu. Put actions beside the content they affect, use small groups with specific names, and keep each revealed group short enough to scan.
- Keep related buttons visible when they fit comfortably in a single action row. Do not replace a short, useful row with a dropdown just to reduce the button count; wrap at narrow widths.

## Artwork and library presentation

- Make high-quality game artwork prominent and easy to access. Preserve source proportions; do not stretch custom artwork, force portrait art into landscape banners, or add unnecessary empty frames.
- Do not use image generation for Orbit artwork or startup scenes. Use original code-drawn/vector artwork or appropriate existing assets. Afterglow's sound may follow its anime-opening inspiration instead of Orbit's usual console sound palette.
- Use suitable landscape artwork for banners. Contain portrait and square fallbacks. Keep comparable items at consistent visual sizes without distorting their images.
- News banners should crop into the space reserved for the news card, so tall photos cannot expand an entire row. Article photos should remain visible inline, and article links must work. Keep Steam news readable inside Orbit.
- VR panel/source pickers and panel management should show live visual previews, rather than text-only source names. Apply the same preview-first approach to future clipping source and framing controls. Keep previews local and ephemeral; do not save capture images or start recording just to show a preview.
- VR hand attachment for Orbit should be a compact wristwatch for FPS, media, and quick tools, rather than a full-size dashboard strapped to the hand. Keep the full menu in the dashboard or a separate panel.
- Mount wrist displays beside the controller on the back-of-hand side, facing inward toward the wearer, mirrored for left and right. Hide them when the headset is not facing them. Keep added wrist tools collapsible instead of strapping the full dashboard to the hand.
- Keep captured-screen Move, Resize, Hide and Close controls beside each screen, with quick management on the wrist. Preserve source proportions and explicit Windows-input consent.
- Keep selectable VR wrist-display styles: a compact Watch, and a slim Toolbar inspired by the user's reference with live panel shortcuts and a selected window floating above it. Share Orbit's theme across both and remember the user's choice.
- Keep Downloads large enough to fit the app's design, with readable progress, meaningful artwork, and reachable controls. Avoid tiny stretched thumbnails and clipped actions at the right edge.
- Keep library layout, card size, and spacing choices saved. Make collections directly discoverable, including pinned collections. Preserve Ctrl/Shift selection, bulk organization, and Undo when changing library controls.
- Keep scroll position, filters, selection, and keyboard focus stable during refreshes and when closing details. Avoid banners disappearing and reappearing when an unchanged filter is selected again.

## Desktop menus and popups

- Desktop should complement Controller Mode through shared icons, colors, rounded shapes, and motion, while behaving naturally for pointer/keyboard input and desktop space. Do not copy the console layout exactly.
- Use the available content area purposefully. Center menus and their contents; do not leave them shifted left, spread tiny controls across oversized rows, or create arbitrary empty areas.
- Default popups should be compact and centered, leaving the underlying app visible. Keep them usable at narrow widths and different display scales rather than making every popup fill the screen.
- Support corner-drag resizing, including game details in Desktop mode. Keep the shared-size versus separate-size choice and remembered sizes working across popups. Constrain restored sizes to the current viewport.
- Expanding Game options or another section must not unexpectedly resize or move the outer popup. Scroll the content area while keeping the header, close control, and primary actions reachable.
- Use Orbit-styled right-click menus throughout the app. Actions should make sense for the page or item and expand on the visible controls instead of repeating them. Preserve text editing and keyboard access, including focus restoration after dismissal.
- Check both modes, narrow and wide windows, display scaling, theme contrast, and reduced motion after shared visual changes.

## Controller interaction and game handoff

- Other controller menus should feel like an expressive Orbit console: rounded controls, purposeful groupings, visual status, original illustrations, and springy focus/press feedback.
- Navigation must follow logical rows and groups without surprising jumps. Give all prompts, including launch-mode choices, usable controller actions and clear confirm/back behavior. Expose specific controller bindings in Settings.
- During a controller launch, keep Orbit as the main window until the actual game window is ready. Do not immediately dismiss Orbit for a launcher, splash screen, or cloud-save prompt. Transition smoothly into the game, then restore the controller view promptly after confirming the game has closed.
- Controller sounds should share Orbit's soft, glassy, bubbly space-console character. Keep navigation subtle, distinguish confirm/back/toggle cues, throttle rapid repeats, and provide independent sound and volume controls.

## Friends and integrations

- Keep Friends native-feeling, simple, and uncluttered. Collapse account-management controls when they are not needed.
- Online should show fresh Online and Do Not Disturb presence, excluding Away, offline, and stale entries. Sort playing friends first, then DND, then plain online friends. Keep other states available through an explicit All friends view.
- Similar Steam/Discord names can suggest a match; linking requires confirmation. Keep provider identities and their individual presence distinct, and preserve confirmed links across restarts. Default the main linked profile to Discord; allow a per-friend override and preserve it.
- Discord friends access should request only basic identity and read-only relationships access. Do not add activity, chat, voice, invites, or friend-management permissions as a fallback. Show only accepted friends and describe consent accurately.
- Keep Discord Rich Presence separate from Friends, under Privacy. Hidden/unshared game names should show generic "Playing a game" activity under Orbit; Guest mode and disabling sharing still clear it. Keep elapsed-time and background controls respected.
- Keep native integrations useful and honest about their availability. Do not display an unsupported provider as connected. Explain failures and provide relevant retry or client-opening actions.
- Steam controls should have clear purposes for Downloads, Storage, and Connection. Preserve progress, artwork, focus, and row identity during polling. Explain a required Steam restart before enabling its optional connection.

## Optimizations

- Before preparing a public release, present a short optimization question board in the development conversation: ask which areas need extra attention (RAM, CPU, GPU/VRAM, UI, startup, background behavior, storage/network, or VR), where problems occur, and any preferred performance/quality tradeoffs. This is a development review, not a recurring popup for ordinary app users. Reuse answers already given for the same release instead of repeatedly asking.
- Audit every relevant optimization category even when the user selects a priority. Proactively fix actionable bottlenecks and UI defects within the release's scope; do not stop at the named examples. Record larger work, unresolved regressions, and checks needing a playtest instead of promising that every theoretical optimization is complete. Continue safe baseline checks while optional feedback is pending; publication still requires the user's explicit approval.
- Check all UI surfaces for intended centering and alignment within their containers. Menus, icons, labels, arrows, fields, and action groups must not overlap, cross menu boundaries, clip, or collide during hover, focus, selection, and expansion. Preserve readable text alignment and explicitly saved popup positions rather than centering every individual text label or overriding the user's placement.
- Check narrow and wide windows, resizing, different display scales, multiple monitors, long labels, empty/loading/error states, themes, and reduced motion. Keep headers and primary actions reachable, artwork proportional, and scroll/focus/selection stable. Use isolated fixtures for automated navigation.
- RAM: check the whole Orbit process tree, growing caches, duplicate artwork, retained dialogs, event listeners, timers, capture streams, native handles, and resources left after closing a feature. Bound caches and queues, release unused resources, and verify repeated open/close cycles. Keep the two-second tray-unload target and existing safety gates.
- CPU: remove redundant polling, repeated scans, duplicate subscriptions, unnecessary serialization, and full UI rebuilds for unchanged data. Prefer events, incremental updates, debounced work, and bounded background tasks. Hidden or inactive surfaces should stop unnecessary work while required tracking/download services continue.
- GPU/VRAM: reuse textures, avoid unnecessary uploads/readbacks, excessive image sizes, large live blurs, overdraw, and animation on hidden surfaces. Check flicker, frame pacing, and the resource cost of multiple VR panels. Respect reduced motion and preserve the selected startup animation/sound.
- Startup and responsiveness: show useful cached content promptly, defer nonessential work, start optional helpers only when requested, and avoid blocking the UI during searches, scans, image decoding, news loading, and saves. Check normal startup, Windows sign-in, update restart, and a warm reopen separately.
- Storage and network: avoid duplicate downloads, redundant requests, needless disk writes, and unbounded logs or temporary files. Use appropriate caching, request deduplication, cancellation, retry backoff, and bounded concurrency. Do not delete user artwork, themes, credentials, or recordings as an optimization.
- Battery and background behavior: reduce wakeups, pause hidden previews/animations, and verify idle, unfocused, tray, disconnected-runtime, and optional-feature-off states. A closed VR or capture feature must not leave its helper, streams, or device resources running.
- Measure before and after using the same fixture, workload, machine, process scope, and sampling method. Report startup/responsiveness timings, CPU, memory, or frame-time changes only when measured; distinguish working set, private memory, GPU memory, and cache effects. Do not use forced memory trimming or one idle screenshot as proof of a lasting improvement.
- Optimization must preserve settings, privacy, accessibility, useful status, visual quality, and working features. Do not obtain lower usage by silently disabling features, lowering capture quality, removing feedback, shrinking text, or skipping required work. Ask about a genuine quality/functionality tradeoff when existing preferences do not settle it.
- For each release candidate, keep a concise record of findings, fixes, comparable measurements, regression checks, remaining limitations, and user playtest evidence. A question board is not proof of optimization, and automated checks are not a substitute for an unperformed hardware test. Use [the release optimization checklist](outputs/Orbit-source/docs/RELEASE-OPTIMIZATION-CHECKLIST.md).

## Documentation and release notes

- Release notes must cover additions and user-visible changes since the previous published version without presenting existing features as new. Include the meaningful new capabilities, group related changes, and avoid both vague claims and exhaustive implementation detail.

- Keep validation notes short and easy to understand. Lead with what changed, what passed, and what still needs testing. Explain important changes with concrete examples, such as "Before: reopening showed Tools. After: it keeps your saved Games view." Label illustrative examples separately from checks actually performed.
- Pair each validation example with both a short explanation and a relevant image. Prefer actual app screenshots for UI changes; use a clear diagram for behavior that a screenshot cannot show. Label sample data, mockups, and illustrative images accurately. For changed UI, include paired before/after screenshots with a short explanation of the difference, and do not present an illustration as proof that a check passed. Keep detailed evidence linked separately.
- Summarize test results and settings preservation in plain language. Keep skipped checks, unresolved issues, and measurement limits visible; link detailed logs and technical records instead of filling the summary with implementation terms, hashes, and exhaustive check lists. Never claim performance gains without comparable measurements.
- Keep public Markdown guides short and practical, with detailed technical/history records linked separately. Keep the README generalized: explain Orbit, its overall features, and major capabilities in clear language for users.
- Write release notes around overall new features and user-visible improvements. Group bug fixes and optimizations into concise descriptions. Keep implementation details, exhaustive checks, and known validation limitations in development or validation documentation.
- Describe the final shipped scope accurately. Do not announce a proposed feature or an unvalidated integration as completed.

## Library identity, removal and activity

- Remove from library and Hide are different operations. Removal must remove the game from Orbit’s active library and tracking, not move it to Hidden. Prevent automatic discovery from immediately resurrecting a deliberately removed entry; use the project’s explicit re-add/restore mechanism. Never interpret removal as uninstalling the game or deleting its files. Preserve privacy hiding as a separate choice.
- When entries share executable/install files, prioritize the specific card launched through Orbit for the observed session. Avoid attributing its playtime, presence, clips or running state to a different card merely because paths overlap. Do not count one verified game process twice.
- Detection must distinguish installed, owned/account-library and previously played/unverified entries. Play history alone is not proof of current ownership. Investigate false positives and launcher chains using evidence, rather than deleting legitimate games by title or guessing running state from a launcher alone.
- Show per-game times played and current streak in game details, backed by recorded sessions. Keep per-game and overall streaks distinct; do not invent historical sessions or imply a playtime total proves a launch count.
- Activity must offer All games and an obvious way to clear a selected game. Clicking the selected game filter should permit returning to the overall view. Preserve recording/history privacy preferences.
- Keep cover, landscape-banner and list layouts; saved size/spacing, pinned manual and smart collections, active-filter chips, clear filters/counts, useful empty states, Ctrl/Shift selection, bulk organization and Undo. New controls must not break these established capabilities.

## Optional Desktop layouts and settings

- Unified Search should reach games, collections, settings and useful actions. Open the actual setting with its correct section expanded and focus visible. Keep Clips reachable through Search when its sidebar entry is hidden; do not let development-only gates hide shipped functionality.
- For launch choices, prefer the selected Quick picker direction. Named/custom targets should solve real launch differences, not add mandatory Normal/Modded/VR clicks when the game or existing mod launcher already handles them. Do not present launch presets or SteamVR preparation as required for every game.
- The optional Library workspace is a distinct interface with a grid and useful details panel, inspired by Playnite desktop while retaining Orbit’s identity. A request for a new UI means a meaningful new composition, not merely repositioned existing assets. Keep the original interface available.
- Layout customization should allow independently mixing navigation/sidebar style, library presentation and details behavior, rather than locking every choice to a preset. Use visual layout examples and an interactive preview instead of names alone. Respect the saved theme and background across every combination.
- Let users choose visible sections/functions, their order, recents behavior, sidebar items, density and top-bar transparency. Presets are starting points, not overrides of later custom choices. Keep an accessible route back to settings and useful hidden-navigation features through Search or another appropriate route.
- Automatically fit Recents to the usable row width without arbitrary gaps, clipped cards or unstable reordering. Keep art and titles readable. Give the details panel enough width and proportional banner space; keep Game settings close to its Play/details controls.
- Reuse the existing complete Settings popup in both interfaces. Do not maintain a reduced duplicate settings page underneath it or create nested Settings routes. Fit the shared settings elements to available space. Do not add a Customize layout button that only returns to controls already visible on the same page.
- Quick Start should help users choose preferences, themes, startup choices and relevant implemented features. Recommend the tour clearly without forcing it. Keep tour controls stationary and navigation logically grouped; do not make the user chase Next around the screen.
- Editable bindings should use the shortcut itself as the edit target, not an unnecessary adjacent Change button. Show conflicts and capture/cancel states clearly.

## Clipping and playback

- Aim for a Medal-like local replay workflow: capture in the background when explicitly enabled, save the recent moment with a configurable shortcut, and browse/play saved clips in Orbit. Research public documentation and observable behavior; do not claim access to another product’s proprietary backend or copy inaccessible code.
- Preserve explicit capture-source selection and opt-in audio. Source previews should be large, stable, proportional and visual; refreshes must not reshuffle sources unnecessarily. Merely opening Clips or a preview must not start recording.
- Support the implemented replay/session modes, quality choices and per-game recording overrides without silently changing them. Keep 1440p available with a confirmation explaining its higher resource demand before applying it. Do not repeat that warning as a persistent tagline.
- Let users choose PC/game audio by app or output device and optionally add a microphone, with independent device selection, volume and saved presets. Missing/unrecognized devices must not prevent remaining audio from recording: omit unavailable devices from the active list, retain the saved selection, and restore that selection when the device returns. Do not silently capture a different microphone or unrelated app as a fallback.
- Keep save/stop shortcuts changeable and usable during games. Play a short Orbit-like clip-saved cue after a successful save, with a saved preference to disable it. Do not signal success before the file is successfully saved.
- The viewer should use available width and height while preserving video proportions, with working volume, fullscreen and playback controls. Avoid a tiny centered video above a mostly empty popup. Keep source thumbnails and saved-clip grids stable during refresh and resize.
- Keep internal metadata, replay segments and temporary audio files out of the ordinary user-facing gallery. Clean up owned temporary resources without deleting recordings. Preserve actual playable media and show meaningful game/source titles rather than raw timestamp filenames where metadata exists.
- Do not announce unsupported cloud sharing, automatic highlights, trimming or separate-track editing as completed. Distinguish supported audio mixing from future separate audio tracks.

## Additional interaction details

- Popup dragging and corner resizing should work across all eligible menus, including Clips and game details. Remember positions per display when supported, constrain restored geometry to the available display, and preserve the shared-size versus separate-size preference. Do not shrink text to simulate resizing.
- Clicking outside a dismissible popup should close it where appropriate, with Escape and a reachable close control retained. Do not silently discard unsaved edits or dismiss a destructive confirmation as though it succeeded.
- Parse news lists and separators into separate readable notes. Handle Steam markup, inline images and clickable links instead of showing raw list terminators or concatenating bullet points into a paragraph.
- Keep VR panels sharp enough to read at their intended physical size. Address flicker, click latency and unresponsive menus rather than covering them with animation. Do not rely on an awkward point-to-use gate for the wrist toolbar; preserve explicit desktop-input consent for captured windows.
- VR performance readings must identify their source and measurement interval. Distinguish measured application FPS, compositor/reprojection state and frame timing; do not label an unverified inverse-frametime approximation as fpsVR-equivalent accuracy. Keep headset/runtime compatibility claims, including Virtual Desktop, limited to evidence.
- If a promotional demo is requested in both formats, deliver landscape and portrait versions with readable framing and actual interaction. Keep the requested duration, and do not claim every feature is demonstrated when the edit only shows a subset.

## Graphics settings and experimental features

- Graphics editing and VR overlay belong behind a clear Experiments setting while still under test. Provide a discoverable VR entry in More and an optional sidebar pin; do not rely solely on a Search query. Clipping must remain accessible when included in a release, not disappear behind a development-only version gate.
- Search automatically for compatible graphics/config files using installed-game identity and known locations. Make game/config selection easy, show real game artwork and file choices, and distinguish Not found from Not supported. A file may not exist until first play; do not assume this explains every missing result. Provide a played-games default where applicable and an explicit Show all option.
- Show actual setting names and decoded values such as texture quality, shadows and post-processing, with current and proposed values. Do not present unexplained Level 2/3/4 as meaningful graphics labels or claim arbitrary numeric mappings are verified.
- Keep NVIDIA/AMD integration honest: inspect supported interfaces and current documentation, separate driver settings from in-game files, bound/cancel slow discovery and expose failure/recovery states. Opening a vendor app is not proof Orbit can edit its settings or use its recommendation engine.
- Before config writes, show the exact planned changes, preserve unknown settings and unrelated values, back up originals and provide a working restore path. Do not make speculative writes to unknown formats or promise FPS gains without measurements. Editing a game config is not authorization to alter account, anti-cheat or security files.

## Startup scenes, shell integration and media

- Windows sign-in should still play the selected startup animation and sound. Speed up useful app startup by deferring nonessential work; do not remove the intro to achieve faster timing. Preserve seamless intro-to-interface handoff without blank or purple flashes.
- Keep Restart Orbit discoverable in the Orbit-themed tray menu. Related tray actions and recent-game shortcuts should be compact and recognizable; preserve actual game icons and consistent shell artwork. Recognize pinned Windows shortcuts/cache behavior rather than repeatedly forcing live icon replacement.
- Treat secret intros as deliberate unlocks, remember discovered choices and retain previous versions when the user asks for a new variant. Historical requested themes include Magnetar’s magnetic rings, Pulsar, Great Attractor, Void, Afterglow and Encore; their actual availability belongs in the implementation records.
- Preserve requested unlock phrases when maintaining their implementations: Void uses “super duper dark”; the silly Orbit-inspired secret uses “kokeroisgoatkero”. Keep discovery playful and avoid putting a spoiler list into ordinary public onboarding or release notes without a request.
- Void should have a strong, readable buildup and impact comparable to Singularity/Supernova/Big Bang, not simply a darker static logo. Preserve the original Afterglow when improving its anime-inspired variant. Afterglow/Encore should visibly and audibly reflect the Angel Beats/Charlotte opening references through original work, not low-resolution generic Orbit imagery.
- For illustrated musicians, check hand laterality, thumb placement, wrist direction and contact with keys against the user’s reference. Do not claim anatomical corrections without inspecting the actual rendered frames.
- Notifications should use meaningful game artwork where available, concise game/status text and a useful View game action. Respect Windows rendering constraints rather than promising to replace all native notification chrome.
- Requested app demos should show the app actually being used, with purposeful zooms, motion and sound, not only a sequence of screenshots. Label mockups honestly. Use real generic games such as DOOM in example libraries and README screenshots instead of invented titles; keep personal data out of promotional captures.

## Integration and migration boundaries

- Epic local discovery and full account synchronization are separate capabilities. Do not imply local manifests or developer-catalog ownership APIs provide general whole-account access. Research supported authentication/data access before promising an integration, and keep account links native-feeling and simple.
- Steam Downloads, Storage and Connection should retain content and progress when opened from Downloads. Do not let opening the Steam popup empty or reset the underlying page. Keep library-folder controls readable and related move/limit actions easy to reach.
- Update checks must honestly distinguish installed and portable builds, offline/retry states and unpublished feeds. Avoid a disabled Check for updates with no useful recovery route. Review actual updater configuration and legacy client feed URLs; do not assume a friend’s slow internet explains a disabled update control.
- Updates belong in Settings → Manage; About should stay concise. Keep version/build labels meaningful and avoid redundant installer/retry buttons when their actions are unavailable or identical.
- Keep the separate native Rust build named Orbit Rust, independently installed with separate data and no replacement of regular Orbit unless requested. The user wants full feature parity and both original and Playnite-inspired layouts, not a renamed prototype claimed as a complete rewrite. Track each migrated feature and missing capability honestly.
- The earlier Tauri-with-existing-UI direction was followed by a request for a fully native Rust alternative. Do not silently choose an obsolete architecture or announce full migration based on scaffolding. Regular Orbit polish is the latest active priority; resume Rust work only when requested.

## Code, repository and conversation hygiene

- Audit unused code/files by checking callers, imports, build/packaging paths and documentation links before deleting. Remove proven dead code, stale duplicate drafts and generated clutter from the public source where appropriate; retain licenses, required native assets, source, tests and useful history. Do not treat a line as useless merely because it is unfamiliar.
- Keep public guides practical and illustrated where helpful. Consolidate old draft notes and archival updater metadata rather than scattering redundant files through the repository or release assets. Backups and explicit authorization still apply to irreversible hosted attachment removal.
- History documents should distinguish published releases, skipped versions and development builds, and use actual dated reference screenshots where available. Do not invent early history from later layouts. Keep uncertain history labeled.
- Do not disclose API keys, tokens, remembered connections, live profiles or personal capture data in source, archives, screenshots or logs. Report secret-scan findings without revealing matched values; a clean pattern scan is not a guarantee.
- Keep validation explanations simple and pair changed UI with before/after images. If screenshots cannot show a behavioral difference, report the real check and use a clearly labeled diagram or annotation; do not mistake selected-card styling for focus evidence.
- For long work, maintain a concise file-backed handoff with source location, active objective, validated package/commit, local installation versus remote draft state, blockers and next action. Keep this document as durable instructions, not a transcript or growing release log.
- Use the focused Orbit skills when applicable: orbit-ui-polish, orbit-quiet-validation, orbit-preserve-settings, orbit-release-prep and orbit-handoff. They complement these instructions and do not override newer user requests.
- When asked about token cost, distinguish cached input, uncached input, output and actual billing. Reasoning may already be included in output. Do not equate an API-equivalent estimate with the user’s Codex bill or promise that forking removes chat history. Avoid unnecessary full-log/full-file reads and repeated broad checks when targeted evidence is sufficient.
