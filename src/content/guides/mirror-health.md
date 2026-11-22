---
title: The mirror said healthy
description: A protocol mismatch, a green status page, and the client that could not attach — a live-surface case study.
order: 4
updated: 2026-11-22
tags: mcp, handshake, observability, drift
seeds: maintainer
---

# The mirror said healthy

The mirror's status was `HEALTHY`. Its upstream catalog held 14 tools. Its rung was 0. The
client could not attach at all.

The green light was true and useless at the same time.

## The cast

- **OpenCode v2.0.26**, the client. It performs the MCP handshake, then calls tools.
- **The lab mirror**, a local proxy on port 8587, in front of Synapse.
- **Synapse**, the upstream on port 8585, a persistent code-knowledge graph.
- **The protocol line**: the mirror's `initialize` answer says `2026-07-28`; the client rejects
  that version as unsupported.
- **The DB and the log**: `session_message` records the calls; the OpenCode log records the
  handshake.

## The run

- **2026-10-22** — the client connects to Synapse and lists **14 tools**. It works for weeks.
- **2026-10-27T19:54:37Z** — the first `mcp connect failed server=synapse`; the error is the same
  every time: `Server's protocol version is not supported: 2026-07-28`.
- **2026-10-27T19:59:21Z** — the last `synapse.*` call in the DB. Two calls, from a connection
  that was already open. No Synapse call after that.
- **2026-11-22** — 86 sessions have been created since the first failure; only one made a Synapse
  call, and those were the two at 19:59. The mirror still says `HEALTHY`; the alarm is green.
- **At capture time** — the open session had 486 tool calls and **zero** MCP calls: 316 `shell`,
  131 `edit`, 32 `write`, 2 `read`, 2 `question`, 2 `websearch`, 1 `skill`. The work was
  filesystem and git, and the agent silently used shell.

## The numbers

The DB does not store MCP calls under their tool names. It stores them in
`content[].state.metadata.toolCalls` inside Code Mode `execute` parts. Read that field and the
history is there:

| window | top-level calls | nested MCP calls | Synapse |
| --- | ---: | ---: | ---: |
| all time | 46,476 | 5,902 | 2,589 |
| since first failure | 19,048 | 1,267 | 2 (both at 19:59) |
| capture session | 486 | 0 | 0 |

Before the failure, Synapse was the most-used nested tool: 1,388 `synapse_search_codebase` calls,
541 `synapse_inspect_files`, 175 `knowledge_cache`, 148 `manage_repos`, 141 `indexer_control`, 70
`capability_manifest`, 48 `ask_synapse`, 37 `explore_graph`.

The other MCP tools did not stop. Since the failure: open-knowledge 749, qdrant 102, code-search
77, adhd 31. The outage is specific, not a general collapse.

## Three lessons

**A health check is not a compatibility check.** The mirror's `/status` measures the upstream. The
upstream was healthy; the mirror's own `initialize` answer was the thing the client could not
accept. A green light can be accurate and still answer the wrong question.

**The check was pointed at the wrong side.** The client is the party that has to accept the
handshake. A probe that never impersonates the client can report green forever. The mirror's
initialize handler hard-coded `protocolVersion: "2026-07-28"` and discarded the client's requested
version. A version is a negotiation, not a banner.

**The fallback was silent.** Synapse was absent from the tool list, so the agent used shell. That
is a reasonable fallback for a filesystem task, but it was not announced, and `code-search` — a
connected MCP tool with 77 calls since the failure — was available. A missing tool is a fact to
state, not a gap to paper over with `grep`.

## The repair

1. **Negotiate, don't hard-code.** Return the client's requested protocol version (or the highest
   common version) from the mirror's initialize answer; keep the upstream handshake separate. The
   mirror already sends `2025-06-18` upstream, so the front should not be stricter than the back.
2. **Probe as the client.** Add an alarm target that initializes with the client's version and
   asserts the returned version. The current target proves the upstream is up; it does not prove
   the client can attach.
3. **Make the fallback explicit.** If the handshake fails, say so once and route source-code
   discovery to `code-search` or native tools, with the reason recorded.

## What the critic would say

This is not one of the model's four failure modes, and it is not a verdict-table entry. The model
is the citation-isotope carrier; this is a live-surface case study, like
[A value is not a verdict](/guides/le-roy-jenkins). The questions still apply: a protection is a
spectrum, a green light is not a verdict, and a check that cannot fail is not a check.

The honest reading is a spectrum position — **drift** — rather than a pass. The system was
reachable, the upstream was healthy, and the client was excluded by a version the front refused to
negotiate. A boolean `healthy` collapses that into a lie.

## Reproduce

Send `initialize` to the mirror on port 8587 and to the upstream on port 8585 with the client's
version; compare `result.protocolVersion`. Both answer `2026-07-28`; the client rejects it. The
first failure is in the log at `2026-10-27T19:54:37Z`, under `server=synapse`.

The tool record is in SQLite:

```sh
sqlite3 -readonly ~/.local/share/opencode/opencode.db \
  "select session_id, time_created, data from session_message where type='assistant' order by time_created"
```

Parse `content[].state.metadata.toolCalls`; the top-level tool name is not where the MCP call
lives.

## The pitch

A status page answers *is the upstream up?* A critic asks *can the client attach, with which
version, and what did it do when it could not?* The mirror was green for a month while the client
was locked out. That is the difference between a health check and a verdict.
