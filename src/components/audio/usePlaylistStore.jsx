/**
 * usePlaylistStore.js
 * Manages the audio playlist queue and sleep timer state.
 */
import { create } from 'zustand';

export const usePlaylistStore = create((set, get) => ({
  // Queue: array of { src, title, subtitle, language?, verses? }
  queue: [],
  currentIndex: -1,

  // Sleep timer
  sleepMinutes: 0,       // 0 = off
  sleepEndsAt: null,     // timestamp when sleep timer fires

  // ── Queue actions ──────────────────────────────────────────────────────────

  addToQueue: (track) => {
    const { queue } = get();
    const alreadyIn = queue.some(t => t.src === track.src);
    if (alreadyIn) return false;
    set({ queue: [...queue, track] });
    return true;
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const next = queue.filter((_, i) => i !== index);
    // Adjust currentIndex if needed
    let nextIdx = currentIndex;
    if (index < currentIndex) nextIdx = currentIndex - 1;
    else if (index === currentIndex) nextIdx = -1;
    set({ queue: next, currentIndex: nextIdx });
  },

  clearQueue: () => set({ queue: [], currentIndex: -1 }),

  setCurrentIndex: (i) => set({ currentIndex: i }),

  reorderQueue: (fromIdx, toIdx) => {
    const { queue, currentIndex } = get();
    const updated = [...queue];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    // Adjust currentIndex
    let nextIdx = currentIndex;
    if (currentIndex === fromIdx) nextIdx = toIdx;
    else if (fromIdx < currentIndex && toIdx >= currentIndex) nextIdx = currentIndex - 1;
    else if (fromIdx > currentIndex && toIdx <= currentIndex) nextIdx = currentIndex + 1;
    set({ queue: updated, currentIndex: nextIdx });
  },

  getCurrentTrack: () => {
    const { queue, currentIndex } = get();
    return currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  },

  hasNext: () => {
    const { queue, currentIndex } = get();
    return currentIndex < queue.length - 1;
  },

  hasPrev: () => {
    const { currentIndex } = get();
    return currentIndex > 0;
  },

  advanceToNext: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      set({ currentIndex: nextIdx });
      return queue[nextIdx];
    }
    return null;
  },

  goToPrev: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      set({ currentIndex: prevIdx });
      return queue[prevIdx];
    }
    return null;
  },

  // Play a specific index in the queue
  playAt: (index) => {
    const { queue } = get();
    if (index >= 0 && index < queue.length) {
      set({ currentIndex: index });
      return queue[index];
    }
    return null;
  },

  // ── Sleep timer ────────────────────────────────────────────────────────────

  setSleepTimer: (minutes) => {
    if (minutes <= 0) {
      set({ sleepMinutes: 0, sleepEndsAt: null });
    } else {
      set({ sleepMinutes: minutes, sleepEndsAt: Date.now() + minutes * 60 * 1000 });
    }
  },

  cancelSleepTimer: () => set({ sleepMinutes: 0, sleepEndsAt: null }),
}));