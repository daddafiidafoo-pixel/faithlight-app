// Service Worker for offline caching

const CACHE_VERSION = 'faithlight-v1';
const CACHE_ASSETS = 'faithlight-assets-v1';

const CACHE_PATHS = [
  '/',
  '/index.html',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_ASSETS).then((cache) => {
      return cache.addAll(CACHE_PATHS).catch(() => {
        console.warn('Some resources could not be cached');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_ASSETS)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for API calls, cache-first for assets
  const { request } = event;
  
  if (request.method !== 'GET') {
    return;
  }

  // API calls: network-first with cache fallback
  if (request.url.includes('/api/') || request.url.includes('base44')) {
    event.respondWith(
      fetch(request)
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
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline - data not available', { status: 503 });
          });
        })
    );
  } else {
    // Assets: cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_ASSETS).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        });
      })
    );
  }
});
