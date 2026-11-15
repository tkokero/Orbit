# Orbit 0.2.6 proposal

Desktop library controls and everyday reliability are the priorities. These are proposed items, not a list of released features.

## Release history

- [0.2](https://github.com/tkokero/Orbit/releases/tag/v0.2.0-pre.1): refreshed workspaces, themes, library copies, tracking, shortcuts, and setup.
- [0.2.1](https://github.com/tkokero/Orbit/releases/tag/v0.2.1): release calendar, detection, session continuity, tray behavior, and memory improvements.
- [0.2.2](https://github.com/tkokero/Orbit/releases/tag/v0.2.2): simpler controls, context menus, personalization, Discord activity, and setup improvements.
- [0.2.3](https://github.com/tkokero/Orbit/releases/tag/v0.2.3): updates during play, onboarding, clearer controls, and startup animations.
- [0.2.5](https://github.com/tkokero/Orbit/releases/tag/v0.2.5): Controller Mode, connected Desktop design, popup resizing, in-app news, privacy controls, and settings preservation.

The next release should make existing features faster to use and more dependable. Popup resizing, context menus, remembering views, preference backups, and tray behavior already exist; improvements to them should be described as refinements.

## Planned Desktop features

1. Cover and landscape-banner library layouts, with undistorted portrait fallbacks.
2. Card-size and spacing controls that persist across restarts.
3. Collections pinned in the sidebar, with direct access to managing them.
4. Ctrl/Shift selection, Select all, and a clear selection count.
5. Bulk favorites, tags, collection membership, and hiding.
6. Draggable popups with saved positions per display. Keep existing shared/separate size preferences and bring offscreen popups back into view when monitors change.

## Quality-of-life priorities

1. **Reliable Windows startup.** Verify registration, show when Windows has disabled it, retain the preference across updates, and clearly distinguish opening a window from starting in the tray.
2. **Keep your place.** Preserve scroll position, selection, filters, sort order, and view density when opening a game, returning from it, or receiving library updates.
3. **Undo library edits.** Offer undo after hiding games or making bulk favorites, tags, and collection changes. Include an obvious way to find hidden games again.
4. **Useful filters.** Show active filters and result counts, offer Clear filters, and explain an empty result without clearing the user's choices.
5. **Consistent popup behavior.** Keep headers and primary actions reachable as content expands, preserve size, and restore focus to the control that opened the popup.
6. **Quiet background work.** Keep scans and updates from stealing focus, show their status in Orbit, and group repeated notifications.
7. **Clear settings saves.** Indicate saved changes and restart-required options. Offer a focused reset for a section and retain the rest of the user's settings and themes.
8. **Dependable artwork.** Keep card dimensions stable while images load or fail, offer a readable fallback, and avoid repeated layout changes during refreshes.

## Boundaries

- Prioritize Desktop; preserve Controller Home and Library layouts.
- Keep unified search, named launch presets, customizable keyboard shortcuts, and the broader context-menu/recovery work in the 0.2.7 proposal.
- Keep clipping as the main 0.3.0 feature.
- Do not turn this planning document into release notes until the shipped scope is known.

## Future clipping UI

Use live visual source and framing previews, following the VR panel picker. Keep previewing separate from recording; do not save preview images or start a clip merely to show framing. This is a future requirement, not an implemented clipping change.
