# Orbit 0.2.6 release audit

October 27, 2026 (America/Chicago). Requested: check the candidate and report findings before release approval. No application code, user settings, release attachments, repository branches, tags, or public update feeds were changed. The release remains unpublished.

## Findings before publication

1. **Draft downloads are stale.** All six remote asset sizes and SHA-256 digests match the previous local upload set. Their installer is `ad1aaca953b128a8a2cd631660ff3c9dfc149ae8e8c1fa46a3a3f63137a43557`; the latest validated local installer is `14d40fd8b31cfbcd9b8bd9ccd345c62a90b1338e66d445c4b5f81c349d6b3662`. The portable archive contains app archive `11d0ac4c1ca6479e27087d5663c83e54980b8f22898a7140a0b278acc015933d`, rather than the installed/current `4e6bacec386337530caeac18c67369dc6428b9b924812edeb0ac212e125aaa9b`. Its source snapshot differs in 17 runtime files and lacks four new files, including installation notifications and the new startup implementations. Refresh the installer, blockmap, portable/source archives, feed metadata and checksums together; do not release the current attachments as the final build.

2. **The release source is not aligned yet.** The draft targets `main`, currently commit `ad3c15a0482969f344e02e1bfd2e868b7770c700`, whose package version is 0.2.5. Fetching the exact `refs/tags/v0.2.6` returns 404. This is expected for an unfinished draft but must be resolved before publishing, so automatically generated source archives match the distributed runtime. The draft is still marked prerelease, consistent with existing public Orbit releases.

3. **Updater notes and final metadata need reconciliation.** Both the older staged `latest.yml` and the newly generated local one have valid size/SHA-512 fields for their respective installers. Neither contains the eight simplified draft bullets. The newly generated file uses a relative installer URL; the shared compatibility feed lives at the legacy `v0.2.0-pre.1` address, so final feed preparation must keep the existing practice of an absolute URL to the `v0.2.6` installer. The live public feed currently advertises 0.2.5, correctly unchanged while this release is a draft.

4. **One native test is not explicitly opt-in.** `test/game-close-window.test.cjs` skips only outside Windows. Its fixture compiles Windows Forms executables, calls `Application.Run`, and spawns with `windowsHide:false`. Positioning the fixture offscreen does not enforce a no-activation policy. It should use the same explicit `ORBIT_NATIVE_WINDOW_PLAYTEST` gate as the Roblox native-window fixture. This is a development-check issue, not evidence of a player-facing focus defect. This audit excluded the test by name and did not run it. Prior unit receipts did run this fixture, so their zero-native-window wording must not be generalized to the entire unit suite.

## Checks completed now

- Quiet unit invocation: `node --test --test-skip-pattern='^Windows normal close verifies' test/*.test.cjs`. Result: 523 passes, zero failures, one opt-in Roblox skip. The excluded normal-close fixture is absent from the executed results and is not counted as validated.
- Installed executable, isolated fresh smoke profile, muted audio: 358 packaged checks passed; process exited 0. Window guard: zero shown, zero focused, six activation attempts blocked. Standard error was empty. No real game, download, account, or credential was changed. The smoke path reads local discovery data and exercises simulated actions inside its separate profile; its screenshots are not account-free synthetic marketing examples.
- All 233 runtime/public-guide resources match source, including unpacked native resources. Installed archive exactly matches the latest packaged candidate; version is 0.2.6.
- Both staged ZIPs pass CRC checks. Their staged checksums are correct and match GitHub's recorded digests. A path-name scan found no profile/credential/work-directory entries in the archives; this is a targeted path check, not a general secret-content certification.
- Production dependency audit (`npm audit --omit=dev`): zero reported advisories. This does not audit separately shipped Electron/native binaries or prove absence of all vulnerabilities.
- Current normal and dev UI preference documents parse and retain every saved value through the native value validator. Normal has Roseberry and three custom themes; dev has Dark and seven custom themes. No writes or theme merging were performed on either profile.
- Visually reviewed fresh offscreen captures for narrow Settings, narrow Downloads, wide Library, expanded Game options, Friends, and Controller Quick wheel. No new overlap or clipping was observed in these views. Broader packaged assertions cover additional sizes and pages; this is not a claim that every UI state is bug-free.
- Local detection reports the already-known unavailable `E:\SteamLibrary` drive. This warning does not prove library corruption; disconnected drive contents cannot be verified from this scan.

## Still unconfirmed

- The user screenshot confirms the new compact native notification appearance. It does not confirm clicking View game after renderer unloading, the hero-image variant, or activation after a full process exit. The latter is not newly implemented or promised. Route/unit checks pass; no new visible toast or game launch was requested.
- Earlier installations observed different saved-data snapshots across launch contexts. Latest install preservation and the current normal/dev validation pass, but the underlying discrepancy was not diagnosed. This remains a development-workflow observation, not an established product-wide settings-loss regression. A read-only file check alone cannot resolve it.
- Prior user reports remain accepted evidence for installer upgrade, startup, restart/icons, DualSense navigation and launch/handoff. This audit did not repeat visible Windows restart, account consent, Steam restart, game launch/exit, or Windows sign-in timing.

## Evidence

- Draft: https://github.com/tkokero/Orbit/releases/tag/untagged-060f668c3bfb79177582 (release ID 423118269, draft true, published_at null).
- `work/release-audit-026-unit.log`
- `work/release-audit-026-package.json`
- `work/release-audit-026-remote.json`
- `work/release-audit-026-archives.json`
- `work/release-audit-026-metadata.json`
- `work/release-audit-026-dependencies.json`
- `work/release-audit-026-profile-read.json`
- `work/release-audit-026-packaged-exit.json`
- `outputs/release-audit-026-packaged/smoke-report.json` and `background-checks.json`

These local development records are not release attachments. Publication still requires explicit user approval.
