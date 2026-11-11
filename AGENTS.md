# Orbit project preferences

These preferences reflect recurring user feedback. Apply the latest explicit user direction when it changes an earlier choice. Keep implementation status and detailed version plans in the roadmap and validation documents.

## Priorities and user data

- Prioritize Desktop mode. Controller work can wait unless explicitly requested. Preserve the existing Controller Home and Library layouts unless the user requests changes to them.
- Preserve existing settings and custom themes across updates, dev-build replacements, migrations, and repairs. Do not replace saved choices with defaults on startup or after an update.
- Preservation includes artwork and crop choices, library layouts and density, collections and pins, popup preferences, privacy settings, profile-link decisions, startup/tray choices, and authorized remembered connections. Check existing normal and dev profiles when changing persistence.
- Validate repaired preferences through the normal loader and its storage limits. Do not blindly merge archival themes into a live profile; honor the latest saved choices and retain older copies separately when they do not fit.
- Keep features that already work intact while polishing them. Distinguish implemented features, proposed additions, and checks that still need a playtest.
- Clipping is the intended headline feature for 0.3.0; keep detailed release scope in the roadmap instead of adding unrelated major features to a polish pass.

## Quiet validation and installation

- Intrusive development checkups were reported in this user's testing workflow, not established as a problem for ordinary users. Keep development findings separate from product-wide claims.
- Target renderer unloading two seconds after closing to the tray, while retaining safety gates for active work and keeping native background services alive.

- Run checkups and UI validation hidden, without showing or focusing native windows. Do not interrupt a running game or focus Orbit for a routine check or validation install.
- Normal user updates should reopen Orbit visibly in Desktop mode, and Windows sign-in should open Desktop mode when Launch at login is enabled. Migrate the old start-minimized default once for 0.2.6 without enabling disabled Windows startup entries. Automatic updates during a game should reopen without taking focus from the game.
- Run native focus, game-launch, and account-authorization checks only during a user-agreed playtest. Keep native-window test fixtures explicitly opt-in; a routine unit-test command must not silently start them.
- Use isolated profiles and fixture data for automated UI checks. Do not manipulate real downloads, game installations, accounts, or saved credentials to make a test pass.
- A user's daily-use and installer feedback counts as playtest evidence. Avoid repeating disruptive checks without a concrete reason. Record skipped, failed, and unperformed checks honestly.
- The user has given standing approval to install each finished, validated Orbit build locally. Install it automatically after required checks pass; do not ask for installation approval again. Show the setup window for these development installs, as requested on November 9, 2026; do not use silent installation. Back up and preserve both normal and dev profiles, and verify the installed files and saved settings. Keep routine validation hidden and do not close or interrupt games.
- Installation approval does not authorize publication. Keep the current 0.2.6 release unpublished and in draft until the user explicitly approves publishing it.

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
- Similar Steam/Discord names can suggest a match; linking requires confirmation. Keep provider identities and their individual presence distinct, and preserve confirmed links across restarts.
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
- For each release candidate, keep a concise record of findings, fixes, comparable measurements, regression checks, remaining limitations, and user playtest evidence. A question board is not proof of optimization, and automated checks are not a substitute for an unperformed hardware test.

## Documentation and release notes

- Keep validation notes short and easy to understand. Lead with what changed, what passed, and what still needs testing. Explain important changes with concrete examples, such as "Before: reopening showed Tools. After: it keeps your saved Games view." Label illustrative examples separately from checks actually performed.
- Pair each validation example with both a short explanation and a relevant image. Prefer actual app screenshots for UI changes; use a clear diagram for behavior that a screenshot cannot show. Label sample data, mockups, and illustrative images accurately. For changed UI, include paired before/after screenshots with a short explanation of the difference, and do not present an illustration as proof that a check passed. Keep detailed evidence linked separately.
- Summarize test results and settings preservation in plain language. Keep skipped checks, unresolved issues, and measurement limits visible; link detailed logs and technical records instead of filling the summary with implementation terms, hashes, and exhaustive check lists. Never claim performance gains without comparable measurements.
- Keep public Markdown guides short and practical, with detailed technical/history records linked separately. Keep the README generalized: explain Orbit, its overall features, and major capabilities in clear language for users.
- Write release notes around overall new features and user-visible improvements. Group bug fixes and optimizations into concise descriptions. Keep implementation details, exhaustive checks, and known validation limitations in development or validation documentation.
- Describe the final shipped scope accurately. Do not announce a proposed feature or an unvalidated integration as completed.
