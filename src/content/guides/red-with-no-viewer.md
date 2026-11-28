---
title: A verdict is not a delivery
description: Six days, a dead edge proxy, and 1,789 consecutive postures that read cve_safe — because a stopped proxy serves no HTTP/2, and the check that would have caught the outage was satisfied by it.
order: 5
updated: 2026-11-28
tags: nginx, unattended-upgrades, delivery, hysteresis, incident
seeds: maintainer
---

# A verdict is not a delivery

The previous guide ended GREEN. This one starts with the same edge proxy six days dead, and a
repair cycle that had been reporting on it every five minutes the whole time.

The contract was right. The response was right. Nothing was delivered.

## The cast

- the edge proxy on Debian 12, now `nginx/1.22.1-9+deb12u11` — the package that backports the
  CVE fix, not the source build the last run left behind
- `le-roy-jenkins-cycle.timer`, active, every five minutes, with its repair map and its cooldown
- the posture API at `192.168.1.30:3001`, down for the whole window
- eight vhosts carrying `http2 on;`, a directive that does not exist on 1.22
- `/var/log/le-roy-jenkins/cycle.log` — 51,699 lines, 2,163 postures, one reader: nobody

## The run

| when (UTC) | posture | what was true |
| --- | --- | --- |
| 2026-11-19 20:26:32 | **GREEN** | the previous run closes clean |
| 2026-11-20 00:04:47 | YELLOW | the API goes away; `E1` |
| 2026-11-20 02:26:47 | **GREEN** | the API answers again |
| 2026-11-21 06:08:32 | — | **nginx fails to start**: `unknown directive "http2"` |
| 2026-11-21 22:48:47 | RED | the first posture that noticed, sixteen hours later |
| 2026-11-21 22:54:17 | YELLOW | **and back to yellow**, five minutes later |
| 2026-11-21 → 25 | YELLOW ×1,184 | `fail: []`, `skip: [F1 F2 F3]` |
| 2026-11-25 17:43:55 | RED | `E1` becomes a FAIL, for a reason that is not nginx |
| 2026-11-28 00:35:47 | RED | this run arrives |

After the proxy died there are 1,790 postures. **`cve_safe` is `true` in 1,789 of them.** None of
them names the proxy. The verdict that should have been red for six days was, for four of them,
**YELLOW with an empty fail set** — and an empty fail set is not a nearly-fine, it is a statement
that nothing the contract defines as a failure happened.

The only reds in the window are somebody else: one posture with `I1` (the jumpbox) at 22:48, then
`E1` (the API) from 26 Nov. The proxy never appears.

## Three lessons

**A dead service is vacuously safe.** The product term is *affected build **and** HTTP/2 **and**
the run state*. With the process gone, the HTTP/2 term is false, so the product is false, so
`cve_safe` is true. The check was right about the product and blind to the outage: the proxy was
secure because it was not serving. `cve_safe: true` is not evidence of a fix — it is evidence of
this one thing, which a stopped process also satisfies. Any check whose "safe" answer can be
produced by the failure it is meant to catch needs a liveness precondition, or it is a check that
a crash can pass.

And the second half: **yellow is where the missing fact hides.** 1,182 postures carried an empty
fail set and the verdict YELLOW. Yellow reads as *a bit off, probably theirs*; it does not read as
*nothing is listening*. The contract had no term for "the thing is up", so nothing failed.

**A directive is a product term, and its failure is silent.** `http2 on;` landed in nginx 1.25.1.
On 1.22 it is not a configuration warning, it is `emerg`, and the service does not start. A
version banner sees none of that: the package was fixed, the config was plausible, and the unit
was `failed` for six days. The contract needs a check that the process is *up*, before it checks
anything about what the process does.

**A source build has an expiry date.** The 1.30.7 built over `/usr/sbin/nginx` on 19 Nov is gone:
`dpkg -S` owns the binary again, and `-V` shows the Debian prefix. An unattended upgrade at
`2026-11-27 06:02:29` moved `deb12u10 → deb12u11`. That upgrade is also the fix —
the changelog reads *"Backport security fixes from upstream 1.30.7: `d/p/CVE-2026-123633.patch`"*.
The package became the right answer while the source build became an unattended regression. Pin
it, or stop building it.

## The repair repeated the lesson

The first fix in this run was version-blind: comment out `http2 on;` so that 1.22's config test
passes. The service starts, HTTP/2 is off, and the light could go green on a build the tracker
still marks as affected — precisely the failure the previous guide is about, applied by the thing
reading it.

The correct change is the one the version supports:

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

```
nginx: configuration file /etc/nginx/nginx.conf test is successful
ALPN protocol: h2
lab.jamesgibson.co  200
```

HTTP/2 restored, with the backport underneath it. Both attempts are backed up under
`/root/nginx-backup-2026112*.tar.gz`, because a fix that cannot be undone is a second incident.

## What changes

- **Collect the view locally.** `ss`, `nft` and `systemctl` are on the box; the product term does
  not need an upstream API to be measurable. A monitor that needs a service which is itself down
  is a monitor that is quiet exactly when it matters.
- **Separate measured from unmeasured.** A posture carries how many checks ran. A required check
  that did not run is a FAIL, and the verdict says so in a word that is not YELLOW.
- **Deliver the verdict.** A posture in a log is not an alarm. The light needs a consumer —
  smoke-alarm, a notification, a human — or the contract is a diary.

## Reproduce

```
systemctl is-active nginx
echo | openssl s_client -connect lab.jamesgibson.co:443 \
  -servername lab.jamesgibson.co -alpn h2,http/1.1 2>/dev/null | grep "ALPN protocol"
zgrep -c CVE-2026-123633 /usr/share/doc/nginx/changelog.Debian.gz
python3 /tmp/timeline.py     # the posture timeline above, from cycle.log
systemctl list-timers le-roy-jenkins-cycle.timer
```

## The pitch

The previous page says *a value is not a verdict*. This one adds the other half: **a verdict is
not a delivery**. The red was true for six days. The contract computed it, the cycle logged it,
and nobody was told — so the edge stayed down while the instruments reported, accurately, into a
file.

A critic that can be re-run and disagree with itself is a critic nobody can quote.
A critic nobody reads is a critic nobody can use.
