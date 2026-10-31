# Native friends validation — local development

Checked 2026-10-24. Installed locally as 0.2.6-dev.2 for the requested playtest. Nothing was published; released 0.2.5 is unchanged.

- Official Discord Social SDK registration is enabled for Orbit's existing application. Public Client and http://127.0.0.1/callback are saved and verified after portal reload. Client secrets were neither copied nor embedded.
- The Windows x64 native helper builds against official SDK 1.10.19337. Its snapshot and no-credential resume commands respond without opening sign-in. The Electron host launches it with windowsHide and a fixed executable path.
- 393 unit tests pass, including provider isolation, private-data normalization, official avatar URL checks, cancelled and overlapping sign-ins, late result rejection, Remember changes during sign-in, and sharing a startup resume operation.
- Offscreen Friends UI checks pass for connection actions, provider isolation, per-provider stale state, narrow/wide Desktop layouts, light/dark themes, Controller mode, and reduced motion. Native window shown/focused counters remain zero. Report: ../../../outputs/social-friends-ui-check/report.json.
- The first agreed live check used Discord's bundled presence scope. It read the friends list, stored a DPAPI-protected credential, reconnected, and disconnected in an isolated profile. Its saved credential was removed. The user rejected that permission bundle for shipping; it is not the final authorization policy. Receipt: ../../../work/social-bundled-scope-check.json.
- Authorization now requests exactly openid relationships.read. The helper rejects unexpected granted scopes and has no fallback to either Social SDK presence or communication bundles. The friends adapter does not read or write game activity, send invites, alter relationships, or access chat/voice.
- The narrower live attempt timed out before authorization completed. It did not establish that the Social SDK can connect with the narrower token. This remains a release blocker; do not describe the new Discord connection as validated or publish it until that check succeeds. Discord documents the presence bundle as its SDK minimum, so support for this narrower path must be demonstrated rather than assumed.
- Discord groups friends, pending requests, and blocked users into relationships.read. Orbit displays only accepted friends. Do not describe this scope as permission to read only accepted-friend rows.
- Epic native friends remain pending registered EOS product/application setup, permissions, review, implementation, and validation. Client links stay available and the UI does not claim Epic is connected.
- Existing user profiles, settings, themes, current games, and installed binaries were not changed by source or UI checks. The isolated live check was explicitly agreed by the user because authorization may focus Discord.

Remaining: complete read-only Discord authorization and compatibility validation; verify token revocation result and reconnect after revoked access. Packaged resources and local installation are verified below.

Production builds keep the Discord Connect action disabled through integration.json until friendsReadOnlyVerified is set after a successful narrow-scope live check. At the user’s explicit request, numbered -dev builds expose this unverified connection as a Dev preview for testing from Friends. Registration alone never marks the provider connected.

## 0.2.6-dev.2 candidate

The user requested enabling this feature in the installed development build. It remains a development preview, with friendsReadOnlyVerified=false and no broader scope fallback. Production builds cannot opt into this preview through renderer input. Installation validation and preservation results are recorded below after completion.

## Installation completed — 2026-10-24

- 393 unit tests, 340 packaged regression checks, and 16 Friends UI checks pass. The full regression window remained hidden and unfocused. The two original Steam-only smoke assumptions were updated to cover provider capabilities, the account picker, and the labeled Discord preview.
- All 194 shipped source/resources files match the candidate. The packaged native helper responds in an isolated no-account probe without opening authorization. Native files and both license notices match after installation.
- Silent installer exit code 0; Orbit was not reopened. Installed archive SHA-256: 5d5c88f32771a7a6ff2497c4d05d16779d5b52dac7ff9cb4bb0cfe5e4175e81b.
- Both Orbit and Orbit-Dev retain their interface preferences, native settings, per-game preferences, and all seven custom themes per profile. All 17 managed artwork files in Orbit match their backup bytes.
- Receipt: ../../../work/friends-dev2-install.json. Preservation report: ../../../work/friends-dev2-preservation-verification.json. Backup: ../../../work/user-settings-install-friends-dev2-20261024-061029.
- Try Friends → Discord → Connect after opening Orbit manually. This is an explicitly enabled development preview; friends-only SDK compatibility is still unverified and broader permissions are never used as a fallback.

## 0.2.6-dev.3 correction

User playtest exposed a generic connection failure after the narrow OAuth authorization succeeded. The Social SDK gateway requires its bundled presence scope. A separate, official authenticated desktop-client read now uses identify relationships.read and leaves activity sharing to the independent Rich Presence feature.

- Live sign-in, encrypted storage, reconnect, and repeated refresh passed with 52 friends and exactly identify plus relationships.read. No token appeared in friend snapshots. Receipt: ../../../work/discord-readonly-validated.json.
- 402 unit tests pass. Added checks cover read-only command restrictions, split frames, token redaction, accepted-friend filtering, broader-scope rejection, cancellation, repeated refresh without duplicate authentication, and reconnect on token rotation.
- No broader scope fallback was added. The developer-preview gate remains in place for release review.


### Dev.3 Desktop and controller visual follow-up

- Added a persistent Desktop banner choice in Settings > Appearance: Overlay and Split. The existing Split default remains; Controller Home and Library layouts are unchanged.
- Hidden UI checks validate both banner layouts at 860, 1440, and 1920 pixels, preference persistence across reload, portrait fallbacks, multiple themes, reduced motion, and isolation from Controller styling.
- Favorites game tiles now bypass console action-button enhancement. Their artwork, title below the cover, and installed marker retain the existing tile layout. Checked at 860, 1440, and 2452 pixels.
- Quick wheel uses content height and equal circular targets, even when a tall shared popup size was saved. Checked at 600x650, 860x1000, and 1440x1000.
- User confirmed Windows startup works on October 24, 2026.
- 402 unit tests passed after these changes. Offscreen UI checks recorded zero shown or focused native windows.


### Installed dev.3 result

- 340 packaged regression checks and 33 combined banner/Friends/Favorites/wheel UI checks passed. All native validation windows remained hidden and unfocused.
- Package verifier matched all 196 shipped source/resource files and passed the no-account native probe. Silent NSIS installation exited 0; installed archive and native unpacked files matched the tested candidate.
- Installed app.asar SHA-256: bb54e43a3342396e35021fbfdee5d670dff8c688ac5ab971a46d7dcc49a0e182.
- Orbit and Orbit-Dev retain their interface settings, native settings, per-game preferences, and seven custom themes each. All 17 managed artwork files in Orbit match the pre-install backup.
- The approved identify + relationships.read encrypted refresh credential was retained in the normal profile because Remember accounts is enabled. The previous encrypted vault was backed up. No plaintext credentials were written, and Orbit was not reopened.
- Receipts: ../../../work/friends-dev3-install.json, ../../../work/friends-dev3-preservation-verification.json, ../../../work/friends-dev3-connection-retained.json.
- Backup: ../../../work/user-settings-install-friends-dev3-20261024-164005.


## 0.2.6-dev.4 local friend-profile associations

- Exact normalized names and one-edit matches for names of five or more characters create suggestions only. Capitalization, punctuation and width variants are normalized; scripts are not transliterated. Short/generic names are not fuzzy matched. Ambiguous candidates require the same explicit user confirmation.
- Link / Keep separate decisions use provider IDs and the connected Steam/Discord owner pair, not mutable names. Confirmed links are one-to-one. Unlink restores separate cards and suppresses repeat suggestions; the Profile links manager can reconsider or manually link profiles.
- Decisions live in the existing backed-up interface preferences under orbit-friend-links-v1. No additional OAuth scopes, friend-management commands, uploads, or provider-account changes were added.
- Combined cards retain two independent status/freshness labels, separate profile-opening controls, and Steam-only recent games. Platform/online filtering evaluates the selected provider's own status.
- Matching is bounded and tested against a large duplicate-name list. Unit coverage also checks Unicode normalization, typos, ambiguous names, account isolation, renames, disconnects, persistence, unlink, conflicting links, and provider freshness.


- Validation before packaging: the full 414-test suite passed, then all 13 profile-link model tests passed including an added on-disk preference/backup round trip. The combined hidden Friends UI run passed 32 checks with zero shown/focused windows, covering exact/typo suggestions, explicit confirmation, Keep separate, independent statuses, profile routes, platform filters, restart persistence, manual links, unlink, account-owner changes, narrow layouts, Controller controls, and multiple themes.
- Candidate package verification matched all 198 source/resource files; its isolated no-account native probe passed without requesting authorization.


### Installed dev.4 result

- 340 packaged regression checks passed, with the validation window never shown or focused. Package hash and unpacked native resources matched after silent NSIS installation (exit 0).
- Installed archive SHA-256: 9c4b0831ec03f2bdd8000064ddf85005e12557c0f43bdebd9adcd6d866dbe72e.
- Settings preservation verification passed for Orbit and Orbit-Dev: seven custom themes per profile, all interface/native/per-game preferences retained, and all 17 managed artwork files in Orbit unchanged. The existing encrypted Discord connection was preserved byte-for-byte. No new authorization was requested.
- Orbit remained closed. The release was not published.
- Receipts: ../../../work/friends-dev4-install.json, ../../../work/friends-dev4-preservation-verification.json, ../../../work/friends-dev4-credentials-preserved.json. Backup: ../../../work/user-settings-install-friends-dev4-20261024-165527.


## 0.2.6-dev.5 Friends, context menus, and settings organization

- Desktop Friends now uses compact connection cards, larger readable friend names/avatars, consistent profile actions, platform marks with theme contrast, and an expandable profile-match review. Confirmation, independent presence, linking, unlinking, and saved choices remain unchanged. Steam cards show one recent game; the friend context menu opens all three reported recent games on demand.
- Platform management uses actual 42x42 icon buttons and the shared Orbit context menu. UI checks verify the icon centers and matching linked-profile button geometry. Single-page friend lists hide unnecessary disabled page-navigation buttons.
- A single renderer router handles right-click and Shift+F10 across friends, connections, game/Tool cards, quick-launch entries, downloads, Radar, news, links, images, settings, themes, startup choices, collections, dialogs, and text fields. Existing action handlers retain their validation and confirmation flows. Controller Home/Library layouts are unchanged.
- Clipboard operations are allowlisted to standard editing, bounded literal text, and in-window image coordinates. Public-link opening rejects executable/file/client schemes and credential-bearing URLs. Password fields do not offer Cut or Copy. Tests use fixture clipboard methods, leaving the user's clipboard and accounts alone.
- Updates and its existing controls moved from General to Manage. No updater behavior or authorization scope changed.
- Full 419-test suite passed. The hidden focused UI run passed 56 checks covering the redesign, profile persistence, platform filtering, matching decisions, menu routing/actions, text selection, password protection, popup containment, keyboard opening/dismissal/focus restoration, theme/startup actions, and the Updates move. No native validation window was shown or focused.


### Installed dev.5 result

- Final candidate matched all 201 shipped source/resource files and passed its isolated no-account native probe. All 340 packaged regression checks passed; the single offscreen validation window recorded zero show/focus events.
- Silent NSIS installation exited 0. Installed app.asar SHA-256: c691c2d1f83cf2d35c265a65f69da256b0105f281e4481e64cca4800db94796c. Unpacked native resources matched the tested candidate.
- Preservation verification passed for both profiles, including all interface preferences (and profile-link decisions), native/per-game settings, seven custom themes per profile, and all 17 managed artwork files in Orbit. The existing encrypted Discord sign-in was unchanged, and no new authorization was requested.
- Orbit remained closed; nothing was published.
- Receipts: ../../../work/friends-dev5-install.json, ../../../work/friends-dev5-preservation-verification.json, ../../../work/friends-dev5-credentials-preserved.json. Backup: ../../../work/user-settings-install-friends-dev5-20261024-172402.
- Two legacy smoke assertions were updated to test the new platform management controls rather than assuming every client action is rendered as a separate visible button. Platform capabilities and account-picker access remain covered.


## 0.2.6-dev.6 compact Friends and presence priority

- Connected accounts default to a collapsed disclosure. Cards use compact identities/status chips; automatic recent-game previews and their requests were removed. Recent Steam games remain available through the existing context menu. Linking decisions and provider connection actions are preserved.
- Online shows only fresh online/busy presence, excluding Away, offline, unknown, and outdated states. Playing friends rank first, DND second, and simply online friends last, with stable name/ID tie-breakers. All friends explicitly retains other statuses.
- One shared policy handles provider filtering, priority, counts, and linked-profile summaries. A linked person remains eligible if another provider is online/DND; only eligible provider chips appear in Online. Away-provider game activity cannot promote that person as playing.
- 425 unit tests passed, including six presence-policy cases. The hidden UI fixture passed 66 checks, retaining profile-link/menu coverage and adding account disclosure, Online eligibility/counts, exact priority order, provider filters, compact layouts in three themes/sizes, explicit All friends, and no automatic recent-game requests. No native validation window was shown or focused.


### Installed dev.6 result

- Candidate verification matched all 202 shipped source/resource files and passed the isolated no-account native probe. All 340 packaged regressions passed; native windows recorded zero shown/focused events.
- Silent installer exited 0. Installed app.asar SHA-256: 741bef75b47736349f00d8903fc4a61eb4423709287305cefb4d289d91a26b76. Installed native resources matched the candidate.
- Interface/native/per-game preferences and all seven custom themes in each profile were preserved, including profile associations. Orbit's 17 managed artwork files were unchanged. The saved encrypted Discord connection was preserved byte-for-byte; no authorization was requested.
- Orbit was left closed. Nothing was published.
- Receipts: ../../../work/friends-dev6-install.json, ../../../work/friends-dev6-preservation-verification.json, ../../../work/friends-dev6-credentials-preserved.json. Backup: ../../../work/user-settings-install-friends-dev6-20261024-174254.
