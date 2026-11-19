---
title: The packager
description: Rung 4. Lift the critic — the model, not the page — into another system.
order: 3
updated: 2026-11-19
tags: seed, packager
---

# The packager

You want the critic as a dependency, not a website. The model is the thing to lift, and it is
deliberately dependency-free: `scripts/critic-model.mjs` is plain ES modules, no React, no Vite,
no chart library.

The two isotopes are the lifted forms:

- [Silverskin](/isotopes/silverskin) — a documentation site that ships itself.
- [Cornichon](/isotopes/cornichon) — a chart that is a file, not a library.

A model, once lifted, is an isotope: a named procedure with slots. The critic's slots are the
metric and the window. See [What an isotope is](/isotopes/what-is-an-isotope) for the contract.
