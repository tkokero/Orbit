# Code cleanup

Removed ten verified unused declarations in eight files: a filesystem import, two constants, three obsolete controller-state variables, two unused fixture reads, and two catch variable names. Their catch bodies remain. No whole files were deleted.

Kept deliberate field omissions in snapshots: removing those would expose internal work objects or send unnecessarily large payloads. Kept startup scenes, recovery paths, migrations, notices and hardware tests.

Desktop customization now skips closed controls, shares one settings snapshot and artwork scan when mounted, and avoids saves/renders for unchanged choices. NVIDIA discovery names persist locally while current preset state stays live.

Text examples: “Recording on” → “Session history on”; “Reading snapshots” → “Loading backups.” These clarify that Activity is local session history, not video recording.

[Before/after and measured operation counts](validation/0.2.8-dev.15/ui-review.md). The source audit parsed 266 JavaScript files; parser candidates were checked before removal. This is not a claim that every line was manually inspected or every theoretical optimization is complete.
