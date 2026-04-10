import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Offline Verse Cacher
 * Manages IndexedDB caching for Bible verses and highlights
 * Enables offline reading access
 */
export default function OfflineVerseCacher() {
  const [cacheStatus, setCacheStatus] = useState('idle');
  const [cachedVerses, setCachedVerses] = useState(0);
  const [db, setDb] = useState(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const dbReq = indexedDB.open('FaithLightOffline', 1);

        dbReq.onerror = () => {
          console.error('IndexedDB initialization failed');
          setCacheStatus('error');
        };

        dbReq.onupgradeneeded = (e) => {
          const dbInstance = e.target.result;
          if (!dbInstance.objectStoreNames.contains('verses')) {
            dbInstance.createObjectStore('verses', { keyPath: 'id', autoIncrement: true });
          }
          if (!dbInstance.objectStoreNames.contains('highlights')) {
            dbInstance.createObjectStore('highlights', { keyPath: 'id', autoIncrement: true });
          }
        };

        dbReq.onsuccess = () => {
          const dbInstance = dbReq.result;
          setDb(dbInstance);
          loadCachedCount(dbInstance);
          setCacheStatus('ready');
        };
      } catch (err) {
        console.error('Failed to init IndexedDB:', err);
        setCacheStatus('error');
      }
    };

    initDB();
  }, []);

  // Load count of cached verses
  const loadCachedCount = (database) => {
    const tx = database.transaction('verses', 'readonly');
    const store = tx.objectStore('verses');
    const countReq = store.count();

    countReq.onsuccess = () => {
      setCachedVerses(countReq.result);
    };
  };

  // Cache a verse to IndexedDB
  const cacheVerse = async (verseRef, text, translation = 'WEB') => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('verses', 'readwrite');
      const store = tx.objectStore('verses');
      const req = store.add({
        ref: verseRef,
        text,
        translation,
        timestamp: Date.now(),
      });

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  };

  // Get verse from cache
  const getCachedVerse = async (verseRef, translation = 'WEB') => {
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction('verses', 'readonly');
      const store = tx.objectStore('verses');
      const index = store.index('ref');
      const req = index.get(verseRef);

      req.onsuccess = () => {
        const result = req.result;
        if (result && result.translation === translation) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
    });
  };

  // Save highlight to IndexedDB
  const saveHighlight = async (verseRef, highlightColor = 'yellow') => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const tx = db.transaction('highlights', 'readwrite');
      const store = tx.objectStore('highlights');
      const req = store.add({
        ref: verseRef,
        color: highlightColor,
        timestamp: Date.now(),
      });

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  };

  // Get all highlights
  const getAllHighlights = async () => {
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction('highlights', 'readonly');
      const store = tx.objectStore('highlights');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
    });
  };

  // Register Service Worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('[SW] Service Worker registered'))
        .catch((err) => console.debug('[SW] Registration failed:', err));
    }
  }, []);

  // Export API for app-wide use
  useEffect(() => {
    if (db) {
      window.faithlightOffline = {
        cacheVerse,
        getCachedVerse,
        saveHighlight,
        getAllHighlights,
      };
    }
  }, [db]);

  return (
    <div className="hidden">
      {/* Background service — no UI needed */}
      <span className="text-xs text-gray-500">
        {cacheStatus === 'ready' && `📦 ${cachedVerses} verses cached`}
        {cacheStatus === 'error' && '⚠️ Offline caching unavailable'}
      </span>
    </div>
  );
}