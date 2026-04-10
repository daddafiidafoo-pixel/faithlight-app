import { base44 } from '@/api/base44Client';

const OFFLINE_PROGRESS_KEY = 'faithlight_offline_progress';
const PENDING_SYNCS_KEY = 'faithlight_pending_syncs';

export const OfflineProgressSync = {
  // Save progress locally (when offline)
  saveLocalProgress: (progressData) => {
    try {
      const progress = OfflineProgressSync.getLocalProgress();
      progress[progressData.lesson_id] = {
        ...progressData,
        savedAt: new Date().toISOString(),
        synced: false
      };
      localStorage.setItem(OFFLINE_PROGRESS_KEY, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Failed to save local progress:', error);
      return false;
    }
  },

  // Get all local progress
  getLocalProgress: () => {
    try {
      const stored = localStorage.getItem(OFFLINE_PROGRESS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get local progress:', error);
      return {};
    }
  },

  // Mark progress as pending sync
  addPendingSync: (lessonId, progressData) => {
    try {
      const pending = OfflineProgressSync.getPendingsyncs();
      pending[lessonId] = {
        ...progressData,
        addedAt: new Date().toISOString()
      };
      localStorage.setItem(PENDING_SYNCS_KEY, JSON.stringify(pending));
      return true;
    } catch (error) {
      console.error('Failed to add pending sync:', error);
      return false;
    }
  },

  // Get all pending syncs
  getPendingsyncs: () => {
    try {
      const stored = localStorage.getItem(PENDING_SYNCS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  },

  // Sync progress to server
  syncProgressToServer: async (userId) => {
    if (!userId) return { success: false, synced: 0, failed: 0 };

    try {
      const pendingSyncs = OfflineProgressSync.getPendingsyncs();
      const lessonIds = Object.keys(pendingSyncs);

      if (lessonIds.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      let syncedCount = 0;
      let failedCount = 0;

      for (const lessonId of lessonIds) {
        const progressData = pendingSyncs[lessonId];
        
        try {
          // Check if progress record exists
          const existing = await base44.entities.UserProgress.filter({
            user_id: userId,
            lesson_id: lessonId
          }, '-created_date', 1);

          if (existing.length > 0) {
            // Update existing
            await base44.entities.UserProgress.update(existing[0].id, {
              completed: progressData.completed,
              progress: progressData.progress,
              last_accessed: new Date().toISOString()
            });
          } else {
            // Create new
            await base44.entities.UserProgress.create({
              user_id: userId,
              lesson_id: lessonId,
              completed: progressData.completed,
              progress: progressData.progress
            });
          }

          syncedCount++;
          
          // Remove from pending after successful sync
          const remaining = OfflineProgressSync.getPendingsyncs();
          delete remaining[lessonId];
          localStorage.setItem(PENDING_SYNCS_KEY, JSON.stringify(remaining));
        } catch (error) {
          console.error(`Failed to sync progress for lesson ${lessonId}:`, error);
          failedCount++;
        }
      }

      return {
        success: failedCount === 0,
        synced: syncedCount,
        failed: failedCount
      };
    } catch (error) {
      console.error('Progress sync error:', error);
      return { success: false, synced: 0, failed: 0 };
    }
  },

  // Clear synced progress
  clearSyncedProgress: () => {
    try {
      localStorage.removeItem(OFFLINE_PROGRESS_KEY);
      localStorage.removeItem(PENDING_SYNCS_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }
};