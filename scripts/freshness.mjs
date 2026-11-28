#!/usr/bin/env node
/**
 * Model freshness (the critic's "freshness", re-derived).
 *
 * The critic has no machine-local data to go stale — its data is the model,
 * run with a fixed seed. What goes stale is the *commit*: if someone edits the
 * model and does not regenerate the committed summary, the charts describe a
 * different run than the code produces. That is the defect this gate exists for.
 *
 *   --require-stamp dist   the charts page states its snapshot (a build gate)
 *
 * The build runs the stamp check. Re-deriving the report here as well would be
 * a second source of truth; instead the stamp says "generated from the model at
 * this snapshot", and `verify-publish` checks the summary's numbers are the
 * model's numbers.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const valueOf = (flag) => {
  const index = args.indexOf(flag)
  return index === -1 ? null : args[index + 1]
}

let failures = 0

// --- 1. the committed summary carries a snapshot --------------------------
const chartsPath = join('src', 'data', 'charts.json')
if (!existsSync(chartsPath)) {
  console.error('freshness: src/data/charts.json is missing — the critic has no summary to date')
  process.exit(1)
}
const charts = JSON.parse(readFileSync(chartsPath, 'utf8'))
const snapshot = charts.snapshot
if (!snapshot) {
  console.error('freshness: charts.json has no snapshot — the model version is unknowable')
  process.exit(1)
}
console.log(`freshness: snapshot ${snapshot}, seed ${charts.seed}`)

// --- 1b. the corpus summary carries its own snapshot and source hash --------
const corpusPath = join('src', 'data', 'ocd.json')
let corpusSnapshot = null
if (existsSync(corpusPath)) {
  const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'))
  corpusSnapshot = corpus.snapshot
  if (!corpusSnapshot || !corpus.sourceHash) {
    console.error('freshness: ocd.json has no snapshot or source hash — the corpus is unattributable')
    failures += 1
  } else {
    console.log(`freshness: corpus ${corpusSnapshot}, source ${corpus.sourceHash}`)
  }
} else {
  console.error('freshness: src/data/ocd.json is missing — run `npm run corpus`')
  failures += 1
}

// --- 1c. the scan receipt carries its own snapshot and source hash ---------
const scansPath = join('src', 'data', 'scans.json')
let scansSnapshot = null
if (existsSync(scansPath)) {
  const scans = JSON.parse(readFileSync(scansPath, 'utf8'))
  scansSnapshot = scans.snapshot
  if (!scansSnapshot || !scans.sourceHash) {
    console.error('freshness: scans.json has no snapshot or source hash — the receipt is unattributable')
    failures += 1
  } else {
    console.log(`freshness: scans ${scansSnapshot}, source ${scans.sourceHash}`)
  }
} else {
  console.error('freshness: src/data/scans.json is missing — run `npm run scans`')
  failures += 1
}

// --- 2. the page says what snapshot it was built from ---------------------
const dist = valueOf('--require-stamp')
if (dist) {
  const page = join(dist, 'charts', 'index.html')
  if (!existsSync(page)) {
    console.error(`freshness: ${page} is missing — build before checking the stamp`)
    failures += 1
  } else {
    const html = readFileSync(page, 'utf8')
    const states = html.includes('Snapshot') && html.includes(String(snapshot))
    if (!states) {
      console.error(
        'freshness: the charts page does not state its snapshot — a cached page that looks current is the defect this check exists for',
      )
      failures += 1
    }
  }

  const corpusPage = join(dist, 'corpus', 'index.html')
  if (!existsSync(corpusPage)) {
    console.error(`freshness: ${corpusPage} is missing — build before checking the corpus stamp`)
    failures += 1
  } else {
    const html = readFileSync(corpusPage, 'utf8')
    const states = html.includes('Snapshot') && (!corpusSnapshot || html.includes(String(corpusSnapshot)))
    if (!states) {
      console.error(
        'freshness: the corpus page does not state its snapshot — a measurement without its date is a claim',
      )
      failures += 1
    }
  }
  const scansPage = join(dist, 'scans', 'index.html')
  if (!existsSync(scansPage)) {
    console.error(`freshness: ${scansPage} is missing — build before checking the scans stamp`)
    failures += 1
  } else {
    const html = readFileSync(scansPage, 'utf8')
    const states = html.includes('Snapshot') && (!scansSnapshot || html.includes(String(scansSnapshot)))
    if (!states) {
      console.error(
        'freshness: the scans page does not state its snapshot — a score without its date is a claim',
      )
      failures += 1
    }
  }
}

if (failures) process.exit(1)
console.log('freshness: ok')
