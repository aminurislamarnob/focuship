// Exports the catalogue and guides for the Laravel API (ADR 0002: the TypeScript
// catalogue stays the single source of truth; the API reads a generated copy).
//
//   node scripts/export-catalog.mjs          write api/resources/catalog.json
//   node scripts/export-catalog.mjs --check  fail if the committed copy is stale (CI)
import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "api/resources/catalog.json");

/** Bundles the TypeScript sources (path aliases and all) and evaluates them in this process. */
async function loadSources() {
  const result = await build({
    stdin: {
      contents: `export * from "@/lib/catalog";\nexport { GUIDES } from "@/lib/guides";\n`,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    alias: { "@": resolve(root, "src") },
  });
  const code = result.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

/** The sound's kind as the MCP exposes it: a recording, or one of the generated sources. */
const kindOf = (sound) => sound.source.type;

function toJson({ CATEGORIES, SOUNDS, PRESETS, GUIDES }) {
  return {
    categories: CATEGORIES.map(({ id, label }) => ({ id, label })),
    sounds: SOUNDS.map((sound) => ({
      id: sound.id,
      label: sound.label,
      category: sound.category,
      kind: kindOf(sound),
      ...(sound.note ? { note: sound.note } : {}),
      ...(sound.source.type === "file" ? { path: sound.source.path } : {}),
      ...(sound.source.type === "noise" ? { color: sound.source.color } : {}),
      ...(sound.source.type === "binaural"
        ? { carrier: sound.source.carrier, beat: sound.source.beat }
        : {}),
    })),
    presets: PRESETS.map((preset) => ({
      id: preset.id,
      label: preset.label,
      blurb: preset.blurb,
      layers: preset.layers,
      ...(preset.page ? { page: preset.page } : {}),
    })),
    guides: GUIDES.map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      description: guide.description,
      standfirst: guide.standfirst,
      reviewed: guide.reviewed,
      sections: guide.sections,
      faq: guide.faq,
      sources: guide.sources,
    })),
  };
}

const sources = await loadSources();
const json = `${JSON.stringify(toJson(sources), null, 2)}\n`;

if (process.argv.includes("--check")) {
  const existing = await readFile(OUT, "utf8").catch(() => null);
  if (existing !== json) {
    console.error(
      `${OUT} is out of date. Run "npm run export:catalog" and commit the result.`,
    );
    process.exit(1);
  }
  console.log("api/resources/catalog.json is up to date.");
} else {
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, json);
  console.log(
    `Wrote ${OUT}: ${sources.SOUNDS.length} sounds, ${sources.PRESETS.length} presets, ${sources.GUIDES.length} guides.`,
  );
}
