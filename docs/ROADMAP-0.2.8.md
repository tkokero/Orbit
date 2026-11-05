# Orbit 0.2.8

Desktop organization, Activity, and reliability are the focus. The final release candidate is **0.2.8**. Publication and remaining experimental checks are recorded in [release validation](VALIDATION-0.2.8.md). See [current fixes and checks](VALIDATION-0.2.8-dev.17.md), [Desktop layouts](DESKTOP-LAYOUTS.md), [graphics settings](GAME-OPTIMIZATION.md), and [the path to 1.0](ROADMAP-TO-1.0.md).

Read the [complete additions review and next-release proposal](REVIEW-0.2.8-AND-NEXT.md) for the 0.2.9 versus 0.3.0 decision.

## Implemented in the development builds

- Use Glide for short popup entrances, steady internal menu navigation and startup crossfades. Keep the selected intro and sound, interrupt transitions with a new action, and respect reduced motion. Remove duplicate routes while retaining useful navigation fallbacks.
- Search local configs across the visible game library, with bounded concurrent discovery and cancellation. Choose Performance / Super presets or customize individual recognized graphics settings, then review changes, save an explicit config/preset choice, apply only after game closure, and restore from verified backups. Supported formats include Overwatch, VRChat, VALORANT, compatible Unreal user configs and flat VideoConfig files, including Apex; unsupported configs stay unchanged. See [the guide](GAME-OPTIMIZATION.md).

- Preview Desktop menu choices beside their controls. Keep narrow-window previews optional; balance collection forms, keep Save reachable, wrap Storage drives, and restore header actions in saved order after resizing.
- Reopen Settings at the same section and scroll position during the window session. Use Settings from More, Ctrl+F inside Settings, Back from Keyboard shortcuts, type-to-find dropdowns, and hover/keyboard context submenus.
- Polish Desktop Settings and Friends with quieter disclosure rows, readable linked-profile controls, and retained expansion/focus during refresh. Keep saved themes and established layouts.
- Choose which Desktop sections appear: featured banner, Recents, news, and Platforms/Activity/Storage sidebar entries. Find the switches in More → Customize menus or Appearance → Layout. Choices are saved; Show all restores only these sections. Controller layouts stay unchanged.
- Reorder sections by dragging or using arrows, choose Recents count/exclusions, mute or follow game news, choose up to three header actions, adjust banner height, and save up to twelve named menu layouts. Gallery, Workspace and Shelf offer different navigation. Minimal and Full library remain available.
- Give linked friends a main Steam or Discord identity, defaulting to Discord, with saved per-friend overrides. Provider presence remains separate, and both profile links remain available. Confirmed linking still requires the user's decision.
- Edit a completed session's start and end times.
- Merge recordings of the same game, preserving recorded intervals and excluding gaps.
- Remove selected recordings after reviewing the change.
- Recover the latest session correction for seven days or until another correction, including after restarting Orbit. Newer affected history and active sessions remain protected.
- Drag one game or a selected group onto a manual collection, with bulk Undo. Smart collections remain rule-based.
- Remember covers, banners, lists, card size, and spacing for each collection and for Games/Tools. Existing saved choices remain the initial defaults.
- Share the recording normalizer between history and recovery, remove verified unused code, and organize historical documentation.
- Use Ctrl, Shift, checkboxes, or keyboard selection. Session menus offer the relevant actions.
- Recalculate Orbit's recorded plays and streaks without replacing older lifetime counts or changing platform statistics.
- Preserve selection during Refresh and return to the selected game after cancelling a correction.
- Protect running sessions and reject stale reviews. Serialize corrections with new observations and recover in memory if a write fails.

- NVIDIA discovery names are remembered locally; selected presets are checked live. Steam Overwatch’s renamed title matches its known app ID. Slow checks can be stopped and retried. NVIDIA Apply and AMD hardware still require an agreed playtest.

## Before a public release

- Packaged regression and normal/dev preference preservation passed for dev.17. Finish live headset input and real-game graphics Apply/Restore checks, then verify the final stable-version upgrade package.
- Review CPU, RAM, background behavior and responsiveness using comparable workloads. No overall performance gain is claimed for the session correction feature.
- Record user-reported detection failures with the game and launch route; do not weaken verified-process matching to hide them.
- Make small fixes to clear UI defects. Preserve established major layouts.
- Ask the release optimization questions and prepare a draft only when the scope is settled. Publication requires approval.

## Boundaries

Session corrections change only Orbit’s local history, not platform hours or achievements. Graphics edits require an explicit reviewed Apply and a closed game; unsupported config formats stay unchanged. Existing history retention remains 180 days and 1,000 source sessions; Activity shows up to 100 combined sessions. Date filters and companion launching are outside this update. Clipping remains the headline for 0.3.0.

## 0.2.8-dev.17

Experiments category and explicit Graphics settings labels. Native VR dashboard click routing repaired. Read-only real-library config audit completed; physical headset confirmation remains pending. See [validation](VALIDATION-0.2.8-dev.17.md).
