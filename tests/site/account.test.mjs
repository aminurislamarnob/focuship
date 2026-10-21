// The account page, observed from the outside: it must be built (the static
// export has no server to render it later), stay out of search surfaces, and
// never leak into the sitemap or llms.txt.
import assert from "node:assert/strict";
import { test } from "vitest";
import { inspect, read } from "./helpers.mjs";

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

// The OAuth consent screens link here, so it must be built and reachable from the account page.
test("the privacy policy is built and linked from the account page", () => {
  const privacy = inspect(read("privacy.html"));
  assert.match(privacy.title, /^Privacy policy/);
  assert.equal(privacy.canonical, "https://focuship.app/privacy");
  assert.ok(page.hrefs.includes("/privacy"), "linked from /account");
});
