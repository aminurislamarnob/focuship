import { FocusApp } from "@/components/FocusApp";
import { JsonLd, organization } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const DESCRIPTION =
  "About Focuship: save every sound for offline use, install the app, keyboard shortcuts, privacy, credits and who makes it.";

export const metadata = pageMetadata({
  title: "About & offline",
  description: DESCRIPTION,
  path: "/about",
});

/** The You tab as a page of its own: account, offline sounds, install, shortcuts, the maker and credits. */
export default function AboutPage() {
  return (
    <FocusApp heading="About & offline" intro={DESCRIPTION} intent={{ tab: "you" }}>
      <JsonLd
        nodes={[
          organization(),
          { "@type": "AboutPage", name: "About & offline", url: absoluteUrl("/about"), isPartOf: { "@id": `${SITE_URL}/#website` } },
        ]}
      />
    </FocusApp>
  );
}
