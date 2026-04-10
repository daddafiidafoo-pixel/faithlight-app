// IndexedDB for sermon offline storage
const DB_NAME = 'faithlight_sermons';
const DB_VERSION = 1;
const STORE_NAME = 'generated_sermons';

let db = null;

// Initialize database
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
        store.createIndex('theme', 'theme', { unique: false });
      }
    };
  });
}

// Save sermon to offline storage
export async function saveSermonOffline(sermonData) {
  try {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const data = {
        ...sermonData,
        savedAt: new Date().toISOString(),
        id: sermonData.id || undefined,
      };

      const request = data.id ? store.put(data) : store.add(data);

      request.onsuccess = () => {
        resolve({ ...data, id: request.result });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SermonOfflineStorage] Save failed:', error);
    throw error;
  }
}

// Get all sermons from offline storage
export async function getOfflineSermons() {
  try {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SermonOfflineStorage] Get all failed:', error);
    return [];
  }
}

// Get sermon by ID
export async function getOfflineSermon(id) {
  try {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SermonOfflineStorage] Get by ID failed:', error);
    return null;
  }
}

// Delete sermon from offline storage
export async function deleteOfflineSermon(id) {
  try {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SermonOfflineStorage] Delete failed:', error);
    throw error;
  }
}

// Export sermon as JSON
export async function exportSermonAsJSON(sermon) {
  const dataStr = JSON.stringify(sermon, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sermon_${sermon.title.replace(/\s+/g, '_')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export sermon as PDF
export async function exportSermonAsPDF(sermon, title) {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(title, 10, 10);

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(sermon, 190);
    doc.text(lines, 10, 30);

    doc.save(`sermon_${title.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('[SermonOfflineStorage] PDF export failed:', error);
    throw error;
  }
}

// Get storage info
export async function getOfflineStorageInfo() {
  try {
    const sermons = await getOfflineSermons();
    const totalSize = sermons.reduce((sum, sermon) => {
      return sum + JSON.stringify(sermon).length;
    }, 0);

    return {
      count: sermons.length,
      sizeBytes: totalSize,
      sizeMB: (totalSize / 1024 / 1024).toFixed(2),
    };
  } catch (error) {
    console.error('[SermonOfflineStorage] Info retrieval failed:', error);
    return { count: 0, sizeBytes: 0, sizeMB: '0' };
  }
}

// Clear all sermons
export async function clearAllOfflineSermons() {
  try {
    if (!db) await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SermonOfflineStorage] Clear failed:', error);
    throw error;
  }
}