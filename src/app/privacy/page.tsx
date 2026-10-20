import Link from "next/link";
import { GuideLayout } from "@/components/GuideLayout";
import { JsonLd, organization } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { REPO_URL, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

const UPDATED = "21 October 2026";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "What Focuship stores, where it lives and how to delete it: no tracking cookies, no ads, and an optional account you can remove at any time.",
  path: "/privacy",
  noindex: true,
});

/** The privacy policy: plain language, matching what the code actually does. */
export default function PrivacyPage() {
  return (
    <GuideLayout>
      <article className="flex max-w-2xl flex-col gap-8 text-[0.9375rem] leading-relaxed text-muted">
        <header>
          <p className="label-mono text-faint">Updated {UPDATED}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">Privacy policy</h1>
          <p className="mt-3">
            {SITE_NAME} is an ambient sound mixer and focus timer. It works fully without an account, sets no tracking
            cookies and shows no ads. This page explains the little it does store.
          </p>
        </header>

        <Section title="Without an account">
          <p>
            Your current mix, volume, timer settings and recently used presets are saved in your browser&rsquo;s local
            storage, and sounds you have played are cached on your device so they work offline. None of this is sent to
            us. Clearing your browser&rsquo;s site data removes it.
          </p>
        </Section>

        <Section title="With an account (optional)">
          <p>When you sign in with Google or GitHub, we receive and store:</p>
          <ul className="list-disc pl-5">
            <li>your name, email address and profile picture from that provider;</li>
            <li>the presets you save, the presets you mark as favorites, and whether you share a preset by link;</li>
            <li>your timer settings and master volume, so they sync across your devices.</li>
          </ul>
          <p>
            We use this only to run those features. We don&rsquo;t sell it, share it for advertising, or post anything
            on your behalf. A preset is visible to others only if you turn on sharing for it, and only to people who
            have its link.
          </p>
        </Section>

        <Section title="Who processes it">
          <ul className="list-disc pl-5">
            <li>
              <strong className="text-fg">Supabase</strong> hosts sign-in and the account database.
            </li>
            <li>
              <strong className="text-fg">Google</strong> and <strong className="text-fg">GitHub</strong> handle the
              sign-in itself under their own privacy policies.
            </li>
            <li>
              <strong className="text-fg">Cloudflare</strong> serves the site and may provide cookie-free, aggregate
              visit statistics.
            </li>
          </ul>
        </Section>

        <Section title="Deleting your data">
          <p>
            Sign in and open <Link href="/account" className="text-fg underline underline-offset-4">your account</Link>,
            then choose <em>Delete account</em>. Your account, presets, favorites and synced settings are removed
            permanently and immediately. You can also revoke {SITE_NAME}&rsquo;s access from your Google or GitHub
            account settings at any time.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions or requests:{" "}
            <a href={`${REPO_URL}/issues`} className="text-fg underline underline-offset-4">
              open an issue on GitHub
            </a>
            . If this policy changes, the date at the top changes with it.
          </p>
        </Section>
      </article>
      <JsonLd
        nodes={[
          organization(),
          { "@type": "WebPage", name: "Privacy policy", url: absoluteUrl("/privacy"), isPartOf: { "@id": `${SITE_URL}/#website` } },
        ]}
      />
    </GuideLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}
