---
title: The scan receipt
description: The exposure and protection scans as a frozen, hashed receipt — the scores, the manifest, and the gate that refuses a hand-edited number.
order: 7
updated: 2026-11-27
tags: scans, exposure, protections, receipt, snapshot
seeds: maintainer, packager
---

# The scan receipt

The [scans page](/scans) is the receipt: the exposure rubric and the protection
board, frozen and hashed so the page cannot describe a different scan than the
files it ships.

The data is three JSON files under `data/scans/`, a manifest with a SHA-256 per
file, and one derived summary.

| File | Role |
| --- | --- |
| `scripts/scan-data.mjs` | Verifies `data/scans/*` against the manifest, then writes `src/data/scans.json` |
| `src/pages/Scans.tsx` | Renders the surfaces, the protection mix, and the offence verdict |
| `data/scans/manifest.json` | One SHA-256 per vendored file, and the capture date |

`npm run build` runs the extractor before `tsc`, and `npm run scans` runs it
alone. The build stops if any vendored file does not match its recorded hash: a
hand-edited score is a claim with no receipt.

## What is plotted

- **The exposure rubric.** Eight dimensions, 0–4, equal weights, `ERI = sum/32 × 100`.
  The raw wildcard edge is 78; the stacked edge is 19 (loopback) or 25 (widened);
  the launchers are 41–44.
- **The protection board.** 63 rows, 31 enforced / 23 declared / 8 gap / 1 unknown.
  The edge is 5 enforced and 3 gap: bind, token, agreement, border and read-only
  are enforced; rate, attribution and TLS are gaps.
- **The offence half.** The flag test against the raw wildcard surface: verdict
  offense, exit 2, a flag recovered through the tool surface.

## Declared scope

One host, one moment. The rubric is ordinal with equal weights; a different
weight moves the number, not the direction. The WAN-widened row is a projection
of the same stack with the bind changed, not a live WAN measurement. The scores
measure surfaces; they do not prove the absence of a bug, and a missing fact is
`unknown`, never green. To refresh, regenerate the three files with the tools
that produced them, rewrite the manifest, and run `npm run build`.

The argument the scores support is in [the stacked defence](/guides/stacked-defence);
the sibling receipt is [the measured corpus](/docs/corpus).
