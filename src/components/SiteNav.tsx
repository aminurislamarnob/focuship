import { ChevronRight, Compass, Flame } from "lucide-react";
import Link from "next/link";
import { GUIDES_HUB } from "@/lib/guides";
import { HUBS, PAGES, pagePath } from "@/lib/pages";

const GROUPS = [
  {
    heading: "Popular",
    icon: Flame,
    links: PAGES.filter((page) => page.hero).map((page) => ({ href: pagePath(page), label: page.heading, title: undefined })),
  },
  {
    heading: "Explore",
    icon: Compass,
    links: [...HUBS, GUIDES_HUB].map((hub) => ({ href: hub.path, label: hub.label, title: hub.title })),
  },
];

/**
 * Site-wide links to the hero pages and hubs, as collapsible groups (closed by default).
 * Native <details> keeps every link in the server HTML and needs no client JavaScript;
 * as a server component it also keeps the page catalogue out of the client bundle.
 */
export function SiteNav() {
  return (
    <nav aria-label="Site" className="flex flex-col gap-1">
      {GROUPS.map(({ heading, icon: Icon, links }) => (
        <details key={heading} className="group">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-3 rounded-[4px] px-3 text-sm text-muted transition-colors select-none hover:bg-surface hover:text-fg group-open:text-fg [&::-webkit-details-marker]:hidden">
            <Icon className="size-4" aria-hidden />
            {heading}
            <ChevronRight className="ml-auto size-3.5 text-faint transition-transform group-open:rotate-90" aria-hidden />
          </summary>
          <ul className="mt-1 mb-2 ml-5 flex flex-col border-l border-line pl-2">
            {links.map(({ href, label, title }) => (
              <li key={href}>
                <Link
                  href={href}
                  title={title}
                  className="flex h-8 items-center rounded-[4px] px-3 text-[0.8125rem] text-muted transition-colors hover:bg-surface hover:text-fg"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  );
}
