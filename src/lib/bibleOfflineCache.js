/**
 * bibleOfflineCache.js
 * IndexedDB-based caching layer for offline Bible chapters.
 * Stores chapters by key: `${bibleId}::${bookId}::${chapter}`
 */

const DB_NAME = 'faithlight_bible_cache';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'chapters';
const STORE_META = 'meta';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        const store = db.createObjectStore(STORE_CHAPTERS, { keyPath: 'key' });
        store.createIndex('bibleId', 'bibleId', { unique: false });
        store.createIndex('bookId', 'bookId', { unique: false });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = (e) => reject(e.target.error);
  });
}

function makeKey(bibleId, bookId, chapter) {
  return `${bibleId}::${bookId}::${chapter}`;
}

/**
 * Cache a chapter's verses in IndexedDB.
 * @param {string} bibleId - e.g. 'kjv', 'hae', 'gaz'
 * @param {string} bookId  - e.g. 'JHN'
 * @param {number} chapter
 * @param {Array}  verses  - array of verse objects
 */
export async function cacheChapter(bibleId, bookId, chapter, verses) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const record = {
      key: makeKey(bibleId, bookId, chapter),
      bibleId,
      bookId,
      chapter,
      verses,
      cachedAt: Date.now(),
    };
    const req = store.put(record);
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Retrieve a cached chapter. Returns null if not found.
 */
export async function getCachedChapter(bibleId, bookId, chapter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.get(makeKey(bibleId, bookId, chapter));
    req.onsuccess = (e) => resolve(e.target.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Check if a chapter is cached.
 */
export async function isChapterCached(bibleId, bookId, chapter) {
  const record = await getCachedChapter(bibleId, bookId, chapter);
  return !!record;
}

/**
 * Delete a specific cached chapter.
 */
export async function deleteCachedChapter(bibleId, bookId, chapter) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.delete(makeKey(bibleId, bookId, chapter));
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * List all cached chapters (for the download manager UI).
 */
export async function listCachedChapters() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * List cached chapters for a specific bible + book (for progress display).
 */
export async function listCachedChaptersForBook(bibleId, bookId) {
  const all = await listCachedChapters();
  return all.filter(r => r.bibleId === bibleId && r.bookId === bookId);
}

/**
 * Estimate storage usage (bytes). Uses StorageEstimate if available.
 */
export async function getStorageEstimate() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage, quota, usageMB: ((usage || 0) / 1024 / 1024).toFixed(1) };
  }
  return { usage: 0, quota: 0, usageMB: '?' };
}

/**
 * Clear all cached chapters.
 */
export async function clearAllCachedChapters() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.clear();
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Hook-friendly helper: fetch from network, cache on success, fall back to cache.
 * Returns { verses, fromCache: boolean }
 */
export async function fetchWithOfflineFallback({ bibleId, bookId, chapter, fetcher }) {
  const isOnline = navigator.onLine;

  if (isOnline) {
    try {
      const verses = await fetcher();
      if (verses?.length) {
        await cacheChapter(bibleId, bookId, chapter, verses).catch(() => {});
        return { verses, fromCache: false };
      }
    } catch { /* fall through to cache */ }
  }

  // Offline or network failed — serve from cache
  const cached = await getCachedChapter(bibleId, bookId, chapter);
  if (cached?.verses?.length) {
    return { verses: cached.verses, fromCache: true };
  }

  return { verses: [], fromCache: false };
}