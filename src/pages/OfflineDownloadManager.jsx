import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { Download, Trash2, HardDrive, BookOpen, Check } from 'lucide-react';
import LoadingState from '@/components/states/LoadingState';
import ErrorState from '@/components/states/ErrorState';

// Sample Bible books list
const BIBLE_BOOKS = [
  { key: 'genesis', name: 'Genesis', chapters: 50 },
  { key: 'exodus', name: 'Exodus', chapters: 40 },
  { key: 'leviticus', name: 'Leviticus', chapters: 27 },
  { key: 'numbers', name: 'Numbers', chapters: 36 },
  { key: 'deuteronomy', name: 'Deuteronomy', chapters: 34 },
  { key: 'joshua', name: 'Joshua', chapters: 24 },
  { key: 'judges', name: 'Judges', chapters: 21 },
  { key: 'ruth', name: 'Ruth', chapters: 4 },
  { key: '1samuel', name: '1 Samuel', chapters: 31 },
  { key: '2samuel', name: '2 Samuel', chapters: 24 },
  { key: '1kings', name: '1 Kings', chapters: 22 },
  { key: '2kings', name: '2 Kings', chapters: 25 },
  { key: 'matthew', name: 'Matthew', chapters: 28 },
  { key: 'mark', name: 'Mark', chapters: 16 },
  { key: 'luke', name: 'Luke', chapters: 24 },
  { key: 'john', name: 'John', chapters: 21 },
  { key: 'acts', name: 'Acts', chapters: 28 },
  { key: 'romans', name: 'Romans', chapters: 16 },
  { key: '1corinthians', name: '1 Corinthians', chapters: 16 },
  { key: '2corinthians', name: '2 Corinthians', chapters: 13 },
];

export default function OfflineDownloadManager() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [downloaded, setDownloaded] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'downloaded'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) {
          setError(t('common.notAuthenticated', 'Please sign in'));
          setLoading(false);
          return;
        }

        const me = await base44.auth.me();
        setUser(me);

        // Fetch downloaded content
        const downloadedData = await base44.entities.DownloadedContent.filter(
          { user_id: me.id, is_cached_locally: true },
          '-downloaded_date',
          100
        );
        setDownloaded(downloadedData);
        setLoading(false);
      } catch (err) {
        console.error('[OfflineManager] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleSelectBook = (bookKey) => {
    const next = new Set(selectedBooks);
    if (next.has(bookKey)) {
      next.delete(bookKey);
    } else {
      next.add(bookKey);
    }
    setSelectedBooks(next);
  };

  const handleDownload = async () => {
    if (selectedBooks.size === 0) return;

    setDownloading(true);
    try {
      // Simulate download process
      const booksToDownload = BIBLE_BOOKS.filter(b => selectedBooks.has(b.key));

      for (const book of booksToDownload) {
        // Check if already downloaded
        const exists = downloaded.some(d => d.book_key === book.key);
        if (!exists) {
          await base44.entities.DownloadedContent.create({
            user_id: user.id,
            content_type: 'book',
            book_key: book.key,
            book_name: book.name,
            translation_code: 'WEB',
            file_size_mb: Math.round(book.chapters * 0.2), // Estimate
            downloaded_date: new Date().toISOString(),
            is_cached_locally: true
          });
        }
      }

      // Refresh list
      const updated = await base44.entities.DownloadedContent.filter(
        { user_id: user.id, is_cached_locally: true },
        '-downloaded_date',
        100
      );
      setDownloaded(updated);
      setSelectedBooks(new Set());
      setDownloading(false);
    } catch (err) {
      console.error('[OfflineManager] Download error:', err);
      setError(err.message);
      setDownloading(false);
    }
  };

  const handleDelete = async (contentId) => {
    try {
      await base44.entities.DownloadedContent.update(contentId, {
        is_cached_locally: false
      });

      const updated = await base44.entities.DownloadedContent.filter(
        { user_id: user.id, is_cached_locally: true },
        '-downloaded_date',
        100
      );
      setDownloaded(updated);
    } catch (err) {
      console.error('[OfflineManager] Delete error:', err);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const downloadedSize = downloaded.reduce((sum, d) => sum + (d.file_size_mb || 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('offline.library', 'Offline Library')}</h1>
        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span className="text-blue-900">{downloadedSize}MB</span>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'available'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          {t('offline.availableBooks', 'Available')}
        </button>
        <button
          onClick={() => setActiveTab('downloaded')}
          className={`px-4 py-2 font-bold border-b-2 transition-colors ${
            activeTab === 'downloaded'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          {t('offline.downloadedBooks', 'Downloaded')} ({downloaded.length})
        </button>
      </div>

      {/* ─── AVAILABLE BOOKS ─── */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {BIBLE_BOOKS.map((book) => {
              const isDownloaded = downloaded.some(d => d.book_key === book.key);
              const isSelected = selectedBooks.has(book.key);

              return (
                <button
                  key={book.key}
                  onClick={() => !isDownloaded && handleSelectBook(book.key)}
                  disabled={isDownloaded}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isDownloaded
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                      : isSelected
                        ? 'bg-indigo-100 border-indigo-600'
                        : 'bg-white border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{book.name}</p>
                      <p className="text-xs text-gray-600">{book.chapters} chapters</p>
                    </div>
                    {isDownloaded && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedBooks.size > 0 && (
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Download className="w-4 h-4" />
              {downloading
                ? t('common.downloading', 'Downloading...')
                : `${t('offline.download', 'Download')} ${selectedBooks.size} ${t('offline.books', 'books')}`}
            </Button>
          )}
        </div>
      )}

      {/* ─── DOWNLOADED BOOKS ─── */}
      {activeTab === 'downloaded' && (
        <div className="space-y-3">
          {downloaded.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <BookOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p>{t('offline.noDownloads', 'No books downloaded yet')}</p>
            </div>
          ) : (
            downloaded.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{item.book_name}</p>
                  <p className="text-xs text-gray-600">
                    {item.file_size_mb}MB · {new Date(item.downloaded_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}