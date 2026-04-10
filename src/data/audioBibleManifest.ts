import type { AudioLanguageCode } from "./audioBibleLanguages";

export type AudioChapter = {
  book: string;
  chapter: number;
  audioUrl: string;
  durationSeconds?: number;
};

export type AudioBibleManifest = Record<
  AudioLanguageCode,
  Record<string, Record<number, AudioChapter>>
>;

/**
 * Audio Bible Manifest
 *
 * Each language contains books, which contain chapters pointing to audio files.
 * Replace the placeholder URLs with your actual audio files.
 *
 * You must provide licensed audio files. Do NOT use copyrighted material.
 * Consider public domain, creative commons, or your own hosted files.
 */
export const audioBibleManifest: AudioBibleManifest = {
  en: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/en/matthew/01.mp3",
      },
      2: {
        book: "Matthew",
        chapter: 2,
        audioUrl: "/audio/en/matthew/02.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/en/exodus/14.mp3",
      },
    },
  },

  om: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/om/matthew/01.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/om/exodus/14.mp3",
      },
    },
  },

  am: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/am/matthew/01.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/am/exodus/14.mp3",
      },
    },
  },

  fr: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/fr/matthew/01.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/fr/exodus/14.mp3",
      },
    },
  },

  sw: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/sw/matthew/01.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/sw/exodus/14.mp3",
      },
    },
  },

  ar: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/ar/matthew/01.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/ar/exodus/14.mp3",
      },
    },
  },

  ti: {
    Matthew: {
      1: {
        book: "Matthew",
        chapter: 1,
        audioUrl: "/audio/ti/matthew/01.mp3",
      },
    },
    Exodus: {
      14: {
        book: "Exodus",
        chapter: 14,
        audioUrl: "/audio/ti/exodus/14.mp3",
      },
    },
  },
};