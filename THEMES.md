# Orbit themes

The application is MIT licensed. Presets, theme editor, validation, and the schema can be modified without external services or a UI framework.

- `src/ui/themes.js`: 15 built-in palettes, validation, contrast helpers, and CSS variable application. The module runs in a browser or Node.js.
- `src/ui/styles.css`: shared component styles and derived colors using CSS `color-mix()`.
- `src/ui/app.js`: theme picker, live previews, and local custom theme persistence.
- `src/main.cjs`: native JSON import/export dialogs; imports are limited to 32 KB.

## Theme file

```json
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
```

All eight colors are required and must use `#RRGGBB`. Names are limited to 60 characters. Additional fields are ignored; imported files cannot supply executable code, stylesheets, URLs, or scripts. Up to 24 custom themes are kept locally. Built-ins cannot be deleted through the editor.

Background/surface colors determine the dark or light color scheme. Text on accent buttons is chosen for contrast; the editor warns when normal text has low contrast against the background. The user's palette is otherwise preserved. Unsaved previews are restored when leaving Appearance or closing the dialog.

To add a built-in, add a `make()` entry in `themes.js` with a unique id and eight colors. Run `npm test` to check palette contrast and schema behavior. Prefer short finite motion using transforms and opacity; respect both reduced-motion preferences and the in-app motion toggle. Avoid permanent GPU layer promotion, timers, shaders, and animation libraries for themes.

## Image backgrounds

Open Settings → Appearance → Customize colors and background. Choose a still PNG, JPEG, or WebP image, then choose **Automatic from image** or **Choose manually** for the accent. Automatic accents use a representative image color adjusted for contrast against the panel. Manual mode uses the Accent color picker. Adjust image visibility to keep text readable.

Save the theme to keep the image and colors. Discard preview restores the selected theme; Remove image returns it to a color background. The original file is unchanged. Orbit stores a compressed WebP copy of at most 768 KB with dimensions bounded to 2560 × 1600. Theme exports and preference backups include that copy. Theme JSON imports are limited to 2 MB, and all saved custom themes together are limited to 3 MB. Animated images and SVG files are not supported.

Image themes also tint control surfaces and use the selected accent for primary actions and progress bars. Automatic colors are sampled once when choosing an image. Reselect the original image to replace an older, lower-resolution copy.
