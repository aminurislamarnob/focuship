# Focuship

A mobile-first ambient sound mixer and focus timer, built with Next.js and installable as a PWA.

- **Mix:** layer up to 64 sounds (56 recordings plus generated noise, binaural tones and a synthesised starship hum), each with its own volume. Start from 11 presets or shuffle.
- **Timer:** focus and break sessions with a chime, optional auto-start and notifications.
- **Focus mode:** full-screen clock or timer. Controls hide after 3 seconds and the screen stays awake.
- **App-like:** installs to the Home Screen, works offline, keeps playing with the screen locked, and shows up in OS media controls. Mixes can be shared as links (`/?mix=light-rain:55,cafe:45`).

## Keyboard shortcuts

Shortcuts are ignored while you're typing in the search box. With a slider focused, the arrow keys adjust that slider instead.

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Play / pause |
| <kbd>V</kbd> | Open or close focus mode |
| <kbd>F</kbd> | Full screen (opens focus mode if needed); press again to exit |
| <kbd>M</kbd> | Mute / unmute |
| <kbd>Esc</kbd> | Close focus mode or the open sheet |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> | Switch to Mix, Sounds or Timer |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | Focused slider: ±5% |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Focused slider: ±10% |
| <kbd>Home</kbd> / <kbd>End</kbd> | Focused slider: 0% / 100% |

## Run it

```bash
npm install
npm run dev                              # http://localhost:3000 (service worker disabled in dev)
npm run build && npm start                # serves out/ locally, service worker enabled
```

`next build` writes a fully static site to `out/` (`output: "export"`). Installing and testing offline need that production build, served over HTTPS or on `localhost`.

## Deploy

The site runs on Cloudflare as a static-assets Worker on **https://focuship.app**. The custom domain is declared in `wrangler.jsonc`; on deploy Cloudflare creates its DNS record and certificate. The `workers.dev` URL is turned off so the app has one origin, since installs and offline caches are per-origin.

```bash
npx wrangler login        # once
npm run deploy            # next build && wrangler deploy → focuship.app
npm run deploy:redirect   # the 301 Worker for focus.aminurislam.me, focusship.app and www hosts
```

A second, tiny Worker (`workers/redirect/`) answers every old or alternative hostname with a 301 to the same path and query on `https://focuship.app`.

### Moving from focus.aminurislam.me (one-time)

1. Buy `focuship.app` and `focusship.app` (Cloudflare Registrar puts them in the same account).
2. On the `focuship.app` zone, turn off **Block AI bots**, **AI Labyrinth** and **Managed robots.txt**; the site ships its own `robots.txt` and `llms.txt`.
3. Rename the GitHub repo to `focuship` (the site links to it).
4. `npm run deploy`, then check `https://focuship.app` loads and `curl -A GPTBot -I https://focuship.app` returns 200.
5. Delete the old `let-me-focus` Worker (`npx wrangler delete --name let-me-focus`) to free `focus.aminurislam.me`.
6. `npm run deploy:redirect`, then check `curl -I https://focus.aminurislam.me/timer?x=1` returns a 301 to `https://focuship.app/timer?x=1`.
7. Verify the site in Google Search Console and Bing Webmaster Tools (DNS TXT records) and submit `https://focuship.app/sitemap.xml`.

`wrangler.jsonc` points Cloudflare at `out/`. Response headers (caching, the service worker's no-cache rule, security headers) live in `public/_headers`, since `headers()` in `next.config.ts` doesn't apply to static exports. Sounds are served from the same CDN with a one-year immutable cache, and only changed files are re-uploaded on each deploy.

## How it fits together

| Path | What it does |
| --- | --- |
| `src/lib/catalog.ts` | Sounds, categories and presets |
| `src/lib/audio/engine.ts` | Web Audio engine: `sync(layers, playing, volume)` fades voices in and out. Recordings loop gaplessly by crossfading two media elements. |
| `src/lib/audio/noise.ts` | Seamless white, pink and brown noise buffers |
| `src/lib/store.ts` | App state (`useSyncExternalStore`), persistence, share links, Media Session, timer |
| `src/lib/pwa.ts` | Service worker registration, install prompt, offline downloads |
| `public/sw.js` | Caches the app shell, hashed assets and sounds; offline fallback for the page |
| `src/app/manifest.ts` | Web app manifest, including shortcuts |
| `scripts/generate-icons.mjs` | Renders the icon set (`npm run icons`) |
| `wrangler.jsonc`, `public/_headers` | Cloudflare deployment and response headers |

Sound files are fetched whole and played from memory, so the service worker can cache them. They're saved as you play them, or all at once from **About & offline**.

## Credits

Recordings come from [Moodist](https://github.com/remvze/moodist) by remvze (MIT). Its sounds are under the [Pixabay Content License](https://pixabay.com/service/license-summary/) or [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The visual style follows the dark, mono-accented look of [superset.sh](https://superset.sh).

## License

[MIT](LICENSE) © Md. Aminur Islam. Sound recordings keep their own licenses (see Credits).
