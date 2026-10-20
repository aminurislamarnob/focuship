import Link from "next/link";
import { GuideLayout } from "./GuideLayout";
import { JsonLd } from "./JsonLd";
import { FaqList, RelatedLinks, Sections, breadcrumbs, faqPage } from "./Landing";
import { GUIDES_HUB, guidePath, type Guide } from "@/lib/guides";
import { AUTHOR, SITE_URL, absoluteUrl } from "@/lib/site";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** A guide: byline, dates, links to play the sounds it discusses, the article, FAQ and sources. */
export function GuideArticle({ guide }: { guide: Guide }) {
  const path = guidePath(guide);
  return (
    <GuideLayout>
      <nav aria-label="Breadcrumb" className="label-mono mb-6 flex gap-2">
        <Link href="/" className="hover:text-fg">
          Focuship
        </Link>
        <span aria-hidden>/</span>
        <Link href={GUIDES_HUB.path} className="hover:text-fg">
          {GUIDES_HUB.label}
        </Link>
      </nav>
      <article className="page-copy text-[0.9375rem] leading-relaxed text-muted">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-fg sm:text-4xl">{guide.heading}</h1>
        <p className="mt-4 text-lg text-muted">{guide.standfirst}</p>
        <p className="label-mono mt-4">
          By{" "}
          <a href={AUTHOR.url} rel="author" className="!no-underline">
            {AUTHOR.name}
          </a>{" "}
          · <time dateTime={guide.published}>{formatDate(guide.published)}</time>
          {guide.updated !== guide.published && (
            <>
              {" "}
              · Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
            </>
          )}
        </p>
        {guide.notice && (
          <p role="note" className="mt-6 rounded-[6px] border border-line-strong bg-raised p-3 text-sm text-fg">
            {guide.notice}
          </p>
        )}
        <div className="mt-6 mb-10 flex flex-wrap gap-2">
          {guide.listen.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="inline-flex h-9 items-center rounded-[4px] border border-line-strong px-3 font-mono text-xs !text-fg !no-underline hover:border-brand"
            >
              ▶ {item.label}
            </Link>
          ))}
        </div>
        <Sections sections={guide.sections} />
        <FaqList faq={guide.faq} />
        <h2>Sources</h2>
        <ol className="text-sm">
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener">
                {source.title}
              </a>
              . <em>{source.publication}</em>, {source.year}.
            </li>
          ))}
        </ol>
        <RelatedLinks paths={guide.related} />
      </article>
      <JsonLd
        nodes={[
          {
            "@type": "Article",
            headline: guide.heading,
            description: guide.description,
            url: absoluteUrl(path),
            mainEntityOfPage: absoluteUrl(path),
            image: absoluteUrl(`${path}/opengraph-image`),
            datePublished: guide.published,
            dateModified: guide.updated,
            inLanguage: "en",
            author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
            publisher: { "@id": `${SITE_URL}/#organization` },
            citation: guide.sources.map((source) => source.url),
          },
          faqPage(guide.faq),
          breadcrumbs([
            { name: GUIDES_HUB.label, path: GUIDES_HUB.path },
            { name: guide.heading, path },
          ]),
        ]}
      />
    </GuideLayout>
  );
}
