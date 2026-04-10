/**
 * Offline Bible Chapter Service
 * Stores individual Bible chapters in IndexedDB for offline reading.
 * Separate from offlineBibleDb which handles full packs.
 */

const DB_NAME = 'faithlight_chapters';
const DB_VERSION = 1;
const STORE = 'chapters';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'cache_key' });
        store.createIndex('by_book', 'book_id', { unique: false });
        store.createIndex('by_language', 'language', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Build a consistent cache key
 */
export function buildCacheKey(bookId, chapterNumber, language = 'en') {
  return `${bookId}_${chapterNumber}_${language}`;
}

/**
 * Save a chapter to IndexedDB
 * @param {string} bookId
 * @param {number} chapterNumber
 * @param {string} language
 * @param {Array} verses  - array of { verse_start, text }
 * @param {string} bookName
 */
export async function saveChapterOffline(bookId, chapterNumber, language, verses, bookName = '') {
  try {
    const db = await openDb();
    const cache_key = buildCacheKey(bookId, chapterNumber, language);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.put({
        cache_key,
        book_id: bookId,
        book_name: bookName,
        chapter_number: chapterNumber,
        language,
        verses,
        downloaded_at: Date.now(),
      });
      req.onsuccess = () => resolve(cache_key);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Get a chapter from IndexedDB
 */
export async function getOfflineChapter(bookId, chapterNumber, language = 'en') {
  try {
    const db = await openDb();
    const cache_key = buildCacheKey(bookId, chapterNumber, language);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.get(cache_key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Check if a chapter is available offline
 */
export async function isChapterDownloaded(bookId, chapterNumber, language = 'en') {
  const chapter = await getOfflineChapter(bookId, chapterNumber, language);
  return !!chapter;
}

/**
 * Remove a downloaded chapter
 */
export async function removeOfflineChapter(bookId, chapterNumber, language = 'en') {
  try {
    const db = await openDb();
    const cache_key = buildCacheKey(bookId, chapterNumber, language);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.delete(cache_key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * List all downloaded chapters
 */
export async function listDownloadedChapters() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Get all downloaded chapters for a specific book
 */
export async function getDownloadedChaptersForBook(bookId, language = 'en') {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const index = store.index('by_book');
      const req = index.getAll(bookId);
      req.onsuccess = () => {
        const results = (req.result || []).filter(r => r.language === language);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Get total count and size info
 */
export async function getOfflineStats() {
  const chapters = await listDownloadedChapters();
  return {
    totalChapters: chapters.length,
    languages: [...new Set(chapters.map(c => c.language))],
    books: [...new Set(chapters.map(c => c.book_id))],
  };
}