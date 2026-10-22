// The MCP page as a visitor and a crawler receive it: how to connect an AI
// assistant (ADR 0004), discoverable in the sitemap and llms.txt.
import assert from "node:assert/strict";
import { test } from "vitest";
import { inspect, read } from "./helpers.mjs";

const page = inspect(read("mcp.html"));
// Tags stripped and whitespace collapsed: JSX interpolation leaves gaps mid-sentence.
const text = read("mcp.html").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("the MCP page is built, canonical and indexable", () => {
  assert.match(page.title, /AI assistant/);
  assert.equal(page.canonical, "https://focuship.app/mcp");
  assert.equal(page.h1.length, 1);
  assert.ok(!/noindex/.test(page.robots ?? ""), "indexable");
});

test("it gives the connector URL", () => {
  assert.ok(text.includes("api.focuship.app/mcp"), "connector URL on the page");
});

test("it explains how to connect each of the major clients", () => {
  for (const client of ["Claude", "ChatGPT", "Cursor", "Claude Code"]) {
    assert.ok(text.includes(client), `${client} covered`);
  }
  assert.ok(text.includes("claude mcp add"), "a command to copy");
  assert.ok(text.includes("mcpServers"), "an mcp.json snippet to copy");
});

test("it says an account is needed, and what the assistant cannot do", () => {
  assert.match(text, /free Focuship account is required/i);
  assert.match(text, /cannot play or stop sound/i);
  assert.match(text, /cannot delete your Focuship account/i);
});

test("it is reachable from the app and links on to the privacy policy", () => {
  assert.ok(inspect(read("about.html")).hrefs.includes("/mcp"), "linked from /about");
  assert.ok(page.hrefs.includes("/privacy"), "links to /privacy");
});

test("search engines and assistants can find it", () => {
  assert.ok(read("sitemap.xml").includes("https://focuship.app/mcp"), "in the sitemap");

  const llms = read("llms.txt");
  assert.ok(llms.includes("https://focuship.app/mcp"), "in llms.txt");
  assert.ok(llms.includes("api.focuship.app/mcp"), "connector URL in llms.txt");
});
