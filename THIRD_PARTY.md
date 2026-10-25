# Third-party material

Orbit's original source code is MIT licensed; see LICENSE.

- Orbit Rounded uses the unmodified Nunito variable font by the Nunito Project Authors, bundled from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/nunito). It is distributed under the SIL Open Font License 1.1; the complete notice is in `src/assets/fonts/OFL-Nunito.txt`. Font rendering makes no network requests.

- Steam and Epic Games SVG marks come from [Simple Icons](https://github.com/simple-icons/simple-icons), distributed under [CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). Brand names and trademarks belong to their owners. These assets are bundled locally; displaying them makes no network requests.
- Game artwork, achievement icons, and descriptions belong to their publishers. Orbit caches material from local clients or publisher services; example screenshots also contain publisher artwork. It is not covered by Orbit's MIT license.
- Electron and its bundled Chromium/Node components retain the licenses and notices supplied in the Windows runtime distribution (`LICENSE`, `LICENSES.chromium.html`).
- `sharp` is MIT licensed; its bundled libvips and image codec dependencies retain their own licenses. The dependency packages include their notices. See [sharp](https://github.com/lovell/sharp) and [libvips](https://github.com/libvips/libvips).
- `yaml` is ISC licensed. Its package contains the full license.
- `mediabunny` is MPL-2.0 licensed and is used unmodified for local clip encoding and MP4 muxing. Its source and license are included in the dependency package; see [Mediabunny](https://github.com/Vanilagy/mediabunny).
- Legendary is optional, separately installed software and is not bundled.

The project uses independently implemented readers for publicly described Steam/Epic/Ubisoft cache formats.

Automatic installed-app updates use electron-updater (MIT) and the Windows installer is built with electron-builder (MIT). Bundled dependency licenses are retained in the distribution.

The Windows build retains the complete Chromium notices in `resources/chromium-notices.html.gz`. Open **Settings → Manage → Third-party licenses** to read them offline. The viewer expands them temporarily and removes the temporary file when closed. `LICENSE.electron.txt` is also included with the installed app.

- The native Discord integration uses Discord Social SDK 1.10.19337. Its SDK binaries are separately licensed under the [Discord Social SDK Terms](https://support-dev.discord.com/hc/en-us/articles/30225844245271-Discord-Social-SDK-Terms), not Orbit's MIT license. Bundled component notices are in src/native/discord/Discord-LICENSE-NOTICES.txt.
- The native helper uses nlohmann/json 3.12.0 under the MIT license. The unmodified header and notice are in native/discord/vendor; the runtime distribution retains src/native/discord/JSON-LICENSE.txt.
- The Discord logo is a trademark of Discord; its display does not imply endorsement.
