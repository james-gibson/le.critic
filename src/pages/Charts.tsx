import type { ReactNode } from 'react'
import { usePageMeta } from '../lib/usePageMeta'
import charts from '../data/charts.json'

const W = 860
const H = 300
const PAD = { l: 54, r: 18, t: 18, b: 34 }
const IW = W - PAD.l - PAD.r
const IH = H - PAD.t - PAD.b

type Verdict = 'pass' | 'drift' | 'violation'
type ThresholdPoint = { jitter: number; drift: number; crossed: boolean }

const y = (value: number, min: number, max: number) =>
  PAD.t + (1 - (value - min) / (max - min)) * IH
const x = (index: number, count: number) =>
  count <= 1 ? PAD.l + IW / 2 : PAD.l + (index / (count - 1)) * IW
const path = (points: Array<[number, number]>) =>
  points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ')

function Figure({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <figcaption>
        <h2 className="text-lg font-semibold tracking-tight text-body">{title}</h2>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </figcaption>
      <div className="mt-5 text-series-1">{children}</div>
    </figure>
  )
}

function Grid({ min, max, ticks }: { min: number; max: number; ticks: number[] }) {
  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(tick, min, max)}
            y2={y(tick, min, max)}
            className="text-line"
            stroke="currentColor"
            strokeDasharray="3 5"
            strokeWidth={1}
          />
          <text
            x={PAD.l - 9}
            y={y(tick, min, max)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-current text-[10px] text-muted"
          >
            {tick.toFixed(tick % 1 === 0 ? 0 : 1)}
          </text>
        </g>
      ))}
    </g>
  )
}

function Drift() {
  const { ceiling, noDecay, decay } = charts.drift
  const max = Math.max(ceiling, ...noDecay, ...decay)
  const ticks = [0, ceiling, max]
  const line = (series: number[]) =>
    series.map<[number, number]>((v, i) => [x(i, series.length), y(v, 0, max)])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Drift over ticks">
      <title>Imaginary drift over ticks, with and without a decay term</title>
      <Grid min={0} max={max} ticks={ticks} />
      <line
        x1={PAD.l}
        x2={W - PAD.r}
        y1={y(ceiling, 0, max)}
        y2={y(ceiling, 0, max)}
        className="text-series-1"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path d={path(line(noDecay))} className="text-series-2" fill="none" stroke="currentColor" strokeWidth={2} />
      <path d={path(line(decay))} className="text-series-1" fill="none" stroke="currentColor" strokeDasharray="6 4" strokeWidth={2} />
      <g className="fill-current text-[10px]">
        <text x={PAD.l + IW - 118} y={PAD.t + 2} className="fill-current text-secondary">
          no decay (crosses ceiling)
        </text>
        <text x={PAD.l + IW - 118} y={PAD.t + 16} className="fill-current text-accent">
          decay (saturates)
        </text>
      </g>
      <g className="fill-current text-[10px] text-muted">
        <text x={PAD.l} y={H - 12}>tick 0</text>
        <text x={W - PAD.r} y={H - 12} textAnchor="end">tick {charts.drift.ticks}</text>
      </g>
    </svg>
  )
}

function Threshold() {
  const { ceiling, points } = charts.threshold
  const jitters = (points as ThresholdPoint[]).map((p) => p.jitter)
  const drifts = (points as ThresholdPoint[]).map((p) => p.drift)
  const max = Math.max(ceiling, ...drifts)
  const px = (jitter: number) => PAD.l + (jitter / Math.max(...jitters, 0.0001)) * IW
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Demodulation threshold">
      <title>Drift against jitter magnitude, with the ceiling</title>
      <Grid min={0} max={max} ticks={[0, ceiling, max]} />
      <line
        x1={PAD.l}
        x2={W - PAD.r}
        y1={y(ceiling, 0, max)}
        y2={y(ceiling, 0, max)}
        className="text-series-1"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {(points as ThresholdPoint[]).map((point) => (
        <circle
          key={point.jitter}
          cx={px(point.jitter)}
          cy={y(point.drift, 0, max)}
          r={3}
          fill="currentColor"
          className={point.crossed ? 'text-series-2' : 'text-series-1'}
        >
          <title>{`jitter ${point.jitter}: drift ${point.drift}${point.crossed ? ' (crossed)' : ''}`}</title>
        </circle>
      ))}
      <g className="fill-current text-[10px] text-muted">
        <text x={PAD.l} y={H - 12}>jitter 0</text>
        <text x={W - PAD.r} y={H - 12} textAnchor="end">
          jitter {Math.max(...jitters)}
        </text>
      </g>
    </svg>
  )
}

function Bleed() {
  const { primary, resolution } = charts.bleed
  const max = Math.max(1, ...resolution)
  const line = (series: number[]) =>
    series.map<[number, number]>((v, i) => [x(i, series.length), y(v, 0, max)])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Side-channel bleed">
      <title>Resolution and the primary metric over dose</title>
      <Grid min={0} max={max} ticks={[0, max / 2, max]} />
      <path d={path(line(primary))} className="text-series-1" fill="none" stroke="currentColor" strokeWidth={2} />
      <path d={path(line(resolution))} className="text-series-2" fill="none" stroke="currentColor" strokeDasharray="6 4" strokeWidth={2} />
      <g className="fill-current text-[10px]">
        <text x={PAD.l + IW - 118} y={PAD.t + 2} className="fill-current text-accent">
          primary (flat)
        </text>
        <text x={PAD.l + IW - 118} y={PAD.t + 16} className="fill-current text-secondary">
          resolution (falls)
        </text>
      </g>
      <g className="fill-current text-[10px] text-muted">
        <text x={PAD.l} y={H - 12}>dose 1</text>
        <text x={W - PAD.r} y={H - 12} textAnchor="end">dose {charts.bleed.doses}</text>
      </g>
    </svg>
  )
}

function VerdictTable() {
  const v = charts.verdicts as Record<string, Verdict>
  const rows = [
    ['FM1', 'jitter-vs-tampering', v.fm1],
    ['FM2', 'tri-state collapse', v.fm2],
    ['FM3', 'side-channel bleed', v.fm3],
    ['FM4', 'sybil flood', v.fm4],
    ['VC1', 'separability', v.vc1],
    ['VC2', 'threshold', v.vc2],
    ['VC3', 'projection fidelity', v.vc3],
    ['VC4', 'forced-inclusion canary', v.vc4],
  ]
  const cls: Record<string, string> = { violation: 'text-series-2', drift: 'text-muted', pass: 'text-series-1' }
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table>
        <thead>
          <tr><th>id</th><th>mode</th><th>verdict</th></tr>
        </thead>
        <tbody>
          {rows.map(([id, name, verdict]) => (
            <tr key={id}>
              <td className="font-mono">{id}</td>
              <td>{name}</td>
              <td className={cls[verdict]}>{verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Canary() {
  const c = charts.canary
  const rows = [
    ['strip', 'red drops the canary', c.stripRefused],
    ['forward (plain)', 'red forwards a stale canary', c.forwardCaughtPlain],
    ['forward (fresh)', 'a freshness marker rejects it', c.forwardCaughtFresh],
  ]
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table>
        <thead>
          <tr><th>attack</th><th>what happens</th><th>caught</th></tr>
        </thead>
        <tbody>
          {rows.map(([name, what, caught]) => (
            <tr key={String(name)}>
              <td className="font-mono">{name}</td>
              <td>{what}</td>
              <td className={caught ? 'text-series-1' : 'text-series-2'}>{caught ? 'yes' : 'no'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Charts() {
  usePageMeta(
    'Charts',
    'The critic report as model-vs-observed curves: drift, threshold, side-channel bleed, and the forced-inclusion canary.',
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs tracking-[0.18em] text-accent uppercase">The critic report</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-body sm:text-5xl">
        Model curve, measured run,<br />and the gap between.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
        Snapshot {charts.snapshot}, seed {charts.seed}. The report is generated from the model —
        `scripts/critic-model.mjs` — and the page states the snapshot it was built from, which the
        freshness gate checks.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="max-w-full rounded-full border border-line px-2.5 py-1 font-mono break-all text-muted">
          anchor {charts.anchor.real}+{charts.anchor.imaginary}i
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          cadence {charts.cadence.toFixed(3)} rad/tick
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {charts.stream.valid + charts.stream.jitter + charts.stream.spoofed + charts.stream.replayed} events
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          mixed-stream accuracy {charts.demodulator.accuracy.toFixed(3)}
        </span>
      </div>

      <div className="mt-8 space-y-6">
        <Figure
          title="Drift, with and without a decay term"
          note="The ceiling is the declared curve. No-decay drift crosses it — a legitimate marker evicted like a tamper. A decay term saturates below it."
        >
          <Drift />
        </Figure>

        <Figure
          title="The demodulation threshold"
          note="Each point is drift after 200 ticks at a jitter magnitude. The first point past the ceiling is the threshold — the proof a decay term is required."
        >
          <Threshold />
        </Figure>

        <Figure
          title="The side-channel bleed"
          note="The primary carrier metric stays flat while resolution falls with dose. The gap between the two curves is the bleed, invisible on the main gauge."
        >
          <Bleed />
        </Figure>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-body">The verdicts</h2>
        <p className="mt-1 text-sm text-muted">
          Eight outcomes, each a spectrum: violation (broke), drift (at risk), pass (held).
        </p>
        <p className="mt-2 text-sm text-muted">
          <strong className="text-body">Declared scope.</strong> The model's background is
          stationary and its observables are phase, tri-state, cost and identity. It makes no claim
          about reply <em>latency</em>, and no claim about a defence whose noise floor moves with
          traffic. A result that depends on either is outside this table.
        </p>
        <div className="mt-4"><VerdictTable /></div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-body">The forced-inclusion canary</h2>
        <p className="mt-1 text-sm text-muted">
          The cheapest blue move: inject a log and force validation to include it. Strip is refused;
          a plain forward is not caught; a freshness marker closes it.
        </p>
        <div className="mt-4"><Canary /></div>
      </div>
    </div>
  )
}
