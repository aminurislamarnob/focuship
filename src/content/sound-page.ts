import type { Faq, LandingPage } from "@/lib/pages";

/** Builds a later-wave sound page from its specific copy. Only the closing line and offline FAQ are shared. */
export interface SoundSpec {
  id: string;
  slug: string;
  wave: number;
  heading: string;
  title: string;
  description: string;
  intro: string;
  /** What the recording is and why people use it. */
  about: string[];
  goodFor: string[];
  mixes: string[];
  /** Practical advice specific to this sound. */
  tips?: string[];
  faq: Faq[];
  related: string[];
  volume?: number;
}

const OFFLINE_FAQ: Faq = {
  q: "Does this sound work offline?",
  a: "Yes. The recording is saved on your device the first time it plays, and you can save every sound at once from About & offline.",
};

const GENERATED_FAQ: Faq = {
  q: "Does this sound work offline?",
  a: "Yes. It is generated on your device rather than streamed, so it never needs to download and keeps playing without a connection.",
};

export const soundPage = (spec: SoundSpec, generated = false): LandingPage => ({
  type: "sound",
  slug: spec.slug,
  wave: spec.wave,
  title: spec.title,
  description: spec.description,
  heading: spec.heading,
  intro: spec.intro,
  intent: { label: spec.heading, layers: { [spec.id]: spec.volume ?? 0.6 } },
  copy: [
    { heading: "About this sound", body: spec.about },
    { heading: "Good for", body: [{ list: spec.goodFor }] },
    ...(spec.tips ? [{ heading: "Getting the most from it", body: spec.tips }] : []),
    {
      heading: "Mixes to try",
      body: [
        { list: spec.mixes },
        "Every sound in Focuship has its own volume slider, so you can blend this one with others, pair it with a focus timer and share the result as a link.",
      ],
    },
  ],
  faq: [...spec.faq, generated ? GENERATED_FAQ : OFFLINE_FAQ],
  related: spec.related,
});
