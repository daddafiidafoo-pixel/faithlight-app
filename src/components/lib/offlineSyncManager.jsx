import { base44 } from '@/api/base44Client';

/**
 * Offline Sync Manager - uses IndexedDB for local storage
 * Handles bookmarks, notes, and chapters for offline-first functionality
 */
class OfflineSyncManager {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.initPromise = this.init();
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FaithLightOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store for Bible chapters
        if (!db.objectStoreNames.contains('chapters')) {
          db.createObjectStore('chapters', { keyPath: 'id' });
        }
        
        // Store for bookmarks
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
        
        // Store for notes
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
        
        // Store for highlights
        if (!db.objectStoreNames.contains('highlights')) {
          db.createObjectStore('highlights', { keyPath: 'id' });
        }
        
        // Store for sync queue (items waiting to sync)
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Save chapter to offline storage
  async saveChapter(chapterData) {
    await this.initPromise;
    const transaction = this.db.transaction(['chapters'], 'readwrite');
    const store = transaction.objectStore('chapters');
    
    const id = `${chapterData.book_key}-${chapterData.chapter}`;
    return new Promise((resolve, reject) => {
      store.put({ id, ...chapterData, savedAt: Date.now() }).onsuccess = () => resolve(id);
      store.onerror = () => reject(store.error);
    });
  }

  // Get chapter from offline storage
  async getChapter(bookKey, chapter) {
    await this.initPromise;
    const transaction = this.db.transaction(['chapters'], 'readonly');
    const store = transaction.objectStore('chapters');
    const id = `${bookKey}-${chapter}`;
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save bookmark locally and queue for sync
  async addBookmark(verse) {
    await this.initPromise;
    const id = `${verse.book_key}-${verse.chapter}-${verse.verse}`;
    const transaction = this.db.transaction(['bookmarks', 'syncQueue'], 'readwrite');
    
    // Save to bookmarks
    const bookmarkStore = transaction.objectStore('bookmarks');
    bookmarkStore.put({ id, ...verse, saved: false });
    
    // Queue for sync
    const queueStore = transaction.objectStore('syncQueue');
    queueStore.add({ type: 'bookmark', data: verse, synced: false });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(id);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Save note locally and queue for sync
  async addNote(noteData) {
    await this.initPromise;
    const id = `note-${Date.now()}`;
    const transaction = this.db.transaction(['notes', 'syncQueue'], 'readwrite');
    
    const noteStore = transaction.objectStore('notes');
    noteStore.put({ id, ...noteData, saved: false });
    
    const queueStore = transaction.objectStore('syncQueue');
    queueStore.add({ type: 'note', data: noteData, synced: false });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(id);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get all items from sync queue
  async getSyncQueue() {
    await this.initPromise;
    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.filter(item => !item.synced));
      request.onerror = () => reject(request.error);
    });
  }

  // Mark sync item as synced
  async markSynced(queueId) {
    await this.initPromise;
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.get(queueId);
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          store.put(item);
        }
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Sync offline changes to cloud
  async syncToCloud() {
    if (!this.isOnline) return { synced: 0 };

    try {
      const queue = await this.getSyncQueue();
      if (queue.length === 0) return { synced: 0 };

      // Group by type
      const bookmarks = queue.filter(q => q.type === 'bookmark').map(q => q.data);
      const notes = queue.filter(q => q.type === 'note').map(q => q.data);

      // Push to cloud
      const response = await base44.functions.invoke('syncOfflineData', {
        action: 'push',
        data: { bookmarks, notes }
      });

      if (response.data?.success) {
        // Mark all as synced
        for (const item of queue) {
          await this.markSynced(item.id);
        }
        return { synced: queue.length };
      }
      
      return { synced: 0, error: 'Sync failed' };
    } catch (error) {
      console.warn('Cloud sync failed (will retry later):', error.message);
      return { synced: 0, error: error.message };
    }
  }

  // Fetch cloud data for offline access
  async syncFromCloud() {
    if (!this.isOnline) return { downloaded: 0 };

    try {
      const response = await base44.functions.invoke('syncOfflineData', {
        action: 'pull'
      });

      if (response.data?.success) {
        const { highlights, notes } = response.data.data;
        
        // Save to local storage
        for (const highlight of highlights) {
          await this.saveChapter(highlight);
        }
        for (const note of notes) {
          await this.addNote(note);
        }

        return { downloaded: highlights.length + notes.length };
      }

      return { downloaded: 0 };
    } catch (error) {
      console.warn('Cloud download failed:', error.message);
      return { downloaded: 0, error: error.message };
    }
  }

  // Handle online event
  handleOnline() {
    this.isOnline = true;
    console.log('App is online - syncing...');
    this.syncToCloud();
  }

  // Handle offline event
  handleOffline() {
    this.isOnline = false;
    console.log('App is offline - using local storage');
  }

  get online() {
    return this.isOnline;
  }
}

// Singleton instance
export const offlineSync = new OfflineSyncManager();