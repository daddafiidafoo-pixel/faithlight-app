/**
 * Offline Audio Storage Manager
 * Manages downloading and storing Bible audio chapters in IndexedDB
 */

const DB_NAME = 'FaithLightAudioBible';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';
const METADATA_STORE = 'downloadMetadata';

class OfflineAudioStorage {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    if (this.initialized) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create audio files store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const audioStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          audioStore.createIndex('bookChapter', ['book', 'chapter'], { unique: true });
        }

        // Create metadata store (for download progress, timestamps, etc.)
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          const metadataStore = db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
          metadataStore.createIndex('bookChapter', ['book', 'chapter'], { unique: true });
        }
      };
    });
  }

  /**
   * Save audio file to IndexedDB
   */
  async saveAudioFile(book, chapter, audioBlob, translation, metadata = {}) {
    await this.init();

    const id = `${book}_${chapter}_${translation}`;
    const audioData = {
      id,
      book,
      chapter,
      translation,
      audioBlob,
      size: audioBlob.size,
      downloadedAt: new Date(),
      ...metadata
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(audioData);

      request.onerror = () => reject(new Error('Failed to save audio'));
      request.onsuccess = () => resolve(audioData);
    });
  }

  /**
   * Retrieve audio file from IndexedDB
   */
  async getAudioFile(book, chapter, translation) {
    await this.init();

    const id = `${book}_${chapter}_${translation}`;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(new Error('Failed to retrieve audio'));
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Check if audio file is downloaded
   */
  async isDownloaded(book, chapter, translation) {
    const file = await this.getAudioFile(book, chapter, translation);
    return !!file;
  }

  /**
   * Save download metadata
   */
  async saveDownloadMetadata(book, chapter, translation, metadata) {
    await this.init();

    const id = `${book}_${chapter}_${translation}`;
    const data = {
      id,
      book,
      chapter,
      translation,
      ...metadata,
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([METADATA_STORE], 'readwrite');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.put(data);

      request.onerror = () => reject(new Error('Failed to save metadata'));
      request.onsuccess = () => resolve(data);
    });
  }

  /**
   * Get download metadata
   */
  async getDownloadMetadata(book, chapter, translation) {
    await this.init();

    const id = `${book}_${chapter}_${translation}`;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([METADATA_STORE], 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.get(id);

      request.onerror = () => reject(new Error('Failed to retrieve metadata'));
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all downloaded files
   */
  async getAllDownloaded() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(new Error('Failed to retrieve downloads'));
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * Get all downloaded chapters for a book
   */
  async getDownloadedChapters(book, translation) {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('bookChapter');
      const range = IDBKeyRange.bound([book], [book, []]);
      const request = index.getAll(range);

      request.onerror = () => reject(new Error('Failed to retrieve chapters'));
      request.onsuccess = () => {
        const files = request.result.filter(f => f.translation === translation);
        resolve(files.map(f => f.chapter).sort((a, b) => a - b));
      };
    });
  }

  /**
   * Delete audio file
   */
  async deleteAudioFile(book, chapter, translation) {
    await this.init();

    const id = `${book}_${chapter}_${translation}`;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
      
      const audioStore = tx.objectStore(STORE_NAME);
      const metadataStore = tx.objectStore(METADATA_STORE);
      
      audioStore.delete(id);
      metadataStore.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to delete audio'));
    });
  }

  /**
   * Get storage usage
   */
  async getStorageUsage() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(new Error('Failed to calculate storage'));
      request.onsuccess = () => {
        const files = request.result;
        const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
        resolve({
          totalSize,
          fileCount: files.length,
          formattedSize: this._formatFileSize(totalSize)
        });
      };
    });
  }

  /**
   * Clear all stored audio
   */
  async clearAll() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
      
      const audioStore = tx.objectStore(STORE_NAME);
      const metadataStore = tx.objectStore(METADATA_STORE);
      
      audioStore.clear();
      metadataStore.clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('Failed to clear storage'));
    });
  }

  /**
   * Helper: Format file size
   */
  _formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new OfflineAudioStorage();