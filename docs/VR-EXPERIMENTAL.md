# Orbit in VR — experimental

Optional in **Orbit 0.2.7**. Requires SteamVR and opens only when requested. Headset tuning and performance testing are ongoing.

## Open and close

Start SteamVR, then choose **More → VR → Open Orbit in VR**. Pin VR to Orbit’s sidebar for quicker access. The Orbit SteamVR dashboard has your library, friends, downloads and VR tools. **Stop overlay** closes Orbit’s companion while leaving SteamVR and your game running.

## Wrist display

Choose **Watch** or **Toolbar**, and the left or right hand. Both use your theme. The display is mounted beside the controller, facing inward, and appears when your headset faces it. This uses headset direction, not eye tracking. No pointing-to-arm step is needed. Physical fit and gaze thresholds still need headset feedback.

The toolbar has time, FPS/GPU readings, media keys, live screen thumbnails and Orbit access. **Tools** expands performance/device shortcuts, screen size, recenter, keyboard, hide and close. Select a thumbnail to float that screen above the wrist; select it again to restore its placement. **Interact / Done** enables or releases pointer interaction outside the SteamVR dashboard.

## Screens

Add up to four windows or displays from live previews. Each has a bottom strip:

- Hold the trigger on **Move**, move that controller, then release.
- Hold **Resize** and move the controller sideways to change width.
- **Hide** puts that screen away; its wrist thumbnail can restore it.
- **Close** releases the screen and its capture resources.

The new controller-grab paths pass geometry/fixture checks; actual controller feel has not been playtested. Dragging pins the screen in the room. Size/opacity/curvature and anchor controls remain in VR tools. Named layouts save placement, never source identities or control permission.

Window control starts off and requires confirmation in panel settings. Confirmed windows support click, hover, scroll and keyboard input. Hover does not bring other apps forward. Displays remain view-only. Windows may block elevated, minimized, changed or obscured targets. Screen tools never send their clicks into the captured app.

## Performance and other tools

Performance separates submitted game FPS from headset refresh rate, with CPU/GPU frame times, reprojection and dropped frames. These counters have not been compared against fpsVR in a headset. Devices shows tracking/battery readings where supported. Room adjustments require confirmation and retain an Undo record; Orbit refuses to overwrite changes made by another tool.

The menu uses 1536×960 pixels, capture textures 1920×1200, and the wrist 1024×512. Source proportions are retained. Menu painting is capped at 30 FPS, wrist at 24, with a 24 FPS total capture budget shared between screens. Frames use persistent D3D11 textures and bounded latest-frame queues. Commands take priority over waiting frames, while each screen gets a turn. Hidden surfaces stop painting; closed captures release streams. Previews stay local and are never recorded.

This remains an experiment, not feature parity with OVR Toolkit, fpsVR or OVR Advanced Settings. Headset management, audio-device switching, motion-reprojection policy and clipping are outside this build. Real headset latency, pointer alignment, controller grabbing, readability and multi-panel GPU cost still need testing.

## Validation

Unit tests stay offline. The explicit hidden VR fixture checks the actual helper using synthetic frames; it does not initialize SteamVR, capture your screens, send Windows input or change room calibration. A separate software-graphics check verifies exact texture readback. Detailed candidate status is in [release validation](RELEASE-CANDIDATE-0.2.7.md).
