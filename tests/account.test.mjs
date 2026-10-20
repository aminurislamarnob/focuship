// The account page, observed from the outside: it must be built (the static
// export has no server to render it later), stay out of search surfaces, and
// never leak into the sitemap or llms.txt.
import assert from "node:assert/strict";
import { test } from "node:test";
import { inspect, read } from "./site.mjs";

const page = inspect(read("account.html"));

test("the account page is built and canonical", () => {
  assert.match(page.title, /^Account/);
  assert.equal(page.canonical, "https://focuship.app/account");
  assert.ok(page.h1.length > 0, "has an H1");
});

test("the account page is noindex", () => {
  assert.match(page.robots ?? "", /noindex/);
});

test("the account page stays out of the sitemap and llms.txt", () => {
  assert.ok(!read("sitemap.xml").includes("/account"), "sitemap");
  assert.ok(!/\/account\b/.test(read("llms.txt")), "llms.txt");
});
