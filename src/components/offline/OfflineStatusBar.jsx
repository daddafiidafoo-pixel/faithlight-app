import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi, HardDrive, Trash2, CheckCircle } from 'lucide-react';
import { getAllCachedChapters, clearAllCache, getCacheSizeKB } from '../../hooks/useOfflineCache';

export default function OfflineStatusBar({ onManageClick }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedCount, setCachedCount] = useState(0);
  const [cacheKB, setCacheKB] = useState(0);
  const [cleared, setCleared] = useState(false);

  const refresh = () => {
    setCachedCount(getAllCachedChapters().length);
    setCacheKB(getCacheSizeKB());
  };

  useEffect(() => {
    refresh();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleClear = () => {
    clearAllCache();
    refresh();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium border ${isOnline ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
      {isOnline
        ? <Wifi className="w-4 h-4 text-green-600 shrink-0" />
        : <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />}
      <span className="flex-1">{isOnline ? 'Online' : 'Offline mode'}</span>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <HardDrive className="w-3.5 h-3.5" />
        <span>{cachedCount} chapters · {cacheKB} KB</span>
      </div>

      {cachedCount > 0 && (
        <button
          onClick={handleClear}
          title="Clear offline cache"
          className="p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
        >
          {cleared ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Trash2 className="w-4 h-4" />}
        </button>
      )}

      {onManageClick && (
        <button
          onClick={onManageClick}
          className="text-xs underline text-indigo-600 hover:text-indigo-800 ml-1"
        >
          Manage
        </button>
      )}
    </div>
  );
}