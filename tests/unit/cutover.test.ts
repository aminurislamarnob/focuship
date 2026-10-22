// @vitest-environment jsdom
// The move from the old accounts backend to the Focuship API (ADR 0001). Accounts
// start fresh: a listener signs in again, and the browser quietly forgets whoever
// it had cached. Guest state — the mix, volume, timer, recents — is untouched.
import { describe, expect, it, vi } from "vitest";
import { loadStore } from "./load-store";

vi.mock("@/lib/audio/engine", () => ({
  perceived: (v: number) => v * v,
  AudioEngine: class {
    sync() {}
    chime() {}
  },
}));
vi.mock("@/lib/focuship-api", () => ({ CLOUD_ENABLED: false, getCloud: () => null }));

/** What the app wrote to localStorage while it was still on the old backend. */
const beforeCutover = {
  layers: { "rain-on-window": 0.6 },
  volume: 0.5,
  timer: { settings: { focus: 50, short: 5, long: 15, longEvery: 4, autoStart: false, notify: false } },
  recents: ["deep-work"],
  settingsUpdatedAt: 1234,
  account: {
    user: { id: "9f8e7d6c-1111-2222-3333-444455556666", email: "ada@example.com", name: "Ada", avatarUrl: null },
    favorites: ["deep-work", "coastline"],
    presets: [{ id: "abc", label: "Old preset", layers: { cafe: 0.5 }, isPublic: false }],
  },
};

describe("the first load after the cutover", () => {
  it("forgets the account the old backend had cached", async () => {
    const store = await loadStore("/", beforeCutover);
    store.actions.hydrate();

    expect(store.read((s) => s.account.user)).toBeNull();
    expect(store.read((s) => s.account.favorites)).toEqual([]);
    expect(store.read((s) => s.account.presets)).toEqual([]);
  });

  it("leaves the listener's mix, volume, timer and recents alone", async () => {
    const store = await loadStore("/", beforeCutover);
    store.actions.hydrate();

    expect(store.read((s) => s.layers)).toEqual({ "rain-on-window": 0.6 });
    expect(store.read((s) => s.volume)).toBe(0.5);
    expect(store.read((s) => s.timer.settings.focus)).toBe(50);
    expect(store.read((s) => s.recents)).toEqual(["deep-work"]);
  });

  it("says nothing about it: there is nothing the listener has to do", async () => {
    const store = await loadStore("/", beforeCutover);
    store.actions.hydrate();

    expect(store.read((s) => s.notice)).toBeNull();
  });

  it("writes the cache back stamped by this backend, so it is trusted next time", async () => {
    const store = await loadStore("/", beforeCutover);
    store.actions.hydrate();

    expect(store.saved().accountBackend).toBe("focuship");
  });
});

describe("afterwards", () => {
  it("trusts a cached account this backend wrote, so favorites show offline", async () => {
    const store = await loadStore("/", {
      ...beforeCutover,
      accountBackend: "focuship",
      account: { ...beforeCutover.account, user: { ...beforeCutover.account.user, id: "7" } },
    });
    store.actions.hydrate();

    expect(store.read((s) => s.account.user?.email)).toBe("ada@example.com");
    expect(store.read((s) => s.account.favorites)).toEqual(["deep-work", "coastline"]);
    expect(store.read((s) => s.account.presets)).toHaveLength(1);
  });
});
