// Offline Cache Manager - Handles SW registration and cache syncing

const CACHE_VERSION = 'faithlight-v1';
const STORE_NAME = 'faithlight-data';

/**
 * Register service worker and set up offline caching
 */
export async function registerOfflineCache() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/offline-sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterOfflineCache() {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  registrations.forEach(reg => reg.unregister());
}

/**
 * Open IndexedDB for local caching
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORE_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('readingPlans')) {
        db.createObjectStore('readingPlans', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('highlights')) {
        db.createObjectStore('highlights', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('verses')) {
        db.createObjectStore('verses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Save data to offline cache
 */
export async function cacheData(storeName, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    if (Array.isArray(data)) {
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Cache error:', error);
    throw error;
  }
}

/**
 * Retrieve cached data
 */
export async function getCachedData(storeName, id = null) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = id ? store.get(id) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Retrieve cache error:', error);
    throw error;
  }
}

/**
 * Queue data for sync when offline
 */
export async function queueForSync(operation, storeName, data) {
  try {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    
    const queueItem = {
      operation, // 'create', 'update', 'delete'
      storeName,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    store.add(queueItem);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Queue sync error:', error);
    throw error;
  }
}

/**
 * Get all pending sync operations
 */
export async function getPendingSync() {
  try {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result.filter(item => !item.synced);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Get pending sync error:', error);
    return [];
  }
}

/**
 * Mark sync item as completed
 */
export async function markSynced(queueId) {
  try {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    const request = store.get(queueId);
    
    request.onsuccess = () => {
      const item = request.result;
      item.synced = true;
      store.put(item);
    };
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Mark synced error:', error);
    throw error;
  }
}

/**
 * Clear all offline cache
 */
export async function clearOfflineCache() {
  try {
    const db = await openDB();
    const stores = ['readingPlans', 'highlights', 'notes', 'bookmarks', 'verses', 'syncQueue'];
    
    stores.forEach(storeName => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
    });
    
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    throw error;
  }
}

/**
 * Check if app is online
 */
export function isOnline() {
  return navigator.onLine;
}