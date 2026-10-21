import { GUIDES_HUB } from "@/lib/guides";
import { HUBS, PAGES, pagePath } from "@/lib/pages";
import { SiteNavGroups, type SiteGroup, type SiteLink } from "./SiteNavGroups";

const GROUPS: SiteGroup[] = [
  {
    heading: "Popular",
    links: PAGES.filter((page) => page.hero).map((page) => ({
      href: pagePath(page),
      label: page.heading,
      icon: page.type === "timer" || page.type === "pomodoro" ? "timer" : page.slug,
    })),
  },
  {
    heading: "Explore",
    // Sounds and Timers already have main tabs; Explore holds only the rest.
    links: [
      ...HUBS.filter((hub) => hub.id !== "sounds" && hub.id !== "timers").map((hub) => ({ ...hub, icon: hub.id })),
      { ...GUIDES_HUB, icon: "guides" },
    ]
      .map(({ path, label, title, icon }): SiteLink => ({ href: path, label, title, icon }))
      .concat({ href: "/about", label: "About & offline", icon: "about", kbd: "4" }),
  },
];

/**
 * Site-wide links to the hero pages and hubs. A server component, so the page catalogue
 * stays out of the client bundle: only the plain {href, label, icon} list crosses to the client,
 * where SiteNavGroups lists it and marks the current page.
 */
export function SiteNav() {
  return <SiteNavGroups groups={GROUPS} />;
}
