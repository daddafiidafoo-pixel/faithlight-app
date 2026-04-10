import { openDB } from 'idb';

const DB_NAME = 'FaithLightOffline';
const AUDIO_STORE = 'audioFiles';
const TEXT_STORE = 'textContent';
const METADATA_STORE = 'metadata';

let db = null;

const getDB = async () => {
  if (db) return db;
  db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      // Audio files store
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
      }
      // Text content store
      if (!db.objectStoreNames.contains(TEXT_STORE)) {
        db.createObjectStore(TEXT_STORE, { keyPath: 'id' });
      }
      // Metadata store
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
      }
    }
  });
  return db;
};

const generateId = (language, translation, book, chapter) => {
  return `${language}_${translation}_${book}_${chapter}`;
};

// Save audio file locally
export const saveOfflineAudio = async (audioBlob, language, translation, book, chapter) => {
  const db = await getDB();
  const id = generateId(language, translation, book, chapter);
  const localPath = `offline://${id}.m4a`;
  
  const tx = db.transaction(AUDIO_STORE, 'readwrite');
  await tx.objectStore(AUDIO_STORE).put({
    id,
    language,
    translation,
    book,
    chapter,
    audioBlob,
    localPath,
    sizeBytes: audioBlob.size,
    downloadedAt: new Date().toISOString(),
    duration: 0
  });
  await tx.done;
  
  return { id, localPath, sizeBytes: audioBlob.size };
};

// Get offline audio
export const getOfflineAudio = async (language, translation, book, chapter) => {
  const db = await getDB();
  const id = generateId(language, translation, book, chapter);
  const tx = db.transaction(AUDIO_STORE, 'readonly');
  return await tx.objectStore(AUDIO_STORE).get(id);
};

// Save text content
export const saveOfflineText = async (text, language, translation, book, chapter) => {
  const db = await getDB();
  const id = generateId(language, translation, book, chapter);
  
  const tx = db.transaction(TEXT_STORE, 'readwrite');
  await tx.objectStore(TEXT_STORE).put({
    id,
    language,
    translation,
    book,
    chapter,
    text,
    downloadedAt: new Date().toISOString()
  });
  await tx.done;
};

// Get offline text
export const getOfflineText = async (language, translation, book, chapter) => {
  const db = await getDB();
  const id = generateId(language, translation, book, chapter);
  const tx = db.transaction(TEXT_STORE, 'readonly');
  return await tx.objectStore(TEXT_STORE).get(id);
};

// Check if chapter is downloaded
export const isChapterOffline = async (language, translation, book, chapter) => {
  const audio = await getOfflineAudio(language, translation, book, chapter);
  return !!audio;
};

// Get all downloads for language/translation
export const getOfflineDownloads = async (language, translation = null) => {
  const db = await getDB();
  const tx = db.transaction(AUDIO_STORE, 'readonly');
  const allRecords = await tx.objectStore(AUDIO_STORE).getAll();
  
  return allRecords.filter(r => {
    if (r.language !== language) return false;
    if (translation && r.translation !== translation) return false;
    return true;
  });
};

// Delete offline chapter
export const deleteOfflineChapter = async (language, translation, book, chapter) => {
  const db = await getDB();
  const id = generateId(language, translation, book, chapter);
  
  const audioTx = db.transaction(AUDIO_STORE, 'readwrite');
  const textTx = db.transaction(TEXT_STORE, 'readwrite');
  
  const audioRecord = await audioTx.objectStore(AUDIO_STORE).get(id);
  const sizeFreed = audioRecord?.sizeBytes || 0;
  
  await audioTx.objectStore(AUDIO_STORE).delete(id);
  await textTx.objectStore(TEXT_STORE).delete(id);
  
  return sizeFreed;
};

// Delete all offline content
export const deleteAllOfflineContent = async () => {
  const db = await getDB();
  
  const audioTx = db.transaction(AUDIO_STORE, 'readwrite');
  const textTx = db.transaction(TEXT_STORE, 'readwrite');
  
  await audioTx.objectStore(AUDIO_STORE).clear();
  await textTx.objectStore(TEXT_STORE).clear();
};

// Get total storage used
export const getTotalOfflineSize = async () => {
  const db = await getDB();
  const tx = db.transaction(AUDIO_STORE, 'readonly');
  const records = await tx.objectStore(AUDIO_STORE).getAll();
  
  return records.reduce((total, record) => total + (record.sizeBytes || 0), 0);
};

// Get download count
export const getDownloadCount = async () => {
  const db = await getDB();
  const tx = db.transaction(AUDIO_STORE, 'readonly');
  const records = await tx.objectStore(AUDIO_STORE).getAll();
  return records.length;
};

// Create blob URL for offline audio
export const getOfflineAudioUrl = async (language, translation, book, chapter) => {
  const record = await getOfflineAudio(language, translation, book, chapter);
  if (!record || !record.audioBlob) return null;
  return URL.createObjectURL(record.audioBlob);
};