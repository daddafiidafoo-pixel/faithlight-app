// Service worker-based offline Bible caching strategy
// Integrates with IndexedDB for persistent storage

const CACHE_NAME = 'bible-offline-v1';
const DB_NAME = 'FaithLightOfflineDB';
const STORE_NAME = 'BibleChapters';

class OfflineBibleCacheService {
  constructor() {
    this.db = null;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('book_chapter', ['book_id', 'chapter'], { unique: true });
          store.createIndex('user_email', 'user_email');
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
    });
  }

  async saveChapter(userId, bookId, chapter, text, language) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const id = `${bookId}-${chapter}-${language}`;

      const request = store.put({
        id,
        user_email: userId,
        book_id: bookId,
        chapter,
        language,
        text,
        saved_at: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getChapter(bookId, chapter, language) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const id = `${bookId}-${chapter}-${language}`;

      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getUserDownloads(userId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('user_email');

      const request = index.getAll(userId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteChapter(bookId, chapter, language) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const id = `${bookId}-${chapter}-${language}`;

      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async getTotalSize(userId) {
    const downloads = await this.getUserDownloads(userId);
    // Rough estimate: average chapter ~50KB
    return (downloads.length * 50) / 1024;
  }
}

export default new OfflineBibleCacheService();