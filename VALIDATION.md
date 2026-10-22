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
