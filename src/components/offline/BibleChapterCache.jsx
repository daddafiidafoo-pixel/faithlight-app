import { useState, useEffect } from 'react';

/**
 * BibleChapterCache
 * IndexedDB-based strategy for caching Bible chapters offline.
 * Usage:
 *   import { cacheChapter, getCachedChapter, getCachedBookmarks, cacheBookmark, removeBookmark } from '@/components/offline/BibleChapterCache';
 */

const DB_NAME = 'FaithLightBible';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'chapters';
const STORE_BOOKMARKS = 'bookmarks';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
        db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id', autoIncrement: true });
        db.transaction.objectStore(STORE_BOOKMARKS).createIndex('userEmail', 'userEmail', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Cache a Bible chapter (verses array) for offline reading */
export async function cacheChapter({ translation, book, chapter, verses }) {
  const db = await openDB();
  const key = `${translation}:${book}:${chapter}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    tx.objectStore(STORE_CHAPTERS).put({ key, translation, book, chapter, verses, cachedAt: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/** Retrieve a cached chapter, returns null if not found */
export async function getCachedChapter({ translation, book, chapter }) {
  const db = await openDB();
  const key = `${translation}:${book}:${chapter}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const req = tx.objectStore(STORE_CHAPTERS).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/** List all cached chapters for a user's selected translation */
export async function listCachedChapters(translation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const req = tx.objectStore(STORE_CHAPTERS).getAll();
    req.onsuccess = () => resolve((req.result || []).filter(r => !translation || r.translation === translation));
    req.onerror = () => reject(req.error);
  });
}

/** Remove a specific cached chapter */
export async function removeCachedChapter({ translation, book, chapter }) {
  const db = await openDB();
  const key = `${translation}:${book}:${chapter}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    tx.objectStore(STORE_CHAPTERS).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/** Save a bookmark to IndexedDB */
export async function cacheBookmark({ userEmail, reference, verseText, book, chapter, verse }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
    tx.objectStore(STORE_BOOKMARKS).add({ userEmail, reference, verseText, book, chapter, verse, savedAt: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/** Get all bookmarks for a user from IndexedDB */
export async function getCachedBookmarks(userEmail) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKMARKS, 'readonly');
    const index = tx.objectStore(STORE_BOOKMARKS).index('userEmail');
    const req = index.getAll(IDBKeyRange.only(userEmail));
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/** Remove a bookmark by its IndexedDB id */
export async function removeBookmark(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_BOOKMARKS, 'readwrite');
    tx.objectStore(STORE_BOOKMARKS).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/** Hook: returns { isOffline } */
export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);
  return { isOffline };
}