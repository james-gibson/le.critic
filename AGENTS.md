# Agent hints

## This repository

`le.critic` is a critic: it runs the local-time FM carrier model (`scripts/critic-model.mjs`),
writes a committed summary and a local-time universe, and reports four failure modes and four
verification criteria as `pass` / `drift` / `violation`. Live:
https://james-gibson.github.io/le.critic/

## The model is the site

`scripts/critic-model.mjs` is the only source of truth for the numbers. The pages render it; the
prose in `src/content/` explains it.

- The model is **deterministic** for a seed (`mulberry32(42)` + Box–Muller). Same seed, same
  verdicts. Do not add a wall clock, network read, or filesystem dependency to the model.
- `scripts/chart-data.mjs` → `src/data/charts.json`; `scripts/universe-data.mjs` →
  `src/universes/critic.ts`. Both are generated, never hand-edited.
- A verdict is a **spectrum**: `pass` / `drift` / `violation`. Never collapse it to a boolean.
- The **freshness gate** (`scripts/freshness.mjs`) refuses a build whose charts page does not state
  its snapshot. Edit the model, then `npm run build` — do not edit the summary by hand.

## Commands

```sh
npm ci
npm run rotation -- gate   # gap, open cycle, rung: may this cycle publish?
npm run rules              # catch-up check on the vendored rules; writes nothing
npm run build              # model → summary + universe, tsc, vite, shells, guards
npm run check              # tsc --noEmit
npm run guard              # the publish guard alone
npm run smoke              # render every route
```

## Rules that are easy to break

- The summary and the universe are generated; editing `dist/` changes nothing.
- `upstream/rotations.jsonl` is append-only; never edit or renumber a line. `verify` allocates the
  id, and `abandon` closes an unclosed cycle with a reason.
- CI runs `rotation -- gate`, then `rules -- --check`, then `build`. A failure in either
  pre-build gate means nothing was regenerated or published.
- Navigation, section indexes, table of contents, prev/next and counts are derived from the content
  tree. There is no nav array.
- The isotope id is content-addressed: if `features/*.feature` changes, the page must be updated.
- `dist/404.html` is a real page, not an SPA fallback: there is no router.
