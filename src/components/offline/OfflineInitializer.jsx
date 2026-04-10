import React, { useEffect } from 'react';

/**
 * Initializes offline PWA features on app load
 * Sets up: Service Worker + IndexedDB + sync listeners
 */
export default function OfflineInitializer() {
  useEffect(() => {
    initializeOfflineFeatures();
  }, []);

  const initializeOfflineFeatures = async () => {
    // 1. Register Service Worker (skip if sw.js is not available)
    if ('serviceWorker' in navigator) {
      try {
        const res = await fetch('/sw.js', { method: 'HEAD' });
        if (res.ok && res.headers.get('content-type')?.includes('javascript')) {
          await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        }
      } catch (_) {
        // Service worker not available in this environment - ignore silently
      }
    }

    // 2. Initialize IndexedDB
    initializeIndexedDB();

    // 3. Setup offline/online listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const initializeIndexedDB = () => {
    if (!window.indexedDB) return;

    const request = window.indexedDB.open('FaithLight', 1);

    request.onerror = () => {
      console.error('IndexedDB open error:', request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store downloaded content metadata
      if (!db.objectStoreNames.contains('offlineContent')) {
        db.createObjectStore('offlineContent', { keyPath: 'id' });
      }

      // Store pending sync items
      if (!db.objectStoreNames.contains('pendingSync')) {
        const store = db.createObjectStore('pendingSync', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
      }

      // Store verses/content text
      if (!db.objectStoreNames.contains('bibleText')) {
        db.createObjectStore('bibleText', { keyPath: 'id' });
      }

      // Store lesson progress (local)
      if (!db.objectStoreNames.contains('lessonProgress')) {
        const store = db.createObjectStore('lessonProgress', { keyPath: 'lesson_id' });
        store.createIndex('user_id', 'user_id', { unique: false });
      }

      // Store notes
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      console.log('IndexedDB initialized');
    };
  };

  const handleOnline = () => {
    console.log('Back online');
    // Trigger sync if needed
    window.dispatchEvent(new Event('app-online'));
  };

  const handleOffline = () => {
    console.log('Gone offline');
    window.dispatchEvent(new Event('app-offline'));
  };

  // This component doesn't render anything
  return null;
}