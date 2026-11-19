---
title: Run the critic
description: Regenerate the summary and the universe from the model, and understand the two commands.
order: 1
updated: 2026-11-19
tags: model, build
seeds: maintainer
---

# Run the critic

The critic runs locally and deterministically. Two commands regenerate the committed artefacts:

```sh
npm run charts      # model → src/data/charts.json
npm run universes   # model → src/universes/critic.ts
```

`npm run build` runs both, then `tsc --noEmit`, the Vite build, prerender, and the guard chain.
There is no data to import and no service to start: the model is the data.

## The seed is the identity

`critic-model.mjs` uses `mulberry32(42)`. Change the seed and the report changes; that is a
different run, not a bug. The committed summary records which seed it was generated from, so a
report can always be re-derived from the same inputs.
