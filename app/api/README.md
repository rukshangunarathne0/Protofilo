# Administrator API configuration

The administrator password is intentionally not stored in this repository or in browser code.
Before deploying, set these server-side Vercel environment variables for Production (and Preview if needed):

- `RSD_ADMIN_PASSWORD_HASH`: output of `npm run --silent create-admin-password-hash` from `app/`.
- `RSD_ADMIN_SESSION_SECRET`: a random value of at least 32 characters, for example `openssl rand -base64 48`.
- `SUPABASE_URL`: the R.S.D. Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the R.S.D. Supabase service key; this must never have a `VITE_` prefix.

Create the password hash and service key as encrypted or sensitive variables in Vercel. Never commit their values or paste them into a public response. The login API only accepts `admin@rsd.com`, applies a short in-memory IP/email lockout after repeated failures, and issues an HttpOnly, Secure, SameSite session cookie. The public browser receives only the publishable Supabase key and the public product catalogue.

The admin product form offers two mutually exclusive price modes: enter a private purchase cost and the server calculates the customer price with the default R.S.D. rule, or enter a customer price directly and the server stores that exact amount. Only the final customer price is exposed in the public catalogue; supplier costs remain private. The legacy `npm run prices` script still generates the committed static price-list data when that separate input is used. Admin product actions never accept stock or reserved fields from the form. Public `/api/customer-order`, `/api/favorite`, and `/api/feedback` routes use the service role only on the server, accept no supplier-cost fields, and enforce same-origin, input validation, and bounded local plus durable hashed per-IP rate limits. Public orders use a deterministic idempotency key and the database RPC atomically moves available stock into reservation.

Apply `sql/rsd-catalog-schema.sql` before deploying the API changes: it provisions the catalogue, private cost ledger, favourites, order-status constraint, and atomic stock reservation/release functions. `sql/admin-product-fields.sql` is an optional safe photo/metadata setup; it intentionally creates no anonymous storage-upload policy.
