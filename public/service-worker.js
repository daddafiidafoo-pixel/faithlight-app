const CACHE_NAME = 'faithlight-v1';
const BIBLE_CACHE = 'faithlight-bible-v1';
const AUDIO_CACHE = 'faithlight-audio-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== BIBLE_CACHE && cacheName !== AUDIO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache Bible chapter API calls
  if (url.pathname.includes('/api/chapters/')) {
    event.respondWith(
      caches.open(BIBLE_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) return response;
          return fetch(request).then((fetchResponse) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          }).catch(() => {
            return new Response(JSON.stringify({ error: 'Offline' }), { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Cache audio files
  if (request.destination === 'audio' || url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) return response;
          return fetch(request).then((fetchResponse) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          }).catch(() => new Response('', { status: 503 }));
        });
      })
    );
    return;
  }

  // Network-first for other requests, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).catch(() => {
          return new Response('Network error', { status: 503 });
        });
      })
  );
});

// Handle background sync for offline notes/highlights
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    const response = await fetch('/api/sync-offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Sync failed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
