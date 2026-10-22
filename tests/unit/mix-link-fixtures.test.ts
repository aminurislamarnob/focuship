// @vitest-environment jsdom
// The share-link format is shared with the Laravel API (ADR 0002): both sides must
// reproduce tests/fixtures/mix-links.json exactly, or links from the MCP open the wrong mix.
import { describe, expect, it, vi } from "vitest";
import fixtures from "../fixtures/mix-links.json";
import { loadStore } from "./load-store";

vi.mock("@/lib/audio/engine", () => ({
  perceived: (v: number) => v * v,
  AudioEngine: class {
    sync() {}
    chime() {}
  },
}));
vi.mock("@/lib/supabase", () => ({ CLOUD_ENABLED: false, getCloud: () => null }));

describe("the shared share-link fixtures", () => {
  it.each(fixtures.encode)("encodes $name", async ({ layers, query }) => {
    const { encodeMix } = await loadStore();
    expect(encodeMix(layers)).toBe(query);
  });

  it.each(fixtures.decode)("decodes $name", async ({ query, decoded }) => {
    const { decodeMix } = await loadStore();
    expect(decodeMix(query)).toEqual(decoded);
  });
});
