# 0.2.6 final user acceptance

October 27, 2026 (America/Chicago).

The user confirmed that View game works from the installation notification after Orbit unloads its renderer to the tray. This is accepted playtest evidence, not a newly repeated automated/native check. No further notification or game launch was triggered.

The user clarified that the reported appearance/settings concern was the pinned Windows taskbar icon retaining older artwork. Do not describe this as a confirmed product settings-loss defect or retain it as a user-facing release blocker. Earlier development records of differing launch-context snapshots remain historical evidence; this clarification does not establish a filesystem root cause or a new persistence repair. Current saved-value validation and preservation checks passed.

Release preparation is complete for the selected scope: the six draft assets match the validated installed 0.2.6 binary; the source snapshot matches repository commit `9c02acf81502fbf0b0037d8ff33dd7a08acfe947`; the draft's v0.2.6 target is pinned to that commit; updater notes and checksums are aligned. GitHub creates the tag upon publication. See `RELEASE-ALIGNMENT-0.2.6.md` and `work/release-align-026-verification.json`.

The latest quiet audit passed 523 unit tests and 358 packaged checks, with its documented native fixture exclusion/skip. The development-only native-test opt-in-gate finding remains recorded; it was not changed in the packaging task. Prior installer, startup, restart, controller navigation and game-handoff user feedback remains accepted evidence.

No remaining user-facing release blocker is identified by these checks. This is scoped release acceptance, not a guarantee of no undiscovered bugs. Full-process-exit notification activation is not newly supported or promised; the optional native hero-image variant remains unconfirmed visually.

The release remains a draft. This confirmation is not authorization to publish or change the live update feed.

Receipt: `work/release-026-final-playtest-acceptance.json`.
