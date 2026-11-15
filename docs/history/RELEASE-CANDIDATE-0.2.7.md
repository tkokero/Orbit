# Orbit 0.2.7 candidate

Release candidate: **0.2.7**, prepared from validated **0.2.7-dev.32**. Publication requires explicit approval.

## Finished software scope

Desktop search and shortcuts; named launch targets and useful recovery; grouped Settings; saved popup geometry and parent-menu state; local activity/streaks; existing library organization; original and Encore startup choices.

Dev.28 adds fair, command-first VR frame delivery, inward-facing wrist placement, screen move/resize/hide/close controls, and collapsible wrist tools. The user authorized installing this candidate after the UI audit; see the local installation receipt for completion. Controller grab feel and real VR latency remain unperformed.

Dev.25 changed Encore audio. Dev.26 repairs VR wrist visibility, panel resolution and responsiveness. Automated software checks are distinct from headset playtesting. The prior Desktop pass addresses Settings focus/search cost, late launch-help reopening, launcher/mode error classification, parent-menu focus/scroll restoration, and the Encore hand pose. Saved user choices remain the authority.

Dev.29 simplifies Desktop Settings, aligns toggle rows, groups Privacy controls, makes longer sections expandable, improves narrow Settings navigation and sidebar labels, and removes unrelated generic icons. UI validation includes paired before/after screenshots.

Dev.30 adds a direct All games action and click-again filtering in Activity, fixes doubled Settings disclosure arrows, and replaces abstract banner-picker bars with meaningful layout previews. It passed 626 unit checks and 722 hidden app checks, with two opt-in native checks skipped. Installed quietly with both profiles preserved; before/after evidence is in the workspace UI-DETAILS-VALIDATION.md.

Dev.31 preserves Activity pagination and scrolling on Refresh, permits retained historical games to open after leaving the library, and wraps long session titles. It passed 626 unit and 799 app checks, with two opt-in checks skipped. Installed quietly with normal/dev settings preserved. Workspace evidence: work/FINAL-POLISH-VALIDATION.md.

Dev.32 unifies the ten Desktop Settings disclosure arrows and their trailing alignment. It passed 626 unit checks and 729 app checks, with two opt-in native checks skipped. Installed quietly; workspace before/after evidence: work/DISCLOSURE-VALIDATION.md.

## Validation gates

- Run unit checks and hidden isolated UI checks, including empty/error/loading states, narrow/wide layouts, themes, scaling and reduced motion.
- Compare a fixed dev.23 baseline with dev.24 using the same performance fixture and process scope. Record measured changes and noise; do not generalize fixture timings into Windows login or gaming gains.
- Check the two-second idle-renderer controller with a hidden scratch renderer. Keep active-work safety gates; a scratch check does not prove a normal user tray round trip.
- Back up normal/dev profiles, verify them with the normal loader, install quietly, and compare installed files.
- Keep full evidence and the concise before/after note in the workspace validation record.

## Still requiring playtests

- Normal visible popup feel, hands/intro appearance and audio on the user's display/speakers.
- The user confirmed Windows startup/restart/updates, intro/icon/focus behavior, real launch detection/handoff, physical controller navigation, monitors and Windows scaling work. These playtests were not repeated. New VR wrist orientation and headset latency still need a playtest.
- Real provider/account failures, credentials and consent flows; isolated recovery cases never execute real games or launchers.
- SteamVR headset/Virtual Desktop behavior, wrist aiming, multiple-panel frame cost and hardware frame statistics.

These are separate from passing software checks. Controller Home and Library are unchanged. Clipping remains the planned headline for 0.3.0.

## Release preparation

Version, in-app notes, source package and installer must agree. Keep user-visible notes short and describe VR as experimental. Do not create or move a public tag, replace published assets, upload a feed, or publish this candidate without approval.

## Final packaging

The release packaging hook retains app-update.yml even with publishing disabled. A dedicated fixture checks the updater configuration and complete license notices. The actual final installer is checked through a loopback updater without executing it; production feed promotion remains a separate publication step.

## Final review polish — October 31

The follow-up candidate keeps Game Details actions reachable while scrolling, replaces oversized missing-artwork banners with compact placeholders, and gives narrow Library windows a shorter featured card and an Organize menu. Quick launch remains available under More in compact windows. Wide Desktop and Controller layouts retain their existing controls.

Inactive VR controls now match their status. Disconnected Friends no longer repeats connection prompts while Accounts is expanded. Singular result counts and the README's Quick start route are corrected.

The exact packaged candidate passed 627 unit checks, 728 hidden app checks, and six updater checks. Two opt-in native tests remain skipped; real headset tuning remains unperformed. It was installed quietly with normal/dev settings and media preserved. Before/after workspace evidence: work/FINAL-0.2.7-POLISH-VALIDATION.md.

The previous cloud draft attachments and source branch must be aligned with this follow-up build before publication. Preparing or installing it does not publish the release.

## Follow-up UI sweep — October 31

The follow-up sweep retains the established Desktop, Settings, Controller and VR layouts. It removes empty utility-artwork frames and unused FPS rows, keeps headings below the fixed game actions, waits for installed-copy details before fitting Uninstall, and clarifies empty Steam Storage. Quick launch keeps its position after resizing; Tools and singular entry labels are corrected. The idle VR header tagline is removed while game/session status remains.

The exact package passed 627 unit checks, 872 hidden app checks and six updater checks; two opt-in native checks were skipped. Real headset tuning remains a separate playtest. Workspace evidence, including paired before/after screenshots: work/UI-SWEEP-VALIDATION.md. No publication or cloud draft replacement is part of this review.
