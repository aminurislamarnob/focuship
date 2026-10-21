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
    // Sounds and Timers already have main tabs; Explore holds only the rest.
    links: [...HUBS.filter((hub) => hub.id !== "sounds" && hub.id !== "timers"), GUIDES_HUB].map((hub) => ({
      href: hub.path,
      label: hub.label,
      title: hub.title,
    })),
  },
];

/**
 * Site-wide links to the hero pages and hubs. A server component, so the page catalogue
 * stays out of the client bundle: only the plain {href, label} list crosses to the client,
 * where SiteNavGroups lists it and marks the current page.
 */
export function SiteNav() {
  return <SiteNavGroups groups={GROUPS} />;
}
