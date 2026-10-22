# 0001: A Laravel API replaces Supabase, with a fresh start

Status: accepted (2026-10-22)

## Context

Accounts (presets, favorites, synced settings) ran on Supabase, called straight from the static site with the anon key and Row Level Security. The owner wants a backend they own and host, so server-side logic, sign-in and the MCP server live in one place. Building the MCP on Supabase would have meant an OAuth bridge to throw away later.

## Decision

- A Laravel API at `api.focuship.app` replaces Supabase for sign-in and account data.
- Fresh start: no Supabase users or rows are migrated. Old `?p=<uuid>` share links to custom presets stop resolving. The store silently drops a cached account from the old backend; guest state (mix, volume, timer, recents) is untouched.
- Sign-in methods stay at parity: Google (one-tap ID token + redirect fallback), GitHub, Facebook (flagged) and a 6-digit email code behind Turnstile, sent through Brevo SMTP. Accounts link by verified email.
- Accounts are off when `NEXT_PUBLIC_API_URL` is unset, as they were without Supabase env vars.

## Consequences

- The static export and Cloudflare assets Worker stay as they are; only `src/lib/cloud.ts`'s driver changes.
- The owner now operates a PHP app and a MySQL database.
