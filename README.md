# Let Me Focus

A mobile-first ambient sound mixer and focus timer, built with Next.js and installable as a PWA.

- **Mix:** layer up to 63 sounds (56 recordings plus generated noise and binaural tones), each with its own volume. Start from 10 presets or shuffle.
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

The site runs on Cloudflare as a static-assets Worker: **https://let-me-focus.dev-aiarnob.workers.dev**

```bash
npx wrangler login   # once
npm run deploy       # next build && wrangler deploy
```

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
