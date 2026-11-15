# Updating Orbit

Open **Settings → Manage → Check for updates**. Available updates download in the background; restart when ready. Keep Orbit open long enough for a download to finish on a slow connection.

## “Install Orbit once to enable automatic updates”

Orbit could not enable its updater. This message appears before it checks the internet.

The published **0.2.6 Windows installer omitted its updater configuration**. The 0.2.7 and 0.2.8 installers include it. A portable or incomplete copy can also lack update support.

1. Download **Orbit-Setup.exe** from [GitHub Releases](https://github.com/tkokero/Orbit/releases).
2. Run it over the existing installation. No uninstall or removal of Orbit's data folder is needed.
3. Reopen Orbit and check **Settings → Manage** again.

Use the installer for automatic updates, rather than the source ZIP or an extracted app folder. An affected older copy needs this one-time manual update because its updater cannot start.

If the button is enabled but a download fails, retry when the connection is stable. That is a different failure from the disabled-button message. Include the version and exact message when reporting it.
