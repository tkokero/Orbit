# 0.2.6 draft alignment

October 27, 2026. Completed the requested asset/source/update-metadata alignment. The release is still unpublished.

- Replaced all six draft attachments with the latest validated local installer, matching blockmap, portable ZIP, source ZIP, versioned updater manifest and SHA-256 file.
- Kept the installed application binaries unchanged. Installer SHA-256: `14d40fd8b31cfbcd9b8bd9ccd345c62a90b1338e66d445c4b5f81c349d6b3662`. App archive: `4e6bacec386337530caeac18c67369dc6428b9b924812edeb0ac212e125aaa9b`.
- Updated repository `main` by a checked fast-forward to `9c02acf81502fbf0b0037d8ff33dd7a08acfe947`. All 352 public source-snapshot files match their Git blobs; ZIP CRCs and portable build bytes match. Private validation documents, profiles, credentials, dependency folders and debug symbols are excluded from the source snapshot.
- Pinned the draft's target to that exact commit, with tag name `v0.2.6`. GitHub explicitly creates the actual tag from this target only when the draft is published; no public tag/release was published by this operation.
- The manifest has an absolute `v0.2.6/Orbit-Setup.exe` URL and matching installer size/SHA-512. Its release notes match the eight simplified draft bullets. All five listed distribution checksums pass, and all six GitHub attachment sizes/digests match local files.
- Old attachments remain preserved in `outputs/Orbit-0.2.6-final-draft` in the local workspace. The user gave action-time approval to remove the old attachments; only Save draft was selected, never Publish release.
- The existing public compatibility feed remains byte-for-byte unchanged and still advertises 0.2.5.

This resolves findings 1–3 in `RELEASE-AUDIT-0.2.6-2026-10-27.md` for draft preparation. The pending settings launch-context investigation, optional native notification click playtest, and opt-in native-test gate are not repaired or retested by this packaging task. Prior user playtest evidence and the audit's quiet test results remain applicable to the unchanged binary.

Remote receipt: `work/release-align-026-verification.json`; file receipts: `work/release-align-026-assets.json`, `work/release-align-026-source-commit.json`, and `work/release-align-026-metadata-verification.json`.

Draft: https://github.com/tkokero/Orbit/releases/tag/untagged-b0b35e3527066143aca2

Explicit publication approval is still required. Do not copy the draft manifest into the live compatibility feed until publication is authorized and its versioned download destination is available.
