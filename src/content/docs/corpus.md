---
title: The measured corpus
description: A frozen, hashed snapshot of one machine's agent sessions — rework, inputs, collisions, leftovers — drawn as SVG from a checked summary.
order: 6
updated: 2026-11-24
tags: corpus, measurements, charts, snapshot
seeds: maintainer, packager
---

# The measured corpus

The critic's own charts are a model run with a fixed seed. The corpus charts are the
opposite: observations of a real session store, frozen and hashed so the page cannot
describe a different week than the files it ships.

The page is `/corpus`. The data is six JSON files under `data/ocd/`, a manifest with
a SHA-256 per file, and one derived summary.

## The two files

| File | Role |
| --- | --- |
| `scripts/ocd-data.mjs` | Verifies `data/ocd/*` against the manifest, then writes `src/data/ocd.json` |
| `src/pages/Corpus.tsx` | Renders six SVG figures from that summary |

`npm run build` runs the extractor before `tsc`, and `npm run corpus` runs it alone.
The build stops if any vendored file does not match its recorded hash: a hand-edited
snapshot is a claim with no receipt.

## What is plotted

- **Rework by atom.** Backtracks per 100 calls of each atom. Creating a file and then
  correcting it is the commonest self-correction — which is what a draft is.
- **What the correction was repairing.** Cause read from the agent's own words, so
  every bar is a lower bound; 43% of corrections are too terse to classify and are
  omitted rather than guessed.
- **Where the input came from.** Named in the prompt, surfaced by a search, surfaced
  by another tool, or inferred. Half the corpus is inferred, and its read failure rate
  is 2.7% against 0.3% for a searched path.
- **Conflicts need a shared target.** Sixteen-fold time compression produces ten
  collisions; co-starting forty session pairs that already share a file produces
  ninety-seven. Overlap in time is not overlap in files.
- **The manifest is quiet; the lock is not.** Independent chained dependency updates
  share a package field in 86% of lock pairs and 0% of manifest pairs.
- **What the next agent pays for leftovers.** Worktrees by class, and the visitor
  burn: tokens read inside a worktree the session did not own, and the session
  context that carried them.

## Declared scope

One machine, one store, one window — 240 sessions between 2026-10-08 and 2026-11-24.
Cause is read from prose. Collisions are a counterfactual placement and no merge was
run. Tokens are characters over four, except the session totals, which are exact. The
snapshot is a receipt, not a live view; regenerate it with the tools that produced it
(`ocd-rework`, `ocd-causes`, `ocd-inputs`, `ocd-smush`, `ocd-locks`, `ocd-context`)
and copy the JSON in again.
