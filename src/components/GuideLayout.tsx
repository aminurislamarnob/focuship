import Link from "next/link";
import type { ReactNode } from "react";
import { HUBS } from "@/lib/pages";
import { GUIDES_HUB } from "@/lib/guides";
import { Logo } from "./Logo";

/** Reading layout for guides: a slim site header, the article column and a footer. Scrolls like a normal page. */
export function GuideLayout({ children }: { children: ReactNode }) {
  const nav = [...HUBS, GUIDES_HUB];
  return (
    <div className="h-dvh overflow-y-auto">
      <header className="pt-safe border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <Link href="/" aria-label="Focuship home">
            <Logo />
          </Link>
          <Link href="/" className="inline-flex h-10 items-center rounded-[12px] bg-accent px-4 text-sm font-semibold text-accent-ink">
            Open the app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-10 pb-16">{children}</main>
      <footer className="border-t border-line">
        <nav aria-label="Site" className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 px-4 py-6 text-[0.8125rem] text-muted">
          {nav.map((item) => (
            <Link key={item.path} href={item.path} className="hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
