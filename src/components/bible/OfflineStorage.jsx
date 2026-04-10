// Simple IndexedDB storage for offline Bible content
const DB_NAME = 'FaithLightBible';
const DB_VERSION = 1;
const STORE_NAME = 'verses';
const METADATA_STORE = 'downloadMetadata';

let db = null;

export const initializeDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const newDB = event.target.result;
      if (!newDB.objectStoreNames.contains(STORE_NAME)) {
        const store = newDB.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('reference', 'reference', { unique: true });
        store.createIndex('bookChapter', ['book', 'chapter'], { unique: false });
        store.createIndex('translation', 'translation', { unique: false });
      }
      if (!newDB.objectStoreNames.contains(METADATA_STORE)) {
        newDB.createObjectStore(METADATA_STORE, { keyPath: 'book_translation' });
      }
    };
  });
};

export const saveVersesOffline = async (verses) => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    verses.forEach(v => store.put(v));
    
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(verses.length);
  });
};

export const getVersesOffline = async (book, chapter, translation) => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('bookChapter');
    
    const range = IDBKeyRange.only([book, chapter]);
    const request = index.getAll(range);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result.filter(v => v.translation === translation);
      resolve(results.length > 0 ? results : null);
    };
  });
};

export const getStorageStats = async () => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, METADATA_STORE], 'readonly');
    const verseStore = tx.objectStore(STORE_NAME);
    const metaStore = tx.objectStore(METADATA_STORE);
    
    const versesReq = verseStore.count();
    const metaReq = metaStore.getAll();
    
    let verseCount = 0;
    let downloads = [];
    
    versesReq.onsuccess = () => {
      verseCount = versesReq.result;
    };
    
    metaReq.onsuccess = () => {
      downloads = metaReq.result;
    };
    
    tx.oncomplete = () => {
      resolve({
        total_verses: verseCount,
        downloads: downloads,
        storage_size_mb: (verseCount * 0.001).toFixed(2), // rough estimate
      });
    };
    
    tx.onerror = () => reject(tx.error);
  });
};

export const saveDownloadMetadata = async (book, translation, chapterCount) => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([METADATA_STORE], 'readwrite');
    const store = tx.objectStore(METADATA_STORE);
    
    const metadata = {
      book_translation: `${book}_${translation}`,
      book,
      translation,
      chapter_count: chapterCount,
      downloaded_at: new Date().toISOString(),
    };
    
    const request = store.put(metadata);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(metadata);
  });
};

export const getDownloadedBooks = async () => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([METADATA_STORE], 'readonly');
    const store = tx.objectStore(METADATA_STORE);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const deleteOfflineContent = async (book, translation) => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
    const verseStore = tx.objectStore(STORE_NAME);
    const metaStore = tx.objectStore(METADATA_STORE);
    const index = verseStore.index('translation');
    
    // Delete verses
    const verseReq = index.openCursor(IDBKeyRange.only(translation));
    verseReq.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.book === book) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    
    // Delete metadata
    const metaReq = metaStore.delete(`${book}_${translation}`);
    
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(true);
  });
};

export const clearAllOfflineData = async () => {
  if (!db) await initializeDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(METADATA_STORE).clear();
    
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve(true);
  });
};