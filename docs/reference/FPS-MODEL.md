# Hardware FPS estimates

Select **Estimate FPS** in a game's details. Orbit uses the detected CPU, GPU, and RAM. No measured FPS or manual baseline is required. The operation does not launch the game or change settings.

## Publisher-reference profiles

The curated profiles in `src/fps-references.cjs` use published resolution, graphics preset, FPS target, CPU, GPU, and RAM combinations for three games:

- [Cyberpunk 2077, Update 2.0 and later](https://support.cdprojektred.com/en/cyberpunk/pc/sp-technical/issue/1556/cyberpunk-2077-system-requirements), using non-ray-traced Low, High, and Ultra targets.
- [Ghost of Tsushima Director’s Cut](https://blog.playstation.com/2024/04/17/ghost-of-tsushima-directors-cut-pc-cross-play-and-system-requirements-revealed/), using Very Low, Medium, High, and Very High targets. The table's Low and Ultra model tiers map to Very Low and Very High in that game.
- [Assassin’s Creed Mirage](https://news.ubisoft.com/en-us/article/5HKZEQn6zdHlK4LpgfwVdp), using the published Low, High, and Ultra targets.

Sources were checked on October 19, 2026. These are publisher targets, not independent benchmarks or measurements on the user's computer. The UI identifies supported profiles, links to the source, and keeps confidence low.

For each cell, the model selects the nearest published resolution/preset. Approximate CPU and GPU weights scale the reference's frame time. GPU speed scales with exponent 0.85, CPU speed with 0.65, pixel workload with 0.9, and insufficient RAM adds a penalty. A fixed CPU fraction and a resolution/preset-sensitive render fraction prevent unlimited GPU-only scaling. Ranges widen when hardware or settings differ from the reference. A monotonicity pass prevents higher resolution or a harder quality tier from claiming higher FPS. These are modeling assumptions, not measured scaling laws.

## Other games

Other games retain clearly labeled fallback estimates based on recognized recommended hardware or a broad game-workload category. The fallback still assumes 60 FPS at 1080p High on reference hardware; no publisher FPS target is claimed for it. Its uncertainty remains wider. Unknown CPU/GPU names use conservative weights and wider ranges; missing CPU/GPU/RAM or a game with no Windows version produces no numerical estimate.

## Limits

Hardware weights remain approximate, not a benchmark dataset. Published targets may change with patches. Ray tracing, upscaling, frame generation, engine caps, laptop wattage, thermals, VR headset resolution, mods, and scene complexity can substantially change actual FPS. The fastest detected graphics adapter is assumed active. VR fallback values describe a desktop-resolution approximation, not headset performance. Preset names are model tiers and are not available in every game.

Only the requested game's store ID is used for a store lookup. Hardware and computation stay local. There are no background benchmark captures or continuous performance polling.
