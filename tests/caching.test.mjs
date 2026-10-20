import assert from "node:assert/strict";
import { test } from "node:test";
import { read } from "./site.mjs";

// /sounds/<slug> landing pages share a prefix with /sounds/<category>/<id>.mp3 audio.
test("only audio files under /sounds get the immutable cache rule", () => {
  const rules = read("_headers").split("\n").filter((line) => line.startsWith("/sounds"));
  assert.deepEqual(rules, ["/sounds/:category/:file"]);
});

