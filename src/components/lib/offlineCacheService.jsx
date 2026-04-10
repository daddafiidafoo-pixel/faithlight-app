/**
 * Offline Bible Cache Service
 * Uses IndexedDB to cache Bible passages, journals, and prayer requests
 * Enables reading and journaling without internet connection
 */

const DB_NAME = 'FaithLightOfflineDB';
const DB_VERSION = 1;

const STORES = {
  verses: 'verses',
  journals: 'journals',
  prayers: 'prayers',
  progress: 'progress',
  metadata: 'metadata',
};

let db = null;

/**
 * Initialize the offline database
 */
export async function initializeOfflineDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('Offline DB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const newDb = event.target.result;

      // Verses store
      if (!newDb.objectStoreNames.contains(STORES.verses)) {
        const verseStore = newDb.createObjectStore(STORES.verses, { keyPath: 'verse_id' });
        verseStore.createIndex('bookChapter', ['book_key', 'chapter']);
      }

      // Journals store
      if (!newDb.objectStoreNames.contains(STORES.journals)) {
        const journalStore = newDb.createObjectStore(STORES.journals, { keyPath: 'id' });
        journalStore.createIndex('userId', 'user_id');
      }

      // Prayers store
      if (!newDb.objectStoreNames.contains(STORES.prayers)) {
        const prayerStore = newDb.createObjectStore(STORES.prayers, { keyPath: 'id' });
        prayerStore.createIndex('timestamp', 'created_date');
      }

      // Progress store
      if (!newDb.objectStoreNames.contains(STORES.progress)) {
        const progressStore = newDb.createObjectStore(STORES.progress, { keyPath: 'id' });
        progressStore.createIndex('userId', 'user_id');
      }

      // Metadata store (last sync times, etc.)
      if (!newDb.objectStoreNames.contains(STORES.metadata)) {
        newDb.createObjectStore(STORES.metadata, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Cache a Bible verse
 */
export async function cacheVerse(verse) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.verses], 'readwrite');
    const store = tx.objectStore(STORES.verses);
    const request = store.put(verse);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(verse);
  });
}

/**
 * Get a cached verse
 */
export async function getCachedVerse(bookKey, chapter, verse) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.verses], 'readonly');
    const store = tx.objectStore(STORES.verses);
    const verseId = `${bookKey}-${chapter}-${verse}`;
    const request = store.get(verseId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Get all cached verses for a book/chapter
 */
export async function getCachedChapter(bookKey, chapter) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.verses], 'readonly');
    const index = tx.objectStore(STORES.verses).index('bookChapter');
    const range = IDBKeyRange.bound([bookKey, chapter], [bookKey, chapter]);
    const request = index.getAll(range);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Cache a journal entry
 */
export async function cacheJournal(journal) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.journals], 'readwrite');
    const store = tx.objectStore(STORES.journals);
    const request = store.put(journal);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(journal);
  });
}

/**
 * Get user's cached journals
 */
export async function getCachedJournals(userId) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.journals], 'readonly');
    const index = tx.objectStore(STORES.journals).index('userId');
    const request = index.getAll(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Cache prayer requests
 */
export async function cachePrayer(prayer) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.prayers], 'readwrite');
    const store = tx.objectStore(STORES.prayers);
    const request = store.put(prayer);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(prayer);
  });
}

/**
 * Get all cached prayers
 */
export async function getCachedPrayers() {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.prayers], 'readonly');
    const store = tx.objectStore(STORES.prayers);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Cache reading progress
 */
export async function cacheProgress(progress) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.progress], 'readwrite');
    const store = tx.objectStore(STORES.progress);
    const request = store.put(progress);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(progress);
  });
}

/**
 * Get cached progress for user
 */
export async function getCachedProgress(userId) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.progress], 'readonly');
    const index = tx.objectStore(STORES.progress).index('userId');
    const request = index.getAll(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Get storage quota and usage
 */
export async function getStorageInfo() {
  if (!navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percent: (estimate.usage / estimate.quota) * 100,
    };
  } catch (err) {
    console.error('Failed to get storage info:', err);
    return null;
  }
}

/**
 * Clear all offline data
 */
export async function clearOfflineDB() {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.verses, STORES.journals, STORES.prayers, STORES.progress, STORES.metadata],
      'readwrite'
    );

    let completed = 0;
    const total = 5;

    Object.values(STORES).forEach(store => {
      const request = tx.objectStore(store).clear();
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Get cache size in bytes
 */
export async function getCacheSize() {
  const estimate = await getStorageInfo();
  return estimate ? estimate.usage : 0;
}

/**
 * Batch cache verses for offline reading
 */
export async function batchCacheVerses(verses) {
  await initializeOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.verses], 'readwrite');
    const store = tx.objectStore(STORES.verses);

    verses.forEach(verse => {
      store.put(verse);
    });

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(verses.length);
  });
}

/**
 * Check if a verse is cached
 */
export async function isVerseCached(bookKey, chapter, verse) {
  const cached = await getCachedVerse(bookKey, chapter, verse);
  return !!cached;
}