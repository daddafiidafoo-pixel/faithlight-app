import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import {
  cacheChapter,
  cacheBook,
  getDownloadedChapters,
  deleteChapter,
  deleteBook,
  getStorageSize,
  initOfflineBibleDB,
} from '../offline/offlineBibleCacheService';

export default function OfflineBibleDownloadManager() {
  const { lang, t } = useI18n();
  const [selectedBook, setSelectedBook] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadedChapters, setDownloadedChapters] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initOfflineBibleDB();
    loadDownloadedChapters();
    loadStorageInfo();
  }, [lang]);

  const loadDownloadedChapters = async () => {
    try {
      if (selectedBook) {
        const chapters = await getDownloadedChapters(selectedBook, lang);
        setDownloadedChapters(chapters);
      }
    } catch (err) {
      console.error('Error loading chapters:', err);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await getStorageSize();
      setStorageInfo(info);
    } catch (err) {
      console.error('Error getting storage info:', err);
    }
  };

  const downloadChapter = async (bookId, chapterId) => {
    const key = `${bookId}_${chapterId}`;
    setDownloadProgress((prev) => ({ ...prev, [key]: 'downloading' }));
    setError('');

    try {
      // Fetch chapter from API
      const response = await base44.functions.invoke('getBibleChapter', {
        bookId,
        chapterId,
        language: lang,
      });

      // Cache to IndexedDB
      await cacheChapter(bookId, chapterId, response, lang);

      setDownloadProgress((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });

      setDownloadedChapters((prev) => [
        ...prev,
        {
          id: key,
          bookId,
          chapterId,
          language: lang,
          content: response,
          downloaded: new Date().toISOString(),
        },
      ]);

      loadStorageInfo();
    } catch (err) {
      console.error('Download error:', err);
      setDownloadProgress((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      setError(`Failed to download chapter: ${err.message}`);
    }
  };

  const deleteOfflineChapter = async (bookId, chapterId) => {
    try {
      await deleteChapter(bookId, chapterId, lang);
      setDownloadedChapters((prev) =>
        prev.filter((ch) => !(ch.bookId === bookId && ch.chapterId === chapterId))
      );
      loadStorageInfo();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete chapter: ${err.message}`);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Storage Info */}
      {storageInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Offline Storage</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Chapters: {storageInfo.chapters}</p>
            <p>Total Size: {formatBytes(storageInfo.sizeInBytes)}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Downloaded Chapters */}
      {downloadedChapters.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Downloaded Chapters</h3>
          <div className="space-y-2">
            {downloadedChapters.map((chapter) => (
              <div
                key={`${chapter.bookId}_${chapter.chapterId}`}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {chapter.bookId} Chapter {chapter.chapterId}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteOfflineChapter(chapter.bookId, chapter.chapterId)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Instructions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-2">Download Bible Chapters</h3>
        <p className="text-sm text-indigo-800 mb-3">
          Select a book and chapters to download for offline reading in {lang.toUpperCase()}.
        </p>
        <Button
          onClick={() => setLoading(!loading)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Download className="w-4 h-4" />
          {loading ? 'Loading...' : 'Browse Books'}
        </Button>
      </div>
    </div>
  );
}