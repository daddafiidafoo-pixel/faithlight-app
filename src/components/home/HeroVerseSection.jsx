import React, { useState, useEffect } from 'react';
import { Volume2, Wand2, Bookmark, Share2, Loader2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';

// Each verse has en + om (Afaan Oromoo). If om is null → fallback to en + show note.
const DAILY_VERSES = [
  {
    ref: 'John 3:16',
    ref_om: 'Yohannis 3:16',
    en: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    om: 'Waaqayyo addunyaa kana akkuma jaallateef, Ilma isaa tokkicha kenneef; nama ilma sana amanu hundi hin badne, garuu jireenya bara baraa qabaata.',
  },
  {
    ref: 'Psalm 119:105',
    ref_om: 'Faarfannaa 119:105',
    en: 'Your word is a lamp to my feet and a light to my path.',
    om: 'Dubbiin kee meeshaa ija qarriffaatti miila kootiif fi ifa karaa kootiif dha.',
  },
  {
    ref: 'Romans 8:28',
    ref_om: 'Roomaa 8:28',
    en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    om: 'Kan Waaqayyoon jaallatan, kan fedhaa isaa irratti waamaman hunda irratti Waaqayyo waan gaarii hojjeta jennee ni beekna.',
  },
  {
    ref: 'Proverbs 3:5-6',
    ref_om: 'Fakkeenya 3:5-6',
    en: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    om: 'Yaada kee kana irratti hin hirkatin; garaa kee guutuudhaan Gooftaa irratti irkadhu. Karaalee kee hunda keessatti isa beeki; inni karaalee kee qajeelcha.',
  },
  {
    ref: 'Philippians 4:13',
    ref_om: 'Philiiphisiyuus 4:13',
    en: 'I can do all this through him who gives me strength.',
    om: 'Waan hunda kan na jabeessuun godhadhaan hunda gochuu nan danda\'a.',
  },
  {
    ref: 'Isaiah 41:10',
    ref_om: 'Raajii Isaayyaas 41:10',
    en: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.',
    om: 'Kanaafuu hin sodaatin; ani si wajjinin jira. Hin rifatin; ani Waaqa kee dha. Ani sin jabeessa, sin gargaara; harka koo mirgaa qajeelaadhaan sin utuba.',
  },
  {
    ref: 'Jeremiah 29:11',
    ref_om: 'Ermiyaas 29:11',
    en: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    om: 'Karoora isiniif qabe nan beeka, Gooftaan ni jedha — karoora nagaa isiniif qabu malee hamaa isiniif hin qabu; karoora abdii fi future gaarii isiniif kennuuf.',
  },
];

const getGreetingKey = () => {
  const hour = new Date().getHours();
  if (hour < 12) return ['daily.goodMorning', 'Good Morning'];
  if (hour < 17) return ['daily.goodAfternoon', 'Good Afternoon'];
  return ['daily.goodEvening', 'Good Evening'];
};

export default function HeroVerseSection({ user }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const idx = new Date().getDate() % DAILY_VERSES.length;
    setVerse(DAILY_VERSES[idx]);
  }, []);

  // Derive current language display
  const isOromo = lang === 'om';
  const verseRef = verse ? (isOromo ? verse.ref_om : verse.ref) : null;
  const verseText = verse ? (isOromo && verse.om ? verse.om : verse.en) : null;
  const showFallbackNote = isOromo && verse && !verse.om;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = () => {
    if (!verse) return;
    const shareText = `"${verseText}" — ${verseRef}`;
    if (navigator.share) {
      navigator.share({ text: shareText, title: 'FaithLight Daily Verse' }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
    }
  };

  const firstName = user?.full_name?.split(' ')[0];
  const [greetKey, greetFallback] = getGreetingKey();

  return (
    <div className="relative rounded-3xl overflow-hidden mb-6"
      style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #312E81 50%, #7C3AED 100%)' }}>
      {/* Glow decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative px-6 pt-8 pb-6">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-blue-200 text-sm font-medium">
            {t(greetKey, greetFallback)}{firstName ? `, ${firstName}` : ''} ☀️
          </p>
          <h1 className="text-white text-2xl font-bold mt-1">
            {t('home.growFaith', 'Grow your faith today.')}
          </h1>
        </div>

        {/* Verse Card */}
        {verse ? (
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-amber-300" />
              <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">
                {t('daily.todaysVerse', 'Verse of the Day')}
              </p>
            </div>
            <p className="text-blue-100 text-sm font-semibold mb-2">{verseRef}</p>
            <p className="text-white text-base leading-relaxed italic">
              "{verseText}"
            </p>
            {showFallbackNote && (
              <p className="text-blue-300 text-xs mt-2 italic">
                Afaan Oromoo irratti ammas hin argamne — English shown.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white/15 rounded-2xl p-5 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white/60" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <button
            onClick={() => navigate(createPageUrl('AudioBibleV2'))}
            className="flex flex-col items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-xl py-3 px-2 transition-colors border border-white/10"
          >
            <Volume2 className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium">{t('daily.listen', 'Listen')}</span>
          </button>
          <button
            onClick={() => navigate(createPageUrl('AIBibleCompanion'))}
            className="flex flex-col items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-xl py-3 px-2 transition-colors border border-white/10"
          >
            <Wand2 className="w-4 h-4 text-amber-300" />
            <span className="text-white text-xs font-medium">{t('daily.explain', 'Explain')}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex flex-col items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-xl py-3 px-2 transition-colors border border-white/10"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'text-amber-300 fill-amber-300' : 'text-white'}`} />
            <span className="text-white text-xs font-medium">{saved ? '✓' : t('daily.save', 'Save')}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-xl py-3 px-2 transition-colors border border-white/10"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium">{t('daily.share', 'Share')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}