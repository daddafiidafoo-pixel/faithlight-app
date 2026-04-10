import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { emitSyncProgress, emitSyncDone } from './OfflineSyncProgressBanner';

export default function OfflineSyncController() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only sync when transitioning from offline → online (not on initial load)
  const [wasOffline, setWasOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (isOnline && wasOffline && !syncing) {
      setWasOffline(false);
      const syncData = async () => {
        setSyncing(true);
        try {
          const isAuth = await base44.auth.isAuthenticated();
          if (!isAuth) return;
          emitSyncProgress(10, 'Checking for updates…');
          await new Promise(r => setTimeout(r, 300));
          emitSyncProgress(40, 'Syncing offline content…');
          await base44.functions.invoke('syncOfflineContent', { action: 'sync_all' });
          emitSyncProgress(90, 'Finalizing…');
          await new Promise(r => setTimeout(r, 200));
          emitSyncDone();
        } catch (err) {
          console.error('Sync error:', err);
          emitSyncDone();
        } finally {
          setSyncing(false);
        }
      };
      const timer = setTimeout(syncData, 2000);
      return () => clearTimeout(timer);
    }
    if (!isOnline) setWasOffline(true);
  }, [isOnline]);

  // Manual sync button (optional UI)
  return null; // This runs silently in background
}