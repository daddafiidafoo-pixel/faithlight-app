/**
 * Offline Pack Manager
 * Handles downloading, installing, and managing offline Bible packs
 */

import { base44 } from '@/api/base44Client';

/**
 * Get all available packs from database
 */
export async function getAvailablePacks() {
  try {
    const packs = await base44.asServiceRole.entities.OfflineBiblePack.filter({
      isActive: true,
    });
    return packs || [];
  } catch (error) {
    console.error('Error fetching packs:', error);
    return [];
  }
}

/**
 * Get packs for a specific language
 */
export async function getPacksForLanguage(languageCode) {
  try {
    const packs = await base44.asServiceRole.entities.OfflineBiblePack.filter({
      language: languageCode,
      isActive: true,
    });
    return packs || [];
  } catch (error) {
    console.error('Error fetching packs for language:', error);
    return [];
  }
}

/**
 * Get a specific pack by version ID
 */
export async function getPack(versionId) {
  try {
    const packs = await base44.asServiceRole.entities.OfflineBiblePack.filter({
      versionId,
      isActive: true,
    }, null, 1);
    return packs?.[0] || null;
  } catch (error) {
    console.error('Error fetching pack:', error);
    return null;
  }
}

/**
 * Register a newly generated pack in database
 */
export async function registerPack(metadata, downloadUrl, audioDownloadUrl = null) {
  try {
    const pack = await base44.asServiceRole.entities.OfflineBiblePack.create({
      versionId: metadata.versionId,
      versionName: metadata.versionName,
      language: metadata.language,
      languageName: metadata.languageName,
      provider: 'biblebrain',
      books: metadata.books,
      chapters: metadata.chapters,
      verses: metadata.verses,
      packSizeMB: metadata.packSizeMB,
      downloadUrl,
      audioDownloadUrl,
      generatedAt: metadata.generatedAt,
      isActive: true,
    });
    return pack;
  } catch (error) {
    console.error('Error registering pack:', error);
    return null;
  }
}

/**
 * Download and install pack locally
 * Returns true on success, false on failure
 */
export async function downloadAndInstallPack(pack, onProgress = null) {
  try {
    if (!pack.downloadUrl) {
      throw new Error('Pack has no download URL');
    }

    // Fetch pack ZIP
    const response = await fetch(pack.downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    // Get total size for progress tracking
    const totalSize = parseInt(response.headers.get('content-length'), 10);
    let downloadedSize = 0;

    // Stream the response
    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      downloadedSize += value.length;

      if (onProgress) {
        const progress = Math.round((downloadedSize / totalSize) * 100);
        onProgress(progress);
      }
    }

    // Combine chunks into single Uint8Array
    const totalChunks = chunks.reduce((acc, val) => acc + val.length, 0);
    const result = new Uint8Array(totalChunks);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    // Store in IndexedDB
    await savePackToIndexedDB(pack.versionId, result);

    console.log(`Pack installed: ${pack.versionId}`);
    return true;
  } catch (error) {
    console.error('Error downloading pack:', error);
    return false;
  }
}

/**
 * Save pack ZIP to IndexedDB
 */
async function savePackToIndexedDB(versionId, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('faithlight_offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('offline_packs', 'readwrite');
      const store = tx.objectStore('offline_packs');
      
      store.put({
        versionId,
        data,
        installedAt: new Date().toISOString(),
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline_packs')) {
        db.createObjectStore('offline_packs', { keyPath: 'versionId' });
      }
    };
  });
}

/**
 * Check if pack is installed locally
 */
export async function isPackInstalled(versionId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('faithlight_offline', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('offline_packs', 'readonly');
      const store = tx.objectStore('offline_packs');
      const query = store.get(versionId);

      query.onsuccess = () => {
        resolve(!!query.result);
      };
      query.onerror = () => resolve(false);
    };
    request.onerror = () => resolve(false);
  });
}

/**
 * Get installed pack data
 */
export async function getInstalledPack(versionId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('faithlight_offline', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('offline_packs', 'readonly');
      const store = tx.objectStore('offline_packs');
      const query = store.get(versionId);

      query.onsuccess = () => {
        resolve(query.result || null);
      };
      query.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}

/**
 * Delete installed pack
 */
export async function deleteInstalledPack(versionId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('faithlight_offline', 1);

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('offline_packs', 'readwrite');
      const store = tx.objectStore('offline_packs');
      
      store.delete(versionId);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    };
    request.onerror = () => resolve(false);
  });
}