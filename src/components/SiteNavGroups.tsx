"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "./ui";

interface Group {
  heading: string;
  links: { href: string; label: string; title?: string }[];
}

/** Site link lists for the sidebar and the You tab, with the current page marked. */
export function SiteNavGroups({ groups }: { groups: Group[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Site" className="flex flex-col gap-7">
      {groups.map(({ heading, links }) => (
        <div key={heading} className="flex flex-col gap-1.5">
          <p className="px-2.5 text-xs text-faint">{heading}</p>
          <ul className="flex flex-col">
            {links.map(({ href, label, title }) => {
              const current = href === pathname;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={title}
                    aria-current={current ? "page" : undefined}
                    className={cx(
                      "flex min-h-9 items-center rounded-[10px] px-2.5 text-[0.84rem] transition-colors md:min-h-8",
                      current ? "bg-[#161616] font-[550] text-fg" : "text-body hover:bg-white/[0.03] hover:text-fg",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
