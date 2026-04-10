import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, BookOpen, CheckCircle2, Trash2, WifiOff, Loader2, Search } from 'lucide-react';
import { BIBLE_BOOKS, getBookName } from '@/lib/bibleBookNames';

const DB_NAME = 'faithlight_offline';
const DB_VERSION = 1;
const STORE_CHAPTERS = 'chapters';
const STORE_PLANS = 'plans';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
        db.createObjectStore(STORE_CHAPTERS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_PLANS)) {
        db.createObjectStore(STORE_PLANS, { keyPath: 'id' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = reject;
  });
}

async function getAllChapters() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readonly');
    const store = tx.objectStore(STORE_CHAPTERS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = reject;
  });
}

async function deleteChapter(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    tx.objectStore(STORE_CHAPTERS).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

async function saveChapterToDB(lang, bookId, chapter, verses) {
  const db = await openDB();
  const key = `${lang}_${bookId}_${chapter}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    tx.objectStore(STORE_CHAPTERS).put({ key, lang, bookId, chapter, verses, savedAt: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

async function fetchChapterFromAPI(bookId, chapter) {
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
    '3JN':'3+john',JUD:'jude',REV:'revelation'
  };
  const book = BOOK_API_MAP[bookId] || bookId.toLowerCase();
  const resp = await fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`);
  if (!resp.ok) throw new Error('Fetch failed');
  const json = await resp.json();
  return json.verses || [];
}

const POPULAR_BOOKS = ['JHN', 'PSA', 'PRO', 'MAT', 'ROM', 'GEN', 'ISA', 'LUK', 'ACT', 'REV'];

export default function OfflineLibraryPage() {
  const [savedChapters, setSavedChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('saved'); // saved | download
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const all = await getAllChapters();
      setSavedChapters(all.sort((a, b) => b.savedAt - a.savedAt));
    } catch {}
    setLoading(false);
  };

  const handleDownload = async (bookId, chapter) => {
    const key = `en_${bookId}_${chapter}`;
    if (downloading[key]) return;
    setDownloading(d => ({ ...d, [key]: true }));
    try {
      const verses = await fetchChapterFromAPI(bookId, chapter);
      await saveChapterToDB('en', bookId, chapter, verses);
      await loadSaved();
    } catch {
      alert('Download failed. Check your internet connection.');
    }
    setDownloading(d => { const n = { ...d }; delete n[key]; return n; });
  };

  const handleDelete = async (item) => {
    await deleteChapter(item.key);
    setSavedChapters(prev => prev.filter(c => c.key !== item.key));
  };

  const isSaved = (bookId, chapter) => savedChapters.some(c => c.bookId === bookId && c.chapter === chapter);

  const filteredBooks = POPULAR_BOOKS.map(id => BIBLE_BOOKS.find(b => b.book_id === id)).filter(Boolean)
    .filter(b => !search || b.name_en.toLowerCase().includes(search.toLowerCase()));

  const filteredSaved = savedChapters.filter(c => {
    if (!search) return true;
    const name = getBookName(c.bookId, 'en');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const totalSizeKB = Math.round(savedChapters.reduce((acc, c) => acc + JSON.stringify(c.verses || []).length, 0) / 1024);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => window.history.back()} className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Offline Library</h1>
            <p className="text-xs text-gray-400">{savedChapters.length} chapters saved · {totalSizeKB} KB</p>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-50 border border-orange-200">
              <WifiOff className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs text-orange-600 font-semibold">Offline</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[['saved', 'My Library'], ['download', 'Download More']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: tab === val ? '#fff' : 'transparent', color: tab === val ? '#7C3AED' : '#6B7280', boxShadow: tab === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search books..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">

        {/* SAVED TAB */}
        {tab === 'saved' && (
          <>
            {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>}

            {!loading && filteredSaved.length === 0 && (
              <div className="text-center py-20">
                <Download className="w-14 h-14 text-purple-200 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">No chapters saved yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-5">Download chapters to read offline</p>
                <button onClick={() => setTab('download')} className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-semibold text-sm">
                  Browse Downloads
                </button>
              </div>
            )}

            <div className="space-y-2">
              {filteredSaved.map(item => (
                <div key={item.key} className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{getBookName(item.bookId, 'en')} {item.chapter}</p>
                    <p className="text-xs text-gray-400">{item.verses?.length || 0} verses · Saved {new Date(item.savedAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(item)} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* DOWNLOAD TAB */}
        {tab === 'download' && (
          <>
            {!isOnline && (
              <div className="mb-4 p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-700 font-medium">You are offline. Connect to the internet to download chapters.</p>
              </div>
            )}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Popular Books</p>

            <div className="space-y-3">
              {filteredBooks.map(book => {
                const chapterCount = book.chapters_count || 1;
                const savedCount = savedChapters.filter(c => c.bookId === book.book_id).length;
                return (
                  <div key={book.book_id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{book.name_en}</p>
                        <p className="text-xs text-gray-400">{savedCount}/{chapterCount} chapters saved</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5">
                      {Array.from({ length: Math.min(chapterCount, 30) }, (_, i) => i + 1).map(ch => {
                        const key = `en_${book.book_id}_${ch}`;
                        const saved = isSaved(book.book_id, ch);
                        const dl = downloading[key];
                        return (
                          <button key={ch} onClick={() => !saved && isOnline && handleDownload(book.book_id, ch)}
                            disabled={saved || dl || !isOnline}
                            className="aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: saved ? '#DCFCE7' : dl ? '#EDE9FE' : '#F3F4F6',
                              color: saved ? '#16A34A' : dl ? '#7C3AED' : '#6B7280',
                            }}>
                            {dl ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3" /> : ch}
                          </button>
                        );
                      })}
                      {chapterCount > 30 && (
                        <div className="col-span-6 text-xs text-gray-400 text-center pt-1">
                          +{chapterCount - 30} more chapters — open in Bible Reader to download
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">No books match your search</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Export a helper so the BibleReaderPage's "Check" icon is importable too
function Check({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}