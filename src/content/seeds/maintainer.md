---
title: The maintainer
description: Rung 2. Run the model, regenerate the summary, and keep the report honest.
order: 2
updated: 2026-11-19
tags: seed, maintainer
---

# The maintainer

You run the critic. The model is `scripts/critic-model.mjs`; the summary and the universe are
generated from it.

```sh
npm ci
npm run build
```

The build runs the model, writes `src/data/charts.json` and `src/universes/critic.ts`, then runs
the guard chain. A charts page that cannot state its snapshot is refused — that is the freshness
gate, and it is the one check that exists specifically to catch a model edit that was not
regenerated.

Start with [Reproducibility](/docs/reproducibility), then read
[For agents](/docs/for-agents) for the invariants.
