#!/usr/bin/env node
/**
 * The OCD corpus.
 *
 * Unlike the critic's own charts, this data is not a model run — it is a frozen
 * snapshot of measurements taken from the session store and the repos. So this
 * script does one job the model script does not: it verifies every file against
 * `data/ocd/manifest.json` before reading it. A hand-edited snapshot is a claim
 * with no receipt, and the build stops.
 *
 * Output: src/data/ocd.json
 */
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DATA = join(ROOT, 'data/ocd')
const OUT = join(ROOT, 'src/data/ocd.json')

const read = (name) => JSON.parse(readFileSync(join(DATA, name), 'utf8'))

const manifest = read('manifest.json')
let hash = createHash('sha256')
for (const [name, meta] of Object.entries(manifest.files).sort()) {
  const bytes = readFileSync(join(DATA, name))
  const got = createHash('sha256').update(bytes).digest('hex')
  if (got !== meta.sha256) {
    console.error(`ocd-data: ${name} does not match data/ocd/manifest.json`)
    process.exit(1)
  }
  hash.update(name).update(bytes)
}
const sourceHash = `sha256:${hash.digest('hex').slice(0, 16)}`

const backtracks = read('backtracks.json')
const causes = read('causes.json')
const inputs = read('inputs.json')
const overlap = read('overlap.json')
const locks = read('locks.json')
const worktrees = read('worktrees.json')
const prior = read('prior.json')

const topAtoms = Object.entries(backtracks.by_atom)
  .filter(([, row]) => row.per_100_calls !== null && row.backtracks >= 3)
  .sort((a, b) => b[1].per_100_calls - a[1].per_100_calls)
  .slice(0, 8)
  .map(([atom, row]) => ({
    atom,
    rate: row.per_100_calls,
    backtracks: row.backtracks,
    calls: row.calls,
    pricing: row.pricing,
  }))

const causeRows = Object.entries(causes.by_cause)
  .filter(([name]) => name !== 'unclassified')
  .map(([cause, events]) => ({
    cause,
    label: causes.labels[cause] ?? cause,
    events,
    share: events / causes.total,
  }))

const provenance = ['named', 'search', 'tool', 'infer'].map((name) => ({
  name,
  touches: prior.provenance[name].touches,
  share: prior.provenance[name].share,
  fail: prior.provenance[name].fail_rate,
}))

const summary = {
  snapshot: manifest.captured_at,
  sourceHash,
  window: backtracks.window,
  sessions: backtracks.sessions,
  toolCalls: backtracks.tool_calls,
  backtracks: {
    total: backtracks.backtracks,
    byKind: backtracks.by_kind,
    narrated: backtracks.narrated_share,
    sessions: backtracks.sessions_with_backtrack,
    atoms: topAtoms,
  },
  causes: causeRows,
  baseDamage: {
    events: causes.base_damage.events,
    share: causes.base_damage.share,
    repeatedShare: causes.structural.repeated_share,
    crossTarget: causes.structural.cross_target_share,
    restructure: causes.structural.restructure_share,
  },
  inputs: {
    touches: inputs.first_touches,
    discovered: inputs.discovered,
    parameter: inputs.parameter,
    research: inputs.research,
    classes: provenance,
    lift: inputs.similarity.lift,
  },
  overlap: {
    timeOnly: overlap.time_only.map((row) => ({ factor: row.factor, collisions: row.collisions })),
    coStart: overlap.co_start_all,
    sharedPairs: overlap.shared_target_pairs,
    deps: {
      episodes: overlap.deps.episodes,
      events: overlap.deps.events,
      collisions: overlap.deps.dep_vs_dep_collisions,
      collisionsPerEvent: overlap.deps.collisions_per_event,
    },
  },
  locks: {
    manifest: { pairs: locks.manifest.pairs, ident: locks.manifest.ident_overlap_pairs },
    lock: { pairs: locks.lock.pairs, ident: locks.lock.ident_overlap_pairs },
    repeatShare: locks.sequence_repeat_share,
  },
  worktrees: {
    present: worktrees.present,
    dead: worktrees.dead,
    classes: worktrees.classes,
    sizeGb: worktrees.size_gb,
    tracked: worktrees.tracked_files,
    docsTokens: worktrees.docs_tokens,
    visitor: {
      sessions: worktrees.burn.visitor_sessions,
      tokensRead: Math.round(worktrees.burn.visitor_chars / 4),
      sessionTokens: worktrees.burn.visitor_tokens,
      cost: worktrees.burn.visitor_cost,
    },
  },
  prior: {
    classes: provenance,
    synapse: {
      sessions: prior.synapse.sessions,
      sessionShare: prior.synapse.session_share,
      structureShare: prior.synapse.structure_share_of_synapse,
      firstShare: prior.synapse.synapse_first_share,
      searchWith: prior.synapse.searches_per_100_calls_with,
    },
  },
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
console.log(
  `ocd-data: ${backtracks.sessions} sessions, ${backtracks.backtracks} backtracks, ${topAtoms.length} atoms → src/data/ocd.json (${sourceHash})`,
)
