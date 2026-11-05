# Game graphics

Graphics settings is experimental. Open **Game options → Graphics settings**, or choose **More → Experiments → Graphics settings**.

The game list shows artwork and defaults to **Played games**. Choose **All games** to include unplayed games or unknown play history; Orbit remembers this choice. **Find config files** opens a deeper search, rather than claiming no file exists.

Right-click a game and choose **Remove from library** to exclude it from Orbit without uninstalling it. Use **Undo**, or open **Hidden games** and choose **Restore to library**. Saved exclusions survive library scans.

## Find configs automatically

Orbit checks the game's install folder and likely Documents, AppData and Saved Games locations. Open the config control to see results. **Search again** picks up files created after a first launch. **Config options → Choose file** handles a file stored elsewhere.

Editable configs appear first, with saved dates and optional names such as Main account. **Details** shows the full path and **Rename** action. Other likely settings files are marked **View only** and have **Show folder**. A located file is not automatically editable. Choose the named, dated row for your account. The last-saved file is not necessarily your active account.

Search is local, bounded and on demand. It skips linked child folders, large files and asset/cache directories. It does not scan an entire drive or run continually in the background.

## Change individual settings

1. Choose a config and **Custom**, or use a Performance / Super preset.
2. Compare **Setting**, **Current** and **New value**. Keep current leaves that value alone. The info control explains each setting; less common controls are under Advanced. **Reset edits** clears pending choices.
3. Choose **Review changes**, then check the exact changes. Uncheck any you want to skip.
4. Close the game and select **Apply selected**. VALORANT also requires Riot Client closed. Restart the game to try the result.

Orbit verifies a backup before editing a local config. **Restore original settings** restores the previous values and protects unrelated newer edits. It stops if an edited value conflicts with that backup.

| Config | Editable controls |
| --- | --- |
| Compatible VideoConfig files, including Apex | Recognized anti-aliasing, anisotropic filtering, ambient occlusion, volumetric lighting, automatic texture budget and dynamic spot-shadow values. Opens Custom when no choice is saved. |
| Overwatch | Overall quality, texture quality and named anti-aliasing methods, where recognized. |
| VRChat | Its experimental avatar particle limiter and bounded budgets. General graphics stay in VRChat's menu. |
| Compatible Unreal / VALORANT configs | Recognized engine quality groups. A game's own settings may override them or use different names. |

## GPU apps

**NVIDIA App:** choose an available Performance, Balanced, Recommended or Quality preset, review it, then apply it through NVIDIA's installed local connection. Orbit currently uses its plugged-in (AC) profile. The chosen preset is remembered. NVIDIA's interface provides preset availability, not individual current/recommended rows; open NVIDIA App for that full comparison. Presets may also change resolution or display mode.

NVIDIA **Revert** restores its defaults for that game, rather than promising your earlier custom values. Restore an active Orbit config backup before applying a vendor preset.

**AMD Software:** open Gaming → Games → your game to change its per-game profile. Orbit opens the installed app; direct AMD per-game editing inside Orbit is not implemented. ADLX's GPU-wide controls are not presented as per-game settings.

The vendor app must already be installed and allow local access. Orbit does not enable it, raise permissions, install drivers or change global GPU controls. FPS gains have not been measured. Games and cloud sync may replace saved values.

Sources: [NVIDIA App's public operations](https://github.com/NVIDIA/nvidia-app-skills/blob/main/skills/nvidia-app/references/general-tools.md), [AMD per-game profiles](https://www.amd.com/en/resources/support-articles/faqs/dh-012.html), [AMD ADLX scope](https://gpuopen.com/manuals/adlx/adlx-sdk-references/adlx-interfaces/3d-graphics/iadlx3dsettingsservices/), [VRChat particle limits](https://docs.vrchat.com/docs/avatar-particle-system-limits), [Unreal scalability](https://dev.epicgames.com/documentation/en-us/unreal-engine/scalability-reference-for-unreal-engine).

### NVIDIA checks

Orbit remembers game names returned by NVIDIA for up to 30 days. Reopening checks only the selected game and always reads current preset availability. **Check again** refreshes the full list; a first scan can take up to 40 seconds. **Stop checking** cancels the read. Later single-game requests have an eight-second total limit. Closing the popup releases pending reads; an explicitly submitted Apply is allowed to finish. Names are cached locally, not your individual graphics values.

### Compatible VideoConfig files

Orbit checks the file’s contents, not only a game name. A supported flat `VideoConfig` block with recognized keys can be edited in another game or filename too. Unknown keys and unknown option values stay unchanged. This does not enable arbitrary config keys or console commands. The same backup, closed-game and stale-review protections apply. Apex’s normal file-ending marker and original formatting are preserved. The fixed texture-memory budget, resolution, audio, keybinds and FPS limits remain untouched. Check the effect in-game after restarting.
