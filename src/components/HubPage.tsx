import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FocusApp } from "./FocusApp";
import { JsonLd } from "./JsonLd";
import { FaqList, Sections, breadcrumbs, faqPage } from "./Landing";
import { PageCopy } from "./PageCopy";
import { HUBS, isIndexable, pagePath, pagesInHub, type HubId } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const hub = (id: HubId) => HUBS.find((h) => h.id === id)!;

export const hubMetadata = (id: HubId) => {
  const { title, description, path } = hub(id);
  return pageMetadata({ title, description, path, noindex: !pagesInHub(id).some(isIndexable) });
};

/**
 * A hub: the app screen, with the hub's copy, page list and FAQ folded into a closed
 * disclosure so the screen stays clean. The content remains server-rendered in the HTML
 * (search engines index <details> content), so the hub keeps its SEO weight.
 */
export function HubPage({ id }: { id: HubId }) {
  const { title, heading, intro, path, label, copy, faq, intent } = hub(id);
  const pages = pagesInHub(id).filter(isIndexable);
  return (
    <FocusApp heading={heading ?? title} intro={intro} intent={intent}>
      <PageCopy>
        <details className="group">
          <summary className="label-mono flex cursor-pointer list-none items-center gap-2 py-2 select-none hover:text-fg [&::-webkit-details-marker]:hidden">
            <ChevronRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden />
            All {label.toLowerCase()}, notes &amp; FAQ
          </summary>
          <div className="pt-4">
            {copy && <Sections sections={copy} />}
            <h2>All {label.toLowerCase()}</h2>
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
            {faq && <FaqList faq={faq} />}
          </div>
        </details>
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
          ...(faq ? [faqPage(faq)] : []),
        ]}
      />
    </FocusApp>
  );
}
