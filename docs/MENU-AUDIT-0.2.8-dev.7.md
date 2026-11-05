# Menu review — 0.2.8-dev.7

The review covers the app, not only Desktop menus. 73 named surface cases and 117 final screenshots cover Desktop pages, Settings, popups, and representative Controller screens. Layout checks include wide windows, narrow windows at 125% renderer zoom, Orbit/Roseberry/Cloud themes, keyboard navigation and reduced motion. Renderer zoom is not a physical Windows display-scaling or multi-monitor test.

| Area | Finding and result |
| --- | --- |
| Desktop menus / Appearance Layout | Replaced the long switch stack with the chosen Live layout. The preview follows existing controls and saved choices. Narrow windows keep the switches first and offer optional Preview. |
| Smart collections | Fixed the oversized checkbox and Save button, balanced the field grid, kept actions reachable. |
| Collections / edit / pins | Made Remove a named utility action; kept confirmation and games intact. Kept Save/Cancel reachable in narrow editors. Existing pins and rule behavior retained. |
| Storage | Wrapped drive cards instead of requiring sideways scrolling. |
| Steam / Downloads | Removed duplicate empty-state headings; active-queue heading and controls still return. Existing Storage and Connection layouts retained. |
| Desktop header / More | Fixed Quick launch/Add game order after resizing. Existing saved action choices retained. |
| Release notes | Condensed accumulated development notes to five feature-level points. |
| Library / Radar / Downloads / Friends / Tools | No additional fit or horizontal-overflow failure in the checked states. Retained established page layouts. |
| Settings: General / Libraries / Appearance / Manage / About / Privacy | Reviewed all categories, Startup/Layout tabs and expanded controller/privacy content. Preserved useful status, explanations, saved themes and privacy controls. |
| Add game / Add tool | Reviewed fields, platform dropdowns, chooser actions and narrow fit. No additional confirmed defect. |
| Details / Game options / notes / artwork | Reviewed headers, expanded sections and artwork controls. Outer popup remains stable with scrollable content. |
| Launch settings / mode choices / option editor | Reviewed artwork/no-art fixtures, selection, fields and footer reachability. No real game launched. |
| Activity / Library health / uninstall prompt | Reviewed status, statistics, controls and confirmation copy. No real history, installation or game files altered. |
| Friends providers / linked profiles | Reviewed fixtures, main-profile choices and narrow controls. No live connection or authorization test. |
| News list / Quick launch / shortcuts / context menus | Reviewed empty/list states, keyboard access and popup fit. Earlier article-link/media checks remain covered by the regression suite. |
| Controller Home / Library / Settings / Downloads / shelves / wheel / launch choices | Representative fit/navigation checks passed. Home and Library layouts were retained. Physical-controller and headset checks were not repeated. |

The initial broad audit passed 259 of 260 checks and exposed the header-order regression. The fixed packaged build passes all 260, plus 15 targeted clarity checks and the other regression suites: 868 packaged checks total. Full-frame captures were also reviewed as contact sheets; screenshots with blank artwork or synthetic connection status use isolated fixtures, not the user's library or accounts.

The first draft-preview runner used the wrong Electron import and failed before completing. It was corrected, then the isolated draft checks passed (14 checks, zero shown/focused windows). This was a development-tool error, not an Orbit defect; visibility was not measured for the initial failed attempt. Final packaged suites recorded no shown/focused validation windows.

No claim is made that every possible combination is flawless. Physical display scales, headset interaction and real accounts still require their respective playtests. No major layout outside the requested Desktop menus direction was redesigned.

Design workflow: [Unslop by Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), CC BY 4.0, adapted to Orbit's established rounded typography, themes and user preferences. No generated images were used.

See [before/after examples](VALIDATION-0.2.8-dev.7.md).
