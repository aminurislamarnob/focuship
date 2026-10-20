import type { MetadataRoute } from "next";
import { GUIDES, GUIDES_HUB, guidePath, isGuideIndexable } from "@/lib/guides";
import { indexablePages, liveHubs, pagePath } from "@/lib/pages";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

/** Only indexable pages: released waves that pass the quality gate. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...liveHubs().map((hub) => ({ url: absoluteUrl(hub.path), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...indexablePages().map((page) => ({
      url: absoluteUrl(pagePath(page)),
      changeFrequency: "monthly" as const,
      priority: page.hero ? 0.9 : 0.6,
    })),
    ...(GUIDES.some(isGuideIndexable) ? [{ url: absoluteUrl(GUIDES_HUB.path), changeFrequency: "weekly" as const, priority: 0.7 }] : []),
    ...GUIDES.filter(isGuideIndexable).map((guide) => ({
      url: absoluteUrl(guidePath(guide)),
      lastModified: guide.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
