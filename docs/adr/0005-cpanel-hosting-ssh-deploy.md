# 0005: The API runs on cPanel, deploys over SSH, behind Cloudflare

Status: accepted (2026-10-22)

## Decision

- Host: a cPanel (CloudLinux) account with PHP 8.3+, MySQL 8 / MariaDB 10.6+, SSH with Composer, cron and AutoSSL. `api.focuship.app`'s document root points at `api/public`.
- Deploy: GitHub Actions, path-filtered to `api/**` on `main`, runs Pint, Larastan and Pest against MySQL, then SSHes in to pull, `composer install --no-dev`, migrate and cache. Not zero-downtime; revisit with release folders if downtime is noticed.
- Cron runs `php artisan schedule:run` every minute (pruning abandoned OAuth clients, expired tokens and email codes).
- `api.focuship.app` is proxied by Cloudflare (DDoS/WAF at the edge). The origin is also reachable around Cloudflare, so Laravel trusts forwarding headers (`X-Forwarded-For`, `X-Forwarded-Proto`) only from Cloudflare's published IP ranges (`api/bootstrap/app.php`) and rate-limits guests on the address that leaves: the visitor's when the peer is a Cloudflare edge, the peer's own otherwise.
- Rate limits use the database cache store (no Redis on shared hosting).

## Consequences

Shared-host CPU and process limits are the scaling ceiling; the edge proxy and per-route throttles protect it.
