# Desktop polish, resource use, and local detection audit

October 25, 2026. Unpublished candidate; not installed over the user's session.

## Changes

- Re-selecting the active workspace preserves filters, selection, scroll, and existing cards instead of rebuilding and resetting them.
- Desktop dropdowns release detached controls when content is removed. Form resets use one delegated listener instead of retaining a listener and its select for every historical field.
- Unchanged dropdown labels and disabled state avoid redundant attribute writes; nested enhancement work is coalesced.
- Library scan and startup-cache records are compacted before further processing. Existing library merging rules retain separate installed locations, account evidence, launch preferences, artwork references, and latest statistics. History enriches confirmed games without adding history-only games.

## Measured results

Read-only audit of the user's existing normal profile:

| Measurement | Before | After |
| --- | ---: | ---: |
| Cached records held for processing | 931 | 285 |
| Serialized record bytes | 2,023,301 | 930,475 |
| Median library merge, milliseconds | 4.29 | 1.70 |

Both versions produced an exactly equal merged library, including user preferences. Merge timings used seven interleaved samples of 20 merges each. Serialized bytes measure the records, not total process RAM; these timings do not measure Windows startup or total app CPU.

Hidden Desktop fixture, 500 transient dropdowns across ten batches on a persistent form, followed by garbage collection:

- Before: 14,000 extra retained DOM nodes. After: zero extra retained DOM nodes; listener count returned to baseline.
- Re-enhancing unchanged controls 20 times: 80 redundant disabled/label attribute writes before, zero after.
- These stress-fixture measurements establish that the retention path is fixed. They do not establish a fixed RAM saving for every user session.

## Library findings

- Read-only scan of local manifests, registered installations, supported shortcuts, and cached account records; no sign-in, download control, game changes, or profile edits.
- Cached and fresh merged libraries both contained 262 games. Cached installed game count was 43; fresh count was 42. Detroit: Become Human's old F: Steam manifest was no longer present, so fresh detection correctly stopped claiming it was installed.
- The E: Steam library was unavailable. Its drive warning remains separate from the missing Detroit manifest. No drive contents or saved choices were removed.
- RV There Yet? was absent from the merged library. The scan excluded 244 history-only Steam entries from eligibility; matching confirmed entries may still use their play statistics.
- Local scan found 60 installed Steam records, including tools and duplicate installation records. This raw count is not the unique installed-game count.
- Current ownership of every uninstalled Steam/Epic title cannot be independently established from cached account data. No fresh account authorization was performed. Cached account evidence remains identified as such; this is not a guarantee that every historic entitlement is still current.

## Validation

- Full unit suite: 461 passed, zero failures, one explicitly opt-in native Roblox fixture skipped.
- Hidden Desktop resource/navigation fixture: 12 passed. Checked select changes/reset/disabled state, Escape/focus restoration, removal while open, repeated workspace selection, 420/800/1440-pixel windows, light/dark themes, and 125% scaling. All menus were visibly open for final viewport assertions.
- Tour/Downloads fixture: 64 passed, including stable Next position across 23 steps, restoration, and Downloads behind Steam.
- Fixtures showed/focused zero native windows. New dropdown screenshots were inspected visually.
- Initial unit run expected a duplicate remembered record to remain separate. Updated its assertion to require one installed record plus the retained imported entry; final suite passed. An initial narrow-menu check ran before viewport resize settled; the final test waits for resize and requires a nonzero visible open popup.
- Exact packaged-resource comparison passed for all 214 resources, including the native Discord helper. All 358 packaged regression checks passed with exit code zero and zero native windows shown/focused. Package SHA-256: 8f613a251dae952aa8b89b5f23024aedc9adf96ed3630668edced3c3477aa1cc. The installer was built with publication disabled. Candidate and installer receipts live under work/cpu-ram-polish-026-* in the development workspace.

No public app release or update feed was published. The candidate is separate from the installed app. Native focus, game launch/exit, account authorization, and actual Windows sign-in timing were not retested.
