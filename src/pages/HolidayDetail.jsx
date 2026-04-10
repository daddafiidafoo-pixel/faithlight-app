import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, BookOpen, Heart } from "lucide-react";
import { getHolidayById, formatHolidayDate, languageCodeMap, isRTLLanguage } from "@/utils/holidayService";
import { useLanguageStore } from "@/stores/languageStore";
import HolidayDevotionalSection from "@/components/holidays/HolidayDevotionalSection";

export default function HolidayDetail() {
  const { holidayId } = useParams();
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const holiday = getHolidayById(holidayId, year);
  
  const selectedLanguage = useLanguageStore(s => s.uiLanguage);
  const langCode = languageCodeMap[selectedLanguage] || 'en';
  const rtl = isRTLLanguage(langCode);

  if (!holiday) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Holiday not found</p>
          <Link to="/christian-holidays" className="text-purple-600 hover:text-purple-700 font-medium">
            Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  const labels = {
    back: {
      en: "Back",
      fr: "Retour",
      sw: "Nyuma",
      ar: "العودة",
      ti: "ኃሊ",
      om: "Deebi'i"
    },
    date: {
      en: "Date",
      fr: "Date",
      sw: "Tarehe",
      ar: "التاريخ",
      ti: "ብዓል",
      om: "Guyyaa"
    },
    meaning: {
      en: "Meaning",
      fr: "Signification",
      sw: "Maana",
      ar: "المعنى",
      ti: "ትርጉም",
      om: "Hiika"
    },
    verse: {
      en: "Bible Verse",
      fr: "Verset Biblique",
      sw: "Ayat ya Biblia",
      ar: "الآية الكتابية",
      ti: "ቃለ ሕቡር",
      om: "Aayat Kitaaba"
    },
    blessing: {
      en: "Blessing Message",
      fr: "Message de Bénédiction",
      sw: "Ujumbe wa Baraka",
      ar: "رسالة البركة",
      ti: "ብዓል ምሕረት",
      om: "Ujumbe Midhaa"
    },
    fixed: {
      en: "Fixed Holiday",
      fr: "Jour Férié Fixe",
      sw: "Likizo Imara",
      ar: "عطلة ثابتة",
      ti: "በዓል ዓቲቅ",
      om: "Likiza Mudde"
    },
    moving: {
      en: "Moving Holiday (Calculated)",
      fr: "Jour Féri Mouvant (Calculé)",
      sw: "Likizo Inayohamia (Mahesabu)",
      ar: "عطلة متحركة (محسوبة)",
      ti: "በዓል ዘሰሪር",
      om: "Likiza Shallagaa"
    },
    allHolidays: {
      en: "View All Holidays",
      fr: "Voir tous les jours fériés",
      sw: "Angalia Likizo zote",
      ar: "عرض جميع الأيام المقدسة",
      ti: "ርእዩ ሕብሪ ብዓላት",
      om: "Ilali Likiza Hundaa"
    }
  };
  
  const holiday_data = {
    title: holiday.title[langCode] || holiday.title.en,
    description: holiday.description[langCode] || holiday.description.en,
    meaning: holiday.description[langCode] || holiday.description.en,
    greeting: holiday.greeting[langCode] || holiday.greeting.en,
    reflection: holiday.reflection[langCode] || holiday.reflection.en,
    prayer: holiday.prayer[langCode] || holiday.prayer.en
  };

  const handleShare = async () => {
    const shareText = `${holiday_data.title} - ${formatHolidayDate(holiday.date, langCode)}\n\n${holiday_data.greeting}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: holiday_data.title,
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Holiday greeting copied to clipboard!");
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-purple-50 to-white ${rtl ? "rtl" : "ltr"}`} dir={rtl ? "rtl" : "ltr"}>
      <div className="max-w-3xl mx-auto p-6">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 font-medium ${rtl ? "flex-row-reverse justify-end" : ""}`}
        >
          <ArrowLeft size={20} />
          {labels.back[langCode]}
        </button>

        {/* Main Content Card */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden mb-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8">
            <div className={`flex items-start justify-between gap-4 mb-4 ${rtl ? "flex-row-reverse" : ""}`}>
              <div className={rtl ? "text-right" : "text-left"}>
                <h1 className="text-4xl font-bold mb-2">{holiday_data.title}</h1>
                <p className="text-purple-100">
                  {holiday.type === "fixed" ? labels.fixed[langCode] : labels.moving[langCode]}
                </p>
              </div>

            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            {/* Date */}
            <div className={`flex items-start gap-4 ${rtl ? "flex-row-reverse" : ""}`}>
              <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className={rtl ? "text-right" : "text-left"}>
                <h3 className="font-semibold text-slate-900 mb-1">{labels.date[langCode]}</h3>
                <p className="text-slate-700 text-lg">
                  {formatHolidayDate(holiday.date, langCode)}
                </p>
              </div>
            </div>

            {/* Meaning */}
            <div className={rtl ? "text-right" : "text-left"}>
              <h3 className="font-semibold text-slate-900 mb-3">{labels.meaning[langCode]}</h3>
              <p className="text-slate-700 leading-relaxed text-lg">
                {holiday_data.meaning}
              </p>
            </div>

            {/* Bible Verse */}
            <div className={`flex items-start gap-4 ${rtl ? "flex-row-reverse" : ""}`}>
              <BookOpen className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className={rtl ? "text-right" : "text-left"}>
                <h3 className="font-semibold text-slate-900 mb-2">{labels.verse[langCode]}</h3>
                <p className="font-medium text-slate-900 mb-2">
                  {holiday.verse.reference}
                </p>
                <p className="text-slate-700 italic leading-relaxed text-lg">
                  "{holiday.verse.text}"
                </p>
              </div>
            </div>

            {/* Greeting/Blessing */}
            <div className={`flex items-start gap-4 bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-200 ${rtl ? "flex-row-reverse" : ""}`}>
              <Heart className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
              <div className={rtl ? "text-right" : "text-left"}>
                <h3 className="font-semibold text-slate-900 mb-2">{labels.blessing[langCode]}</h3>
                <p className="text-slate-700 text-lg">
                  {holiday_data.greeting}
                </p>
              </div>
              </div>

              {/* Devotional & Share Section */}
              <HolidayDevotionalSection holiday={{...holiday, ...holiday_data}} />
              </div>
              </div>

              {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/christian-holidays"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            {labels.allHolidays[langCode]}
          </Link>
        </div>
      </div>
    </div>
  );
}