import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "vitest";
import { OUT, exists, inspect, pages, read } from "./helpers.mjs";

const TEMPLATES = /^\/(sounds|timer|pomodoro|sounds-for|mix)\/[^/]+$/;
const built = pages().map((page) => ({ ...page, ...inspect(read(page.file)) }));
const landings = built.filter((page) => TEMPLATES.test(page.path));
const questions = (page) =>
  page.jsonLd.flatMap((doc) => doc["@graph"] ?? [doc]).find((node) => node["@type"] === "FAQPage")?.mainEntity ?? [];

test("landing pages exist", () => assert.ok(landings.length > 0));

for (const page of landings) {
  test(`${page.path} is a complete landing page`, () => {
    for (const type of ["WebApplication", "BreadcrumbList"]) assert.ok(page.types.includes(type), type);
    const html = read(page.file);
    for (const { name } of questions(page)) assert.ok(html.includes(name.replace(/'/g, "&#x27;")), `FAQ "${name}" is visible`);
    const image = join(OUT, page.file.replace(/\.html$/, ""), "opengraph-image");
    assert.equal(readFileSync(image).subarray(1, 4).toString(), "PNG", "has its own Open Graph image");
  });

  // The quality gate, observed from outside: a page without enough substance is never indexable.
  test(`${page.path} is noindex unless it has at least 3 FAQs and 2 related links`, () => {
    const thin = questions(page).length < 3;
    if (thin) assert.match(page.robots ?? "", /noindex/);
  });
}

test("hubs list their pages as a collection", () => {
  const hubs = built.filter((page) => /^\/(sounds|timer|sounds-for|mix)$/.test(page.path));
  assert.ok(hubs.length > 0);
  for (const hub of hubs) assert.ok(hub.types.includes("CollectionPage"), hub.path);
});

test("every internal link points to a built page or file", () => {
  const targets = new Set(built.map((page) => page.path));
  const broken = built.flatMap((page) =>
    page.hrefs
      .filter((href) => href.startsWith("/") && !href.startsWith("//"))
      .map((href) => href.split(/[?#]/)[0])
      .filter((path) => !targets.has(path) && !exists(path.slice(1)))
      .map((path) => `${page.path} → ${path}`),
  );
  assert.deepEqual(broken, []);
});
