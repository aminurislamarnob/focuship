import assert from "node:assert/strict";
import { test } from "vitest";
import { inspect, pages, read } from "./helpers.mjs";

const guides = pages()
  .filter((page) => /^\/guides\/[^/]+$/.test(page.path))
  .map((page) => ({ ...page, html: read(page.file), ...inspect(read(page.file)) }));

test("guides exist", () => assert.ok(guides.length > 0));

for (const guide of guides) {
  test(`${guide.path} is a credible, sourced article`, () => {
    const article = guide.jsonLd.flatMap((doc) => doc["@graph"] ?? [doc]).find((node) => node["@type"] === "Article");
    assert.ok(article, "Article JSON-LD");
    assert.ok(article.author?.name && article.datePublished && article.dateModified, "author and dates");
    assert.ok(article.citation?.length > 0, "cites sources");
    assert.ok(guide.types.includes("BreadcrumbList"), "breadcrumbs");
    assert.match(guide.html, /rel="author"/, "visible byline");
    assert.match(guide.html, /<h2>Sources<\/h2>/, "sources section");
    for (const url of article.citation) assert.ok(guide.hrefs.includes(url), `source ${url} is linked`);
  });
}

test("the guides hub links to every guide", () => {
  const hub = inspect(read("guides.html"));
  for (const guide of guides) assert.ok(hub.hrefs.includes(guide.path), guide.path);
});
