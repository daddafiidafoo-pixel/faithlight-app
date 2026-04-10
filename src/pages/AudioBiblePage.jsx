import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/PullToRefresh';
import {
  Play, Pause, SkipBack, SkipForward, Music, RefreshCw,
  RotateCcw, RotateCw, Volume2, Zap, Settings, AlertCircle,
  ListMusic, Plus, BookOpen, ChevronRight, Globe,
} from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';
import { getBookName, BIBLE_BOOKS } from '@/lib/bibleBookNames';
import { getFileset, isAudioReady } from '@/lib/bibleBrainFilesetsConfig';
import { useAudioPlayerStore } from '@/components/audio/useAudioPlayerStore';
import { formatAudioTime } from '@/lib/audioTime';
import { isBibleComingSoon } from '@/lib/bibleAvailability';
import { useScreenshotMode } from '@/components/ScreenshotMode';
import { AccessibleSelect } from '@/components/ui/accessible-select';

// Audio language options — enabled only if fully wired in BIBLE_SOURCES
export const AUDIO_LANGUAGE_OPTIONS = [
  { value: 'en',             label: 'English',                              enabled: true  },
  { value: 'hae',            label: 'Afaan Oromoo (Bahaa)',                 enabled: true  },
  { value: 'gaz',            label: 'Afaan Oromoo (Lixaa Giddugaleessa)',   enabled: true  },
  { value: 'am',             label: 'አማርኛ',                               enabled: false, note: 'Coming Soon' },
  { value: 'ar',             label: 'العربية',                              enabled: false, note: 'Coming Soon' },
  { value: 'sw',             label: 'Kiswahili',                            enabled: false, note: 'Coming Soon' },
  { value: 'fr',             label: 'Français',                             enabled: false, note: 'Coming Soon' },
  { value: 'ti',             label: 'ትግርኛ',                               enabled: false, note: 'Coming Soon' },
];

const AUDIO_UI = {
  en: {
    pageTitle: 'Audio Bible',
    title: 'Audio Bible',
    chooseBookChapter: 'Choose Book & Chapter',
    chapter: 'Chapter',
    oldTestament: 'Old Testament',
    newTestament: 'New Testament',
    chapters: 'Chapters',
    playbackSettings: 'Playback Settings',
    speed: 'Speed',
    volume: 'Volume',
    play: 'Play',
    checking: 'Checking audio…',
    notAvailableChapter: 'Audio not available for this chapter.',
    loading: 'Loading…',
    nowPlaying: 'Now Playing',
    tapPlay: 'Tap Play to start',
    comingSoonTitle: 'Audio Bible — Coming Soon',
    comingSoonMsg: 'Audio Bible for this language is not yet available. Please switch to English or Oromo.',
  },
  om: {
    pageTitle: 'Sagalee Macaafa Qulqulluu',
    title: 'Sagalee Macaafa Qulqulluu',
    chooseBookChapter: 'Macaafa fi Aayata Filadhu',
    chapter: 'Aayata',
    oldTestament: 'Seera Dubbii',
    newTestament: 'Seera Haaraa',
    chapters: 'Aayatoota',
    playbackSettings: 'Haala Dhaggeeffannaa',
    speed: 'Saffisa',
    volume: 'Sagalee',
    play: 'Dhaggeeffadhu',
    checking: 'Qorannaa...',
    notAvailableChapter: 'Sagaleen boqonnaa kanaaf hin jiru.',
    loading: 'Koktuu jira...',
    nowPlaying: 'Amma Dhaggeeffachaa Jira',
    tapPlay: 'Dhaggeeffachuuf Dhaabi\'i deemi',
    comingSoonTitle: 'Sagalee Macaafa Qulqulluu — Dhiyoo Dhufa',
    comingSoonMsg: 'Sagaleen afaan kanaaf ammas hin jiru. Afaan Ingiliffaa yookiin Oromoo filachuu dandeessu.',
  },
  am: {
    pageTitle: 'የድምፅ መጽሐፍ ቅዱስ',
    title: 'የድምፅ መጽሐፍ ቅዱስ',
    chooseBookChapter: 'መጽሐፍና ምዕራፍ ይምረጡ',
    chapter: 'ምዕራፍ',
    oldTestament: 'ብሉይ ኪዳን',
    newTestament: 'አዲስ ኪዳን',
    chapters: 'ምዕራፎች',
    playbackSettings: 'የማጫወቻ ቅንጅቶች',
    speed: 'ፍጥነት',
    volume: 'ድምጽ',
    play: 'አጫውት',
    checking: 'ድምፅ እየተፈተሸ ነው...',
    notAvailableChapter: 'ለዚህ ምዕራፍ የድምፅ ንባብ በዚህ ቋንቋ አሁን አይገኝም።',
    loading: 'እየጫነ ነው...',
    nowPlaying: 'አሁን እየተጫወተ ነው',
    tapPlay: 'ለማጫወት Play ይጫኑ',
    comingSoonTitle: 'የድምፅ መጽሐፍ ቅዱስ — በቅርቡ ይመጣል',
    comingSoonMsg: 'አማርኛ የድምፅ መጽሐፍ ቅዱስ በቅርቡ ይገኛል። እስከዚያ ድረስ እባክዎ ወደ እንግሊዝኛ ወይም ኦሮሞ ቋንቋ ይቀይሩ።',
  },
};

function getAudioUI(uiLanguage) {
  return AUDIO_UI[uiLanguage] || AUDIO_UI.en;
}

const TESTAMENT_BOOKS = {
  OT: BIBLE_BOOKS?.filter(b => b.order_number <= 39) || [],
  NT: BIBLE_BOOKS?.filter(b => b.order_number > 39) || [],
};

function AudioBibleInner({ useAudioPlayerStore }) {
  useScreenshotMode();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const storeBibleLanguage = useLanguageStore(s => s.bibleLanguage);

  // Page-level audio language — independent of the UI language
  const defaultAudio = AUDIO_LANGUAGE_OPTIONS.find(o => o.value === storeBibleLanguage && o.enabled)
    ? storeBibleLanguage
    : 'en';
  const [audioLanguage, setAudioLanguage] = useState(defaultAudio);

  // Use the page-level audio language everywhere instead of bibleLanguage
  const bibleLanguage = audioLanguage;

  const {
    currentBookId,
    currentChapter,
    currentLanguage,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    loadTrack,
    play,
    pause,
    toggle,
    setTime,
  } = useAudioPlayerStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [testament, setTestament] = useState('NT');
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [chapterAudioChecked, setChapterAudioChecked] = useState(false);
  const [localBookId, setLocalBookId] = useState(currentBookId || 'PSA');
  const [localChapter, setLocalChapter] = useState(currentChapter || 23);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isRefreshingAudio, setIsRefreshingAudio] = useState(false);

  const ui = getAudioUI(uiLanguage);
  const isComingSoon = isBibleComingSoon(bibleLanguage);
  const config = getFileset(bibleLanguage || 'en');
  const totalChapters =
    BIBLE_BOOKS?.find(b => b.book_id === localBookId)?.chapters_count || 150;
  const bookName = getBookName(localBookId, uiLanguage);
  const isCurrentTrack =
    currentLanguage === bibleLanguage &&
    currentBookId === localBookId &&
    currentChapter === localChapter;

  // Pre-check audio availability for the current chapter when book/chapter changes
  useEffect(() => {
    let cancelled = false;

    async function checkChapterAudio() {
      setChapterAudioChecked(false);
      try {
        const resp = await base44.functions.invoke('getChapterAudio', {
          bookCode: localBookId,
          chapter: localChapter,
          language: bibleLanguage || 'en',
        });
        if (!cancelled) {
          setAudioAvailable(Boolean(resp?.data?.url));
          setChapterAudioChecked(true);
        }
      } catch (err) {
        if (!cancelled) {
          setAudioAvailable(false);
          setChapterAudioChecked(true);
        }
      }
    }

    checkChapterAudio();
    return () => { cancelled = true; };
  }, [bibleLanguage, localBookId, localChapter]);

  const playChapter = async (bId = localBookId, ch = localChapter) => {
   // Verify audio is available before attempting play
   if (!audioAvailable || !chapterAudioChecked) {
     return;
   }

   try {
     // Check if this is already the current track
     const isCurrentTrack =
       currentLanguage === bibleLanguage &&
       currentBookId === bId &&
       currentChapter === ch;

     // If already playing this track, just toggle
     if (isCurrentTrack) {
       await toggle();
       return;
     }

     // Load new track via secure backend
     const resp = await base44.functions.invoke('getChapterAudio', {
       language: bibleLanguage || 'en',
       bookCode: bId,
       chapter: ch,
     });
     const track = resp?.data;

     // Verify URL exists before loading
     if (!track?.url) {
       setAudioAvailable(false);
       return;
     }

     // loadTrack awaits metadata confirmation
     await loadTrack(track);
     // Only play if metadata loaded successfully
     await play();
     setLocalBookId(bId);
     setLocalChapter(ch);
   } catch (err) {
     // Error is handled in the store and displayed to user
     setAudioAvailable(false);
   }
  };

  const seek = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    setTime(newTime);
  };

  const skip = (secs) => {
    setTime(Math.max(0, Math.min(duration, currentTime + secs)));
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  const handleRefreshAudio = useCallback(async () => {
    // Re-check audio availability for current chapter
    setChapterAudioChecked(false);
    try {
      const resp = await base44.functions.invoke('getChapterAudio', {
        bookCode: localBookId,
        chapter: localChapter,
        language: audioLanguage || 'en',
      });
      setAudioAvailable(Boolean(resp?.data?.url));
    } catch {
      setAudioAvailable(false);
    } finally {
      setChapterAudioChecked(true);
    }
  }, [audioLanguage, localBookId, localChapter]);

  // Show clean coming-soon screen for unsupported languages
  if (isComingSoon) {
    return (
      <PullToRefresh onRefresh={handleRefreshAudio}>
        <div className="min-h-screen pb-40" style={{ backgroundColor: '#F8F6F1' }}>
        <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{ui.pageTitle}</h1>
          <button
            onClick={() => setAudioLanguage('en')}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100"
          >
            Switch to English
          </button>
        </div>
        <div className="px-4 py-12 max-w-lg mx-auto flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-purple-100 flex items-center justify-center">
            <Music className="w-12 h-12 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{ui.comingSoonTitle}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{ui.comingSoonMsg}</p>
          </div>
        </div>
        </div>
      </PullToRefresh>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefreshAudio} refreshing={isRefreshingAudio}>
      <div className="min-h-screen pb-40" style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 border-b border-slate-100 space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">{ui.title}</h1>

        {/* Audio Language Selector */}
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-purple-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
            {ui.audioLanguageLabel || 'Audio Language'}
          </span>
          <div className="flex-1">
            <AccessibleSelect
              value={audioLanguage}
              onValueChange={(val) => {
                setAudioLanguage(val);
                setLocalBookId('PSA');
                setLocalChapter(23);
              }}
              label={ui.audioLanguageLabel || 'Audio Language'}
              options={AUDIO_LANGUAGE_OPTIONS.map(lang => ({
                value: lang.value,
                label: lang.label + (!lang.enabled ? ` — ${lang.note || 'Coming Soon'}` : ''),
                disabled: !lang.enabled,
              }))}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-lg mx-auto">
        {/* Audio unavailable banner (chapter-level, not language-level) */}
         {!audioAvailable && (
           <div className="rounded-2xl p-4 flex items-start gap-3 bg-red-50 border border-red-200">
             <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" />
             <div>
               <p className="text-sm font-semibold text-red-800">{ui.notAvailableChapter}</p>
             </div>
           </div>
         )}

        {/* Now playing card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, #7C3AED 0%, #8B5CF6 60%, #A78BFA 100%)',
            boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
          }}
        >
          <div className="flex flex-col items-center py-8 px-6">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Music className="w-10 h-10 text-white" />
            </div>
            <p className="text-white text-2xl font-bold text-center">
              {bookName} {localChapter}
            </p>
            <p className="text-white/70 text-sm mt-1">
              {!chapterAudioChecked
               ? ui.checking
               : !audioAvailable
               ? ui.notAvailableChapter
               : isLoading && isCurrentTrack
                 ? ui.loading
                 : isCurrentTrack && error
                   ? 'Error'
                   : isCurrentTrack && isPlaying
                     ? ui.nowPlaying
                     : ui.tapPlay}
            </p>

            {isCurrentTrack && (
              <div className="w-full mt-5">
                <div
                  className="h-1.5 rounded-full cursor-pointer overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  onClick={seek}
                >
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/60 mt-1">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white/10 flex items-center justify-center gap-3 px-6 py-4">
            <button
              onClick={() => {
                if (localChapter > 1) {
                  setLocalChapter(c => c - 1);
                  if (isCurrentTrack) playChapter(localBookId, localChapter - 1);
                }
              }}
              disabled={localChapter <= 1}
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={() => skip(-15)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => playChapter()}
              disabled={!audioAvailable || !chapterAudioChecked || isLoading}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={isPlaying && isCurrentTrack ? "Pause" : "Play"}
              title={!audioAvailable ? ui.notAvailableChapter : ''}
            >
              {isLoading && isCurrentTrack ? (
                <RefreshCw size={24} className="text-purple-600 animate-spin" />
              ) : isPlaying && isCurrentTrack ? (
                <Pause size={24} className="text-purple-600" />
              ) : (
                <Play size={24} className={`ml-0.5 ${!audioAvailable ? 'text-gray-400' : 'text-purple-600'}`} />
              )}
            </button>
            <button
              onClick={() => skip(15)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <RotateCw size={16} />
            </button>
            <button
              onClick={() => {
                const nc = Math.min(localChapter + 1, totalChapters);
                setLocalChapter(nc);
                if (isCurrentTrack) playChapter(localBookId, nc);
              }}
              disabled={localChapter >= totalChapters}
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/20 text-white disabled:opacity-30 hover:bg-white/30 transition-colors"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>



        {/* Book picker */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <button onClick={() => setShowBookPicker(s => !s)} className="w-full flex items-center justify-between px-5 py-4 min-h-[56px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen size={16} className="text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">{ui.chooseBookChapter}</p>
                <p className="text-xs text-slate-400">{bookName} · {ui.chapter} {localChapter}</p>
              </div>
            </div>
            <ChevronRight size={18} className={`text-slate-400 transition-transform ${showBookPicker ? 'rotate-90' : ''}`} />
          </button>

          {showBookPicker && (
            <div className="border-t border-slate-100 px-5 pb-4">
              <div className="flex gap-2 my-3">
                {['OT', 'NT'].map(t => (
                  <button key={t} onClick={() => setTestament(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[40px] ${testament === t ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t === 'OT' ? ui.oldTestament : ui.newTestament}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                {(TESTAMENT_BOOKS[testament] || []).map(b => (
                  <button key={b.book_id} onClick={() => { setLocalBookId(b.book_id); setLocalChapter(1); }}
                    className={`px-2 py-2 rounded-xl text-xs font-semibold text-center transition-colors min-h-[36px] ${localBookId === b.book_id ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700'}`}>
                    {b.name_en || b.book_id}
                  </button>
                ))}
              </div>
              {localBookId && (
                <div className="mt-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        {ui.chapters}
                      </p>
                    </div>
                  <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto">
                    {Array.from({ length: totalChapters }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setLocalChapter(n)}
                        className={`py-2 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${localChapter === n ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-purple-50'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => { playChapter(); setShowBookPicker(false); }}
                    disabled={!audioAvailable || !chapterAudioChecked}
                    className="w-full mt-3 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Play size={16} /> {ui.play} {getBookName(localBookId, uiLanguage)} {localChapter}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(s => !s)}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-3xl bg-white shadow-sm border border-slate-100 min-h-[52px]"
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-purple-600" />
            <span className="text-sm font-semibold text-slate-800">{ui.playbackSettings}</span>
          </div>
          <ChevronRight
            size={16}
            className={`text-slate-400 transition-transform ${
              showSettings ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showSettings && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Zap size={12} className="text-purple-500" /> {ui.speed}: {speed}x
              </p>
              <div className="flex gap-1.5">
                {[0.75, 1, 1.25, 1.5, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${
                      speed === s
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Volume2 size={12} className="text-purple-500" /> {ui.volume}: {Math.round(volume * 100)}%
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#8B5CF6' }}
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </PullToRefresh>
  );
}

export default function AudioBiblePage() {
  return <AudioBibleInner useAudioPlayerStore={useAudioPlayerStore} />;
}