/**
 * Normalizes app language codes to sermon preparation supported languages
 * Maps various Oromo dialects and other codes to standard "en" | "om" | "am"
 */
export function normalizeSermonLanguage(language) {
  if (!language) return "en";

  if (language === "am") return "am";

  if (
    language === "om" ||
    language === "om_eastern" ||
    language === "om_west_central"
  ) {
    return "om";
  }

  return "en";
}

/**
 * Sermon preparation output language options with native names
 */
export const sermonOutputLanguages = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "om", label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo" },
  { value: "am", label: "Amharic", nativeLabel: "አማርኛ" },
  { value: "ar", label: "Arabic", nativeLabel: "العربية", comingSoon: true },
  { value: "sw", label: "Kiswahili", nativeLabel: "Kiswahili", comingSoon: true },
  { value: "fr", label: "French", nativeLabel: "Français", comingSoon: true },
  { value: "ti", label: "Tigrigna", nativeLabel: "ትግርኛ", comingSoon: true }
];