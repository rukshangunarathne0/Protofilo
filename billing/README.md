# R.S.D. Billing Workspace

This is a separate Vite/Vercel application for administrator bill and courier PDF generation.

- The main public catalogue does not import the PDF library or render the billing editor.
- The workspace uses the existing administrator session endpoints through small same-origin proxy functions.
- `app/api/billing-data.js` reads the existing Supabase `ht_products` and `ht_orders` tables and returns only customer-facing product/order data. Supplier costs and markup fields are intentionally excluded.
- PDF generation uses the existing public/calculated prices and lazy-loads `jspdf` only when a download is requested.

## Local development

```sh
npm install
npm run dev
```

When running locally, set `RSD_MAIN_API_ORIGIN` to the main site's origin if it is not the default production URL. The deployed billing project needs no database secret because its server proxy forwards the authenticated request to the existing main API.
