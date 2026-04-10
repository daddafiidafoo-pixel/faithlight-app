import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader, Cloud } from 'lucide-react';
import { useI18n } from '../I18nProvider';
import { syncManager } from './BackgroundSyncService';

export default function SyncStatusIndicator() {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update sync status periodically
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getSyncStatus());
      setPendingCount(syncManager.getPendingCount());
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (pendingCount === 0 && isOnline) {
    return null; // Don't show if no pending items and online
  }

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncManager.sync();
    setSyncStatus(syncManager.getSyncStatus());
    setPendingCount(syncManager.getPendingCount());
    setIsSyncing(false);
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      {!isOnline ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-lg flex items-center gap-2">
          <Cloud className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-amber-900">{t('sync.offline', 'You are offline')}</p>
            <p className="text-amber-800">{pendingCount} {t('sync.itemsPending', 'items pending')}</p>
          </div>
        </div>
      ) : isSyncing ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg flex items-center gap-2">
          <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-blue-900">{t('sync.syncing', 'Syncing...')}</p>
            <p className="text-blue-800">{t('sync.backingUp', 'Backing up your data')}</p>
          </div>
        </div>
      ) : pendingCount > 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-orange-900">{pendingCount} {t('sync.itemsWaiting', 'items waiting to sync')}</p>
            <button
              onClick={handleManualSync}
              className="text-orange-700 underline hover:text-orange-900 text-xs font-medium"
            >
              {t('sync.syncNow', 'Sync now')}
            </button>
          </div>
        </div>
      ) : syncStatus?.success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-900">{t('sync.synced', 'Synced successfully')}</p>
            <p className="text-green-800">{syncStatus.synced} {t('sync.itemsSynced', 'items backed up')}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}