/**
 * Service Worker Registration Handler
 * Enables PWA offline-first experience
 * This function is called from the frontend to register the service worker
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    // Try to load service worker from public folder
    // In a Base44 app, this might need to be in a specific location
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered:', registration);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available, notify user
          console.log('New version available');
          // Could dispatch custom event here for UI notification
          window.dispatchEvent(new Event('sw-update-available'));
        }
      });
    });

    // Check for updates regularly
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Cache specific URLs for offline access
 */
export async function cacheContentForOffline(urls) {
  if (!('serviceWorker' in navigator)) {
    return { success: false, message: 'Service Workers not supported' };
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration.controller) {
    return { success: false, message: 'Service Worker not active' };
  }

  // Send message to service worker
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    registration.controller.postMessage(
      {
        type: 'CACHE_CONTENT',
        urls
      },
      [channel.port2]
    );

    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
  });
}

/**
 * Clear offline content cache
 */
export async function clearOfflineCache() {
  if (!('serviceWorker' in navigator)) {
    return { success: false };
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration.controller) {
    return { success: false };
  }

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    registration.controller.postMessage(
      { type: 'CLEAR_CACHE' },
      [channel.port2]
    );

    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
  });
}