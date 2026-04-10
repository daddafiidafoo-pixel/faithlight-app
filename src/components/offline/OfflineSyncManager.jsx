import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { isOnline, getPendingSync, markSynced } from '@/lib/offlineCacheManager';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';

export default function OfflineSyncManager() {
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPending = async () => {
      const pending = await getPendingSync();
      setPendingCount(pending.length);
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (online && pendingCount > 0) {
      syncPendingData();
    }
  }, [online]);

  const syncPendingData = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    setSyncError(null);

    try {
      const pending = await getPendingSync();

      for (const item of pending) {
        try {
          const { operation, storeName, data, id } = item;

          // Sync based on store type
          if (storeName === 'readingPlans') {
            if (operation === 'create') {
              await base44.entities.PersonalReadingPlan.create(data);
            } else if (operation === 'update') {
              await base44.entities.PersonalReadingPlan.update(data.id, data);
            }
          } else if (storeName === 'quizAttempts') {
            if (operation === 'create') {
              await base44.entities.UserQuizAttempt.create(data);
            }
          } else if (storeName === 'highlights') {
            if (operation === 'create') {
              await base44.entities.UserHighlight.create(data);
            }
          } else if (storeName === 'notes') {
            if (operation === 'create') {
              await base44.entities.VerseNote?.create?.(data);
            }
          }

          await markSynced(id);
          setPendingCount(prev => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Sync item failed:', error);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError('Sync failed. Will retry when online.');
    } finally {
      setSyncing(false);
    }
  };

  if (!online) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">You're offline</p>
          {pendingCount > 0 && (
            <p className="text-xs text-amber-700 mt-1">{pendingCount} changes waiting to sync</p>
          )}
        </div>
      </div>
    );
  }

  if (pendingCount > 0 || syncing) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-center gap-3">
        {syncing ? (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
        ) : (
          <Wifi className="w-5 h-5 text-blue-600 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">
            {syncing ? 'Syncing changes...' : `${pendingCount} changes to sync`}
          </p>
        </div>
        {!syncing && (
          <button
            onClick={syncPendingData}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Sync Now
          </button>
        )}
      </div>
    );
  }

  if (syncError) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm bg-red-50 border border-red-300 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">Sync Error</p>
          <p className="text-xs text-red-700 mt-1">{syncError}</p>
        </div>
      </div>
    );
  }

  return null;
}