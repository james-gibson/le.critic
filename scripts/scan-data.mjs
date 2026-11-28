#!/usr/bin/env node
/**
 * The scan receipt.
 *
 * Like the OCD corpus, this is not a model run: it is a frozen snapshot of
 * measurements taken against real surfaces. So this script does the one job the
 * model script does not — it verifies every file against
 * `data/scans/manifest.json` before reading it. A hand-edited score is a claim
 * with no receipt, and the build stops.
 *
 * Output: src/data/scans.json
 */
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DATA = join(ROOT, 'data/scans')
const OUT = join(ROOT, 'src/data/scans.json')

const read = (name) => JSON.parse(readFileSync(join(DATA, name), 'utf8'))

const manifest = read('manifest.json')
let hash = createHash('sha256')
for (const [name, meta] of Object.entries(manifest.files).sort()) {
  const bytes = readFileSync(join(DATA, name))
  const got = createHash('sha256').update(bytes).digest('hex')
  if (got !== meta.sha256) {
    console.error(`scan-data: ${name} does not match data/scans/manifest.json`)
    process.exit(1)
  }
  hash.update(name).update(bytes)
}
const sourceHash = `sha256:${hash.digest('hex').slice(0, 16)}`

const exposure = read('exposure.json')
const protections = read('protections.json')
const offence = read('offence.json')

const summary = {
  snapshot: manifest.captured_at,
  sourceHash,
  measure: exposure.measure,
  surfaces: exposure.surfaces,
  sources: exposure.sources,
  protections: {
    measuredAt: protections.measured_at,
    catalogue: protections.catalogue,
    statuses: protections.statuses,
    edge: protections.edge,
    edgeMix: protections.edgeMix,
  },
  offence,
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
console.log(
  `scan-data: ${summary.surfaces.length} surfaces, ${protections.catalogue.rows} protection rows, offence ${offence.verdict} → src/data/scans.json (${sourceHash})`,
)
