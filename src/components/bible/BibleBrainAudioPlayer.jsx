import React, { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Play, Pause, SkipBack, SkipForward, Loader2, Headphones, Volume2, VolumeX } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';

// Localized strings for the player UI and error states
const STRINGS = {
  en: { listen: 'Listen', loading: 'Loading audio…', unavailable: 'Audio not available for this language yet.', fallback: '(English audio)', playing: 'Playing', chapter: 'Chapter' },
  om: { listen: 'Dhageeffadhu', loading: 'Sagalee fe\'amaa jira…', unavailable: 'Sagaleen afaan kanaan ammatti hin jiru.', fallback: '(Sagalee Ingliffaa)', playing: 'Taphatamaa jira', chapter: 'Boqonnaa' },
  am: { listen: 'ያዳምጡ', loading: 'ድምጽ እየጫነ ነው…', unavailable: 'ድምፅ በዚህ ቋንቋ አሁን አይገኝም።', fallback: '(የእንግሊዝኛ ድምፅ)', playing: 'እየተጫወተ ነው', chapter: 'ምዕራፍ' },
  ar: { listen: 'استمع', loading: 'جارٍ تحميل الصوت…', unavailable: 'الصوت غير متاح بهذه اللغة حالياً.', fallback: '(صوت إنجليزي)', playing: 'يتم التشغيل', chapter: 'إصحاح' },
  fr: { listen: 'Écouter', loading: 'Chargement audio…', unavailable: "L'audio n'est pas disponible dans cette langue.", fallback: '(Audio anglais)', playing: 'En cours', chapter: 'Chapitre' },
  sw: { listen: 'Sikiliza', loading: 'Inapakia sauti…', unavailable: 'Sauti haipatikani kwa lugha hii kwa sasa.', playing: 'Inacheza', chapter: 'Sura', fallback: '(Sauti ya Kiingereza)' },
};

function getStr(lang, key) {
  return (STRINGS[lang] || STRINGS.en)[key] || STRINGS.en[key];
}

/**
 * BibleBrainAudioPlayer
 * Fetches a real native-language audio stream from bibleBrainAPI (audioForVerse action)
 * and plays it with a minimal, RTL-aware UI.
 *
 * Props:
 *   book        - Bible book code e.g. "JHN"
 *   chapter     - chapter number
 *   verse       - (optional) specific verse number to seek to
 *   isDarkMode  - boolean
 */
export default function BibleBrainAudioPlayer({ book, chapter, verse, isDarkMode = false }) {
  const bibleLanguage = useLanguageStore(s => s.bibleLanguage || s.uiLanguage);
  const isRTL = ['ar'].includes(bibleLanguage);

  const [status, setStatus] = useState('idle'); // idle | loading | ready | playing | paused | error
  const [errorMsg, setErrorMsg] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [progress, setProgress] = useState(0);   // 0–100
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Color tokens
  const bg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const border = isDarkMode ? '#334155' : '#E2E8F0';
  const text = isDarkMode ? '#E2E8F0' : '#1E293B';
  const muted_ = isDarkMode ? '#94A3B8' : '#9CA3AF';
  const accent = '#6C5CE7';

  const loadAudio = useCallback(async () => {
    if (!book || chapter === undefined) return;
    setStatus('loading');
    setErrorMsg('');
    setIsFallback(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    try {
      const res = await base44.functions.invoke('bibleBrainAPI', {
        action: 'audioForVerse',
        book,
        chapter: parseInt(chapter),
        verse: verse ? parseInt(verse) : undefined,
        lang: bibleLanguage,
      });

      const data = res?.data;
      if (!data?.audioUrl) {
        setErrorMsg(getStr(bibleLanguage, 'unavailable'));
        setStatus('error');
        return;
      }

      if (data.fallback) setIsFallback(true);
      audioUrlRef.current = data.audioUrl;

      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.load();
        setStatus('ready');
      }
    } catch (e) {
      console.error('[BibleBrainAudioPlayer] load error:', e.message);
      setErrorMsg(getStr(bibleLanguage, 'unavailable'));
      setStatus('error');
    }
  }, [book, chapter, verse, bibleLanguage]);

  // Reload whenever book/chapter/language changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setStatus('idle');
    loadAudio();
  }, [book, chapter, bibleLanguage]);

  const handlePlay = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setStatus('playing');
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setStatus('paused');
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = isRTL
      ? 1 - (e.clientX - rect.left) / rect.width
      : (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const isLoading = status === 'loading';
  const isPlaying = status === 'playing';
  const hasError = status === 'error';
  const isReady = status === 'ready' || status === 'playing' || status === 'paused';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: bg, borderColor: border }}
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        muted={muted}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setStatus('ready')}
        onError={() => {
          setErrorMsg(getStr(bibleLanguage, 'unavailable'));
          setStatus('error');
        }}
      />

      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: accent + '20' }}>
          <Headphones className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: text }}>
            {getStr(bibleLanguage, 'listen')}
            {isFallback && (
              <span className="ml-2 text-xs font-normal" style={{ color: muted_ }}>
                {getStr(bibleLanguage, 'fallback')}
              </span>
            )}
          </p>
          <p className="text-xs" style={{ color: muted_ }}>
            {getStr(bibleLanguage, 'chapter')} {chapter}
            {isPlaying && ` · ${getStr(bibleLanguage, 'playing')}`}
          </p>
        </div>
        {/* Mute toggle */}
        {isReady && (
          <button
            onClick={() => setMuted(v => !v)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
          >
            {muted
              ? <VolumeX className="w-4 h-4" style={{ color: muted_ }} />
              : <Volume2 className="w-4 h-4" style={{ color: muted_ }} />
            }
          </button>
        )}
      </div>

      {/* Error state */}
      {hasError && (
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-xs" style={{ color: '#EF4444' }}>⚠ {errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="px-4 py-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: accent }} />
          <span className="text-xs" style={{ color: muted_ }}>{getStr(bibleLanguage, 'loading')}</span>
        </div>
      )}

      {/* Player controls */}
      {isReady && (
        <div className="px-4 py-3 space-y-3">
          {/* Play/Pause */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
                }
              }}
              className="p-2 rounded-full"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
              title="-15s"
            >
              <SkipBack className="w-4 h-4" style={{ color: text }} />
            </button>

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="p-3 rounded-full text-white shadow-md transition-transform hover:scale-105"
              style={{ backgroundColor: accent }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
                }
              }}
              className="p-2 rounded-full"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
              title="+15s"
            >
              <SkipForward className="w-4 h-4" style={{ color: text }} />
            </button>
          </div>

          {/* Progress bar */}
          <div>
            <div
              className="w-full h-2 rounded-full cursor-pointer overflow-hidden"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: accent,
                  // RTL: grow from right
                  ...(isRTL ? { marginLeft: 'auto', marginRight: 0 } : {}),
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs" style={{ color: muted_ }}>
              <span style={{ direction: 'ltr' }}>{formatTime(currentTime)}</span>
              <span style={{ direction: 'ltr' }}>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}