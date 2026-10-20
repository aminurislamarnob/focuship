import { notFound } from "next/navigation";
import { findPage, isIndexable, pagePath, pagesOfType, type PageType } from "./pages";
import { pageMetadata } from "./seo";

/** Shared plumbing for the landing-page templates: params, metadata and lookup. */
export const landingParams = (type: PageType) => pagesOfType(type).map((page) => ({ slug: page.slug }));

export function landingPage(type: PageType, slug: string) {
  const page = findPage(type, slug);
  if (!page) notFound();
  return page;
}

export function landingMetadata(type: PageType, slug: string) {
  const page = landingPage(type, slug);
  return pageMetadata({ title: page.title, description: page.description, path: pagePath(page), noindex: !isIndexable(page) });
}
