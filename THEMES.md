# Orbit themes

The application is MIT licensed. Presets, theme editor, validation, and the schema can be modified without external services or a UI framework.

- `src/ui/themes.js`: 14 built-in palettes, validation, contrast helpers, and CSS variable application. The module runs in a browser or Node.js.
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
