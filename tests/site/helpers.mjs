// Helpers for testing the built static site in out/. Tests read what the build
// produced (the files a crawler or visitor receives), never the source modules.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export const OUT = new URL("../../out/", import.meta.url).pathname;

if (!existsSync(join(OUT, "index.html"))) {
  throw new Error("out/ is missing. Run `npm run test:site`, which builds first, or `next build`.");
}

const TEXT = /\.(html|txt|js|json|webmanifest|xml|css|md)$/;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return [path];
  });
}

/** Every text file in the export, as paths relative to out/. */
export const textFiles = () =>
  walk(OUT)
    .filter((path) => TEXT.test(path))
    .map((path) => relative(OUT, path).split(sep).join("/"));

export const read = (file) => readFileSync(join(OUT, file), "utf8");
export const exists = (file) => existsSync(join(OUT, file));

/** Built HTML pages, keyed by URL path ("/", "/sounds/brown-noise"). */
export function pages() {
  return textFiles()
    .filter((file) => file.endsWith(".html") && !/^(404|_not-found)\.html$/.test(file))
    .map((file) => ({ file, path: "/" + file.replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "") }));
}

const decode = (text) =>
  text.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** The small slice of an HTML page that SEO tests care about. */
export function inspect(html) {
  const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? "");
  const metas = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => tag);
  const meta = (key) => {
    const tag = metas.find((t) => attr(t, "name") === key || attr(t, "property") === key);
    return tag ? attr(tag, "content") : undefined;
  };
  const links = [...html.matchAll(/<link\s[^>]*>/g)].map(([tag]) => tag);
  const canonical = links.find((t) => attr(t, "rel") === "canonical");
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([, body]) =>
    JSON.parse(body),
  );
  return {
    title: decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""),
    description: meta("description"),
    robots: meta("robots"),
    meta,
    canonical: canonical ? attr(canonical, "href") : undefined,
    h1: [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].map(([tag]) => tag.replace(/<[^>]+>/g, "").trim()),
    jsonLd,
    /** Every @type in the page's JSON-LD, including nested @graph nodes. */
    types: jsonLd.flatMap((doc) => (doc["@graph"] ?? [doc]).flatMap((node) => [node["@type"]].flat())),
    hrefs: [...html.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map(([, href]) => decode(href)),
  };
}
