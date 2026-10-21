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

/** A hub: the app screen, then the hub's page list, copy and FAQ. */
export function HubPage({ id }: { id: HubId }) {
  const { title, heading, intro, path, label, copy, faq, intent } = hub(id);
  const pages = pagesInHub(id).filter(isIndexable);
  return (
    <FocusApp heading={heading ?? title} intro={intro} intent={intent}>
      <PageCopy>
        <h2>All {label.toLowerCase()}</h2>
        <nav aria-label={`All ${label.toLowerCase()}`} className="mb-4 border-b border-line">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={pagePath(page)}
              className="flex min-h-16 items-center gap-3 border-t border-line py-3 !no-underline"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[0.9375rem] font-[550] text-fg">{page.heading}</span>
                <span className="line-clamp-2 text-[0.78rem] leading-normal text-faint">{page.description}</span>
              </span>
              <ChevronRight className="size-[18px] shrink-0 text-faint" strokeWidth={1.75} aria-hidden />
            </Link>
          ))}
        </nav>
        {copy && <Sections sections={copy} />}
        {faq && <FaqList faq={faq} />}
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
