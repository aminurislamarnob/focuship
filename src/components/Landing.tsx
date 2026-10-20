import Link from "next/link";
import { FocusApp } from "./FocusApp";
import { JsonLd, webApplication } from "./JsonLd";
import { PageCopy } from "./PageCopy";
import { Rich } from "./Rich";
import { HUBS, PAGES, hubOf, pagePath, type Block, type Faq, type Hub, type LandingPage, type Section } from "@/lib/pages";
import { absoluteUrl } from "@/lib/site";

/** Label for an internal link target: a landing page's heading, or a hub's name. */
function linkLabel(path: string) {
  const page = PAGES.find((p) => pagePath(p) === path);
  if (page) return page.heading;
  return HUBS.find((hub) => hub.path === path)?.title ?? path;
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) =>
    typeof block === "string" ? (
      <p key={i}>
        <Rich text={block} />
      </p>
    ) : (
      <ul key={i}>
        {block.list.map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
    ),
  );
}

export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Focuship", path: "/" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

export const faqPage = (faq: Faq[]) => ({
  "@type": "FAQPage",
  mainEntity: faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "") },
  })),
});

export function FaqList({ faq }: { faq: Faq[] }) {
  return (
    <>
      <h2>Questions</h2>
      <dl>
        {faq.map(({ q, a }) => (
          <div key={q} className="mb-4">
            <dt className="font-medium text-fg">{q}</dt>
            <dd className="mt-1">
              <Rich text={a} />
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function Sections({ sections }: { sections: Section[] }) {
  return sections.map((section) => (
    <section key={section.heading}>
      <h2>{section.heading}</h2>
      <Blocks blocks={section.body} />
    </section>
  ));
}

export function RelatedLinks({ paths }: { paths: string[] }) {
  return (
    <>
      <h2>Related</h2>
      <ul>
        {paths.map((path) => (
          <li key={path}>
            <Link href={path}>{linkLabel(path)}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/** A programmatic landing page: the real app with the page's intent, then its copy. */
export function Landing({ page }: { page: LandingPage }) {
  const hub: Hub = hubOf(page);
  const path = pagePath(page);
  return (
    <FocusApp heading={page.heading} intro={page.intro} intent={page.intent}>
      <PageCopy>
        <nav aria-label="Breadcrumb" className="label-mono mb-6 flex gap-2">
          <Link href="/" className="!no-underline hover:!text-fg">
            Focuship
          </Link>
          <span aria-hidden>/</span>
          <Link href={hub.path} className="!no-underline hover:!text-fg">
            {hub.label}
          </Link>
        </nav>
        <Sections sections={page.copy} />
        <FaqList faq={page.faq} />
        <RelatedLinks paths={page.related} />
      </PageCopy>
      <JsonLd
        nodes={[
          webApplication({ name: `${page.heading} · Focuship`, description: page.description, path }),
          faqPage(page.faq),
          breadcrumbs([
            { name: hub.label, path: hub.path },
            { name: page.heading, path },
          ]),
        ]}
      />
    </FocusApp>
  );
}
