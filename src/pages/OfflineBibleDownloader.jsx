import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, Trash2, Wifi, WifiOff, BookOpen, CheckCircle, Loader2, HardDrive, RefreshCw } from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bibleBookNames';
import {
  cacheChapter, isChapterCached, listCachedChapters,
  deleteCachedChapter, clearAllCachedChapters, getStorageEstimate,
} from '@/lib/bibleOfflineCache';

const BIBLE_VERSIONS = [
  { id: 'kjv', label: 'King James Version', apiTranslation: 'kjv' },
  { id: 'web', label: 'World English Bible', apiTranslation: 'web' },
];

const BOOK_API_MAP = {
  GEN:'genesis',EXO:'exodus',LEV:'leviticus',NUM:'numbers',DEU:'deuteronomy',
  JOS:'joshua',JDG:'judges',RUT:'ruth','1SA':'1+samuel','2SA':'2+samuel',
  '1KI':'1+kings','2KI':'2+kings','1CH':'1+chronicles','2CH':'2+chronicles',
  EZR:'ezra',NEH:'nehemiah',EST:'esther',JOB:'job',PSA:'psalms',PRO:'proverbs',
  ECC:'ecclesiastes',SNG:'song+of+solomon',ISA:'isaiah',JER:'jeremiah',
  LAM:'lamentations',EZK:'ezekiel',DAN:'daniel',HOS:'hosea',JOL:'joel',
  AMO:'amos',OBA:'obadiah',JON:'jonah',MIC:'micah',NAH:'nahum',HAB:'habakkuk',
  ZEP:'zephaniah',HAG:'haggai',ZEC:'zechariah',MAL:'malachi',
  MAT:'matthew',MRK:'mark',LUK:'luke',JHN:'john',ACT:'acts',ROM:'romans',
  '1CO':'1+corinthians','2CO':'2+corinthians',GAL:'galatians',EPH:'ephesians',
  PHP:'philippians',COL:'colossians','1TH':'1+thessalonians','2TH':'2+thessalonians',
  '1TI':'1+timothy','2TI':'2+timothy',TIT:'titus',PHM:'philemon',HEB:'hebrews',
  JAS:'james','1PE':'1+peter','2PE':'2+peter','1JN':'1+john','2JN':'2+john',
  '3JN':'3+john',JUD:'jude',REV:'revelation',
};

const CHAPTER_COUNTS = Object.fromEntries(BIBLE_BOOKS.map(b => [b.book_id, b.chapters_count]));

async function fetchAndCacheBook(bibleId, apiTranslation, bookId, onProgress) {
  const apiBook = BOOK_API_MAP[bookId] || bookId.toLowerCase();
  const total = CHAPTER_COUNTS[bookId] || 1;
  let done = 0;
  for (let ch = 1; ch <= total; ch++) {
    const already = await isChapterCached(bibleId, bookId, ch);
    if (!already) {
      try {
        const resp = await fetch(`https://bible-api.com/${apiBook}+${ch}?translation=${apiTranslation}`);
        const json = await resp.json();
        if (json.verses?.length) {
          await cacheChapter(bibleId, bookId, ch, json.verses);
        }
      } catch { /* skip chapter */ }
    }
    done++;
    onProgress?.(done, total);
    // Small delay to avoid hammering the API
    await new Promise(r => setTimeout(r, 120));
  }
}

export default function OfflineBibleDownloader() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedVersion, setSelectedVersion] = useState(BIBLE_VERSIONS[0]);
  const [cachedChapters, setCachedChapters] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [downloading, setDownloading] = useState({}); // bookId → { current, total }
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, []);

  const refreshMeta = useCallback(async () => {
    setLoadingMeta(true);
    const [chapters, storage] = await Promise.all([listCachedChapters(), getStorageEstimate()]);
    setCachedChapters(chapters);
    setStorageInfo(storage);
    setLoadingMeta(false);
  }, []);

  useEffect(() => { refreshMeta(); }, [refreshMeta]);

  const cachedSet = new Set(cachedChapters.map(c => `${c.bibleId}::${c.bookId}::${c.chapter}`));
  const cachedBooks = {};
  cachedChapters.forEach(c => {
    if (c.bibleId !== selectedVersion.id) return;
    if (!cachedBooks[c.bookId]) cachedBooks[c.bookId] = 0;
    cachedBooks[c.bookId]++;
  });

  const handleDownloadBook = async (book) => {
    if (downloading[book.book_id]) return;
    setDownloading(prev => ({ ...prev, [book.book_id]: { current: 0, total: CHAPTER_COUNTS[book.book_id] || 1 } }));
    await fetchAndCacheBook(
      selectedVersion.id,
      selectedVersion.apiTranslation,
      book.book_id,
      (current, total) => setDownloading(prev => ({ ...prev, [book.book_id]: { current, total } }))
    );
    setDownloading(prev => { const n = { ...prev }; delete n[book.book_id]; return n; });
    await refreshMeta();
  };

  const handleDeleteBook = async (bookId) => {
    const total = CHAPTER_COUNTS[bookId] || 1;
    for (let ch = 1; ch <= total; ch++) {
      await deleteCachedChapter(selectedVersion.id, bookId, ch).catch(() => {});
    }
    await refreshMeta();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all offline Bible content?')) return;
    await clearAllCachedChapters();
    await refreshMeta();
  };

  const allBooks = [...BIBLE_BOOKS];
  const OT = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Moofaa');
  const NT = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Haaraa');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Offline Bible</h1>
          <p className="text-xs text-gray-500">Download chapters for offline reading</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Storage info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Storage Used</span>
            </div>
            <button onClick={refreshMeta} className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{cachedChapters.length}</p>
              <p className="text-xs text-gray-500">Chapters cached</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{Object.keys(cachedBooks).length}</p>
              <p className="text-xs text-gray-500">Books downloaded</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{storageInfo?.usageMB || '?'} MB</p>
              <p className="text-xs text-gray-500">Space used</p>
            </div>
          </div>
          {cachedChapters.length > 0 && (
            <button onClick={handleClearAll} className="w-full mt-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium flex items-center justify-center gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Clear All Downloads
            </button>
          )}
        </div>

        {/* Bible version */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Bible Version</p>
          <div className="grid grid-cols-2 gap-2">
            {BIBLE_VERSIONS.map(v => (
              <button key={v.id} onClick={() => setSelectedVersion(v)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${selectedVersion.id === v.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                <p className="font-semibold">{v.id.toUpperCase()}</p>
                <p className="text-xs opacity-70">{v.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Book list */}
        {[{ label: 'Old Testament', books: OT }, { label: 'New Testament', books: NT }].map(({ label, books }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {books.map(book => {
                const totalChaps = CHAPTER_COUNTS[book.book_id] || 1;
                const cachedCount = cachedBooks[book.book_id] || 0;
                const isFullyCached = cachedCount >= totalChaps;
                const dl = downloading[book.book_id];
                return (
                  <div key={book.book_id} className="flex items-center gap-3 px-4 py-3">
                    <BookOpen className={`w-4 h-4 shrink-0 ${isFullyCached ? 'text-green-500' : 'text-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{book.name_en}</p>
                      <p className="text-xs text-gray-400">
                        {dl ? `${dl.current}/${dl.total} chapters...` : isFullyCached ? 'Downloaded' : cachedCount > 0 ? `${cachedCount}/${totalChaps} chapters` : `${totalChaps} chapters`}
                      </p>
                      {dl && (
                        <div className="mt-1 h-1 rounded-full bg-gray-100">
                          <div className="h-1 rounded-full bg-purple-500 transition-all" style={{ width: `${(dl.current / dl.total) * 100}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {isFullyCached ? (
                        <button onClick={() => handleDeleteBook(book.book_id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      ) : dl ? (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50">
                          <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        </div>
                      ) : (
                        <button onClick={() => handleDownloadBook(book)} disabled={!isOnline}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 disabled:opacity-40">
                          <Download className="w-4 h-4 text-purple-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}