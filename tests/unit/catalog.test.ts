// Rules the app relies on but the type system can't enforce: the catalogue and the page registry.
import { describe, expect, it } from "vitest";
import { PRESETS, SOUNDS, SOUND_BY_ID } from "@/lib/catalog";
import { PAGES, RELEASED_WAVE, isIndexable, pagePath } from "@/lib/pages";

describe("catalog", () => {
  it("has unique sound ids that are safe to put in a share link unencoded", () => {
    expect(new Set(SOUNDS.map((s) => s.id)).size).toBe(SOUNDS.length);
    for (const sound of SOUNDS) expect(sound.id).toMatch(/^[a-z0-9-]+$/);
  });

  it("builds every preset from real sounds at volumes between 0 and 1", () => {
    for (const preset of PRESETS) {
      for (const [id, volume] of Object.entries(preset.layers)) {
        expect(SOUND_BY_ID.has(id), `${preset.id} uses ${id}`).toBe(true);
        expect(volume).toBeGreaterThan(0);
        expect(volume).toBeLessThanOrEqual(1);
      }
    }
  });

  it("points each preset's share page at a page that loads exactly that preset", () => {
    for (const preset of PRESETS.filter((p) => p.page)) {
      const page = PAGES.find((p) => pagePath(p) === preset.page);
      expect(page?.intent.layers, preset.id).toEqual(preset.layers);
    }
  });
});

describe("page registry", () => {
  it("never indexes a page from an unreleased wave", () => {
    for (const page of PAGES.filter((p) => p.wave > RELEASED_WAVE)) expect(isIndexable(page), pagePath(page)).toBe(false);
  });

  it("indexes every released hero page", () => {
    for (const page of PAGES.filter((p) => p.hero && p.wave <= RELEASED_WAVE)) {
      expect(isIndexable(page), pagePath(page)).toBe(true);
    }
  });
});
