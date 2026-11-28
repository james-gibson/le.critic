import { Link } from 'react-router-dom'
import { usePageMeta } from '../lib/usePageMeta'
import scans from '../data/scans.json'

const STATUS_TONE: Record<string, string> = {
  enforced: 'text-accent',
  declared: 'text-body',
  gap: 'text-series-2',
  unknown: 'text-muted',
}

const STATUSES = ['enforced', 'declared', 'gap', 'unknown'] as const

export function Scans() {
  usePageMeta(
    'Scans',
    'The exposure and protection scans as a hashed receipt: the wildcard edge at 78, the stacked edge at 19-25, and the mix of enforced and gap layers.',
  )

  const { snapshot, sourceHash, measure, surfaces, protections, offence } = scans
  const stacked = new Set(['stacked-loopback', 'stacked-wan'])

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs tracking-[0.18em] text-accent uppercase">The scans</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-body sm:text-5xl">
        The scores, with a receipt.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
        Snapshot {snapshot}. The exposure rubric is {measure.dimensions} dimensions on a{' '}
        {measure.scale} scale, equal weights, {measure.formula} — {measure.direction}. The numbers
        are frozen under <code className="font-mono text-sm">data/scans/</code> and checked against
        their manifest at build time: a hand-edited score is a claim with no receipt.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="max-w-full rounded-full border border-line px-2.5 py-1 font-mono break-all text-muted">
          source {sourceHash}
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {surfaces.length} surfaces
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {protections.catalogue.rows} protection rows
        </span>
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-body">The exposure rubric</h2>
        <p className="mt-1 text-sm text-muted">
          Higher is more exposed. The stacked rows are the layered design; the projection row is
          the nearest like-for-like “same tools, no wildcard” reading.
        </p>
        <ul className="mt-5 divide-y divide-line">
          {surfaces.map((surface) => {
            const isStacked = stacked.has(surface.id)
            return (
              <li key={surface.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className={`font-medium ${isStacked ? 'text-accent' : 'text-body'}`}>
                    {surface.label}
                  </span>
                  <span className="font-mono text-sm text-body">ERI {surface.eri}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span>network {surface.network}</span>
                  <span>local/supply {surface.localSupply}</span>
                  {surface.vector.length > 0 ? (
                    <span className="font-mono">[{surface.vector.join(',')}]</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted">{surface.note}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-body">The protection board</h2>
        <p className="mt-1 text-sm text-muted">
          {protections.catalogue.rows} rows across {protections.catalogue.tools} tools and{' '}
          {protections.catalogue.family} family rules. The mix, not a single number, is the
          reading: a green majority can hide the gaps.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {STATUSES.map((status) => (
            <span key={status} className="rounded-full border border-line px-2.5 py-1 text-muted">
              <span className={`font-mono ${STATUS_TONE[status]}`}>{protections.statuses[status]}</span>{' '}
              {status}
            </span>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-semibold tracking-tight text-body">The edge rows</h3>
        <ul className="mt-2 divide-y divide-line">
          {protections.edge.map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
              <span className="font-mono text-xs text-body">{row.id}</span>
              <span className={`text-xs ${STATUS_TONE[row.status] ?? 'text-body'}`}>{row.status}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          {protections.edgeMix.enforced} enforced, {protections.edgeMix.gap} gap — the gaps are
          rate, attribution and TLS, and they are why the front is loopback-only today.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-body">The offence half</h2>
        <p className="mt-1 text-sm text-muted">
          Measured {offence.measured_at} against {offence.target}: verdict{' '}
          <span className="font-medium text-body">{offence.verdict}</span>, exit {offence.exit}.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
          {offence.reading.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Vectors {offence.vectors.join(', ')} · reached {offence.reached.join(', ')} · cost{' '}
          {offence.cost.calls} calls, {offence.cost.seconds}s.
        </p>
      </section>

      <p className="mt-8 max-w-3xl text-sm leading-6 text-muted">
        Read the argument in{' '}
        <Link to="/guides/stacked-defence" className="text-accent underline decoration-accent/30 underline-offset-4">
          the stacked defence
        </Link>
        , the data model in{' '}
        <Link to="/docs/scans" className="text-accent underline decoration-accent/30 underline-offset-4">
          the scan receipt
        </Link>
        , and the sibling receipt in{' '}
        <Link to="/corpus" className="text-accent underline decoration-accent/30 underline-offset-4">
          the corpus
        </Link>
        .
      </p>
    </div>
  )
}
