# Validation

Orbit is in pre-release. Automated checks, isolated UI fixtures, and user playtests provide different evidence; passing one does not establish every real-world configuration works.

## Run checks

- npm test runs the normal unit suite. Native-window fixtures are opt-in.
- Electron --smoke-test uses an isolated profile. Set ORBIT_SMOKE_DIR to a scratch output folder.
- Routine smoke checks render offscreen and block native show/focus requests. Inspect smoke-report.json and background-checks.json.
- Use --interactive-checks and native fixtures only during an agreed playtest. Never use real accounts, downloads, or installations as disposable test data.

## Playtests and releases

Physical controller behavior, Windows sign-in timing, game handoff/exit, and clean installation/update behavior need checks on the relevant machine. Record skipped, failed, and unperformed cases. User daily-use feedback is valid evidence.

Before a release, verify the exact package and installer, preserve profiles, check narrow/wide layouts and theme contrast, and keep release notes accurate. Building does not authorize publication.

[Historical results and limitations](docs/reference/VALIDATION-HISTORY.md) are retained separately. Some evidence paths refer to the original local workspace rather than distributed files.
