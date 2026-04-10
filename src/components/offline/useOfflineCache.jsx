/**
 * Offline cache strategy for FaithLight
 * Caches: habits, journal entries, verse images
 * Auto-syncs queued writes when back online
 */

import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_KEYS = {
  HABITS: 'fl_offline_habits',
  JOURNALS: 'fl_offline_journals',
  VERSE_IMAGES: 'fl_offline_verse_images',
  SYNC_QUEUE: 'fl_sync_queue',
  LAST_SYNC: 'fl_last_sync',
};

// ── Storage helpers ──────────────────────────────────────────────────────────
function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[OfflineCache] localStorage write failed:', e);
  }
}

// ── Sync queue ───────────────────────────────────────────────────────────────
export function queueOfflineWrite(entityName, operation, data) {
  const queue = getCache(CACHE_KEYS.SYNC_QUEUE) || [];
  queue.push({ entityName, operation, data, queuedAt: new Date().toISOString() });
  setCache(CACHE_KEYS.SYNC_QUEUE, queue);
}

export async function flushSyncQueue() {
  const queue = getCache(CACHE_KEYS.SYNC_QUEUE) || [];
  if (queue.length === 0) return { flushed: 0 };

  const remaining = [];
  let flushed = 0;

  for (const item of queue) {
    try {
      if (item.operation === 'create') {
        await base44.entities[item.entityName].create(item.data);
      } else if (item.operation === 'update') {
        await base44.entities[item.entityName].update(item.data.id, item.data);
      }
      flushed++;
    } catch (e) {
      console.warn('[OfflineCache] Failed to sync item:', e);
      remaining.push(item);
    }
  }

  setCache(CACHE_KEYS.SYNC_QUEUE, remaining);
  setCache(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
  return { flushed, remaining: remaining.length };
}

// ── Cache refresh (online) ───────────────────────────────────────────────────
export async function refreshOfflineCache(userId) {
  if (!userId) return;
  try {
    const [habits, journals, verseImages] = await Promise.all([
      base44.entities.HabitGoal.filter({ user_id: userId }, null, 100).catch(() => []),
      base44.entities.JournalEntry.filter({ user_id: userId }, '-created_date', 100).catch(() => []),
      base44.entities.VerseImage.filter({ user_id: userId }, '-created_date', 50).catch(() => []),
    ]);
    setCache(CACHE_KEYS.HABITS, habits || []);
    setCache(CACHE_KEYS.JOURNALS, journals || []);
    setCache(CACHE_KEYS.VERSE_IMAGES, verseImages || []);
    setCache(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    console.log('[OfflineCache] Cache refreshed:', { habits: habits?.length, journals: journals?.length, verseImages: verseImages?.length });
  } catch (e) {
    console.error('[OfflineCache] Refresh failed:', e);
  }
}

// ── React hook ───────────────────────────────────────────────────────────────
export function useOfflineCache(userId) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | done | error
  const [pendingCount, setPendingCount] = useState(
    () => (getCache(CACHE_KEYS.SYNC_QUEUE) || []).length
  );

  const updatePendingCount = useCallback(() => {
    setPendingCount((getCache(CACHE_KEYS.SYNC_QUEUE) || []).length);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const queue = getCache(CACHE_KEYS.SYNC_QUEUE) || [];
      if (queue.length > 0) {
        setSyncStatus('syncing');
        const result = await flushSyncQueue();
        updatePendingCount();
        setSyncStatus(result.remaining === 0 ? 'done' : 'error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
      if (userId) await refreshOfflineCache(userId);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId, updatePendingCount]);

  // Initial cache refresh if online
  useEffect(() => {
    if (userId && isOnline) refreshOfflineCache(userId);
  }, [userId]);

  const getCachedHabits = () => getCache(CACHE_KEYS.HABITS) || [];
  const getCachedJournals = () => getCache(CACHE_KEYS.JOURNALS) || [];
  const getCachedVerseImages = () => getCache(CACHE_KEYS.VERSE_IMAGES) || [];
  const getLastSync = () => getCache(CACHE_KEYS.LAST_SYNC);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    getCachedHabits,
    getCachedJournals,
    getCachedVerseImages,
    getLastSync,
    queueOfflineWrite,
    flushSyncQueue,
  };
}