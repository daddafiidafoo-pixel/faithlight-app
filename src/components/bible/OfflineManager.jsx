import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HardDrive, Download, Trash2, Loader2, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
  'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

export default function OfflineManager() {
  const [open, setOpen] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedTranslation, setSelectedTranslation] = useState('WEB');
  const [storageStats, setStorageStats] = useState(null);

  // Load downloaded books from localStorage
  useEffect(() => {
    if (open) {
      loadDownloads();
    }
  }, [open]);

  const loadDownloads = () => {
    const downloaded = [];
    for (const book of BIBLE_BOOKS) {
      for (const translation of ['WEB', 'ASV']) {
        const key = `offline_book_${translation}_${book}`;
        if (localStorage.getItem(key)) {
          downloaded.push({ book, translation, key });
        }
      }
    }
    setDownloads(downloaded);
    
    // Calculate storage size
    let totalSize = 0;
    for (const item of downloaded) {
      const data = localStorage.getItem(item.key);
      if (data) totalSize += data.length;
    }
    setStorageStats({
      total_downloads: downloaded.length,
      storage_mb: (totalSize / 1024 / 1024).toFixed(2),
    });
  };

  const downloadBook = async (book, translation) => {
    try {
      setDownloading(`${book}_${translation}`);
      
      // Fetch all verses for this book/translation
      const verses = await base44.entities.BibleVerse.filter(
        { book, translation },
        'chapter',
        1000
      ).catch(() => []);

      if (verses.length === 0) {
        toast.error(`No verses found for ${book} (${translation})`);
        setDownloading(null);
        return;
      }

      // Save to localStorage (organized by book+translation)
      const key = `offline_book_${translation}_${book}`;
      localStorage.setItem(key, JSON.stringify(verses));
      
      toast.success(`Downloaded ${book} (${translation}) - ${verses.length} verses`);
      loadDownloads();
    } catch (error) {
      toast.error(`Failed to download ${book}`);
      console.error(error);
    } finally {
      setDownloading(null);
    }
  };

  const deleteDownload = (book, translation) => {
    const key = `offline_book_${translation}_${book}`;
    localStorage.removeItem(key);
    toast.success(`Deleted ${book} (${translation})`);
    loadDownloads();
  };

  const downloadChapter = async (book, chapter, translation) => {
    try {
      const key = `offline_book_${translation}_${book}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const verses = JSON.parse(stored);
        const chapterVerses = await base44.entities.BibleVerse.filter(
          { book, chapter: Number(chapter), translation },
          'verse',
          1000
        ).catch(() => []);
        
        const updated = verses.filter(v => v.chapter !== Number(chapter)).concat(chapterVerses);
        localStorage.setItem(key, JSON.stringify(updated));
        toast.success(`Updated ${book} ${chapter} (${translation})`);
        loadDownloads();
      } else {
        toast.info('Download the full book first');
      }
    } catch (error) {
      toast.error('Failed to update chapter');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <HardDrive className="w-4 h-4" />
        Offline
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Offline Bible Downloads</DialogTitle>
          </DialogHeader>

          {/* Storage Stats */}
          {storageStats && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm">
                <p className="font-semibold text-blue-900">📦 Storage: {storageStats.storage_mb} MB</p>
                <p className="text-blue-700">{storageStats.total_downloads} book(s) downloaded</p>
              </div>
            </div>
          )}

          {/* Download Section */}
          <div className="space-y-4 border-b pb-4">
            <h3 className="font-semibold text-sm">Download for Offline Reading</h3>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="border rounded p-2 text-sm"
              >
                {BIBLE_BOOKS.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
              
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="border rounded p-2 text-sm"
              >
                <option value="WEB">WEB (World English Bible)</option>
                <option value="ASV">ASV (American Standard)</option>
              </select>
            </div>

            <Button
              onClick={() => downloadBook(selectedBook, selectedTranslation)}
              disabled={downloading === `${selectedBook}_${selectedTranslation}`}
              className="w-full gap-2"
            >
              {downloading === `${selectedBook}_${selectedTranslation}` ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Book
                </>
              )}
            </Button>
          </div>

          {/* Downloaded Books List */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Downloaded Books</h3>
            {downloads.length === 0 ? (
              <p className="text-sm text-gray-500">No books downloaded yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {downloads.map((item) => (
                  <div
                    key={`${item.book}_${item.translation}`}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.book}</p>
                      <p className="text-xs text-gray-500">{item.translation} • {CHAPTER_COUNTS[item.book]} chapters</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDownload(item.book, item.translation)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Downloaded books use your device storage and stay available even when offline.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}