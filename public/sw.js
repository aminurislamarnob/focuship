// Focuship service worker. Bump VERSION to roll the app shell cache.
const VERSION = "v5";
const SHELL = `focuship-shell-${VERSION}`;
const ASSETS = `focuship-assets-${VERSION}`;
// Sounds are large and versioned by path, so this cache survives app updates.
const SOUNDS = "focuship-sounds-v1";

const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/badge-96.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL, ASSETS, SOUNDS]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// The page lists the assets it loaded before this worker took control.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "warm" || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.filter((url) => new URL(url).origin === self.location.origin);
  event.waitUntil(
    caches.open(ASSETS).then((cache) =>
      Promise.all(
        urls.map((url) =>
          cache.match(url).then((hit) => hit || fetch(url).then((res) => res.ok && cache.put(url, res))).catch(() => {}),
        ),
      ),
    ),
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(request);
  // 206 partial responses cannot be cached; sounds are fetched whole.
  if (res.ok && res.status === 200) cache.put(request, res.clone());
  return res;
}

// Each page is cached under its own path (query strings such as share links
// map to the same page). Offline, a page falls back to its cached copy, then to "/".
async function networkFirstPage(request) {
  const cache = await caches.open(SHELL);
  const key = new URL(request.url).pathname;
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch {
    return (await cache.match(key)) || (await cache.match("/")) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS);
  const hit = await caches.match(request);
  const update = fetch(request)
    .then((res) => {
      if (res.ok && res.status === 200) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit || Response.error());
  return hit || update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith("/sounds/") && url.pathname.endsWith(".mp3")) {
    if (request.headers.has("range")) return;
    event.respondWith(cacheFirst(request, SOUNDS));
  } else if (["/_next/static/", "/icons/"].some((p) => url.pathname.startsWith(p))) {
    event.respondWith(cacheFirst(request, ASSETS));
  } else if (!url.pathname.startsWith("/_next/") || url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => "focus" in w);
      return open ? open.focus() : self.clients.openWindow("/?tab=timer");
    }),
  );
});
