import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, CheckCircle2, Loader2, HardDrive, BookOpen, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
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

const CHAPTER_COUNTS = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,
  'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,
  '1 Chronicles':29,'2 Chronicles':36,'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,
  'Psalm':150,'Proverbs':31,'Ecclesiastes':12,'Song of Songs':8,'Isaiah':66,
  'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,'Hosea':14,'Joel':3,
  'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,
  'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,
  'Acts':28,'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,
  'Ephesians':6,'Philippians':4,'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,
  '1 Timothy':6,'2 Timothy':4,'Titus':3,'Philemon':1,'Hebrews':13,'James':5,
  '1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,'Jude':1,'Revelation':22
};

const TRANSLATIONS = [
  { id: 'WEB', label: 'World English Bible' },
  { id: 'KJV', label: 'King James Version' },
  { id: 'ESV', label: 'English Standard Version' },
];

function getStorageKey(book, translation) {
  return `offline_book_${translation}_${book}`;
}

function getDownloadedBooks(translation) {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(`offline_book_${translation}_`));
  return keys.map(k => k.replace(`offline_book_${translation}_`, ''));
}

function estimateSize(chapterCount) {
  // ~3KB per chapter avg
  return `~${Math.round(chapterCount * 3)}KB`;
}

export default function BibleBookDownloader() {
  const [translation, setTranslation] = useState('WEB');
  const [downloadedBooks, setDownloadedBooks] = useState([]);
  const [downloading, setDownloading] = useState(null); // { book, progress, total }
  const [expanded, setExpanded] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);

  const refreshDownloaded = useCallback(() => {
    setDownloadedBooks(getDownloadedBooks(translation));
    // Estimate storage
    let total = 0;
    for (const key in localStorage) {
      if (key.startsWith('offline_book_')) total += (localStorage[key]?.length || 0);
    }
    setStorageUsed(Math.round(total / 1024));
  }, [translation]);

  useEffect(() => { refreshDownloaded(); }, [translation, refreshDownloaded]);

  const downloadBook = async (book) => {
    const totalChapters = CHAPTER_COUNTS[book] || 1;
    setDownloading({ book, progress: 0, total: totalChapters });

    const allVerses = [];
    let failed = 0;

    for (let ch = 1; ch <= totalChapters; ch++) {
      try {
        const verses = await base44.entities.BibleVerse.filter(
          { translation_id: translation, book, chapter: ch },
          'verse', 200
        );
        allVerses.push(...verses);
        setDownloading({ book, progress: ch, total: totalChapters });
      } catch (e) {
        failed++;
      }
      // Small delay to avoid hammering the API
      await new Promise(r => setTimeout(r, 80));
    }

    if (allVerses.length > 0) {
      try {
        localStorage.setItem(getStorageKey(book, translation), JSON.stringify(allVerses));
        toast.success(`${book} downloaded (${allVerses.length} verses${failed > 0 ? `, ${failed} chapters failed` : ''})`);
      } catch (e) {
        toast.error('Storage full — please delete old books first');
      }
    } else {
      toast.error(`Could not download ${book}. Check your connection.`);
    }

    setDownloading(null);
    refreshDownloaded();
  };

  const deleteBook = (book) => {
    localStorage.removeItem(getStorageKey(book, translation));
    refreshDownloaded();
    toast.success(`${book} removed from offline storage`);
  };

  const isDownloaded = (book) => downloadedBooks.includes(book);
  const isDownloading = (book) => downloading?.book === book;
  const pct = downloading ? Math.round((downloading.progress / downloading.total) * 100) : 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-600" />
          <span className="font-semibold text-sm text-slate-800">Offline Library</span>
          {downloadedBooks.length > 0 && (
            <Badge className="bg-slate-100 text-slate-600 border-none text-xs">{downloadedBooks.length} books</Badge>
          )}
          {storageUsed > 0 && (
            <span className="text-xs text-gray-400">{storageUsed}KB used</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-4">
          {/* Translation selector */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-xs text-gray-500 font-medium">Translation:</label>
            <Select value={translation} onValueChange={setTranslation}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATIONS.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active download progress */}
          {downloading && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Downloading {downloading.book}…</span>
                <span className="text-xs text-indigo-500 ml-auto">{downloading.progress}/{downloading.total} chapters</span>
              </div>
              <Progress value={pct} className="h-2 [&>div]:bg-indigo-500" />
            </div>
          )}

          {/* Downloaded books section */}
          {downloadedBooks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Downloaded</h4>
              <div className="flex flex-wrap gap-2">
                {downloadedBooks.map(book => (
                  <div key={book} className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-800">{book}</span>
                    <button
                      onClick={() => deleteBook(book)}
                      className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Book list */}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">All Books</h4>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {BIBLE_BOOKS.map(book => {
              const downloaded = isDownloaded(book);
              const dlActive = isDownloading(book);
              const chapters = CHAPTER_COUNTS[book] || 1;
              return (
                <div key={book} className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${downloaded ? 'bg-green-50' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="flex items-center gap-2">
                    {downloaded
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      : <BookOpen className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    }
                    <span className="text-sm text-gray-700">{book}</span>
                    <span className="text-xs text-gray-400">{chapters} ch · {estimateSize(chapters)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {downloaded ? (
                      <button
                        onClick={() => deleteBook(book)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete from offline storage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => !downloading && downloadBook(book)}
                        disabled={!!downloading}
                        className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Download for offline"
                      >
                        {dlActive
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Download className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {storageUsed > 4000 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Storage getting full. Consider deleting books you don't need.
            </div>
          )}
        </div>
      )}
    </div>
  );
}