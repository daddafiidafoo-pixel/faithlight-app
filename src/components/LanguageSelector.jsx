import React from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { AccessibleSelect } from "@/components/ui/accessible-select";

export default function LanguageSelector({
  label,
  className = "",
  selectClassName = "",
  showLabel = true,
  showHelperText = false
}) {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const setLanguage = useLanguageStore(s => s.setLanguage);
  const supportedLanguages = [
    { code: 'en', label: 'English' },
    { code: 'om', label: 'Afaan Oromoo' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'ti', label: 'ትግርኛ' },
  ];

  // Map language codes to native names
  const languageLabels = {
    en: "English",
    om: "Afaan Oromoo",
    am: "አማርኛ",
    ti: "ትግርኛ"
  };

  const options = supportedLanguages.map((item) => ({
    value: item.code,
    label: languageLabels[item.code] || item.label,
  }));

  return (
    <div className={className}>
      <AccessibleSelect
        name="app-language-selector"
        value={uiLanguage}
        onValueChange={(val) => setLanguage(val)}
        options={options}
        label={showLabel ? (label || "App language") : undefined}
        placeholder="App language"
        className={selectClassName || ""}
      />
      {showHelperText && (
        <p className="mt-2 text-xs text-gray-500">
          This changes the app interface language.
        </p>
      )}
    </div>
  );
}