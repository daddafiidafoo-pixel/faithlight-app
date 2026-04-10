/**
 * IndexedDB service for offline Bible chapter storage
 * Stores chapters locally so they're accessible without internet
 */

const DB_NAME = 'FaithLightBible';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';

let _db = null;

/**
 * Initialize IndexedDB connection
 */
export async function initOfflineDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(new Error('Failed to open IndexedDB'));
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('bibleLangChapter', ['bible_id', 'language_code', 'book_id', 'chapter']);
        store.createIndex('downloadedAt', 'downloaded_at');
      }
    };
  });
}

/**
 * Save chapter to offline storage
 * @param {string} bibleId - Bible ID (e.g., ENGESV)
 * @param {string} languageCode - Language code (e.g., om, en)
 * @param {string} bookId - Book ID (e.g., PSA)
 * @param {number} chapter - Chapter number
 * @param {array} verses - Array of verse objects
 */
export async function saveChapterOffline(bibleId, languageCode, bookId, chapter, verses) {
  const db = await initOfflineDB();
  const id = `${bibleId}:${languageCode}:${bookId}:${chapter}`;

  const chapterData = {
    id,
    bible_id: bibleId,
    language_code: languageCode,
    book_id: bookId,
    chapter,
    verses,
    downloaded_at: new Date().toISOString(),
    size_bytes: JSON.stringify(verses).length,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(chapterData);

    req.onerror = () => reject(new Error('Failed to save chapter offline'));
    req.onsuccess = () => resolve(chapterData);
  });
}

/**
 * Get chapter from offline storage
 */
export async function getChapterOffline(bibleId, languageCode, bookId, chapter) {
  const db = await initOfflineDB();
  const id = `${bibleId}:${languageCode}:${bookId}:${chapter}`;

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);

    req.onerror = () => reject(new Error('Failed to retrieve chapter'));
    req.onsuccess = () => resolve(req.result || null);
  });
}

/**
 * Check if chapter is available offline
 */
export async function isChapterOffline(bibleId, languageCode, bookId, chapter) {
  const chapter_data = await getChapterOffline(bibleId, languageCode, bookId, chapter);
  return !!chapter_data;
}

/**
 * Get all downloaded chapters for a language
 */
export async function getDownloadedChapters(languageCode) {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('downloadedAt');
    const req = index.getAll();

    req.onerror = () => reject(new Error('Failed to retrieve downloaded chapters'));
    req.onsuccess = () => {
      const chapters = req.result.filter(c => c.language_code === languageCode);
      resolve(chapters);
    };
  });
}

/**
 * Delete chapter from offline storage
 */
export async function deleteChapterOffline(bibleId, languageCode, bookId, chapter) {
  const db = await initOfflineDB();
  const id = `${bibleId}:${languageCode}:${bookId}:${chapter}`;

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onerror = () => reject(new Error('Failed to delete chapter'));
    req.onsuccess = () => resolve();
  });
}

/**
 * Get total offline storage size in bytes
 */
export async function getOfflineStorageSize(languageCode) {
  const chapters = await getDownloadedChapters(languageCode);
  return chapters.reduce((total, ch) => total + (ch.size_bytes || 0), 0);
}

/**
 * Clear all offline storage for a language
 */
export async function clearOfflineStorage(languageCode) {
  const chapters = await getDownloadedChapters(languageCode);
  for (const ch of chapters) {
    await deleteChapterOffline(ch.bible_id, ch.language_code, ch.book_id, ch.chapter);
  }
}