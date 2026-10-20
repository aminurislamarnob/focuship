import type { Metadata } from "next";
import { SITE_NAME } from "./site";

interface PageMeta {
  /** Bare title; the layout's template appends " · Focuship". Pass `absolute` to skip the template. */
  title: string | { absolute: string };
  description: string;
  path: string;
  noindex?: boolean;
}

/**
 * Per-page metadata. Next merges `openGraph` and `twitter` shallowly, so every page
 * restates them in full; the og/twitter image comes from the nearest opengraph-image file.
 */
export function pageMetadata({ title, description, path, noindex }: PageMeta): Metadata {
  const ogTitle = typeof title === "string" ? `${title} · ${SITE_NAME}` : title.absolute;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: path, title: ogTitle, description },
    twitter: { card: "summary_large_image", title: ogTitle, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
