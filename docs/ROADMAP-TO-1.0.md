# Orbit: 0.2.8 to 1.0

Proposed roadmap, reviewed November 4, 2026. These are planning milestones, not announced features or release dates. Desktop stays the priority. Clipping is the headline for 0.3.0. Existing layouts and user data stay intact as the app grows.

## 0.2.8 — Everyday Desktop use

- Finish session edits, merging, removal, and recovery after restarting.
- Drag selected games into manual collections, with Undo.
- Remember covers, banners, lists, card size, and spacing for each collection.
- Clean up unused code and documentation, then validate the installed build.
- **Development followups:** fix reported regressions, especially drag behavior, saved views, and history recovery.
- **Optional later Desktop additions:** session CSV export and reviewed batch artwork replacement, scheduled after the core release is stable.

Release goal: organization and history changes are predictable, reversible, and preserve existing settings.

## 0.2.9 — Optional reliability follow-up

Recommended sequence: finish 0.2.8, then begin 0.3.0 clipping. Reserve 0.2.9 for necessary fixes reported after 0.2.8 ships; do not invent extra features to fill the number. This recommendation is not a publication decision.

- Fix confirmed layout, popup, saved-view and selection regressions.
- Resolve reported detection and launch failures, with clearer missing-drive, missing-executable and ownership-uncertainty messages.
- Address verified graphics/profile-choice problems and VR input findings from hardware testing.
- Fix measured idle/tray or helper-cleanup problems while preserving working features.
- Keep a larger library-repair workspace and moved-library remapping on the backlog until real examples establish their scope. They need not delay clipping.

Release goal, if needed: a small maintenance update while 0.3.0 is in development. See the [full 0.2.8 review and next-release proposal](REVIEW-0.2.8-AND-NEXT.md).

## 0.3.0 — Clipping

Build on the development-only replay-buffer prototype rather than presenting it as a completed public feature. The [proposed work sequence](REVIEW-0.2.8-AND-NEXT.md#suggested-development-order) starts with capture/save reliability, then live previews, controls, a clip workspace, simple trim/export, and measured acceptance checks.

- Save the last moments of a game with a configurable replay buffer and keyboard shortcut.
- Support explicit source selection, recording indicators, capture controls, and an emergency stop.
- Give source pickers live local previews; never record just to provide a preview.
- Include a local clips library, playback, simple trim, and export.
- Provide audio/source choices, recording quality, storage limits, and retention controls.
- Keep capture off until requested. Clips stay local unless the user explicitly exports or shares them.
- **0.3.1:** prioritize game performance, encoder failures, resource release, and interrupted recordings.
- **0.3.2:** improve audio handling, source changes, and saved capture profiles based on real use.

Release goal: clipping works during supported games with measured overhead, clear capture status, and safe storage behavior.

## 0.4.0 — A better clip workspace

- Expand the basic editor with thumbnail scrubbing, frame stepping, multiple saved cuts, and reversible edits.
- Add clip titles, tags, game filters, and useful searches across recordings.
- Offer landscape and portrait export framing with accurate previews and saved output presets.
- Keep original recordings intact while edited exports render in a cancellable background queue.
- **0.4.1:** improve long recordings, unusual frame rates, and export recovery.
- **0.4.2:** add bulk clip organization and clearer storage management.

Release goal: users can turn a captured moment into a finished video inside Orbit without losing the original.

## 0.5.0 — Move Orbit between PCs

Existing settings backups become the foundation; exporting settings is not a new feature.

- Build a guided transfer that brings themes, artwork, collection views, shortcuts, and optional local history to another PC.
- Review merge conflicts instead of replacing the destination profile with defaults.
- Remap library locations and resolve verified game identities on the destination machine.
- Exclude protected credentials and private paths from shareable presets; reconnect accounts through their supported sign-in flows.
- **0.5.1:** improve partial imports, missing files, and rollback after an interrupted transfer.
- **0.5.2:** add clearly scoped, scheduled Orbit-profile backups with storage limits and restore previews.

Release goal: moving or restoring Orbit feels safe and preserves the user's choices. Cloud sync is a separate decision.

## 0.6.0 — Orbit in VR beta

Improve the existing experiment rather than announce its current features as new.

- Make the inward-facing wrist display, gaze visibility, media controls, and panel management responsive and predictable.
- Improve readable panel resolution, manipulation, and saved layouts with explicit quality controls.
- Validate telemetry accuracy, frame pacing, capture consent, and the cost of multiple panels.
- Test supported SteamVR headset/controller combinations and Virtual Desktop with SteamVR.
- Keep VR optional and start its helpers only when requested.
- **0.6.1:** focus on runtime disconnect/reconnect, tracking loss, and helper cleanup.
- **0.6.2:** tune panel and wrist presets using hardware playtest feedback.

Release goal: the existing VR features meet a clear hardware-tested support standard. Desktop use must not depend on VR services.

## 0.7.0 — Better connections and imports

- Improve supported library imports, account reconnect, provider status, and recovery after access is revoked.
- Keep accepted Steam/Discord friend identities distinct and confirmed profile links preserved.
- Explain provider-specific limits clearly. Add new capabilities only when supported access and permissions are verified.
- Make offline and stale information useful without presenting it as current or claiming ownership from old history.
- **0.7.1:** fix provider changes and authentication regressions.
- **0.7.2:** improve import conflict review and connection diagnostics.

Release goal: integrations are useful and honest. Whole-library Epic account access and broader Discord permissions are not promised by this roadmap.

## 0.8.0 — Public beta

- Freeze major additions and test Orbit with a wider range of real libraries and Windows setups.
- Audit keyboard access, screen-reader labels, contrast, scaling, narrow windows, and reduced motion.
- Measure startup, idle/tray usage, repeated popup lifecycles, capture, and optional VR against consistent workloads.
- Improve first-run guidance and the download/install path using actual user feedback.
- **0.8.1 / 0.8.2:** address the highest-impact beta issues; keep new features out unless needed to resolve them.

Release goal: new users can understand, install, and use Orbit without developer help.

## 0.9.0 — Release candidates

- Test clean installs, upgrades from supported older profiles, full restarts, sleep/wake, and recovery from interrupted operations.
- Verify app signatures and distribution trust as feasible; document any remaining unsigned-build limitation honestly.
- Confirm settings, custom themes, artwork, history, and protected remembered connections survive upgrades.
- Finish practical documentation, known limitations, support instructions, and matching release artifacts.
- **0.9.1 onward:** release-candidate fixes only. Repeat relevant checks when a change or failure justifies them.

Release goal: no unresolved critical data-loss, installation, privacy, or supported-launch blockers.

## 1.0 — Stable Orbit

- Ship the validated Windows app with a clear supported-feature list and understandable limitations.
- Deliver dependable organization, launches, history, customization, updates, and local clipping.
- Keep VR explicitly optional; retain an experimental label for any VR surface that has not met its hardware acceptance criteria.
- Publish concise notes and a maintenance policy. Plan 1.0.x around fixes and compatibility.

Stable means reliable within the documented support boundaries; it is not a claim that every possible game or system has been tested.

## Decisions held for later

Public profiles, messaging, multiplayer voice, a plugin marketplace, universal cloud-save sync, cross-platform builds, and whole-account provider access are separate projects. They should not delay a dependable Desktop app or silently expand its permissions.

## Release rules

- Use standard three-part versions. Development previews use names such as 0.2.8-dev.2; subsequent 0.2.x maintenance releases use 0.2.9, 0.2.10, and so forth. Milestone numbering can move when a necessary fix takes priority.
- Complete the optimization question board and a proportionate resource/UI audit before each public release.
- Include actual before/after UI examples, preservation results, comparable measurements where taken, and unperformed hardware checks.
- Install validated development builds quietly for the project owner. Publication requires explicit approval.
- Finish and validate a milestone before increasing scope. Patch releases handle reported defects; the version list does not require inventing features to fill every number.
