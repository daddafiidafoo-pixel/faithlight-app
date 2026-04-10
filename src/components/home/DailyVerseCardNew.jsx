import React, { useMemo } from "react";
import { RefreshCw, Share2 } from "lucide-react";
import { getDailyVerse } from "@/utils/dailyVerse";

const rtlLanguages = ["ar"];

const languageMap = {
  English: "en",
  French: "fr",
  Kiswahili: "sw",
  Arabic: "ar",
  Tigrinya: "ti",
};

const languageLabels = {
  en: "Verse of the Day",
  fr: "Verset du jour",
  sw: "Aya ya Siku",
  ar: "آية اليوم",
  ti: "ጥቕሲ ናይ መዓልቲ",
};

const descriptionLabels = {
  en: "Shown in your selected language",
  fr: "Affiché dans votre langue sélectionnée",
  sw: "Inaonyeshwa kwa lugha uliyochagua",
  ar: "يتم العرض باللغة التي اخترتها",
  ti: "ብዝመረጽካዮ ቋንቋ ይርአ",
};

const fallbackLabels = {
  en: "Translation not available yet. Showing English fallback.",
  fr: "Traduction non encore disponible. Affichage en anglais.",
  sw: "Tafsiri bado haijapatikana. Inaonyesha Kiingereza.",
  ar: "الترجمة غير متوفرة بعد. يتم عرض الإنجليزية.",
  ti: "ትርጉም ገና ኣይተዳለወን። እንግሊዝኛ ይርአ ኣሎ።",
};

export default function DailyVerseCardNew({ selectedLanguage = "English" }) {
  const languageCode = languageMap[selectedLanguage] || "en";
  const verse = useMemo(() => getDailyVerse(languageCode), [languageCode]);

  const isRTL = rtlLanguages.includes(languageCode);

  const handleShare = async () => {
    const shareText = `${verse.text} — ${verse.reference}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FaithLight Daily Verse",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Verse copied to clipboard");
    }
  };

  return (
    <div className="rounded-[28px] border border-yellow-300 bg-[#F8F4DE] p-6">
      <div className="flex items-start justify-between gap-4">
        <div
          className={isRTL ? "w-full text-right" : "w-full text-left"}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <h3 className="mb-2 text-2xl font-semibold text-orange-600">
            ✨ {languageLabels[languageCode]}
          </h3>

          <p className="mb-5 text-base text-slate-500">
            {descriptionLabels[languageCode]}
          </p>

          <p className="mb-5 text-[22px] italic leading-relaxed text-slate-900">
            "{verse.text}"
          </p>

          <p className="text-2xl font-semibold text-orange-600">
            — {verse.reference}
          </p>

          {verse.fallbackUsed && (
            <p className="mt-4 text-sm text-slate-500">
              {fallbackLabels[languageCode]}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-300 bg-white/60 text-orange-600 hover:bg-white transition"
            aria-label="Refresh verse"
          >
            <RefreshCw size={24} />
          </button>

          <button
            onClick={handleShare}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-yellow-300 bg-white/60 text-orange-600 hover:bg-white transition"
            aria-label="Share verse"
          >
            <Share2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}