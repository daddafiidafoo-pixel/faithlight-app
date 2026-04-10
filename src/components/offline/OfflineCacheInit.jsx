import { useEffect } from 'react';

/**
 * Register and initialize the service worker for offline caching
 * Place this component near the root of your app (e.g., in Layout.jsx)
 */
export default function OfflineCacheInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[OfflineCache] Service Workers not supported');
      return;
    }

    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/offline-worker.js', {
        scope: '/',
      });

      console.log('[OfflineCache] Service Worker registered:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            console.log('[OfflineCache] Service Worker updated');
          }
        });
      });
    } catch (error) {
      console.error('[OfflineCache] Registration failed:', error);
    }
  };

  return null; // Invisible component
}

/**
 * Utility: Send message to service worker
 */
export const sendToServiceWorker = (action, data) => {
  if (!navigator.serviceWorker.controller) {
    console.warn('[OfflineCache] Service Worker not ready');
    return Promise.reject(new Error('Service Worker not ready'));
  }

  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => {
      if (event.data.success) {
        resolve(event.data);
      } else {
        reject(new Error(event.data.error));
      }
    };

    navigator.serviceWorker.controller.postMessage(
      { action, ...data },
      [channel.port2]
    );
  });
};