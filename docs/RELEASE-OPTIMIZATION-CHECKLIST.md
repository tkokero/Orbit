# Release optimization review

Use this before preparing a public release. This is a development checklist, not a claim that a build has passed or that its optimizations are complete.

## Question board

Present these questions together in the development conversation. Reuse answers already given for this release.

1. **Priorities:** Which areas need extra attention: RAM, CPU, GPU/VRAM, UI, startup, background behavior, storage/network, or VR? Default to a balanced audit.
2. **Problem spots:** Where do you notice lag, high usage, flickering, clutter, overlap, or slow loading? A page and the action that triggers it are enough.
3. **Tradeoffs:** Is there a preferred balance between resource use and image quality, animation, preview rate, or background freshness? Preserve current choices unless the user requests a change.

The baseline audit still covers all relevant areas. Continue safe independent checks while optional feedback is pending. Do not turn these questions into repeated installation approvals or an automatic in-app prompt. Publishing remains a separate explicit decision.

## Audit

| Area | What to check |
| --- | --- |
| UI layout | Intended centering, consistent alignment, no clipping/overlap, stable icons/labels/arrows, enough hover/focus spacing, reachable primary actions. |
| UI states | Loading, empty, error, long text, expansion, scrolling, keyboard navigation, focus restoration, theme contrast, and reduced motion. |
| Displays | Narrow/wide windows, different scaling, multiple monitors, restored popup sizes/positions, and source image proportions. |
| RAM | Process-tree memory, bounded caches/queues, duplicate images, repeated open/close cycles, retained listeners/timers, stream/native-resource cleanup. |
| CPU | Idle polling, scans, event duplication, serialization, unchanged-data rendering, search latency, and background-task concurrency. |
| GPU/VRAM | Texture reuse, upload/readback cost, image sizes, blur/overdraw, frame pacing, flicker, and multiple-panel impact. |
| Startup | Normal launch, Windows sign-in, update restart, cached library visibility, deferred work, selected intro/sound, and warm reopen. |
| Background | Unfocused/tray usage, two-second renderer-unload target with safety gates, stopped previews, and helpers off when unused. |
| Disk/network | Repeated requests/downloads, writes, cache limits, retry/backoff, cancellation, temporary files, and log growth. |
| Reliability | Settings/theme/media preservation, connection recovery, missing drives/sources, disconnects, and clear errors. |
| VR, when included | App/game frame timing, headset readability, wrist pose/aiming, input handback, panel count, capture overhead, and runtime restart behavior. |

Fix actionable findings within scope. Put larger changes on the roadmap with a reason; do not hide unresolved regressions behind a general “optimized” claim.

## Measurement and validation

- Use the same workload, hardware, fixture, process scope, and sampling method before/after. Separate cold startup from warm caches.
- Sample relevant idle and active periods; include Electron children and owned helpers. Name the memory metric rather than combining unrelated figures.
- Check that usage settles after repeated operations. Forced working-set trimming does not prove a leak or a lasting memory improvement.
- Report actual comparable results. If a baseline or hardware test is missing, say so and make no percentage claim.
- Preserve settings, themes, accessibility, visual quality, required background services, and useful status. Resolve real tradeoffs through existing preferences or a focused question.
- Keep automated checks hidden and isolated. Real headset, native focus, game-launch, and authorization checks follow the existing agreed-playtest rules.
- Documentation-only policy edits do not require a new application build or installation. Install a new app build only after its required checks pass.

## Candidate record

For the candidate under review, record:

- Version/build identifier and the user's priorities.
- Findings and affected pages/workloads.
- Fixes, with before/after evidence where measurable.
- Regression results and settings-preservation checks.
- Remaining limitations and unperformed checks.
- User playtest evidence and the separate publication decision.
