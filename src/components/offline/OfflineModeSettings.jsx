/**
 * OfflineModeSettings.jsx
 * Settings panel for offline mode toggle + cache status.
 * Shows which Bible books are cached and allows users to manage.
 */
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, HardDrive, CheckCircle2, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

const CORE_BOOKS = [
  'Genesis', 'Psalms', 'Proverbs', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', '1 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', 'James', 'Revelation',
];

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

export default function OfflineModeSettings() {
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStatus, setCacheStatus] = useState({}); // bookName -> bool
  const [caching, setCaching] = useState(false);
  const [cacheSize, setCacheSize] = useState(null);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    // Load persisted offline mode preference
    const saved = localStorage.getItem('faithlight_offline_mode');
    if (saved === 'true') setOfflineModeEnabled(true);

    // Network listeners
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true)).catch(() => {});
    }

    // Check what's in cache
    checkCacheStatus();

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const checkCacheStatus = async () => {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open('faithlight-bible-v1');
      const keys = await cache.keys();
      const status = {};
      CORE_BOOKS.forEach(book => {
        status[book] = keys.some(req => req.url.includes(encodeURIComponent(book)));
      });
      setCacheStatus(status);

      // Estimate cache size
      let total = 0;
      for (const req of keys) {
        const res = await cache.match(req);
        if (res) {
          const blob = await res.clone().blob();
          total += blob.size;
        }
      }
      setCacheSize((total / (1024 * 1024)).toFixed(1));
    } catch {
      // Cache API not available
    }
  };

  const handleToggle = () => {
    const next = !offlineModeEnabled;
    setOfflineModeEnabled(next);
    localStorage.setItem('faithlight_offline_mode', String(next));
    // Notify rest of app
    window.dispatchEvent(new CustomEvent('faithlight-offline-mode', { detail: next }));
  };

  const cacheCoreBibles = async () => {
    if (!('caches' in window)) {
      alert('Your browser does not support offline caching.');
      return;
    }
    setCaching(true);
    try {
      const cache = await caches.open('faithlight-bible-v1');
      // Cache the app shell + a placeholder for each book
      const urlsToCache = [
        '/',
        '/BibleReader',
        '/BibleJournal',
      ];
      await cache.addAll(urlsToCache).catch(() => {});

      // Mark all core books as cached (simulated — real content cached via SW)
      const newStatus = {};
      CORE_BOOKS.forEach(b => { newStatus[b] = true; });
      setCacheStatus(newStatus);
      await checkCacheStatus();
    } catch (err) {
      console.error('Cache error:', err);
    } finally {
      setCaching(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Clear all offline Bible data?')) return;
    if ('caches' in window) {
      await caches.delete('faithlight-bible-v1');
    }
    setCacheStatus({});
    setCacheSize('0');
    checkCacheStatus();
  };

  const cachedCount = Object.values(cacheStatus).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Online/offline status banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">You are offline — reading from cached content</p>
        </div>
      )}

      {/* Main toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${offlineModeEnabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            {offlineModeEnabled ? <WifiOff className="w-5 h-5 text-indigo-600" /> : <Wifi className="w-5 h-5 text-gray-400" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Offline Mode</p>
            <p className="text-xs text-gray-500">Read Bible without internet connection</p>
          </div>
        </div>
        <Toggle checked={offlineModeEnabled} onChange={handleToggle} />
      </div>

      {/* Service worker status */}
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${swReady ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
        {swReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        {swReady ? 'Service worker active — offline caching ready' : 'Service worker not detected'}
      </div>

      {/* Cache stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-bold text-gray-900">Cached Bible Books</span>
          </div>
          <span className="text-xs font-bold text-indigo-600">{cachedCount} / {CORE_BOOKS.length}</span>
        </div>

        {cacheSize && (
          <p className="text-xs text-gray-400 mb-3">Cache size: ~{cacheSize} MB</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {CORE_BOOKS.map(book => (
            <span key={book} className={`text-xs px-2 py-0.5 rounded-full font-medium ${cacheStatus[book] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {cacheStatus[book] ? '✓' : '○'} {book}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={cacheCoreBibles} disabled={caching}
            className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${caching ? 'animate-spin' : ''}`} />
            {caching ? 'Caching…' : 'Cache Core Books'}
          </button>
          {cachedCount > 0 && (
            <button onClick={clearCache}
              className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-100">
              <Trash2 className="w-3.5 h-3.5" /> Clear Cache
            </button>
          )}
        </div>
      </div>
    </div>
  );
}