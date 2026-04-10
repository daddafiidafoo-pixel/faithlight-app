import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, Loader2, Trash2, WifiOff, BookOpen, ListChecks, HardDrive, AlertCircle } from 'lucide-react';

const BIBLE_CHAPTERS = [
  { id: 'psalms_23', label: 'Psalm 23', book: 'Psalms', chapter: 23, size: '4 KB' },
  { id: 'john_3', label: 'John 3', book: 'John', chapter: 3, size: '6 KB' },
  { id: 'romans_8', label: 'Romans 8', book: 'Romans', chapter: 8, size: '7 KB' },
  { id: 'genesis_1', label: 'Genesis 1', book: 'Genesis', chapter: 1, size: '5 KB' },
  { id: 'matthew_5', label: 'Matthew 5', book: 'Matthew', chapter: 5, size: '6 KB' },
  { id: 'proverbs_3', label: 'Proverbs 3', book: 'Proverbs', chapter: 3, size: '4 KB' },
  { id: 'isaiah_40', label: 'Isaiah 40', book: 'Isaiah', chapter: 40, size: '5 KB' },
  { id: 'ephesians_6', label: 'Ephesians 6', book: 'Ephesians', chapter: 6, size: '4 KB' },
  { id: 'hebrews_11', label: 'Hebrews 11', book: 'Hebrews', chapter: 11, size: '7 KB' },
  { id: '1_corinthians_13', label: '1 Corinthians 13', book: '1 Corinthians', chapter: 13, size: '4 KB' },
];

const READING_PLANS = [
  { id: 'rp_7day_starter', label: '7-Day Bible Starter', days: 7, size: '28 KB' },
  { id: 'rp_psalms', label: 'Psalms of Praise (14 days)', days: 14, size: '52 KB' },
  { id: 'rp_gospels', label: 'The Gospels Journey (30 days)', days: 30, size: '110 KB' },
];

const STORAGE_KEY = 'faithlight_offline_downloads';

function loadDownloads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveDownloads(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export default function OfflineDownloadCenter() {
  const [downloads, setDownloads] = useState(loadDownloads);
  const [downloading, setDownloading] = useState({});
  const [tab, setTab] = useState('chapters'); // 'chapters' | 'plans'
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const handleDownload = async (item) => {
    if (downloading[item.id]) return;
    setDownloading(d => ({ ...d, [item.id]: true }));

    // Simulate download (in a real app, fetch real content from API)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const updated = {
      ...downloads,
      [item.id]: {
        label: item.label,
        size: item.size,
        downloadedAt: new Date().toISOString(),
        type: item.days ? 'plan' : 'chapter',
      }
    };
    setDownloads(updated);
    saveDownloads(updated);
    setDownloading(d => { const n = { ...d }; delete n[item.id]; return n; });
  };

  const handleDelete = (id) => {
    const updated = { ...downloads };
    delete updated[id];
    setDownloads(updated);
    saveDownloads(updated);
  };

  const totalSavedItems = Object.keys(downloads).length;
  const estimatedStorageKB = Object.values(downloads).reduce((acc, d) => {
    return acc + parseInt(d.size?.replace(/\D/g, '') || '0');
  }, 0);

  const items = tab === 'chapters' ? BIBLE_CHAPTERS : READING_PLANS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-full mb-4">
            <WifiOff className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offline Download Center</h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">Download Bible chapters and reading plans to access without internet.</p>
        </div>

        {/* Online/Offline status */}
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 mb-6 text-sm font-medium ${isOnline ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {isOnline
            ? <><CheckCircle2 className="w-4 h-4" /> You are online — downloads are available.</>
            : <><AlertCircle className="w-4 h-4" /> You are offline — showing downloaded content only.</>}
        </div>

        {/* Storage summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="bg-indigo-100 rounded-full p-2">
              <Download className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{totalSavedItems}</p>
              <p className="text-xs text-gray-500">Items Downloaded</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <HardDrive className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">~{estimatedStorageKB} KB</p>
              <p className="text-xs text-gray-500">Stored Offline</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('chapters')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'chapters' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <BookOpen className="w-4 h-4" /> Bible Chapters
          </button>
          <button
            onClick={() => setTab('plans')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'plans' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ListChecks className="w-4 h-4" /> Reading Plans
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map(item => {
            const isDownloaded = !!downloads[item.id];
            const isDownloading = !!downloading[item.id];
            const meta = downloads[item.id];

            return (
              <div key={item.id} className={`bg-white rounded-2xl border transition-all p-4 flex items-center gap-4 ${isDownloaded ? 'border-green-200' : 'border-gray-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDownloaded ? 'bg-green-100' : 'bg-indigo-50'}`}>
                  {isDownloaded
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : tab === 'chapters'
                      ? <BookOpen className="w-5 h-5 text-indigo-400" />
                      : <ListChecks className="w-5 h-5 text-indigo-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">
                    {item.days ? `${item.days}-day plan · ` : ''}{item.size}
                    {isDownloaded && meta?.downloadedAt
                      ? ` · Saved ${new Date(meta.downloadedAt).toLocaleDateString()}`
                      : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isDownloaded ? (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg"
                      title="Remove download"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleDownload(item)}
                      disabled={isDownloading || !isOnline}
                      className="bg-indigo-600 hover:bg-indigo-700 gap-1 text-xs"
                    >
                      {isDownloading
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
                        : <><Download className="w-3 h-3" /> Download</>}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Downloads are saved to your device storage and available offline.
        </p>
      </div>
    </div>
  );
}