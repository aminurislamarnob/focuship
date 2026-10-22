# 0003: The app authenticates with Sanctum cookie sessions

Status: accepted (2026-10-22)

## Decision

The site at `focuship.app` calls `api.focuship.app` with credentialed requests. Laravel Sanctum's stateful SPA mode issues an httpOnly session cookie scoped to `.focuship.app`, plus the `XSRF-TOKEN` CSRF cookie the client echoes back.

## Why

- The MCP consent screen (Passport `/oauth/authorize`) needs a web session anyway; sharing it means a signed-in listener only clicks Allow.
- Social redirect flows end with a session naturally.
- Tokens never sit in `localStorage` where a script bug could read them.

## Consequences

- CORS must allow the site origin with credentials; `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` must match each environment.
- The frontend keeps a cached copy of the user for offline display only; the API is the authority.
