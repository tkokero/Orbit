# Endfield running detection — 0.2.7-dev.2

## Cause and change

Arknights: Endfield was present through a game-specific GRYPHLINK shortcut, but its launcher did not expose a verified game installation. The merged library correctly retained `installed: false`. RunningGames incorrectly used that installation flag as a prerequisite for scanning, so its existing `Endfield.exe` candidate was never queried.

The running-game scan and diagnostics now include library games with a linked launcher or game-specific shortcut in any of their copies. Selecting a different store copy does not suppress that evidence. The existing executable matching still applies: launcher executables are excluded, readable paths must match expected executable paths, and unavailable-path fallback is restricted to the existing canonical game names. This change does not alter ownership or installation flags, discover new titles from arbitrary running processes, or allow closing a protected process without its verified identity.

## Evidence

- A read-only Windows process scan found `Endfield.exe`, PID 17852, with its executable path unavailable. The corrected detector associated it with the existing Endfield library entry. No game/window/account action was performed, and library data was unchanged.
- Four regression tests cover launcher-only Endfield detection, preferred-store copy selection, launcher/unlinked/unrelated-process exclusions, and useful diagnostics for an unknown launcher game.
- Focused tests: 31 passed.
- Full unit suite: 528 passed, zero failed, two opt-in native checks skipped.
- Build resource verification: 234 source/public resources match the packaged app.
- Packaged smoke: 358 passed; zero windows shown or focused. Two opt-in native tests were not run.
- Quiet installation succeeded. The installed archive and unpacked resources match the validated build. Endfield remained running with the same PID.
- A second read-only process scan using the installed packaged modules recognized the same live Endfield process, including its protected/unavailable executable path. No debugger or inspection port was used.
- Before/after saved-data comparisons passed for normal and dev profiles through the normal preference loader. The latest Roseberry theme, three custom themes, and Big Bang intro were retained in the normal profile; seven dev custom themes were retained. Orbit reopened with `--background`.

Packaged smoke and installation receipts are recorded separately in `work/endfield-027-*` and `outputs/endfield-027-packaged`. Profile backups and comparisons are private and must not be published. No visible game-launch/exit playtest, in-window session display check, or account-authorization flow is part of this fix. The public release and updater feed remain unchanged.
