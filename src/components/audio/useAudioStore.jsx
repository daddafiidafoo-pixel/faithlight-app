/**
 * useAudioStore.js
 * Global audio state — persists across page navigation.
 * Uses Zustand for lightweight reactive state.
 */
import { create } from 'zustand';

export const useAudioStore = create((set, get) => ({
  // Track info
  book: null,
  chapter: null,
  verses: [],

  // Playback state
  isPlaying: false,
  currentVerseIndex: 0,
  speed: 1,
  isMuted: false,

  // UI state
  isVisible: false,   // mini player visible
  isExpanded: false,  // full player expanded

  // ── Actions ──────────────────────────────────────────────────────────────
  loadChapter: (book, chapter, verses) => {
    const prev = get();
    // Same chapter — don't reset position
    if (prev.book === book && prev.chapter === chapter) return;
    set({
      book,
      chapter,
      verses,
      currentVerseIndex: 0,
      isPlaying: false,
      isVisible: true,
    });
  },

  setPlaying: (v) => set({ isPlaying: v }),
  setVerseIndex: (i) => set({ currentVerseIndex: i }),
  setSpeed: (s) => set({ speed: s }),
  setMuted: (m) => set({ isMuted: m }),
  setExpanded: (v) => set({ isExpanded: v }),
  setVisible: (v) => set({ isVisible: v }),

  nextVerse: () => {
    const { currentVerseIndex, verses } = get();
    if (currentVerseIndex < verses.length - 1) {
      set({ currentVerseIndex: currentVerseIndex + 1 });
      return true;
    }
    return false; // end of chapter
  },

  prevVerse: () => {
    const { currentVerseIndex } = get();
    if (currentVerseIndex > 0) {
      set({ currentVerseIndex: currentVerseIndex - 1 });
      return true;
    }
    return false;
  },

  dismiss: () => set({ isVisible: false, isPlaying: false }),
}));