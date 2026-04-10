export type AudioLanguageCode = "en" | "om" | "am" | "fr" | "sw" | "ar" | "ti";

export const audioBibleLanguages = [
  { code: "en", label: "English" },
  { code: "om", label: "Afaan Oromoo" },
  { code: "am", label: "አማርኛ" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "ar", label: "العربية" },
  { code: "ti", label: "ትግርኛ" },
] as const;