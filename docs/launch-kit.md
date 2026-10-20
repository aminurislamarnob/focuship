# Focuship launch kit

Ready-to-post copy for the phased launch. The owner posts everything; nothing here is automated.

**Start only when** focuship.app is live, the old domain redirects, the wave 1 pages are indexed in Search Console and the guides are reviewed.

Links used throughout:

- App: https://focuship.app
- Repo: https://github.com/aminurislamarnob/focuship
- Hero pages: https://focuship.app/sounds/brown-noise · https://focuship.app/pomodoro/25-5 · https://focuship.app/sounds-for/coding

## Schedule

| When | Channel | Goal |
| --- | --- | --- |
| Week 0 (quiet) | Directories, AlternativeTo, awesome-list PRs | Durable backlinks; get crawled |
| Week 1, Tue–Thu morning US time | Show HN + dev.to/Hashnode write-up, same day | Developer audience, technical credibility |
| Week 2, a Tuesday (12:01am PT) | Product Hunt | Broad launch, polished with HN feedback |
| Weeks 3–6 | One subreddit per week, then X, Bluesky, LinkedIn | Steady referral traffic |

Reply to every comment on launch days. Fix reported bugs quickly and say so in the thread.

## Shared copy

**Name:** Focuship

**Tagline (60 chars):** Ambient sound mixer and focus timer. Free, offline, no sign-up.

**Short description (160 chars):** Mix rain, café, brown noise and binaural beats, run Pomodoro sessions and keep working offline. Free, open source, no account, no tracking cookies.

**Long description:**

> Focuship is a free ambient sound mixer with a real focus timer. Layer up to 64 sounds (rain, cafés, trains, forests, brown/pink/white noise, binaural beats and an original synthesised starship hum), each with its own volume, then start a Pomodoro session and open focus mode for a full-screen countdown that keeps your screen awake.
>
> It installs as an app, keeps playing with the screen locked, works offline, and has keyboard shortcuts for everything. There is no account, no ads and no tracking cookies, and the code is MIT-licensed on GitHub.

**Tags:** productivity, focus, pomodoro, ambient sound, white noise, open source, PWA

## Week 0: directories and lists

### AlternativeTo

- **Listing as alternative to:** Noisli, myNoise, A Soft Murmur, Brain.fm, Rainy Mood
- **Platforms:** Web, Online, PWA (Windows, macOS, Linux, Android, iOS via browser)
- **License:** Free, Open Source (MIT)
- **Description:** use the long description above.
- **Features to tick:** Ad-free, No registration required, Works offline, Dark mode, Pomodoro timer, Background noise, Open source

### SaaSHub, Peerlist, Uneed, BetaList, Indie Hackers

Use the tagline and long description. For Indie Hackers, post in the product directory and add a short "Why I built it" note:

> I wanted one tab that did both things I use all day: a background soundscape that doesn’t loop audibly, and a Pomodoro timer that doesn’t live in a different app. Focuship is a static site with a hand-written Web Audio engine, so it costs almost nothing to run and works offline.

### Awesome-list pull requests

Check each list’s CONTRIBUTING file first (alphabetical order, format, licence requirements).

- **Productivity lists** (for example awesome-productivity). Entry: `[Focuship](https://focuship.app) - Ambient sound mixer and Pomodoro timer. Free, offline, open source.`
- **PWA lists** (for example awesome-pwa). Entry: `[Focuship](https://focuship.app) - Offline-first ambient sound mixer and focus timer; gapless audio loops via Web Audio. ([Source](https://github.com/aminurislamarnob/focuship))`
- **Open-source app lists.** Entry: `[Focuship](https://github.com/aminurislamarnob/focuship) - Ambient sound mixer and focus timer PWA (Next.js, Web Audio). MIT.`

PR description:

> Adds Focuship, an MIT-licensed ambient sound mixer and focus timer. It’s a static PWA (works offline, no account, no tracking). Entry follows the list’s format and is in alphabetical order.

## Week 1: Show HN and a technical write-up

### Show HN

**Title:** Show HN: Focuship – an open-source ambient sound mixer and focus timer (static PWA)

**URL:** https://focuship.app

**First comment:**

> Hi HN, I built Focuship because I kept running a noise generator in one tab and a Pomodoro timer in another.
>
> It’s a fully static site (Next.js static export on Cloudflare) with a hand-written Web Audio engine. A few things that were fun to get right:
>
> - **Gapless loops.** Most MP3 loops have a gap at the seam. Each recording plays on two media elements that crossfade near the end, and files are fetched whole into blob URLs so the service worker can cache them (no range requests).
> - **Generated noise that doesn’t click.** Brown/pink/white noise is generated as a 10-second buffer whose tail is folded into its head with an equal-power fade, so the loop seam is inaudible.
> - **An original drone.** The "starship hum" is synthesised live: detuned low oscillators through an LFO-swept low-pass, plus band-passed noise. It never repeats.
> - **Mobile audio.** Audio has to start inside the tap handler, so the store calls a declarative `sync(layers, playing, volume)` synchronously from user actions. It also claims Safari’s playback audio session and keeps a media session alive for lock-screen controls.
> - **Offline.** It installs as a PWA; sounds are cached as you play them, or all at once.
>
> No account, no ads, no tracking cookies. Code is MIT: https://github.com/aminurislamarnob/focuship
>
> I’d love feedback on the sound design and the timer.

### dev.to / Hashnode article

**Title:** How I built a gapless ambient sound mixer with the Web Audio API

**Outline:**

1. The problem: looping audio on the web is harder than it looks (gaps, mobile autoplay rules, range requests vs. service workers).
2. Gapless file loops: two decks and an equal-power crossfade.
3. Generating noise colours: white, Kellet’s pink filter, brown as integrated white noise; folding the tail into the head for a seamless loop.
4. Binaural beats: two panned oscillators, and why they need headphones.
5. Designing a drone from scratch: oscillators, a swept filter and filtered noise.
6. Making mobile behave: starting audio inside gestures, the Media Session API, Safari’s `audioSession`.
7. Shipping it as a static PWA on Cloudflare: headers, caching sounds, offline fallback.
8. Programmatic SEO without spam: a page registry with a quality gate.

**Canonical URL:** publish the article on dev.to with its canonical set to the same piece on focuship.app if one is published there later; otherwise leave it as the original.

## Week 2: Product Hunt

- **Name:** Focuship
- **Tagline:** Ambient sound mixer and focus timer. Free, offline, no sign-up.
- **Description (260 chars):** Layer rain, café, brown noise and binaural beats into your own soundscape, then start a Pomodoro session. Focus mode keeps the screen awake. Installs as an app, works offline, no account or tracking. Open source (MIT).
- **Topics:** Productivity, Open Source, Health & Fitness
- **Gallery:** (1) Mix view with a preset playing, (2) Sounds library, (3) Timer with focus mode, (4) a landing page such as /sounds/brown-noise, (5) phone screenshot on the lock screen with media controls.
- **Maker comment:**

> Hey Product Hunt! Focuship is the focus setup I wanted: a soundscape that never loops audibly plus a Pomodoro timer, in one tab. Mix any of 64 sounds, including an original synthesised "starship hum", start a session, and go full-screen. It works offline and keeps playing with your screen off. It’s free and open source. What would you add?

## Weeks 3–6: Reddit

Read each subreddit’s sidebar rules on the day you post; they change. Typical rules: no link-only posts, disclose that you are the maker, and contribute to the community beyond self-promotion.

### r/SideProject

**Title:** I built Focuship: an open-source ambient sound mixer + Pomodoro timer that works offline

> Maker here. Focuship lets you layer rain, café, brown noise, binaural beats and more, each with its own volume, and run Pomodoro sessions in the same tab. It’s a static PWA (Next.js + Web Audio on Cloudflare), so it’s free to run, works offline and has no accounts or tracking. Happy to answer anything about the build. Feedback welcome!

### r/webdev (Showoff Saturday only)

**Title:** [Showoff Saturday] A gapless ambient sound mixer built with the Web Audio API, shipped as a static PWA

> Built with Next.js static export, a hand-written Web Audio engine (two-deck crossfade for gapless MP3 loops, generated noise with a folded loop seam, a synthesised drone) and a service worker that caches sounds for offline use. Source is MIT: (repo link). Curious what you think of the audio approach.

### r/productivity

Many productivity subreddits restrict self-promotion to specific threads; use the weekly self-promotion thread if there is one.

> I made a free focus tool that combines background sound (rain, café, brown noise) with a Pomodoro timer and a full-screen focus mode. No sign-up or ads. I’d love to know which sounds people here actually work to.

### r/GetStudying

Check whether resource posts are allowed, or use the designated thread.

> For anyone who studies better with background noise: I built a free study sound mixer with a library ambience, rain, pink noise and a Pomodoro timer. It works offline, so it’s usable in libraries with bad Wi-Fi. No account needed.

## Social

**X / Bluesky:**

> I built Focuship: an ambient sound mixer + focus timer in one tab.
>
> 🌧 64 sounds, including a synthesised starship hum
> ⏱ Pomodoro with focus mode
> ✈️ Works offline, keeps playing with the screen off
> 🔓 Free, no account, MIT open source
>
> https://focuship.app

**LinkedIn:**

> I shipped a side project: Focuship, a free ambient sound mixer and focus timer. It started as a frustration (a noise tab and a timer tab, all day) and became a small exercise in doing a lot with very little: a static site, a hand-written Web Audio engine and an offline-first PWA, with no backend at all. If you work better with background sound, give it a try and tell me what to improve. https://focuship.app

## After launch

- Week 4 and week 8: check Search Console queries; add pages for searches you appear for but have no page for, and release the next wave when indexing looks healthy.
- Month 3: prune or merge pages with no impressions.
- Collect feedback from every channel into GitHub issues.
