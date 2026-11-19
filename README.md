# le.critic

A critic that runs the local-time FM carrier model and reports the failure modes and verification
criteria as reproducible feedback.

Live: https://james-gibson.github.io/le.critic/

Three questions, answered as things a build can check rather than as prose:

- **Is the verdict reproducible?** The model is deterministic for a seed — `mulberry32(42)` plus
  Box–Muller jitter — and the committed summary is generated from it. The freshness gate refuses a
  build whose charts page cannot state its snapshot.
- **Is a protection a spectrum, not a flag?** Eight outcomes — four failure modes, four
  verification criteria — each `pass`, `drift`, or `violation`. A verdict is a position on a
  curve, never an assurance.
- **Can the defence be benchmarked?** Three model-vs-observed charts (drift, threshold, side-channel
  bleed) plus the forced-inclusion canary triple (strip / forward / freshness), all drawn from the
  model, never authored by hand.

## Build

```sh
npm ci
npm run build    # model → summary + universe, tsc, vite, shells, guards
npm run check    # tsc --noEmit
npm run guard    # the publish guard alone
npm run smoke    # render every route
```

No data to import, no service to start: the model is the data.
