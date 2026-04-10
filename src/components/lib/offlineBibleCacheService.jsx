// Offline Bible Caching Service
// Manages local storage caching for Bible chapters and reading plans

const DB_NAME = 'FaithLightBible';
const STORE_NAME = 'verses';
const CHAPTERS_STORE = 'chapters';
const READING_PLANS_STORE = 'readingPlans';
const CACHE_VERSION = 1;

class OfflineBibleCacheService {
  constructor() {
    this.db = null;
    this.cacheSize = 0;
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB limit
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, CACHE_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.checkCacheSize();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store for individual verses
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'verse_id' });
        }

        // Store for chapters (grouped by book and chapter)
        if (!db.objectStoreNames.contains(CHAPTERS_STORE)) {
          const chapterStore = db.createObjectStore(CHAPTERS_STORE, { keyPath: 'id' });
          chapterStore.createIndex('book_chapter', ['book_key', 'chapter'], { unique: true });
          chapterStore.createIndex('language', 'language_code', { unique: false });
        }

        // Store for reading plans
        if (!db.objectStoreNames.contains(READING_PLANS_STORE)) {
          db.createObjectStore(READING_PLANS_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  // Cache a single verse
  async cacheVerse(verse) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(verse);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.cacheSize += JSON.stringify(verse).length;
        resolve();
      };
    });
  }

  // Cache an entire chapter
  async cacheChapter(bookKey, chapter, language, verses) {
    if (!this.db) await this.init();

    const chapterData = {
      id: `${bookKey}_${chapter}_${language}`,
      book_key: bookKey,
      chapter,
      language_code: language,
      verses: verses.map(v => ({
        verse: v.verse,
        text: v.text,
      })),
      cachedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([CHAPTERS_STORE], 'readwrite');
      const store = tx.objectStore(CHAPTERS_STORE);
      const request = store.put(chapterData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.cacheSize += JSON.stringify(chapterData).length;
        this.trimCacheIfNeeded();
        resolve();
      };
    });
  }

  // Get cached chapter
  async getChapter(bookKey, chapter, language) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([CHAPTERS_STORE], 'readonly');
      const store = tx.objectStore(CHAPTERS_STORE);
      const request = store.get(`${bookKey}_${chapter}_${language}`);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Get all cached chapters for a book
  async getCachedChapters(bookKey, language) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([CHAPTERS_STORE], 'readonly');
      const store = tx.objectStore(CHAPTERS_STORE);
      const index = store.index('language');
      const request = index.getAll(language);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const chapters = request.result.filter(c => c.book_key === bookKey);
        resolve(chapters);
      };
    });
  }

  // Cache a reading plan
  async cacheReadingPlan(planId, planData) {
    if (!this.db) await this.init();

    const data = {
      id: planId,
      ...planData,
      cachedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([READING_PLANS_STORE], 'readwrite');
      const store = tx.objectStore(READING_PLANS_STORE);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Get cached reading plan
  async getReadingPlan(planId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([READING_PLANS_STORE], 'readonly');
      const store = tx.objectStore(READING_PLANS_STORE);
      const request = store.get(planId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Clear cache for a specific language
  async clearLanguageCache(language) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([CHAPTERS_STORE], 'readwrite');
      const store = tx.objectStore(CHAPTERS_STORE);
      const index = store.index('language');
      const request = index.openCursor(IDBKeyRange.only(language));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  // Check if a chapter is cached
  async isChapterCached(bookKey, chapter, language) {
    const cached = await this.getChapter(bookKey, chapter, language);
    return !!cached;
  }

  // Trim cache if it exceeds max size
  async trimCacheIfNeeded() {
    if (this.cacheSize > this.maxCacheSize) {
      // Remove oldest cached chapters
      if (!this.db) return;

      return new Promise((resolve) => {
        const tx = this.db.transaction([CHAPTERS_STORE], 'readwrite');
        const store = tx.objectStore(CHAPTERS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          const chapters = request.result.sort((a, b) => a.cachedAt - b.cachedAt);
          const toDelete = chapters.slice(0, Math.ceil(chapters.length * 0.2)); // Delete oldest 20%

          toDelete.forEach(ch => {
            const delRequest = store.delete(ch.id);
            delRequest.onsuccess = () => {
              this.cacheSize -= JSON.stringify(ch).length;
            };
          });

          resolve();
        };
      });
    }
  }

  // Check current cache size
  async checkCacheSize() {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const tx = this.db.transaction([CHAPTERS_STORE, STORE_NAME], 'readonly');
      const stores = [tx.objectStore(CHAPTERS_STORE), tx.objectStore(STORE_NAME)];
      let size = 0;

      stores.forEach(store => {
        const request = store.getAll();
        request.onsuccess = () => {
          size += request.result.reduce((acc, item) => acc + JSON.stringify(item).length, 0);
        };
      });

      resolve(size);
    });
  }

  // Get cache stats
  async getCacheStats() {
    const stats = {
      size: this.cacheSize,
      maxSize: this.maxCacheSize,
      percentUsed: (this.cacheSize / this.maxCacheSize) * 100,
    };
    return stats;
  }
}

export const offlineCacheService = new OfflineBibleCacheService();