# Happy Time Connect — Project Notes

> **Purpose of this document:** onboarding and handover reference. Read this before you change anything. It explains what the app is, how it is put together, where everything lives, and the rules we follow. Known defects are tracked separately in [`APP-ISSUES.md`](./APP-ISSUES.md).

---

## 1. Overview

**Happy Time Connect** is a wholesale ordering web app for Happy Time, a watch and clock business.

It replaces phone calls and WhatsApp order-taking with a single place where:

- **Wholesale dealers** sign in, browse the catalogue, and place orders.
- **Online staff** work from an admin console to manage stock, orders, dealer accounts, pre-orders and customer feedback.

The business value is simple: one source of truth for stock and orders, visible to both the dealer and the staff member at the same time.

| Item | Value |
|---|---|
| Live app | https://happy-time-connect.vercel.app |
| Repository | `shxnzyy/ht-ws-project` (branch `happytime-ws`) |
| Hosting | Vercel — project `happy-time-connect`, team `shan-8dde`, Hobby plan, region `iad1` |
| Backend | Supabase — project **Happy Time Connect**, ref `unbhwpcpprornqvvlfxo`, Postgres 17, region `ap-southeast-1` (Singapore) |
| Support number shown in app | 077 352 8760 |

---

## 2. Who uses it

| Role | Entry point | What they do |
|---|---|---|
| **Dealer** (wholesale customer) | "Dealer view" on the sign-in page | Browse products, see dealer pricing and stock, place orders, follow their order status, raise pre-orders |
| **Staff / Admin** | "Admin view" — wholesale console | Manage catalogue and stock, process orders, approve dealers, track pre-orders, read feedback |
| **Public visitor** | Sign-in page | Contact details and a feedback form |

---

## 3. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Front end | **Vite** single-page app | Vanilla/React-style SPA built to `dist/`. Talk to Supabase **directly from the browser**. |
| Backend / database | **Supabase** (Postgres 17, Auth, Storage) | No custom server, no Edge Functions. The database *is* the API. |
| File storage | Supabase Storage, bucket `product-images` | Public read. Holds the logo and banner photos. |
| Hosting / CDN | Vercel | Static build + platform rewrites. |
| Analytics | Vercel Web Analytics + Speed Insights | Enabled, no data collected yet. |

### Build settings (must match, or deploys break)

```
Install command : npm install
Build command   : npm run build
Output directory: dist
Node version    : 26.x
```

### Environment variables (set in Vercel for production, preview and development)

| Key | Meaning |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** public key |

> **Rule:** the anon key is public by design — it is shipped inside the JavaScript bundle. The **`service_role` key must never appear in this app or in Git.** Anything that needs service-role power must run server-side (Edge Function or similar), never in the browser.

---

## 4. Architecture — read this twice

```
Browser (Vite SPA)
   │  anon key + user session
   ▼
Supabase PostgREST ──► Postgres (RLS is the security boundary)
   │
   └──► Storage (product-images)
```

There is **no application server**. The browser talks to Postgres through Supabase's REST API. That has two consequences:

1. **Row Level Security (RLS) is not optional.** It is the only thing standing between a logged-in dealer and every other dealer's data. Any table without a real policy is effectively public.
2. **Every secret in the front end is public.** Never place a private key, admin password, or privileged token in the SPA.

**Current state:** RLS is *enabled* on all tables but every row-level policy is `USING true`, which means open access. See `APP-ISSUES.md` items 1–4 before going near production traffic.

---

## 5. Data model

Seven tables in the `public` schema. Row counts are from the last audit and will grow.

| Table | Rows | Primary key | Purpose |
|---|---|---|---|
| `ht_products` | 6 | `sku` (text) | Catalogue: name, category, stock, reserved, price, image, trend, sort order |
| `ht_orders` | 8 | `id` (text, e.g. `WC-1008`) | Orders: dealer, city, date, amount, units, status, channel, delivery, reference, `lines` (jsonb) |
| `ht_preorders` | 3 | `id` (text) | Pre-orders: dealer, item, units, expected date, status, progress % |
| `ht_dealers` | 7 | `name` (text) | Dealer accounts: email, city, since, status, terms |
| `ht_admin_profile` | 1 | `email` (text) | Staff profile: name, role, phone, warehouse, `prefs` (jsonb) |
| `feedback` | 4 | `id` (bigint, serial) | Contact form: name, email, phone, rating 1–5, message, status `new`/`read` |
| `profiles` | 0 | `id` (uuid → `auth.users`) | Reserved for real user profiles. **Unused.** |

### Order lines shape

`ht_orders.lines` is a jsonb array of items:

```json
[
  { "sku": "HT-C-042", "name": "Regulator Wall Clock 30cm", "qty": 5, "price": 5212, "reservedQty": 0 }
]
```

There is **no line total field**, and `lines` is not enforced by any schema. Keep it that way until item 12 in the issue log is fixed.

### Value conventions in use

| Field | Values seen |
|---|---|
| Order `status` | `Completed`, `Ready`, `Packing` |
| Order `channel` | `Wholesale`, `Counter`, `Pre-order` |
| Dealer `status` | `Active`, `Pending approval`, `On hold` |
| Pre-order `status` | `Awaiting supplier`, `In transit`, `Confirmed` |
| Feedback `status` | `new`, `read` (the only CHECK-constrained status in the database) |

**Money and dates:** prices are `numeric`, LKR, no decimals. Dates are stored as **text** (`YYYY-MM-DD`) — a known defect, see issue 8.

---

## 6. Core flows

**Dealer places an order**
1. Dealer signs in.
2. Browses `ht_products`, sees price and available quantity (`stock - reserved`).
3. Adds items → app writes a row to `ht_orders` with the item array in `lines`, plus the total in `amount`, and reserves stock via `ht_products.reserved`.
4. Staff see the new order in the console and move it `Packing` → `Ready` → `Completed`.

**Staff manages stock**
Stock lives in `ht_products.stock` (physical) and `ht_products.reserved` (promised to open orders). Available = `stock - reserved`. **Completing an order must release its reservation** — this is not working today (issue 13).

**Pre-orders**
Dealer requests an item that is not in stock → `ht_preorders` row with an expected date and a progress percentage, tracked until it converts into a real order.

**Feedback**
The public form on the sign-in page inserts into `feedback`; staff read it and flip `status` from `new` to `read`.

---

## 7. Running it locally

```bash
git clone https://github.com/shxnzyy/ht-ws-project.git
cd ht-ws-project
npm install

# create .env.local — never commit this file
echo "VITE_SUPABASE_URL=https://unbhwpcpprornqvvlfxo.supabase.co" >> .env.local
echo "VITE_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>" >> .env.local

npm run dev      # local development
npm run build    # production build into dist/
```

Get the anon key from **Supabase → Project Settings → API**. Never paste the `service_role` key here.

---

## 8. Deploying

**How it works today:** deployments are pushed from a developer machine with the Vercel CLI. The Vercel project is **not connected to GitHub**, so pushing to `happytime-ws` does **not** redeploy the site.

```bash
vercel --prod
```

**How it should work (issue 24):** connect the GitHub repository to the Vercel project once, then every push to `happytime-ws` deploys automatically, pull requests get preview URLs, and the live commit is traceable.

**Two deployments exist**, both production: 3 Nov 2026 12:19 UTC and 4 Nov 2026 04:35 UTC. There is no staging environment — test on a Vercel preview URL, never on live data.

---

## 9. House rules (follow these in every change)

1. **Every new table gets RLS enabled and a real policy** in the same migration. No exceptions, no `USING true` in production.
2. **Link business records to `auth.users(id)`.** Dealers and staff are people; their rows must carry a `uuid` that points at their login.
3. **Never store money in the browser's arithmetic alone.** Totals are computed and stored once, server-side, and must equal the sum of the lines.
4. **Dates are `timestamptz` or `date`.** Never `text`.
5. **Statuses are constrained** with a CHECK or an enum, never free text.
6. **Use a surrogate `uuid` primary key** on editable business entities. Names, SKUs and emails change; ids do not.
7. **Foreign keys are mandatory** for anything that references another table.
8. **Never commit secrets.** Only `.env.example` with key names belongs in Git.
9. **Test with the demo data only**; never run experiments against live dealers or orders.

---

## 10. Handover checklist

- [ ] Supabase access transferred to a business-owned account, not a personal one.
- [ ] Vercel project connected to the GitHub repo.
- [ ] The SPA source code committed to Git (today only these notes are in the repo).
- [ ] RLS policies written and tested with a real dealer login.
- [ ] `.env.example` added; `.env.local` confirmed in `.gitignore`.
- [ ] A backup of the database taken before the first schema change.
- [ ] Custom domain attached, replacing the `*.vercel.app` address on invoices.

---

## 11. Where to look when something breaks

| Symptom | Check first |
|---|---|
| Page loads, no data | `VITE_SUPABASE_URL` / anon key in Vercel env vars; Supabase project health |
| Everything is empty for one dealer | RLS policy is filtering too much (or auth session lost) |
| "Permission denied" on write | Missing RLS `INSERT`/`UPDATE` policy |
| Wrong stock numbers | `ht_products.reserved` not released on completion (issue 13) |
| Upload of a product image fails | Storage has no `INSERT` policy (issue 18) |
| Password reset email never arrives | `site_url` still `localhost` and no SMTP (issues 19–20) |
| Live site shows old content | Vercel is not Git-linked; a redeploy is needed (issue 24) |

---

## 12. Document map

| File | Contents |
|---|---|
| `README.md` | Repository entry point |
| `SUMMARY.md` | One-page business summary of the project |
| `PROJECT-NOTES.md` | **This file** — technical onboarding and house rules |
| `PROJECT-NOTES-SIMPLE.md` | The same information in plain, everyday language |
| `APP-ISSUES.md` | Full defect log with severity and fixes |
