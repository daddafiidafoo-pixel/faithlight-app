const DB_NAME = 'faithlight-offline';
const DB_VERSION = 1;
const AUDIO_STORE = 'audioChapters';

/**
 * Open or create IndexedDB
 */
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save audio to IndexedDB
 */
export async function saveOfflineAudio(record) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve audio from IndexedDB
 */
export async function getOfflineAudio(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const req = tx.objectStore(AUDIO_STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove audio from IndexedDB
 */
export async function removeOfflineAudio(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Download and save audio chapter
 */
export async function downloadAudioChapter(params) {
  const res = await fetch(params.audioUrl);
  if (!res.ok) throw new Error('Failed to download audio');

  const audioBlob = await res.blob();
  const id = `${params.language_code}:${params.filesetId}:${params.bookId}:${params.chapter}`;

  await saveOfflineAudio({
    id,
    language_code: params.language_code,
    filesetId: params.filesetId,
    bookId: params.bookId,
    chapter: params.chapter,
    audioBlob,
    verseText: params.verseText,
    reference: params.reference,
    downloadedAt: new Date().toISOString(),
  });

  return id;
}

/**
 * Resolve audio source: offline or online
 */
export async function resolveAudioSource(params) {
  if (params.playOffline) {
    const offline = await getOfflineAudio(params.id);
    if (offline) {
      return URL.createObjectURL(offline.audioBlob);
    }
  }
  return params.onlineUrl;
}

/**
 * Check if audio is downloaded
 */
export async function isAudioDownloaded(id) {
  const record = await getOfflineAudio(id);
  return !!record;
}