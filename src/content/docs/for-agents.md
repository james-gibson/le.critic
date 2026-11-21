---
title: For agents
description: The machine entry, the routes, the commands, and the invariants that decide "done".
order: 5
updated: 2026-11-21
tags: agents, contract
seeds: maintainer
---

# For agents

The machine entry is `/llms.txt` — every page, the build command, and the invariants, in one
plain-text file. Start there; do not crawl the site.

## Commands

```sh
npm ci                       # no lockfile drift
npm run rotation -- gate     # may this cycle publish? gap, open cycle, rung
npm run rules                # catch-up check on the vendored rules; writes nothing
npm run build                # model + universe, tsc, vite, shells, gates
npm run check                # tsc --noEmit alone
npm run guard                # the publish guard, against an existing dist/
npm run smoke                # render every route; fails if one throws
```

"Done" means the two pre-build gates pass and `npm run build` exits 0. The chain refuses a
placeholder, a leaked path or credential, a source map, a base-path mismatch, a route without its
shell, a dead internal link, a page missing from `llms.txt`, a charts page that cannot state its
snapshot, and a rotation record that disagrees with the ledger. [Run the critic](/guides/run) names
each gate and the failure it prevents.

## Invariants

- The model is `scripts/critic-model.mjs`; there is no other source of truth.
- The summary and the universe are generated, never hand-edited.
- The verdicts are a spectrum: `pass` / `drift` / `violation`, never a binary.
- The rotation ledger (`upstream/rotations.jsonl`) is append-only, and an id is allocated only
  when the line lands.
- Navigation, section indexes, table of contents, prev/next and counts are derived from the
  content tree. There is no nav array.
