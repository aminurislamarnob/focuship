# Supabase setup (owner checklist)

Accounts are optional in the app and **off by default in every build**: while the
two env vars below are unset, no account UI renders and the site stays fully
local-only. This checklist provisions the Supabase project and switches accounts
on. Everything here is dashboard work only the owner can do; the schema itself
is in `supabase/migrations/0001_accounts.sql`.

## 1. Create the project

1. [supabase.com](https://supabase.com) → New project (free tier is fine). Name: `focuship`.
2. Note the **Project URL** (`https://<ref>.supabase.co`) and the **anon/publishable key**
   (Settings → API Keys). Both are public by design — security rests on RLS.

## 2. Run the migration

1. Dashboard → SQL Editor → paste the whole of `supabase/migrations/0001_accounts.sql` → Run.
   (Or `supabase link && supabase db push` with the CLI.)
2. Verify: Table Editor shows `user_presets`, `favorites`, `user_settings`, each with RLS enabled.

## 3. Auth configuration

1. Authentication → URL Configuration:
   - **Site URL**: `https://focuship.app`
   - **Additional redirect URLs**: `http://localhost:3000/` (dev) and `https://focuship.app/`
2. Leave *"Link accounts with the same verified email"* behaviour on (Supabase links identities
   with the same verified email into one user automatically — this is what makes "Google today,
   GitHub tomorrow, an email code next week" land in the same account).

### Email codes (Brevo + Turnstile)

Email sign-in sends a 6-digit code. Supabase's built-in mailer only delivers to project team
members (2/hour), so a custom SMTP sender is required for real users.

1. **Brevo** ([brevo.com](https://www.brevo.com)): Senders, domains → add and authenticate the
   sending domain (Brevo code TXT, DKIM, DMARC records in its DNS). Then SMTP & API → generate an
   SMTP key. Host `smtp-relay.brevo.com`, port 587, user = your Brevo SMTP login.
   Security → Authorized IPs → **deactivate blocking for SMTP keys**: Supabase sends from
   changing, unpublished IPs, so with blocking on every code email fails.
   *Current setup:* sender `no-reply@aminurislam.me` (already authenticated in Brevo). The
   planned `auth.focuship.app` domain is added in Brevo but pending its DNS records, which go
   in whichever Cloudflare account holds focuship.app:
   `TXT auth`, `CNAME brevo1._domainkey.auth`, `CNAME brevo2._domainkey.auth`, `TXT _dmarc.auth`
   (exact values on Brevo's domain page). Switch the Supabase sender once it verifies.
2. **Supabase → Authentication → Emails → SMTP settings**: enable custom SMTP with the Brevo
   values; sender address as above, name `Focuship`.
3. **Supabase → Sign In / Providers → Email**: enable; email OTP expiry `600` seconds (10 min).
4. **Supabase → Emails → Templates**: both **Confirm signup** (a new address's first code) and
   **Magic Link** (returning users) carry sign-in codes. For each: subject
   `{{ .Token }} is your Focuship code`, body with `{{ .Token }}` and no link.
5. **Cloudflare → Turnstile**: add a widget for `focuship.app` and `localhost` (Managed mode).
   Put its site key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; paste its secret key into
   Supabase → Authentication → Attack Protection → CAPTCHA (provider Turnstile).
   Supabase then requires a Turnstile token only to *send* a code — Google, GitHub and
   code verification are unaffected.

### Google

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project → OAuth consent
   screen (External, app name Focuship, your email).
2. Credentials → Create credentials → OAuth client ID → Web application:
   - Authorized JavaScript origins: `https://focuship.app`, `http://localhost:3000`, `http://localhost`
     (the app uses Google's own sign-in button, which runs on these origins)
   - Authorized redirect URI: `https://<ref>.supabase.co/auth/v1/callback` (the redirect fallback)
3. Copy client ID + secret into Supabase → Authentication → Providers → Google → Enable.
4. Put the client ID in `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (step 4 below). With it set, Google's consent
   screen names **focuship.app**; without it the app falls back to the redirect flow, whose consent
   names `<ref>.supabase.co`.
5. Branding: add `https://focuship.app/privacy` as the privacy policy link, then Audience → Publish app.

### GitHub

1. [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App:
   - Homepage: `https://focuship.app`
   - Authorization callback URL: `https://<ref>.supabase.co/auth/v1/callback`
2. Copy client ID + secret into Supabase → Providers → GitHub → Enable.

### Facebook (later — behind the flag)

The code ships complete but the button stays hidden until this is done:

1. [developers.facebook.com](https://developers.facebook.com) → create an app (Consumer),
   add the **Facebook Login** product, set Valid OAuth Redirect URI to
   `https://<ref>.supabase.co/auth/v1/callback`.
2. Complete business verification and App Review for `email` + `public_profile`, switch the
   app to Live mode.
3. Copy app ID + secret into Supabase → Providers → Facebook → Enable.
4. Set `NEXT_PUBLIC_AUTH_FACEBOOK=1` (step 4 below) and redeploy — the button appears.

## 4. Env vars and deploy

Create `.env.local` in the repo root (gitignored; the values are baked into the
static bundle at build time, which is fine — they are public):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google web client id>.apps.googleusercontent.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<turnstile site key>   # without it the email option is hidden
# NEXT_PUBLIC_AUTH_FACEBOOK=1   # only once Meta app review has cleared
```

Then `npm run deploy` as usual. `npm run dev` picks the same file up for local testing
(sign-in works on `http://localhost:3000` thanks to the redirect URL in step 3).

## 5. Smoke-check RLS (two minutes, curl only)

With `URL=https://<ref>.supabase.co` and `KEY=<anon key>`:

```bash
# Anonymous read of presets: must return [] (never other people's rows).
curl -s "$URL/rest/v1/user_presets?select=id" -H "apikey: $KEY"

# Anonymous insert: must be rejected (401/42501).
curl -s -X POST "$URL/rest/v1/favorites" -H "apikey: $KEY" \
  -H "Content-Type: application/json" -d '{"preset_ref":"deep-work"}'
```

Then in the app: sign in, save a preset, toggle **Share** on it, and open its copied
`/?p=<uuid>` link in a private window — the mix must load there, and stop loading
after you switch sharing off again.

## 6. Hand verification after each deploy touching auth

- Google and GitHub sign-in round-trips from `https://focuship.app/account`.
- Same-email provider switch lands in the same account (favorites still there).
- Delete account from `/account`, then confirm the user is gone in Authentication → Users.
