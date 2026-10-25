# Themes

Open **Settings → Appearance** to choose a palette, change colors or fonts, add a background, and import or export a theme. Save a custom theme to keep it; discarding a preview restores your selected theme.

## Image backgrounds

Choose a PNG, JPEG, or WebP. Use automatic accents or choose colors manually, then adjust visibility for readability. Orbit stores a compressed copy and leaves the original unchanged. Exports and preference backups include the saved copy. Animated backgrounds and SVG files are unsupported.

## Theme files

A color theme uses this JSON format:

~~~json
{
  "schemaVersion": 1,
  "name": "My palette",
  "colors": {
    "background": "#111019",
    "surface": "#1d1826",
    "text": "#f0edf9",
    "muted": "#b7aac7",
    "accent": "#c4b5fd",
    "positive": "#bbebcf",
    "warm": "#ffccaa",
    "secondary": "#a9c6f0"
  }
}
~~~

All eight colors use #RRGGBB. Names can have up to 60 characters, with up to 24 custom themes. Imports cannot supply scripts, stylesheets, or external URLs. The editor warns about poor contrast; accent-button text adapts for readability.

## Contributing a palette

Add a unique preset in src/ui/themes.js, then run npm test. Check text, buttons, focus, and reduced motion. Keep effects finite and inexpensive. See [Contributing](CONTRIBUTING.md).
