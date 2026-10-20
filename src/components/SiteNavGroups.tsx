"use client";

import { ChevronRight, Compass, Flame } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cx } from "./ui";

interface Group {
  heading: string;
  links: { href: string; label: string; title?: string }[];
}

const ICONS: Record<string, typeof Flame> = { Popular: Flame, Explore: Compass };

/**
 * Collapsible link menus for the sidebar and the mobile menu sheet. An accordion: at most
 * one menu open, and the menu holding the current page opens by itself so there is always
 * a visible "you are here". Closed menus stay in the HTML (hidden), keeping every link
 * crawlable in the static export.
 */
export function SiteNavGroups({ groups }: { groups: Group[] }) {
  const pathname = usePathname();
  const home = groups.find((group) => group.links.some((link) => link.href === pathname))?.heading ?? null;

  // `choice` is the user's manual toggle; navigation clears it so the current page's menu wins.
  const [choice, setChoice] = useState<string | null>(null);
  const [choicePath, setChoicePath] = useState(pathname);
  if (choicePath !== pathname) {
    setChoicePath(pathname);
    setChoice(null);
  }
  const open = choice ?? home;

  return (
    <nav aria-label="Site" className="flex flex-col gap-1">
      <p className="label-mono px-3 pb-1 text-faint">Browse</p>
      {groups.map(({ heading, links }) => {
        const Icon = ICONS[heading] ?? Compass;
        const isOpen = open === heading;
        return (
          <div key={heading}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setChoice(isOpen ? "" : heading)}
              className={cx(
                "flex h-10 w-full cursor-pointer items-center gap-3 rounded-[4px] px-3 text-sm transition-colors hover:bg-surface hover:text-fg",
                isOpen ? "text-fg" : "text-muted",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {heading}
              <ChevronRight className={cx("ml-auto size-3.5 text-faint transition-transform", isOpen && "rotate-90")} aria-hidden />
            </button>
            <ul hidden={!isOpen} className="mt-1 mb-2 ml-5 flex flex-col border-l border-line pl-2">
              {links.map(({ href, label, title }) => {
                const current = href === pathname;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={title}
                      aria-current={current ? "page" : undefined}
                      className={cx(
                        "flex h-8 items-center gap-2 rounded-[4px] px-3 text-[0.8125rem] transition-colors",
                        current ? "bg-surface-2 font-medium text-fg" : "text-muted hover:bg-surface hover:text-fg",
                      )}
                    >
                      {label}
                      {current && <span className="ml-auto h-3.5 w-0.5 bg-brand" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
