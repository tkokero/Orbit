# Contributing

Orbit is a Windows Electron app with plain JavaScript and CSS, licensed under [MIT](LICENSE).

## Run and build

Install Node.js 22.12 or newer, then run these commands in the source folder:

~~~powershell
npm ci
npm test
npm start
~~~

- npm run package creates an unpacked Windows build.
- npm run dist builds the installer and update metadata.
- npm run dev opens an isolated Orbit-Dev profile. Ctrl+Shift+D opens diagnostics.

Diagnostics and clipping experiments are unavailable in ordinary packaged builds. See [Validation](VALIDATION.md) for test guidance and the [Controller development reference](docs/reference/CONTROLLER-DEVELOPMENT.md) for implementation details.

## Making changes

Preserve settings, themes, artwork, and remembered connections. Use shared controls, simple labels, accessible focus, and reduced motion. Load artwork on demand and avoid unnecessary polling or dependencies.

Use supported provider sign-in flows. Do not read another app's private credentials, infer ownership from artwork/history, or present missing data as known. Test changes to identities, files, launches, and saved data. Use fixtures and isolated profiles; native window or authorization checks need an agreed playtest.

| Area | Source |
| --- | --- |
| Discovery and identity | src/discovery.cjs, src/catalogs.cjs, src/library.cjs |
| Windows app and IPC | src/main.cjs, src/preload.cjs |
| Interface | src/ui/ |
| Artwork | src/artwork.cjs, src/custom-artwork.cjs |
| Themes | [Theme guide](THEMES.md) |

## Windows releases

Building does not publish a release. Obtain explicit approval before publication. Increase the package version and update src/release-notes.json; never reuse a version for different update contents.

Publish the matching installer, blockmap, latest.yml, Windows ZIP, and source. Verify hashes and keep prior installers recoverable. Existing 0.x clients use the compatibility feed at v0.2.0-pre.1: preserve its address, retain the prior versioned manifest, and point the new manifest to absolute HTTPS asset URLs. Portable ZIP updates are manual. Keep credentials out of source and release files.

Include reproduction steps and the Orbit version in [bug reports](https://github.com/tkokero/Orbit/issues). Keep license and dependency notices intact.
