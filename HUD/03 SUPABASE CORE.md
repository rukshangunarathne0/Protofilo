---
tags: [hud/core, hud, database, supabase, core]
status: ONLINE
classification: INTERNAL
---

# ◈ SUPABASE CORE

> Project **Happy Time Connect** · ref `unbhwpcpprornqvvlfxo` · Postgres 17 · `ap-southeast-1` (Singapore).

## CORE VITALS

| PARAMETER | READING |
|---|---|
| Status | 🟢 ACTIVE_HEALTHY |
| Engine | Postgres 17.11 |
| Region | ap-southeast-1 — correct for Sri Lanka |
| Tables | 7 (`public`) |
| Edge functions | 0 |
| Auth users | **0** ⚠ see [[05 SECURITY PERIMETER]] |
| Storage buckets | 1 — `product-images` (public read) |

## TABLE REGISTRY

| TABLE | ROWS | KEY | ROLE |
|---|---|---|---|
| `ht_products` | 6 | `sku` | hardware catalogue → [[07 INVENTORY CORE]] |
| `ht_orders` | 8 | `id` | order ledger → [[06 ORDER PIPELINE]] |
| `ht_preorders` | 3 | `id` | future hardware → [[08 PREORDER TRACKER]] |
| `ht_dealers` | 7 | `name` ⚠ | network registry → [[09 DEALER REGISTRY]] |
| `ht_admin_profile` | 1 | `email` | staff identity |
| `feedback` | 4 | `id` | street signal → [[10 FEEDBACK SIGNAL]] |
| `profiles` | 0 | `id` → auth | **unused** |

## ORDER LINE PAYLOAD

```json
{ "sku": "HT-C-042", "name": "Regulator Wall Clock 30cm",
  "qty": 5, "price": 5212, "reservedQty": 0 }
```

No line total. No schema. Money cannot be reconstructed → [[06 ORDER PIPELINE]].

## STRUCTURAL FAULTS

- Dealer keyed by **name** — rename breaks the network.
- **Zero foreign keys** between business tables.
- Dates are `text`, not `date`.
- Statuses are free text (except `feedback`).
- **Zero triggers** — `updated_at` never moves.
- Only primary-key indexes.

Full detail: [[APP-ISSUES]] items 10–17.

## ACCESS CHANNELS

Dealer → [[11 DEALER PLAYBOOK]] · Staff → [[12 STAFF RUNBOOK]] · Health → [[13 NIGHTLY DIAGNOSTICS]]

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[02 SYSTEM MAP]] · [[05 SECURITY PERIMETER]] · [[06 ORDER PIPELINE]] · [[07 INVENTORY CORE]] · [[17 GLOSSARY]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
