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

## The measured corpus

`/corpus` reads the other way round: not a model run but measurements of a real session store —
rework by atom, where inputs came from, what collides, what leftovers cost. The snapshot is frozen
under `data/ocd/` with a SHA-256 per file; `scripts/ocd-data.mjs` refuses a file that does not match
its manifest and writes `src/data/ocd.json`, and the freshness gate refuses a corpus page that
cannot state its snapshot.

## The scan receipt

`/scans` is the same shape for the exposure and protection scans: the eight-dimension
exposure rubric and the protection board, frozen under `data/scans/` with a SHA-256 per
file. `scripts/scan-data.mjs` verifies the files before writing `src/data/scans.json`, and
`npm run build` stops on a mismatch. The scores are the defence of the stacked isotope
design — 78 for the raw wildcard edge, 19–25 for the stacked edge, and the 5-enforced /
3-gap mix that says where it is not done.

## Build

```sh
npm ci
npm run rotation -- gate   # gap, open cycle, rung: may this cycle publish?
npm run rules              # catch-up check on the vendored rules; writes nothing
npm run build              # model → summary + universe + corpus, tsc, vite, shells, gates
npm run corpus             # regenerate src/data/ocd.json from data/ocd/
npm run check              # tsc --noEmit
npm run guard              # the publish guard alone
npm run smoke              # render every route
```

No service to start: the critic's data is the model, and the corpus is a frozen snapshot with a
receipt. The build fails closed: a leaked path, a credential-shaped string, a source map, a dead
internal link, a snapshot the charts or corpus page cannot state, a vendored file that disagrees
with its hash, or a rotation record that disagrees with the ledger stops the artifact before it is
published. [Run the critic](https://james-gibson.github.io/le.critic/guides/run) names every gate
and the failure it prevents.
