# Recording modes for Orbit

Research checked November 8, 2026. Applied in 0.3.0-dev.12 as described below. This is an unpublished development build.

## What Medal documents

- Game detection starts a replay buffer; a shortcut saves recent gameplay. Closing the game stops its recording. See [recording clips](https://support.medal.tv/support/solutions/articles/48001157618).
- Full-session mode saves the whole game session. Shortcuts can mark moments for later clipping. Desktop recording is a separate choice. See [recording modes](https://support.medal.tv/support/solutions/articles/48001157616-how-to-choose-your-recording-method).
- Quality settings include resolution, frame rate, bitrate, GPU/CPU encoding and codec. See [quality settings](https://support.medal.tv/support/solutions/articles/48001159618-video-quality-settings-guide).
- One documented auto-highlight integration receives game events through a local HTTP API, including before/after timing. It requires Medal running, a game/event registered with Medal and player-enabled events. This is an integration with Medal, not a standalone recorder we can drop into Orbit. It does not explain every detection mechanism Medal uses. See [developer quickstart](https://medal.tv/portal/docs/auto-clipping) and [event API](https://medal.tv/portal/docs/auto-clipping/api).

The reviewed documentation does not expose Medal's complete recorder or server backend. It does not establish its exact capture API, buffering implementation, threading, anti-cheat compatibility or resource cost. Reproduce useful behavior with Orbit's own code; do not present an inferred architecture as Medal's implementation.

## What Orbit already does

The current development build has game-aware capture after **Enable game clipping**, F8 replay saving, automatic stop/wait between games, manual window/display selection, game labels, local MP4 playback, configurable quality, selectable PC audio and optional microphone capture.

Its video helper uses Electron display capture, MediaBunny/WebCodecs H.264 encoding with hardware preference, a keyframe-aware disk buffer capped at 256 MiB, and packet remuxing when saving. Audio comes from the existing native Windows helper and saves as one mixed track. Hardware preference is not proof that a particular GPU encoder was selected. Capture remains off after restarting unless the user explicitly opts in to detected-game arming.

These observations come from `clips.cjs`, `clips-buffer.cjs`, `clips-worker.cjs`, `capture/engine.mjs`, `capture/quality.mjs` and `clips-audio.cjs` in this source tree. They are not claims about Medal.

## Implemented recording choices

Use one **Recording mode** choice in Clips, keeping detailed controls in Capture settings:

| Mode | Behavior | Current status |
| --- | --- | --- |
| Off | No recording or replay buffer | Implemented |
| Game clips | Detect a game, buffer recent gameplay, save with F8, stop when it closes | Implemented with current-session enabling and optional saved startup arming |
| Full sessions | Save from game start to exit; add bookmarks during play | Implemented with bookmarks, limits and retained interrupted files; real-game playtest pending |
| Manual source | Choose a window or display explicitly | Implemented |

A separate, saved **Enable game clipping when Orbit starts** toggle is off by default. It arms detected-game capture only; it never selects a desktop source automatically. Keep an immediate Stop action and the emergency shortcut. Changing recording mode must not start a second recorder or discard unsaved work.

Per-game exclusions and overrides belong beside the selected game. Automatic event highlights should remain separate from game detection: recognizing a running game does not identify kills, wins or match boundaries.

## Implementation and remaining work

1. Implemented: explicit opt-in arming, exact per-game exclusions and replay/session overrides. Existing verified-window and process-start checks remain in place. Hidden fixtures do not prove every game is detected correctly.
2. Implemented: session and library limits, free-space checks, serialized file writes and five-second metadata checkpoints. No automatic deletion. A forced-interruption fixture retained readable MP4 fragments; arbitrary crash repair is not guaranteed.
3. Implemented: fragmented full-session MP4 writing, F8 bookmarks, game-exit finalization and bookmark navigation. Separate-file interval export and trimming remain planned.
4. Measure the current recorder with the same game scene, resolution, frame rate, audio routes and whole-process scope before choosing a native-video rewrite.
5. If measurements justify it, prototype a Windows video helper using [Windows Graphics Capture](https://learn.microsoft.com/en-us/windows/uwp/audio-video-camera/screen-capture), Direct3D surfaces and an available [hardware encoder](https://learn.microsoft.com/en-us/windows/win32/medfound/hardware-mfts). [NVENC](https://docs.nvidia.com/video-technologies/video-codec-sdk/13.1/nvenc-video-encoder-api-prog-guide/index.html) is an NVIDIA-specific option, not a cross-vendor default. Reuse the working audio routes and timestamp handling. This is a proposed Orbit design, not a verified description of Medal.
6. Add event integrations only where a supported signal exists. Do not claim universal automatic highlights or anti-cheat compatibility.

No Medal binaries, private endpoints, credentials or user recordings were inspected. The implementation was tested with synthetic video/audio and isolated UI fixtures. It did not enable live recording or establish any performance improvement.
