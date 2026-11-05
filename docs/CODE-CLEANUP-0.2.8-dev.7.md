# Code cleanup — 0.2.8-dev.7

Removed seven confirmed unused assignments or unreachable conditions across three files: **178 source bytes**. No whole files were removed. This is a small maintenance change, not a measured CPU or RAM optimization.

## Exact removals

1. **src/ui/friends.js** — The private live alias has no reads. Presence uses P directly.

   Before: `const P=OrbitFriendPresence,live=P.online;`

   After: `const P=OrbitFriendPresence;`

2. **src/ui/desktop-ui.js** — currentSelect is assigned and cleared but never read.

   Before: `let popup=null,popupAnchor=null,currentSelect=null;`

   After: `let popup=null,popupAnchor=null;`

3. **src/ui/desktop-ui.js** — Remove the unused reset.

   Before: `currentSelect=null;`

   After: removed

4. **src/ui/desktop-ui.js** — Remove the unused assignment.

   Before: `currentSelect=select;`

   After: removed

5. **src/ui/desktop-ui.js** — The earlier executable/file branch already handles every match.

   Before: `/choose executable|choose.*file/.test(text)?'file':`

   After: removed

6. **src/ui/desktop-ui.js** — The earlier identical theme branch already handles these matches.

   Before: `/theme|appearance|color/.test(text)?'appearance':/sound|volume/`

   After: `/sound|volume/`

7. **src/ui/context-menu.js** — Copy is already handled before this fallback. Export remains.

   Before: `/copy|export/.test(value)?'file':'tune'`

   After: `/export/.test(value)?'file':'tune'`

## What was reviewed

- Inventoried all 487 tracked files on GitHub main at commit c98a05b72eaaec47064966c4ffe575b01707e86a, and the development copy (552 files / 58,160 text lines at the inventory snapshot).
- Parsed all 358 repository-owned JS/CJS/MJS files in the development tree. Checked private declaration/reference candidates and asset references; manually confirmed the seven safe removals above.
- Checked all 65 Markdown files and 58 relative links in GitHub main: no broken or local-only links found.
- Ran the cleanup independently against GitHub's 0.2.7 source: 627 unit checks passed; two opt-in native checks skipped.
- Ran the current dev source: 665 unit checks passed; two opt-in native checks skipped. The packaged app passed 868 checks.

This is an inventory, static analysis, targeted manual review and regression run. It is not a claim that every source line was manually inspected, all dynamically referenced code was proven necessary, or native helpers were recompiled.

## Files retained on purpose

| Duplicate bytes | Why both remain |
| --- | --- |
| native/discord/vendor/LICENSE-json and src/native/discord/JSON-LICENSE.txt | Source and packaged third-party notices. |
| src/assets/orbit.png and src/native/vr/orbit.png | Main application and standalone VR helper each need the icon. |

No user settings, themes, artwork, credentials, recordings, or integration features were removed. The Live layout reuses loaded artwork and updates only when its controls change; no preview polling, capture stream, or recording is introduced. There are no comparable performance measurements for this pass, so no usage reduction is claimed.

## GitHub status

[Draft cleanup PR #1](https://github.com/tkokero/Orbit/pull/1) contains only these three cleanup files, based on released 0.2.7. It is unmerged. The 0.2.8 UI work remains local and unpublished; this pass does not publish a release or silently replace main with development code.
