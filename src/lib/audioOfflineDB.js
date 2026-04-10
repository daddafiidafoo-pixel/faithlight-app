// IndexedDB service for caching Bible audio chapters offline

const DB_NAME = 'fl_audio_offline';
const DB_VERSION = 1;
const STORE_NAME = 'chapters';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function getChapterKey(book, chapter, translation) {
  return `${book}_${chapter}_${translation}`;
}

export async function saveChapterAudio(book, chapter, translation, audioUrl) {
  const response = await fetch(audioUrl);
  if (!response.ok) throw new Error('Failed to fetch audio');
  const blob = await response.blob();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      key: getChapterKey(book, chapter, translation),
      book,
      chapter,
      translation,
      blob,
      savedAt: new Date().toISOString(),
      size: blob.size,
    });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getChapterAudioBlob(book, chapter, translation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(getChapterKey(book, chapter, translation));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function isChapterDownloaded(book, chapter, translation) {
  const entry = await getChapterAudioBlob(book, chapter, translation);
  return !!entry;
}

export async function deleteChapterAudio(book, chapter, translation) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(getChapterKey(book, chapter, translation));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllDownloadedChapters() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result.map(r => ({ ...r, blob: undefined })));
    req.onerror = () => reject(req.error);
  });
}

export async function getTotalStorageUsed() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const total = req.result.reduce((sum, r) => sum + (r.size || 0), 0);
      resolve(total);
    };
    req.onerror = () => reject(req.error);
  });
}

export function getBlobURL(blob) {
  return URL.createObjectURL(blob);
}