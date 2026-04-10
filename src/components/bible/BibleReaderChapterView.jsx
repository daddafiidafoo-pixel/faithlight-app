import React, { useEffect, useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Lightbulb, Headphones, RefreshCw, WifiOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getChapter } from '@/lib/bibleService';
import { getBookmarks, addBookmark, removeBookmark, isBookmarked } from '@/lib/bookmarkManager';
import { getChapter as getOfflineChapter } from '@/lib/offlineChapterDB';
import SaveChapterButton from './SaveChapterButton';
import ChapterAudioPlayer from './ChapterAudioPlayer';

const TEXT_SIZES = {
  small: 'text-sm leading-relaxed',
  medium: 'text-base leading-relaxed',
  large: 'text-lg leading-relaxed',
  xlarge: 'text-xl leading-relaxed',
};

// Friendly language fallback banner
function LanguageFallbackBanner({ uiLang }) {
  if (!uiLang || uiLang === 'en') return null;
  const msgs = {
    om: 'Afaan Oromoo Bible hin argamne amma. English version is being shown.',
    am: 'የአማርኛ መጽሐፍ ቅዱስ አሁን አልተገኘም። የእንግሊዝኛ ስሪት እየታየ ነው።',
    sw: 'Biblia ya Kiswahili haipatikani sasa hivi. Toleo la Kiingereza linaonyeshwa.',
    ar: 'الكتاب المقدس بالعربية غير متاح حالياً. يتم عرض النسخة الإنجليزية.',
    fr: 'La Bible en français n\'est pas encore disponible. La version anglaise est affichée.',
  };
  const msg = msgs[uiLang];
  if (!msg) return null;
  return (
    <div className="mx-4 mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
      <span className="text-amber-500 text-base mt-0.5">🌍</span>
      <p className="text-sm text-amber-800 leading-snug">{msg}</p>
    </div>
  );
}

// Verse-level TTS (no external API, uses Web Speech API — silent if unavailable)
function speakVerse(text) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.lang = 'en-US';
  window.speechSynthesis.speak(u);
  return true;
}

export default function BibleReaderChapterView({ book, chapter, textSize = 'medium', onAskAboutVerse }) {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState(null);
  const [ttsUnavailable, setTtsUnavailable] = useState(false);
  const uiLang = localStorage.getItem('fl_ui_lang') || localStorage.getItem('fl_bible_lang') || 'en';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsOffline(false);

    // 1. Try online fetch
    try {
      const data = await getChapter(book, chapter);
      if (data?.verses?.length) {
        setChapterData(data);
        setLoading(false);
        setBookmarks(getBookmarks());
        return;
      }
    } catch { /* fall through to offline */ }

    // 2. Try offline IndexedDB cache
    try {
      const offline = await getOfflineChapter(book, chapter, 'web');
      if (offline?.verses?.length) {
        setChapterData({ book: offline.bookName || book, chapter: offline.chapter, verses: offline.verses, version: 'Offline' });
        setIsOffline(true);
        setLoading(false);
        setBookmarks(getBookmarks());
        return;
      }
    } catch { /* nothing cached */ }

    // 3. Both failed
    setError('This chapter is not available right now. Please check your connection and try again.');
    setLoading(false);
    setBookmarks(getBookmarks());
  }, [book, chapter]);

  useEffect(() => { load(); }, [load]);

  const handleToggleBookmark = (ref) => {
    if (isBookmarked(ref)) removeBookmark(ref);
    else addBookmark(ref);
    setBookmarks(getBookmarks());
  };

  const handleListen = (text, verseId) => {
    if (speakingVerse === verseId) {
      window.speechSynthesis?.cancel();
      setSpeakingVerse(null);
      return;
    }
    const ok = speakVerse(text);
    if (!ok) { setTtsUnavailable(true); return; }
    setSpeakingVerse(verseId);
    // Reset when done
    const u = window.speechSynthesis.getVoices(); // trigger load
    setTimeout(() => setSpeakingVerse(null), text.length * 70);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 w-6 bg-slate-200 rounded animate-pulse flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-4/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state — friendly, no raw messages
  if (error) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">Chapter unavailable</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
        >
          <RefreshCw size={15} /> Try Again
        </button>
      </div>
    );
  }

  if (!chapterData?.verses?.length) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* Chapter header */}
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{chapterData.book} {chapterData.chapter}</h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              {isOffline && <WifiOff size={10} className="text-amber-500" />}
              {isOffline ? 'Offline copy' : (chapterData.version || 'NIV')}
            </p>
          </div>
          <SaveChapterButton
            bookCode={book}
            bookName={chapterData.book}
            chapter={chapter}
            verses={chapterData.verses}
            translation="web"
          />
        </div>
      </div>

      {/* Chapter Audio Player */}
      <ChapterAudioPlayer book={book} chapter={chapter} verses={chapterData.verses} />

      {/* Language fallback notice */}
      <LanguageFallbackBanner uiLang={uiLang} />

      {/* TTS unavailable notice */}
      {ttsUnavailable && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-600">Audio is not available for this chapter on your device.</p>
        </div>
      )}

      {/* Verses */}
      <div className={`px-4 pb-48 pt-5 max-w-2xl mx-auto ${TEXT_SIZES[textSize]}`}>
        {chapterData.verses.map((v) => {
          const ref = `${chapterData.book} ${chapterData.chapter}:${v.verse}`;
          const bookmarked = bookmarks.some(b => b.reference === ref);
          const isSpeaking = speakingVerse === v.verse;

          return (
            <div key={v.verse} className="mb-4 pb-4 border-b border-slate-100 last:border-b-0">
              <div className="flex gap-3">
                <span className="flex-shrink-0 text-sm font-bold text-slate-400 w-7 text-right pt-0.5">{v.verse}</span>
                <div className="flex-1">
                  <p className="text-slate-800 leading-relaxed mb-2">{v.text}</p>
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    <button
                      onClick={() => handleToggleBookmark(ref)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      {bookmarked
                        ? <BookmarkCheck size={15} className="text-amber-500" />
                        : <Bookmark size={15} className="text-slate-300" />}
                    </button>
                    {onAskAboutVerse && (
                      <button
                        onClick={() => onAskAboutVerse(ref, v.text)}
                        className="h-8 px-2.5 flex items-center gap-1 text-xs text-slate-500 rounded-lg hover:bg-slate-100 font-medium"
                      >
                        <Lightbulb size={12} /> Explain
                      </button>
                    )}
                    <button
                      onClick={() => handleListen(v.text, v.verse)}
                      className={`h-8 px-2.5 flex items-center gap-1 text-xs rounded-lg font-medium transition-colors ${
                        isSpeaking ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Listen to verse"
                    >
                      {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      {isSpeaking ? 'Stop' : 'Listen'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}