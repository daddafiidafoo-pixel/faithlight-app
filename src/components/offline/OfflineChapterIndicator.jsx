import React, { useState, useEffect } from 'react';
import { Check, Download, AlertCircle } from 'lucide-react';
import { coreTranslations, getTranslation } from '@/components/i18n/coreTranslations';

export default function OfflineChapterIndicator({ bookId, chapter, language = 'en', isConnected }) {
  const [status, setStatus] = useState('unknown');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    checkOfflineStatus();
  }, [bookId, chapter, language]);

  const checkOfflineStatus = async () => {
    try {
      const db = await openIndexedDB('FaithLightOffline');
      const tx = db.transaction('chapters', 'readonly');
      const store = tx.objectStore('chapters');
      const key = `${language}-${bookId}-${chapter}`;
      const request = store.get(key);
      
      request.onsuccess = () => {
        setStatus(request.result ? 'downloaded' : 'notAvailable');
      };
    } catch {
      setStatus('notAvailable');
    }
  };

  const openIndexedDB = (dbName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const handleDownload = async () => {
    if (isDownloading || status === 'downloaded') return;
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/chapters/${language}/${bookId}/${chapter}`);
      if (response.ok) {
        const data = await response.json();
        const db = await openIndexedDB('FaithLightOffline');
        const tx = db.transaction('chapters', 'readwrite');
        const store = tx.objectStore('chapters');
        const key = `${language}-${bookId}-${chapter}`;
        store.put({ id: key, data, timestamp: Date.now() });
        setStatus('downloaded');
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const t = (key) => getTranslation(coreTranslations, language, key);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      isConnected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
    }`}>
      {status === 'downloaded' ? (
        <>
          <Check className="w-4 h-4" />
          <span>{t('offline.available')}</span>
        </>
      ) : status === 'notAvailable' && !isConnected ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>{t('offline.notAvailable')}</span>
        </>
      ) : status === 'notAvailable' && isConnected ? (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 hover:opacity-70 disabled:opacity-50 transition"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? t('offline.downloading') : 'Download for offline'}</span>
        </button>
      ) : null}
    </div>
  );
}