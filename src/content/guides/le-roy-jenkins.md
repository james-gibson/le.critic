---
title: A value is not a verdict
description: The le.roy jenkins run, an nginx upgrade, and the red light in the install window that a version banner would have missed.
order: 3
updated: 2026-11-19
tags: honeypot, fail2ban, nginx, hysteresis
seeds: maintainer
---

# A value is not a verdict

`http2 on` is benign on most days. This is the day it was not — and then the day it was again,
because the version changed underneath it.

## The cast

- an edge proxy on Debian 12, nginx `1.22.1-9+deb12u10` — the bookworm security build the
  tracker still marked vulnerable
- an empty honeypot on the API host: `le.roy jenkins`, which announces a never-event and logs
  who checked
- a two-target smoke-alarm: one target asserts `cve_safe` (the product term), one asserts
  `fix_safe` (the whole contract)
- a fix contract that separates the CVE precondition (A1) from the run state (A2): a fixed
  package is not a fixed process

## The run

- `19:30:29Z` — HTTP/2 on nine vhosts, `1.22.1`, API down, no jail. Summary **2 unhealthy**.
  **RED.**
- `19:31:17Z` — the `http2` token removed from the nine vhosts, `/etc/nginx` backed up,
  `nginx -t`, reload. External ALPN drops to `1.1`.
- `19:32:28Z` — `cve_safe` true, `fix_safe` false. Summary **1 healthy / 1 unhealthy**. **YELLOW.**
- `19:57Z` — nginx `1.30.7` built from source and installed over `/usr/sbin/nginx`. The Debian
  package still says `1.22.1`. No restart yet.
- `19:58:01Z` — `nginx -v` says `1.30.7`; `readlink /proc/<master>/exe` says
  `/usr/sbin/nginx (deleted)`. A1 passes, **A2 fails**. `cve_safe` false. **RED.**
- `19:58:18Z` — the alarm reads **2 unhealthy**. **RED.**
- `19:58:41Z` — `systemctl restart nginx`; on-disk and running both `1.30.7`.
- `19:58:47Z` — `cve_safe` true, `fix_safe` false. **1 healthy / 1 unhealthy**. **YELLOW.**
- `20:16:23Z` — nft and `ss` measured; `22` declared jumpbox, `53` declared dns; explicit egress
  rules for the API and the jumpbox. `fix_safe` true. **GREEN**, with an `E7` advisory.
- `20:16:41Z` — the alarm reads **2 healthy**. **GREEN.**
- `20:26:07Z` — the egress chain deleted; `E2` fails.
- `20:26:32Z` — one repair cycle re-applied `E2`; the gate is **GREEN** again.
- `20:26:58Z` — the five-minute timer's next cycle finds nothing to do.

The red in the middle is the point. The package was fixed at `19:57`; the process was not. A
version banner would have called that green. The contract did not.

## Three lessons

**Install is not restart.** The master kept serving the old inode. A2 exists because
`nginx -s reload` and `systemctl reload` do not replace the running binary; only a restart does.
The window is short and entirely invisible to a version check.

**A value is not a verdict.** `http2` was red at `19:30`, harmless at `19:32` once the product
term cleared, and would have been harmless again on `1.30.7`. The alarm watches the product —
affected build **and** HTTP/2 **and** the run state — not the value.

**The observed peer is the only key.** The honeypot behind the proxy saw the proxy, not the
client. The signal had to move to the edge, where `$remote_addr` is the observed peer and
`X-Forwarded-For` is recorded but never trusted. A NAT collapse still means the edge can see the
gateway; preserve the client address, or sit outside the NAT.

## Green without closing 22

The first instinct was to close 22. That is wrong: 22 is the jumpbox port. The better model is a
**declared exception gated on the capability** — 22 stays open, and the contract passes it only
if the jumpbox is user-key-only (no resident key, no agent socket).

The same move covers the rest:

- the ingress is read from nftables and `ss` (Docker's own control plane excluded), so `22`, `53`
  and `443` are measured, not guessed;
- `22` is declared `jumpbox`, `53` is declared `dns`;
- the egress has explicit `api` and `jumpbox` rules to the host, and `22` is allowed only under
  the user-key gate.

The gate goes **GREEN** with 22 still open. One advisory remains: `E7` notes the egress policy is
`accept`, so the allow rules are declarative, not enforcing. That is a spectrum position, not a
hidden pass — the light is green and the warning is visible.

A scanner would have said "close 22". A critic says "declare it, gate it, and show the advisory."

## A response defense, not a flood

The durable fix is systemd: a oneshot unit loads the nft chain at boot. The
response is a bounded cycle on a five-minute timer:

1. collect the view — one API probe, one TCP connect;
2. map each FAIL to the smallest idempotent action: reload the egress, reload
   the jail, restart onto the on-disk binary;
3. apply at most two actions, with a 300-second cooldown per action;
4. re-collect once and record the posture.

There is no scan, no ping sweep and no mass ban. The only attacker-facing action
is the jail's per-IP ban, which already has `maxretry` and `findtime`. The test
was simple: delete the egress chain, run one cycle, and watch `E2` disappear and
the gate return to green; a second cycle found nothing to do.

Everything else escalates. `A1` is a config change, `E1` is another host,
`I1/I2` are the jumpbox (do not close 22), `E7` is a firewall policy. A repair
that tries to fix those automatically is not a defense; it is a second way to be
wrong.

## Reproduce

```sh
python3 fix_contract.py --selftest
python3 fix_contract.py --posture --raw <view>
python3 fix_contract.py --serve $POSTURE_BIND --raw <view>
ocd-smoke-alarm serve --config smoke-alarm-run.yaml --mode=headless
hurl --test --variable base=$POSTURE_URL hurl/state.hurl
/usr/local/sbin/le-roy-jenkins-cycle
systemctl list-timers le-roy-jenkins-cycle.timer
```

The view is collected read-only on the edge; the honeypot logs two streams — the legitimate API
path is benign, every decoy path is `signal=le.roy-jenkins`.

## The pitch

A scanner asks *is the version fixed?* and answers a boolean. A critic asks *which product term
is true, in which run state, against which declared curve?* and answers with a light and a
window. The difference is the two minutes when the package was new and the process was old:
the scanner says green, the critic says red, and only one of them is telling you the truth.
