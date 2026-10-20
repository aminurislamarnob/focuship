import Link from "next/link";
import { FocusApp } from "./FocusApp";
import { JsonLd } from "./JsonLd";
import { breadcrumbs } from "./Landing";
import { PageCopy } from "./PageCopy";
import { HUBS, isIndexable, pagePath, pagesInHub, type HubId } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const hub = (id: HubId) => HUBS.find((h) => h.id === id)!;

export const hubMetadata = (id: HubId) => {
  const { title, description, path } = hub(id);
  return pageMetadata({ title, description, path, noindex: !pagesInHub(id).some(isIndexable) });
};

/** A hub: the app, then a list of the hub's indexable landing pages. */
export function HubPage({ id }: { id: HubId }) {
  const { title, intro, path, label } = hub(id);
  const pages = pagesInHub(id).filter(isIndexable);
  return (
    <FocusApp heading={title} intro={intro}>
      <PageCopy>
        <h2>{label}</h2>
        <ul className="!list-none !pl-0">
          {pages.map((page) => (
            <li key={page.slug} className="!mb-4">
              <Link href={pagePath(page)} className="font-medium">
                {page.heading}
              </Link>
              <p className="!mb-0 text-sm">{page.description}</p>
            </li>
          ))}
        </ul>
      </PageCopy>
      <JsonLd
        nodes={[
          {
            "@type": "CollectionPage",
            name: title,
            url: absoluteUrl(path),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: pages.map((page, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(pagePath(page)),
                name: page.heading,
              })),
            },
          },
          breadcrumbs([{ name: label, path }]),
        ]}
      />
    </FocusApp>
  );
}
