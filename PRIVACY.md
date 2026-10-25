# Privacy

Updated October 25, 2026. Orbit is a personal game-launcher project by kokero.

## Local data

Orbit stores library information, game paths, settings, themes, and enabled session history locally. Optional features also store cached artwork/news, custom media, download history, save backups, profile links, and remembered connections. Protected account credentials are not shown in normal renderer data.

## Online requests

Account connections, artwork, news, prices, calendars, updates, and requested installer downloads contact their providers. Each service receives the information needed for the request and applies its own privacy policy. Offline mode stops new online checks; cached information may be outdated.

## Discord

**Friends** is an optional read-only connection for basic identity, accepted friends, and available presence. It requires Discord's desktop app. It does not request messages, voice, invitations, or friend-management access.

**Rich Presence** is separate and optional. In **Settings → Privacy**, control game names, elapsed time, menu activity, and background sharing. Hidden game names appear as **Playing a game**. Guest mode and disabling sharing clear the activity. Discord controls who can see activity.

## Steam controls

The optional experimental connection reads local Steam status and sends actions you choose. It opens a local debugging channel that other software on your computer could access. Quit Steam and reopen it normally to close that channel. Steam handles login, ownership checks, and game downloads; Orbit does not save your Steam password.

## Backups, exports, and capture

Backups and exports remain where you save them. Removing history does not remove exported copies.

The developer-only clipping prototype is off by default. It records after you choose a source and start it. System audio includes desktop sound; it does not record the microphone. Temporary footage is buffered locally and saved clips are not uploaded. Stopping removes the current temporary buffer; saved clips remain until you remove them.

## Your choices

Use **Settings → Privacy** for recording and data controls, account controls to disconnect, and **Settings → Manage** for backups and recovery. Disabling history does not delete existing records.

Ask questions through [GitHub issues](https://github.com/tkokero/Orbit/issues). Issues are public; never post passwords, tokens, or private files.
