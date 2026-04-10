// IndexedDB for text chapters (persistent, ~10MB+ capacity)
const DB_NAME = 'FaithLightBible';
const TEXT_STORE = 'bibleText';
const METADATA_STORE = 'downloadMetadata';
const DB_VERSION = 1;

let db = null;

// Initialize IndexedDB
export async function initBibleDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(TEXT_STORE)) {
        database.createObjectStore(TEXT_STORE, { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };
  });
}

// TEXT STORAGE (IndexedDB)
export async function getTextOffline(key) {
  try {
    const database = await initBibleDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction([TEXT_STORE], 'readonly');
      const store = tx.objectStore(TEXT_STORE);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const record = request.result;
        resolve(record ? record.versesJson : null);
      };
    });
  } catch (e) {
    console.warn('IndexedDB read failed, falling back:', e);
    return null;
  }
}

export async function setTextOffline(key, versesJson) {
  try {
    const database = await initBibleDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction([TEXT_STORE], 'readwrite');
      const store = tx.objectStore(TEXT_STORE);
      const request = store.put({
        key,
        versesJson,
        cachedAt: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (e) {
    console.warn('IndexedDB write failed:', e);
    return false;
  }
}

export async function deleteTextOffline(key) {
  try {
    const database = await initBibleDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction([TEXT_STORE], 'readwrite');
      const store = tx.objectStore(TEXT_STORE);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (e) {
    console.warn('IndexedDB delete failed:', e);
    return false;
  }
}

export async function getAllTextOffline() {
  try {
    const database = await initBibleDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction([TEXT_STORE], 'readonly');
      const store = tx.objectStore(TEXT_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (e) {
    console.warn('IndexedDB getAll failed:', e);
    return [];
  }
}

export async function getOfflineTextSize() {
  try {
    const allRecords = await getAllTextOffline();
    let totalSize = 0;
    allRecords.forEach((record) => {
      totalSize += JSON.stringify(record.versesJson).length;
    });
    return (totalSize / 1024 / 1024).toFixed(2); // MB
  } catch (e) {
    return '0';
  }
}

// AUDIO STORAGE (Cache API + Service Worker)
const AUDIO_CACHE = 'faithlight-audio-v1';

export async function isAudioCached(key) {
  try {
    if (!('caches' in window)) return false;
    const cache = await caches.open(AUDIO_CACHE);
    const match = await cache.match(`/offline-audio/${encodeURIComponent(key)}`);
    return !!match;
  } catch (e) {
    console.warn('Cache API check failed:', e);
    return false;
  }
}

export async function cacheAudioFile(key, audioUrl) {
  try {
    if (!('caches' in window)) {
      console.warn('Cache API not available');
      return false;
    }

    const cache = await caches.open(AUDIO_CACHE);
    const offlineRequest = new Request(`/offline-audio/${encodeURIComponent(key)}`);

    // Fetch audio with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const res = await fetch(audioUrl, {
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Audio fetch failed: ${res.status}`);
    }

    await cache.put(offlineRequest, res.clone());
    return true;
  } catch (e) {
    console.warn('Audio caching failed:', e);
    return false;
  }
}

export async function getCachedAudioBlobUrl(key) {
  try {
    if (!('caches' in window)) return null;
    const cache = await caches.open(AUDIO_CACHE);
    const res = await cache.match(`/offline-audio/${encodeURIComponent(key)}`);
    if (!res) return null;

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Getting cached audio blob failed:', e);
    return null;
  }
}

export async function deleteCachedAudio(key) {
  try {
    if (!('caches' in window)) return false;
    const cache = await caches.open(AUDIO_CACHE);
    return await cache.delete(`/offline-audio/${encodeURIComponent(key)}`);
  } catch (e) {
    console.warn('Delete cached audio failed:', e);
    return false;
  }
}

export async function getAudioCacheSize() {
  try {
    if (!('caches' in window) || !('estimate' in navigator.storage)) return '0';

    const estimate = await navigator.storage.estimate();
    const audioCache = estimate.usage || 0;
    return (audioCache / 1024 / 1024).toFixed(2); // MB
  } catch (e) {
    return '0';
  }
}

export async function clearAllOfflineStorage() {
  try {
    // Clear IndexedDB
    const database = await initBibleDB();
    const textTx = database.transaction([TEXT_STORE], 'readwrite');
    textTx.objectStore(TEXT_STORE).clear();

    // Clear Cache API
    if ('caches' in window) {
      await caches.delete(AUDIO_CACHE);
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e?.message };
  }
}