/**
 * Offline Bible Manager
 * Handles IndexedDB operations for storing & retrieving Bible chapters locally
 */

const DB_NAME = 'FaithLight_Bibles';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';

let db = null;

/**
 * Initialize IndexedDB for offline Bible storage
 */
async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('versionId_book_chapter', ['versionId', 'book', 'chapter'], { unique: true });
        store.createIndex('versionId', 'versionId');
      }
    };
  });
}

/**
 * Save chapter to offline storage
 * @param {string} versionId - Bible translation ID (e.g., 'WEB', 'KJV')
 * @param {string} book - Book name (e.g., 'Genesis')
 * @param {number} chapter - Chapter number
 * @param {array} verses - Array of verse objects
 */
export async function saveChapterOffline(versionId, book, chapter, verses) {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const record = {
      id: `${versionId}_${book}_${chapter}`,
      versionId,
      book,
      chapter,
      verses,
      savedAt: new Date().toISOString(),
      size: JSON.stringify(verses).length,
    };

    const request = store.put(record);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(record);
  });
}

/**
 * Get chapter from offline storage
 * @param {string} versionId - Bible translation ID
 * @param {string} book - Book name
 * @param {number} chapter - Chapter number
 */
export async function getChapterOffline(versionId, book, chapter) {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('versionId_book_chapter');
    
    const request = index.get([versionId, book, chapter]);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Check if a chapter is available offline
 */
export async function isChapterOffline(versionId, book, chapter) {
  const record = await getChapterOffline(versionId, book, chapter);
  return !!record;
}

/**
 * Get all downloaded translations
 */
export async function getDownloadedTranslations() {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('versionId');
    
    const request = index.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result;
      const translations = {};
      
      records.forEach(r => {
        if (!translations[r.versionId]) {
          translations[r.versionId] = { books: new Set(), totalSize: 0 };
        }
        translations[r.versionId].books.add(r.book);
        translations[r.versionId].totalSize += r.size || 0;
      });

      // Convert sets to arrays
      Object.keys(translations).forEach(key => {
        translations[key].books = Array.from(translations[key].books);
      });

      resolve(translations);
    };
  });
}

/**
 * Delete a specific chapter from offline storage
 */
export async function deleteChapterOffline(versionId, book, chapter) {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(`${versionId}_${book}_${chapter}`);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

/**
 * Delete all chapters of a translation
 */
export async function deleteTranslationOffline(versionId) {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('versionId');
    
    const request = index.getAll(versionId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result;
      records.forEach(r => {
        store.delete(r.id);
      });
      resolve(records.length);
    };
  });
}

/**
 * Get offline storage usage stats
 */
export async function getOfflineStorageStats() {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const records = request.result;
      const stats = {
        totalSize: 0,
        recordCount: records.length,
        translations: {},
      };

      records.forEach(r => {
        stats.totalSize += r.size || 0;
        if (!stats.translations[r.versionId]) {
          stats.translations[r.versionId] = {
            size: 0,
            chapters: 0,
          };
        }
        stats.translations[r.versionId].size += r.size || 0;
        stats.translations[r.versionId].chapters += 1;
      });

      resolve(stats);
    };
  });
}