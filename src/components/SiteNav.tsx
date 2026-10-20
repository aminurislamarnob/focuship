import { GUIDES_HUB } from "@/lib/guides";
import { HUBS, PAGES, pagePath } from "@/lib/pages";
import { SiteNavGroups } from "./SiteNavGroups";

const GROUPS = [
  {
    heading: "Popular",
    links: PAGES.filter((page) => page.hero).map((page) => ({ href: pagePath(page), label: page.heading })),
  },
  {
    heading: "Explore",
    links: [...HUBS, GUIDES_HUB].map((hub) => ({ href: hub.path, label: hub.label, title: hub.title })),
  },
];

/**
 * Site-wide links to the hero pages and hubs. A server component, so the page catalogue
 * stays out of the client bundle: only the plain {href, label} list crosses to the client,
 * where SiteNavGroups folds it into menus and highlights the current page.
 */
export function SiteNav() {
  return <SiteNavGroups groups={GROUPS} />;
}
