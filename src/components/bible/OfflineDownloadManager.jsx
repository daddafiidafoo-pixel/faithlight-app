import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Trash2, HardDrive, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';
import { offlineCacheService } from '@/components/lib/offlineBibleCacheService';

const BOOKS = [
  { key: 'genesis', name: 'Genesis', chapters: 50, testament: 'old' },
  { key: 'exodus', name: 'Exodus', chapters: 40, testament: 'old' },
  { key: 'leviticus', name: 'Leviticus', chapters: 27, testament: 'old' },
  { key: 'numbers', name: 'Numbers', chapters: 36, testament: 'old' },
  { key: 'psalms', name: 'Psalms', chapters: 150, testament: 'old' },
  { key: 'matthew', name: 'Matthew', chapters: 28, testament: 'new' },
  { key: 'mark', name: 'Mark', chapters: 16, testament: 'new' },
  { key: 'luke', name: 'Luke', chapters: 24, testament: 'new' },
  { key: 'john', name: 'John', chapters: 21, testament: 'new' },
  { key: 'acts', name: 'Acts', chapters: 28, testament: 'new' },
  { key: 'romans', name: 'Romans', chapters: 16, testament: 'new' },
  { key: 'corinthians', name: '1 Corinthians', chapters: 16, testament: 'new' },
  // Add more books as needed
];

export default function OfflineDownloadManager() {
  const { t, lang } = useI18n();
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const [cachedBooks, setCachedBooks] = useState(new Set());

  useEffect(() => {
    initializeCache();
    checkCachedBooks();
  }, [lang]);

  const initializeCache = async () => {
    try {
      await offlineCacheService.init();
      const stats = await offlineCacheService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Cache initialization error:', error);
    }
  };

  const checkCachedBooks = async () => {
    const cached = new Set();
    for (const book of BOOKS) {
      const isCached = await offlineCacheService.isChapterCached(book.key, 1, lang);
      if (isCached) {
        cached.add(book.key);
      }
    }
    setCachedBooks(cached);
  };

  const handleDownloadBook = async (book) => {
    if (cachedBooks.has(book.key)) {
      // Already cached, remove it
      await offlineCacheService.clearLanguageCache(lang);
      setCachedBooks(new Set());
      return;
    }

    // Add to download queue
    const newQueue = Array.from({ length: book.chapters }, (_, i) => ({
      id: `${book.key}_${i + 1}`,
      bookKey: book.key,
      bookName: book.name,
      chapter: i + 1,
      total: book.chapters,
      status: 'pending',
    }));

    setDownloadQueue(prev => [...prev, ...newQueue]);
    processDownloadQueue([...newQueue]);
  };

  const processDownloadQueue = async (queue) => {
    if (downloading) return;
    setDownloading(true);

    for (const item of queue) {
      try {
        // Fetch verses for this chapter
        const verses = await base44.entities.StructuredBibleVerse.filter(
          {
            language_code: lang,
            book_key: item.bookKey,
            chapter: item.chapter,
          },
          'verse',
          1000
        );

        if (verses?.length) {
          // Cache the chapter
          await offlineCacheService.cacheChapter(
            item.bookKey,
            item.chapter,
            lang,
            verses
          );

          // Update status
          setDownloadQueue(prev =>
            prev.map(i =>
              i.id === item.id ? { ...i, status: 'completed' } : i
            )
          );
        }
      } catch (error) {
        console.error(`Error downloading ${item.bookName} ${item.chapter}:`, error);
        setDownloadQueue(prev =>
          prev.map(i =>
            i.id === item.id ? { ...i, status: 'error' } : i
          )
        );
      }
    }

    // Update cache stats
    const stats = await offlineCacheService.getCacheStats();
    setCacheStats(stats);
    
    // Refresh cached books list
    checkCachedBooks();
    setDownloading(false);
  };

  const handleClearCache = async () => {
    if (confirm(t('offline.confirmClear', 'Clear all cached Bible content?'))) {
      await offlineCacheService.clearLanguageCache(lang);
      setCachedBooks(new Set());
      setDownloadQueue([]);
      const stats = await offlineCacheService.getCacheStats();
      setCacheStats(stats);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cache Stats */}
      {cacheStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              {t('offline.cacheStats', 'Offline Storage')}
            </span>
          </div>
          <p className="text-sm text-blue-800">
            {(cacheStats.size / 1024 / 1024).toFixed(1)} MB / {(cacheStats.maxSize / 1024 / 1024).toFixed(0)} MB used
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${cacheStats.percentUsed}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Available Books */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">
          {t('offline.downloadBooks', 'Download Books for Offline')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BOOKS.map(book => (
            <button
              key={book.key}
              onClick={() => handleDownloadBook(book)}
              disabled={downloading}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                cachedBooks.has(book.key)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{book.name}</p>
                  <p className="text-xs text-gray-600">
                    {book.chapters} {t('offline.chapters', 'chapters')}
                  </p>
                </div>
                {cachedBooks.has(book.key) ? (
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <Download className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Download Progress */}
      {downloadQueue.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">
              {t('offline.downloadProgress', 'Download Progress')}
            </p>
            {downloading && <span className="text-xs text-gray-600 animate-pulse">Downloading...</span>}
          </div>

          {downloadQueue.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {item.bookName} {item.chapter}/{item.total}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                item.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : item.status === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Clear Cache Button */}
      {cachedBooks.size > 0 && (
        <Button
          variant="outline"
          onClick={handleClearCache}
          className="gap-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          {t('offline.clearCache', 'Clear All Cache')}
        </Button>
      )}

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">
          {t('offline.info', 'Download entire Bible books to read offline. Your reading progress syncs when you\'re back online.')}
        </p>
      </div>
    </div>
  );
}