/**
 * Offline Bible Cache Service
 * Manages IndexedDB storage for Bible chapters/books
 * Enables offline Bible reading with full translation support
 */

const DB_NAME = 'faithlight_bible_cache';
const DB_VERSION = 1;
const CHAPTERS_STORE = 'chapters';
const BOOKS_STORE = 'books';
const METADATA_STORE = 'metadata';

let db = null;

export async function initOfflineBibleDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Chapters store: bookId_chapterId as key
      if (!database.objectStoreNames.contains(CHAPTERS_STORE)) {
        const chaptersStore = database.createObjectStore(CHAPTERS_STORE, { keyPath: 'id' });
        chaptersStore.createIndex('bookId', 'bookId', { unique: false });
        chaptersStore.createIndex('language', 'language', { unique: false });
        chaptersStore.createIndex('downloaded', 'downloaded', { unique: false });
      }

      // Books store: bookId as key
      if (!database.objectStoreNames.contains(BOOKS_STORE)) {
        const booksStore = database.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
        booksStore.createIndex('language', 'language', { unique: false });
      }

      // Metadata store: tracking downloads, settings
      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };
  });
}

export async function cacheChapter(bookId, chapterId, chapterData, language = 'en') {
  if (!db) await initOfflineBibleDB();

  const id = `${bookId}_${chapterId}_${language}`;
  const chapter = {
    id,
    bookId,
    chapterId,
    language,
    content: chapterData,
    downloaded: new Date().toISOString(),
    size: JSON.stringify(chapterData).length,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHAPTERS_STORE], 'readwrite');
    const store = tx.objectStore(CHAPTERS_STORE);
    const request = store.put(chapter);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      updateMetadata('lastCached', new Date().toISOString());
      resolve(chapter);
    };
  });
}

export async function getChapter(bookId, chapterId, language = 'en') {
  if (!db) await initOfflineBibleDB();

  const id = `${bookId}_${chapterId}_${language}`;

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHAPTERS_STORE], 'readonly');
    const store = tx.objectStore(CHAPTERS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function cacheBook(bookId, bookData, language = 'en') {
  if (!db) await initOfflineBibleDB();

  const book = {
    id: `${bookId}_${language}`,
    bookId,
    language,
    name: bookData.name,
    chapterCount: bookData.chapterCount,
    downloaded: new Date().toISOString(),
    chapters: bookData.chapters || [], // Array of chapter data
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE], 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.put(book);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      updateMetadata('lastCached', new Date().toISOString());
      resolve(book);
    };
  });
}

export async function getBook(bookId, language = 'en') {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE], 'readonly');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.get(`${bookId}_${language}`);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getDownloadedChapters(bookId, language = 'en') {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHAPTERS_STORE], 'readonly');
    const store = tx.objectStore(CHAPTERS_STORE);
    const index = store.index('bookId');
    const request = index.getAll(bookId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const chapters = request.result.filter(ch => ch.language === language);
      resolve(chapters);
    };
  });
}

export async function deleteChapter(bookId, chapterId, language = 'en') {
  if (!db) await initOfflineBibleDB();

  const id = `${bookId}_${chapterId}_${language}`;

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHAPTERS_STORE], 'readwrite');
    const store = tx.objectStore(CHAPTERS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function deleteBook(bookId, language = 'en') {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([BOOKS_STORE], 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    const request = store.delete(`${bookId}_${language}`);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function getStorageSize() {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHAPTERS_STORE, BOOKS_STORE], 'readonly');
    let totalSize = 0;

    const chaptersStore = tx.objectStore(CHAPTERS_STORE);
    const chaptersRequest = chaptersStore.getAll();

    chaptersRequest.onerror = () => reject(chaptersRequest.error);
    chaptersRequest.onsuccess = () => {
      chaptersRequest.result.forEach(ch => {
        totalSize += ch.size || 0;
      });

      const booksStore = tx.objectStore(BOOKS_STORE);
      const booksRequest = booksStore.getAll();

      booksRequest.onerror = () => reject(booksRequest.error);
      booksRequest.onsuccess = () => {
        resolve({
          chapters: chaptersRequest.result.length,
          books: booksRequest.result.length,
          sizeInBytes: totalSize,
        });
      };
    };
  });
}

export async function clearAllOfflineData() {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([CHAPTERS_STORE, BOOKS_STORE, METADATA_STORE], 'readwrite');

    const chaptersRequest = tx.objectStore(CHAPTERS_STORE).clear();
    const booksRequest = tx.objectStore(BOOKS_STORE).clear();

    chaptersRequest.onerror = () => reject(chaptersRequest.error);
    booksRequest.onerror = () => reject(booksRequest.error);

    tx.oncomplete = () => resolve(true);
  });
}

async function updateMetadata(key, value) {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([METADATA_STORE], 'readwrite');
    const store = tx.objectStore(METADATA_STORE);
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}

export async function getMetadata(key) {
  if (!db) await initOfflineBibleDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([METADATA_STORE], 'readonly');
    const store = tx.objectStore(METADATA_STORE);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value || null);
  });
}