# api/ — the Focuship API

The Laravel app behind Focuship accounts and the MCP server. The site (`../src`) is a
static export and talks to this over HTTP. Read the root `CLAUDE.md` first, and the
ADRs in `../docs/adr/` before changing anything structural.

## Commands

```bash
php artisan serve             # :8000
vendor/bin/pest               # all tests (needs the focuship_test MySQL database)
vendor/bin/pest --filter=Mcp  # one slice
vendor/bin/pint               # formatting (run before committing)
vendor/bin/phpstan analyse    # larastan, level 6, must be clean
php artisan mcp:inspector mcp # drive the MCP by hand against a seeded user
php artisan focuship:prune    # the housekeeping the scheduler runs hourly
```

Local setup is Herd (PHP 8.3+) plus MySQL 8: create `focuship` and `focuship_test`,
copy `.env.example` to `.env`, then `php artisan key:generate && php artisan migrate`
and `php artisan passport:keys`.

## Architecture

- **`app/Account/Library.php`** is the deep module: one listener's presets, favorites
  and settings. Both surfaces go through it — the site's account API and the MCP's
  tools — so a rule like the fifty-preset cap cannot differ between them. Put domain
  rules here, not in a controller or a tool.
- **`app/Auth/`** holds sign-in: `Accounts` (find or create a listener, linked by
  verified email), `EmailCodes`, `GoogleIdToken`, `Turnstile`.
- **`app/Catalog/`** reads the generated `resources/catalog.json` and builds share
  links. Never edit that file: run `npm run export:catalog` in the repo root.
- **`app/Mcp/`** is the MCP server, its tools, resources and prompt. Tools that touch
  the listener's library extend `App\Mcp\LibraryTool`.
- **Routes:** `routes/api.php` is JSON for the site, `routes/web.php` is the session
  pages (social redirects, sign-in, consent), `routes/ai.php` is the MCP.

## Conventions

- **Passwordless.** There is no password column and no password reset. Adding one
  would contradict ADR 0001.
- **Guard per surface.** The site uses the `web` guard through Sanctum cookie
  sessions; the MCP uses `api` (Passport). After logging out inside a route protected
  by another guard, call `Auth::forgetGuards()`.
- **Never trust a cached relation** for data a second request may have changed: query
  it (`$user->settings()->first()`, not `$user->settings`).
- **Rate limit every public route.** Limiters live in `AppServiceProvider`.
- **Tool and endpoint errors are read by people and by models**: say what went wrong
  and what to do instead, and name the tool that helps.
- `updated_at` on `user_settings` is the last-write-wins clock and keeps
  milliseconds; do not let Eloquent overwrite it.

## Tests

Pest, at the HTTP boundary: send real requests and assert on responses and stored
state, never on internals. The MCP is driven as a black box over JSON-RPC with a real
Passport token (`tests/TestCase.php` and the helpers in `tests/Pest.php`:
`connectMcpClient`, `mcpTool`, `mcpToolNames`). `tests/Unit` holds the share-link
fixtures shared with the site's Vitest suite.
