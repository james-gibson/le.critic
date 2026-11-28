---
title: The stacked defence, scored
description: The layered isotope design, read from the scans: the wildcard edge scores 78, the stacked edge 19-25, and the mix — not the number — is the defence.
order: 6
updated: 2026-11-27
tags: isotope, exposure, fire-marshall, defence, scores
seeds: reader, maintainer
---

# The stacked defence, scored

"Stacked" here means layers that each answer one question — where is it reachable
(**bind**), who may call (**token**), what may it reach (**agreement**), is the
forward authentic (**signed border**), what can the call do (**read-only**), and
who is watching (**alarm**). No layer is a boolean. Each is a knob, and the
defence is the stack's position on all of them, never the presence of any one.

The scans score that position. Two measurements, both named in *Reproduce*:

- **The exposure rubric** — eight dimensions, 0–4, equal weights,
  `ERI = sum/32 × 100`, higher is more exposed.
- **The protection board** — one row per decision the code enforces or the
  documents only declare, with `enforced` / `declared` / `gap` / `unknown`.

## The scores

| surface | what it is | ERI | network | local/supply |
| --- | --- | --- | --- | --- |
| raw wildcard edge | the fleet as it stood: wildcard adhd + registry | **78** | 83 | 75 |
| uvx / npx launchers | a fetched MCP server, stdio, no listeners | 41–44 | 17 | 55–60 |
| wildcards-closed projection | the raw edge on loopback, exec kept | 44 | 8 | 65 |
| **stacked edge, loopback** | the front on 8443 + the read-only MCP on 8090 | **19** | 25 | 15 |
| **stacked edge, WAN-widened** | the same stack with the bind widened | **25** | 42 | 15 |
| read-only MCP alone | the destination half | 13 | 17 | 10 |

The row that matters is the fourth: the stack is **below every launcher**, and it
is below the projection that assumed the same tools with the wildcard closed. The
projection was 44 because it kept the exec surface. The stack has no exec surface
to keep: the agreed destination is read-only.

The stacked edge is a separate deployment, not the old fleet with a flag flipped.
The comparison is of architectures, which is why the projection row exists — it is
the nearest thing to a like-for-like "same tools, no wildcard" reading.

## Why this is a defence, not a number

1. **The stack is the variable.** The raw edge and the stacked edge expose the
   same kind of tools. The score moves 78 → 19/25 because the bind, token,
   agreement, border and read-only destination are all present — not because a
   tool was removed.
2. **It beats the alternatives.** The launchers are 41–44; the stack is 19–25.
   Their dominant risk is the package fetched at launch. The stack's dominant
   residual is local and scoped: a signing key the caller cannot read.
3. **The projection is realised and beaten.** The earlier "if the wildcards
   close" projection was 44. The actual stack is 19/25 because the destination
   has no exec (`dim 3 = 0`) and holds no user credential (`dim 4 = 1`).
4. **The mix is the argument.** The protection board scores the edge as
   **5 enforced, 3 gap** — enforced: bind default, bearer token, operator
   agreement, signed border, read-only wire; gaps: rate, attribution, TLS. Those
   three gaps are why the front is loopback-only today. A defence that hid them
   would be a green majority, not a defence.
5. **The offence half agrees.** The flag test recovers a flag from the raw
   wildcard surface and names the bind as the offence. On the stack, the
   destination has no exec and no credential, so the same path has no tool to
   run. That is the claim made checkable, not asserted.

## The stack, layer by layer

| layer | the decision | the scan's reading |
| --- | --- | --- |
| bind | loopback by default; a WAN bind is explicit | a default, not a guard — the binary does not refuse a wide `addr` |
| token | `Authorization: Bearer`, constant-time | enforced; an empty token refuses all |
| agreement | a name resolves only through an operator file | enforced; the caller cannot supply a destination |
| border | HMAC over method, path, namespace, body digest, timestamp | enforced; no key refuses |
| destination | no write method on the wire | enforced; the CLI owns mutation |
| rate | a per-caller limit | **gap**; the alarm owns policy, this edge enables none |
| attribution | a caller identity per forward | **gap**; a decision count, not a caller |
| transport | TLS on a non-loopback bind | **gap**; plain HTTP, so a WAN bind needs a terminator |

The layers are ordered by what a caller must pass. A caller that fails the token
never learns a route; a caller that passes it can reach only an agreed border;
the border dispatches reads only. The three gaps sit outside that path: they
weaken how the stack is operated, not what a call can do.

## The counterpoint

A score is not a delivery. The [dead-proxy guide](/guides/red-with-no-viewer)
and the [mirror guide](/guides/mirror-health) are the check on this page: a
green light is true and useless if nothing consumes it, and a contract can be
satisfied by the failure it was meant to catch. The stacked score is a defence
only while the gaps are read and the alarm has a reader. The layers are knobs;
turning one down drops the position, and does not flip a flag labelled safe.

## Declared scope

- One host, one moment. The rubric is ordinal with equal weights; a different
  weight moves the number, not the direction.
- The WAN-widened row is a projection of the same stack with the bind changed. It
  is not a measurement of a live WAN deployment.
- The scores measure surfaces. They do not prove the absence of a bug, and a
  missing fact is `unknown`, never green.
- The protection rows resolve against the local code; a separate repository id is
  a later registration, not a prerequisite for the code half.

## The revision clause

This conclusion changes if:

- closing the raw wildcards does **not** move the fleet's 78 toward the edge's
  19/25 — then the rubric is not measuring the stack;
- closing a gap (rate, attribution, TLS) does **not** show on the board or move
  the residual — then the board is not measuring that layer;
- a launcher adopts a pinned local binary and the stack's supply chain worsens —
  then the ordering can change, and the mixed row is the one to reread.

## Reproduce and cite

- the measure: the exposure rubric and its vectors, including the new edge;
- the flows: the admission triangle (session → surface → authority) and the
  signed border;
- the offence: the flag test that recovers a file through the raw surface;
- the board: the protection rows for the edge, five enforced and three gap;
- the receipt: [/scans](/scans) states its snapshot and source hash, and the
  build refuses a snapshot that does not match its manifest.

The site's own gates keep the claim honest: the [charts](/charts),
[corpus](/corpus) and [scans](/scans) pages state their snapshots, and the
publish guard refuses a build that leaks a path, a credential, or a dead
internal link. A scored defence is a claim with a receipt.
