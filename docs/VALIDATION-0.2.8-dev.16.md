# 0.2.8-dev.16 validation

**Installed quietly and verified. 756 unit checks and 807 packaged app checks passed.** Two opt-in native checks were skipped. Validation windows remained hidden and unfocused. This build remains unpublished.

## Changed

- Compatible flat VideoConfig files can be edited across games, including Apex. Recognition uses the file contents and known graphics keys. A single compatible file opens directly in Custom when no saved choice exists.
- Six named controls cover anti-aliasing, anisotropic filtering, ambient occlusion, volumetric lighting, automatic texture budget and dynamic spot shadows when their values are recognized. Unknown values and keys stay untouched.
- File endings, BOMs, mixed newlines, comments, unrelated settings and Restore are preserved. Read-only files are rejected before creating an unnecessary recovery record.
- Unsupported files are labeled view only, without misleading preset and Apply actions. The duplicate Choose file button moves into the picker options when an editable config is already available.

## Passed

- The installed archive and unpacked resources match the tested package. In-app notes identify 0.2.8-dev.16.
- Both normal and dev profiles retained their saved settings, custom themes, artwork, layouts, popup choices, remembered connection and session history. The selected Afterglow Encore startup stayed selected.
- All 46 recognized real game config files, including Apex, remained byte-identical. Seven unsupported VALORANT records were not compared. VRChat and Roblox remained running through the quiet install.
- The installed reader matched the normal-library Apex entry, found `videoconfig.txt`, and returned six controls with zero changes requested in 176 ms. Preview metadata was written only in an isolated validation folder, not the user's preferences or game config.
- Isolated tests cover Apply, checked-value selection, exact Restore, newer unrelated changes, BOMs, mixed newlines, normal file terminators, read-only files, duplicate keys, unsupported options and stale reviews.

## Still needs testing

The live game's response after Apply. No real game settings were applied during checks. Physical controller/headset, focus and actual launch tests were not repeated. NVIDIA Apply and AMD hardware still need an agreed playtest; the prior NVIDIA read-only fix is retained.

## Detection observation

The read-only normal-library scan checked 263 games, now recognizes Apex, and left its actual file byte-identical. One observed scan took 864 ms versus 551 ms for the earlier, narrower detection path. This is broader work, not a claimed performance gain. Apply/Restore checks use isolated files. Actual in-game effects remain a playtest.

[Before/after images](validation/0.2.8-dev.16/ui-review.md). Captures after the fix use an isolated sample library and configs.

[Machine-readable evidence](validation/0.2.8-dev.16/evidence-summary.json) · [Graphics guide](GAME-OPTIMIZATION.md)
