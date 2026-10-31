# Orbit 0.2.6 published

October 27, 2026 (America/Chicago), following the user's explicit instruction, “Release it.”

Public release: https://github.com/tkokero/Orbit/releases/tag/v0.2.6

The release retains its configured pre-release classification. GitHub created `v0.2.6` at commit `9c02acf81502fbf0b0037d8ff33dd7a08acfe947`, which matches the verified 352-file source snapshot and the installed Windows build. All six uploaded distribution assets retain their checked sizes and SHA-256 digests.

The public installer was downloaded without authentication and compared byte-for-byte with the validated local installer. Public latest.yml, blockmap and checksums match the staged files. GitHub's automatically generated tag-source ZIP passes CRC checks, and all 352 source file Git hashes match the release snapshot.

The compatibility feed at `v0.2.0-pre.1/latest.yml` now advertises 0.2.6 and resolves the absolute `v0.2.6/Orbit-Setup.exe` destination. Its bytes match the versioned release manifest. The previous manifest remains available as `latest-0.2.5.yml`, and the historical release body, tag and original application archives were not changed.

GitHub rejected an initial attempt to save both manifest renames in one form because the live name was still taken. This was not counted as success. Read-only API verification confirmed that the public names had not changed. Saving the old name separately, then the new live name, completed the switch without deleting an attachment. The first updater check correctly failed while the old feed remained active; the final check passed after the switch.

The real electron-updater resolver, with an isolated fake application adapter at version 0.2.5, detected 0.2.6 and verified the installer URL, size, SHA-512 and release notes. Downloads and installation were disabled in this check; no native window was created. No game, account or saved preference was changed. The already-installed local app archive remains identical to the release binary, so no redundant reinstall was performed.

The published files retain the previously validated app behavior and scoped user playtest acceptance recorded in `RELEASE-ACCEPTANCE-0.2.6.md`. This publication does not imply unperformed native tests passed or that all undiscovered bugs are absent.

Receipts: `work/release026-publication.json`, `work/release026-public-files-verification.json`, `work/release026-public-installer-verification.json`, `work/release026-published-updater-verification.json`, and `work/release026-live-feed-verification.json`.
