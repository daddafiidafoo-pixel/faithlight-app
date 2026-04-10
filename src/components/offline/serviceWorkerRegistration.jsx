/**
 * Service Worker Registration & Management
 * Handles registration, updates, and lifecycle
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker ready, notify user
          window.dispatchEvent(new CustomEvent('sw-update-available'));
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Workers unregistered');
  } catch (error) {
    console.error('Error unregistering service workers:', error);
  }
}

export function sendMessageToServiceWorker(message) {
  if (!navigator.serviceWorker.controller) {
    console.warn('Service Worker not active');
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
}

export async function updateServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  return registration.update();
}