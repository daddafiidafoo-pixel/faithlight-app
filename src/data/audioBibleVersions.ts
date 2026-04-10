import type { AudioLanguageCode } from "./audioBibleLanguages";

export type AudioBibleVersion = {
  id: string;
  language: AudioLanguageCode;
  title: string;
  shortLabel: string;
  direction?: "ltr" | "rtl";
};

export const audioBibleVersions: Record<AudioLanguageCode, AudioBibleVersion> =
  {
    en: {
      id: "eng-default",
      language: "en",
      title: "English Audio Bible",
      shortLabel: "English",
      direction: "ltr",
    },
    om: {
      id: "orm-default",
      language: "om",
      title: "Afaan Oromoo Audio Bible",
      shortLabel: "Afaan Oromoo",
      direction: "ltr",
    },
    am: {
      id: "amh-default",
      language: "am",
      title: "አማርኛ የድምፅ መጽሐፍ ቅዱስ",
      shortLabel: "አማርኛ",
      direction: "ltr",
    },
    fr: {
      id: "fra-default",
      language: "fr",
      title: "Bible Audio Français",
      shortLabel: "Français",
      direction: "ltr",
    },
    sw: {
      id: "swh-default",
      language: "sw",
      title: "Biblia ya Sauti ya Kiswahili",
      shortLabel: "Kiswahili",
      direction: "ltr",
    },
    ar: {
      id: "arb-default",
      language: "ar",
      title: "الكتاب المقدس الصوتي",
      shortLabel: "العربية",
      direction: "rtl",
    },
    ti: {
      id: "tir-default",
      language: "ti",
      title: "መጽሓፍ ቅዱስ ብድምጺ",
      shortLabel: "ትግርኛ",
      direction: "ltr",
    },
  };