import React from 'react';
import { Sparkles, RefreshCw, Share2 } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';
import { useTodayVerse } from '@/hooks/useTodayVerse';

const UI_TRANSLATIONS = {
  en: { verseOfDay: "Verse of the Day", fallbackNote: "English translation used" },
  om: { verseOfDay: "Aayata Guyyaa", fallbackNote: "Jechootni Ingiriiziiti fayyadamte" },
  am: { verseOfDay: "የዕለቱ ቃል", fallbackNote: "የእንግሊዘኛ ትርጉም ጥቅም ላይ ውሏል" },
  ti: { verseOfDay: "ናይ መዓልቲ ጥቕሲ", fallbackNote: "ናይ እንግሊዝ ትርጉም ተሰቒ" },
  es: { verseOfDay: "Versículo del Día", fallbackNote: "Se utilizó traducción al inglés" },
  fr: { verseOfDay: "Verset du Jour", fallbackNote: "Traduction anglaise utilisée" },
  ar: { verseOfDay: "آية اليوم", fallbackNote: "تم استخدام الترجمة الإنجليزية" },
};

export default function DailyVerseSection() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const { verse, loading, usedFallback } = useTodayVerse(uiLanguage);
  const uiText = UI_TRANSLATIONS[uiLanguage] || UI_TRANSLATIONS.en;

  if (loading) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 rounded bg-amber-200" />
          <div className="h-4 w-32 rounded bg-amber-200" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-full rounded bg-amber-100" />
          <div className="h-6 w-5/6 rounded bg-amber-100" />
          <div className="h-5 w-1/3 rounded bg-amber-100 mt-4" />
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-700 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{uiText.verseOfDay}</span>
        </div>
        <p className="text-slate-600 text-sm">No verse available for today.</p>
      </div>
    );
  }

  const handleRefresh = () => {
    // Force component re-render by changing language momentarily (or implement local state refresh)
    window.location.reload(); // Simple approach for now
  };

  const handleShare = async () => {
    if (!verse) return;
    
    const text = `"${verse.text}"\n\n— ${verse.reference}\n\nShared from FaithLight`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: verse.reference,
          text
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Verse copied to clipboard!');
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-700">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{uiText.verseOfDay}</span>
        </div>
        
        {verse && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="h-8 w-8 rounded-lg text-amber-700 hover:bg-amber-100 flex items-center justify-center transition active:scale-95"
              title="Refresh"
              aria-label="Refresh verse"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleShare}
              className="h-8 w-8 rounded-lg text-amber-700 hover:bg-amber-100 flex items-center justify-center transition active:scale-95"
              title="Share"
              aria-label="Share verse"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <blockquote className="text-slate-800 text-lg leading-relaxed italic font-light">
        "{verse.text}"
      </blockquote>
      
      <p className="mt-4 text-xs font-medium text-amber-700 uppercase tracking-wide">— {verse.reference}</p>

      {usedFallback && uiLanguage !== 'en' && (
        <p className="mt-3 text-xs text-slate-500">{uiText.fallbackNote}</p>
      )}
    </div>
  );
}