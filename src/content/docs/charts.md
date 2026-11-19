---
title: How the charts are built
description: A build-time summary derived from the model, hand-drawn SVG, and no chart library at runtime.
order: 3
updated: 2026-11-19
tags: charts, svg, build
seeds: maintainer, packager
---

# How the charts are built

The charts page has no chart library. The model runs once at build time, writes a committed JSON
summary, and the page draws that summary as SVG. What ships is exactly what the model produced,
with no hydration step in between.

## The summary

`scripts/chart-data.mjs` runs `critic-model.mjs` with seed 42 and writes `src/data/charts.json`.
The summary carries three "model vs observed" series, in the shape of a clear-day residual —
a declared curve, a measured curve, and the gap:

- **Drift** — imaginary distance over ticks, with and without a decay term. The ceiling (220) is
  the declared curve; the no-decay series crosses it, the decay series saturates below it. That
  gap is the jitter-vs-tampering finding.
- **Threshold** — drift at increasing jitter magnitudes. The first magnitude whose drift crosses
  the ceiling is the demodulation threshold.
- **Bleed** — resolution and the primary metric over dose. The primary stays flat while resolution
  falls; the gap is the silent bleed.

The verdict table is the eight outcomes, and the canary is the strip/forward/fresh triple.

## Why no library

A chart library is a second copy of the numbers, and it drifts. A build-time summary plus SVG is
one copy, and the freshness gate can check it. See the [cornichon isotope](/isotopes/cornichon)
for the lifted form.
