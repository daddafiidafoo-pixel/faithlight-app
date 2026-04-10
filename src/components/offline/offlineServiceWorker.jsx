/**
 * FaithLight Offline Service Worker
 * Enables offline Bible reading with caching strategy
 */

const CACHE_VERSION = 'faithlight-v1';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event: cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS).catch(() => {
        // If some assets fail to cache, continue
        console.warn('Some offline assets could not be cached');
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API calls: network first, fallback to cache
  if (request.url.includes('/api/') || request.url.includes('/functions/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request).then((cached) => {
            return cached || createOfflineResponse();
          });
        })
    );
  }

  // Static assets: cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return createOfflineResponse();
          }
          return null;
        });
    })
  );
});

// Message event: handle background sync and cache updates
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'CACHE_CHAPTER') {
    // Handle chapter caching from client
    cacheChapterData(payload).catch((err) => {
      console.error('Failed to cache chapter:', err);
    });
  }

  if (type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

function createOfflineResponse() {
  return new Response('Offline - Please check your internet connection', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

async function cacheChapterData(payload) {
  const { url, data } = payload;
  const cache = await caches.open(CACHE_VERSION);
  const response = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  await cache.put(url, response);
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}