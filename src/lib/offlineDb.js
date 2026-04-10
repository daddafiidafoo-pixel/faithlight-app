// IndexedDB for offline audio/text storage
const DB_NAME = 'faithlight_offline';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio_chapters';
const TEXT_STORE = 'text_chapters';

let db = null;

export async function initOfflineDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    
    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains(AUDIO_STORE)) {
        database.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(TEXT_STORE)) {
        database.createObjectStore(TEXT_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveAudioChapter(chapterRef, audioUrl) {
  if (!db) await initOfflineDb();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    
    // Fetch and store as blob
    fetch(audioUrl)
      .then(r => r.blob())
      .then(blob => {
        store.put({
          id: chapterRef,
          chapter: chapterRef,
          blob,
          savedAt: new Date().toISOString(),
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      })
      .catch(reject);
  });
}

export async function getAudioChapter(chapterRef) {
  if (!db) await initOfflineDb();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const store = tx.objectStore(AUDIO_STORE);
    const req = store.get(chapterRef);
    
    req.onsuccess = () => {
      const result = req.result;
      if (result && result.blob) {
        resolve(URL.createObjectURL(result.blob));
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAudioChapter(chapterRef) {
  if (!db) await initOfflineDb();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    store.delete(chapterRef);
    
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineStorage() {
  if (!db) await initOfflineDb();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction([AUDIO_STORE], 'readonly');
    const store = tx.objectStore(AUDIO_STORE);
    const req = store.getAll();
    
    req.onsuccess = () => {
      const items = req.result;
      const totalSize = items.reduce((sum, item) => sum + (item.blob?.size || 0), 0);
      resolve({
        count: items.length,
        sizeBytes: totalSize,
        sizeMB: (totalSize / 1024 / 1024).toFixed(2),
      });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearOfflineStorage() {
  if (!db) await initOfflineDb();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE);
    store.clear();
    
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}