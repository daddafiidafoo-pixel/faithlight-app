/**
 * Sermon Offline Storage
 * Uses IndexedDB to store sermons locally
 */

const DB_NAME = 'faithlight_sermons';
const STORE_NAME = 'sermons';
const DB_VERSION = 1;

let db = null;

const initDB = () => {
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
      const store = event.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      store.createIndex('language', 'metadata.language', { unique: false });
      store.createIndex('type', 'metadata.type', { unique: false });
      store.createIndex('createdAt', 'metadata.generatedAt', { unique: false });
    };
  });
};

export const sermonOfflineDB = {
  async saveSermon(sermonData) {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({
        ...sermonData,
        savedAt: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getSermon(id) {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllSermons() {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result.reverse());
    });
  },

  async getSermonsByLanguage(language) {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('language');
      const request = index.getAll(language);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result.reverse());
    });
  },

  async deleteSermon(id) {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  },

  async clearAllSermons() {
    await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  },
};