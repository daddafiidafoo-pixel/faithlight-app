/**
 * Offline Bible Database
 * IndexedDB schema and operations for installed Bible packs
 */

const DB_NAME = 'faithlight_offline';
const DB_VERSION = 1;
const STORE_NAME = 'installedPacks';

/**
 * Open IndexedDB
 */
export function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'packId' });
        store.createIndex('by_language', 'languageCode', { unique: false });
        store.createIndex('by_type', 'type', { unique: false });
        store.createIndex('by_version', 'versionId', { unique: false });
        store.createIndex('by_status', 'status', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * List all installed packs
 */
export async function listInstalledPacks() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get installed pack by packId
 */
export async function getInstalledPack(packId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(packId);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save/update installed pack
 */
export async function upsertInstalledPack(pack) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({
      packId: pack.packId,
      type: pack.type,
      languageCode: pack.languageCode,
      versionId: pack.versionId,
      packVersion: pack.packVersion,
      contentHash: pack.contentHash,
      fileSizeBytes: pack.fileSizeBytes,
      installedAt: pack.installedAt || Date.now(),
      status: pack.status || 'installed',
      storageKey: pack.storageKey,
    });

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete installed pack
 */
export async function removeInstalledPack(packId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(packId);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Query packs by language
 */
export async function getPacksByLanguage(languageCode) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_language');
    const req = index.getAll(languageCode);

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Query packs by type (text, audio, study)
 */
export async function getPacksByType(type) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_type');
    const req = index.getAll(type);

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all installed packs (use with caution)
 */
export async function clearAllPacks() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}