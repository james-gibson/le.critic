import { PAGES, type Page } from './content'

/**
 * Seeds, on a scale.
 *
 * A seed is a body of knowledge with three things stated up front: who it is
 * for, what it assumes, and where it starts. The scale adds the fourth: **how
 * much of the machine the audience is willing to touch**.
 *
 * Membership is derived from `seeds:` in page frontmatter, so a seed's contents
 * cannot drift from the pages that declare them. A page may belong to several
 * seeds: that is what "shared" means here.
 */

export type Seed = {
  /** the slug of its page in /seeds, and the id used in frontmatter */
  id: string
  title: string
  /** who this is written for, in one line */
  audience: string
  /** what they must already know — "nothing" is a valid and useful answer */
  assumes: string
  /** three claims the seed makes good on */
  teaches: string[]
  /** the route a newcomer should open first */
  entry: string
  /** position on the readiness scale; absent for lateral seeds */
  rung?: number
  /** what this audience does with the machine */
  touches: string
  /** register, not readiness — sits alongside every rung */
  lateral?: boolean
  /** a site-scoped seed is a view of the whole shelf, not a subset of it */
  scope?: 'site' | 'entrance'
}

export const SCALE: Record<number, { label: string; touches: string }> = {
  [-3]: {
    label: 'No script',
    touches: 'reads a document; the application never loads',
  },
  [-2]: {
    label: 'No stylesheet',
    touches: 'reads a document; the design system never arrives',
  },
  [-1]: {
    label: 'Just a file',
    touches: 'wants the file itself; the page is optional',
  },
  0: {
    label: 'Just a website',
    touches: 'wants a website and a bill; will not open a terminal',
  },
  1: { label: 'Understand', touches: 'reads concepts; will not deploy anything' },
  2: { label: 'Learn', touches: 'runs it locally and breaks it on purpose' },
  3: { label: 'Operate', touches: 'delegates the running; wants it repeatable' },
  4: { label: 'Package', touches: 'designs systems other people will operate' },
}

export const SEEDS: Seed[] = [
  {
    id: 'reader',
    title: 'The reader',
    audience: 'Someone who wants the verdict: is this surface compromised, and why.',
    assumes: 'Nothing. The verdict table is the entry point.',
    teaches: [
      'what a failure mode is, and why "pass / drift / violation" is a spectrum, not a flag',
      'which curve is the declared model and which is the measured run',
      'what the forced-inclusion canary does, and where it stops',
    ],
    entry: '/docs/overview',
    rung: 0,
    touches: 'reads a verdict; will not open a terminal',
  },
  {
    id: 'maintainer',
    title: 'The maintainer',
    audience: 'An engineer who wants to run the model and keep the report honest.',
    assumes: 'Node 22, a shell, and the willingness to read a guard script.',
    teaches: [
      'how the critic model is deterministic for a seed, and why that is the whole point',
      'why the committed summary must match the model, and what the freshness gate refuses',
      'how the universe is generated from the same run, so the timeline cannot drift from the report',
    ],
    entry: '/docs/reproducibility',
    rung: 2,
    touches: 'runs it locally and breaks it on purpose',
  },
  {
    id: 'packager',
    title: 'The packager',
    audience: 'Someone who wants to lift the critic — the model, not the page — into another system.',
    assumes: 'You have read a runbook, or hated one.',
    teaches: [
      'the four tests that make a system an isotope',
      'why the critic is a model, not a document, and how that changes a claim',
      'slots, compounds, and how the model ships as a dependency-free port',
    ],
    entry: '/isotopes/cornichon',
    rung: 4,
    touches: 'designs systems other people will operate',
  },
]

export function getSeed(id: string): Seed | undefined {
  return SEEDS.find((seed) => seed.id === id)
}

/** Pages that declare this seed, in section order. */
export function seedMembers(id: string): Page[] {
  const seed = getSeed(id)
  if (seed?.scope === 'site') return PAGES.filter((page) => page.section !== 'seeds')
  return PAGES.filter((page) => page.seeds.includes(id))
}

/** Seeds a page belongs to. */
export function seedsOf(page: Page): Seed[] {
  return page.seeds.map(getSeed).filter((seed): seed is Seed => !!seed)
}

/** Seeds that sit alongside every rung rather than on one. */
export function lateralSeeds(): Seed[] {
  return SEEDS.filter((seed) => seed.lateral)
}

/** The rungs, with the seeds that sit on each. */
export function scale(): { level: number; label: string; touches: string; seeds: Seed[] }[] {
  return Object.entries(SCALE)
    .map(([level, step]) => ({
      level: Number(level),
      ...step,
      seeds: SEEDS.filter((seed) => seed.rung === Number(level)),
    }))
    .sort((a, b) => a.level - b.level)
}
