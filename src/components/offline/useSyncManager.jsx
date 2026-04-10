import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const PENDING_KEY = 'gbli_sync_pending';
const META_KEY = 'gbli_sync_meta';

// Simple localStorage-based sync queue helpers
function getPendingItems() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
  } catch {
    return [];
  }
}

function queueItem(action) {
  const items = getPendingItems();
  items.push({ ...action, queuedAt: Date.now() });
  localStorage.setItem(PENDING_KEY, JSON.stringify(items));
}

function clearPending() {
  localStorage.setItem(PENDING_KEY, '[]');
}

function getMetadata() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveMetadata(data) {
  localStorage.setItem(META_KEY, JSON.stringify({ ...getMetadata(), ...data }));
}

export function useSyncManager() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Refresh pending count from localStorage
  const refreshPendingCount = useCallback(() => {
    setPendingCount(getPendingItems().length);
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, []);

  // Track online/offline status
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

  const performSync = useCallback(async () => {
    if (isSyncing) return;
    const items = getPendingItems();
    if (!items.length) return;

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Group items by type
      const pendingProgress = items.filter(i => i.type === 'progress');
      const pendingNotes = items.filter(i => i.type === 'note');
      const pendingBookmarks = items.filter(i => i.type === 'bookmark');

      await base44.functions.invoke('offlineSyncManager', {
        pendingProgress,
        pendingNotes,
        pendingBookmarks
      });

      clearPending();
      saveMetadata({ lastSync: Date.now() });
      setLastSyncTime(new Date());
      setPendingCount(0);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && !isSyncing && getPendingItems().length > 0) {
      performSync();
    }
  }, [isOnline]);

  const queueChange = useCallback((action) => {
    queueItem(action);
    refreshPendingCount();
  }, [refreshPendingCount]);

  return {
    isOnline,
    isSyncing,
    syncStatus,
    pendingCount,
    lastSyncTime,
    performSync,
    queueChange
  };
}