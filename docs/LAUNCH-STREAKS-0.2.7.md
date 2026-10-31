# Launch streaks — 0.2.7-dev.17

Activity shows **Current streak** and **Best recorded**. Choose a game in the Activity picker for its own streaks, or open a game’s details and choose Activity. All games returns to the combined streak. Playing another game does not fill a missed day for the selected game. Hide them in Settings → Privacy → Show launch streaks. This hides the statistics without deleting history or changing recording.

A date counts after Orbit detects a supported game process. Clicking Play, a failed launch, a launcher alone, and tools do not count. Multiple starts on one local date count once. A current streak remains active when the last counted date is today or yesterday; a missed date resets Current while Best recorded remains.

Dates use the verified process start time when available. Older sessions and unavailable process start times use Orbit’s first observation. Continuing overnight or resuming the same verified process after sleep does not add a launch date. All timestamps are interpreted in the current local time zone, including after travel. Day comparisons use calendar dates rather than 24-hour increments, so daylight-saving changes do not break consecutive dates.

Streaks use retained local session history (up to 1,000 sessions and 180 days), rather than a lifetime counter. They are computed before nearby sessions are merged or the Recent sessions list is limited. Clearing session history resets them; disabling history stops new recording and retains existing history. No online tracking, reminders, rewards, new polling, or separate streak file is added.

The optional launchAt timestamp shares the existing history format and is validated on load. Existing rows remain readable without rewriting their dates. Full-process restarts, sleep and recording pauses retain the distinction between a new launch and an existing process when Windows provides its start time.

Validation and installation evidence is in the task workspace: work/LAUNCH-STREAKS-VALIDATION.md. Native Endfield launch/exit and headset checks remain separate playtests; this feature does not launch games during validation.

Game details also show Times played: a running total of plays recorded by Orbit, seeded once from saved history. It stays saved when older session rows expire, and is separate from the daily streak. It cannot recover plays from before those records. Turning off session history stops new counts; clearing history resets them. Reobserving a verified process after sleep or an Orbit restart does not add another play. When process start time is unavailable, separate observed sessions count separately.
