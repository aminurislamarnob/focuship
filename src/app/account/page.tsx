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
    <div className="flex h-dvh flex-col overflow-y-auto">
      <header className="pt-safe shrink-0 border-b border-line">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4">
          <Link href="/" aria-label="Focuship home">
            <Logo />
          </Link>
          <Link href="/" className="label-mono hover:text-fg">
            Back to the app
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
        <AccountView />
      </main>
      <footer className="border-t border-line">
        <div className="label-mono mx-auto flex w-full max-w-lg gap-5 px-4 py-5">
          <Link href="/privacy" className="hover:text-fg">
            Privacy policy
          </Link>
        </div>
      </footer>
      <JsonLd
        nodes={[
          organization(),
          { "@type": "WebPage", name: "Account", url: absoluteUrl("/account"), isPartOf: { "@id": `${SITE_URL}/#website` } },
        ]}
      />
    </div>
  );
}
