# Tour, login startup, and Discord presence follow-up

Date: October 25, 2026. This is an unpublished 0.2.6 candidate.

## Changes

- The Desktop tour keeps Back and Next in one place, groups Library steps before changing pages, and scrolls only as needed to reveal a target. Closing restores the original workspace, filters, selection, scroll, and focus.
- Windows login skips the saved intro for that launch, starts reading the cached library earlier, and defers the first process scan and saved Discord Friends reconnection for five seconds. Manual-launch intro preferences are preserved.
- Hidden or excluded game names keep Orbit Rich Presence visible as “Playing a game.” A hidden foreground game never substitutes a different background game's name. Elapsed-time and background-sharing choices still apply. Guest mode and disabled sharing clear activity.
- Public Markdown guides are shorter. Controller architecture, FPS model details, and historical validation records remain linked separately. Documentation-only commit: ad3c15a0482969f344e02e1bfd2e868b7770c700.

## Evidence

- Full unit suite: 460 passed, one explicitly opt-in native Roblox fixture skipped, zero failures.
- Hidden tour/Downloads fixture: 64 checks passed, including a fixed Next position across all 23 steps, restoration after closing, narrow layouts, display scaling, and themes. No native window was shown or focused.
- Login renderer fixture: four checks passed. The cached sample window became usable in 204 ms on the login path versus 2,739 ms with its selected manual intro. This is a cached renderer comparison, not a Windows sign-in benchmark or a general speed guarantee.
- Package resource comparison: all 214 source/document resources matched, including native Discord helper resources; its disconnected probe remained disconnected.
- Initial packaged run: one obsolete assertion expected the former tour's second target. Updated it to check the new Hero step and stationary Next position. Final packaged run: all 357 checks passed, zero shown/focused windows, exit code zero. Final package SHA-256: c74f9d4e0d6596dabc28c1b8fea1cc1aa22bf2729ab59a9552cc158728b5eff2.
- The final targeted Discord/login suite passed all 28 checks. Installation receipts are recorded in the workspace under work/tour-login-presence-026-*.

## Limits

Actual Windows sign-in timing still needs the user's next sign-in. No game was launched or stopped, and no new Discord authorization was requested. Real Discord rendering is not established by the mocked transport tests. Routine checks stayed offscreen and used isolated fixture profiles.

The public release remains unpublished. The candidate installed quietly with exit code zero and the installed archive/native resources matched the tested package. Both normal and dev profile settings, seven custom themes in each profile, 17 normal managed artwork/media files, and the existing encrypted Discord connection were preserved. Orbit did not reopen or take focus. Receipts are work/tour-login-presence-026-install.json, work/tour-login-presence-026-preservation-verification.json, and work/tour-login-presence-026-credentials-preserved.json. No update feed was published.
