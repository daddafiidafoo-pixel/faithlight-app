// Initialize offline capabilities on app load

import { registerOfflineCache } from './offlineCacheManager';

export async function initializeOfflineMode() {
  try {
    // Register service worker
    const registration = await registerOfflineCache();
    
    if (registration) {
      console.log('Offline mode initialized');
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New offline version available');
          }
        });
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize offline mode:', error);
    return false;
  }
}

// Auto-cache user data when authenticated
export async function setupAutoCaching(user) {
  if (!user) return;
  
  // This would be called after user logs in
  // Cache their reading plans, highlights, notes, etc.
  console.log('Auto-caching setup for user:', user.email);
}