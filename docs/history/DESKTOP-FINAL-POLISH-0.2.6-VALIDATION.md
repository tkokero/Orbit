# Desktop release polish — October 26, 2026

Scope: six reproduced recovery and keyboard issues. No new integration, clipping feature, Controller Home layout, account authorization, or live game test was added. The release remains unpublished. The existing remote draft assets require refreshing before eventual publication.

## Reproduced issues and changes

| Issue | Reproduction before repair | Final behavior |
| --- | --- | --- |
| News failure had no retry | Make the article request time out. The reader contained only the error text. | The themed error card offers Retry while keeping Back and Open in browser available. Retry keeps the reader open, marks loading, suppresses duplicate requests, and returns keyboard focus to a live control. Closing/replacing the reader discards stale responses. |
| No bulk restore for hidden entries | Open Hidden, select an entry, and inspect the bulk bar. It still offered Hide. | The action becomes Show in library, sends `hidden=false`, and retains Undo. |
| Empty collection picker was a dead end | Select entries with no manual collections, then choose Collections. The picker was empty and both operations disabled. | A compact empty state links directly to collection creation and has Cancel. Selected entries remain selected when management opens. |
| Editable text shortcuts were intercepted | Put an inherited or empty-attribute editable region in the library and press Ctrl+A. The library selected entries instead. | Editable content keeps its own shortcuts; ordinary library selection continues working. |
| A failed banner request never recovered | Fail one landscape request, then render the same visible card after the network recovers. The session-wide requested set prevented another attempt. | Requests back off for 30 seconds and can retry on a later visible render. Missing artwork backs off too. Successful artwork remains cached. |
| Context menus consumed Tab | Open an Orbit right-click menu and press Tab. It closed but prevented the default focus step. | Tab closes the menu, restores its anchor, and permits normal focus navigation. Escape still dismisses the menu. |

## Resource behavior

Banner fetching stays limited to two concurrent requests. Hidden/inactive pages start no work. Failed retries are not scheduled on a background timer, repeated renders during backoff start no extra requests, and the failure map is capped at 256 entries. Pending requests for replaced card lists are dropped; active requests may finish and populate their cache. Recovered images update in place.

These are bounded-work and recovery improvements. No whole-app CPU, RAM, GPU, or startup-speed percentage gain was measured or claimed.

## Evidence

Local captures and reports: `outputs/desktop-final-polish-ui/before-report.json`, `after-report.json`, `before-after.png`, and individual screenshots. All six original issue checks fail in the before fixture and pass after repair; both runs stay hidden and unfocused. Additional after checks cover double Retry, stale responses, close during loading, bulk Undo, selection preservation, narrow windows, 125% scaling, light/dark theme contrast, and reduced motion.

Unit regressions cover concurrent artwork limits, success caching, failure backoff and recovery, empty artwork responses, and hidden/inactive gating. The normal unit command does not create a native fixture window.

Visible native focus, game launch, sign-in, and Windows installer interaction are not repeated in this pass. Earlier user playtest evidence remains applicable to those unchanged paths.

## Final local result

- 510 unit tests passed; one explicitly opt-in native fixture skipped. No failures.
- 358 packaged checks passed. Hidden-window guard: zero shown/focused windows, six activation calls blocked.
- 18 focused Desktop checks and 21 existing shared UI/icon checks passed. No renderer errors in either final UI run. All 232 runtime resources match source.
- The installer completed silently with exit code 0. Installed archive SHA-256: `bc8ee562e5b55c761f9e2fdf2612a32a0edbd9f349de2fb05b2814b8bd665125`.
- A detached helper produced no completion receipt, so it was not treated as success. The existing quiet installer completed the fallback, and files were verified against the validated package.
- Preservation checks again observed different profile snapshots between the running app and a separate background context. This is a development-workflow observation, not a newly established product-wide defect. Both snapshots were archived. The running app's latest Roseberry theme, three custom themes, Singularity intro, library settings, all 17 managed media files, and exact encrypted remembered-connection snapshot were retained; no theme union or new authorization was performed. Tracking/history files were left in place. The separate dev profile retains its seven custom themes unchanged.
- After installation, the normal loader and hidden installed renderer matched the latest running profile's preference hash, theme, intro and sound choices. The dev loader retained all its values. No native window was shown or focused during reopening; diagnostic access was closed afterward.

The launch-context snapshot discrepancy was handled for this installation; its underlying cause has not been diagnosed here. No new claim is made about fixing that cause or about live account reconnection.

Receipts: `work/desktop-final-polish-026-ready.json`, `work/desktop-final-polish-026-install.json`, and `work/desktop-final-polish-026` profile verification/preservation reports. The GitHub draft attachments were not replaced or published during this pass.
