import { Link } from 'react-router-dom'
import { AnimatedCounter } from '../components/silicon-ui/animated-counter/animated-counter'
import { Badge } from '../components/silicon-ui/badge/badge'
import { ButtonLink } from '../components/silicon-ui/button-link/button-link'
import { CopyButton } from '../components/silicon-ui/copy-button/copy-button'
import { PAGES, SECTIONS, pagesIn } from '../lib/content'
import { MotionReveal, useMotion } from '../lib/motion'
import { usePageMeta } from '../lib/usePageMeta'

const base = import.meta.env.BASE_URL
const DOWNLOAD = 'curl -s https://james-gibson.github.io/le.critic/data/charts.json'

export function Home() {
  usePageMeta(undefined, 'A critic that runs the local-time FM carrier model and reports the failure modes and verification criteria as reproducible feedback.')
  const { mode } = useMotion()
  const still = mode === 'still'

  const facts = [
    { k: 'Verdicts', v: 8 },
    { k: 'Failure modes', v: 4 },
    { k: 'Sections', v: SECTIONS.length },
  ]

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70">
        <div className="plot-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <div className="min-w-0">
            <MotionReveal>
              <Badge size="sm" icon={<span className="h-1.5 w-1.5 rounded-full bg-accent" />}>
                seed 42 · anchor 42+0i · snapshot 2026-11-19
              </Badge>
            </MotionReveal>

            <MotionReveal delay={60}>
              <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-body sm:text-6xl">
                A critic you can<br />
                <span className="text-accent">quote.</span>
              </h1>
            </MotionReveal>

            <MotionReveal delay={120}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                It runs the local-time FM carrier model, separates a mixed stream from noise, and
                reports four failure modes and four verification criteria — each a spectrum, not a
                flag, and every verdict reproducible from the seed.
              </p>
            </MotionReveal>

            <MotionReveal delay={180}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href={`${base}charts`} variant="primary">
                  Read the verdict
                </ButtonLink>
                <ButtonLink href={`${base}docs/overview`} variant="secondary">
                  Read the model
                </ButtonLink>
              </div>
            </MotionReveal>

            <p className="mt-6 text-xs text-muted">
              Same seed, same verdicts. The freshness gate refuses a build whose page cannot state
              its snapshot.
            </p>
          </div>

          <MotionReveal delay={140} className="min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/90 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs tracking-[0.16em] text-muted uppercase">One file</p>
                <CopyButton value={DOWNLOAD} label="Copy" />
              </div>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-line-soft bg-surface-2 p-4 font-mono text-[13px] leading-6 text-body">
                <code>{DOWNLOAD}</code>
              </pre>
              <ul className="mt-5 space-y-3 text-sm text-muted">
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  The summary is generated from the model, not authored by hand.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  Three curves: drift, threshold, and the side-channel bleed.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                  The canary triple: strip is refused, a plain forward is not.
                </li>
              </ul>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="border-b border-line/70 bg-surface/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-3 gap-6 px-5 py-10 sm:px-8">
          {facts.map((fact) => (
            <div key={fact.k}>
              <p className="font-mono text-3xl font-semibold text-body sm:text-4xl">
                {still ? fact.v : <AnimatedCounter value={fact.v} animateOnView />}
              </p>
              <p className="mt-1 text-xs tracking-[0.14em] text-muted uppercase">{fact.k}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-body sm:text-3xl">
              Every section, one contract
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Each section is a folder. Each page is a file. The navigation builds itself from
              both, which is why the report cannot drift from the model.
            </p>
          </div>
          <Link to="/docs/overview" className="text-sm text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent">
            Start with the overview
          </Link>
        </div>

        <MotionReveal className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <Link
                  to={`/${section.id}`}
                  className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-surface-2 focus-visible:border-accent"
                >
                  <span>
                    <span className="font-mono text-xs text-accent">{section.id}</span>
                    <span className="mt-3 block text-lg font-semibold tracking-tight text-body group-hover:text-accent">
                      {section.label}
                    </span>
                    <span className="mt-1.5 block text-sm leading-6 text-muted">
                      {section.blurb}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {pagesIn(section.id).length} pages →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </MotionReveal>
      </section>

      <section className="overflow-hidden border-y border-line/70 bg-surface/40 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {['pass', 'drift', 'violation', 'reproducible', 'spectrum'].map((phrase) => (
            <span key={phrase} className="text-xs tracking-[0.24em] text-muted uppercase">
              {phrase}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-line bg-surface p-7">
            <p className="text-xs tracking-[0.16em] text-accent uppercase">The spectrum</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-body">
              A threshold is a point, not a wall
            </h2>
            <p className="mt-3 text-muted">
              "Above a threshold, so it's not likely we had an issue" is a spectrum claim with the
              tail cut off and labelled safe. A verdict is a position on a curve, never an
              assurance. The critic states the curve and the position.
            </p>
            <Link to="/docs/overview" className="mt-4 inline-block text-sm text-accent underline decoration-accent/30 underline-offset-4">
              Read the model
            </Link>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-7">
            <p className="text-xs tracking-[0.16em] text-secondary uppercase">The canary</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-body">
              The cheapest blue move is a log
            </h2>
            <p className="mt-3 text-muted">
              Inject a log into a stream and force validation to include it. Strip is refused; a
              plain forward is not caught — the freshness marker is what closes that gap. The
              critic measures all three.
            </p>
            <Link to="/charts" className="mt-4 inline-block text-sm text-accent underline decoration-accent/30 underline-offset-4">
              See the canary
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <p className="text-sm text-muted">
          {PAGES.length} pages, one build, one guard.{' '}
          <Link to="/docs/for-agents" className="text-accent underline decoration-accent/30 underline-offset-4">
            The agent contract
          </Link>{' '}
          starts at <span className="font-mono">/llms.txt</span>. The report is on{' '}
          <Link to="/charts" className="text-accent underline decoration-accent/30 underline-offset-4">
            the charts page
          </Link>, and the run ships as a{' '}
          <Link to="/universes" className="text-accent underline decoration-accent/30 underline-offset-4">
            local-time universe
          </Link>.
        </p>
      </section>
    </>
  )
}
