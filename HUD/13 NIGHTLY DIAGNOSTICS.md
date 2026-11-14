---
tags: [hud/core, hud, diagnostics, maintenance]
status: SCHEDULED
classification: STAFF-ONLY
---

# ◈ NIGHTLY DIAGNOSTICS

> Automated health sweep of [[00 COMMAND CENTER]] subsystems. Run after every deployment.

## CHECK LIST

| # | CHECK | PASS CONDITION | OWNER |
|---|---|---|---|
| 1 | Core reachable | project healthy | [[03 SUPABASE CORE]] |
| 2 | Table count | 7 present | [[03 SUPABASE CORE]] |
| 3 | Negative availability | 0 rows | [[07 INVENTORY CORE]] |
| 4 | Order reconciliation | 0 mismatches | [[06 ORDER PIPELINE]] |
| 5 | Orphan dealers | 0 references | [[09 DEALER REGISTRY]] |
| 6 | RLS coverage | every table has a real policy | [[05 SECURITY PERIMETER]] |
| 7 | Auth users | ≥ 1 staff account | [[05 SECURITY PERIMETER]] |
| 8 | Storage upload policy | exists for staff | [[03 SUPABASE CORE]] |
| 9 | Live build traceable | Git connected | [[04 VERCEL LAUNCH DECK]] |

## QUERY SET

```sql
-- 3. negative availability
SELECT sku, stock, reserved, stock - reserved AS available
FROM ht_products WHERE reserved > stock;

-- 4. reconciliation
SELECT id, amount,
       (SELECT SUM((l->>'qty')::numeric * (l->>'price')::numeric)
        FROM jsonb_array_elements(lines) l) AS computed
FROM ht_orders;

-- 5. orphans
SELECT o.id, o.dealer FROM ht_orders o
WHERE NOT EXISTS (SELECT 1 FROM ht_dealers d WHERE d.name = o.dealer);

-- 6. policy audit
SELECT tablename, policyname, cmd, qual FROM pg_policies
WHERE schemaname = 'public';
```

## REPORT FORMAT

```
DIAGNOSTIC RUN — <date>
PASS: n/9
FAIL: <which>
ACTION: <who> <when>
```

Results are summarised into [[15 METRICS BOARD]]; failures raise entries in [[14 INCIDENT LOG]].

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[01 JARVIS PROTOCOL]] · [[03 SUPABASE CORE]] · [[05 SECURITY PERIMETER]] · [[06 ORDER PIPELINE]] · [[07 INVENTORY CORE]] · [[12 STAFF RUNBOOK]] · [[15 METRICS BOARD]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
