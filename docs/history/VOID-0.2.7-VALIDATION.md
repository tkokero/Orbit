# Void startup — 0.2.7-dev.1

Void now has the scale and complete progression of Singularity, Supernova, and Big Bang while retaining a dark identity. Stars curve into lensed rings, the center collapses into darkness, a broad dark wave expands across the screen, and the Orbit mark and wordmark appear. The sequence lasts 6.6 seconds. Matching sound adds a low pad, falling glass notes, an inward sweep, and a restrained arrival chord.

The existing `super duper dark` unlock is unchanged. Previewing does not select the scene or overwrite the current theme. Existing volume, disabled sound, reduced motion, and Skip preferences remain authoritative. Controller Home, Library, and other startup scenes are unchanged.

## Implementation and bounded cost

- One canvas capped at 680,000 pixels, 180 deterministic stars, and three cached glow sprites. No particle DOM, external media, or live blur.
- Rendering is finite. Finish, Skip, and visibility loss stop scheduled frames and remove listeners. Release frees canvas buffers and cached sprites.
- Reduced motion renders the final mark without an animation loop.
- An isolated 1280 × 800 sample used a 1043 × 651 canvas and averaged about 0.263 ms of drawing work across 63 frames. This is a drawing sample, not a whole-app CPU or RAM improvement claim or a comparison with the old Void.
- Offline audio at the allowed 30% maximum had a 0.0411 peak and a silent tail. This checks generated samples; actual speakers and perceived loudness were not playtested.

## Passed checks

- Unit suite: 524 passed, zero failed, two opt-in native checks skipped.
- Packaged smoke: 358 checks passed; no window shown or focused.
- Void UI/audio harness: nine checks passed, no console errors. Includes actual unlock/preview, preference retention, Skip cleanup, finite rendering, reduced motion at 800 px/125% and 420 px, drawing bounds, and audio samples.
- 234 packaged resources match source, including unpacked resources.
- Normal and dev profile backups were made before replacement. Their own before/after comparisons retained all saved preference values, library choices, managed artwork and startup media, and remembered connection data. The normal preference loader retained every saved value within its limits.
- Quiet installer exited successfully. Installed archive matches the validated candidate. The running Roblox process remained open, and Orbit was reopened with `--background`.

The ordinary unit command previously included a native game-close window fixture. That fixture now requires `ORBIT_NATIVE_WINDOW_PLAYTEST=1`, matching the existing requirement that native window tests be explicitly opt-in. Product game-close behavior is unchanged.

## Limits and diagnostic cleanup

The pre-install running native process and shell tools exposed different saved profile views. Each was backed up separately. No archival themes, settings, or credentials were copied across those views. A subsequent read with the installed Electron executable matched the shell-context baseline, but did not independently validate the running native process's profile view.

The final live backend diagnostic timed out. A local protocol retry also timed out; neither is counted as a passed check. The diagnostic port was cleared by closing only the hidden Orbit process and reopening it in the background. The game remained open. No diagnostic listener remains. Native post-restart profile inspection and a visible full startup playtest remain unperformed.

This dev build is installed locally and unpublished. The public 0.2.6 release and updater feed were not changed.

## Local evidence

- `outputs/void-upgrade-027/report.json` and `void-preview.gif`
- `outputs/void-upgrade-027-packaged/smoke-report.json`
- `work/void-upgrade-027-package-verification.json`
- `work/void-upgrade-027-install.json`
- `work/void-upgrade-027-preservation/final.json`
- `work/void-upgrade-027-installed-native-preferences.json`
- `work/void-upgrade-027-diagnostic-cleanup.json`

Private profile backups contain user data and must not be published.
