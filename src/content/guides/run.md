---
title: Run the critic
description: Regenerate the summary and the universe, then run the gates that decide whether the report may publish.
order: 1
updated: 2026-11-21
tags: model, build, gates
seeds: maintainer
---

# Run the critic

The critic runs locally and deterministically. Two commands regenerate the committed artefacts:

```sh
npm run charts      # model → src/data/charts.json
npm run universes   # model → src/universes/critic.ts
```

`npm run build` runs both, then `tsc --noEmit`, the Vite build, prerender, the deck, and the gate
chain below. There is no data to import and no service to start: the model is the data.

## The gates, and what each one refuses

Each gate is a refusal, not a warning. In CI the refusal lands before the artifact is uploaded, so
a red build stops a deploy instead of discovering it afterwards.

| gate | refuses |
| --- | --- |
| `freshness` | a charts page that cannot state its snapshot |
| `doomlint` | a page frame that cannot survive the 320×200, 256-colour paint |
| `a11y` | a missing title, landmark, `h1`, alt, or a heading outline that skips a level |
| `contrast` | an undeclared ink, a pair under its floor after alpha, two touching marks under 3:1 |
| `overflow` | a page that scrolls sideways at 320px, by the causes that are statically decidable |
| `verify-publish` | the publish guard, below |

The publish guard checks the artifact rather than the source, and every failure names the defect it
prevents:

- **The output is what Pages expects** — the required files, a `404.html` that boots the same
  application, a base path that agrees with `package.json` `homepage`, a shell for every real
  route. A deep link is a found page, not a missing one that happens to render.
- **Nothing private ships** — no source map, no `/src/` URL, no absolute home path, private key,
  cloud key id or hardcoded credential, no loopback or `localhost` URL, no placeholder in a shell.
- **The content is the site** — every page in the bundle, every site-path link resolving to a
  route, every route in `llms.txt`, every isotope declaring its `slots:` and `presumes:`, every
  seed page agreeing with the ladder in `src/lib/seeds.ts` and with its own entrance.
- **The claims stay checkable** — the satire pages still carry no stylesheet or script, the deck
  carries no script and a dated commit, there is exactly one agent door, the sitemap lists every
  route and the AI catalog lists `llms.txt`, the feed lists every page, `rules.md` defines
  `RULES-01`–`RULES-09`, and the published rotation record matches the ledger.
- **The artifact stays small** — `dist/` under the 8MB budget, so a page is never a download.

The guard is the gate (RULES-05): it fails the build rather than warning, because a weakened check
invalidates the other claims. `npm run guard` runs it alone against an existing `dist/`;
`npm run check` is `tsc --noEmit`; `npm run doom`, `a11y`, `contrast`, `overflow` and
`freshness` each run one gate by hand. `npm run smoke` renders every route and fails if one
throws — it is a separate command, not part of `npm run build`.

## The rotation record

The seed's unit of account is a **rotation**: one verified update cycle. It keeps its own
append-only ledger at `upstream/rotations.jsonl` instead of reporting to a counter elsewhere, and
`scripts/rotation-state.mjs` derives the state from that ledger alone. A `rotation` resets the
distance and closes an open cycle; a `depart` adds 8. The rungs are 42i's, unchanged:
`HEALTHY` (<8), `MINOR` (<48), `DEGRADED` (<80), `COMPROMISED` (=80).

```sh
npm run rotation -- status          # rung, head, distance, open cycle, gaps
npm run rotation -- gate            # may this cycle publish? read-only
npm run rotation -- open   --isotope rules --note "<old> → <new>"
npm run rotation -- verify --isotope rules --subject <sha> --gates build,smoke,guard
npm run rotation -- depart --kind guard --isotope rules
```

The id is allocated when the line lands, so a rotation that was recorded but not committed does
not exist for the next cycle. That is what makes `gate` meaningful: it refuses a gap in the id
sequence, a cycle left open, and a rung of `DEGRADED` or worse. `MINOR` still publishes, with its
departures printed — distance 8 is a bad day, not a broken seed.

The site publishes the state it acted on as `dist/rotations.json`, and the publish guard compares
it against the ledger. A page that says the seed is at one rung while the ledger derives another
is a red build, not a stale page.

## The rules the seed defers to

`upstream/rules.md` is vendored from `le.gume` with a version and a SHA-256 in
`upstream/manifest.json`. The rules are not copied into `AGENTS.md`: a copy drifts, and nobody can
tell which one is current.

```sh
npm run rules                     # catch-up check against le.gume; writes nothing
node scripts/sync-upstream.mjs    # re-vendor, then commit
```

CI runs the check before the build, so a cycle cannot deploy against a rule list it has outgrown.
A rule this seed replaces is recorded in `upstream/overrides.md` with a reason, which is
RULES-08: an override is a departure with a reason, not an edit to the parent list.

## In CI

```sh
npm ci
npm run rotation -- gate
npm run rules
npm run build
```

The order is the defence. A cycle that cannot claim its rotation, or is reading a stale rule list,
stops before the model is regenerated. The build then re-derives the summary and the universe from
the model, and the gates check the artifact. "Done" means the last line exits 0.

## The seed is the identity

`critic-model.mjs` uses `mulberry32(42)`. Change the seed and the report changes; that is a
different run, not a bug. The committed summary records which seed it was generated from, so a
report can always be re-derived from the same inputs.

## What these gates are not

They check the artifact this seed publishes; they do not audit a live surface. The defences that
are measured at runtime — a declared jumpbox, a bounded response cycle, a jail's per-IP ban — are
narrated in [A value is not a verdict](/guides/le-roy-jenkins), and the model's scope limit is
declared on [the critic](/docs/overview).
