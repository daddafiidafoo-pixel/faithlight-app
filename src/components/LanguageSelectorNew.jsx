import React from "react";
import { useLanguage } from "@/context/LanguageProvider";

const languageOptions = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "om", label: "Afaan Oromo", nativeLabel: "Afaan Oromo" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "am", label: "Amharic", nativeLabel: "አማርኛ" },
  { code: "sw", label: "Swahili", nativeLabel: "Kiswahili" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
];

export default function LanguageSelector({
  className = "",
  showLabel = true,
  showNativeLabel = true,
  useTranslatedLabel = true,
  variant = "default",
}) {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const labelText = useTranslatedLabel
    ? t("common", "selectLanguage", "Select language")
    : "Select language";

  const baseSelectClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200";

  const compactSelectClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200";

  const selectClass = variant === "compact" ? compactSelectClass : baseSelectClass;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <label
          htmlFor="faithlight-language-selector"
          className={`text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
        >
          {labelText}
        </label>
      )}

      <select
        id="faithlight-language-selector"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className={`${selectClass} ${isRTL ? "text-right" : "text-left"}`}
        dir={isRTL ? "rtl" : "ltr"}
        aria-label={labelText}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {showNativeLabel
              ? `${option.nativeLabel}${option.nativeLabel !== option.label ? ` (${option.label})` : ""}`
              : option.label}
          </option>
        ))}
      </select>
    </div>
  );
}