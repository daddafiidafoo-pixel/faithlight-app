import { usePlaylistStore } from './usePlaylistStore';

/**
 * Safe wrapper for usePlaylistStore that handles initialization errors
 */
export function useSafePlaylistStore() {
  try {
    return usePlaylistStore();
  } catch (e) {
    // Return safe defaults if zustand hook fails
    return {
      addToQueue: () => false,
      queue: [],
      currentIndex: -1,
      removeFromQueue: () => {},
      clearQueue: () => {},
      setCurrentIndex: () => {},
      reorderQueue: () => {},
      getCurrentTrack: () => null,
      hasNext: () => false,
      hasPrev: () => false,
      advanceToNext: () => null,
      goToPrev: () => null,
      playAt: () => null,
      setSleepTimer: () => {},
      cancelSleepTimer: () => {},
      sleepMinutes: 0,
      sleepEndsAt: null,
    };
  }
}