import type { ReactNode } from 'react'
import { usePageMeta } from '../lib/usePageMeta'
import ocd from '../data/ocd.json'

const W = 860
const H = 260
const PAD = { l: 172, r: 64, t: 16, b: 16 }
const IW = W - PAD.l - PAD.r
const IH = H - PAD.t - PAD.b

function Figure({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <figcaption>
        <h2 className="text-lg font-semibold tracking-tight text-body">{title}</h2>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </figcaption>
      <div className="mt-5">{children}</div>
    </figure>
  )
}

type Row = { label: string; value: number; note?: string; tone?: string }

function HBars({ rows, max, unit }: { rows: Row[]; max: number; unit: string }) {
  const gap = IH / rows.length
  const bar = Math.min(20, gap * 0.58)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${unit} by row`}>
      <title>{unit}</title>
      {rows.map((row, i) => {
        const top = PAD.t + i * gap + (gap - bar) / 2
        const width = Math.max(2, (row.value / max) * IW)
        return (
          <g key={row.label}>
            <text
              x={PAD.l - 10}
              y={top + bar / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-current font-mono text-[11px] text-muted"
            >
              {row.label}
            </text>
            <rect
              x={PAD.l}
              y={top}
              width={width}
              height={bar}
              rx={3}
              className={row.tone ?? 'text-series-1'}
              fill="currentColor"
            />
            <text
              x={PAD.l + width + 8}
              y={top + bar / 2}
              dominantBaseline="middle"
              className="fill-current text-[11px] text-body"
            >
              {row.note ?? row.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Stack({ parts }: { parts: Array<{ label: string; value: number; tone: string }> }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0) || 1
  let cursor = 0
  return (
    <svg viewBox="0 0 860 90" className="w-full" role="img" aria-label="Worktree classes">
      <title>Worktrees by class</title>
      {parts.map((part) => {
        const width = (part.value / total) * 800
        const x = 30 + cursor
        cursor += width
        return (
          <g key={part.label}>
            <rect x={x} y={18} width={Math.max(2, width - 8)} height={30} rx={3} className={part.tone} fill="currentColor" />
            <text x={x + 4} y={66} className="fill-current text-[11px] text-muted">
              {part.label} {part.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function Corpus() {
  usePageMeta(
    'Corpus',
    'The OCD corpus as charts: where rework happens, where inputs come from, what collides, and what the next agent pays for leftovers.',
  )

  const { backtracks, causes, inputs, overlap, locks, worktrees } = ocd
  const maxAtom = Math.max(...backtracks.atoms.map((a) => a.rate))
  const maxCause = Math.max(...causes.map((c) => c.events))
  const maxClass = Math.max(...inputs.classes.map((c) => c.touches))

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs tracking-[0.18em] text-accent uppercase">The measured corpus</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-body sm:text-5xl">
        What the work cost,<br />not what it was.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
        Snapshot {ocd.snapshot}, {ocd.sessions} sessions, {ocd.toolCalls.toLocaleString()} tool
        calls, window {ocd.window.from} → {ocd.window.to}. Unlike the critic's charts these are not
        a model run: they are measurements of a real session store, frozen and hashed. The build
        refuses a snapshot that does not match its manifest.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="max-w-full rounded-full border border-line px-2.5 py-1 font-mono break-all text-muted">
          source {ocd.sourceHash}
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {backtracks.total.toLocaleString()} backtracks
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {backtracks.sessions} sessions with at least one
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 text-muted">
          {Math.round(backtracks.narrated * 100)}% named by the agent
        </span>
      </div>

      <div className="mt-8 space-y-6">
        <Figure
          title="Rework by atom"
          note="Backtracks per 100 calls of that atom. Creating a file and then correcting it is the commonest self-correction in the corpus — which is what a draft is."
        >
          <HBars
            unit="Backtracks per 100 calls"
            max={maxAtom}
            rows={backtracks.atoms.map((a) => ({
              label: a.atom,
              value: a.rate,
              note: `${a.rate.toFixed(1)} · ${a.backtracks} of ${a.calls.toLocaleString()} calls`,
            }))}
          />
        </Figure>

        <Figure
          title="What the correction was repairing"
          note={`${Math.round((1 - causes.reduce((s, c) => s + c.share, 0)) * 100)}% of corrections are too terse to classify and are omitted here, so every bar is a lower bound. Base damage — a later change breaking an earlier unit — is ${Math.round(ocd.baseDamage.share * 100)}%.`}
        >
          <HBars
            unit="Backtracks by cause"
            max={maxCause}
            rows={causes.map((c) => ({
              label: c.cause,
              value: c.events,
              note: `${c.events} · ${Math.round(c.share * 100)}%`,
              tone: c.cause === 'base-damage' ? 'text-accent' : 'text-series-1',
            }))}
          />
        </Figure>

        <Figure
          title="Where the input came from"
          note="Every first touch of a file, by provenance. The inferred bar is half the corpus: no prompt mention, no earlier output. Its read failure rate is 2.7% against 0.3% for a searched path, so the prior is good and not free."
        >
          <HBars
            unit="First touches by provenance"
            max={maxClass}
            rows={inputs.classes.map((c) => ({
              label: c.name,
              value: c.touches,
              note: `${c.touches.toLocaleString()} · ${Math.round(c.share * 100)}% · fail ${(c.fail * 100).toFixed(1)}%`,
              tone: c.name === 'infer' ? 'text-accent' : 'text-series-1',
            }))}
          />
        </Figure>

        <Figure
          title="Conflicts need a shared target"
          note={`Compressing the calendar sixteen-fold produces ${overlap.timeOnly[overlap.timeOnly.length - 1].collisions} collisions. Co-starting 40 session pairs that already share a file produces ${overlap.sharedPairs.sampled_collisions}. Overlap in time is not overlap in files.`}
        >
          <HBars
            unit="Collisions under two models"
            max={overlap.sharedPairs.sampled_collisions}
            rows={[
              {
                label: '16× time',
                value: overlap.timeOnly[overlap.timeOnly.length - 1].collisions,
                note: `${overlap.timeOnly[overlap.timeOnly.length - 1].collisions} collisions`,
                tone: 'text-series-2',
              },
              {
                label: '40 shared pairs',
                value: overlap.sharedPairs.sampled_collisions,
                note: `${overlap.sharedPairs.sampled_collisions} collisions`,
                tone: 'text-accent',
              },
            ]}
          />
        </Figure>

        <Figure
          title="The manifest is quiet; the lock is not"
          note={`Independent chained dependency updates share a (package, field) in ${Math.round(locks.lock.ident * 100)}% of lock pairs and ${Math.round(locks.manifest.ident * 100)}% of manifest pairs. Merge safety is argued on the manifest; the lock is regenerated, never merged.`}
        >
          <HBars
            unit="Share of pairs touching the same package field"
            max={1}
            rows={[
              {
                label: 'manifest',
                value: locks.manifest.ident,
                note: `${Math.round(locks.manifest.ident * 100)}% of ${locks.manifest.pairs} pairs`,
                tone: 'text-series-2',
              },
              {
                label: 'lock file',
                value: locks.lock.ident,
                note: `${Math.round(locks.lock.ident * 100)}% of ${locks.lock.pairs} pairs`,
                tone: 'text-accent',
              },
            ]}
          />
        </Figure>

        <Figure
          title="What the next agent pays for leftovers"
          note={`${worktrees.present} worktrees present, ${worktrees.dead} dead, ${worktrees.sizeGb} GB, ${worktrees.tracked.toLocaleString()} tracked files. ${worktrees.visitor.sessions} sessions read a worktree they did not own: ${worktrees.visitor.tokensRead.toLocaleString()} tokens of content inside ${worktrees.visitor.sessionTokens.toLocaleString()} tokens of session context, $${worktrees.visitor.cost.toFixed(2)}.`}
        >
          <Stack
            parts={[
              { label: 'active', value: worktrees.classes.active, tone: 'text-series-1' },
              { label: 'dirty', value: worktrees.classes.dirty, tone: 'text-accent' },
              { label: 'idle', value: worktrees.classes.idle, tone: 'text-series-2' },
              { label: 'dead', value: worktrees.classes.dead, tone: 'text-muted' },
            ]}
          />
        </Figure>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-body">Declared scope</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          These are measurements of one machine's session store over {ocd.window.from} to{' '}
          {ocd.window.to}, not of agents in general. Cause is read from the agent's own words, so
          every cause share is a lower bound. Collisions are a counterfactual placement of real
          events and no merge was run. Tokens are characters over four; the session totals are
          exact. The snapshot is frozen in <code className="font-mono text-xs">data/ocd/</code> and
          checked against its manifest at build time.
        </p>
      </div>
    </div>
  )
}
