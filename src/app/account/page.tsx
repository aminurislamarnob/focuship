import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AccountView } from "@/components/AccountView";
import { JsonLd, organization } from "@/components/JsonLd";
import { Logo } from "@/components/Logo";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Account",
  description: "Sign in to keep favorites, save your own presets and sync your focus settings across devices.",
  path: "/account",
  noindex: true,
});

/**
 * The account page: sign-in while signed out, identity and account controls
 * while signed in. Deliberately a plain page (not the app shell) — it is the
 * future home of profile management. Kept out of search and the sitemap.
 */
export default function AccountPage() {
  return (
    <div className="flex h-dvh overflow-y-auto">
      <BrandPanel />
      <div className="pt-safe pb-safe flex min-w-0 flex-1 flex-col px-5 md:px-[clamp(24px,5vw,64px)]">
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col md:max-w-none">
          <Link
            href="/"
            className="-ml-2.5 flex h-11 items-center gap-0.5 self-start pr-2.5 text-[0.9375rem] max-md:mt-2 md:mt-10 md:ml-0 md:h-10 md:gap-1 md:self-end md:pr-0 md:text-sm md:text-muted md:hover:text-fg"
          >
            <ChevronLeft className="size-[22px] md:hidden" strokeWidth={1.75} aria-hidden />
            Back to the app
            <ChevronRight className="size-[18px] max-md:hidden" strokeWidth={1.75} aria-hidden />
          </Link>
          <main className="flex-1 pt-7 pb-10 md:mx-auto md:flex md:w-full md:max-w-[400px] md:flex-col md:justify-center md:py-8">
            <AccountView />
          </main>
          <footer className="pb-8 md:hidden">
            <Link href="/privacy" className="inline-flex min-h-11 items-center text-[0.8125rem] text-muted hover:text-fg">
              Privacy policy
            </Link>
          </footer>
        </div>
      </div>
      <JsonLd
        nodes={[
          organization(),
          { "@type": "WebPage", name: "Account", url: absoluteUrl("/account"), isPartOf: { "@id": `${SITE_URL}/#website` } },
        ]}
      />
    </div>
  );
}

/** The left half on wide screens: the mark, the line and what an account adds. */
function BrandPanel() {
  return (
    <section
      aria-label="Focuship"
      className="sticky top-0 isolate hidden min-h-dvh flex-1 basis-[480px] flex-col justify-between gap-12 overflow-hidden border-r border-[#1a1a1a] px-[clamp(24px,5vw,64px)] py-10 md:flex"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_30%_70%,rgba(234,88,12,0.2)_0%,rgba(154,52,18,0.08)_45%,transparent_75%)]"
      />
      <Link href="/" aria-label="Focuship home" className="self-start">
        <Logo size={26} className="gap-2.5 text-[1.1875rem]" />
      </Link>
      <div className="flex max-w-[460px] flex-col gap-[22px]">
        <p className="text-[3.25rem] leading-[1.02] font-semibold tracking-[-0.05em]">
          One thing
          <br />
          at a time.
        </p>
        <ul className="grid grid-cols-2 gap-2">
          {["Favorites", "Your own presets", "Share links", "Settings sync"].map((perk) => (
            <li key={perk} className="flex h-11 items-center rounded-[12px] border border-[#2a221c] bg-[rgba(24,22,20,0.8)] px-3.5 text-[0.84rem]">
              {perk}
            </li>
          ))}
        </ul>
      </div>
      <span className="text-[0.78rem] text-faint">Everything else works without an account.</span>
    </section>
  );
}
