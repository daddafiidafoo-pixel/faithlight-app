import { create } from 'zustand';

// Global audio player state for mini-player access
export const useAudioPlayerStore = create((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  currentBook: 'John',
  setCurrentBook: (book) => set({ currentBook: book }),

  currentChapter: '3',
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  currentVerseIndex: 0,
  setCurrentVerseIndex: (index) => set({ currentVerseIndex: index }),

  verses: [],
  setVerses: (verses) => set({ verses }),

  speed: 1,
  setSpeed: (speed) => set({ speed }),

  translation: 'WEB',
  setTranslation: (translation) => set({ translation }),

  // Mini player visible state
  showMiniPlayer: true,
  setShowMiniPlayer: (show) => set({ showMiniPlayer: show }),

  // Sync entire state (from AudioBible page)
  syncPlayerState: (state) => set(state),
}));