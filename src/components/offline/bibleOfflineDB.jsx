/**
 * Bible Offline DB
 * ────────────────
 * IndexedDB wrapper for persisting Bible chapters and verses locally.
 * Works completely offline once data is saved.
 *
 * Stores:
 *   chapters  — { key: "book:chapter:lang", data: [...verses], savedAt }
 *   metadata  — { key: "download_index", list: [{book,chapter,lang,title,savedAt}] }
 */

const DB_NAME    = 'faithlight-bible';
const DB_VERSION = 1;
const STORE_CHAPTERS  = 'chapters';
const STORE_METADATA  = 'metadata';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
      }
    };
    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = ()  => reject(req.error);
  });
}

function tx(storeName, mode = 'readonly') {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function promisify(req) {
  return new Promise((res, rej) => {
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

// ── Chapter storage ──────────────────────────────────────────

export function chapterKey(bookCode, chapter, lang) {
  return `${bookCode}:${chapter}:${lang}`;
}

export async function saveChapter(bookCode, chapterNum, lang, title, verses) {
  const key = chapterKey(bookCode, chapterNum, lang);
  const store = await tx(STORE_CHAPTERS, 'readwrite');
  await promisify(store.put({ key, bookCode, chapterNum, lang, title, verses, savedAt: Date.now() }));
  await updateDownloadIndex(bookCode, chapterNum, lang, title);
}

export async function loadChapter(bookCode, chapterNum, lang) {
  const store = await tx(STORE_CHAPTERS);
  const result = await promisify(store.get(chapterKey(bookCode, chapterNum, lang)));
  return result || null;
}

export async function deleteChapter(bookCode, chapterNum, lang) {
  const key = chapterKey(bookCode, chapterNum, lang);
  const store = await tx(STORE_CHAPTERS, 'readwrite');
  await promisify(store.delete(key));
  await removeFromDownloadIndex(key);
}

export async function isChapterSaved(bookCode, chapterNum, lang) {
  const store = await tx(STORE_CHAPTERS);
  const result = await promisify(store.get(chapterKey(bookCode, chapterNum, lang)));
  return !!result;
}

// ── Download index (list of saved chapters) ──────────────────

async function getDownloadIndex() {
  const store = await tx(STORE_METADATA);
  const result = await promisify(store.get('download_index'));
  return result?.list || [];
}

async function updateDownloadIndex(bookCode, chapterNum, lang, title) {
  const list = await getDownloadIndex();
  const key  = chapterKey(bookCode, chapterNum, lang);
  const existing = list.findIndex((i) => i.key === key);
  const entry = { key, bookCode, chapterNum, lang, title, savedAt: Date.now() };
  if (existing >= 0) list[existing] = entry;
  else list.push(entry);
  const store = await tx(STORE_METADATA, 'readwrite');
  await promisify(store.put({ key: 'download_index', list }));
}

async function removeFromDownloadIndex(key) {
  const list  = await getDownloadIndex();
  const store = await tx(STORE_METADATA, 'readwrite');
  await promisify(store.put({ key: 'download_index', list: list.filter((i) => i.key !== key) }));
}

export async function getSavedChapterList() {
  return getDownloadIndex();
}

export async function clearAllOfflineData() {
  const [chStore, metaStore] = await Promise.all([
    tx(STORE_CHAPTERS, 'readwrite'),
    tx(STORE_METADATA, 'readwrite'),
  ]);
  await Promise.all([promisify(chStore.clear()), promisify(metaStore.clear())]);
}

export async function getStorageSizeEstimate() {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return {
    usedMB: ((usage || 0) / 1024 / 1024).toFixed(1),
    quotaMB: ((quota || 0) / 1024 / 1024).toFixed(0),
    percent: quota ? Math.round(((usage || 0) / quota) * 100) : 0,
  };
}