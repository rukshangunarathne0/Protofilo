---
tags: [hud/core, hud, performance, speed, diagnosis]
status: PARTLY FIXED
classification: INTERNAL
updated: 2026-11-04
---

# ◈ PERFORMANCE CORE

> Why the app *feels* slow, measured from the build logs of the live production deployment (`dpl_7y6ZjiDbaimrGvma425KdWg6mfQV`).

> [!success] APPLIED 2026-11-04 — first pass landed in `app/`
> | CHANGE | FILE | EFFECT |
> |---|---|---|
> | Vendor chunking (`react`, `supabase`, `motion`, `ui-utils`, `vendor`) | `app/vite.config.js` | 1 × 816 kB file → **6 files, parallel + cached per deploy** |
> | Instant splash painted from raw HTML | `app/index.html` + `app/src/main.jsx` | **no blank screen** — brand mark before any JS parses |
> | Preconnect + dns-prefetch to Supabase | `app/index.html` | removes one DNS + TLS handshake |
> | Non-blocking Google Fonts (`media="print"` swap + `<noscript>` fallback) | `app/index.html` | removes a render-blocking request |
> | 9 images `loading="lazy" decoding="async"`, hero `fetchpriority="high"` | `app/src/App.jsx` | off-screen photos stop competing with first paint |
>
> **Measured after:** index 211.57 kB (53.72 gzip) · react 219.02 (67.82) · supabase 206.17 (53.96) · motion 134.58 (44.61) · ui-utils 27.88 (8.73) · vendor 9.24 (3.19) — total still ~232 kB gzip, now **parallel and cacheable**.
>
> **Still open (pass two):** `App.jsx` is 3,320 lines holding login + dealer shop + admin console + mobile shell. Until the staff console is extracted behind `React.lazy`, a dealer still downloads admin code.

## MEASURED BUDGET

| ASSET | RAW | GZIPPED | VERDICT |
|---|---|---|---|
| `index.html` | 1.68 kB | 0.71 kB | 🟢 |
| `assets/index-*.css` | 96.06 kB | 17.76 kB | 🟢 |
| **`assets/index-*.js`** | **829.04 kB** | **236.27 kB** | 🔴 **single chunk, no splitting** |
| Modules in graph | 478 | — | 🟠 heavy dependency tree |
| Storage images (10 files) | ~1.5 MB | — | 🔴 unoptimised JPEG/PNG |
| Hero photo `photo-1.jpg` | 260.9 kB | — | 🔴 |
| Logo `logo.png` | 63.0 kB | — | 🟠 |

Build tool: **Vite 6.4.5** · build time 3.63 s · build region `iad1`.
Vite's own warning during the build:

> *"Some chunks are larger than 500 kB … Use build.rollupOptions.output.manualChunks to improve chunking."*

## RANKED ROOT CAUSES

1. **One 829 kB JavaScript file.** Everything — dealer shop, admin console, charts, icons, date logic — arrives before the first screen can paint. On a mid-range phone a 236 kB gzip payload plus parse time costs roughly **1.5–3 s before anything responds**. → [[04 VERCEL LAUNCH DECK]]
2. **1.5 MB of unoptimised imagery.** The login screen loads a 261 kB JPEG at full resolution plus a 63 kB PNG. No WebP, no responsive sizes, no dimensions. → [[03 SUPABASE CORE]]
3. **478 modules in a single graph** — typical of whole-library imports (`import * as icons`, a full date library, an animation library).
4. **No data cache.** Supabase is queried from the browser on every view; there is no request de-duplication or stale-while-revalidate layer. → [[06 ORDER PIPELINE]]
5. **No database indexes** beyond primary keys, and no column selection — `select *` patterns strain [[03 SUPABASE CORE]] as rows grow.
6. **No preconnect** to the Supabase origin, so every dealer pays an extra DNS + TLS handshake (~150–300 ms from Sri Lanka).
7. **No perceived-speed scaffolding** — no skeletons, no optimistic UI, so each wait is visible.

## FIX 1 — SPLIT THE BUNDLE

```js
// vite.config.js
export default defineConfig({
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
```

Then load the staff console only when a staff member signs in:

```jsx
const AdminConsole = lazy(() => import('./console/AdminConsole'));

<Suspense fallback={<ConsoleSkeleton />}>
  {role === 'staff' && <AdminConsole />}
</Suspense>
```

## FIX 2 — SHRINK THE DEPENDENCIES

| SYMPTOM | ACTION |
|---|---|
| Icon packs | Named imports only — never `import * as Icons` |
| Date maths | Replace `moment` (≈290 kB) with `date-fns` or `dayjs` |
| Animation | Load below-the-fold motion lazily; CSS for micro-interactions |
| Charts | Dynamic import, only where a chart is visible |
| Lodash | Use `lodash-es` named imports |

## FIX 3 — IMAGE PIPELINE

1. Export each photo at the size it is displayed (hero ≈ 1600×900, thumbnails ≈ 400×400).
2. Convert to **WebP** (typically 60–80 % smaller than JPEG).
3. Keep a JPEG fallback only if old devices matter.
4. Always set `width` and `height` to stop layout shift.
5. `loading="lazy"` + `decoding="async"` for everything below the fold.
6. If the Supabase plan allows image transformations, request resized variants instead of the originals.

```html
<img src=".../photo-1.webp" width="1600" height="900"
     alt="Happy Time showroom" fetchpriority="high" decoding="async">
```

**Target:** hero under 120 kB, every thumbnail under 40 kB, total page weight under 500 kB.

## FIX 4 — PRE-CONNECT

```html
<!-- index.html, in <head> -->
<link rel="preconnect" href="https://unbhwpcpprornqvvlfxo.supabase.co" crossorigin>
<link rel="dns-prefetch" href="https://unbhwpcpprornqvvlfxo.supabase.co">
```

Also self-host fonts as `woff2` with `font-display: swap` — a third-party font host costs another handshake.

## FIX 5 — CACHE THE DATA

- One query per screen, not one per widget.
- Select the columns needed: `select id, dealer, amount, status` — never `*`.
- Paginate the order list (`range(0, 24)`), load more on scroll.
- Cache with SWR or TanStack Query: show the last known rows instantly, refresh in the background.
- Add the missing indexes:

```sql
create index if not exists ht_orders_dealer_idx  on ht_orders (dealer);
create index if not exists ht_orders_status_idx  on ht_orders (status);
create index if not exists ht_orders_created_idx on ht_orders (created_at desc);
create index if not exists ht_preorders_dealer_idx on ht_preorders (dealer);
```

## FIX 6 — FEEL FAST EVEN WHEN IT IS NOT

- Skeleton rows that match the real layout, not spinners.
- Keep the sign-in screen instant: no data fetch before the dashboard.
- Optimistic updates for order status changes.
- Disable the demo auto-login hops on first paint.

## ACCEPTANCE TARGETS

| METRIC | TARGET | TODAY |
|---|---|---|
| Initial JS (gzip) | < 200 kB | 236 kB |
| Largest chunk | < 150 kB | 829 kB |
| Total page weight | < 500 kB | ~2 MB |
| LCP on 4G | < 2.5 s | unmeasured |
| CLS | < 0.1 | unmeasured |
| INP | < 200 ms | unmeasured |

## VERIFY

```bash
npm run build        # watch the chunk table
npx lighthouse https://happy-time-connect.vercel.app --view
```

Then enable Vercel Speed Insights — currently installed but collecting nothing → [[15 METRICS BOARD]].

## BLOCKER — THE SOURCE IS NOT REACHABLE

The optimisation above needs the front-end source. Today it exists only on a developer machine: the repository holds notes only, and the Vercel build fetches its own source at build time (`prebuild: node fetch-src.mjs` → *"Hydrated 8 source files"*).

**Until the code is committed to `happytime-ws`, nothing in this note can be applied.** That is also fix 26 in [[APP-ISSUES]].

## LINKED SYSTEMS

[[00 COMMAND CENTER]] · [[02 SYSTEM MAP]] · [[03 SUPABASE CORE]] · [[04 VERCEL LAUNCH DECK]] · [[05 SECURITY PERIMETER]] · [[06 ORDER PIPELINE]] · [[13 NIGHTLY DIAGNOSTICS]] · [[15 METRICS BOARD]] · [[16 ROADMAP PHASES]]

## Graph
- [[Network Cluster]]
- [[Intel Cluster]]
- [[Operations Cluster]]
