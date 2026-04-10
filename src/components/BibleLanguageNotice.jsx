import React from "react";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function BibleLanguageNotice({ appLanguage }) {
  const { t } = useLanguage();

  // Only show if app language is Oromo but Bible content isn't available yet
  if (appLanguage !== "om") {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">
        {t(
          "bibleLanguageNotice.oromoBibleSoon",
          "Afaan Oromoo Bible is coming soon. You can still read the English Bible for now."
        )}
      </p>
    </div>
  );
}