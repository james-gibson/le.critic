---
title: Reproducibility
description: Why the critic is deterministic for a seed, and what the freshness gate refuses.
order: 2
updated: 2026-11-19
tags: reproducible, seed, freshness
seeds: maintainer
---

# Reproducibility

The critic's whole value is that its feedback can be claimed again. "Again" only works if the
same seed produces the same report, so the model is deterministic: `mulberry32` for the stream,
Box–Muller for jitter, no wall clock, no network, no filesystem beyond the committed summary.

## What goes stale is the commit, not the data

A live surface goes stale because its data is machine-local. The critic has no machine-local data
— its data *is* the model, run with a fixed seed. So the thing that goes stale is a **commit**:
someone edits the model and forgets to regenerate the summary. Then the charts describe a
different run than the code produces.

The build closes that gap in two places:

- `scripts/chart-data.mjs` runs the model and writes `src/data/charts.json`.
- `scripts/freshness.mjs` refuses a build whose charts page does not state its snapshot.

The summary carries a `snapshot` and a `seed`; the charts page prints both; the freshness gate
checks they agree. A cached page that looks current is the exact defect this gate exists for.

## The two ports

The model exists twice, and they must stay in step:

| file | role |
| --- | --- |
| `scripts/critic-model.mjs` | the build-time model, run by the generators |
| `kb/scripts/lab/redteam/local-time-fm-purple.py` | the lab's runnable purple-team test |

They are the same maths in two languages. The seed's build only uses the `.mjs`; the Python is
the lab-side instrument that made the proxy and the magic measurable before this seed existed.

## Regenerate

```sh
npm run charts     # model → src/data/charts.json
npm run universes  # model → src/universes/critic.ts
npm run build      # both, then the guard chain
```

The guard refuses placeholders, leaked paths, a base-path mismatch, a route without a shell, a
page that never reached the bundle, and a charts page that cannot state its snapshot.
