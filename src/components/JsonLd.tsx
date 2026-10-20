import { AUTHOR, REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

type Node = Record<string, unknown>;

/** Renders schema.org nodes as one JSON-LD graph. `<` is escaped so content can't close the script tag. */
export function JsonLd({ nodes }: { nodes: Node[] }) {
  const graph = { "@context": "https://schema.org", "@graph": nodes };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
  );
}

export const organization = (): Node => ({
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/icons/icon-512.png"),
  sameAs: [REPO_URL],
});

export const website = (): Node => ({
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: absoluteUrl("/"),
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
});

/** The app itself. Landing pages pass their own name, description and URL. */
export const webApplication = ({
  name = SITE_NAME,
  description = SITE_DESCRIPTION,
  path = "/",
}: { name?: string; description?: string; path?: string } = {}): Node => ({
  "@type": "WebApplication",
  name,
  description,
  url: absoluteUrl(path),
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript and Web Audio",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
  publisher: { "@id": `${SITE_URL}/#organization` },
});
