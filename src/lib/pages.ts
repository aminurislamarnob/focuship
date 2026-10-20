import { CATEGORIES, SOUND_BY_ID, type Layers } from "./catalog";
import type { Tab } from "./store";
import { SOUND_PAGES } from "@/content/sounds";
import { TIMER_HUB, TIMER_PAGES } from "@/content/timers";

/**
 * The page registry: every programmatic landing page, as data. Page routes, hubs,
 * the sitemap, llms.txt and internal links all read from here.
 */

export type PageType = "sound" | "timer" | "pomodoro" | "activity" | "mix";

/** Copy blocks: a paragraph, or a bullet list. Inline `[text](/path)` links and `**bold**` are supported. */
export type Block = string | { list: string[] };

export interface Section {
  heading: string;
  body: Block[];
}

export interface Faq {
  q: string;
  a: string;
}

/** What the app loads when a visitor lands on the page. Applied during hydration; never autoplays. */
export interface PageIntent {
  /** Short name used in the "ready" notice, e.g. "Brown noise". */
  label: string;
  layers?: Layers;
  tab?: Tab;
  timer?: { focus: number; short?: number; long?: number };
}

export interface LandingPage {
  type: PageType;
  slug: string;
  /** `<title>` without the brand suffix. */
  title: string;
  description: string;
  /** The page's H1. */
  heading: string;
  /** One line under the H1, next to the player. */
  intro: string;
  copy: Section[];
  faq: Faq[];
  intent: PageIntent;
  /** Paths of related landing pages, hubs or guides. */
  related: string[];
  /** Release wave. Pages in unreleased waves are built but not indexed. */
  wave: number;
  /** High-value pages with hand-written copy. */
  hero?: boolean;
}

/** Waves up to and including this one are indexable. Raise it to release the next wave. */
export const RELEASED_WAVE = 1;

export const MIN_WORDS = 250;
export const MIN_FAQ = 3;
export const MIN_RELATED = 2;

export type HubId = "sounds" | "timers" | "activities" | "mixes";

export interface Hub {
  id: HubId;
  path: string;
  label: string;
  title: string;
  /** H1; defaults to the title. */
  heading?: string;
  description: string;
  intro: string;
  /** Optional hand-written copy and FAQ, for hubs that are hero pages themselves. */
  copy?: Section[];
  faq?: Faq[];
  intent?: PageIntent;
}

export const HUBS: Hub[] = [
  {
    id: "sounds",
    path: "/sounds",
    label: "Sounds",
    title: "Ambient sounds and noise for focus",
    description:
      "Free ambient sounds for focus, study and sleep: rain, thunder, ocean waves, fireplace, café, brown, pink and white noise and binaural beats. Mix them in your browser.",
    intro: "Every sound plays in the mixer, alone or layered with others.",
  },
  { ...TIMER_HUB, id: "timers", path: "/timer", label: "Timers" },
  {
    id: "activities",
    path: "/sounds-for",
    label: "Activities",
    title: "Sounds for coding, studying, reading and more",
    description:
      "Background sound mixes tuned for different kinds of work: coding, studying, reading, writing and more. Free, in your browser, no sign-up.",
    intro: "Each activity has a mix tuned for it. Adjust any layer to taste.",
  },
  {
    id: "mixes",
    path: "/mix",
    label: "Mixes",
    title: "Ambient sound mixes",
    description:
      "Ready-made ambient mixes such as thunderstorm, rain and fireplace, or a café on a rainy day. Play them free in your browser and adjust every layer.",
    intro: "Ready-made soundscapes. Every layer stays adjustable.",
  },
];

const HUB_OF: Record<PageType, HubId> = {
  sound: "sounds",
  timer: "timers",
  pomodoro: "timers",
  activity: "activities",
  mix: "mixes",
};

export const hubOf = (page: Pick<LandingPage, "type">) => HUBS.find((hub) => hub.id === HUB_OF[page.type])!;

export const pagesInHub = (id: HubId) => PAGES.filter((page) => HUB_OF[page.type] === id);

const SEGMENT: Record<PageType, string> = {
  sound: "sounds",
  timer: "timer",
  pomodoro: "pomodoro",
  activity: "sounds-for",
  mix: "mix",
};

export const pagePath = (page: Pick<LandingPage, "type" | "slug">) => `/${SEGMENT[page.type]}/${page.slug}`;

const words = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).filter(Boolean).length;

export const wordCount = (page: LandingPage) =>
  words(page.intro) +
  page.copy.reduce(
    (sum, section) =>
      sum + section.body.reduce((n, block) => n + (typeof block === "string" ? words(block) : words(block.list.join(" "))), 0),
    0,
  );

/** The quality gate: only released pages with enough unique substance are indexed. */
export const isIndexable = (page: LandingPage) =>
  page.wave <= RELEASED_WAVE &&
  wordCount(page) >= MIN_WORDS &&
  page.faq.length >= MIN_FAQ &&
  page.related.length >= MIN_RELATED;

export const PAGES: LandingPage[] = [...SOUND_PAGES, ...TIMER_PAGES];

export const pagesOfType = (type: PageType) => PAGES.filter((page) => page.type === type);

export const findPage = (type: PageType, slug: string) => PAGES.find((page) => page.type === type && page.slug === slug);

export const indexablePages = () => PAGES.filter(isIndexable);

/** Hubs with at least one indexable page. Empty hubs aren't built. */
export const liveHubs = () => HUBS.filter((hub) => pagesInHub(hub.id).some(isIndexable));

// Build-time integrity checks: a broken registry fails the build instead of shipping bad pages.
const paths = new Set(PAGES.map(pagePath));
const hubPaths = new Set(HUBS.map((hub) => hub.path));
const categoryIds = new Set<string>(CATEGORIES.map((category) => category.id));
for (const page of PAGES) {
  const at = pagePath(page);
  if (PAGES.filter((other) => pagePath(other) === at).length > 1) throw new Error(`Duplicate page ${at}`);
  // /sounds/<category>/ holds the audio files, so a page can't take a category's name.
  if (page.type === "sound" && categoryIds.has(page.slug)) throw new Error(`${at} collides with an audio folder`);
  for (const id of Object.keys(page.intent.layers ?? {})) {
    if (!SOUND_BY_ID.has(id)) throw new Error(`${at} uses unknown sound "${id}"`);
  }
  for (const link of page.related) {
    if (!paths.has(link) && !hubPaths.has(link) && !link.startsWith("/guides/") && link !== "/") {
      throw new Error(`${at} links to unknown page ${link}`);
    }
  }
}
