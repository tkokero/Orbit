# Controller development reference

Retained technical record from the earlier guide. For current controls, see [Controller Mode](../../CONTROLLER.md).

# Controller Mode

Open **More → Controller view** to enter Orbit's fullscreen dashboard. A space-themed entrance can be skipped with Confirm or Back. Exiting through **Desktop** restores the previous fullscreen state.

## Controls

| Action | Control |
| --- | --- |
| Move selection | Left stick or D-pad |
| Open game page / select | A, Cross, or Nintendo A |
| Back | B, Circle, or Nintendo B |
| Open navigation sidebar | Tap Menu / Options / + |
| Selected game's actions | Hold Menu / Options / + for 550 ms |
| Previous / next information tab | LB / RB, L1 / R1, or L / R |
| Scroll page | Right stick vertically |
| Quick wheel | Hold View / Share by default; configurable |

Selecting a game opens its artwork page; Play remains a separate action. The lower page includes available descriptions, launch modes, installation records, achievements, and recorded sessions. Missing information is labeled unavailable. Personal activity, notes, paths, and custom launch arguments are omitted from Guest pages. Guest mode is a presentation feature, not an authentication boundary.

The sidebar provides Home, Library, Downloads, Favorites, Settings, the quick wheel, Display, Desktop, Shuffle, Download & play, personal shelves, and Guest mode. Home has a wide recent-game feature and news/friends/discovery rails. Library is a separate cover grid with installation/platform/controller filters. Every sidebar destination uses its own controller surface; Desktop returns to the ordinary interface. Its illustrations and selection treatments follow the active Orbit theme. Named-game choices, download rows, shelf editors, Shuffle, and game action menus prioritize artwork over titles. Library and Favorites remember their selected games independently during a session.

**Controller Settings → Controller** (or **Desktop Settings → General → Controller navigation**) configures stick deadzone, initial repeat delay, repeat interval, and swapping Confirm/Back. Defaults are 0.22, 280 ms, and 85 ms. Select, Back, Menu, Quick wheel, and previous/next tab buttons can each be assigned. Conflicting bindings are rejected. Up/down moves within the Settings category list; right enters a category and left returns from its controls. Shoulder buttons switch categories or tabs. Confirming a text field opens Orbit's on-screen keyboard; confirming a dropdown opens a themed choice list. Left/right adjusts a focused range slider. Mouse movement restores the cursor; fresh controller activity resumes controller selection after the sticks/buttons return to neutral.

## Architecture

Orbit remains an Electron application with plain JavaScript, CSS, a sandboxed preload, and named IPC handlers. Existing launch routes, preference storage, session detection, settings, theme variables, keyboard controls, artwork caching, and installation menus are reused. No framework or controller dependency was added.

- `controller-core.js` normalizes the Browser Gamepad API into direction, confirm, back, tab, menu, and scroll actions. `pad-navigation.js` handles immediate direction changes, release hysteresis, diagonal stability, repeat timing, and edge-only confirmation.
- `controller-manager.js` samples once per animation frame while the visible window is focused. It suspends on blur/visibility loss and resumes on focus/connect events. One standard-mapped controller owns navigation; an idle device can hand off after 400 ms of inactivity, and disconnects permit another connected device. Using one input API avoids cross-backend duplicate events.
- `controller-focus.js` supplies geometry-based focus, aligned-direction preference, explicit `data-nav-*` overrides, hidden/disabled filtering, modal ordering, focus restoration, and one cancelable/retargetable scroll animation per container. Focus changes apply immediately; transforms animate afterward.
- `couch-home.js` retains bounded library pages and lazy artwork loading, updates only selection classes and a delayed backdrop during movement, and owns the persistent shell/sidebar, home/library routes, wheel, and couch return. `controller-pages.js` supplies dedicated settings, downloads, shelves, Shuffle, Guest, and Display surfaces. `controller-entry.js` owns three bounded original canvas scenes. `controller-art.js` provides small original SVG illustrations.
- `couch-game-view.js` reuses game details, launch choices, launch profiles, and local history. Optional supporting reads run concurrently after the main page appears and ignore detached views.
- The trusted `couch:fullscreen` handler validates input and restores the native window's prior fullscreen state. Game launch/close/install requests continue through the existing validated APIs.

Choose **Controller Settings → Startup scenes** for **Orbital Relay**, **Nebula Bloom**, or **Starfold**. Their single-canvas animations use the current theme's space-console palette and the existing optional desktop sound cues. They can be previewed, skipped, or reduced through accessibility preferences. Remembered Controller Mode starts with its controller arrival rather than also playing the desktop intro.

Controller input works in desktop dialogs as well as Controller Mode. Nested dialogs retain their own focus scope. Animations use transforms and opacity, rapid scroll targets replace prior targets, and reduced-motion preferences suppress entry/selection effects. The sidebar stays mounted and uses no background blur or exit clone. Desktop rendering is hidden during Controller Mode. Session changes update only running-game cards; unchanged catalog data does not rebuild the grid. Artwork swaps wait until selection settles and news thumbnails use a two-job near-viewport queue. Hardware rendering is the default for new profiles; existing explicit graphics-memory preferences remain available. A restart is required when that preference changes.

## Diagnostics and validation

**Settings → Appearance → Popup size** adjusts popup width and height independently from 20% to 200%, in both input modes. Frames remain centered, fit the available window, and keep the existing text size. Turn **Share sizes across popups** off to remember separate sizes for Settings, game details, launch choices, and other menu types. Use the **Popup** selector to adjust a specific menu. Both modes preserve your saved sizes when switching, independently from themes. On Desktop, popups have a bottom-right resize handle: drag it, use arrow keys while it is focused, or double-click to reset. **Reset popup size** restores the selected menu's default dimensions (or the shared dimensions when sharing is enabled). Sizes are restored from the local profile after restarting.

Run `npm run dev` for the developer build. **Settings → General → Controller navigation → Toggle controller diagnostics** shows active device, backend, input mode, focus, last action, synchronous action-to-focus processing time, and sampled renderer FPS. The overlay updates twice a second and timing/FPS collection is disabled when it is off. Processing time is not physical controller-to-display latency.

Run `npm test` for normalization, timing, device handoff, geometry, and existing regression tests. The isolated Electron `--smoke-test` workflow exercises the real renderer and IPC with synthetic controller states, including the drawer, game page, nested keyboard/dropdown, cursor handoff, and Guest information filtering. See `VALIDATION.md` for executed results.

Smoke checks render offscreen by default. Native show/focus requests are blocked, screenshots explicitly stay hidden, and `background-checks.json` records actual native visibility and focus events. `--interactive-checks` is reserved for an agreed hands-on session; the native handoff and memory lifecycle checks require it. Launching Orbit with `--background` keeps it in the tray without bringing its window over another app.

Settings navigation follows the displayed rows and grid columns. Right enters a category at the remembered control; Back returns to its category. Left/right adjusts sliders and numbers. Launch mode cards, Remember, Cancel, and Play have controller focus and hints matching the selected bindings.

## Limits requiring hands-on testing

Xbox, PlayStation, and Nintendo prompts/mappings are normalized for devices Chromium exposes with **standard mapping**. Actual USB/Bluetooth models, drivers, Steam Input configurations, disconnect/reconnect behavior on hardware, high-refresh displays, and end-to-end input latency need physical testing. No hardware FPS or latency guarantee is made.

Orbit cannot use browser gamepad navigation inside Windows file pickers, authentication windows, publisher launchers, or games themselves. Those controls remain native to their owners. The on-screen keyboard supports English letters, digits, and common path/email symbols; it is not a full multilingual IME. Controller support advertised by store metadata is not a guarantee that every game's launch menus are controller-accessible.

Clipping and synthetic input diagnostics remain developer-only. Ordinary installed builds do not expose the prototype recording controls or synthetic controller feed.

## Orbit console menus and sound

Home and Library retain their existing layouts. Other controller destinations share illustrated rounded controls, immediate focus, interruptible lift/press feedback, and theme colors. Downloads use a featured transfer and queue, plus a nearby library shelf. Game pages include illustrated activity, actual session totals, and controller guidance. Landscape artwork is requested near the viewport through a two-job queue; portrait fallbacks retain their proportions.

**Controller Settings → Sound** contains an independent mute switch, a 0–50% volume control (20% by default), and previews of Move, Select, Back, Switch, Open, and Save. The original procedural cues use soft mallets, glass-like overtones, and rounded low notes. They play only in focused Controller Mode, throttle rapid navigation, suppress movement chatter around actions, and suspend the shared audio context when idle or unfocused. Desktop startup audio remains separate.

Game banners and menu artwork now follow the source image dimensions. Desktop shares the same visual assets with smaller controls, anchored dropdowns, and pointer/keyboard behavior. Info controls remain compact in both modes.

When launching from Controller Mode, Orbit shows the selected game while waiting for a detected game window. It switches after Windows accepts focus, and restores Orbit after the detected session ends. If Windows blocks the switch, use **Switch to game**. **Keep browsing** leaves the launch running and retains return tracking. Games that cannot be detected need their executable configured in game detection settings. Steam news opens in the same app with controller scrolling and Back navigation.
