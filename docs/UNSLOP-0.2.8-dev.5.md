# Desktop Settings and Friends polish

This was a small polish pass on the existing interface, using [Unslop by Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop/tree/main/skills/unslop), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The workflow was adapted to Orbit's saved themes, rounded typography, and existing layouts. No generated images were used.

## Direction

- Product: a daily Windows library for finding and launching games.
- Character: rounded, calm, playful.
- World: a personal game shelf, with the user's chosen theme.
- Moments: game artwork and friend avatars carry the detail.
- Signature: Orbit's ring mark, with consistent rounded controls.

## What the audit found

- Expanded Friends profile buttons extended outside their card. Their fixed height also clipped long names and status text.
- Refresh replaced the cards, closed expanded Profiles, and lost keyboard focus.
- Settings disclosure rows used competing filled frames and inconsistent spacing.
- Friends repeated “Main profile” beside the provider name and placed refresh metadata too close to the card edge.
- The profile-link manager used decorative initial bubbles where provider symbols were more useful.
- Hover translated whole cards even though these cards contain several independent controls.

## Nine passes

| Pass | Change |
| --- | --- |
| Spacing | Use 24px Settings group spacing and 12/16px internal gaps. Leave a 24px gap before the Friends footer. |
| Color | Use existing theme variables. Remove disclosure fills and the outer Accounts box; keep selected and focus states. |
| Icons | Keep one trailing disclosure arrow. Use actual Steam/Discord symbols in linked profiles. |
| Copy | Remove the repeated main-profile label. Explain briefly that saved menu layouts exclude individual game/news choices. |
| Type | Retain Nunito and expressive headings. Use quieter setting labels; let long profile names wrap. |
| Layout | Keep existing sections. Give secondary profile rows natural height and full card width, with separate logo/text/arrow columns. |
| Details | Preserve expanded Profiles and the focused control when refreshing. Keep settings utilities and primary actions separate. |
| Visuals | Retain the existing artwork and avatar system. No new decorative hero, generated art, or startup changes. |
| Motion | Remove card translation and hover glow. Keep short surface transitions and respect reduced motion. |

Orbit's explicit preferences take priority over generic skill defaults: the user's palette, rounded shapes, larger readable controls, and established major layouts remain. Desktop styles do not apply in Controller mode.

See the [before/after examples and validation](VALIDATION-0.2.8-dev.5.md). This pass makes no CPU, RAM, GPU, or startup speed claim.
