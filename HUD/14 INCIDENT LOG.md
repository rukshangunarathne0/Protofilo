---
tags: [hud/core, hud, incidents, log]
status: MONITORING
classification: INTERNAL
---

# ◈ INCIDENT LOG

> Every deviation from expected behaviour, written once, referenced forever. Feeds [[15 METRICS BOARD]] and [[16 ROADMAP PHASES]].

## OPEN INCIDENTS

| ID | DATE | SEVERITY | SIGNAL | STATE |
|---|---|---|---|---|
| INC-001 | 2026-11-04 | 🔴 CRITICAL | All tables open to anonymous write | OPEN |
| INC-002 | 2026-11-04 | 🔴 CRITICAL | Zero real accounts in Auth | OPEN |
| INC-003 | 2026-11-04 | 🔴 CRITICAL | Public demo admin entry point | OPEN |
| INC-004 | 2026-11-04 | 🟠 HIGH | Negative availability on 3 SKUs | OPEN |
| INC-005 | 2026-11-04 | 🟠 HIGH | 8/8 order totals unreconciled | OPEN |
| INC-006 | 2026-11-04 | 🟠 HIGH | 1 orphan order (unknown dealer) | OPEN |
| INC-007 | 2026-11-04 | 🟠 HIGH | Auth site URL points to localhost | OPEN |
| INC-008 | 2026-11-04 | 🟡 MEDIUM | Product images are placeholders | OPEN |
| INC-009 | 2026-11-04 | 🟡 MEDIUM | Vercel not connected to Git | OPEN |
| INC-010 | 2026-11-04 | 🟡 MEDIUM | App source not in repository | OPEN |

## ENTRY TEMPLATE

```
ID        : INC-0xx
DATE      : YYYY-MM-DD
DETECTED  : how
IMPACT    : data / money / availability
ROOT CAUSE: subsystem → 0x
ACTION    : change made
VERIFIED  : yes/no
LINKS     : [[06 ORDER PIPELINE]] …
```

## SEVERITY KEY

- 🔴 **CRITICAL** — data loss or exposure, or the system lies about identity.
- 🟠 **HIGH** — wrong numbers on screen, or a workflow blocked.
- 🟡 **MEDIUM** — quality, operations, presentation.

## CLOSED

*None yet — this is the first diagnostic cycle.*

Detail and fixes: [[APP-ISSUES]] · Sequence: [[16 ROADMAP PHASES]] · Checks: [[13 NIGHTLY DIAGNOSTICS]]

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[01 JARVIS PROTOCOL]] · [[05 SECURITY PERIMETER]] · [[06 ORDER PIPELINE]] · [[07 INVENTORY CORE]] · [[12 STAFF RUNBOOK]] · [[15 METRICS BOARD]] · [[16 ROADMAP PHASES]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
