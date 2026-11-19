/**
 * The critic model: synthesize a mixed stream, demodulate it, report.
 *
 * A JS port of `kb/scripts/lab/redteam/local-time-fm-purple.py`, so the seed's
 * build can generate its own charts and universe from the same maths. The
 * model is deterministic for a given seed (mulberry32 + Box-Muller), which is
 * what "reproducible feedback" means: same seed -> same verdicts.
 */

// A rung is a maximum imaginary distance from the 42+0i anchor; distance is the
// magnitude of the imaginary drift d. Exceeding the top ceiling evicts.
export const RUNG_TABLE = [
  [0, 'absolute-zero', 0],
  [2, 'harness', 60],
  [4, 'registry', 100],
  [6, 'mdns', 140],
  [8, 'certification', 220],
]
export const CEILING = 220
export const CADENCE = (Math.PI * 2) / 16

export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rng) {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const tickPhase = (prev, jitter = 0) => prev + CADENCE + jitter
const phaseError = (phase, expected) => {
  const d = (phase - expected + Math.PI) % (Math.PI * 2) - Math.PI
  return d
}

function synthesize(nPerClass, rng, jitterStd = 0.08) {
  const valid = []
  let phase = 0
  for (let i = 0; i < nPerClass; i += 1) {
    phase = tickPhase(phase)
    valid.push({ id: `valid-${i}`, origin: '42:valid', phase, drift: 0, cost: i + 1, kind: 'valid', backPointer: `42:42:${i}` })
  }
  const jitter = []
  phase = 0
  let drift = 0
  for (let i = 0; i < nPerClass; i += 1) {
    const jit = gauss(rng) * jitterStd
    phase = tickPhase(phase, jit)
    drift += Math.abs(jit)
    jitter.push({ id: `jitter-${i}`, origin: '42:jitter', phase, drift, cost: i + 1, kind: 'jitter', backPointer: `42:42:${i}` })
  }
  const spoofed = []
  for (let i = 0; i < nPerClass; i += 1) {
    spoofed.push({ id: `spoof-${i}`, origin: '42:spoofed', phase: rng() * Math.PI * 2 - Math.PI, drift: 80 + rng() * 160, cost: 0, kind: 'spoofed', backPointer: '' })
  }
  const replayed = []
  for (let i = 0; i < nPerClass; i += 1) {
    replayed.push({ id: `replay-${i}`, origin: '42:replayed', phase: 0, drift: 70 + i * 4, cost: 0, kind: 'replayed', backPointer: '42:42:stale' })
  }
  const out = []
  for (let i = 0; i < nPerClass; i += 1) {
    out.push(valid[i], jitter[i], spoofed[i], replayed[i])
  }
  return out
}

function demodulate(citations, cadenceWindow, driftCeiling) {
  const last = new Map()
  const classified = []
  for (const c of citations) {
    const prev = last.get(c.origin)
    const delta = prev === undefined ? 0 : Math.abs(phaseError(c.phase, prev + CADENCE))
    last.set(c.origin, c.phase)
    const lock = delta <= cadenceWindow && c.drift < driftCeiling
    classified.push([c, lock])
  }
  return classified
}

function classifyAccuracy(classified, kinds) {
  let n = 0
  let correct = 0
  for (const [c, lock] of classified) {
    if (!kinds.includes(c.kind)) continue
    n += 1
    const isotope = c.kind === 'valid' || c.kind === 'jitter'
    if ((isotope && lock) || (!isotope && !lock)) correct += 1
  }
  return n ? correct / n : 0
}

// FM1: drift accumulation with and without a decay term.
export function fm1Series(rng, ticks = 200, jitterStd = 0.3, weight = 6, decayRate = 0.05) {
  const run = (decay) => {
    let phase = 0
    let drift = 0
    const series = []
    let evicted = null
    for (let i = 0; i < ticks; i += 1) {
      const jit = gauss(rng) * jitterStd
      phase = tickPhase(phase, jit)
      drift = (drift + Math.abs(jit) * weight) * (1 - decay)
      if (drift >= CEILING && evicted === null) evicted = i
      series.push(Number(drift.toFixed(3)))
    }
    return { series, evicted, final: Number(drift.toFixed(2)) }
  }
  const noDecay = run(0)
  const decay = run(decayRate)
  return {
    ticks, weight, decayRate,
    noDecay: { series: noDecay.series, evicted: noDecay.evicted, final: noDecay.final },
    decay: { series: decay.series, evicted: decay.evicted, final: decay.final },
    verdict: noDecay.evicted !== null ? 'violation' : 'pass',
  }
}

// FM2: tri-state collapse under a naive parser.
export function fm2(rng, n = 1000, conflate = 0.35) {
  let fp = 0
  let nn = 0
  for (let i = 0; i < n; i += 1) {
    const r = rng()
    const truth = r < 0.6 ? 'NULL' : r < 0.8 ? 'NOT_NULL' : 'ZERO'
    if (truth === 'NULL' || truth === 'NOT_NULL') {
      nn += 1
      if (rng() < conflate) fp += 1
    }
  }
  const rate = fp / nn
  const verdict = rate > 0.2 ? 'violation' : rate > 0.05 ? 'drift' : 'pass'
  return { falseErrDisconnectedRate: Number(rate.toFixed(3)), verdict }
}

// FM3: side-channel bleed — resolution falls while the primary metric is flat.
export function fm3Series(doses = 30, rate = 5) {
  const primary = []
  const resolution = []
  for (let d = 1; d <= doses; d += 1) {
    const dose = rate * d
    primary.push(0.02)
    resolution.push(Number((1 / (1 + 0.05 * dose)).toFixed(4)))
  }
  const slope = (xs) => (xs[xs.length - 1] - xs[0]) / Math.max(1, xs.length - 1)
  const resSlope = slope(resolution)
  const priSlope = slope(primary)
  const bleed = resSlope < -0.001 && Math.abs(priSlope) < 1e-4
  return { primary, resolution, final: resolution[resolution.length - 1], verdict: bleed ? 'violation' : 'pass' }
}

// FM4: sybil flood — a per-claimant ceiling does not bind the sum.
export function fm4(carriers = 10, ceiling = 40) {
  const per = Math.min(ceiling, 40)
  const aggregate = carriers * per
  return { carriers, perClaimantCeiling: ceiling, aggregate, verdict: aggregate > ceiling ? 'violation' : 'pass' }
}

// VC1: mixed-stream separability.
export function vc1(rng, n = 200) {
  const citations = synthesize(Math.floor(n / 4), rng)
  const classified = demodulate(citations, 0.15, 60)
  const acc = classifyAccuracy(classified, ['valid', 'jitter', 'spoofed', 'replayed'])
  const verdict = acc > 0.9 ? 'pass' : acc > 0.7 ? 'drift' : 'violation'
  return { mixedStreamAccuracy: Number(acc.toFixed(4)), verdict }
}

// VC2: the demodulation threshold — where jitter crosses into the noise floor.
export function vc2Series(rng, ticks = 200, weight = 6, jitters = [0.05, 0.1, 0.2, 0.4]) {
  const points = []
  let threshold = null
  for (const js of jitters) {
    let phase = 0
    let drift = 0
    for (let i = 0; i < ticks; i += 1) {
      phase = tickPhase(phase, gauss(rng) * js)
      drift += Math.abs(gauss(rng) * js) * weight
    }
    const crossed = drift >= CEILING
    points.push({ jitter: js, drift: Number(drift.toFixed(2)), crossed })
    if (crossed && threshold === null) threshold = js
  }
  return { ceiling: CEILING, points, thresholdJitter: threshold, verdict: threshold !== null ? 'drift' : 'pass' }
}

// VC3: round-trip fidelity through the Projector.
export function vc3(rng, n = 200) {
  const citations = synthesize(Math.floor(n / 2), rng)
  let kept = 0
  let total = 0
  for (const c of citations) {
    if (c.kind === 'valid' || c.kind === 'jitter') {
      total += 1
      if (c.backPointer.startsWith('42:')) kept += 1
    }
  }
  const fidelity = total ? kept / total : 0
  return { roundTripFidelity: Number(fidelity.toFixed(4)), verdict: fidelity === 1 ? 'pass' : 'violation' }
}

// VC4: the forced-inclusion canary.
export function vc4() {
  const validate = (stream, requireFresh = false) => {
    const canaries = stream.filter((r) => r.id === 'canary')
    if (canaries.length === 0) return null
    if (requireFresh && !canaries.every((c) => c.fresh)) return null
    return canaries
  }
  const stream = Array.from({ length: 20 }, (_, i) => ({ id: `log-${i}`, fresh: true }))
  stream.push({ id: 'canary', fresh: true })
  const stripped = stream.filter((r) => r.id !== 'canary')
  const forwarded = [...stream.filter((r) => r.id !== 'canary'), { id: 'canary', fresh: false }]
  return {
    stripRefused: validate(stripped) === null,
    forwardCaughtPlain: validate(forwarded) === null,
    forwardCaughtFresh: validate(forwarded, true) === null,
    verdict: 'drift',
  }
}

export function runAll(seed = 42) {
  const rng = mulberry32(seed)
  const stream = synthesize(50, mulberry32(seed))
  const classified = demodulate(stream, 0.15, 60)
  const acc = classifyAccuracy(classified, ['valid', 'jitter', 'spoofed', 'replayed'])

  const fm1 = fm1Series(rng)
  const fm2r = fm2(rng)
  const fm3 = fm3Series()
  const fm4r = fm4()
  const vc1r = { mixedStreamAccuracy: Number(acc.toFixed(4)), verdict: acc > 0.9 ? 'pass' : acc > 0.7 ? 'drift' : 'violation' }
  const vc2 = vc2Series(rng)
  const vc3r = vc3(rng)
  const vc4r = vc4()

  return {
    seed,
    anchor: { real: 42, imaginary: 0 },
    cadence: CADENCE,
    rungCeilings: RUNG_TABLE.map(([, , c]) => c),
    stream: { valid: 50, jitter: 50, spoofed: 50, replayed: 50 },
    demodulator: { accuracy: vc1r.mixedStreamAccuracy, cadenceWindow: 0.15, driftCeiling: 60 },
    fm1, fm2: fm2r, fm3, fm4: fm4r,
    vc1: vc1r, vc2, vc3: vc3r, vc4: vc4r,
  }
}
