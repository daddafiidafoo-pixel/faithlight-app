import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, Loader2, HardDrive, Trash2, WifiOff, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

const OT_BOOKS = BIBLE_BOOKS.slice(0, 39);
const NT_BOOKS = BIBLE_BOOKS.slice(39);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getBookKey(translation, book) {
  return `offline_book_${translation}_${book}`;
}

function isBookDownloaded(translation, book) {
  return !!localStorage.getItem(getBookKey(translation, book));
}

function getDownloadedSize(translation, book) {
  const data = localStorage.getItem(getBookKey(translation, book));
  return data ? new Blob([data]).size : 0;
}

function deleteBook(translation, book) {
  localStorage.removeItem(getBookKey(translation, book));
}

// ── Single Book Row ───────────────────────────────────────────────────────────
function BookRow({ book, translation, onToggle }) {
  const [downloaded, setDownloaded] = useState(() => isBookDownloaded(translation, book));
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Try StructuredBibleVerse first
      const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
      let verses = await base44.entities.StructuredBibleVerse.filter({
        translation_abbrev: translation,
        book_order: bookOrder,
      }, 'verse', 2000).catch(() => []);

      // Fallback to BibleVerse
      if (verses.length === 0) {
        verses = await base44.entities.BibleVerse.filter({ book, translation }, 'verse', 2000).catch(() => []);
      }
      if (verses.length === 0) {
        verses = await base44.entities.BibleVerse.filter({ book }, 'verse', 2000).catch(() => []);
      }

      if (verses.length === 0) {
        toast.error(`No verses found for ${book} in ${translation}`);
        setLoading(false);
        return;
      }

      localStorage.setItem(getBookKey(translation, book), JSON.stringify(verses));
      setDownloaded(true);
      toast.success(`${book} downloaded (${verses.length} verses)`);
      onToggle?.();
    } catch (e) {
      toast.error('Download failed: ' + e.message);
    }
    setLoading(false);
  };

  const handleDelete = () => {
    deleteBook(translation, book);
    setDownloaded(false);
    onToggle?.();
    toast.success(`${book} removed from offline storage`);
  };

  const size = downloaded ? formatBytes(getDownloadedSize(translation, book)) : null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        {downloaded ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <BookOpen className="w-4 h-4 text-gray-300 shrink-0" />}
        <span className={`text-sm ${downloaded ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{book}</span>
        {downloaded && size && <span className="text-xs text-gray-400">{size}</span>}
      </div>
      {downloaded ? (
        <Button size="sm" variant="ghost" onClick={handleDelete} className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 text-xs">
          <Trash2 className="w-3 h-3" /> Remove
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={handleDownload} disabled={loading} className="h-7 text-indigo-600 hover:bg-indigo-50 gap-1 text-xs">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {loading ? 'Downloading…' : 'Download'}
        </Button>
      )}
    </div>
  );
}

// ── Testament Section ─────────────────────────────────────────────────────────
function TestamentSection({ title, books, translation, onToggle, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const downloadedCount = books.filter(b => isBookDownloaded(translation, b)).length;

  const downloadAll = async () => {
    for (const book of books) {
      if (!isBookDownloaded(translation, book)) {
        const key = getBookKey(translation, book);
        const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
        let verses = await base44.entities.StructuredBibleVerse.filter({ translation_abbrev: translation, book_order: bookOrder }, 'verse', 2000).catch(() => []);
        if (verses.length === 0) verses = await base44.entities.BibleVerse.filter({ book, translation }, 'verse', 2000).catch(() => []);
        if (verses.length > 0) localStorage.setItem(key, JSON.stringify(verses));
      }
    }
    onToggle?.();
    toast.success(`${title} downloaded!`);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-3">
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          <span className="font-semibold text-gray-800">{title}</span>
          <Badge variant="outline" className="text-xs">{downloadedCount}/{books.length} downloaded</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadAll(); }} className="text-xs gap-1 h-7">
          <Download className="w-3 h-3" /> Download All
        </Button>
      </div>
      {open && (
        <div className="px-4 py-2">
          {books.map(book => <BookRow key={book} book={book} translation={translation} onToggle={onToggle} />)}
        </div>
      )}
    </div>
  );
}

// ── Storage Summary ───────────────────────────────────────────────────────────
function StorageSummary({ translation, refreshKey }) {
  const downloadedBooks = BIBLE_BOOKS.filter(b => isBookDownloaded(translation, b));
  const totalSize = downloadedBooks.reduce((acc, b) => acc + getDownloadedSize(translation, b), 0);

  const clearAll = () => {
    downloadedBooks.forEach(b => deleteBook(translation, b));
    toast.success('All offline content removed');
  };

  return (
    <div className="bg-indigo-50 rounded-xl p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">{downloadedBooks.length} books downloaded</p>
          <p className="text-xs text-indigo-500">{formatBytes(totalSize)} used · {translation}</p>
        </div>
      </div>
      {downloadedBooks.length > 0 && (
        <Button size="sm" variant="outline" onClick={clearAll} className="text-red-500 border-red-200 hover:bg-red-50 gap-1 text-xs">
          <Trash2 className="w-3 h-3" /> Clear All
        </Button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OfflineBookDownloader({ translation = 'WEB' }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <WifiOff className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-900">Offline Bible Library</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">Download books for offline reading. Downloaded content is stored on your device.</p>

      <StorageSummary translation={translation} refreshKey={refreshKey} />

      <TestamentSection title="Old Testament" books={OT_BOOKS} translation={translation} onToggle={refresh} defaultOpen={false} />
      <TestamentSection title="New Testament" books={NT_BOOKS} translation={translation} onToggle={refresh} defaultOpen={true} />
    </div>
  );
}