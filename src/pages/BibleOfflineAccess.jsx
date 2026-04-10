import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, Trash2, WifiOff, Wifi, BookOpen, HardDrive,
  CheckCircle2, Loader2, Search, X, SlidersHorizontal,
  Package, AlertCircle, ChevronDown, ChevronUp, Layers
} from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
];

const OT = BIBLE_BOOKS.slice(0, 39);
const NT = BIBLE_BOOKS.slice(39);

const TRANSLATIONS = ['WEB', 'ASV'];

const BULK_PACKS = [
  { id: 'nt', label: 'New Testament', description: '27 books', books: NT },
  { id: 'ot', label: 'Old Testament', description: '39 books', books: OT },
  { id: 'gospels', label: 'The Gospels', description: '4 books', books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { id: 'psalms_proverbs', label: 'Psalms & Proverbs', description: '2 books', books: ['Psalms', 'Proverbs'] },
  { id: 'pauline', label: "Paul's Letters", description: '13 books', books: ['Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon'] },
];

const formatBytes = (b) => {
  if (!b) return '0 KB';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
};

const OFFLINE_CACHE_KEY = 'fl_offline_search_cache';

function loadCache() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_CACHE_KEY) || '{}'); } catch { return {}; }
}
function saveCache(data) {
  localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(data));
}

// ── Bulk Download Progress ────────────────────────────────────────────────────

function BulkDownloadProgress({ progress }) {
  if (!progress) return null;
  const pct = Math.round((progress.done / progress.total) * 100);
  return (
    <div className="my-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-800">Downloading {progress.label}…</span>
        </div>
        <span className="text-sm font-bold text-indigo-700">{pct}%</span>
      </div>
      <div className="w-full bg-indigo-100 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-indigo-500 mt-1">{progress.current} • {progress.done}/{progress.total} books</p>
    </div>
  );
}

export default function BibleOfflineAccess() {
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [downloads, setDownloads] = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [loadingDownloads, setLoadingDownloads] = useState(true);
  const abortRef = useRef(false);

  // Offline search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTranslation, setSearchTranslation] = useState('WEB');
  const [offlineResults, setOfflineResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [cache, setCache] = useState(loadCache());

  const [filterText, setFilterText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      loadDownloads(u.id);
    }).catch(() => {});

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => { setIsOnline(false); setOfflineMode(true); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDownloads = async (uid) => {
    setLoadingDownloads(true);
    const data = await base44.entities.OfflineLibrary.filter(
      { user_id: uid, content_type: 'bible_book' },
      '-created_date'
    );
    setDownloads(data);
    setLoadingDownloads(false);
  };

  const isDownloaded = (book, translation) =>
    downloads.some(d => d.book_name === book && d.translation === translation);

  const downloadBook = async (book, translation, currentCache) => {
    const key = `${translation}::${book}`;
    if (currentCache[key]) return currentCache; // already cached

    const verses = await base44.entities.BibleVerse.filter({ book, translation }, 'verse', 1000);
    const updated = { ...currentCache, [key]: verses };
    saveCache(updated);

    if (user) {
      const alreadyInDB = await base44.entities.OfflineLibrary.filter(
        { user_id: user.id, content_type: 'bible_book', book_name: book, translation },
        '-created_date', 1
      ).then(r => r.length > 0).catch(() => false);

      if (!alreadyInDB) {
        await base44.entities.OfflineLibrary.create({
          user_id: user.id,
          content_type: 'bible_book',
          book_name: book,
          translation,
          title: `${book} (${translation})`,
          file_size_bytes: JSON.stringify(verses).length,
          status: 'downloaded',
        });
      }
    }
    return updated;
  };

  const handleDownload = async (book, translation) => {
    if (!user) return;
    setDownloading({ book, translation });
    const updated = await downloadBook(book, translation, cache);
    setCache(updated);
    await loadDownloads(user.id);
    setDownloading(null);
  };

  const handleBulkDownload = async (pack) => {
    if (!user) return;
    abortRef.current = false;
    let currentCache = { ...cache };

    const booksToDownload = pack.books.filter(b => !isDownloaded(b, searchTranslation));
    if (booksToDownload.length === 0) return;

    setBulkProgress({ label: pack.label, total: booksToDownload.length, done: 0, current: booksToDownload[0] });

    for (let i = 0; i < booksToDownload.length; i++) {
      if (abortRef.current) break;
      const book = booksToDownload[i];
      setBulkProgress(p => ({ ...p, current: book, done: i }));
      currentCache = await downloadBook(book, searchTranslation, currentCache);
      setBulkProgress(p => ({ ...p, done: i + 1 }));
    }

    setCache(currentCache);
    await loadDownloads(user.id);
    setBulkProgress(null);
  };

  const handleDelete = async (item) => {
    await base44.entities.OfflineLibrary.delete(item.id);
    const key = `${item.translation}::${item.book_name}`;
    const updated = { ...cache };
    delete updated[key];
    setCache(updated);
    saveCache(updated);
    await loadDownloads(user.id);
    setDeleteConfirm(null);
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    for (const d of downloads) {
      await base44.entities.OfflineLibrary.delete(d.id);
    }
    setCache({});
    saveCache({});
    await loadDownloads(user.id);
  };

  const handleOfflineSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const q = searchQuery.toLowerCase();
    const results = [];
    Object.entries(cache).forEach(([key, verses]) => {
      if (!key.startsWith(searchTranslation + '::')) return;
      (verses || []).forEach(v => {
        if (v.text && v.text.toLowerCase().includes(q)) {
          results.push({ ref: `${v.book} ${v.chapter}:${v.verse}`, text: v.text, translation: v.translation, book: v.book, chapter: v.chapter });
        }
      });
    });
    setOfflineResults(results.slice(0, 50));
    setSearching(false);
  };

  const storageUsed = downloads.reduce((s, d) => s + (d.file_size_bytes || 0), 0);
  const downloadedCount = downloads.length;

  const packStatus = (pack) => {
    const total = pack.books.length;
    const done = pack.books.filter(b => isDownloaded(b, searchTranslation)).length;
    return { done, total, complete: done === total };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow ${offlineMode ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                {offlineMode ? <WifiOff className="w-6 h-6 text-white" /> : <Wifi className="w-6 h-6 text-white" />}
              </div>
              Offline Bible Access
            </h1>
            <p className="text-gray-500 mt-1">Download Bible books for offline reading and searching without internet.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={() => setOfflineMode(v => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm transition-all ${offlineMode ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-amber-50 hover:border-amber-300'}`}
            >
              {offlineMode ? 'Exit Offline Mode' : 'Use Offline Mode'}
            </button>
          </div>
        </div>

        {/* Storage stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <HardDrive className="w-5 h-5 text-indigo-500" />, label: 'Storage Used', value: formatBytes(storageUsed), color: 'text-indigo-700' },
            { icon: <Download className="w-5 h-5 text-green-500" />, label: 'Books Downloaded', value: downloadedCount, color: 'text-green-700' },
            { icon: <BookOpen className="w-5 h-5 text-amber-500" />, label: 'Searchable Offline', value: `${Object.keys(cache).length} books`, color: 'text-amber-700' },
          ].map((s, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                {s.icon}
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {offlineMode && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Offline Mode Active</p>
              <p className="text-xs text-amber-600">Read and search downloaded books without internet. {downloadedCount === 0 && 'Download some books first!'}</p>
            </div>
          </div>
        )}

        {/* Bulk download progress */}
        <BulkDownloadProgress progress={bulkProgress} />
        {bulkProgress && (
          <button
            onClick={() => { abortRef.current = true; }}
            className="mb-4 text-xs text-red-500 hover:text-red-700 underline"
          >
            Cancel download
          </button>
        )}

        <Tabs defaultValue={offlineMode ? 'search' : 'download'} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="download">Individual Books</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Packs</TabsTrigger>
            <TabsTrigger value="library">Library ({downloadedCount})</TabsTrigger>
            <TabsTrigger value="search">Offline Search</TabsTrigger>
          </TabsList>

          {/* Individual Download Tab */}
          <TabsContent value="download">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base">Download Bible Books</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Translation:</span>
                    <Select value={searchTranslation} onValueChange={setSearchTranslation}>
                      <SelectTrigger className="text-sm w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRANSLATIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-2 relative">
                  <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    placeholder="Filter books..."
                    className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                  />
                  {filterText && <button onClick={() => setFilterText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
                </div>
              </CardHeader>
              <CardContent>
                {(['Old Testament', 'New Testament']).map(testament => {
                  const books = testament === 'Old Testament' ? OT : NT;
                  const visible = books.filter(b => b.toLowerCase().includes(filterText.toLowerCase()));
                  if (visible.length === 0) return null;
                  return (
                    <div key={testament} className="mb-6">
                      <p className="text-xs font-bold uppercase text-gray-400 mb-3">{testament}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {visible.map(book => {
                          const downloaded = isDownloaded(book, searchTranslation);
                          const isLoading = downloading?.book === book && downloading?.translation === searchTranslation;
                          return (
                            <button
                              key={book}
                              onClick={() => !downloaded && !isLoading && !bulkProgress && handleDownload(book, searchTranslation)}
                              disabled={downloaded || isLoading || !!bulkProgress}
                              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                                downloaded ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
                                : isLoading ? 'bg-indigo-50 border-indigo-200 text-indigo-600 cursor-wait'
                                : bulkProgress ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                              }`}
                            >
                              <span className="font-medium truncate">{book}</span>
                              {downloaded && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-green-600" />}
                              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
                              {!downloaded && !isLoading && <Download className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Packs Tab */}
          <TabsContent value="bulk">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Bulk Download Packs
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">Download entire sections of the Bible at once.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Translation:</span>
                    <Select value={searchTranslation} onValueChange={setSearchTranslation}>
                      <SelectTrigger className="text-sm w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRANSLATIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {BULK_PACKS.map(pack => {
                  const { done, total, complete } = packStatus(pack);
                  const pct = Math.round((done / total) * 100);
                  const isActive = bulkProgress?.label === pack.label;
                  return (
                    <div key={pack.id} className={`rounded-xl border p-4 transition-all ${complete ? 'border-green-200 bg-green-50/50' : isActive ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Package className={`w-4 h-4 ${complete ? 'text-green-600' : 'text-indigo-500'}`} />
                            <span className="font-semibold text-gray-900 text-sm">{pack.label}</span>
                            <span className="text-xs text-gray-400">{pack.description}</span>
                            {complete && <Badge className="bg-green-100 text-green-700 text-xs">Complete</Badge>}
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">{done}/{total} books downloaded</span>
                              <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${complete ? 'bg-green-500' : 'bg-indigo-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {pack.books.slice(0, 8).map(b => (
                              <span key={b} className={`text-xs px-1.5 py-0.5 rounded ${isDownloaded(b, searchTranslation) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b}</span>
                            ))}
                            {pack.books.length > 8 && <span className="text-xs text-gray-400">+{pack.books.length - 8} more</span>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleBulkDownload(pack)}
                          disabled={complete || !!bulkProgress}
                          className={`flex-shrink-0 text-xs gap-1 ${complete ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100 cursor-default' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {isActive ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Downloading…</>
                          ) : complete ? (
                            <><CheckCircle2 className="w-3 h-3" /> Downloaded</>
                          ) : (
                            <><Download className="w-3 h-3" /> Download All</>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Downloaded Library</CardTitle>
                  {downloads.length > 0 && (
                    <button
                      onClick={() => setDeleteConfirm('all')}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete All
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {deleteConfirm === 'all' && (
                  <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">Delete all {downloads.length} downloaded books?</p>
                      <p className="text-xs text-red-600 mt-0.5">This will remove all offline content and free up storage.</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700 text-xs h-7">Delete All</Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)} className="text-xs h-7">Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                {loadingDownloads ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : downloads.length === 0 ? (
                  <div className="text-center py-12">
                    <HardDrive className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No books downloaded yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Use the Download tab to save books for offline reading.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {downloads.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:border-red-200 transition-all group">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.book_name}</p>
                            <p className="text-xs text-gray-400">{item.translation} · {formatBytes(item.file_size_bytes)}</p>
                          </div>
                        </div>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleDelete(item)} className="text-xs text-red-600 font-semibold hover:underline">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:text-gray-600 ml-1">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offline Search Tab */}
          <TabsContent value="search">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-base">Search Downloaded Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Select value={searchTranslation} onValueChange={v => { setSearchTranslation(v); setOfflineResults([]); }}>
                    <SelectTrigger className="text-sm w-28 flex-shrink-0"><SelectValue /></SelectTrigger>
                    <SelectContent>{TRANSLATIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleOfflineSearch()}
                      placeholder="Search downloaded verses..."
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <Button onClick={handleOfflineSearch} disabled={searching || !searchQuery.trim()} className="bg-indigo-600 hover:bg-indigo-700 gap-1 text-sm">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </Button>
                </div>
                {Object.keys(cache).filter(k => k.startsWith(searchTranslation + '::')).length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <WifiOff className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No downloaded {searchTranslation} content to search.</p>
                    <p className="text-xs mt-1">Download books first from the other tabs.</p>
                  </div>
                ) : offlineResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-medium">{offlineResults.length} result{offlineResults.length !== 1 ? 's' : ''} found (offline)</p>
                    {offlineResults.map((r, i) => (
                      <div key={i} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <p className="text-xs font-bold text-indigo-600 mb-1">{r.ref} ({r.translation})</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-400 py-8">Enter a search term and press Enter or click Search.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}