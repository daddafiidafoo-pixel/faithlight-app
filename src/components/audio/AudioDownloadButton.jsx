import React, { useState, useEffect } from 'react';
import { Download, Check, Loader2, WifiOff, Trash2 } from 'lucide-react';

const DB_NAME = 'faithlight_audio_offline';
const STORE_NAME = 'chapters';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
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

function makeKey(bookId, chapter, language) {
  return `${language}_${bookId}_${chapter}`;
}

export async function getOfflineAudio(bookId, chapter, language) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(makeKey(bookId, chapter, language));
    req.onsuccess = () => resolve(req.result?.blob ? URL.createObjectURL(req.result.blob) : null);
    req.onerror = () => reject(req.error);
  });
}

export default function AudioDownloadButton({ bookId, chapter, language = 'en', audioUrl, className = '' }) {
  const [status, setStatus] = useState('idle'); // idle | downloading | downloaded | error
  const key = makeKey(bookId, chapter, language);

  useEffect(() => {
    // Check if already downloaded
    openDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => setStatus(req.result ? 'downloaded' : 'idle');
    }).catch(() => {});
  }, [key]);

  const download = async () => {
    if (!audioUrl) return;
    setStatus('downloading');
    try {
      const res = await fetch(audioUrl);
      const blob = await res.blob();
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ key, blob, bookId, chapter, language, savedAt: Date.now() });
      await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
      setStatus('downloaded');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const remove = async () => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
    setStatus('idle');
  };

  if (status === 'downloaded') {
    return (
      <button
        onClick={remove}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors min-h-[36px] ${className}`}
        title="Downloaded for offline — tap to remove"
      >
        <Check size={13} />
        <span className="hidden sm:inline">Downloaded</span>
        <WifiOff size={11} className="opacity-60" />
      </button>
    );
  }

  if (status === 'downloading') {
    return (
      <button disabled className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold min-h-[36px] ${className}`}>
        <Loader2 size={13} className="animate-spin" />
        <span className="hidden sm:inline">Saving…</span>
      </button>
    );
  }

  return (
    <button
      onClick={download}
      disabled={!audioUrl}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 text-xs font-semibold border border-transparent hover:border-indigo-200 disabled:opacity-40 transition-colors min-h-[36px] ${className}`}
      title={audioUrl ? 'Download for offline listening' : 'Load audio first to download'}
    >
      <Download size={13} />
      <span className="hidden sm:inline">{status === 'error' ? 'Failed' : 'Download'}</span>
    </button>
  );
}