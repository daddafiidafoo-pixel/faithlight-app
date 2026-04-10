import React from "react";
import { Calendar, BookOpen, Heart } from "lucide-react";
import { formatHolidayDate, languageCodeMap, isRTLLanguage } from "@/utils/holidayService";
import { Link } from "react-router-dom";
import { useLanguageStore } from "@/stores/languageStore";

export default function HolidayCard({ holiday }) {
  const selectedLanguage = useLanguageStore(s => s.uiLanguage);
  const langCode = languageCodeMap[selectedLanguage] || 'en';
  const rtl = isRTLLanguage(langCode);
  
  const labels = {
    fixed: {
      en: "Fixed",
      fr: "Fixe",
      sw: "Imara",
      ar: "ثابت",
      ti: "ዓቲቅ",
      om: "Mudde"
    },
    calculated: {
      en: "Calculated",
      fr: "Calculé",
      sw: "Mahesabu",
      ar: "محسوب",
      ti: "ዘሰሪር",
      om: "Shallagaa"
    }
  };
  
  const holiday_data = {
    title: holiday.title[langCode] || holiday.title.en,
    description: holiday.description[langCode] || holiday.description.en,
    meaning: holiday.description[langCode] || holiday.description.en,
    greeting: holiday.greeting[langCode] || holiday.greeting.en
  };
  return (
    <Link to={`/holiday/${holiday.id}`}>
      <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${rtl ? "rtl" : "ltr"}`} dir={rtl ? "rtl" : "ltr"}>
        <div className={`flex items-start justify-between gap-4 mb-3 ${rtl ? "flex-row-reverse" : ""}`}>
          <h3 className={`text-xl font-semibold text-slate-900 ${rtl ? "text-right" : "text-left"}`}>
            {holiday_data.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            holiday.type === "fixed" 
              ? "bg-blue-100 text-blue-700" 
              : "bg-purple-100 text-purple-700"
          }`}>
            {holiday.type === "fixed" ? labels.fixed[langCode] : labels.calculated[langCode]}
          </span>
        </div>

        <div className={`flex items-center gap-2 text-slate-600 mb-4 ${rtl ? "flex-row-reverse justify-end" : ""}`}>
          <Calendar size={16} />
          <span className="text-sm font-medium">
            {formatHolidayDate(holiday.date, langCode)}
          </span>
        </div>

        <p className={`text-slate-700 text-sm mb-4 line-clamp-2 ${rtl ? "text-right" : "text-left"}`}>
          {holiday_data.meaning}
        </p>

        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className={`flex gap-2 ${rtl ? "flex-row-reverse" : ""}`}>
            <BookOpen size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div className={`text-sm ${rtl ? "text-right" : "text-left"}`}>
              <p className="font-medium text-slate-900">{holiday.verse.reference}</p>
              <p className="text-slate-600 italic text-xs line-clamp-1">
                "{holiday.verse.text}"
              </p>
            </div>
          </div>

          <div className={`flex gap-2 ${rtl ? "flex-row-reverse" : ""}`}>
            <Heart size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <p className={`text-sm text-slate-700 italic line-clamp-1 ${rtl ? "text-right" : "text-left"}`}>
              {holiday_data.greeting}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}