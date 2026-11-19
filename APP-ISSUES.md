# Happy Time Connect — Issues & Fixes

Full defect log from the audit of the live app (https://happy-time-connect.vercel.app), the Vercel project `happy-time-connect` and the Supabase project `unbhwpcpprornqvvlfxo`.

**Audit date:** 2026-11-04
**Severity:** 🔴 critical (data loss / exposure) · 🟠 high (wrong data or blocked workflow) · 🟡 medium (quality, ops, polish)

Work top to bottom. Tick a box only when the fix is deployed and verified with a real login.

---

## 🔴 Critical — deployment (found 2026-11-04)

- [ ] **0. The Vercel project is not connected to GitHub, so no commit ever deploys.**
  Evidence from the Vercel API: project `happy-time-connect`
  (`prj_afOrGoM742CdLRbt8ZwcipA5tZ7C`) has no linked Git repository, has only
  **two deployments in its lifetime**, both with empty `meta` (manual uploads, not
  commits), and the newest is hours older than every merged pull request. The
  project also had `rootDirectory: null` while the app lives in `app/`, so a build
  from the repo would have failed even if it had been triggered.
  **Consequence:** everything merged since the first performance pass — the mobile
  rendering budget, the order timeline skeleton, the WebP artwork, the product
  photo upload and the new Add product page — has never been live. The site has
  been serving one frozen snapshot, which is why the app still felt slow and the
  console still showed the old sheet.
  **Fixed already:** `rootDirectory` is now `app`, with `npm install` /
  `npm run build` / `dist` as the commands.
  **Still to do (owner action, one minute):**
  1. Vercel → project **happy-time-connect** → **Settings → Git → Connect Repository**.
  2. Choose **shxnzyy/ht-ws-project** and authorise the Vercel GitHub app for it.
  3. Set **Production Branch** to `happytime-ws` (the repo's default branch).
  4. Confirm Git deployments are enabled, then **Deployments → ⋯ → Redeploy**.
  After that every merged pull request deploys automatically.

## 🔴 Critical — security

- [ ] **1. Every table is open to the public (RLS `USING true`).**
  All seven policies (`ht_products_all`, `ht_orders_all`, `ht_dealers_all`, `ht_preorders_all`, `ht_admin_profile_all`, `feedback_all`) allow role `anon` full `SELECT/INSERT/UPDATE/DELETE`. The anon key is inside the public JS bundle, so any visitor can read, edit or delete dealers, orders, stock and prices.
  **Fix:** replace each policy with one keyed to `auth.uid()`. Dealers read only their own rows; staff (role claim) read and write all. Delete the blanket policies before going live.

- [ ] **2. There are no real accounts (`auth.users = 0`).**
  The 7 dealers and 1 staff member exist only as table rows. Sign-in is cosmetic, so no policy can tell a dealer from an admin.
  **Fix:** create accounts through Supabase Auth, add `dealer_id uuid REFERENCES auth.users(id)` to `ht_dealers` and the same to `ht_admin_profile`, and drive UI permissions from that.

- [ ] **3. Demo sign-in buttons are exposed on the public login page.**
  "Quick demo sign-in → Dealer view / Admin view" gives anyone the wholesale console in one tap.
  **Fix:** gate behind an environment flag (`import.meta.env.DEV` or `VITE_DEMO_MODE`) so the buttons never ship to production.

- [ ] **4. `profiles` is readable by anonymous users.**
  Policy `profiles_read` is `SELECT USING true` for `anon`. Empty today, dangerous the moment it is used.
  **Fix:** `USING (id = auth.uid())`.

- [ ] **5. Weak authentication settings.**
  `password_min_length = 6`, HIBP breach check off, captcha off, signup open to everyone, no MFA on the admin account.
  **Fix:** minimum 8–10 characters, enable breach protection, disable open sign-up (invite dealers instead), require MFA for staff.

- [ ] **6. Public feedback form is unthrottled.**
  Anyone can insert unlimited rows into `feedback`; the business receives them by phone/WhatsApp.
  **Fix:** captcha (hCaptcha/Turnstile) + per-IP rate limit, or move submission behind an Edge Function.

---

## 🟠 High — authentication & configuration

- [ ] **7. `site_url` is `http://localhost:3000` and the redirect allow-list is empty.**
  Password reset and email confirmation links are generated for a developer's computer and will fail for real users.
  **Fix:** Supabase → Authentication → URL Configuration → Site URL = `https://happy-time-connect.vercel.app`; add the same to Redirect URLs.

- [ ] **8. Email confirmation is ON but no SMTP is configured (`mailer_autoconfirm = false`).**
  New sign-ups likely never receive the confirmation mail; the built-in mailer is heavily rate limited.
  **Fix:** add SMTP credentials (business mailbox), or temporarily disable "Confirm email" until SMTP is ready.

- [ ] **9. `updated_at` columns never update.**
  Five tables have `updated_at`, but the database contains **zero triggers**, so the values are frozen and misleading.
  **Fix:** add a `set_updated_at()` trigger function to every table with that column.

---

## 🟠 High — database design

- [ ] **10. Dealer name is the primary key.** `ht_dealers_pkey PRIMARY KEY (name)`.
  Renaming a dealer breaks every reference; two dealers can never share a name.
  **Fix:** add `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`; keep `name` as a normal column; migrate orders to reference the id.

- [ ] **11. No foreign keys except `profiles.id → auth.users`.**
  `ht_orders.dealer`, `ht_preorders.dealer` and `ht_orders.lines[].sku` are loose text.
  **Fix:** add `dealer_id` and a proper `order_lines` table (or a validated jsonb shape) with real FKs.

- [ ] **12. Orphan record already present.** 1 of 8 orders references `Nuwara Eliya Clock House`, which is not in `ht_dealers`.
  **Fix:** create the missing dealer or correct the order, then enforce with a foreign key.

- [ ] **13. Dates are stored as `text`.** `ht_orders.date`, `ht_dealers.since`, `ht_preorders.expected`.
  No sorting, no range queries, no validation.
  **Fix:** migrate to `date` / `timestamptz` with a controlled conversion and a `CHECK` on the legacy strings first.

- [ ] **14. Status fields are free text.** Only `feedback.status` and `feedback.rating` have CHECK constraints.
  `ht_orders.status`, `ht_orders.channel`, `ht_dealers.status`, `ht_preorders.status` accept anything — a typo creates a phantom state.
  **Fix:** add CHECK constraints (or enums) using the values already in the data: `Completed|Ready|Packing`, `Wholesale|Counter|Pre-order`, `Active|Pending approval|On hold`, `Awaiting supplier|In transit|Confirmed`.

- [ ] **15. `ht_products` uses `sku` as the primary key** and `ht_orders` uses a business code (`WC-1008`) as its primary key.
  Workable, but renames become migrations.
  **Fix:** surrogate uuid keys, business codes as `UNIQUE` columns.

- [ ] **16. No indexes besides primary keys.**
  Harmless at 8 rows, slow at 8,000.
  **Fix:** index `ht_orders(dealer_id)`, `ht_orders(status)`, `ht_orders(created_at)`, `ht_preorders(dealer_id)`.

- [ ] **17. `lines` jsonb has no schema and no line totals.**
  Order maths cannot be recomputed (see 19).
  **Fix:** add `total` per line, or normalise into an `order_lines` table with `qty`, `unit_price`, `line_total`.

---

## 🟠 High — business logic / wrong numbers

- [ ] **18. Negative availability on three products.** Reservations are never released.

  | SKU | Product | Stock | Reserved | Available |
  |---|---|---|---|---|
  | HT-W-214 | Meridian Automatic 40mm | 4 | 22 | **−18** |
  | HT-W-330 | Diver Chronograph 42mm | 2 | 7 | **−5** |
  | HT-W-512 | Skeleton Tourbillon — Dealer Ed. | 1 | 15 | **−14** |

  **Fix:** recompute `reserved` from open orders, release on `Completed`, add `CHECK (reserved >= 0 AND reserved <= stock)` once the data is clean, and move stock changes into a single transactional function.

- [ ] **19. Order totals do not reconcile — 8 of 8 orders.**
  `WC-1008`: lines = 5×5,212 + 3×4,520 = **39,620**, stored `amount` = **39,636**.
  `WC-1009`: lines = 18×12,450 + 14×4,190 = **282,760**, stored `amount` = **330,083**.
  There are no tax, discount or shipping fields, so the gap is unexplainable — invoices cannot be trusted.
  **Fix:** decide the money model (tax inclusive or exclusive, delivery charges), store those fields separately, compute `amount` from the lines, and enforce it with a trigger.

- [ ] **20. Reservations are stored twice.** `ht_products.reserved` and `reservedQty` inside each order line. The two already disagree.
  **Fix:** one source of truth — derive `reserved` from open order lines; delete `reservedQty` from the jsonb.

- [ ] **21. Unit counts are not enforced.** `ht_orders.units` happens to equal the sum of `qty` today, but nothing guarantees it.
  **Fix:** derive `units` from the lines, or validate on write.

- [ ] **22. Stale / unused data.** Order dates from October 2025; `profiles` empty; `ht_admin_profile` holds one demo row.
  **Fix:** seed realistic demo data or clear it before launch, and decide whether `profiles` is needed at all.

---

## 🟡 Medium — assets & storage

- [ ] **23. Product images point at local files.** All six rows use relative paths (`images/product-wrist.jpg`), and four of six products share the same placeholder picture. The `product-images` storage bucket is not used by the catalogue, so images will look broken or identical.
  **Fix:** upload real photos to the bucket, store the full public URL in `ht_products.image`.

- [ ] **24. Staff cannot upload images.** `storage.objects` has only `public_read_product_images` (SELECT). There is no INSERT/UPDATE/DELETE policy, so uploads from the console fail.
  **Fix:** add write policies restricted to the staff role, limited to the `product-images` bucket.

---

## 🟡 Medium — deployment & operations

- [ ] **25. Vercel is not connected to GitHub** (`gitProviderOptions.createDeployments = disabled`). Pushes do not deploy; there is no traceable link between a commit and the live site.
  **Fix:** connect `shxnzyy/ht-ws-project`, branch `happytime-ws`, and deploy from Git.

- [ ] **26. The app source code is not in Git.** The repository holds only notes (`README.md`, `SUMMARY.md`, `PROJECT-NOTES.md`, …). There is no code backup anywhere.
  **Fix:** commit the SPA source, with `.gitignore` covering `node_modules`, `dist` and `.env*`.

- [ ] **27. No custom domain.** Only `happy-time-connect.vercel.app` and the team alias.
  **Fix:** attach a business domain; keep the vercel.app address as an alias.

- [ ] **28. No staging environment.** Two deployments exist and both are `target: production`; changes are tested on live data.
  **Fix:** use Vercel preview deployments for every branch, and a separate Supabase project for staging before touching production data.

- [ ] **29. No monitoring or error reporting.** Web Analytics and Speed Insights are enabled but collect no data (`webAnalytics: false`, `hasData: false`).
  **Fix:** enable analytics, add an error tracker (e.g. Sentry) and an uptime check.

- [ ] **30. Runtime pinned to Node 26.x** with no recorded reason.
  **Fix:** confirm the supported version for both Vercel and any future CI, and pin it in `package.json` engines.

---

## ✅ Working well — do not regress

- RLS is *enabled* on every table (the intent is right; only the policies are wrong).
- `feedback` has proper CHECK constraints on `rating` (1–5) and `status` (`new`/`read`) — the pattern the other tables should copy.
- `profiles.id → auth.users(id) ON DELETE CASCADE` shows correct cascading practice.
- Storage read policy is correctly scoped to one bucket.
- Vercel SSO protects preview deployments; source maps are protected.
- Database is healthy on Postgres 17 in Singapore — the right region for Sri Lanka.
- Environment variables are defined for production, preview and development.

---

## Suggested order of work

| Phase | Items | Why |
|---|---|---|
| 1. Stop the bleeding | 1, 2, 3, 4 | Anyone can wipe the database today |
| 2. Make logins real | 2, 5, 6, 7, 8 | Nothing else can be secured without identity |
| 3. Make the numbers true | 18, 19, 20, 21 | Staff are making decisions on wrong stock and money |
| 4. Schema hygiene | 10, 11, 12, 13, 14, 15, 16, 17 | Prevents the same class of bug returning |
| 5. Trust the pipeline | 25, 26, 28 | Deploy safely, keep a code backup |
| 6. Polish | 23, 24, 27, 29, 30, 22 | Presentation and observability |

**Back up the database before phase 3 and phase 4** — both touch live rows.
