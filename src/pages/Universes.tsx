import { Link } from 'react-router-dom'
import { criticRunUniverse } from '../universes/critic'
import { usePageMeta } from '../lib/usePageMeta'

const W = 860
const H = 190
const PAD = 24
const IW = W - PAD * 2

const ms = (ns: bigint) => Number(ns / 1_000_000n)
const day = (ns: bigint) => new Date(ms(ns)).toISOString().slice(0, 10)

const universe = criticRunUniverse
const segments = universe.temporalStructure.segments
const keyframes = universe.temporalStructure.keyframes
const start = ms(segments[0].start)
const end = ms(segments[segments.length - 1].end)
const x = (ns: bigint) => PAD + ((ms(ns) - start) / (end - start)) * IW

const meta = universe.metadata as {
  seed?: unknown
  anchor?: { real?: number; imaginary?: number }
  cadence?: number
  runDays?: number
}

function Timeline() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Universe timeline">
      <title>Eight stations, each verdict a keyframe</title>
      {segments.map((segment, index) => {
        const x0 = x(segment.start)
        const x1 = x(segment.end)
        return (
          <g key={segment.id}>
            <rect
              x={x0}
              y={70}
              width={Math.max(2, x1 - x0 - 3)}
              height={30}
              rx={4}
              className={index % 2 === 0 ? 'text-series-1' : 'text-series-2'}
              fill="currentColor"
            >
              <title>{`${segment.id}: ${segment.description ?? ''}`}</title>
            </rect>
            <text x={(x0 + x1) / 2} y={118} textAnchor="middle" className="fill-current text-[11px] text-muted">
              {segment.id}
            </text>
          </g>
        )
      })}
      {keyframes.map((keyframe) => (
        <circle
          key={keyframe.id}
          cx={x(keyframe.timestamp)}
          cy={42}
          r={2.6}
          fill="currentColor"
          className={keyframe.tags.includes('violation') ? 'text-series-2' : 'text-series-1'}
        >
          <title>{`${day(keyframe.timestamp)} · ${keyframe.id}`}</title>
        </circle>
      ))}
      <line x1={PAD} x2={W - PAD} y1={42} y2={42} className="text-line" stroke="currentColor" strokeDasharray="3 6" />
      <text x={PAD} y={158} className="fill-current text-[10px] text-muted">{day(segments[0].start)}</text>
      <text x={W - PAD} y={158} textAnchor="end" className="fill-current text-[10px] text-muted">{day(segments[segments.length - 1].end)}</text>
    </svg>
  )
}

export function Universes() {
  usePageMeta(
    'The universe',
    'The critic run as a local-time Universe: eight stations, each verdict a keyframe, generated from the model.',
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs tracking-[0.18em] text-accent uppercase">Local-time universe</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-body sm:text-5xl">
        The run on a timeline.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
        The critic run also ships as a <code className="font-mono text-body">Universe</code>: eight
        stations — four failure modes, four verification criteria — one per day, each verdict a
        keyframe. The module is generated from the same model run as the charts, so the timeline
        cannot drift from the report.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="max-w-full rounded-full border border-line px-2.5 py-1 font-mono break-all text-muted">
          {universe.universeId}
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {segments.length} segments
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {keyframes.length} keyframes
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          seed {String(meta.seed ?? '')}
        </span>
      </div>

      <figure className="mt-8 rounded-2xl border border-line bg-surface p-5 text-accent sm:p-6">
        <figcaption>
          <h2 className="text-lg font-semibold tracking-tight text-body">Timeline</h2>
          <p className="mt-1 text-sm text-muted">
            Eight stations are bars; the line above carries every keyframe. A violation is the
            high-significance event; a pass is the low one.
          </p>
        </figcaption>
        <div className="mt-4"><Timeline /></div>
      </figure>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-body">Stations</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="text-xs tracking-[0.12em] text-muted uppercase">
                <tr>
                  <th className="border-b border-line py-2 font-medium">Id</th>
                  <th className="border-b border-line py-2 font-medium">From</th>
                  <th className="border-b border-line py-2 font-medium">To</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => (
                  <tr key={segment.id}>
                    <td className="border-b border-line-soft py-2 font-mono text-xs text-muted">{segment.id}</td>
                    <td className="border-b border-line-soft py-2 text-body">{day(segment.start)}</td>
                    <td className="border-b border-line-soft py-2 text-body">{day(segment.end)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            One station per day, in run order. End dates are exclusive.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-body">Metadata</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Canonical name</dt>
              <dd className="mt-1 text-body">{universe.metadata.canonicalName}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Anchor</dt>
              <dd className="mt-1 text-body">
                {String((meta.anchor as { real?: number })?.real ?? '')}+{(meta.anchor as { imaginary?: number })?.imaginary ?? ''}i
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Cadence</dt>
              <dd className="mt-1 text-body">{String(meta.cadence ?? '')} rad/tick</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-muted uppercase">Usage</dt>
              <dd className="mt-1 text-body">{universe.attribution.usage_restrictions.join(', ') || 'none'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-body">Keyframes</h2>
        <p className="mt-1 text-sm text-muted">
          Each station's verdict, at day noon UTC with <code>DAY</code> precision.
        </p>
        <div className="mt-4 max-h-[30rem] overflow-auto rounded-xl border border-line-soft">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-surface-2 text-xs tracking-[0.12em] text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 font-medium">Id</th>
                <th className="px-3 py-2 text-right font-medium">Sig.</th>
                <th className="px-3 py-2 font-medium">Tags</th>
                <th className="px-3 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {keyframes.map((keyframe) => (
                <tr key={keyframe.id}>
                  <td className="whitespace-nowrap border-t border-line-soft px-3 py-2 font-mono text-xs text-muted">{day(keyframe.timestamp)}</td>
                  <td className="border-t border-line-soft px-3 py-2 font-mono text-xs text-body">{keyframe.id}</td>
                  <td className="border-t border-line-soft px-3 py-2 text-right font-mono text-xs text-muted">{keyframe.significance.toFixed(2)}</td>
                  <td className="border-t border-line-soft px-3 py-2 text-xs text-muted">{keyframe.tags.join(', ')}</td>
                  <td className="border-t border-line-soft px-3 py-2 text-muted">{keyframe.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-body">Use it</h2>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line-soft bg-surface-2 p-4 font-mono text-[13px] leading-6 text-body">
          <code>{`import { criticRunUniverse } from './src/universes/critic'

criticRunUniverse.temporalStructure.keyframes
  .filter((k) => k.tags.includes('violation'))
  .map((k) => [k.timestamp, k.description])`}</code>
        </pre>
        <p className="mt-3 text-sm text-muted">
          The shape and the regeneration rule are in{' '}
          <Link to="/docs/universes" className="text-accent underline decoration-accent/30 underline-offset-4">
            the universe guide
          </Link>
          . The timestamp of a keyframe is a <code>bigint</code> in nanoseconds.
        </p>
      </section>
    </div>
  )
}
