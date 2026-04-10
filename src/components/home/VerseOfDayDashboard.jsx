import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Check, Share2, Twitter, Facebook, MessageCircle, Bookmark, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { getDailyVerse, DAILY_VERSES as VERSE_LIST } from '../lib/dailyVerseList';
import { useI18n } from '../I18nProvider';

const THEME_GRADIENTS = {
  love:     ['from-rose-500 via-pink-500 to-red-500', 'bg-rose-900/30'],
  strength: ['from-orange-500 via-amber-500 to-yellow-500', 'bg-orange-900/30'],
  peace:    ['from-blue-500 via-cyan-500 to-teal-500', 'bg-blue-900/30'],
  trust:    ['from-indigo-500 via-purple-500 to-violet-500', 'bg-indigo-900/30'],
  courage:  ['from-emerald-500 via-green-500 to-teal-500', 'bg-emerald-900/30'],
  hope:     ['from-sky-500 via-blue-500 to-indigo-500', 'bg-sky-900/30'],
  rest:     ['from-violet-500 via-purple-500 to-fuchsia-500', 'bg-violet-900/30'],
};

export default function VerseOfDayDashboard() {
  const { lang, t } = useI18n();
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [offsetIdx, setOffsetIdx] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Get today's verse from the verified dataset — re-evaluate when language changes
  const baseVerse = getDailyVerse(lang);
  // Allow refreshing to a different verse within the same dataset
  const allVerses = VERSE_LIST;
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let baseHash = 0;
  for (let i = 0; i < dateStr.length; i++) baseHash = (baseHash * 31 + dateStr.charCodeAt(i)) & 0xffffffff;
  const baseIdx = Math.abs(baseHash) % allVerses.length;
  const currentIdx = (baseIdx + offsetIdx) % allVerses.length;
  const entry = allVerses[currentIdx];
  const currentVerse = {
    text: (lang === 'om' && entry.om) ? entry.om : entry.en,
    reference: (lang === 'om' && entry.omRef) ? entry.omRef : entry.ref,
    theme: entry.theme || 'trust',
    // Show fallback notice if Oromo verse is not in verified dataset
    isFallback: lang === 'om' && !entry.om,
  };

  const [grad1, grad2] = THEME_GRADIENTS[currentVerse.theme] || THEME_GRADIENTS.trust;
  const verseText = `"${currentVerse.text}" — ${currentVerse.reference}`;

  const copyVerse = () => {
    navigator.clipboard.writeText(verseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const saveVerse = async () => {
    if (!user) return;
    await base44.entities.SavedVerse.create({ user_id: user.id, reference: currentVerse.reference, text: currentVerse.text, note: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(verseText + ' #FaithLight #Bible')}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(verseText)}`;
    window.open(url, '_blank');
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(verseText + ' — FaithLight')}`;
    window.open(url, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Verse of the Day', text: verseText, url: window.location.origin });
    } else setShowShare(v => !v);
  };

  const refreshVerse = () => setOffsetIdx(i => i + 1);

  // No loading state needed — verse is derived from local data synchronously

  return (
    <div className="w-full">
      {/* Main card */}
      <div className={`relative rounded-3xl bg-gradient-to-br ${grad1} p-1 shadow-xl shadow-indigo-200/50`}>
        <div className="relative rounded-[22px] overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 -translate-y-24 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 translate-y-12 -translate-x-8" />
          </div>

          <div className="relative bg-gradient-to-br from-black/30 to-black/10 p-6">
            {/* Label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest">{t('home.verseOfDay', 'Verse of the Day')}</span>
              </div>
              <button onClick={refreshVerse} className="text-white/50 hover:text-white/90 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Verse text — Bible text from verified dataset only, never auto-translated */}
            <div className="mb-5">
              <p className="text-white text-lg font-light leading-relaxed mb-3 italic">
                "{currentVerse.text}"
              </p>
              <p className="text-white/90 text-sm font-bold tracking-wide">
                — {currentVerse.reference}
              </p>
              {currentVerse.isFallback && (
                <p className="text-white/50 text-xs mt-1 italic">
                  {lang === 'om' ? '(Afaan Oromoo Bible text hin argamne)' : '(Oromo translation unavailable)'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Copy */}
              <button onClick={copyVerse}
               className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-400/90 text-white' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'}`}>
               {copied ? <><Check className="w-3.5 h-3.5" /> {t('common.success', 'Copied!')}</> : <><Copy className="w-3.5 h-3.5" /> {t('bible.copyVerse', 'Copy')}</>}
              </button>

              {/* Save */}
              {user && (
               <button onClick={saveVerse}
                 className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${saved ? 'bg-yellow-400/90 text-white' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'}`}>
                 <Bookmark className="w-3.5 h-3.5" /> {saved ? t('daily.savedToJournal', 'Saved!') : t('common.save', 'Save')}
               </button>
              )}

              {/* Share */}
              <button onClick={nativeShare}
               className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all ml-auto">
               <Share2 className="w-3.5 h-3.5" /> {t('common.share', 'Share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share panel */}
      {showShare && (
        <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Share to</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={shareToTwitter}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors">
              <Twitter className="w-5 h-5 text-sky-500" />
              <span className="text-xs font-bold text-sky-600">Twitter</span>
            </button>
            <button onClick={shareToFacebook}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-blue-600">Facebook</span>
            </button>
            <button onClick={shareWhatsApp}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs font-bold text-green-600">WhatsApp</span>
            </button>
          </div>
          <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 italic leading-relaxed">
            "{currentVerse?.text}" — {currentVerse?.reference}
          </div>
        </div>
      )}
    </div>
  );
}