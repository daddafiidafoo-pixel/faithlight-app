import React from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { BookOpen, Zap, Quote } from 'lucide-react';

const VERSE_BY_LANG = {
  en: { label: "Today's Verse", ref: "Mark 16:15", text: '"He said unto them, Go ye into all the world, and preach the gospel to every creature." — KJV' },
  om: { label: "Aayaticha Har'aa", ref: "Maarqos 16:15", text: '"Innis isaaniin, \'Addunyaa guutuu keessa deemaatii wangeela uumama hundumaaf lallabaa\' jedhe."' },
  am: { label: "የዛሬ ቁጥር", ref: "ማርቆስ 16:15", text: '"እርሱም፦ ወደ ዓለም ሁሉ ሂዱ ወንጌልንም ለፍጥረት ሁሉ ስበኩ አላቸው።"' },
  ar: { label: "آية اليوم", ref: "مرقس 16:15", text: '"وَقَالَ لَهُمُ: اذْهَبُوا إِلَى الْعَالَمِ أَجْمَعَ وَاكْرِزُوا بِالإِنْجِيلِ لِلْخَلِيقَةِ كُلِّهَا."' },
  fr: { label: "Verset du jour", ref: "Marc 16:15", text: '"Il leur dit: Allez par tout le monde, et prêchez la bonne nouvelle à toute la création." — LSG' },
};

/**
 * HeroSectionFaithLight
 * 
 * Top hero section for Home page
 * Different messaging for Free vs Premium users
 */
export default function HeroSectionFaithLight({
  isPremium,
  onContinueReading,
  onCreateSermon,
  onUpgrade,
  minutesRemaining = null,
}) {
  const { t, lang } = useI18n();
  const verse = VERSE_BY_LANG[lang] || VERSE_BY_LANG.en;

  const VerseBlock = () => (
    <div className="mt-6 bg-white/30 rounded-xl p-4 border border-white/40 backdrop-blur-sm" dir="ltr" style={{ textAlign: 'left' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Quote className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-75">{verse.label}</span>
        <span className="text-xs font-semibold opacity-60 ml-1">— {verse.ref}</span>
      </div>
      <p className="text-sm leading-relaxed italic opacity-90">{verse.text}</p>
    </div>
  );

  if (isPremium) {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('hero.premium.title', 'Full Access — Bible, AI Tools & Academy')}
        </h1>
        <p className="text-indigo-100 mb-6">
          {t('hero.premium.subtitle', 'You have complete access to all FaithLight study features')}
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={onCreateSermon}
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold gap-2"
          >
            <Zap className="w-4 h-4" />
            {t('hero.sermon', 'Create a Sermon')}
          </Button>
          <Button
            onClick={onContinueReading}
            variant="outline"
            className="border-white text-white hover:bg-indigo-700 gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {t('hero.continueStudy', 'Continue Study Plan')}
          </Button>
        </div>
        <VerseBlock />
      </div>
    );
  }

  // Free user hero
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mb-8">
      {minutesRemaining && minutesRemaining > 0 && minutesRemaining <= 6 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-900">
            {t('hero.limitWarning', `${minutesRemaining} minutes remaining today. Upgrade for unlimited access.`).replace('{{minutes}}', minutesRemaining)}
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ direction: 'ltr', textAlign: 'left' }}>
        {t('hero.free.title', 'Grow in understanding of Scripture — every day')}
      </h1>
      <p className="text-gray-700 mb-6" style={{ direction: 'ltr', textAlign: 'left' }}>
        {t('hero.free.subtitle', 'Read, listen, and study with AI-assisted Bible study tools')}
      </p>
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={onContinueReading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2"
        >
          <BookOpen className="w-4 h-4" />
          {t('hero.continueReading', 'Continue Reading')}
        </Button>
        <Button
          onClick={onUpgrade}
          variant="outline"
          className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold gap-2"
        >
          <Zap className="w-4 h-4" />
          {t('premium.upgrade', 'Upgrade to Premium')}
        </Button>
      </div>

      {/* Mark 16:15 verse block — language-aware */}
      <div className="mt-6 bg-white/60 rounded-xl p-4 border border-indigo-100" dir="ltr" style={{ textAlign: 'left' }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Quote className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">{verse.label}</span>
          <span className="text-xs font-semibold text-indigo-400 ml-1">— {verse.ref}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed italic">{verse.text}</p>
      </div>
    </div>
  );
}