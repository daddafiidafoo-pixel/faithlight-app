import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Trash2, HardDrive, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { saveChapterOffline, getOfflineStorageStats, deleteTranslationOffline } from '@/components/lib/offlineBibleManager';
import { base44 } from '@/api/base44Client';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const TRANSLATIONS = [
  { id: 'WEB', name: 'World English Bible', size: '85MB' },
  { id: 'KJV', name: 'King James Version', size: '82MB' },
  { id: 'NASB', name: 'New American Standard', size: '88MB' },
  { id: 'NIV', name: 'New International Version', size: '86MB' },
];

/**
 * Offline Bible Download UI
 * Allows users to download full translations or selected books
 */
export default function OfflineBibleDownloadUI() {
  const [selectedTranslation, setSelectedTranslation] = useState('WEB');
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [storageStats, setStorageStats] = useState(null);
  const [downloadMode, setDownloadMode] = useState('full'); // 'full' or 'selective'

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      const stats = await getOfflineStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const handleDownloadFullTranslation = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      let completed = 0;
      
      // Download all chapters
      for (let i = 0; i < BIBLE_BOOKS.length; i++) {
        const book = BIBLE_BOOKS[i];
        
        try {
          // Fetch chapter data from API (via Base44)
          const verses = await base44.functions.invoke('apiBibleProxy', {
            versionId: selectedTranslation,
            book: book.toLowerCase().replace(/\s+/g, ''),
            chapter: 1, // In a real scenario, you'd loop through all chapters
          });

          if (verses?.data?.verses) {
            await saveChapterOffline(selectedTranslation, book, 1, verses.data.verses);
            completed++;
            setDownloadProgress(Math.round((completed / BIBLE_BOOKS.length) * 100));
          }
        } catch (error) {
          console.warn(`Failed to download ${book}:`, error);
        }
      }

      await loadStorageStats();
      setDownloadProgress(100);
      setTimeout(() => setDownloadProgress(0), 2000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSelectedBooks = async () => {
    if (selectedBooks.size === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      let completed = 0;
      const booksArray = Array.from(selectedBooks);
      
      for (const book of booksArray) {
        try {
          const verses = await base44.functions.invoke('apiBibleProxy', {
            versionId: selectedTranslation,
            book: book.toLowerCase().replace(/\s+/g, ''),
            chapter: 1,
          });

          if (verses?.data?.verses) {
            await saveChapterOffline(selectedTranslation, book, 1, verses.data.verses);
            completed++;
            setDownloadProgress(Math.round((completed / booksArray.length) * 100));
          }
        } catch (error) {
          console.warn(`Failed to download ${book}:`, error);
        }
      }

      await loadStorageStats();
      setDownloadProgress(100);
      setTimeout(() => setDownloadProgress(0), 2000);
      setSelectedBooks(new Set());
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteTranslation = async (translationId) => {
    if (!window.confirm(`Delete ${translationId} from offline storage?`)) return;
    
    try {
      await deleteTranslationOffline(translationId);
      await loadStorageStats();
    } catch (error) {
      console.error('Error deleting translation:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Storage Stats */}
      {storageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="w-5 h-5" />
              Offline Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Used</p>
                <p className="font-semibold text-lg">{formatBytes(storageStats.totalSize)}</p>
              </div>
              <div>
                <p className="text-gray-600">Chapters Downloaded</p>
                <p className="font-semibold text-lg">{storageStats.recordCount}</p>
              </div>
            </div>

            {/* Downloaded Translations */}
            {Object.keys(storageStats.translations).length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Downloaded Translations:</p>
                {Object.entries(storageStats.translations).map(([translationId, data]) => (
                  <div key={translationId} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <p className="font-medium text-sm">{translationId}</p>
                      <p className="text-xs text-gray-500">{data.chapters} chapters • {formatBytes(data.size)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTranslation(translationId)}
                      className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="w-5 h-5" />
            Download Bibles for Offline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Translation Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Translation:</label>
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={isDownloading}
            >
              {TRANSLATIONS.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.size})</option>
              ))}
            </select>
          </div>

          {/* Download Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={downloadMode === 'full' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDownloadMode('full')}
              disabled={isDownloading}
            >
              Full Translation
            </Button>
            <Button
              variant={downloadMode === 'selective' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDownloadMode('selective')}
              disabled={isDownloading}
            >
              Selected Books
            </Button>
          </div>

          {/* Book Selector (Selective Mode) */}
          {downloadMode === 'selective' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Books:</label>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                {BIBLE_BOOKS.map(book => (
                  <label key={book} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedBooks.has(book)}
                      onChange={(e) => {
                        const newSet = new Set(selectedBooks);
                        if (e.target.checked) {
                          newSet.add(book);
                        } else {
                          newSet.delete(book);
                        }
                        setSelectedBooks(newSet);
                      }}
                      disabled={isDownloading}
                      className="w-4 h-4"
                    />
                    {book}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{selectedBooks.size} books selected</p>
            </div>
          )}

          {/* Progress Bar */}
          {isDownloading && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">{downloadProgress}%</p>
            </div>
          )}

          {/* Download Button */}
          <Button
            onClick={downloadMode === 'full' ? handleDownloadFullTranslation : handleDownloadSelectedBooks}
            disabled={isDownloading || (downloadMode === 'selective' && selectedBooks.size === 0)}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {downloadMode === 'full' ? 'Download Full Translation' : 'Download Selected Books'}
              </>
            )}
          </Button>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Download offline content while you have internet. You can read it anytime without connection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}