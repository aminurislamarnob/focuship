"use client";

import {
  ArrowDownToLine,
  AudioLines,
  AudioWaveform,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CloudRain,
  Code,
  Coffee,
  Compass,
  Flame,
  Headphones,
  Layers,
  Timer,
  TrendingUp,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

export interface SiteLink {
  href: string;
  label: string;
  title?: string;
  /** A key into LINK_ICONS: the page's slug, "timer", or a hub id. */
  icon: string;
  /** Its keyboard shortcut, if it has one. */
  kbd?: string;
}

export interface SiteGroup {
  heading: "Popular" | "Explore";
  links: SiteLink[];
}

const GROUP_ICONS: Record<SiteGroup["heading"], LucideIcon> = { Popular: TrendingUp, Explore: Compass };

const LINK_ICONS: Record<string, LucideIcon> = {
  "brown-noise": AudioWaveform,
  "white-noise": AudioWaveform,
  "pink-noise": AudioWaveform,
  "ocean-waves": Waves,
  fireplace: Flame,
  "coffee-shop": Coffee,
  "binaural-beats": Headphones,
  timer: Timer,
  "rain-sounds": CloudRain,
  thunderstorm: Zap,
  coding: Code,
  activities: BriefcaseBusiness,
  mixes: Layers,
  guides: BookOpen,
  about: ArrowDownToLine,
};

/**
 * Site link groups for the sidebar and the You tab, each a disclosure with the current page marked.
 * Groups start closed, except the one holding the page you are on. A page with no link of its own
 * (a guide article, a mix not in Popular) highlights its section instead: /guides/x lights "Guides".
 */
export function SiteNavGroups({ groups }: { groups: SiteGroup[] }) {
  const pathname = usePathname();
  const all = groups.flatMap((group) => group.links);
  const exact = all.some((link) => link.href === pathname);
  const isHere = (href: string) => href === pathname || (!exact && pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Site" className="flex flex-col gap-0.5">
      {groups.map(({ heading, links }) => {
        const GroupIcon = GROUP_ICONS[heading];
        return (
          <details key={heading} open={links.some((link) => isHere(link.href))} className="group">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2.5 rounded-[10px] px-2.5 text-sm text-muted transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
              <GroupIcon className="size-[18px]" strokeWidth={1.75} aria-hidden />
              {heading}
              <ChevronDown
                className="ml-auto size-3.5 text-faint transition-transform duration-200 group-open:rotate-180"
                strokeWidth={2}
                aria-hidden
              />
            </summary>
            <ul className="flex flex-col pt-0.5 pb-1">
              {links.map(({ href, label, title, icon, kbd }) => {
                const current = href === pathname;
                const here = isHere(href);
                const Icon = LINK_ICONS[icon] ?? AudioLines;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={title}
                      aria-current={current ? "page" : undefined}
                      className={cx(
                        "flex min-h-11 items-center gap-2.5 rounded-[9px] pr-2.5 pl-[22px] text-[0.84rem] transition-colors md:min-h-[34px]",
                        here ? "bg-[#161616] font-[550] text-fg" : "text-body hover:bg-white/[0.03] hover:text-fg",
                      )}
                    >
                      <Icon className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden />
                      {label}
                      {kbd && <kbd className="label-mono ml-auto text-[0.6875rem]">{kbd}</kbd>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </nav>
  );
}
