---
tags: [hud/core, hud, roadmap, plan]
status: PHASE 1
classification: INTERNAL
---

# ◈ ROADMAP PHASES

> Six phases from "anyone can erase the core" to "polished wholesale platform".

```mermaid
graph LR
    P1[1 STOP BLEEDING] --> P2[2 REAL IDENTITY]
    P2 --> P3[3 TRUE NUMBERS]
    P3 --> P4[4 SCHEMA HYGIENE]
    P4 --> P5[5 TRUST PIPELINE]
    P5 --> P6[6 POLISH]
```

## PHASE 1 — STOP THE BLEEDING 🔴

- Close every open RLS policy → [[05 SECURITY PERIMETER]]
- Remove the public demo admin entry
- Gate `profiles` behind the owner
**Exit test:** an anonymous request returns zero business rows.

## PHASE 2 — REAL IDENTITY 🔴

- Create staff and dealer accounts in Auth
- Link registry rows to `auth.users`
- Fix site URL and SMTP → [[PROJECT-NOTES]]
**Exit test:** a dealer logs in and sees only their own pipeline.

## PHASE 3 — TRUE NUMBERS 🟠

- Release reservations on completion → [[07 INVENTORY CORE]]
- Line totals, tax, delivery → [[06 ORDER PIPELINE]]
- Back up the database before touching rows
**Exit test:** diagnostics 3 and 4 return zero rows → [[13 NIGHTLY DIAGNOSTICS]]

## PHASE 4 — SCHEMA HYGIENE 🟠

- Surrogate ids, foreign keys, real dates, CHECK constraints, `updated_at` triggers, indexes
- Migrate the orphan order into [[09 DEALER REGISTRY]]

## PHASE 5 — TRUST THE PIPELINE 🟡

- Connect Git to Vercel → [[04 VERCEL LAUNCH DECK]]
- Commit the app source
- Add a staging environment and previews

## PHASE 6 — POLISH 🟡

- Real product photography
- Storage upload policy for staff
- Custom domain, analytics, error tracking

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[05 SECURITY PERIMETER]] · [[06 ORDER PIPELINE]] · [[07 INVENTORY CORE]] · [[14 INCIDENT LOG]] · [[15 METRICS BOARD]] · [[APP-ISSUES]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
