#!/usr/bin/env node
/**
 * Critic data.
 *
 * The critic's data is not a CSV on disk — it is the model itself, run with a
 * fixed seed. This script runs `critic-model.mjs` and writes the committed
 * summary Vite bundles and prerenders, so the charts cannot describe a different
 * run than the model produces.
 *
 * Output: src/data/charts.json
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAll } from './critic-model.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT = join(ROOT, 'src/data/charts.json')

const report = runAll(42)

const summary = {
  seed: report.seed,
  snapshot: '2026-11-19',
  anchor: report.anchor,
  cadence: Number(report.cadence.toFixed(4)),
  rungCeilings: report.rungCeilings,
  stream: report.stream,
  demodulator: report.demodulator,
  verdicts: {
    fm1: report.fm1.verdict,
    fm2: report.fm2.verdict,
    fm3: report.fm3.verdict,
    fm4: report.fm4.verdict,
    vc1: report.vc1.verdict,
    vc2: report.vc2.verdict,
    vc3: report.vc3.verdict,
    vc4: report.vc4.verdict,
  },
  // The three "model vs observed" series the charts page draws, in the shape of
  // le.critic's clear-day residual: a declared curve, the measured curve,
  // and the gap between them.
  drift: {
    ticks: report.fm1.ticks,
    weight: report.fm1.weight,
    decayRate: report.fm1.decayRate,
    ceiling: report.rungCeilings[report.rungCeilings.length - 1],
    noDecay: report.fm1.noDecay.series,
    decay: report.fm1.decay.series,
    noDecayEvictedAt: report.fm1.noDecay.evicted,
    decayEvictedAt: report.fm1.decay.evicted,
  },
  threshold: {
    ceiling: report.vc2.ceiling,
    points: report.vc2.points,
    thresholdJitter: report.vc2.thresholdJitter,
  },
  bleed: {
    doses: report.fm3.primary.length,
    primary: report.fm3.primary,
    resolution: report.fm3.resolution,
    finalResolution: report.fm3.final,
  },
  canary: report.vc4,
  numbers: {
    mixedStreamAccuracy: report.vc1.mixedStreamAccuracy,
    falseErrDisconnectedRate: report.fm2.falseErrDisconnectedRate,
    roundTripFidelity: report.vc3.roundTripFidelity,
    sybilAggregate: report.fm4.aggregate,
    sybilCeiling: report.fm4.perClaimantCeiling,
  },
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
console.log(`chart-data: ${report.stream.valid + report.stream.jitter + report.stream.spoofed + report.stream.replayed} stream events → src/data/charts.json`)
