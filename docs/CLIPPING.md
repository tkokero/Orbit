# Clipping

Available in the **0.3.0 candidate**. Capture support and performance vary by game and device.

## Save a moment

1. Open **Clips** in the sidebar.
2. Choose **Enable game clipping**, then open a game Orbit can detect.
3. Wait until Clips shows the game and a filling replay buffer.
4. Press **F8** to save the last 30 seconds. Saving keeps the buffer running.
5. Open a saved clip to play it inside Orbit. **Show file** opens its location.

A short, soft Orbit sound confirms a successful save. Turn it off with **Capture settings → Play a sound when a clip is saved**. This choice can change while capture is running and does not enable microphone or PC-audio recording. If you record the output playing the cue, it may be heard in a later replay.

Change the keys under **Capture settings → Shortcuts**. Click the shortcut itself, then press a function key or a modifier combination. **Esc** cancels; **Reset** restores F8 and Ctrl + Alt + F9. Shortcuts can change while recording. If a key is unavailable or saving fails, the previous keys remain in place.

Saved clips show the game or source name with their recording time. **Show more clips** reveals the rest of a longer library. Original filenames and recordings stay unchanged.

Game capture stops when the detected game closes and waits for the next game. It does not switch to recording your desktop. Use **Stop clipping** or **Ctrl + Alt + F9** to disable capture and unload the recorder. Capture stays off after restarting unless you enable **Capture settings → Enable game clipping when Orbit starts**. That option arms detected-game recording only; it never selects a desktop source.

## Full sessions and per-game choices

Choose **Capture settings → Recording mode → Full sessions** to save from capture start until Stop or game exit. **F8** marks a moment rather than creating a separate clip. In the player, **Moments** jumps to those bookmarks.

Under **Games & storage**, choose a game and **Use default**, **Do not record**, **Replay clips** or **Full sessions**. Excluding a game affects recording only. Stop capture before changing these choices.

Set a **Session limit** and optional **Library limit** there. A full session defaults to a 20 GB limit. Recording stops near its limit or when free disk space is low; saved files are never removed automatically. Completed sessions are MP4 files. Interrupted session files stay available with an **Interrupted** label; the final frames may be missing, and some interrupted files may not play.

## Watch your clips

Use **Search clips** or the game filter to find a recording. Clips are grouped by date.

Open a thumbnail for the larger player. Use **Previous/Next** to browse the current results, **Show file** to open its location, or **Back to clips** to return to your filters and position.

While the video is focused, **Space** plays/pauses, **←/→** seeks five seconds, and **Page Up/Down** changes clips. **Esc** exits fullscreen first, then returns to the gallery. The video controls include volume and fullscreen. **Playback speed** beside Previous/Next changes the speed and keeps it while browsing clips.

Right-click a recording for playback, **Show file**, **Copy clip title** and **Delete clip**. Delete is also available beside the player. Confirming moves that recording and its details to the Windows Recycle Bin; Cancel keeps them. To recover it, restore both files from Windows and refresh Clips. A recording still being written cannot be deleted.

Clip details are kept in a hidden `.orbit` folder beside the videos. Older adjacent detail files move there automatically when Clips loads; recordings, titles and bookmarks are retained. Keep this folder with the videos when moving or backing up your collection. Conflicting files are kept rather than overwritten.

## Capture settings

Expand **Capture settings** to choose 15, 30, 60, or 120 seconds, 720p, 1080p or 1440p, and 30 or 60 FPS. Selecting 1440p shows a resource warning before applying it. The source and encoder may deliver fewer frames; smaller sources are not enlarged to 1440p. Short clips can begin at a nearby keyframe; the buffer meter shows the available replay time.

Choose each shortcut field and press your preferred keys. If another app owns the shortcut, choose a different one before enabling capture. Capture settings and the output folder are remembered; stop clipping before changing them.

## Audio

Expand **Capture settings → Audio**. PC audio and microphone recording each default off and have their own volume control. Nothing starts recording until capture is enabled.

Use the PC audio **Source** choice, then expand **Apps** or **Devices** to choose what to include. Selected names stay visible when the list is closed. The microphone has its own **Input** choice. Hover a shortened device name to see its full name.

- **Windows default output** records that output, which may include calls and notifications.
- **Captured game only** records the captured window's app and its child processes. Display capture needs selected apps or devices instead.
- **Selected apps** lets you choose up to four running apps, including background apps with audio sessions.
- **Selected output devices** lets you choose up to four outputs, such as separate Gaming and Chat devices.
- **Microphone** lets you choose an input independently of PC audio.

**Audio preset** offers Game only, Game + microphone, PC audio, PC + microphone, and No audio. **Save preset** remembers your chosen sources and volumes under a name. Saving the same name updates it. Presets change audio only.

Unavailable audio sources disappear from the available list but stay remembered. Recording continues with the remaining sources, or silence if none are available. The same device returns selected and reconnects during recording. **Forget unavailable** clears a missing selection when capture is stopped. A device Windows identifies as a new device needs selecting again.

Selected sources never fall back to whole-PC recording. App capture requires Windows' process-loopback support and captures one process tree per selected app. For independent app instances or protected audio, try an output device. Audio is mixed into one stereo track; separate-track editing is not included. Stop clipping before changing audio settings. Physical devices and real-game audio synchronization still need playtesting.

## Choose a source manually

For a game Orbit cannot detect, choose **Capture → Choose a window or display**. Expand **Capture source**, select its preview, then choose **Start capture**. Larger previews keep their positions when refreshed; new windows appear at the end. Settings and sources keep the same width when opened. Display capture includes other apps on that screen. Previews stay local and are not saved or recorded.

## Storage and troubleshooting

- Clips are local MP4 files. Orbit does not upload them or delete saved clips automatically.
- The rolling buffer is bounded to 256 MiB on disk and removed when capture stops. Higher resolutions can fill it sooner, so the available replay can be shorter than the selected length. Saving temporarily needs additional space. At least 512 MB of free space is required to start.
- An unavailable video source or encoder shows an error. Stop clipping and try another source. For unavailable audio, check the device connection and Windows microphone privacy settings; video recording continues while audio retries.
- Some exclusive-fullscreen and protected games may not support window capture. Display capture is an explicit alternative, never an automatic fallback.
- Clip trimming, export controls, configurable retention, and automatic event highlights are not part of this development build.

The [latest development validation](VALIDATION-0.3.0-dev.17.md) includes before/after images and separates fixture checks from real gameplay tests.

