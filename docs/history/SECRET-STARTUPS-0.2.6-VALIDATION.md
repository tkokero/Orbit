# Secret startups — local 0.2.6 follow-up

Requested October 26, 2026. This follow-up adds four original finite scenes without changing Controller Home or Library.

| Mode | Scene | Unlock |
| --- | --- | --- |
| Desktop | Void | Type `super duper dark` in library search or outside editable fields. |
| Controller | Magnetar | Select Orbital Relay seven times in Startup scenes, or type `orbitmagnetar`. |
| Controller | Pulsar | Select Nebula Bloom seven times, or type `orbitpulsar`. |
| Controller | Great Attractor | Select Starfold seven times, or type `orbitattractor`. |

Unlocking adds a choice and typed unlocks preview it. Select the new choice explicitly to use it at startup. Existing selected scenes, themes, Super Dark, sound settings, and regular scenes are retained. Repeated selection of a regular Controller scene keeps that regular selection; it never auto-selects the new secret.

Void draws starlight inward into a dark ring before revealing Orbit. Magnetar forms magnetic loops; Pulsar sweeps two opposing beams without flashing; Great Attractor bends curved streams into a gravity well. Each lasts 4.2–4.8 seconds, can be skipped, and has a distinct optional quiet sound. Reduced motion uses a still frame without scene sound. The shared 0–30% sound preference remains authoritative.

Controller unlocks use `orbit-controller-secrets-v1`; Desktop retains `orbit-secret-startups`. Both keys and separate selected scenes are included in interface backups. Input matching excludes passwords, arbitrary editable fields, modifiers, composition, repeated keys, and boot input. Void does not activate in Controller mode; Controller phrases do not activate in Desktop mode.

Automated checks run in isolated hidden windows with audio muted. Canvas surfaces are capped at 1000 × 1000, use 96 deterministic stars, and stop their frame loops at completion, skip, or visibility loss. Reduced motion schedules no frames. Offline audio checks verify distinct output, bounded levels, and silent tails. UI captures and detailed measurements are in `outputs/astral-startups-ui` in the local workspace.

The visible controller hardware/normal-startup playtest was not repeated for these additions. Earlier user feedback remains evidence for the unchanged launch/handoff and restart paths.

The existing GitHub draft attachments still contain the previously verified icon-choice build. This local follow-up needs a fresh distribution/upload set before eventual publication. Nothing in this task authorizes publishing the draft.

## Completed local checks

- Unit suite: 507 passed, one explicitly opt-in native fixture skipped, no failures.
- Packaged regression: 358 passed. Window guard recorded zero shown/focused windows and blocked six native activation attempts.
- Focused startup UI/audio: 20 checks passed; shared Desktop/icon UI: 21 checks passed. Screenshots were captured offscreen, including narrow widths and reduced motion.
- All 232 packaged resources match source. Installed archive SHA-256: `cd90913a8b49d0ee13792b45ee1f5d883b498f01fd0388c3cdc48a6a6a419e49`.
- Installer ran silently and the installed native resources match the validated build. Orbit reopened hidden through `--background` without playing an intro or taking focus.
- The latest normal and dev profiles were backed up. Before/after native loader hashes match exactly: normal retains three custom themes and dev retains seven, with all 17 managed media files and the remembered encrypted Discord connection preserved. The user's current Dark theme and Singularity selection remain unchanged.
- Measured Controller canvas drawing means were approximately 0.13–0.23 ms per frame in the isolated fixture. These are drawing costs, not a claim about whole-app CPU, GPU, memory, or startup speed.

Receipts: `work/astral-startups-026-ready.json`, `work/astral-startups-026-install.json`, `work/astral-startups-026/final-preference-verification.json`, and `outputs/astral-startups-ui/report.json` in the local workspace.
