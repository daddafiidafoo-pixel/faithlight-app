// FaithLight Offline Service Worker Registration
// Call this from your app to register the service worker

export async function registerOfflineWorker() {
  // Skip registration in iframe (preview) or when SW not supported
  if (!('serviceWorker' in navigator)) {
    console.debug('[SW] Service Workers not supported');
    return;
  }

  // Detect if running in iframe (Base44 preview environment)
  if (typeof window !== 'undefined' && window.self !== window.top) {
    console.debug('[SW] Running in iframe (preview mode) — skipping registration');
    return;
  }

  try {
    // Create a simple inline worker
    const workerCode = `
      const CACHE_NAME = 'faithlight-bible-v1';
      const BIBLE_CACHE = 'faithlight-bible-content-v1';

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['/'])
              .catch(() => Promise.resolve());
          })
        );
        self.skipWaiting();
      });

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
        self.clients.claim();
      });

      self.addEventListener('fetch', (event) => {
        const { request } = event;
        const url = new URL(request.url);

        if (url.origin !== self.location.origin || request.method !== 'GET') {
          return;
        }

        // API requests - network first
        if (url.pathname.includes('/api/')) {
          event.respondWith(
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  const cacheClone = response.clone();
                  caches.open(BIBLE_CACHE).then((cache) => {
                    cache.put(request, cacheClone);
                  });
                }
                return response;
              })
              .catch(() => caches.match(request))
          );
          return;
        }

        // Assets - cache first
        event.respondWith(
          caches
            .match(request)
            .then((cached) => {
              return cached || fetch(request).then((response) => {
                if (response.ok) {
                  const cacheClone = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, cacheClone);
                  });
                }
                return response;
              });
            })
            .catch(() => new Response('Offline', { status: 503 }))
        );
      });
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    const registration = await navigator.serviceWorker.register(workerUrl, {
      scope: '/',
    });

    console.debug('[SW] Service Worker registered:', registration);
    return registration;
  } catch (error) {
    // Silently fail in preview/unsupported environments — don't crash the app
    console.debug('[SW] Registration failed (non-critical in preview):', error?.message);
    return null;
  }
}

// Unregister worker
export async function unregisterOfflineWorker() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  registrations.forEach(reg => reg.unregister());
}