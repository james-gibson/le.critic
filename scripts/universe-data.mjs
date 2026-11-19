#!/usr/bin/env node
/**
 * Critic universe.
 *
 * The critic run, expressed as a local-time `Universe`: the four failure modes
 * and four verification criteria as segments, each verdict a keyframe. Generated
 * from the model so the timeline cannot drift from the report.
 *
 * Output: src/universes/critic.ts
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAll } from './critic-model.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT = join(ROOT, 'src/universes/critic.ts')

const report = runAll(42)
const DAY_NS = 'DAY_NS'
const BIGINT_DAY_NS = '__BIGINT_DAY_NS__'
const RELEASED_DATE = '__RELEASED_DATE__'

// Timestamps are emitted as at('iso') calls so the TS module owns the BigInt
// conversion (matching energy.ts); the generator never evaluates them.
const at = (iso) => `at('${iso}')`
const RUN_START = '2026-11-19T00:00:00Z'
const RUN_END = '2026-11-27T00:00:00Z'

const verdictSignificance = {
  violation: 0.9,
  drift: 0.6,
  pass: 0.35,
}

const stations = [
  { id: 'fm1-jitter-alias', label: 'FM1 jitter-vs-tampering', verdict: report.fm1.verdict, note: 'no decay: a legit marker drifts past the ceiling' },
  { id: 'fm2-tristate', label: 'FM2 tri-state collapse', verdict: report.fm2.verdict, note: 'a naive parser reads absence as a spoken zero' },
  { id: 'fm3-sidechannel-bleed', label: 'FM3 side-channel bleed', verdict: report.fm3.verdict, note: 'resolution falls while the primary metric stays flat' },
  { id: 'fm4-sybil', label: 'FM4 sybil flood', verdict: report.fm4.verdict, note: 'a per-claimant ceiling does not bind the sum' },
  { id: 'vc1-separability', label: 'VC1 separability', verdict: report.vc1.verdict, note: `mixed-stream accuracy ${report.vc1.mixedStreamAccuracy}` },
  { id: 'vc2-threshold', label: 'VC2 threshold', verdict: report.vc2.verdict, note: `jitter crosses the floor at std ${report.vc2.thresholdJitter}` },
  { id: 'vc3-projection', label: 'VC3 projection fidelity', verdict: report.vc3.verdict, note: `back-pointer survives (${report.vc3.roundTripFidelity})` },
  { id: 'vc4-canary', label: 'VC4 forced-inclusion canary', verdict: report.vc4.verdict, note: 'strip refused; plain forward not; freshness marker closes it' },
]

const stationStart = (i) => {
  const d = new Date(Date.parse(RUN_START) + i * 86_400_000)
  return d.toISOString()
}
const stationEnd = (i) => {
  const d = new Date(Date.parse(RUN_START) + (i + 1) * 86_400_000)
  return d.toISOString()
}
const stationMid = (i) => {
  const d = new Date(Date.parse(RUN_START) + (i + 0.5) * 86_400_000)
  return d.toISOString()
}

const segments = stations.map((s, i) => ({
  id: s.id,
  start: at(stationStart(i)),
  end: at(stationEnd(i)),
  type: 'phase',
  status: 'active',
  description: `${s.label} — ${s.verdict}`,
}))

const keyframes = stations.map((s, i) => ({
  id: s.id,
  timestamp: at(stationMid(i)),
  significance: verdictSignificance[s.verdict] ?? 0.5,
  tags: [s.id.split('-')[0], s.verdict],
  type: 'milestone',
  precision: DAY_NS,
  certainty: 1,
  description: `${s.label}: ${s.note}`,
}))

// Build the object with string-valued at('…') placeholders, then turn them into
// real TS calls by rewriting `"at('…')"` -> `at('…')`.
const universe = {
  universeId: 'le_critic:fm_carrier_run:2026',
  type: 'technical_log',
  identifiers: {
    primary: 'le_critic:fm_carrier_run:2026',
    aliases: ['critic run', 'local-time FM carrier'],
  },
  realityRelation: {
    type: 'documentary',
    fictionalizationDegree: 0,
    realityAnchors: [
      {
        realEventId: 'le_critic:fm_carrier_run:2026',
        relationshipType: 'documents',
        confidence: 1,
        evidence: [
          'the critic model, run with seed 42',
          'scripts/critic-model.mjs',
          'kb/scripts/lab/redteam/local-time-fm-purple.py',
        ],
      },
    ],
  },
  attribution: {
    copyright: { holders: ['James Gibson'], year: 2026, status: 'active' },
    citations_required: false,
    usage_restrictions: [],
    sources: [
      'https://james-gibson.github.io/le.critic/data/charts.json',
      'https://github.com/james-gibson/le.critic/blob/main/scripts/critic-model.mjs',
    ],
  },
  layers: [
    {
      layerId: 'run',
      type: 'primary',
      epochs: {
        run: {
          epochId: 'run',
          start: at(RUN_START),
          end: at(RUN_END),
          precision: DAY_NS,
          description: 'The critic run: four failure modes, four verification criteria.',
        },
      },
    },
  ],
  epochs: {
    run: {
      epochId: 'run',
      start: at(RUN_START),
      end: at(RUN_END),
      precision: DAY_NS,
      description: 'The critic run: four failure modes, four verification criteria.',
    },
  },
  temporalStructure: {
    segments,
    keyframes,
    windows: { strategy: 'time_based', avgWindowSize: BIGINT_DAY_NS },
  },
  metadata: {
    canonicalName: 'le.critic — the local-time FM carrier run',
    creators: ['James Gibson'],
    released: RELEASED_DATE,
    cultural_significance: 0.1,
    seed: 42,
    anchor: report.anchor,
    cadence: Number(report.cadence.toFixed(4)),
    runDays: stations.length,
  },
}

const json = JSON.stringify(universe, null, 2)
  .replace(/"at\('([^']+)'\)"/g, "at('$1')")
  .replace(/"DAY_NS"/g, 'DAY_NS')
  .replace(/"__BIGINT_DAY_NS__"/g, '86400000000000n')
  .replace(/"__RELEASED_DATE__"/g, "new Date('2026-11-19')")

const src = `/**
 * GENERATED by scripts/universe-data.mjs — do not edit.
 *
 * The critic run as a local-time \`Universe\`: eight stations (four failure
 * modes, four verification criteria), one per day, each verdict a keyframe.
 * Timestamps are nanoseconds as BigInt, matching local-time's TemporalKeyframe.
 */
import { DAY_NS, type LocalTimeUniverse } from './types'

const at = (iso: string) => BigInt(Date.parse(iso)) * 1_000_000n

export const criticRunUniverse: LocalTimeUniverse = ${json}
`

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, src, 'utf8')
console.log(`universe-data: ${stations.length} stations → src/universes/critic.ts`)
