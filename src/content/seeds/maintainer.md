---
title: The maintainer
description: Rung 2. Run the model, regenerate the summary, and keep the report honest.
order: 2
updated: 2026-11-21
tags: seed, maintainer
---

# The maintainer

You run the critic. The model is `scripts/critic-model.mjs`; the summary and the universe are
generated from it.

```sh
npm ci
npm run rotation -- gate
npm run rules
npm run build
```

The two pre-build gates decide whether the cycle may publish at all: a gap in the rotation ledger,
a cycle left open, or a rung of `DEGRADED` or worse refuses, and so does a vendored rule list that
is behind `le.gume`. The build then runs the model, writes `src/data/charts.json` and
`src/universes/critic.ts`, and runs the gate chain. A charts page that cannot state its snapshot
is refused — the freshness gate, the one check that exists specifically to catch a model edit that
was not regenerated.

[Run the critic](/guides/run) names every gate and the failure it prevents. Start with
[Reproducibility](/docs/reproducibility), then read [For agents](/docs/for-agents) for the
invariants.
