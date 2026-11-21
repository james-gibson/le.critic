# le.critic

A critic that runs the local-time FM carrier model and reports the failure modes and verification
criteria as reproducible feedback.

Live: https://james-gibson.github.io/le.critic/

Four questions, answered as things a build can check rather than as prose:

- **Is the verdict reproducible?** The model is deterministic for a seed — `mulberry32(42)` plus
  Box–Muller jitter — and the committed summary is generated from it. The freshness gate refuses a
  build whose charts page cannot state its snapshot.
- **Is a protection a spectrum, not a flag?** Eight outcomes — four failure modes, four
  verification criteria — each `pass`, `drift`, or `violation`. A verdict is a position on a
  curve, never an assurance.
- **Can the defence be benchmarked?** Three model-vs-observed charts (drift, threshold, side-channel
  bleed) plus the forced-inclusion canary triple (strip / forward / freshness), all drawn from the
  model, never authored by hand.
- **Is the update itself a claim?** A publish is a rotation: an append-only ledger, contiguous ids
  allocated only when the line lands, and a gate that refuses a gap, an unclosed cycle, or a rung
  of `DEGRADED` — with `npm run rules` refusing a rule list the seed has outgrown.

## Build

```sh
npm ci
npm run rotation -- gate   # gap, open cycle, rung: may this cycle publish?
npm run rules              # catch-up check on the vendored rules; writes nothing
npm run build              # model → summary + universe, tsc, vite, shells, gates
npm run check              # tsc --noEmit
npm run guard              # the publish guard alone
npm run smoke              # render every route
```

No data to import, no service to start: the model is the data. The build fails closed: a leaked
path, a credential-shaped string, a source map, a dead internal link, a snapshot the charts page
cannot state, or a rotation record that disagrees with the ledger stops the artifact before it is
published. [Run the critic](https://james-gibson.github.io/le.critic/guides/run) names every gate
and the failure it prevents.
