import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import type { FocusState } from "@/lib/store";

/**
 * A fresh copy of the store (it keeps module-level state), loaded at `url` with `saved` in
 * localStorage, as a visitor's browser would have it. The audio engine and Supabase are stubbed
 * by the calling test file's vi.mock calls.
 */
export async function loadStore(url = "/", saved?: object) {
  vi.resetModules();
  localStorage.clear();
  if (saved) localStorage.setItem("focuship:v1", JSON.stringify(saved));
  history.replaceState(null, "", url);
  const store = await import("@/lib/store");
  /** Reads the store through its public hook, the way components do. */
  const read = <T>(select: (s: FocusState) => T): T => renderHook(() => store.useFocus(select)).result.current;
  const saved$ = () => JSON.parse(localStorage.getItem("focuship:v1") ?? "null");
  return { ...store, read, saved: saved$ };
}
