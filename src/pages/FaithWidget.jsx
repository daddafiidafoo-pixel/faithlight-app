import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Download, Share2, Instagram, MessageCircle, RefreshCw, Check, Heart, BookMarked } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import VerseShareSheet from '@/components/share/VerseShareSheet';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import html2canvas from 'html2canvas';
import { useLanguageStore } from '@/components/languageStore';
import { t } from '@/components/i18n/translations';
import AudioPrayerButton from '@/components/prayer/AudioPrayerButton';
import VerseShareButton from '@/components/widget/VerseShareButton';
import DailyVerseAudioPlayer from '@/components/widget/DailyVerseAudioPlayer';
import WidgetLanguageSwitcher from '@/components/widget/WidgetLanguageSwitcher';

const BACKGROUNDS = [
  { id: 'purple',  i18nKey: 'royal',   style: 'linear-gradient(135deg, #6C5CE7 0%, #8E7CFF 100%)' },
  { id: 'sunrise', i18nKey: 'sunrise', style: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' },
  { id: 'forest',  i18nKey: 'forest',  style: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)' },
  { id: 'ocean',   i18nKey: 'ocean',   style: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%)' },
  { id: 'rose',    i18nKey: 'rose',    style: 'linear-gradient(135deg, #881337 0%, #f43f5e 100%)' },
  { id: 'night',   i18nKey: 'night',   style: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { id: 'dawn',    i18nKey: 'dawn',    style: 'linear-gradient(160deg, #fde68a 0%, #fca5a5 50%, #c4b5fd 100%)' },
  { id: 'earth',   i18nKey: 'earth',   style: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)' },
];

const FONTS = [
  { id: 'serif',   i18nKey: 'classic',  style: 'Georgia, serif',                        verseSize: 22, refSize: 14 },
  { id: 'modern',  i18nKey: 'modern',   style: 'Inter, sans-serif',                     verseSize: 20, refSize: 13 },
  { id: 'elegant', i18nKey: 'elegant',  style: '"Palatino Linotype", Palatino, serif',   verseSize: 21, refSize: 14 },
  { id: 'bold',    i18nKey: 'bold',     style: 'system-ui, sans-serif',                 verseSize: 19, refSize: 13 },
];

const DEFAULT_VERSES = {
  en: {
    verseText: 'I can do all things through Christ who strengthens me.',
    reference: 'Philippians 4:13',
  },
  om: {
    verseText: 'Jabina Gooftaan anaaf kennuun waan hundumaa gochuu nan danda\'a.',
    reference: 'Filiphisiiyus 4:13',
  },
  sw: {
    verseText: 'Nayaweza mambo yote katika Kristo anitiaye nguvu.',
    reference: 'Wafilipi 4:13',
  },
  fr: {
    verseText: 'Je peux tout faire par Christ qui m\'affermit.',
    reference: 'Philippiens 4:13',
  },
  ar: {
    verseText: 'استطيع كل شيء في المسيح الذي يقويني.',
    reference: 'فيلبي 4:13',
  },
  am: {
    verseText: 'ክርስቶስ የሚከነክኑ በመሆኑ ሁሉንም ነገር ማድረግ እችላለሁ።',
    reference: 'ፊልጵስዩስ 4:13',
  },
};

export default function FaithWidget() {
  const cardRef = useRef(null);
  const uiLanguage = useLanguageStore((s) => s.uiLanguage);
  const bibleLanguage = useLanguageStore((s) => s.bibleLanguage);
  const audioLanguage = useLanguageStore((s) => s.audioLanguage);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fallbackLanguage, setFallbackLanguage] = useState(null);
  const navigate = useNavigate();

  const fetchActiveReadingPlan = async () => {
    try {
      if (!isLoggedIn) return null;
      const user = await base44.auth.me();
      if (!user) return null;

      const progress = await base44.entities.ReadingPlanProgress.filter({
        userId: user.email,
        isCompleted: false,
      });

      if (progress && progress.length > 0) {
        const plan = await base44.entities.ReadingPlan.filter({ id: progress[0].planId });
        if (plan && plan.length > 0) {
          const planData = plan[0];
          const dayData = planData.verses?.find(v => v.day === progress[0].currentDay);
          if (dayData) {
            const verseRes = await base44.entities.BibleVerse.filter({
              language: 'en',
              book_code: dayData.bookCode,
              chapter_number: dayData.chapter,
              verse_number: dayData.verse,
            });
            if (verseRes && verseRes.length > 0) {
              return {
                verseText: verseRes[0].verse_text,
                reference: `${dayData.bookCode} ${dayData.chapter}:${dayData.verse}`,
                bookCode: dayData.bookCode,
                chapter: dayData.chapter,
                verse: dayData.verse,
              };
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching reading plan:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        setIsLoggedIn(!!user);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchVerse = async () => {
      setLoading(true);
      setFallbackLanguage(null);
      setIsFavorited(false);
      let verseToSet = null;

      try {
        // Check for active reading plan first
        const planVerse = await fetchActiveReadingPlan();
        if (planVerse && mounted) {
          verseToSet = planVerse;
        } else {
          // Try to fetch daily verse from API
          const today = new Date().toISOString().split("T")[0];
          try {
            const res = await base44.functions.invoke('getDailyVerse', {
              bibleLanguage: bibleLanguage || 'en',
              date: today,
            });
            if (res.data?.success && res.data?.data) {
              const d = res.data.data;
              verseToSet = { verseText: d.text, reference: d.reference, bookCode: d.bookCode };
              setFallbackLanguage(res.data?.fallbackLanguage || null);
            }
          } catch (err) {
            console.error('Failed to fetch verse from API:', err);
          }
        }

        // Fall back to default verse if nothing found
        if (!verseToSet) {
          verseToSet = DEFAULT_VERSES[bibleLanguage] || DEFAULT_VERSES.en;
        }

        if (mounted) {
          setVerse(verseToSet);

          // Log verse view if logged in and not default verse
          if (isLoggedIn && verseToSet !== DEFAULT_VERSES[bibleLanguage] && verseToSet !== DEFAULT_VERSES.en) {
            try {
              await base44.functions.invoke('logVerseView', {
                reference: verseToSet.reference,
              });
            } catch (err) {
              console.error('Failed to log verse:', err);
            }

            // Check if favorited
            try {
              const user = await base44.auth.me();
              const favorites = await base44.entities.Favorites.filter({
                userId: user.email,
                reference: verseToSet.reference,
              });
              setIsFavorited(favorites?.length > 0);
            } catch (err) {
              console.error('Failed to check favorites:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching verse:', err);
        if (mounted) {
          setVerse(DEFAULT_VERSES[bibleLanguage] || DEFAULT_VERSES.en);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVerse();
    return () => { mounted = false; };
  }, [bibleLanguage, isLoggedIn]);

  const exportImage = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      return canvas.toDataURL('image/png');
    } finally {
      setExporting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("Please log in to save favorites.");
      return;
    }
    
    try {
      const [ref, chapterVerse] = verse.reference.split(' ');
      const [ch, v] = chapterVerse.split(':');
      
      await base44.functions.invoke('toggleFavorite', {
        bookCode: verse.bookCode || ref,
        chapter: parseInt(ch),
        verse: parseInt(v),
        reference: verse.reference,
        action: isFavorited ? 'remove' : 'add',
      });
      
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite");
    }
  };

  const handleDownload = async () => {
    const dataUrl = await exportImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `faithlight-verse-${Date.now()}.png`;
    a.click();
  };

  const handleShare = async () => {
    const dataUrl = await exportImage();
    if (!dataUrl) return;

    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'faithlight-verse.png', { type: 'image/png' });
      navigator.share({ files: [file], text: `"${verse?.verseText}" — ${verse?.reference} | FaithLight` });
    } else {
      // Fallback: copy text
      navigator.clipboard?.writeText(`"${verse?.verseText}" — ${verse?.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = async () => {
    const text = encodeURIComponent(`"${verse?.verseText}" — ${verse?.reference}\n\nShared via FaithLight 🙏`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-8">
         <div className="flex items-center justify-between mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">✨ {t(uiLanguage, 'create')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t(uiLanguage, 'share')}</p>
          </div>
          <div className="flex items-center gap-2">
            <WidgetLanguageSwitcher aria-label="Change language" />
            <ThemeSwitcher aria-label="Toggle dark mode" />
          </div>
         </div>

        {/* Preview Card — this is what gets exported */}
        <div className="flex justify-center mb-6">
          <div
            ref={cardRef}
            style={{
              width: 360,
              aspectRatio: '9/16',
              maxHeight: 640,
              background: bg.style,
              borderRadius: 24,
              padding: '48px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Subtle texture overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)', borderRadius: 24 }} />

            {/* Cross watermark */}
            <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', opacity: 0.15, fontSize: 48, color: 'white' }}>✝</div>

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <p style={{
                 color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700,
                 letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24,
                 fontFamily: font.style,
               }}>
                 {t(uiLanguage, 'todayVerse')}
               </p>

              {loading ? (
                <div style={{ width: 200, height: 80, background: 'rgba(255,255,255,0.15)', borderRadius: 12 }} />
              ) : verse && (
                <>
                  <p style={{
                    color: 'white',
                    fontSize: font.verseSize,
                    fontFamily: font.style,
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    marginBottom: 24,
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    "{verse.verseText}"
                  </p>
                  <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.4)', margin: '0 auto 16px' }} />
                  <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: font.refSize,
                    fontFamily: font.style,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}>
                    — {verse.reference}
                  </p>
                  {fallbackLanguage && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: font.style, textAlign: 'center', marginTop: 16 }}>
                      {t(uiLanguage, 'verseDisplayedInEnglish')}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* FaithLight branding */}
            <p style={{
              position: 'absolute', bottom: 20,
              color: 'rgba(255,255,255,0.4)', fontSize: 11,
              fontFamily: font.style, letterSpacing: '0.08em',
            }}>
              {t('share.madeWithFaithLight', 'Made with FaithLight')} · faithlight.app
            </p>
          </div>
        </div>

        {/* Background picker */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t(uiLanguage, 'background')}</p>
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUNDS.map(b => (
              <motion.button
                key={b.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setBg(b)}
                style={{ background: b.style }}
                aria-label={`Select ${t(uiLanguage, b.i18nKey)} background`}
                aria-pressed={bg.id === b.id}
                className={`min-h-[44px] rounded-xl relative transition-all ${bg.id === b.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' : ''}`}
              >
                <span className="absolute bottom-1 left-0 right-0 text-center text-white text-[9px] font-semibold opacity-80">{t(uiLanguage, b.i18nKey)}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Font picker */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t(uiLanguage, 'fontStyle')}</p>
          <div className="grid grid-cols-4 gap-2">
            {FONTS.map(f => (
              <button
                key={f.id}
                onClick={() => setFont(f)}
                aria-label={`Select ${t(uiLanguage, f.i18nKey)} font`}
                aria-pressed={font.id === f.id}
                className={`min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl border text-sm transition-all ${font.id === f.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                style={{ fontFamily: f.style }}
              >
                {t(uiLanguage, f.i18nKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            disabled={exporting || loading}
            aria-label={exporting ? 'Exporting image' : 'Download image'}
            className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-4 rounded-2xl bg-indigo-600 text-white font-semibold text-sm disabled:opacity-60"
          >
            <Download size={16} aria-hidden="true" />
            {exporting ? t(uiLanguage, 'exporting') : t(uiLanguage, 'download')}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShareSheetOpen(true)}
            disabled={loading}
            aria-label="Open share options"
            className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm disabled:opacity-60"
          >
            <Share2 size={16} aria-hidden="true" />
            {t(uiLanguage, 'share')}
          </motion.button>

          {isLoggedIn && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleToggleFavorite}
                disabled={loading || !verse.bookCode}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-4 rounded-2xl font-semibold text-sm disabled:opacity-60 transition-all ${
                  isFavorited
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} aria-hidden="true" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(createPageUrl('PrayerJournal'))}
                disabled={loading}
                aria-label="Open prayer journal"
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-4 rounded-2xl bg-amber-500 text-white font-semibold text-sm disabled:opacity-60"
              >
                <BookMarked size={16} aria-hidden="true" />
              </motion.button>
            </>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleWhatsApp}
            disabled={loading}
            aria-label="Share on WhatsApp"
            className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-4 rounded-2xl bg-green-500 text-white font-semibold text-sm disabled:opacity-60 ${isLoggedIn ? 'col-span-2' : 'col-span-3'}`}
          >
            <MessageCircle size={16} aria-hidden="true" />
            {t(uiLanguage, 'whatsapp')}
          </motion.button>
        </div>

        {/* Share verse + explanation */}
        {verse && !loading && (
          <div className="mt-4 flex justify-end">
            <VerseShareButton
              verse={verse}
              explanation={verse.explanation}
              lang={uiLanguage}
            />
          </div>
        )}

        {/* DailyVerse audio player */}
        {verse?.audioUrl && !loading && (
          <div className="mt-3">
            <DailyVerseAudioPlayer
              audioUrl={verse.audioUrl}
              lang={bibleLanguage}
            />
          </div>
        )}

        {/* Audio Prayer */}
        {verse && !loading && (
          <div className="mt-4 flex justify-center">
            <AudioPrayerButton
              verseText={verse.verseText}
              reference={verse.reference}
              audioLanguage={audioLanguage}
            />
          </div>
        )}

        <VerseShareSheet verse={verse} open={shareSheetOpen} onClose={() => setShareSheetOpen(false)} />
      </div>
    </div>
  );
}