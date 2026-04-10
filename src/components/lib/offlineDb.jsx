/**
 * OfflineDb - IndexedDB + localStorage manager for offline content
 * Dual-tier storage: localStorage for metadata cache, IndexedDB for full content
 */

const DB_NAME = 'FaithLightOffline';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';
const CACHE_KEY = 'offline_metadata';

class OfflineDb {
  constructor() {
    this.db = null;
    this.initialized = this.init();
  }

  async init() {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not available, using localStorage only');
      return false;
    }

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onerror = () => {
        console.error('IndexedDB init failed:', req.error);
        resolve(false);
      };

      req.onsuccess = () => {
        this.db = req.result;
        resolve(true);
      };

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Save chapter to IndexedDB + update localStorage metadata cache
   */
  async saveChapter(reference, title, text, language, metadata = {}) {
    const chapter = {
      reference,
      title,
      text,
      language,
      metadata,
      downloadedAt: new Date().toISOString(),
      sizeBytes: new Blob([text]).size,
    };

    const hasDb = await this.initialized;
    if (hasDb) {
      await this._saveToIndexedDB(chapter);
    }

    this._updateMetadataCache(chapter);
    return chapter;
  }

  /**
   * Retrieve chapter from IndexedDB
   */
  async getChapter(reference) {
    const hasDb = await this.initialized;
    if (!hasDb) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.index('reference').get(reference);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  /**
   * List all downloaded chapters (from metadata cache)
   */
  getDownloadedList() {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      return cache ? JSON.parse(cache) : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete chapter from IndexedDB + metadata
   */
  async deleteChapter(reference) {
    const hasDb = await this.initialized;
    if (hasDb) {
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.index('reference').openCursor(reference);

        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }

    this._removeFromMetadataCache(reference);
    return true;
  }

  /**
   * Get total offline storage used
   */
  getTotalSize() {
    const list = this.getDownloadedList();
    return list.reduce((sum, ch) => sum + (ch.sizeBytes || 0), 0);
  }

  /**
   * Clear all offline content
   */
  async clearAll() {
    const hasDb = await this.initialized;
    if (hasDb) {
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORE_NAME], 'readwrite');
        const req = tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    }
  }

  // Private helpers

  async _saveToIndexedDB(chapter) {
    return new Promise((resolve) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      // Delete existing first
      const deleteReq = store.index('reference').openCursor(chapter.reference);
      deleteReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        const addReq = store.add(chapter);
        addReq.onsuccess = () => resolve(true);
        addReq.onerror = () => resolve(false);
      };
    });
  }

  _updateMetadataCache(chapter) {
    try {
      const list = this.getDownloadedList();
      const existing = list.findIndex((ch) => ch.reference === chapter.reference);

      if (existing >= 0) {
        list[existing] = {
          reference: chapter.reference,
          title: chapter.title,
          language: chapter.language,
          downloadedAt: chapter.downloadedAt,
          sizeBytes: chapter.sizeBytes,
        };
      } else {
        list.push({
          reference: chapter.reference,
          title: chapter.title,
          language: chapter.language,
          downloadedAt: chapter.downloadedAt,
          sizeBytes: chapter.sizeBytes,
        });
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch {
      console.warn('Failed to update metadata cache');
    }
  }

  _removeFromMetadataCache(reference) {
    try {
      const list = this.getDownloadedList();
      const filtered = list.filter((ch) => ch.reference !== reference);
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
    } catch {
      console.warn('Failed to remove from metadata cache');
    }
  }
}

export const offlineDb = new OfflineDb();