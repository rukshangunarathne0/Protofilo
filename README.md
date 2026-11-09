# Happy Time Connect

Source mirror of the **Happy Time Connect** company messaging and collaboration app for T.K Food Products Distribution Limited.

- Live deployment: <https://happy-time-connect.vercel.app/>
- Public source: <https://github.com/perves90-crypto/Happy-Time-Connect>

## Included

- Phone-number sign-up and persistent Supabase sessions
- Personal and group messaging UI with realtime message subscriptions
- Secret-code protected private-chat interface
- Browser-local storage with Capacitor Android storage support
- Audio and video call signaling UI
- Theme, language, profile, QR-code, and account settings screens
- Supabase schema, migrations, RPC functions, and call-push function source
- Capacitor configuration and an Android APK build workflow

The UI is mobile-first and includes Bengali/English labels. The frontend is built with React and Vite.

## Development

```bash
npm install
npm run dev
npm run build
```

To connect a different Supabase project, copy `.env.example` to `.env.local` and replace the placeholder publishable key before starting Vite:

```bash
cp .env.example .env.local
```

The SQL files in `supabase/` must be applied to the matching Supabase project before authentication, conversations, realtime messages, or call signaling can work end to end. The push-call function also requires its server-side Supabase and Firebase secrets; never put those secrets in the frontend environment.

## Deployment

Vercel can deploy this repository using the standard Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

Cloudflare Pages/Workers configuration is also included in `wrangler.jsonc`. The Android workflow builds a debug APK from the same web bundle when run from GitHub Actions.

## Cost and service limits

The project is designed around free/open-source tiers. SMS delivery, cloud storage capacity, and 100-person real-time audio/video calling depend on provider limits and cannot be promised as unlimited or always free. No paid service should be enabled without the owner's approval.
