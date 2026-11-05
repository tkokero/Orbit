# Orbit 0.2.8 release validation

Final version, package, installer, updater and source checks are recorded before publication. The same application features were checked in [dev.17](VALIDATION-0.2.8-dev.17.md); this candidate adds the final version/notes and expanded user guides.

The guides now give short task steps, examples and relevant sample screenshots for Library, collections, layouts, Activity, Friends, Downloads, appearance, Controller mode, FPS estimates and experimental features. [Start with the guide index](README.md).

## Experimental limits

- Graphics Apply/Restore has isolated-file coverage. Real in-game results and live NVIDIA Apply still need a playtest. AMD opens its own settings app; direct per-game editing inside Orbit is not implemented.
- VR clicks pass the native helper fixture, including actual press/release routing. Physical headset input, wrist feel and compositor performance are not confirmed by that fixture.
- No whole-app CPU/RAM or game-FPS improvement is claimed. The interactive memory-lifecycle fixture was not run during quiet validation because it deliberately shows native windows.
- Clipping remains capability-gated development work. It is not enabled in the normal 0.2.8 release.

## Credential review

Credential scanning covers the current source, the available public Git history, earlier source ZIPs and the inspected packaged code. It checks common token/private-key patterns and excludes real profiles, encrypted credentials, private keys and debug symbols from release source. It prints no credential values. A final artifact check follows packaging; pattern scanning cannot prove every possible secret format is absent.

## Release checks

The final local check record covers unit and packaged app results, package/source identity, installer hashes, real updater download verification, normal/dev preference preservation and the release-source manifest. Native focus, authorization and game-launch checks were not repeated. Earlier user playtest evidence remains separate.

Source ZIP and repository contents are prepared from the same public snapshot. Machine identifiers and private profile details are omitted from distributed validation summaries; local originals are retained. Public release artifacts and the compatibility updater feed must match the final version before publication is marked complete.

[Before/after UI examples](validation/0.2.8-dev.17/ui-review.md) · [Release notes](releases/0.2.8.md) · [Release optimization checklist](RELEASE-OPTIMIZATION-CHECKLIST.md)
