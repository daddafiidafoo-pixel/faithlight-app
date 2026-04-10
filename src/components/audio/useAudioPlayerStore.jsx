import { create } from "zustand";

let globalAudioInstance = null;

export const useAudioPlayerStore = create((set, get) => ({
  audio: null,
  isPlaying: false,
  isLoading: false,
  currentTrack: null,
  currentLanguage: null,
  currentBookId: null,
  currentChapter: null,
  currentTitle: "",
  duration: 0,
  currentTime: 0,
  error: null,

  initializeAudio: () => {
    let audio = get().audio || globalAudioInstance;
    if (audio) {
      set({ audio });
      return audio;
    }

    audio = new Audio();
    globalAudioInstance = audio;

    // Remove old listeners to prevent duplicates
    audio.removeEventListener("loadedmetadata", null);
    audio.removeEventListener("timeupdate", null);
    audio.removeEventListener("ended", null);
    audio.removeEventListener("error", null);

    const onMetadata = () => {
      set({ duration: audio.duration || 0, isLoading: false });
    };

    const onTimeUpdate = () => {
      set({ currentTime: audio.currentTime || 0 });
    };

    const onEnded = () => {
      set({ isPlaying: false, currentTime: 0 });
    };

    const onError = () => {
      set({
        isPlaying: false,
        isLoading: false,
        error: "Audio failed to load.",
      });
    };

    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    set({ audio });
    return audio;
  },

  loadTrack: async (track) => {
    const audio = get().initializeAudio();

    if (!track || !track.url) {
      set({
        isLoading: false,
        isPlaying: false,
        error: "Invalid track or URL.",
      });
      throw new Error("Invalid track");
    }

    try {
      audio.pause();
      set({
        isLoading: true,
        isPlaying: false,
        error: null,
        currentTrack: track,
        currentLanguage: track.language,
        currentBookId: track.bookId,
        currentChapter: track.chapter,
        currentTitle: track.title || "",
        currentTime: 0,
        duration: 0,
      });

      audio.src = track.url;
      audio.load();

      // Wait for metadata to load to confirm audio is valid
      return new Promise((resolve, reject) => {
        let timeoutId = null;
        let metadataLoaded = false;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          audio.removeEventListener("loadedmetadata", onMetadata);
          audio.removeEventListener("error", onError);
        };

        const onMetadata = () => {
          metadataLoaded = true;
          cleanup();
          // Verify we have valid duration
          if (audio.duration && audio.duration > 0) {
            resolve();
          } else {
            set({
              isLoading: false,
              isPlaying: false,
              error: "Audio has no valid duration.",
            });
            reject(new Error("Invalid duration"));
          }
        };

        const onError = () => {
          if (!metadataLoaded) {
            cleanup();
            const errorMsg =
              audio.error?.message ||
              (audio.error?.code === 4
                ? "Audio format not supported."
                : "Audio failed to load.");
            set({
              isLoading: false,
              isPlaying: false,
              error: errorMsg,
              currentTrack: null,
            });
            reject(new Error(errorMsg));
          }
        };

        audio.addEventListener("loadedmetadata", onMetadata);
        audio.addEventListener("error", onError);

        // Timeout after 10 seconds
        timeoutId = setTimeout(() => {
          if (!metadataLoaded) {
            cleanup();
            set({
              isLoading: false,
              isPlaying: false,
              error: "Audio load timeout.",
              currentTrack: null,
            });
            reject(new Error("Metadata timeout"));
          }
        }, 10000);
      });
    } catch (err) {
      set({
        isLoading: false,
        isPlaying: false,
        error: "Unable to load audio.",
        currentTrack: null,
      });
      throw err;
    }
  },

  play: async () => {
    const audio = get().initializeAudio();
    try {
      await audio.play();
      set({ isPlaying: true, isLoading: false, error: null });
    } catch (err) {
      set({
        isPlaying: false,
        isLoading: false,
        error: "Unable to play audio.",
      });
    }
  },

  pause: () => {
    const audio = get().audio;
    if (audio) audio.pause();
    set({ isPlaying: false });
  },

  toggle: async () => {
    if (get().isPlaying) {
      get().pause();
    } else {
      await get().play();
    }
  },

  stop: () => {
    const audio = get().audio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    set({
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      currentTrack: null,
      duration: 0,
      error: null,
    });
  },

  setTime: (time) => {
    const audio = get().audio;
    if (audio) audio.currentTime = time;
    set({ currentTime: time });
  },

  setDuration: (duration) => set({ duration }),
  setError: (error) =>
    set({ error, isLoading: false, isPlaying: false }),
  clearError: () => set({ error: null }),
}));

export default useAudioPlayerStore;