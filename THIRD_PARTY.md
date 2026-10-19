# Third-party material

Orbit's original source code is MIT licensed; see LICENSE.

- Steam and Epic Games SVG marks come from [Simple Icons](https://github.com/simple-icons/simple-icons), distributed under [CC0-1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). Brand names and trademarks belong to their owners. These assets are bundled locally; displaying them makes no network requests.
- Game artwork, achievement icons, and descriptions belong to the respective publishers. These are discovered from local clients or retrieved from their asset services and cached in the user's app profile. They are not included in the source archive or covered by Orbit's MIT license.
- Electron and its bundled Chromium/Node components retain the licenses and notices supplied in the Windows runtime distribution (`LICENSE`, `LICENSES.chromium.html`).
- `sharp` is MIT licensed; its bundled libvips and image codec dependencies retain their own licenses. The dependency packages include their notices. See [sharp](https://github.com/lovell/sharp) and [libvips](https://github.com/libvips/libvips).
- `yaml` is ISC licensed. Its package contains the full license.
- Legendary is optional, separately installed software and is not bundled.

The project uses independently implemented readers for publicly described Steam/Epic/Ubisoft cache formats. Reference links are in README.md.

Automatic installed-app updates use electron-updater (MIT) and the Windows installer is built with electron-builder (MIT). Bundled dependency licenses are retained in the distribution.
