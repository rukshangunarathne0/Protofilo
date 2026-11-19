---
tags: [hud/core, hud, glossary, reference]
status: REFERENCE
classification: PUBLIC-SAFE
---

# ◈ GLOSSARY

> Decode the language used across [[00 COMMAND CENTER]].

| TERM | MEANING |
|---|---|
| **RLS** | Row Level Security — the doorman inside the database that decides who may see which rows → [[05 SECURITY PERIMETER]] |
| **Anon key** | Public key shipped in the browser. Safe to expose *only* when RLS works |
| **Service role key** | Master key. Must never touch the browser |
| **SPA** | Single Page App — one HTML file that swaps screens in the browser → [[02 SYSTEM MAP]] |
| **Supabase** | Hosted Postgres plus auth and file storage → [[03 SUPABASE CORE]] |
| **Vercel** | Host that serves the site and gives it an address → [[04 VERCEL LAUNCH DECK]] |
| **Stock** | Physical units on the shelf |
| **Reserved** | Units already promised to open orders |
| **Available** | Stock minus reserved → [[07 INVENTORY CORE]] |
| **Reservation release** | Returning promised units to availability when an order completes |
| **Reconciliation** | Proving a stored total matches its own line items → [[06 ORDER PIPELINE]] |
| **Orphan** | A record pointing at something that does not exist → [[09 DEALER REGISTRY]] |
| **Migration** | A recorded, repeatable change to the database shape |
| **Trigger** | Code the database runs automatically on insert or update |
| **Edge Function** | Small piece of server-side code, used when the browser must not be trusted |
| **Staging** | A private copy used for testing before live traffic |
| **HUD** | This documentation layer — Jarvis-style overlay over the project files |
| **Phase** | A work block in [[16 ROADMAP PHASES]] |

## WHY PLAIN WORDS MATTER

Every entry here also appears in simpler form in [[PROJECT-NOTES-SIMPLE]] — the rule from [[01 JARVIS PROTOCOL]] is that a term nobody can explain is a term nobody should use.

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[02 SYSTEM MAP]] · [[03 SUPABASE CORE]] · [[05 SECURITY PERIMETER]] · [[07 INVENTORY CORE]] · [[11 DEALER PLAYBOOK]] · [[12 STAFF RUNBOOK]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
