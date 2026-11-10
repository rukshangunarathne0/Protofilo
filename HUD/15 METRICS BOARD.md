---
tags: [hud/core, hud, metrics, kpi]
status: LIVE
classification: INTERNAL
---

# ◈ METRICS BOARD

> The numbers that decide whether this system is winning. Readings taken 2026-11-04.

## CORE READINGS

| METRIC | VALUE | TREND |
|---|---|---|
| Dealers in network | 7 | 🟢 |
| Active dealers | 5 | 🟢 |
| Orders logged | 8 | 🟢 |
| Completion rate | 6 / 8 = 75% | 🟢 |
| Open pre-orders | 3 | 🟡 |
| SKUs in catalogue | 6 | 🟡 thin |
| SKUs below safe stock | 3 | 🔴 |
| Orders unreconciled | 8 / 8 | 🔴 |
| Real auth users | 0 | 🔴 |
| Open incidents | 10 | 🔴 |

## HEALTH GAUGE

```mermaid
graph LR
    A[SECURITY 10%] --> B[DATA 40%]
    B --> C[OPERATIONS 70%]
    C --> D[PRESENTATION 75%]
```

## COMMERCIAL PICTURE

| MODEL | PRICE (LKR) | STOCK | NOTE |
|---|---|---|---|
| Skeleton Tourbillon — Dealer Ed. | 69,377 | 1 | flagship, 15 promised |
| Diver Chronograph 42mm | 15,985 | 2 | oversubscribed |
| Meridian Automatic 40mm | 12,450 | 4 | oversubscribed |
| Regulator Wall Clock 30cm | 5,212 | 18 | healthy |
| Pendulum Table Clock | 4,520 | 23 | healthy |
| Aurelia Slim Quartz | 4,190 | 61 | volume driver |

## WHAT TO WATCH WEEKLY

1. Available units per SKU → [[07 INVENTORY CORE]]
2. Reconciliation gap → [[06 ORDER PIPELINE]]
3. Unread signal → [[10 FEEDBACK SIGNAL]]
4. Incident ageing → [[14 INCIDENT LOG]]
5. Diagnostic pass rate → [[13 NIGHTLY DIAGNOSTICS]]

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[01 JARVIS PROTOCOL]] · [[06 ORDER PIPELINE]] · [[07 INVENTORY CORE]] · [[09 DEALER REGISTRY]] · [[14 INCIDENT LOG]] · [[16 ROADMAP PHASES]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
