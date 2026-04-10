import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Download, Trash2, BookOpen, CheckCircle, Loader2, HardDrive, RefreshCw } from 'lucide-react';
import {
  cacheBibleChapter, getCachedBibleChapter, cacheReadingPlan, getCachedReadingPlan,
  cacheDailyVerse, getCachedDailyVerse, getOfflineChapterList, clearOfflineCache, getOfflineCacheSize,
} from '@/components/offline/DailyVerseOfflineCache';
import { toast } from 'sonner';

const BIBLE_BOOKS_BASIC = [
  { code: 'GEN', name: 'Genesis', chapters: 50 },
  { code: 'PSA', name: 'Psalms', chapters: 150 },
  { code: 'PRO', name: 'Proverbs', chapters: 31 },
  { code: 'MAT', name: 'Matthew', chapters: 28 },
  { code: 'JHN', name: 'John', chapters: 21 },
  { code: 'ROM', name: 'Romans', chapters: 16 },
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function OfflineReadingManager() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedChapters, setCachedChapters] = useState([]);
  const [cacheSize, setCacheSize] = useState(0);
  const [cachedVerse, setCachedVerse] = useState(null);
  const [cachedPlan, setCachedPlan] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    refreshCacheInfo();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const refreshCacheInfo = () => {
    setCachedChapters(getOfflineChapterList());
    setCacheSize(getOfflineCacheSize());
    setCachedVerse(getCachedDailyVerse());
    setCachedPlan(getCachedReadingPlan());
  };

  const downloadDailyVerse = async () => {
    setDownloading(d => ({ ...d, verse: true }));
    try {
      const res = await base44.functions.invoke('getDailyVerse', {});
      if (res.data) {
        cacheDailyVerse(res.data);
        refreshCacheInfo();
        toast.success('Daily verse cached for offline reading!');
      }
    } catch {
      toast.error('Could not download daily verse');
    } finally {
      setDownloading(d => ({ ...d, verse: false }));
    }
  };

  const downloadReadingPlan = async () => {
    if (!user?.email) { toast.error('Please log in first'); return; }
    setDownloading(d => ({ ...d, plan: true }));
    try {
      const plans = await base44.entities.CustomReadingPlan.filter({ userEmail: user.email }, '-created_date', 1);
      if (plans.length > 0) {
        cacheReadingPlan(plans[0]);
        refreshCacheInfo();
        toast.success('Reading plan cached for offline use!');
      } else {
        toast.info('No active reading plan found');
      }
    } catch {
      toast.error('Could not download reading plan');
    } finally {
      setDownloading(d => ({ ...d, plan: false }));
    }
  };

  const downloadChapter = async (bookCode, bookName, chapter) => {
    const key = `${bookCode}-${chapter}`;
    setDownloading(d => ({ ...d, [key]: true }));
    try {
      const res = await base44.functions.invoke('bibleChapter', { book: bookCode, chapter, translation: 'KJV' });
      const verses = res.data?.verses || res.data;
      if (verses) {
        cacheBibleChapter(bookCode, chapter, 'KJV', verses);
        refreshCacheInfo();
        toast.success(`${bookName} ${chapter} cached!`);
      }
    } catch {
      toast.error(`Could not cache ${bookName} ${chapter}`);
    } finally {
      setDownloading(d => ({ ...d, [key]: false }));
    }
  };

  const handleClearCache = () => {
    if (!confirm('Clear all offline content?')) return;
    clearOfflineCache();
    refreshCacheInfo();
    toast.success('Offline cache cleared');
  };

  const isCached = (book, chapter) => cachedChapters.some(c => c.book === book && c.chapter === String(chapter));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`px-4 py-10 text-white ${isOnline ? 'bg-gradient-to-br from-indigo-600 to-violet-700' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Offline Reading</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <p className="text-sm opacity-80">{isOnline ? 'Connected — download content now' : 'Offline mode — reading cached content'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Storage info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Offline Storage</p>
              <p className="text-xs text-gray-400">{cachedChapters.length} chapters · {formatBytes(cacheSize)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={refreshCacheInfo} className="p-2 text-gray-400 hover:text-indigo-600">
              <RefreshCw size={16} />
            </button>
            {cacheSize > 0 && (
              <button onClick={handleClearCache} className="p-2 text-gray-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Daily verse */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 text-sm">Daily Verse</p>
              {cachedVerse ? (
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs mb-1">✓ Cached</Badge>
                  <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">"{cachedVerse.text}"</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">{cachedVerse.reference}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Not downloaded yet</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadDailyVerse}
              disabled={downloading.verse || !isOnline}
              className="flex-shrink-0"
            >
              {downloading.verse ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </Button>
          </div>
        </div>

        {/* Reading plan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900 text-sm">Active Reading Plan</p>
              {cachedPlan ? (
                <div className="mt-1">
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">✓ Cached</Badge>
                  <p className="text-xs text-gray-600 mt-1 font-medium">{cachedPlan.title}</p>
                  <p className="text-xs text-gray-400">Day {cachedPlan.currentDay} of {cachedPlan.durationDays}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Not downloaded yet</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadReadingPlan}
              disabled={downloading.plan || !isOnline}
              className="flex-shrink-0"
            >
              {downloading.plan ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </Button>
          </div>
        </div>

        {/* Bible chapters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Cache Bible Chapters
          </p>
          <div className="space-y-4">
            {BIBLE_BOOKS_BASIC.map(book => (
              <div key={book.code}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{book.name}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(book.chapters, 10) }, (_, i) => i + 1).map(ch => {
                    const cached = isCached(book.code, ch);
                    const key = `${book.code}-${ch}`;
                    const loading = downloading[key];
                    return (
                      <button
                        key={ch}
                        onClick={() => !cached && downloadChapter(book.code, book.name, ch)}
                        disabled={cached || loading || !isOnline}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          cached
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : loading
                            ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                        }`}
                      >
                        {loading ? <Loader2 size={12} className="animate-spin mx-auto" /> : cached ? <CheckCircle size={14} className="mx-auto" /> : ch}
                      </button>
                    );
                  })}
                  {book.chapters > 10 && (
                    <span className="w-10 h-10 flex items-center justify-center text-xs text-gray-300">+{book.chapters - 10}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Offline reading — show cached content */}
        {!isOnline && cachedChapters.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
              <WifiOff size={16} /> Available Offline
            </p>
            <div className="flex flex-wrap gap-2">
              {cachedChapters.map(c => (
                <Badge key={`${c.book}-${c.chapter}`} className="bg-amber-100 text-amber-700 border-0 text-xs">
                  {c.book} {c.chapter}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}