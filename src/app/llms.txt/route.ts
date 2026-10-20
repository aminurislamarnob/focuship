import { liveHubs, pagePath, pagesInHub, isIndexable } from "@/lib/pages";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// https://llmstxt.org — a plain-language map of the site for language models.
export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is a free web app (installable as a PWA) that mixes ambient sounds with a focus timer. It runs entirely in the browser: no account, no tracking cookies, and it works offline once sounds have been played.

- 63 sounds: 56 field recordings (rain, nature, animals, places, transport, household things, city) plus generated brown, pink and white noise and theta, alpha, beta and gamma binaural tones.
- Every sound has its own volume; start from 10 curated presets or shuffle.
- Pomodoro-style focus timer with short and long breaks, auto-start and notifications.
- Focus mode: a full-screen clock or countdown that keeps the screen awake.
- Shareable mix links, keyboard shortcuts, lock-screen media controls.

## App

- [${SITE_NAME}](${absoluteUrl("/")}): the sound mixer and focus timer
${liveHubs()
  .map(
    (hub) => `
## ${hub.label}

- [${hub.title}](${absoluteUrl(hub.path)}): ${hub.intro}
${pagesInHub(hub.id)
  .filter(isIndexable)
  .map((page) => `- [${page.heading}](${absoluteUrl(pagePath(page))}): ${page.description}`)
  .join("\n")}`,
  )
  .join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
