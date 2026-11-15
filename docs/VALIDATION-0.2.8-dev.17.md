# Orbit 0.2.8-dev.17

Experiments now has a clear place in More and Settings. Graphics settings carries an Experimental label, including its NVIDIA and AMD views.

The VR dashboard dropped trigger releases because dashboard ID 0 was also used to mean “no panel drag.” Normal releases now activate controls; ending an actual screen drag still stays separate.

## Checks

- Unit checks and isolated, hidden app checks cover the changed routes, graphics controls and VR input dispatch.
- The VR check sends press and release through the real helper's button handler, rather than injecting a renderer click. It does not initialize SteamVR or send input to a real Windows window.
- Normal and dev settings are backed up and compared through the normal preferences loader before and after installation.
- A read-only scan checked 263 library entries, found editable configs for 17 games, and detailed 12 games. The 53 recognized files read for the detailed report remained unchanged.

See the [before/after review](validation/0.2.8-dev.17/ui-review.md), [config findings](validation/0.2.8-dev.17/game-config-findings.md) and [final check record](validation/0.2.8-dev.17/evidence-summary.json) for results and limits.

## Still needs a playtest

Physical headset clicks, wrist feel and compositor performance need a headset check. Config values are read from disk; this does not prove each game applies them. No live game settings were applied. No CPU, RAM or game FPS improvement is claimed. The build remains unpublished.
