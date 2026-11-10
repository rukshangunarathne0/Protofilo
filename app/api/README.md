# Administrator API configuration

The administrator password is intentionally not stored in this repository or in browser code.
Before deploying, set these server-side Vercel environment variables for Production (and Preview if needed):

- `RSD_ADMIN_PASSWORD_HASH`: output of `npm run --silent create-admin-password-hash` from `app/`.
- `RSD_ADMIN_SESSION_SECRET`: a random value of at least 32 characters, for example `openssl rand -base64 48`.
- `SUPABASE_URL`: the R.S.D. Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the R.S.D. Supabase service key; this must never have a `VITE_` prefix.

Create the password hash and service key as encrypted or sensitive variables in Vercel. Never commit their values or paste them into a public response. The login API only accepts `admin@rsd.com`, applies a short in-memory IP/email lockout after repeated failures, and issues an HttpOnly, Secure, SameSite session cookie. The public browser receives only the publishable Supabase key and the public product catalogue.

Customer prices are generated server-side from the ignored `private/products-cost.json` input with `npm run prices`; only the calculated `src/data/products.json` output is committed. Admin product actions recalculate prices on the server and never accept retail-price, stock, or reserved fields from the form. Public `/api/customer-order`, `/api/favorite`, and `/api/feedback` routes use the service role only on the server and accept no supplier-cost fields.

Apply `sql/rsd-catalog-schema.sql` to provision the catalogue, private cost ledger, favourites and order-status constraint. `sql/admin-product-fields.sql` is an optional safe photo/metadata setup; it intentionally creates no anonymous storage-upload policy.
