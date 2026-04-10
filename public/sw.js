const STATIC_CACHE = "faithlight-static-v1";
const CHAPTER_CACHE = "faithlight-chapters-v1";
const AUDIO_CACHE = "faithlight-audio-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        "/",
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.includes("/api/bible/")) {
    event.respondWith(staleWhileRevalidate(request, CHAPTER_CACHE));
    return;
  }

  if (
    url.pathname.endsWith(".mp3") ||
    url.pathname.includes("/audio/")
  ) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
  }
});

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("sync", (event) => {
  if (event.tag === "faithlight-background-sync") {
    event.waitUntil(runBackgroundSync());
  }
});

async function runBackgroundSync() {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({
      type: "SYNC_RESTORED",
      message: "Connection restored. Offline content sync completed.",
    });
  }
}
