import Link from "next/link";
import { GuideLayout } from "@/components/GuideLayout";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs } from "@/components/Landing";
import { GUIDES, GUIDES_HUB, guidePath, isGuideIndexable } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const { title, description, path, intro, label } = GUIDES_HUB;

export const metadata = pageMetadata({ title, description, path, noindex: !GUIDES.some(isGuideIndexable) });

export default function Page() {
  return (
    <GuideLayout>
      <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      <p className="mt-3 text-muted">{intro}</p>
      <ul className="mt-10 flex flex-col gap-6">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link href={guidePath(guide)} className="text-lg font-medium hover:text-brand-light">
              {guide.heading}
            </Link>
            <p className="mt-1 text-sm text-muted">{guide.description}</p>
          </li>
        ))}
      </ul>
      <JsonLd
        nodes={[
          {
            "@type": "CollectionPage",
            name: title,
            url: absoluteUrl(path),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: GUIDES.map((guide, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(guidePath(guide)),
                name: guide.heading,
              })),
            },
          },
          breadcrumbs([{ name: label, path }]),
        ]}
      />
    </GuideLayout>
  );
}
