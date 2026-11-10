# Administrator API configuration

The administrator password is intentionally not stored in this repository or in browser code.
Before deploying, set these **server-only** Vercel environment variables for Production (and Preview if needed):

- `RSD_ADMIN_PASSWORD_HASH`: output of `npm run --silent create-admin-password-hash` from `app/`.
- `RSD_ADMIN_SESSION_SECRET`: a random value of at least 32 characters, for example `openssl rand -base64 48`.

Both values must be created as encrypted or sensitive variables in Vercel. Never use a `VITE_` prefix, commit the output, or paste either value into a public response. The login API only accepts `admin@rsd.com`, applies a short in-memory IP/email lockout after repeated failures, and issues an HttpOnly, Secure, SameSite session cookie.
