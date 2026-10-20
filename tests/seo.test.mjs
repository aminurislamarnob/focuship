import assert from "node:assert/strict";
import { test } from "node:test";
import { exists, inspect, pages, read } from "./site.mjs";

const ORIGIN = "https://focuship.app";
const url = (path) => (path === "/" ? `${ORIGIN}/` : `${ORIGIN}${path}`);
const normalize = (href) => href.replace(/^(https:\/\/[^/]+)$/, "$1/");

const built = pages().map((page) => ({ ...page, ...inspect(read(page.file)) }));
const indexable = built.filter((page) => !page.robots?.includes("noindex"));
const sitemapUrls = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
const llms = exists("llms.txt") ? read("llms.txt") : "";
const llmsUrls = [...llms.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(([, href]) => href);

for (const page of built) {
  test(`${page.path} has complete metadata`, () => {
    assert.ok(page.title.length > 10, "title");
    assert.ok(page.description && page.description.length >= 50, "description");
    assert.equal(page.h1.length, 1, "exactly one h1");
    assert.ok(page.h1[0].length > 0, "h1 text");
    assert.equal(normalize(page.canonical ?? ""), url(page.path), "canonical matches path");
    assert.equal(normalize(page.meta("og:url") ?? ""), url(page.path), "og:url matches path");
    assert.ok(page.meta("og:image")?.startsWith(ORIGIN), "og:image");
    assert.ok(page.jsonLd.length > 0, "JSON-LD present and parsable");
  });
}

test("titles and descriptions are unique across pages", () => {
  const dupes = (key) => built.map((p) => p[key]).filter((v, i, all) => all.indexOf(v) !== i);
  assert.deepEqual(dupes("title"), []);
  assert.deepEqual(dupes("description"), []);
});

test("the home page describes the site, organisation and app", () => {
  const home = built.find((p) => p.path === "/");
  for (const type of ["WebSite", "Organization", "WebApplication"]) assert.ok(home.types.includes(type), type);
});

test("the sitemap lists exactly the indexable pages", () => {
  assert.deepEqual([...sitemapUrls].sort(), indexable.map((p) => url(p.path)).sort());
});

test("robots.txt allows every crawler and points to the sitemap", () => {
  const robots = read("robots.txt");
  assert.match(robots, /User-Agent: \*\nAllow: \/\n/);
  assert.doesNotMatch(robots, /Disallow/);
  assert.match(robots, new RegExp(`Sitemap: ${ORIGIN}/sitemap.xml`));
});

test("llms.txt links only to indexable pages and includes the home page", () => {
  assert.ok(llms.startsWith("# Focuship"), "llms.txt exists with a title");
  assert.ok(llmsUrls.map(normalize).includes(`${ORIGIN}/`));
  const known = new Set(indexable.map((p) => url(p.path)));
  assert.deepEqual(llmsUrls.map(normalize).filter((href) => !known.has(href)), []);
});

// The launch plan's hero pages: each must be live in search and listed for language models.
const HEROES = [
  "/sounds/brown-noise",
  "/sounds/white-noise",
  "/sounds/pink-noise",
  "/mix/rain-sounds",
  "/mix/thunderstorm",
  "/sounds/ocean-waves",
  "/sounds/fireplace",
  "/sounds/coffee-shop",
  "/sounds/binaural-beats",
  "/pomodoro/25-5",
  "/timer",
  "/sounds-for/coding",
];

test("every hero page is in the sitemap and llms.txt", () => {
  const missing = HEROES.filter((path) => !sitemapUrls.includes(url(path)) || !llmsUrls.includes(url(path)));
  assert.deepEqual(missing, []);
});
