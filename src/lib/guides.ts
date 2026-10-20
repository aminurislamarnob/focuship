import type { Faq, Section } from "./pages";
import { NOISE_COLOURS } from "@/content/guides/noise-colours";

/** Evergreen, sourced articles. Each stays noindex until the owner marks it reviewed. */

export interface Source {
  title: string;
  /** Journal, publisher or site. */
  publication: string;
  year: number;
  url: string;
}

export interface Guide {
  slug: string;
  /** `<title>` without the brand suffix. */
  title: string;
  description: string;
  heading: string;
  /** The lede under the H1. */
  standfirst: string;
  /** ISO dates. */
  published: string;
  updated: string;
  /** Set once the owner has reviewed the draft. Unreviewed guides are built but not indexed. */
  reviewed: boolean;
  /** Shown above the article, e.g. "Not medical advice". */
  notice?: string;
  /** Pages to play while reading, shown as buttons under the standfirst. */
  listen: { label: string; path: string }[];
  sections: Section[];
  faq: Faq[];
  sources: Source[];
  related: string[];
}

export const GUIDES: Guide[] = [NOISE_COLOURS];

export const guidePath = (guide: Pick<Guide, "slug">) => `/guides/${guide.slug}`;

export const isGuideIndexable = (guide: Guide) => guide.reviewed;

export const findGuide = (slug: string) => GUIDES.find((guide) => guide.slug === slug);

export const GUIDES_HUB = {
  path: "/guides",
  label: "Guides",
  title: "Guides to focus, sound and timers",
  description:
    "Evidence-based guides to background sound and focus: brown, pink and white noise, binaural beats, café noise and the Pomodoro Technique, with sources.",
  intro: "Plain-language guides to sound and focus, with the research behind them.",
};
