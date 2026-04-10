import React from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { AccessibleSelect } from "@/components/ui/accessible-select";

const BIBLE_LANGUAGES = [
  { code: "en", label: "English", available: true },
  { code: "om", label: "Afaan Oromoo (Coming Soon)", available: false }
];

// Only available options are selectable
const AVAILABLE_OPTIONS = BIBLE_LANGUAGES
  .filter((item) => item.available)
  .map((item) => ({ value: item.code, label: item.label }));

export default function BibleVersionSelector({
  value = "en",
  onChange,
  className = "",
  showLabel = true
}) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      <AccessibleSelect
        name="bible-version-selector"
        value={value}
        onValueChange={(val) => onChange?.(val)}
        options={AVAILABLE_OPTIONS}
        label={showLabel ? t("bibleVersionSelector.label", "Bible language") : undefined}
        placeholder={t("bibleVersionSelector.label", "Bible language")}
      />
      <p className="mt-2 text-xs text-gray-500">
        {t(
          "bibleVersionSelector.helperText",
          "This controls Bible content language and availability."
        )}
      </p>
    </div>
  );
}