import { useSyncExternalStore } from "react";

export const SOUND_CACHE = "lmf-sounds-v1";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Registers the service worker and starts listening for the install prompt. */
export function startPwa() {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });

  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .then(() => navigator.serviceWorker.ready)
    .then((reg) => {
      // Assets fetched before the worker took control are not cached yet.
      const urls = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((url) => url.startsWith(location.origin) && !url.includes("/sounds/"));
      reg.active?.postMessage({ type: "warm", urls });
    })
    .catch(() => {});
}

export const isStandalone = () =>
  matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useInstallPrompt() {
  const canPrompt = useSyncExternalStore(
    subscribe,
    () => deferredPrompt !== null,
    () => false,
  );
  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    emit();
    return outcome === "accepted";
  };
  return { canPrompt, install };
}

/** How many of the given sound files are already saved for offline use. */
export async function countCached(paths: string[]): Promise<number> {
  if (!("caches" in window)) return 0;
  const cache = await caches.open(SOUND_CACHE);
  const hits = await Promise.all(paths.map((p) => cache.match(p)));
  return hits.filter(Boolean).length;
}

/** Saves every sound for offline use, a few at a time. */
export async function downloadSounds(paths: string[], onProgress: (done: number) => void) {
  const cache = await caches.open(SOUND_CACHE);
  navigator.storage?.persist?.().catch(() => {});
  let done = 0;
  const queue = [...paths];
  const worker = async () => {
    for (let path = queue.shift(); path; path = queue.shift()) {
      if (!(await cache.match(path))) await cache.add(path);
      onProgress(++done);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}
