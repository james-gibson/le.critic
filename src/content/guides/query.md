---
title: Query the report
description: Read the committed summary as data — the curves, the verdicts, and the canary triple.
order: 2
updated: 2026-11-19
tags: json, analysis
seeds: maintainer, packager
---

# Query the report

The committed summary is `src/data/charts.json`, and it is plain JSON. The shape:

```json
{
  "seed": 42,
  "snapshot": "2026-11-19",
  "verdicts": { "fm1": "violation", "vc1": "pass", "..." },
  "drift": { "ceiling": 220, "noDecay": [0, 1.4, ...], "decay": [0, 1.3, ...] },
  "threshold": { "ceiling": 220, "points": [{ "jitter": 0.05, "drift": 47.9, "crossed": false }, ...] },
  "bleed": { "primary": [0.02, ...], "resolution": [1.0, 0.833, ...] },
  "canary": { "stripRefused": true, "forwardCaughtPlain": false, "forwardCaughtFresh": true }
}
```

The three curves are "model vs observed": the ceiling is the declared model, the series is the
measured run, and the gap between them is the finding. The canary triple is the forced-inclusion
result — strip is refused, a plain forward is not caught, and the freshness marker closes it.
