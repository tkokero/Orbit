# Final 0.2.6 draft preparation

October 26, 2026. Publication remains unauthorized.

The user reported that the normal restart/icon/intro/saved-library check and final 0.2.5-to-0.2.6 installer upgrade work. These are accepted user playtest results; no disruptive native checks were repeated.

The final installer is the already-installed, validated icon-choice candidate: 498 unit passes, one opt-in skip, 358 hidden packaged passes, and 229 source/package resources matched. No application code was changed or rebuilt just to revise the public release description.

The release description now groups user-visible changes under Library, Appearance and navigation, Friends and privacy, and Everyday improvements. It includes the icon selector and existing example screenshots, removes the obsolete draft-test checklist, avoids unsupported Epic Friends claims, and makes no universal CPU/RAM percentage claim. Detailed history stays in validation documents.

## Upload set

- `Orbit-Setup.exe`: the exact installed candidate, SHA-256 `ad1aaca953b128a8a2cd631660ff3c9dfc149ae8e8c1fa46a3a3f63137a43557`.
- `Orbit-Setup.exe.blockmap`: generated with that installer.
- `latest.yml`: installer size and SHA-512 verified, with absolute versioned asset URLs and the final notes.
- `Orbit-Windows.zip`: full portable directory, checked byte-for-byte against the validated unpacked build, including archive SHA-256 `11d0ac4c1ca6479e27087d5663c83e54980b8f22898a7140a0b278acc015933d`.
- `Orbit-Source.zip`: the matching runtime/source, native source and licensed native runtime components, lockfile, tests, scripts and public guides. Dependencies, debug symbols, private profiles, work receipts and local validation records are excluded. Source runtime files match the validated project; ZIP CRCs passed.
- `SHA256SUMS.txt`: SHA-256 values for the five distribution files.

Files are staged in `outputs/Orbit-0.2.6-final-draft`. The two superseded draft attachments were preserved locally and their remote digests verified before replacement. The user explicitly approved removing those two old attachments from the draft. The GitHub release remains a draft and the existing public compatibility feed is unchanged.

This pass refreshes release assets and notes; it does not publish a tag or move a repository branch. The source ZIP is the explicit source snapshot of the validated binary. Before eventual publication, the publication workflow must ensure the release tag/target commit also represents that snapshot, so GitHub's automatically generated source archives do not point to an older tree.

Receipts: `work/release-026-final-assets.json`, `work/release-026-final-user-acceptance.json`, and the final remote draft-verification receipt. Older installer/checksum backups are in `work/release026-superseded-draft`.

Final remote verification passed: release ID `423118269`, [saved draft](https://github.com/tkokero/Orbit/releases/tag/untagged-9c9bc1be577ae78dd7c1), `draft=true`, six assets. Every GitHub asset size and SHA-256 digest matches the local upload set. The release body matches the final notes after normalizing form CRLF/trailing newlines. No old attachment remains on the draft. No live feed, repository branch, or published release was changed.
