import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Background Sync Service
 * Detects when device comes online and syncs cached data
 * Handles Bible notes, prayer journal entries, and progress data
 */

const SYNC_QUEUE_KEY = 'faithlight_sync_queue';
const SYNC_STATUS_KEY = 'faithlight_sync_status';

class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.queue = this.loadQueue();
  }

  loadQueue() {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to load sync queue:', err);
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('Failed to save sync queue:', err);
    }
  }

  addItem(type, data) {
    this.queue.push({
      id: `${type}_${Date.now()}_${Math.random()}`,
      type, // 'note', 'prayer', 'progress'
      data,
      timestamp: Date.now(),
      retries: 0,
    });
    this.saveQueue();
  }

  async sync() {
    if (this.isSyncing || !navigator.onLine) {
      return { success: false, reason: 'Already syncing or offline' };
    }

    this.isSyncing = true;
    const initialQueueLength = this.queue.length;

    try {
      const results = {
        synced: 0,
        failed: 0,
        errors: [],
      };

      // Process queue items
      while (this.queue.length > 0) {
        const item = this.queue[0];

        try {
          await this.syncItem(item);
          results.synced++;
          this.queue.shift();
          this.saveQueue();
        } catch (err) {
          item.retries = (item.retries || 0) + 1;

          if (item.retries >= 3) {
            results.failed++;
            results.errors.push({
              itemId: item.id,
              error: err.message,
            });
            this.queue.shift();
            this.saveQueue();
          } else {
            // Keep trying later
            break;
          }
        }
      }

      this.setSyncStatus({ success: true, synced: results.synced, failed: results.failed });
      return results;
    } catch (err) {
      console.error('Sync failed:', err);
      this.setSyncStatus({ success: false, error: err.message });
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncItem(item) {
    const { type, data } = item;

    switch (type) {
      case 'note':
        // Sync Bible notes
        if (data.id) {
          await base44.entities.BibleNote?.update?.(data.id, data);
        } else {
          await base44.entities.BibleNote?.create?.(data);
        }
        break;

      case 'prayer':
        // Sync prayer journal entries
        if (data.id) {
          await base44.entities.PrayerJournal?.update?.(data.id, data);
        } else {
          await base44.entities.PrayerJournal?.create?.(data);
        }
        break;

      case 'progress':
        // Sync reading progress
        if (data.id) {
          await base44.entities.UserReadingProgress?.update?.(data.id, data);
        } else {
          await base44.entities.UserReadingProgress?.create?.(data);
        }
        break;

      case 'highlight':
        // Sync verse highlights
        if (data.id) {
          await base44.entities.VerseHighlight?.update?.(data.id, data);
        } else {
          await base44.entities.VerseHighlight?.create?.(data);
        }
        break;

      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  setSyncStatus(status) {
    try {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
        ...status,
        timestamp: Date.now(),
      }));
    } catch (err) {
      console.error('Failed to save sync status:', err);
    }
  }

  getSyncStatus() {
    try {
      const status = localStorage.getItem(SYNC_STATUS_KEY);
      return status ? JSON.parse(status) : null;
    } catch (err) {
      console.error('Failed to load sync status:', err);
      return null;
    }
  }

  getPendingCount() {
    return this.queue.length;
  }
}

// Global sync manager instance
const syncManager = new SyncManager();

/**
 * React Hook: useBackgroundSync
 * Automatically syncs data when device comes online
 */
export function useBackgroundSync() {
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Device came online, starting sync...');
      // Debounce to avoid multiple syncs
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncManager.sync();
      }, 500);
    };

    const handleOffline = () => {
      console.log('Device went offline, queuing changes');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // If already online, try syncing immediately
    if (navigator.onLine && syncManager.getPendingCount() > 0) {
      syncManager.sync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  return {
    addItem: syncManager.addItem.bind(syncManager),
    sync: syncManager.sync.bind(syncManager),
    getPendingCount: syncManager.getPendingCount.bind(syncManager),
    getSyncStatus: syncManager.getSyncStatus.bind(syncManager),
  };
}

/**
 * Component: BackgroundSyncProvider
 * Wraps app to enable background sync
 */
export default function BackgroundSyncService() {
  useBackgroundSync();
  return null; // Non-visual service component
}

// Export manager for direct access if needed
export { syncManager };