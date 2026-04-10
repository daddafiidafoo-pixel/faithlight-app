import { create } from 'zustand';

export const useAudioStore = create((set, get) => ({
  // Current track
  currentTrack: null,
  currentTime: 0,
  isPlaying: false,
  duration: 0,

  // Playlist context
  playlist: [],
  currentIndex: 0,
  playbackRate: 1,

  // Actions
  setTrack: (track) => {
    set({ currentTrack: track, currentIndex: 0 });
  },

  setPlaylist: (tracks) => {
    set({ playlist: tracks });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () =>
    set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),

  nextTrack: () => {
    const { playlist, currentIndex } = get();
    if (currentIndex < playlist.length - 1) {
      set({ 
        currentIndex: currentIndex + 1,
        currentTrack: playlist[currentIndex + 1],
        currentTime: 0
      });
    }
  },

  previousTrack: () => {
    const { currentIndex, playlist } = get();
    if (currentIndex > 0) {
      set({ 
        currentIndex: currentIndex - 1,
        currentTrack: playlist[currentIndex - 1],
        currentTime: 0
      });
    }
  },

  reset: () => {
    set({
      currentTrack: null,
      currentTime: 0,
      isPlaying: false,
      duration: 0,
      playlist: [],
      currentIndex: 0,
      playbackRate: 1,
    });
  },
}));