// IndexedDB management for offline chapter storage
const DB_NAME = 'FaithLightOffline';
const STORE_NAME = 'chapters';
const DB_VERSION = 1;

class OfflineChapterStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not available');
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        console.log('OfflineChapterStorage initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveChapter(chapterId, chapterData) {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: chapterId,
        data: chapterData,
        savedAt: Date.now(),
      };

      const request = store.put(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(record);
    });
  }

  async getChapter(chapterId) {
    await this.initPromise;
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(chapterId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllChapters() {
    await this.initPromise;
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const chapters = request.result.sort((a, b) => b.savedAt - a.savedAt);
        resolve(chapters);
      };
    });
  }

  async deleteChapter(chapterId) {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(chapterId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async pruneOldest(maxChapters = 10) {
    const chapters = await this.getAllChapters();
    if (chapters.length > maxChapters) {
      const toDelete = chapters.slice(maxChapters);
      for (const chapter of toDelete) {
        await this.deleteChapter(chapter.id);
      }
    }
  }

  async clearAll() {
    await this.initPromise;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const offlineChapterStorage = new OfflineChapterStorage();