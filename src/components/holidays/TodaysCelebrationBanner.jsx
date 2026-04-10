import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Sparkles } from "lucide-react";
import { getChristianHolidays, formatHolidayDate, languageCodeMap, isRTLLanguage } from "@/utils/holidayService";
import { useLanguageStore } from "@/stores/languageStore";

export default function TodaysCelebrationBanner() {
  const selectedLanguage = useLanguageStore(s => s.uiLanguage);
  const langCode = languageCodeMap[selectedLanguage] || 'en';
  
  const upcomingHoliday = useMemo(() => {
    const year = new Date().getFullYear();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    
    const holidays = getChristianHolidays(year);
    
    // Check if any holiday is today or tomorrow
    return holidays.find(h => h.date === today || h.date === tomorrowStr);
  }, []);

  if (!upcomingHoliday) {
    return null;
  }

  const isToday = upcomingHoliday.date === new Date().toISOString().split("T")[0];
  const rtl = isRTLLanguage(langCode);

  // Translated UI labels
  const labels = {
    today: {
      en: "🎉 Today's Celebration",
      fr: "🎉 Célébration du jour",
      sw: "🎉 Sherehe ya leo",
      ar: "🎉 احتفال اليوم",
      ti: "🎉 ናይ ሎሚ በዓል",
      om: "🎉 Ayyaana har'aa"
    },
    tomorrow: {
      en: "⏰ Tomorrow's Celebration",
      fr: "⏰ Célébration de demain",
      sw: "⏰ Sherehe ya kesho",
      ar: "⏰ احتفال الغد",
      ti: "⏰ ናይ ትም በዓል",
      om: "⏰ Ayyaana bor"
    },
    viewDetails: {
      en: "View Details",
      fr: "Voir les détails",
      sw: "Angalia maelezo",
      ar: "عرض التفاصيل",
      ti: "ርእዩ ዝርዝር",
      om: "Bal'inaan ilaali"
    }
  };
  
  const holiday = {
    title: upcomingHoliday.title[langCode] || upcomingHoliday.title.en,
    description: upcomingHoliday.description[langCode] || upcomingHoliday.description.en,
    meaning: upcomingHoliday.description[langCode] || upcomingHoliday.description.en
  };
  
  return (
    <Link to={`/holiday/${upcomingHoliday.id}`}>
      <div className="mb-6 cursor-pointer" dir={rtl ? "rtl" : "ltr"}>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-6 hover:shadow-lg transition-all">
          {/* Decorative background */}
          <div className={`absolute top-0 ${rtl ? "left-0" : "right-0"} w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full ${rtl ? "-ml-16" : "-mr-16"} -mt-16`}></div>
          
          <div className="relative z-10">
            <div className={`flex items-start gap-4 ${rtl ? "flex-row-reverse" : ""}`}>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                  <Sparkles size={24} />
                </div>
              </div>
              
              <div className="flex-1">
                <div className={`flex items-baseline gap-2 mb-1 ${rtl ? "flex-row-reverse justify-end" : ""}`}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {isToday ? labels.today[langCode] : labels.tomorrow[langCode]}
                  </p>
                </div>
                
                <h3 className={`text-2xl font-bold text-slate-900 mb-2 ${rtl ? "text-right" : "text-left"}`}>
                  {holiday.title}
                </h3>
                
                <div className={`flex items-center gap-2 text-slate-600 mb-3 ${rtl ? "flex-row-reverse justify-end" : ""}`}>
                  <Calendar size={16} />
                  <span className="text-sm font-medium">
                    {formatHolidayDate(upcomingHoliday.date, langCode)}
                  </span>
                </div>
                
                <p className={`text-slate-700 text-sm mb-4 ${rtl ? "text-right" : "text-left"}`}>
                  {holiday.description}
                </p>
                
                <div className={`flex items-center gap-2 text-amber-700 font-medium text-sm hover:text-amber-800 ${rtl ? "flex-row-reverse justify-end" : ""}`}>
                  {labels.viewDetails[langCode]}
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}