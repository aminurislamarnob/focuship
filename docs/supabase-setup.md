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
2. Authentication → Sign In / Providers → disable **Email** (the app is OAuth-only).
3. Leave *"Link accounts with the same verified email"* behaviour on (Supabase links OAuth
   identities with the same verified email into one user automatically — this is what makes
   "Google today, GitHub tomorrow" land in the same account).

### Google

1. [console.cloud.google.com](https://console.cloud.google.com) → create a project → OAuth consent
   screen (External, app name Focuship, your email).
2. Credentials → Create credentials → OAuth client ID → Web application:
   - Authorized redirect URI: `https://<ref>.supabase.co/auth/v1/callback`
3. Copy client ID + secret into Supabase → Authentication → Providers → Google → Enable.

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
