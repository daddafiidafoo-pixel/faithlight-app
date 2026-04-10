// Offline Bible Caching Strategy using localStorage and IndexedDB fallback

const CACHE_VERSION = 'bible-cache-v1';
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_STORAGE = 50 * 1024 * 1024; // 50MB limit

class BibleCache {
  constructor() {
    this.dbName = 'FaithLightBible';
    this.storeName = 'chapters';
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  // Cache a chapter
  async cacheChapter(bookKey, chapter, text, metadata = {}) {
    if (!this.db) await this.initDB();

    const id = `${bookKey}-${chapter}`;
    const entry = {
      id,
      bookKey,
      chapter,
      text,
      metadata,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(entry);
    });
  }

  // Retrieve cached chapter
  async getChapter(bookKey, chapter) {
    if (!this.db) await this.initDB();

    const id = `${bookKey}-${chapter}`;

    return new Promise((resolve) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => resolve(null);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && entry.expiresAt > Date.now()) {
          resolve(entry);
        } else if (entry) {
          // Entry expired, delete it
          this.deleteChapter(bookKey, chapter);
          resolve(null);
        } else {
          resolve(null);
        }
      };
    });
  }

  // Delete cached chapter
  async deleteChapter(bookKey, chapter) {
    if (!this.db) await this.initDB();

    const id = `${bookKey}-${chapter}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  // Get all cached chapters
  async getAllCached() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = request.result.filter(e => e.expiresAt > Date.now());
        resolve(entries);
      };
    });
  }

  // Clear all cached content
  async clearAll() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  // Get cache statistics
  async getStats() {
    const cached = await this.getAllCached();
    return {
      totalChapters: cached.length,
      books: [...new Set(cached.map(c => c.bookKey))].length,
      oldestCache: cached.length > 0 ? Math.min(...cached.map(c => c.cachedAt)) : null,
      newestCache: cached.length > 0 ? Math.max(...cached.map(c => c.cachedAt)) : null
    };
  }
}

export const bibleCache = new BibleCache();

// LocalStorage helper for favorites and reading progress
export const readingProgressStorage = {
  saveFavorite: (bookKey, chapter) => {
    const favorites = JSON.parse(localStorage.getItem('bibleFavorites') || '[]');
    const id = `${bookKey}-${chapter}`;
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem('bibleFavorites', JSON.stringify(favorites));
    }
  },

  removeFavorite: (bookKey, chapter) => {
    const favorites = JSON.parse(localStorage.getItem('bibleFavorites') || '[]');
    const id = `${bookKey}-${chapter}`;
    const updated = favorites.filter(f => f !== id);
    localStorage.setItem('bibleFavorites', JSON.stringify(updated));
  },

  getFavorites: () => {
    return JSON.parse(localStorage.getItem('bibleFavorites') || '[]');
  },

  isFavorite: (bookKey, chapter) => {
    const favorites = readingProgressStorage.getFavorites();
    return favorites.includes(`${bookKey}-${chapter}`);
  },

  saveProgress: (bookKey, chapter, verse = null) => {
    const progress = {
      bookKey,
      chapter,
      verse,
      timestamp: Date.now()
    };
    localStorage.setItem('lastReading', JSON.stringify(progress));
  },

  getLastReading: () => {
    return JSON.parse(localStorage.getItem('lastReading') || 'null');
  }
};