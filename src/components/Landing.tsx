import { Plus } from "lucide-react";
import Link from "next/link";
import { FocusApp } from "./FocusApp";
import { JsonLd, webApplication } from "./JsonLd";
import { PageCopy } from "./PageCopy";
import { Rich } from "./Rich";
import { GUIDES, guidePath } from "@/lib/guides";
import { HUBS, PAGES, hubOf, pagePath, type Block, type Faq, type Hub, type LandingPage, type Section } from "@/lib/pages";
import { absoluteUrl } from "@/lib/site";

/** Label for an internal link target: a landing page's heading, or a hub's name. */
function linkLabel(path: string) {
  const page = PAGES.find((p) => pagePath(p) === path);
  if (page) return page.heading;
  const guide = GUIDES.find((g) => guidePath(g) === path);
  if (guide) return `Guide: ${guide.heading}`;
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
      <div className="mb-4 border-b border-line">
        {faq.map(({ q, a }) => (
          <details key={q} className="faq border-t border-line">
            <summary className="flex min-h-14 items-center justify-between gap-3 py-3 text-[0.9375rem] text-fg">
              {q}
              <Plus className="faq-chev size-4 shrink-0 text-muted transition-[rotate] duration-200" strokeWidth={1.75} aria-hidden />
            </summary>
            <p className="text-sm leading-[1.55] text-muted">
              <Rich text={a} />
            </p>
          </details>
        ))}
      </div>
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

const sideLink =
  "lg:min-h-11 lg:rounded-none lg:border-0 lg:border-t lg:border-line lg:bg-transparent lg:px-0 lg:text-sm lg:hover:!text-soft";

/** Related pages as cards; `side` turns them into a plain list in a side column on wide screens. */
export function RelatedLinks({ paths, side }: { paths: string[]; side?: boolean }) {
  return (
    <>
      <h2>Keep exploring</h2>
      <nav aria-label="Related" className={`grid grid-cols-2 gap-2 ${side ? "lg:flex lg:flex-col lg:gap-0 lg:border-b lg:border-line" : ""}`}>
        {paths.map((path) => (
          <Link
            key={path}
            href={path}
            className={`flex min-h-[52px] items-center rounded-[14px] border border-[#222] bg-raised px-3.5 py-2.5 text-[0.84rem] leading-[1.3] !text-fg !no-underline transition-colors hover:border-edge ${side ? sideLink : ""}`}
          >
            {linkLabel(path)}
          </Link>
        ))}
      </nav>
    </>
  );
}

/** A programmatic landing page: the real app with the page's intent, then its copy. */
export function Landing({ page }: { page: LandingPage }) {
  const hub: Hub = hubOf(page);
  const path = pagePath(page);
  return (
    <FocusApp heading={page.heading} intro={page.intro} intent={page.intent}>
      <PageCopy
        lead={
          <nav aria-label="Breadcrumb" className="mb-6 flex gap-1.5 text-[0.78rem] text-faint lg:mb-8 lg:text-[0.8125rem]">
            <Link href="/" className="!text-muted !no-underline hover:!text-fg">
              Focuship
            </Link>
            <span aria-hidden>/</span>
            <Link href={hub.path} className="!text-muted !no-underline hover:!text-fg">
              {hub.label}
            </Link>
          </nav>
        }
        aside={<RelatedLinks paths={page.related} side />}
      >
        <Sections sections={page.copy} />
        <FaqList faq={page.faq} />
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
