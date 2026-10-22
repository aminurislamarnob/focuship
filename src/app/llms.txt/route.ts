import { PRESETS, SOUNDS } from "@/lib/catalog";
import { GUIDES, GUIDES_HUB, guidePath, isGuideIndexable } from "@/lib/guides";
import { liveHubs, pagePath, pagesInHub, isIndexable } from "@/lib/pages";
import { MCP_DESCRIPTION, MCP_URL } from "@/lib/mcp";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// https://llmstxt.org — a plain-language map of the site for language models.
export function GET() {
  const recordings = SOUNDS.filter((sound) => sound.source.type === "file").length;
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} is a free web app (installable as a PWA) that mixes ambient sounds with a focus timer. It runs entirely in the browser: no account needed, no tracking cookies, and it works offline once sounds have been played. An optional account adds favorites, saved presets and settings sync.

- ${SOUNDS.length} sounds: ${recordings} field recordings (rain, nature, animals, places, transport, household things, city) plus generated brown, pink and white noise, theta, alpha, beta and gamma binaural tones and a synthesised starship engine hum.
- Every sound has its own volume; start from ${PRESETS.length} curated presets or shuffle.
- Pomodoro-style focus timer with short and long breaks, auto-start and notifications.
- Focus mode: a full-screen clock or countdown that keeps the screen awake.
- Shareable mix links, keyboard shortcuts, lock-screen media controls.

## App

- [${SITE_NAME}](${absoluteUrl("/")}): the sound mixer and focus timer

## For AI assistants

${SITE_NAME} has an MCP server, so an assistant can design mixes and manage a listener's presets, favorites and focus timer on their behalf. It cannot play sound: it returns a link that opens the mix ready to play. A free ${SITE_NAME} account and OAuth sign-in are required.

- Connector URL: ${MCP_URL}
- [How to connect one](${absoluteUrl("/mcp")}): ${MCP_DESCRIPTION}
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
${
  GUIDES.some(isGuideIndexable)
    ? `
## Guides

- [${GUIDES_HUB.title}](${absoluteUrl(GUIDES_HUB.path)}): ${GUIDES_HUB.intro}
${GUIDES.filter(isGuideIndexable)
  .map((guide) => `- [${guide.heading}](${absoluteUrl(guidePath(guide))}): ${guide.description}`)
  .join("\n")}
`
    : ""
}`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
