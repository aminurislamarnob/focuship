# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # next dev on :3000 (service worker is NOT registered in dev)
npm run build      # static export to out/ (output: "export")
npm start          # serve out/ locally (npx serve) — `next start` does not work with a static export
npm run lint       # eslint (includes react-hooks/set-state-in-effect)
npm test           # next build, then node --test tests/*.test.mjs against out/
                   # (build and test share .next with `next dev`: restart a running dev server afterwards, or it serves stale CSS)
npx tsc --noEmit   # typecheck
npm run deploy     # next build && wrangler deploy → https://focuship.app (manual; pushes to main deploy on their own)
npm run deploy:redirect  # 301 Worker (workers/redirect) for focus.aminurislam.me, focusship.app, www hosts
npm run icons      # regenerate app icons (public/icons, src/app/icon.png) from scripts/generate-icons.mjs
```

Tests live in `tests/` and inspect the built site in `out/` — what a crawler or visitor receives (titles, canonicals, JSON-LD, sitemap, brand) — never source modules; `tests/site.mjs` has the HTML helpers. Audio, interaction, offline and redirects are verified by hand: drive the production build in a browser (PWA and offline behaviour only work against a production build served over HTTPS or localhost) and `curl` deployed URLs.

## Architecture

A single-route (`/`), fully client-driven ambient sound mixer + focus timer, prerendered as static HTML and installable as a PWA. `src/app/page.tsx` renders `FocusApp`, which owns the shell (top bar, floating bottom tab bar and mini player on mobile; sidebar on desktop; the save & share sheet, focus-mode overlay, keyboard shortcuts). The Mix, Sounds, Timer and You tabs are all rendered and toggled with `hidden`; each has a route (`/`, `/sounds`, `/timer`, `/about`), and before saved state loads the shell shows the route's own tab (`intent.tab`). You (`/about`, "About & offline") is, signed in, a profile (presets, favorites, offline sounds) with a link to the rest; signed out, account perks, offline sounds, install, shortcuts, the maker and credits. On wide screens the Mix tab adds a right-hand column with the layer volumes ("In this mix"), a timer card and offline sounds.

**Data — `src/lib/catalog.ts`** is the source of truth for categories, sounds and presets. Recorded sounds live at `public/sounds/<category>/<id>.mp3` (path derived from category + id); generated sounds are `noise` or `binaural` sources. Each sound and preset id also needs an entry in the Lucide icon maps (`SOUND_ICONS`, `PRESET_ICONS`) in `src/components/ui.tsx`, otherwise it falls back to the category icon; each built-in preset also gets line art in `PresetArt` there (custom presets share a fallback).

**State — `src/lib/store.ts`** is a module-level external store read with `useFocus(selector)` (`useSyncExternalStore`). Selectors must return stable references (state slices or primitives) — never build new arrays/objects inside a selector. All mutations go through `actions.*`, which call `set()`; `set()` re-syncs audio, persists to `localStorage` (`focuship:v1`), updates the Media Session and notifies listeners. `actions.hydrate()` runs once on mount and consumes URL params: `?mix=id:vol,id:vol` (share links, written unencoded for readability: `?mix=rain-on-window:60,keyboard:30`; an untouched preset shares its `page` instead, e.g. `/mix/rainy-desk`, and the registry checks at build time that the page loads the same layers), `?preset=<id>` and `?tab=sounds|timer` (manifest shortcuts), then strips them; a first-time visitor (no saved state) with no URL params or page intent gets a random preset. The timer stores an absolute `endsAt` so it survives backgrounding/reloads.

**Audio — `src/lib/audio/engine.ts`** exposes a declarative `sync(layers, playing, masterVolume)` that diffs running voices against the requested mix and fades them. It must be called synchronously inside the user's tap/key handler (mobile browsers only start audio in a gesture) — that is why store actions call it directly. Recordings use two `<audio>` decks per sound that crossfade near the end for gapless loops; files are fetched whole into blob URLs (`sources.ts`) so the service worker can cache them (no range requests). Noise buffers are generated with a seamless loop seam (`noise.ts`); binaural tones are two panned oscillators; the starship hum (`drone` source) is a graph of detuned low oscillators through an LFO-swept low-pass plus filtered noise, all continuous. A silent looping element keeps the media session alive, and Safari's `navigator.audioSession.type = "playback"` is claimed on play.

**Landing pages (programmatic SEO) — `src/lib/pages.ts`** is the page registry: every landing page is a `LandingPage` entry (type, slug, title, description, H1, intro, copy sections, FAQ, `intent`, related paths, `wave`, `hero`), with the copy itself in `src/content/*.ts`. Route templates (`/sounds/[slug]`, …) are thin: `generateStaticParams` + `dynamicParams = false` from `src/lib/landing-route.ts`, rendering `Landing` (the full `FocusApp` with the page's `intent`, then copy, FAQ and related links) plus a per-page `opengraph-image`. Hubs (`/sounds`, …) render `HubPage`. `isIndexable()` is the quality gate (released wave via `RELEASED_WAVE`, minimum words, FAQs and related links); pages that fail are still built but get `noindex` and are left out of the sitemap and `llms.txt`, which are generated from the registry. The registry throws at build time on duplicate paths, unknown sound ids, broken related links, or a `/sounds/<slug>` that collides with an audio folder. `actions.hydrate(intent)` applies the page's intent: URL params win, then the intent, then saved state; it never autoplays.

**Guides — `src/lib/guides.ts`** lists the evergreen articles (copy in `src/content/guides/`), rendered at `/guides/<slug>` by `GuideArticle` inside `GuideLayout` (a reading column inside the app shell via `SitePage`: same sidebar, tab bar, mini player and shortcuts, no app views; Space scrolls there instead of playing; the privacy policy uses it too) with a byline, dates, "play" links to landing pages, FAQ, sources and Article JSON-LD. A guide stays `noindex` and out of the sitemap/`llms.txt` until its `reviewed` flag is set by the owner. Cite only sources whose DOI/URL you have verified.

**PWA** — `src/app/manifest.ts` (must stay `dynamic = "force-static"` for the export), `public/sw.js` (hand-written), `src/lib/pwa.ts` (registration in production only, install prompt, "save all sounds" into the `focuship-sounds-v1` cache). When changing what the app shell caches, bump `VERSION` in `sw.js`; the sounds cache name is versioned separately so it survives app updates.

## Constraints from the static export + Cloudflare deployment

- No server features: no `headers()`/redirects/rewrites in `next.config.ts`, no Server Actions, no default `next/image` loader. Response headers (caching, the service worker's no-cache rule, security headers) live in `public/_headers`.
- Don't read `Date.now()`, `Math.random()`, `window`, `localStorage` etc. during render — the page is prerendered at build time. Read them in effects or event handlers (the build fails on `Date.now()` in render).
- Push to deploy: `.github/workflows/deploy.yml` runs lint, typecheck and `npm test` on every push to `main`, then `wrangler deploy`s the tested `out/`. It needs the repo secret `CLOUDFLARE_API_TOKEN` (an "Edit Cloudflare Workers" token for the account below) and the repo variables `CLOUDFLARE_ACCOUNT_ID` plus the `NEXT_PUBLIC_*` values from `.env.local`. When the Worker moves accounts, replace the token and the account ID variable.
- Deployment is an assets-only Cloudflare Worker (`wrangler.jsonc`) serving `out/` on the custom domain `focuship.app`; `workers_dev` and preview URLs are off so the PWA has a single origin. A separate redirect Worker (`workers/redirect/`) 301s the old and typo hostnames to it; the one-time cutover steps are in the README. Sounds are shipped as static assets (no R2).
- Accounts: the `focuship.app` zone and the `focuship` Worker live in Mahbub.rucse@gmail.com's Cloudflare account (`7fe8bdf125d434f9fa0b417083094a00`) for now, because a Worker's custom domain must be in its own account and the domain can't change accounts until 10 days after registration (registered 2026-10-21). Deploy with `CLOUDFLARE_ACCOUNT_ID=7fe8bdf125d434f9fa0b417083094a00 npm run deploy`, logged in to wrangler as aminur.arnob@gmail.com. From about 2026-10-31, move the domain to Aminur.arnob@gmail.com's account (Registrations → Settings → Move to another Cloudflare account, run by a super-admin), redeploy there and delete the Worker from Mahbub's account. The old `let-me-focus` Worker (dev.aiarnob@gmail.com's account) was deleted, so `focus.aminurislam.me` no longer serves the site.

## Conventions

- Visual language (the "Focuship redesign" canvas): tokens in `src/app/globals.css` — ground `#0a0a0a`, surfaces `#121212`/`#141414`/`#1c1c1c`, hairlines `#1f1f1f`/`#262626`/`#333`, warm-tinted text `--fg #e8e6e3` → `--faint #8c8983` (all ≥ 4.5:1), a soft-white `--accent #d9d6d0` with dark ink on top, and an orange ember glow only behind the player card. Geist (UI) + Geist Mono (times, counts, Hz) via `next/font`; sentence-case labels; radii 12 controls · 14 inputs/buttons · 18 tiles · 24–28 cards · full pills; touch targets ≥ 44px; slow, gentle motion that stops under reduced motion. Lucide line icons at stroke 1.6–1.75. The mark is an open timer ring around an ember dot (`#f08a4b`): `Mark`/`Logo` in `src/components/Logo.tsx`, the app icons in `scripts/generate-icons.mjs`, and the Open Graph card in `src/lib/social-image.tsx`. No emoji/3D icon assets.
- Reuse the primitives in `src/components/ui.tsx`: `Slider` (custom pointer/keyboard slider — not a native range input), `SwapText` (animated text changes), `Sheet`, `IconButton`, `Switch`, `Kbd`, `Eq`, `Waveform` (the level bars), `EmberBackdrop` (glow + letter field behind the player), `PresetArt`.
- Do not name or credit any reference/inspiration websites in code, comments, docs or commit messages. Credits are limited to Moodist (sound recordings, MIT; sounds under Pixabay License/CC0) and superset.sh (visual style); the About page's "Credits & stack" card may also name the infrastructure (Cloudflare hosting, Supabase accounts) and link the source.
- The owner commits and pushes directly to `main`.

## Working with the owner

- When gathering requirements or interviewing ("grill me"), ask **one question at a time**, each with a recommended answer, and wait for the reply before asking the next. Record settled decisions in this file.

## SEO plan (in progress)

Goal: real traffic from traditional search and AI assistants. Decisions settled so far:

- **Audience:** ambient/noise sounds + focus/Pomodoro + developer deep work, led by the "ambient mixer with a real focus timer" and developer angles.
- **Domain:** `focuship.app` (the shared "s" is intentional: focus + ship). Also register `focusship.app` and 301-redirect it, and 301-redirect `focus.aminurislam.me` to `focuship.app`. `focuship.com` is owned by someone else (parked); possibly acquire later, not needed for launch. The owner buys the domains (Cloudflare Registrar).
- **Content:** app landing pages plus a small set of evergreen guides (drafted by Claude, reviewed by the owner).
- **Language:** English only for now; keep the structure ready for more languages (Bengali first).
- **AI crawlers:** allow all (search, citation and training bots) and publish an `llms.txt`. Note: Cloudflare's "Block AI bots" is currently on for the `aminurislam.me` zone (GPTBot/ClaudeBot get 403) and must be turned off.
- **Measurement:** Cloudflare Web Analytics (no cookies) + Google Search Console + Bing Webmaster Tools (Bing feeds ChatGPT search/Copilot).

- **Brand:** full rename from "Let Me Focus" to **Focuship**: visible name, manifest, metadata, share text, README, `package.json`, code identifiers, storage key (`focuship:v1`), cache names, Worker name and the GitHub repo. Saved state doesn't carry across the domain move (storage is per-origin), so no migration from `focuship:v1`.

- **AI-bot settings:** on the new `focuship.app` zone the owner turns off Block AI bots, AI Labyrinth and Managed robots.txt (we ship our own `robots.txt` + `llms.txt`); verify with GPTBot/ClaudeBot user agents. Leave the `aminurislam.me` zone's AI-bot block as is — the old subdomain only redirects.

- **Landing pages — programmatic SEO with quality gates:** four data-driven templates rendered with `generateStaticParams` (static export):
  - Sound `/sounds/<id>` (up to 64), Timer `/timer/<duration>` + `/pomodoro/<work>-<break>` (~15), Activity `/sounds-for/<activity>` (~8), Mix `/mix/<slug>` (presets + curated pairs, ~30).
  - Hero pages get hand-written copy layered over the template: brown/white/pink noise, rain, thunderstorm, ocean waves, fireplace, coffee shop, binaural beats, pomodoro timer, focus timer, coding.
  - Gates: no pure cross-products; a page is generated only with real demand and unique value (own sound/mix/timer setting, specific copy, FAQ, related links). Pages that fail the gate get `noindex` and stay out of the sitemap.
  - Publish in waves: wave 1 = hero pages + timer pages (~27); later waves once Search Console shows indexing. Prune or merge zero-impression pages after 2–3 months.
  - Status: wave 2 (37 pages: high-demand sounds, the presets as mixes, rain and fireplace, six activities) passes the gate and goes live by setting `RELEASED_WAVE = 2`. Wave 3 (33 lower-demand sounds) is built but still under the word gate — expand its copy before releasing it.

- **Landing-page behaviour:** the real player first (H1 names the page, its mix preloaded — no autoplay), then the guide content below: what it is, why it helps, mixes to try, FAQ, related links. Each page is prerendered with its own title, description, canonical and JSON-LD (FAQPage + SoftwareApplication). Timer pages open on the timer. PWA `start_url` stays `/`.

- **Guides (first six, under `/guides/`):** brown vs white vs pink noise for focus; the Pomodoro Technique (timer built in); do binaural beats help focus (research); best background sounds for coding/deep work; why café noise helps creative work (~70 dB study); brown noise for ADHD (evidence only, no medical claims, "not medical advice" note). Claude drafts with sources, owner reviews. Later: deep-work routine, lofi vs ambient noise.

- **License:** MIT (copyright Md. Aminur Islam), so the repo qualifies for awesome-lists and "open source" launch posts. README gets a credits section (Moodist sounds, superset.sh style).

- **Launch (owner posts; Claude drafts the copy):** only after focuship.app, redirects, landing pages, guides and Search Console are live. Phased: week 0 directories (AlternativeTo as an alternative to Noisli/myNoise/A Soft Murmur/Brain.fm, SaaSHub, Indie Hackers, Peerlist, Uneed, BetaList) + awesome-list PRs; week 1 Show HN + dev.to/Hashnode build write-up; week 2 Product Hunt; then Reddit one subreddit per week (r/SideProject, r/webdev Showoff Saturday, r/productivity, r/GetStudying — follow each sub's self-promo rules) + X/Bluesky/LinkedIn.

- **Before launch:** ship the sci-fi drone (original, fits the spaceship theme), random first mix and category counts. Photo scene backgrounds wait until after launch (lazy-loaded so they don't hurt first paint).

Build order: rename → domain + redirects → SEO foundation (metadata, canonical, OG images, sitemap, robots, llms.txt, JSON-LD, analytics, Search Console/Bing verification) → pSEO templates (wave 1) → 6 guides (owner reviews) → pre-launch features → launch kit (copy for each channel).
