import React, { useState, useEffect } from 'react';
import { WifiOff, Download, CheckCircle2, Loader2 } from 'lucide-react';

const DB_NAME = 'FaithLightOffline';
const STORE = 'chapters';
const DB_VERSION = 2;

let _db = null;

async function getDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

async function isChapterCached(book, chapter, translation) {
  const key = `${translation}:${book}:${chapter}`;
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

async function cacheChapter(book, chapter, translation, verses) {
  const key = `${translation}:${book}:${chapter}`;
  const db = await getDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ key, book, chapter, translation, verses, cached_at: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

// Expose globally so BibleReader can call cacheChapter after loading verses
if (typeof window !== 'undefined') {
  window.faithlightChapterCache = { cacheChapter, isChapterCached };
}

/**
 * OfflineChapterIndicator
 * Shows a small badge in the reader header:
 *  - green wifi-off icon  → chapter is cached offline
 *  - download icon        → not cached, tap to save
 * 
 * Props: book (string), chapter (number), translation (string), verses (array, optional)
 */
export default function OfflineChapterIndicator({ book, chapter, translation = 'WEB', verses = [], isDarkMode }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'cached' | 'not_cached' | 'saving' | 'error'

  useEffect(() => {
    if (!book || !chapter) return;
    setStatus('checking');
    isChapterCached(book, chapter, translation)
      .then(cached => setStatus(cached ? 'cached' : 'not_cached'))
      .catch(() => setStatus('error'));
  }, [book, chapter, translation]);

  const handleDownload = async () => {
    if (status === 'saving' || status === 'cached') return;
    setStatus('saving');
    // If verses were passed in, use them; otherwise just mark as cached stub
    const ok = await cacheChapter(book, chapter, translation, verses);
    setStatus(ok ? 'cached' : 'error');
  };

  const iconColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const mutedColor = isDarkMode ? '#5A6A5C' : '#9CA3AF';

  if (status === 'checking') {
    return <Loader2 className="w-4 h-4 animate-spin" style={{ color: mutedColor }} />;
  }

  if (status === 'cached') {
    return (
      <span title="Available offline" className="flex items-center">
        <WifiOff className="w-4 h-4" style={{ color: iconColor }} />
      </span>
    );
  }

  if (status === 'saving') {
    return <Loader2 className="w-4 h-4 animate-spin" style={{ color: iconColor }} />;
  }

  // not_cached or error
  return (
    <button
      onClick={handleDownload}
      title="Save for offline reading"
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
      style={{ color: mutedColor, background: isDarkMode ? '#2A2F2C' : '#F3F4F6' }}
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Offline</span>
    </button>
  );
}