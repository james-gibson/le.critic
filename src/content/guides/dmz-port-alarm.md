---
title: The three-minute port
description: A DMZ witness sink bound to every interface for three and a half minutes. A port alarm would have fired before the operator's prompt did.
order: 4
updated: 2026-11-21
tags: dmz, ports, alarm, network, incident
seeds: maintainer
---

# The three-minute port

A witness sink was deployed to a DMZ host to make a data-repair record independent of the
executor. It was bound to `0.0.0.0:8899`. The host's `INPUT` policy was `accept`, and no rule
mentioned the port. The service was reachable on the DMZ interface for **3 minutes 29 seconds**
before a human asked the question a port alarm should have asked automatically.

This is a detection-latency finding, not a breach report. The journal shows no connection to the
port during the window. The service required a bearer credential for writes and for the ledger
read, and the only unauthenticated route was a health check. The finding is that the *existence*
of the port was invisible to the alarm system, so the operator, not the instrument, found it.

## Snapshot

| Field | Value |
| --- | --- |
| Date | 2026-11-21 |
| Executor | the Mac (collector, credential holder, loopback services) |
| Witness host | DMZ, outside the firewall |
| Jump host | jack, used for admin because the Mac's key is not authorized on DMZ |
| Service | `xcel-witness`, the append-only witness sink |
| Fix commit | the commit that adds this page |
| Exposure window | `22:48:16Z` → `22:51:45Z` |
| Evidence | DMZ `journalctl`, `ss`, `nft`, the post-fix probes, the operator chat log |

The addresses are private lab addresses; they are not reachable from the public internet. They
are included because the timeline is the point and the interfaces are the finding: the DMZ side is
`eth0` at `192.168.0.2`; the LAN side is `eth1` at `192.168.1.226`.

## The timeline

| Time (UTC) | Event | Evidence |
| --- | --- | --- |
| `22:48:16` | `xcel-witness` starts on DMZ, bound `0.0.0.0:8899` | journal: `Started xcel-witness.service`, sink log `witness sink on 0.0.0.0:8899` |
| `22:49:24` | service restarted after the test ledger is cleared, still `0.0.0.0` | journal: stop/start pair |
| between `22:49` and `22:51:45` | operator asks: *"please verify you didnt add any holes to the WAN (DMZ is outside the firewall)"* | chat log order: deploy → prompt → audit → fix |
| `22:51:45` | audit finds `0.0.0.0:8899`, `INPUT` policy `accept`, no 8899 rule | `ss -ltnp`, `nft list ruleset` |
| `22:51:45` | unit is rebound to `192.168.1.226:8899` and restarted | journal: `Started ... witness sink on 192.168.1.226:8899` |
| `22:51:46` | DMZ-side probe fails, LAN-side probe answers, executor listeners are loopback-only | `curl` and `lsof` checks |
| after the fix | the RPC still reaches the sink and the local/remote ledgers agree | `xcel.diagnose` shows the sink state and the same open cycle |

The window is the interval between the first bind and the rebind: **3m29s**. The chat log does not
carry a clock, so it cannot shorten the window; it only fixes the order. The journal supplies the
times.

## What the first audit saw

The host is multi-homed: `eth0` is the DMZ side (`192.168.0.2`), `eth1` is the LAN side
(`192.168.1.226`), and `eth2` is another LAN address. The sink was bound to `0.0.0.0`, so it
listened on all of them. The host's nftables `INPUT` policy is `accept`; its rules cover SSH
protection and a small set of container addresses, and none of them mention 8899. The bind was the
only control, and it was the wrong one.

The read-only health route exposed state (current rung, head, open cycle, gaps) without a
credential. The write route and the ledger read required a bearer credential. After the fix, the
health route returns only `{"ok": true}`; state and records moved behind the credential.

## The alarm that was missing

The smoke alarm on the Mac watched two things during the window:

- its own `/status`; and
- the collector RPC's `/healthz`, which correctly reported the stale Xcel intake as a page.

It did not watch the DMZ host's listening set. Nothing in the target list answered the question
*"which ports did this host open, and on which interface?"* So the first detector of
`0.0.0.0:8899` was the operator's prompt.

A port-surface target would have fired at `22:48:16`, when the sink logged
`witness sink on 0.0.0.0:8899`. The alarm would have had two useful shapes:

1. **An allow-list.** The only permitted listener for this service is
   `192.168.1.226:8899`. Any other address—especially `0.0.0.0` or the DMZ-side address—is a
   finding.
2. **A baseline diff.** The DMZ host's port set before the deploy did not include 8899. A new
   listener on a non-loopback interface is a finding even before the service has a name.

The first is a policy; the second is a discovery instrument. The second is what catches the next
service nobody wrote a policy for.

## Verdicts

| Outcome | Verdict | Why |
| --- | --- | --- |
| Bind address | `violation` from `22:48:16` to `22:51:45` | the socket listened on the DMZ interface |
| Host firewall | `drift` | `INPUT` policy `accept`; no rule for 8899; the bind was the only control |
| Alarm coverage | `violation` | no DMZ port target; the smoke alarm watched the executor's RPC, not the DMZ host |
| Evidence continuity | `pass` | journal, `ss`, `nft`, post-fix probes, and the chat log agree on the interval |
| Credential exposure | `drift` | writes and ledger reads were gated; the health route exposed state before the fix |
| Unauthorized access | not evidenced | the journal shows no connection to 8899 during the window; this is a near-miss, not an incident |

`violation` is reserved for the exposure. The firewall is `drift` because the host could have
failed closed and did not. The alarm coverage is a `violation` for the same reason: the instrument
that should have seen the surface did not have the surface in its target set.

## The fix

- The sink binds `192.168.1.226:8899`, the LAN-side interface only.
- The systemd unit carries `IPAddressAllow=192.168.1.0/24` and `IPAddressDeny=0.0.0.0/0`, plus
  `RestrictAddressFamilies=AF_INET AF_UNIX`, `ProtectSystem=strict`, `ProtectHome=read-only`, and
  a single writable path for the ledger.
- The unauthenticated health route is minimal; state and records require the bearer credential.
- The executor's services remain loopback-only: the collector RPC, the dashboard, and the smoke
  alarm did not add a listening socket on a non-loopback interface.

## Reproduce

From the Mac, through the jump host:

```sh
ssh jack 'ssh dmz "sudo ss -ltnp | grep 8899"'
ssh jack 'ssh dmz "sudo nft list ruleset | grep -A6 \"chain INPUT\""'
ssh jack 'ssh dmz "systemctl show xcel-witness -p IPAddressAllow -p IPAddressDeny -p RestrictAddressFamilies"'
```

The present state must be one listener on the LAN side, and the unit must carry the allow/deny
pair. The probes that distinguish the interfaces:

```sh
curl -s -o /dev/null -w '%{http_code}\n' http://192.168.1.226:8899/healthz
curl -s -o /dev/null -w '%{http_code}\n' http://192.168.0.2:8899/healthz
```

The first returns `200` with `{"ok": true}`. The second returns `000`: no listener on the DMZ
interface. The executor's listener check is the third receipt:

```sh
lsof -nP -iTCP -sTCP:LISTEN | grep -E '6969|8088|8791'
```

Every line should be loopback. The port numbers may change; the interface must not.

## What the system did well

The Xcel intake was already failing authentication; the health report and the smoke alarm made
that a `page` instead of a silent gap. The witness ledger gave the repair a join key, and the RPC's
diagnose route returned the sink state after the fix. The DMZ journal made the exposure window
exact, and the `ss`/`nft` audit made the finding checkable. The system supplied the evidence that
made this page possible.

The system did not supply the alarm that would have made the page unnecessary.

## The revision clause

This conclusion changes if:

- the journal shows a connection to 8899 on the DMZ interface during the window — then it is an
  incident, not a near-miss;
- the host firewall had dropped 8899 on that interface — then the bind is a `drift`, not a
  `violation`, because the host failed closed;
- the health route had been minimal from the start — then the information exposure is lower, but
  the bind is still a `violation`;
- a port alarm existed and fired during the window — then the detection latency is the alarm's,
  not the operator's, and this page is a false negative rather than a missing instrument.

## What to add

1. A port-surface target on the DMZ host: assert the allowed listener set, and page on any new
   non-loopback listener.
2. A host firewall drop for 8899 on the DMZ and secondary interfaces, persisted, so the bind is
   not the only control.
3. A baseline of the DMZ port set captured before a deploy, so a new listener is visible without a
   policy that names it.
4. Keep the witness record append-only on the remote host. The alarm should watch the surface that
   changed, not only the age of the data it protects.
