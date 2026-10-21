import assert from "node:assert/strict";
import { test } from "vitest";
import { read, textFiles } from "./helpers.mjs";

test("the old brand name appears nowhere in the built site", () => {
  const offenders = textFiles().filter((file) => /let[\s-]?me[\s-]?focus/i.test(read(file)));
  assert.deepEqual(offenders, []);
});

test("the installed app is called Focuship", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.name, "Focuship");
  assert.equal(manifest.short_name, "Focuship");
});
