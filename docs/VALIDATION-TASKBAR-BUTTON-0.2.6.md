# Running pinned taskbar button refresh

October 26, 2026. Local candidate; unpublished.

The user reports that the taskbar icon still does not immediately follow theme changes. Prior source/resource and shortcut metadata checks did not establish visible Explorer repaint. Do not treat those checks as proof that this report was resolved.

## Investigation

An experimental stable icon file was updated in place, with targeted image-cache notifications. A separate observer held an existing system image-list entry and processed the documented image-update notifications. Its pixels remained unchanged, despite receiving two notifications. Changing timestamps and also notifying the icon file did not resolve that fixture. The stable-file experiment was reverted, including all three affected source files, using the exact previously installed package as the baseline.

The initial observer build used an incorrect compiler source path; the unsuccessful diagnostic was terminated and given explicit no-dialog error handling. Earlier observers without a notification message pump were not treated as valid evidence of Explorer behavior. The final experimental observer used a message-only, non-visible notification listener. Failed experimental receipts remain under `work/taskbar-live-cache-qa*` and are not passing release gates.

## Revised behavior

Theme icons keep separate palette resources, preserving the original bounded cache and settings behavior. For an actual theme change, the pinned-shortcut update now receives Orbit's main-window reference. If a matching Orbit pin exists and the window is visible, the helper refreshes that window's running taskbar registration using `ITaskbarList.DeleteTab` followed immediately by `AddTab`. It preserves the application ID and pin, and does not restart Explorer, change foreground focus, show a hidden window, unpin/repin or clear global caches. The native helper verifies window ownership and the executable path before acting. Hidden and unpinned windows do not receive this registration cycle. Pending obsolete icon requests are skipped before execution.

This may redraw the running taskbar button briefly. It is not a claim of a measured one-frame repaint. Actual visible behavior must be checked in a user-agreed playtest.

## Validation

- Full unit suite: 484 passed, zero failed, one explicitly opt-in native fixture skipped.
- Regression coverage verifies preserved shortcut properties, same-icon metadata with a running-window refresh request, hidden/unpinned exclusion, and theme-window repaint ordering.
- The revised native helper compiles. Packaged verification checks its exact bytes and existing disconnected integration resources.
- Routine checks do not invoke a visible taskbar-registration fixture, take focus, or change real game/account state. End-to-end Explorer repaint remains unverified until the user checks a theme change or authorizes a visible fixture.
- Current themed tray menu, recent games/page shortcuts, startup animations and prior UI fixes remain included.

References: https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-itaskbarlist-deletetab and https://learn.microsoft.com/en-us/windows/win32/api/shobjidl_core/nf-shobjidl_core-itaskbarlist-addtab .

## Installed result

358 hidden packaged checks passed. 225 packaged resources matched source and the installed archive/native helper matched the validated package. Quiet installation completed October 26 without reopening/focusing Orbit. Both profiles preserved checked settings and seven custom themes each; 17 normal-profile managed files and the existing encrypted Discord connection were unchanged. Release remains unpublished. Actual visible taskbar redraw remains pending user feedback; it is not reported as verified.

## Failed user playtest and live investigation — October 26

The user confirmed that the icon updates once, then stops, and subsequently confirmed that it still does not update. **The installed candidate did not resolve repeated taskbar icon changes.** The earlier passing unit, package, and metadata checks are insufficient to close this issue.

With the user's approval for a live theme check, diagnostics on the installed process confirmed that theme requests reach the renderer, saved native preferences, theme-icon generation, window relaunch properties, and matching pinned shortcut. The icon update queue completes and the installed archive/helper match the tested package. Those findings rule out a stalled update queue for this reproduction; they do not prove Explorer displayed the new icon.

Work-only experiments tested a delayed DeleteTab/AddTab cycle, reapplying window group identity, shortcut relaunch-icon metadata, Start Menu shortcut notifications, and icon-resource/cache notifications. None established reliable repeated repaint. No experimental helper was incorporated into the application or installed as a new candidate. The experimental shortcut changes were restored, generated ICO files were regenerated from their corresponding original PNG resources, and the original Glacier theme was restored. The game remained running; diagnostic helpers reported unchanged foreground ownership. Behind-game taskbar captures are retained under `outputs/taskbar-live-check`; a capture of an occluded taskbar is not a substitute for a successful user playtest.

One earlier external settings-file check showed an older file view than the running app. That discrepancy is unresolved; it must not be used as evidence that theme persistence failed, nor should an external preservation receipt alone be represented as verification of the live profile.

The main icon-change bug remains open. Do not publish release notes claiming that pinned Windows taskbar icons change immediately, and do not reinstall this same candidate as a fix. Microsoft describes different icon behavior for combined/pinned groups: https://github.com/microsoft/WindowsAppSDK/issues/2730 .
