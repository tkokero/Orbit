# Installation notification polish — local 0.2.6 follow-up

Requested by a screenshot of the existing plain Windows completion notification. This changes native toast content, not the Windows shell frame, system notification permissions, or Do Not Disturb. No separate overlay or always-on-top window is introduced.

## Content and behavior

- Game title, Ready to play or Update complete, provider attribution, selected startup Orbit icon, and one View game button.
- Suitable locally cached landscape art becomes a small PNG hero image. Portrait/square and rotated portrait fallbacks are omitted rather than stretched. Missing art leaves a readable compact notification.
- No artwork network request is made for a notification. Conversions run one at a time, decode at most 20 million pixels from a local file under 15 MB, and cache at most 24 generated hero PNGs. Remote/UNC input is rejected.
- Existing installation-notification preference is preserved and checked again after image preparation. Hidden/missing library entries are excluded; no game is launched by a notification.
- Duplicate completion events are suppressed for one minute. Native callback objects are kept alive after a Windows timeout so Notification Center clicks still work while Orbit is running. Retained native objects and duplicate tracking remain bounded.
- Rich-content failures may fall back once to ordinary native content. An explicit Windows settings rejection is not retried or bypassed.

## Related repairs

The old click handler only acted when a renderer window still existed. After Orbit's two-second tray unload it did nothing. The new handler calls `openMainWindow`, restores/shows it only in response to the user's click, and uses the shared Desktop route, which waits for library readiness before opening game details. Tray quick-launch still launches only when deliberately selected. Merged Steam copies resolve to the canonical library entry.

The old close handler discarded every notification reference on timeout, although Windows may keep the notification in Notification Center. Timed-out entries now keep their activation callback, subject to the bounded retention limit.

## Validation

Pure unit fixtures exercise native-content escaping, normal delivery priority, local-art filtering, disabled/unsupported states, pending-work cancellation, duplicate suppression, exactly-once activation, Notification Center timeout retention, fallback behavior, canonical IDs, batch conversion limits, image orientation and PNG caching. Separate route tests verify renderer readiness, Desktop details, removed/hidden entries, and unchanged explicit quick-launch. No regular unit test emits a Windows toast or starts a native fixture window.

The isolated offscreen layout preview is generated from the same native XML payload, in light and dark Windows-style frames. It is a layout illustration, not an OS screenshot. XML parsing, local images, layout bounds and hidden/unfocused behavior pass. Preview files: `outputs/installation-notification-preview` in the local workspace. Test game artwork is the public Steam header for HELLDIVERS 2, kept only in the local preview fixture, not bundled into Orbit.

The user explicitly approved one visible Windows test notification. Exactly one `show()` was requested, labelled Notification preview, with clicks recorded only. Windows then returned HRESULT `-2143420140`: “Settings prevent the notification type from being delivered.” No notification setting was changed, no automatic visible retry was attempted, and no game/download was changed. This automated attempt did not verify appearance; the later user screenshot below confirms the compact native layout. Receipt: `work/native-notification-check-result.json`.

Persisted notification activation after a full process exit/restart is not newly implemented or claimed; this repair covers the native process remaining alive while its renderer sleeps. No live game-launch or account-authorization check was repeated.

## References

- [Electron Notification API](https://www.electronjs.org/docs/latest/api/notification)
- [Pinned Electron 44.9.0 Windows toast implementation](https://github.com/electron/electron/blob/v44.9.0/shell/browser/notifications/win/windows_toast_notification.cc)
- [Microsoft notification content and hero-image layout](https://learn.microsoft.com/en-gb/windows/apps/develop/notifications/app-notifications/app-notifications-content?tabs=xml)

Publication remains unauthorized. The remote 0.2.6 draft is unchanged and its distribution assets still need refreshing before publication.

## Final local result

- 523 unit tests passed, one explicitly opt-in native fixture skipped, no failures. One existing presence timing test failed under parallel build load because its real-time delay crossed the rate-limit boundary; its fixture now injects the existing clock parameter. Runtime Discord behavior and permissions were not changed. The focused presence suite and final full suite pass.
- 358 packaged checks passed. The quiet-window guard recorded zero shown/focused windows and blocked six activation calls. All 233 runtime resources match source.
- The installer completed silently with exit code 0. Installed archive SHA-256: `4e6bacec386337530caeac18c67369dc6428b9b924812edeb0ac212e125aaa9b`.
- A read-only inspection found zero active Orbit installer downloads before exit. Steam/client downloads and games were not stopped or modified. No live sign-in or game-launch check was run.
- Normal and dev profiles were backed up in both observed launch contexts. The latest running Roseberry profile with three custom themes, Singularity selection, saved sound choices, all 17 managed media files, and exact encrypted remembered connection was preserved. The dev profile keeps seven custom themes. No theme union, new authorization, or tracking/history overwrite was performed.
- The installed normal loader and hidden renderer match the latest preference hash. Both profiles retain every value through the normal loader; native unpacked resources match the tested package. Orbit reopened using `--background` without showing/focusing a window or playing its intro. Diagnostic access was closed.

Receipts: `work/installation-notices-026-ready.json`, `work/installation-notices-026-install.json`, `work/installation-notices-026` preservation reports, and the preview/native-check reports cited above. The automated native attempt remains recorded as blocked; it is not rewritten as a pass.

## User screenshot confirmation

The user supplied `codex-clipboard-53785be9-11e4-439a-9fb4-6983da953909.png`, showing a real Bongo Cat notification with Orbit's icon, game title, Ready to play, Steam attribution, and a View game button. This confirms delivery and compact native rendering in the user's environment. A local evidence copy is saved as `outputs/installation-notification-preview/user-compact-native.png`.

The screenshot does not confirm a button click, restored-window behavior, or the cached-hero variant. Those are not marked as visually playtested by this evidence. No further notification, setting change, rebuild or installation was performed to record the screenshot.
