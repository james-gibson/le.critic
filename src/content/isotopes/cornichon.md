---
title: Cornichon — a chart that is a file, not a library
description: A committed summary derived from the model, and an SVG drawn at build time, so the page has no chart runtime and no second copy of the numbers.
order: 3
updated: 2026-11-19
slots: metric, window
presumes: node-22, json, svg, no-chart-library
tags: isotope, charts, build
---

# Cornichon — a chart that is a file, not a library

Cornichon is a chart derived from a committed summary and drawn as SVG, with no chart library at
runtime. The summary is one copy of the numbers; the SVG is the rendering of it.

The recipe, in three parts:

1. **A generator.** `scripts/chart-data.mjs` runs the model and writes `src/data/charts.json`.
2. **A summary shape.** The JSON carries the series the page draws — drift, threshold, bleed, and
   the canary triple.
3. **A hand-drawn SVG.** `src/pages/Charts.tsx` maps the summary to marks; the freshness gate
   checks the page states its snapshot.

Why no library: a chart library is a second copy of the numbers, and it drifts. A summary plus
SVG is one copy, checkable by the guard. See [How the charts are built](/docs/charts).
