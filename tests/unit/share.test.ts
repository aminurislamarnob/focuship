// @vitest-environment jsdom
// Share links and mix names: what a visitor copies, pastes and reads.
import { describe, expect, it, vi } from "vitest";
import { PRESETS } from "@/lib/catalog";
import { loadStore } from "./load-store";

vi.mock("@/lib/audio/engine", () => ({
  perceived: (v: number) => v * v,
  AudioEngine: class {
    sync() {}
    chime() {}
  },
}));
vi.mock("@/lib/focuship-api", () => ({ CLOUD_ENABLED: false, getCloud: () => null }));

const rainyDesk = PRESETS.find((p) => p.id === "rainy-desk")!;

describe("encodeMix / decodeMix", () => {
  it("writes whole percentages and reads them back", async () => {
    const { encodeMix, decodeMix } = await loadStore();
    const encoded = encodeMix({ "rain-on-window": 0.6, keyboard: 0.254 });
    expect(encoded).toBe("rain-on-window:60,keyboard:25");
    expect(decodeMix(encoded)).toEqual({ "rain-on-window": 0.6, keyboard: 0.25 });
  });

  it("skips unknown sounds, clamps volumes and defaults a missing one", async () => {
    const { decodeMix, NEW_LAYER_VOLUME } = await loadStore();
    expect(decodeMix("nope:40,keyboard:250,campfire")).toEqual({ keyboard: 1, campfire: NEW_LAYER_VOLUME });
  });
});

describe("shareUrl", () => {
  it("shares an untouched preset as its own page", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.applyPreset(rainyDesk.layers, rainyDesk.id);
    expect(store.shareUrl()).toBe(`${location.origin}/mix/rainy-desk`);
  });

  it("spells out a changed preset as a readable, unencoded ?mix=", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.applyPreset(rainyDesk.layers, rainyDesk.id);
    store.actions.setLayerVolume("keyboard", 0.4);
    const url = store.shareUrl();
    expect(url).toBe(`${location.origin}/?mix=rain-on-window:60,keyboard:40,pink-noise:20`);
    expect(url).not.toMatch(/%[0-9A-F]{2}/i);
  });

  it("opens to the same mix it was copied from", async () => {
    const first = await loadStore("/", { layers: {} });
    first.actions.hydrate();
    first.actions.applyPreset({ campfire: 0.35, crickets: 0.7 });
    const link = new URL(first.shareUrl());

    const second = await loadStore(link.pathname + link.search, { layers: {} });
    second.actions.hydrate();
    expect(second.read((s) => s.layers)).toEqual({ campfire: 0.35, crickets: 0.7 });
  });
});

describe("mixName", () => {
  it("names a preset by its label, and a custom mix by its sounds", async () => {
    const { mixName } = await loadStore();
    expect(mixName(rainyDesk.layers)).toBe("Rainy desk");
    expect(mixName({ campfire: 0.5 })).toBe("Campfire");
    expect(mixName({ campfire: 0.5, crickets: 0.5 })).toBe("Campfire + Crickets");
    expect(mixName({ campfire: 0.5, crickets: 0.5, owl: 0.5, river: 0.5 })).toBe("Campfire + Crickets +2");
  });
});
