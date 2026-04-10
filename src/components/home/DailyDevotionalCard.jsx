import { useEffect, useMemo } from 'react';
import { RefreshCw, Share2, BookOpen } from 'lucide-react';
import { getDailyVerseWithReflection } from '@/utils/dailyVerse';
import { useLanguageStore } from '@/stores/languageStore';
import ScriptureAudioPlayer from '@/components/audio/ScriptureAudioPlayer';

export default function DailyDevotionalCard() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const verseData = useMemo(() => getDailyVerseWithReflection(uiLanguage), [uiLanguage]);

  const handleShare = () => {
    const { verse, reflection } = verseData;
    const text = `${verse.reference}\n\n"${verse.text}"\n\n✨ ${reflection.text}`;
    if (navigator.share) {
      navigator.share({
        title: 'FaithLight Daily Verse',
        text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const { verse, reflection } = verseData;
  const isRTL = verse.isRTL;

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm space-y-3 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {uiLanguage === 'fr' ? 'Verset et réflexion du jour' : 
           uiLanguage === 'sw' ? 'Ayat na Tafakari ya Siku' : 
           uiLanguage === 'ar' ? 'آية اليوم والتأمل' :
           uiLanguage === 'ti' ? 'ምዕራ ወምስጋና ዘወደእ' :
           uiLanguage === 'om' ? 'Aayata fi Yaadannoo Guyyaa' :
           uiLanguage === 'am' ? 'የዕለቱ ጥቅስ እና ነጸብራቅ' :
           'Daily Verse & Reflection'}
        </h2>
        <RefreshCw className="w-4 h-4 text-gray-400" />
      </div>

      <ScriptureAudioPlayer
        book="Scripture"
        chapter={1}
        verseStart={1}
        verseEnd={1}
        verseText={verse.text}
        language={uiLanguage}
      />

      <div className="rounded-xl bg-amber-50 p-4 space-y-2">
         <p className={`text-lg italic ${isRTL ? 'text-right' : 'text-left'}`}>"{verse.text}"</p>
         <p className={`font-semibold text-amber-700 ${isRTL ? 'text-right' : 'text-left'}`}>— {verse.reference}</p>
       </div>

      <div className="rounded-xl bg-purple-50 p-4 space-y-2">
        <h3 className="font-semibold">
          {uiLanguage === 'fr' ? 'Réflexion' : 
           uiLanguage === 'sw' ? 'Tafakari' : 
           uiLanguage === 'ar' ? 'التأمل' :
           uiLanguage === 'ti' ? 'ምስጋና' :
           uiLanguage === 'om' ? 'Yaadannoo' :
           uiLanguage === 'am' ? 'ነጸብራቅ' :
           'Reflection'}
        </h3>
        <p className={`text-gray-700 text-sm leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>{reflection.text}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50 text-sm"
        >
          <Share2 className="w-4 h-4" />
          {uiLanguage === 'fr' ? 'Partager' : uiLanguage === 'sw' ? 'Sambaza' : uiLanguage === 'ar' ? 'شارك' : uiLanguage === 'om' ? 'Qoodi' : uiLanguage === 'am' ? 'አጋራ' : 'Share'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50 text-sm">
          <BookOpen className="w-4 h-4" />
          {uiLanguage === 'fr' ? 'Lire' : uiLanguage === 'sw' ? 'Soma' : uiLanguage === 'ar' ? 'اقرأ' : uiLanguage === 'om' ? 'Dubbisi' : uiLanguage === 'am' ? 'አንብብ' : 'Read'}
        </button>
      </div>
    </div>
  );
}