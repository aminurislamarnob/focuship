# 0002: The API lives in `api/`; the TypeScript catalog stays the source of truth

Status: accepted (2026-10-22)

## Decision

- The Laravel app lives in `api/` in this repository. Frontend and API deploy separately (Cloudflare and cPanel).
- `src/lib/catalog.ts` remains the single source of truth for categories, sounds and built-in presets, and `src/lib/guides.ts` for guides. `npm run export:catalog` writes them to `api/resources/catalog.json`, which is committed. CI regenerates it and fails on a diff.
- The share-link format (`?mix=id:vol,...`) is implemented in TypeScript and PHP; `tests/fixtures/mix-links.json` holds layer/query pairs both test suites must reproduce.

## Why

Sounds are mp3 files shipped with the site, so the catalog belongs to the frontend. One repository makes catalog/API changes atomic. Database-managed catalogs would make the static site depend on the API at build time and offline.
