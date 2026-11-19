---
title: The critic
description: A model that synthesizes a mixed stream, demodulates it, and reports the failure modes and verification criteria as a verdict — reproducibly.
order: 1
updated: 2026-11-19
tags: critic, model, overview
seeds: reader, maintainer, packager
---

# The critic

`le.critic` is a critic. It does not audit a live surface; it runs a **model** — the
local-time FM carrier for citation isotopes — with a fixed seed, and reports what the model
finds. The report is a set of curves and verdicts, not a paragraph of opinion, and it is
reproducible: the same seed produces the same verdicts.

## What the model is

A citation is treated as an immutable event anchored at the shared coordinate **42 = 0**.
Local-time's derivation phase separates verified isotope events from background noise, the way
an FM carrier separates a signal from static. The model synthesizes a **mixed stream** of four
classes — `valid`, `jitter`, `spoofed`, `replayed` — and a demodulator classifies each event from
observables alone, never reading the ground truth.

The anchor is `42 + 0i`; cadence is `τ/16` (16 ticks per rotation). A valid chain advances phase
by the cadence every tick; jitter deviates from it; a spoofed or replayed event does not derive.
Drift is imaginary distance from the anchor, and a rung is a maximum distance (0, 60, 100, 140,
220). Exceeding the top rung evicts the caller from the routable set.

## What the critic reports

Two things, stated as data:

- **Four failure modes** — the attacks the defence must survive: jitter-vs-tampering alias,
  tri-state collapse, side-channel bleed, and sybil carrier flooding. Each is a `pass`, `drift`,
  or `violation`.
- **Four verification criteria** — the benchmark of the defence: mixed-stream separability,
  the demodulation threshold, round-trip projection fidelity, and the forced-inclusion canary.

Every one of those eight outcomes is a **spectrum**, not a flag. `violation` means the defence
broke on that mode; `drift` means it is at risk and needs a knob (a decay term, a tri-state
split, a global budget); `pass` means it held. The verdict table on [the charts page](/charts)
prints all eight, and the model curves are the evidence.

## Why reproducible matters

A critic that can be re-run and disagree with itself is a critic nobody can quote. This one is
deterministic for a seed (`mulberry32` + Box–Muller, no clock, no network). The committed summary
(`src/data/charts.json`) is generated from the model, and the freshness gate refuses a build whose
charts page does not state the snapshot it was generated from. See
[Reproducibility](/docs/reproducibility).

## Start here

- [The charts](/charts) — the curves and the verdict table, drawn from the model.
- [The universe](/universes) — the run as a local-time timeline.
- [For agents](/docs/for-agents) — the machine entry and the commands.
