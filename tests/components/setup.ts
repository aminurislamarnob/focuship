import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Components drive the store, which drives the audio engine; jsdom has no Web Audio.
vi.mock("@/lib/audio/engine", () => ({
  perceived: (v: number) => v * v,
  AudioEngine: class {
    sync() {}
    chime() {}
  },
}));

afterEach(() => cleanup());

// jsdom lacks these browser APIs that the shell and sheets call.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
