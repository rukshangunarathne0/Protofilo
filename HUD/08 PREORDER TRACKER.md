---
tags: [hud/core, hud, preorders, operations]
status: WATCHING
classification: INTERNAL
---

# ◈ PREORDER TRACKER

> Hardware promised but not yet held. Source table `ht_preorders`. Feeds [[06 ORDER PIPELINE]] when goods land.

## OPEN PROMISES

| ID | DEALER | ITEM | UNITS | EXPECTED | STATE |
|---|---|---|---|---|---|
| — | registry node | — | — | — | Awaiting supplier |
| — | registry node | — | — | — | In transit |
| — | registry node | — | — | — | Confirmed |

**3 open · progress tracked as a percentage · expected date stored as text ⚠**

## LIFECYCLE

```mermaid
graph LR
    A[Awaiting supplier] --> B[In transit]
    B --> C[Confirmed]
    C --> D[Converted to order]
    D --> E[[06 ORDER PIPELINE]]
```

## RISK

- `expected` is free text — cannot sort by arrival, cannot alert on lateness.
- No foreign key to [[09 DEALER REGISTRY]] — a promise can belong to nobody.
- No automatic conversion: staff must remember to turn a landed pre-order into a real order.

## DESIRED BEHAVIOUR

1. `expected` becomes a real `date`.
2. Lateness raises a signal in [[15 METRICS BOARD]].
3. On arrival, one action moves units into [[07 INVENTORY CORE]] and flips the pre-order to the pipeline.

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[03 SUPABASE CORE]] · [[06 ORDER PIPELINE]] · [[07 INVENTORY CORE]] · [[09 DEALER REGISTRY]] · [[12 STAFF RUNBOOK]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
