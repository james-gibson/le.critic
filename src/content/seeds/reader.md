---
title: The reader
description: Rung 0. Whether a surface is compromised, and why — read the verdict, not the maths.
order: 1
updated: 2026-11-19
tags: seed, audience
---

# The reader

You want the answer, not the derivation. Open [the charts page](/charts) and read the verdict
table: eight rows, each `pass`, `drift`, or `violation`.

- `violation` means the defence broke on that mode — a legitimate marker got evicted, a parser
  read absence as a spoken zero, a resolution fell silently, a per-claimant ceiling failed to
  bind the sum.
- `drift` means the defence is at risk and needs a knob.
- `pass` means it held.

The curves are the evidence behind each verdict; the caption names the declared curve and the
measured one. If the two disagree, the build fails before the page does.
