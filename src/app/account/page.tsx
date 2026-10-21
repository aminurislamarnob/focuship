import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AccountView } from "@/components/AccountView";
import { JsonLd, organization } from "@/components/JsonLd";
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
    <div className="flex h-dvh flex-col overflow-y-auto">
      <div className="pt-safe pb-safe mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5">
        <Link href="/" className="-ml-2.5 flex h-11 items-center gap-0.5 self-start pr-2.5 text-[0.9375rem] max-md:mt-2 md:mt-8">
          <ChevronLeft className="size-[22px]" strokeWidth={1.75} aria-hidden />
          Back to the app
        </Link>
        <main className="flex-1 pt-7 pb-10">
          <AccountView />
        </main>
        <footer className="pb-8">
          <Link href="/privacy" className="inline-flex min-h-11 items-center text-[0.8125rem] text-muted hover:text-fg">
            Privacy policy
          </Link>
        </footer>
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
