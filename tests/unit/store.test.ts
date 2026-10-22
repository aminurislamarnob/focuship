// @vitest-environment jsdom
// The store's behaviour at its public seam: actions in, state (via useFocus), audio sync calls,
// localStorage and the URL out.
import { afterEach, describe, expect, it, vi } from "vitest";
import { PRESETS } from "@/lib/catalog";
import { loadStore } from "./load-store";

const audio = vi.hoisted(() => ({ sync: vi.fn(), chime: vi.fn() }));
vi.mock("@/lib/audio/engine", () => ({
  perceived: (v: number) => v * v,
  AudioEngine: class {
    sync = audio.sync;
    chime = audio.chime;
  },
}));
vi.mock("@/lib/focuship-api", () => ({ CLOUD_ENABLED: false, getCloud: () => null }));

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  audio.sync.mockClear();
  audio.chime.mockClear();
});

describe("hydrate", () => {
  it("gives a first-time visitor with nothing to load a random preset, not a blank mixer", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const store = await loadStore("/");
    store.actions.hydrate();
    expect(store.read((s) => s.layers)).toEqual(PRESETS[0].layers);
    expect(store.read((s) => s.hydrated)).toBe(true);
  });

  it("restores a returning visitor's mix and volume, dropping sounds that no longer exist", async () => {
    const store = await loadStore("/", { layers: { "brown-noise": 0.4, "retired-sound": 0.5 }, volume: 0.3 });
    store.actions.hydrate();
    expect(store.read((s) => s.layers)).toEqual({ "brown-noise": 0.4 });
    expect(store.read((s) => s.volume)).toBe(0.3);
  });

  it("lets a share link win over saved state, then strips it from the address bar", async () => {
    const store = await loadStore("/?mix=rain-on-window:50,keyboard:25", { layers: { "brown-noise": 0.4 } });
    store.actions.hydrate();
    expect(store.read((s) => s.layers)).toEqual({ "rain-on-window": 0.5, keyboard: 0.25 });
    expect(location.search).toBe("");
  });

  it("still opens old percent-encoded share links", async () => {
    const store = await loadStore("/?mix=rain-on-window%3A50%2Ckeyboard%3A25");
    store.actions.hydrate();
    expect(store.read((s) => s.layers)).toEqual({ "rain-on-window": 0.5, keyboard: 0.25 });
  });

  it("loads a preset from ?preset= (the manifest shortcuts)", async () => {
    const store = await loadStore("/?preset=coastline");
    store.actions.hydrate();
    expect(store.read((s) => s.layers)).toEqual(PRESETS.find((p) => p.id === "coastline")!.layers);
  });

  it("applies a landing page's intent when the URL has nothing, without autoplay", async () => {
    const store = await loadStore("/sounds/brown-noise", { layers: { keyboard: 0.3 } });
    store.actions.hydrate({ layers: { "brown-noise": 0.6 }, tab: "timer" });
    expect(store.read((s) => s.layers)).toEqual({ "brown-noise": 0.6 });
    expect(store.read((s) => s.tab)).toBe("timer");
    expect(store.read((s) => s.playing)).toBe(false);
  });
});

describe("mixing", () => {
  it("adds a sound at the default volume and starts playing; removing the last one stops", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.toggleSound("brown-noise");
    expect(store.read((s) => s.layers)).toEqual({ "brown-noise": store.NEW_LAYER_VOLUME });
    expect(store.read((s) => s.playing)).toBe(true);
    expect(audio.sync).toHaveBeenLastCalledWith({ "brown-noise": store.NEW_LAYER_VOLUME }, true, expect.any(Number));

    store.actions.toggleSound("brown-noise");
    expect(store.read((s) => s.layers)).toEqual({});
    expect(store.read((s) => s.playing)).toBe(false);
  });

  it("ignores unknown sounds", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.toggleSound("not-a-sound");
    expect(store.read((s) => s.layers)).toEqual({});
  });

  it("clamps layer volumes to 0..1", async () => {
    const store = await loadStore("/", { layers: { keyboard: 0.5 } });
    store.actions.hydrate();
    store.actions.setLayerVolume("keyboard", 1.7);
    expect(store.read((s) => s.layers.keyboard)).toBe(1);
    store.actions.setLayerVolume("keyboard", -1);
    expect(store.read((s) => s.layers.keyboard)).toBe(0);
  });

  it("keeps recent presets newest first, without duplicates, at most eight", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    for (const preset of [...PRESETS, PRESETS[0]]) store.actions.applyPreset(preset.layers, preset.id);
    const recents = store.read((s) => s.recents);
    expect(recents[0]).toBe(PRESETS[0].id);
    expect(recents).toHaveLength(8);
    expect(new Set(recents).size).toBe(8);
  });

  it("mutes and restores the previous volume", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.setVolume(0.6);
    store.actions.toggleMute();
    expect(store.read((s) => s.volume)).toBe(0);
    store.actions.toggleMute();
    expect(store.read((s) => s.volume)).toBe(0.6);
  });

  it("saves the mix to localStorage after it loads", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.toggleSound("keyboard");
    expect(store.saved().layers).toEqual({ keyboard: store.NEW_LAYER_VOLUME });
  });
});

describe("timer", () => {
  it("counts down from an absolute end time, so pausing keeps exactly what was left", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-22T09:00:00Z") });
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.startTimer();
    expect(store.read((s) => s.timer.status)).toBe("running");

    vi.setSystemTime(new Date("2026-10-22T09:10:00Z"));
    store.actions.pauseTimer();
    const timer = store.read((s) => s.timer);
    expect(timer.status).toBe("paused");
    expect(timer.remaining).toBe(15 * 60_000);
    expect(store.timerRemaining(timer, Date.now() + 60_000)).toBe(15 * 60_000);
  });

  it("finishes a focus session: chimes, counts it and moves to a short break", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-22T09:00:00Z") });
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.startTimer();
    vi.advanceTimersByTime(25 * 60_000 + 1000);
    const timer = store.read((s) => s.timer);
    expect(audio.chime).toHaveBeenCalledOnce();
    expect(timer).toMatchObject({ mode: "short", rounds: 1, status: "idle", remaining: 5 * 60_000 });
  });

  it("takes a long break after every fourth focus session", async () => {
    const store = await loadStore("/", { layers: {}, timer: { rounds: 4, day: new Date().toISOString().slice(0, 10) } });
    store.actions.hydrate();
    store.actions.skipTimer();
    expect(store.read((s) => s.timer.mode)).toBe("long");
  });

  it("applies new lengths at once while idle", async () => {
    const store = await loadStore("/", { layers: {} });
    store.actions.hydrate();
    store.actions.updateTimerSettings({ focus: 50, short: 10 });
    expect(store.read((s) => s.timer)).toMatchObject({ remaining: 50 * 60_000, settings: { focus: 50, short: 10 } });
  });
});
