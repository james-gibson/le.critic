---
title: For agents
description: The machine entry, the routes, the commands, and the invariants that decide "done".
order: 5
updated: 2026-11-19
tags: agents, contract
seeds: maintainer
---

# For agents

The machine entry is `/llms.txt` — every page, the build command, and the invariants, in one
plain-text file. Start there; do not crawl the site.

## Commands

```sh
npm ci            # no lockfile drift
npm run build     # model → summary + universe, tsc, vite, shells, guards
npm run check     # tsc --noEmit alone
npm run guard     # the publish guard, against an existing dist/
npm run smoke     # render every route; fails if one throws
```

"Done" means `npm run build` exits 0. The guard refuses a placeholder, a leaked absolute path, a
base-path mismatch, a route without its shell, a page that never reached the bundle, a charts page
that cannot state its snapshot, and a guard that was weakened.

## Invariants

- The model is `scripts/critic-model.mjs`; there is no other source of truth.
- The summary and the universe are generated, never hand-edited.
- The verdicts are a spectrum: `pass` / `drift` / `violation`, never a binary.
- Navigation, section indexes, table of contents, prev/next and counts are derived from the
  content tree. There is no nav array.
