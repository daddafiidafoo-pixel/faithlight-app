// Service Worker for Offline Bible Content Caching
const CACHE_NAME = 'faithlight-offline-v1';
const BIBLE_CACHE = 'faithlight-bible-v1';

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== BIBLE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Install event - cache essential app files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]).catch(() => {
        // Ignore errors for static assets
      });
    })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('base44')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Cache successful responses
          const cache = url.pathname.includes('/bible') ? BIBLE_CACHE : CACHE_NAME;
          const responseToCache = response.clone();
          caches.open(cache).then((c) => {
            c.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((response) => {
            return response || cacheResponse(request);
          });
        })
    );
  } else {
    // Static assets - cache first
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      })
    );
  }
});

// Handle messages from client (download, delete, etc.)
self.addEventListener('message', (event) => {
  const { action, book, data } = event.data;

  if (action === 'cacheBook') {
    cacheBook(event.ports[0], book, data);
  } else if (action === 'deleteBook') {
    deleteBook(event.ports[0], book);
  } else if (action === 'getCachedBooks') {
    getCachedBooks(event.ports[0]);
  }
});

async function cacheBook(port, book, data) {
  try {
    const cache = await caches.open(BIBLE_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/bible/${book.key}`, response);
    port.postMessage({ success: true, message: `${book.name} cached` });
  } catch (error) {
    port.postMessage({ success: false, error: error.message });
  }
}

async function deleteBook(port, book) {
  try {
    const cache = await caches.open(BIBLE_CACHE);
    await cache.delete(`/bible/${book.key}`);
    port.postMessage({ success: true, message: `${book.name} deleted` });
  } catch (error) {
    port.postMessage({ success: false, error: error.message });
  }
}

async function getCachedBooks(port) {
  try {
    const cache = await caches.open(BIBLE_CACHE);
    const requests = await cache.keys();
    const books = requests.map(req => {
      const match = req.url.match(/\/bible\/(.+)$/);
      return match ? match[1] : null;
    }).filter(Boolean);
    port.postMessage({ success: true, books });
  } catch (error) {
    port.postMessage({ success: false, error: error.message });
  }
}

function cacheResponse(request) {
  // Return offline page or error response
  return new Response('Offline - No cached data available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain'
    })
  });
}