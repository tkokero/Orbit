# 0.2.8-dev.15 validation

Installed quietly and verified. **746 unit checks and 797 packaged app checks passed.** Two opt-in native checks were skipped. All automated validation windows stayed hidden and unfocused. This build remains unpublished; NVIDIA Apply and AMD hardware still need an agreed playtest.

## Changed

- Fixed Overwatch’s Steam/NVIDIA name mismatch. NVIDIA discovery names persist; current preset state is read live.
- Added Stop checking, retry, and cancellation on popup close. Removed the automatic preset check before Review.
- Removed unused declarations and avoided repeated Appearance work when its controls are closed. Simplified labels.

## Passed

- The installed archive and unpacked resources match the checked package. App release notes now show the correct build number; an earlier candidate failed that check and was rebuilt.
- Normal and dev settings, themes, artwork, layouts, remembered connections and recorded history were retained through their normal loaders. The currently selected Afterglow Encore startup stayed selected.
- All 45 recognized game configs remained byte-identical; seven unsupported VALORANT records were not compared. Roblox remained running through installation.
- Slow NVIDIA reads can be stopped, failed reads can be retried, and closing releases the read. Reopening does not enumerate every game or automatically validate a preset before Review.
- The installed reader matched **Overwatch®** in the normal library to **Overwatch 2** in NVIDIA in **735 ms**. It returned five available preset actions without applying anything. Both profiles received only a small derived cache of names from the successful read-only NVIDIA discovery; no settings or credentials were replaced.

## Still needs testing

Live NVIDIA Apply and AMD hardware. Physical controller, headset, multi-monitor and actual game-launch checks were not repeated. Prior user playtest evidence remains separate from the automated checks. This is a development build, not a published release candidate.

## Evidence

[Before/after images](validation/0.2.8-dev.15/ui-review.md). All automated app screenshots use an isolated sample library.

NVIDIA read-only testing found Overwatch and returned its available presets. Reopen: 544 ms; a new process connection: 554 ms. First discovery: 16.1 s in that run. Vendor/network caching varies; these are individual observations, not a guaranteed gain. Live Apply and AMD hardware remain untested.

The same synthetic 1,000-paint workload with Appearance closed went from 3,000 full preference clones and 1,000 artwork scans to zero of each. These are operation counts, not measured whole-app CPU or RAM savings.

[Cleanup details](CODE-CLEANUP-0.2.8-dev.15.md) · [Machine-readable evidence](validation/0.2.8-dev.15/evidence-summary.json) · [Optimization review checklist](RELEASE-OPTIMIZATION-CHECKLIST.md)
