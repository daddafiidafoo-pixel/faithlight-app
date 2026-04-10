import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

// Progress key for localStorage
const progressKey = (lang, book, chapter) => `fl_audio_${lang}_${book}_${chapter}`;

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChapterAudioPlayer({ book, chapter, language = 'en', bookName, onClose }) {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState(null);
  const progressSaveRef = useRef(null);

  // Fetch audio URL via backend function (keeps API key secure)
  const fetchAudio = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsFallback(false);
    setFallbackNotice(null);

    try {
      const result = await base44.functions.invoke('getChapterAudio', {
        bookCode: book,
        chapter,
        language,
      });

      const url = result?.data?.url;
      if (url) {
        setAudioUrl(url);
        if (result?.data?.fallbackUsed && result?.data?.fallbackNotice) {
          setFallbackNotice(result.data.fallbackNotice);
        }
      } else {
        setError(result?.data?.error || 'Audio not available for this chapter.');
      }
    } catch (err) {
      console.error('[ChapterAudioPlayer] fetch error:', err);
      setError('Audio not available for this chapter.');
    } finally {
      setLoading(false);
    }
  }, [book, chapter, language]);

  // Fetch when book/chapter/language changes
  useEffect(() => {
    fetchAudio();
  }, [fetchAudio]);

  // Restore saved progress when audio is ready
  useEffect(() => {
    if (!audioUrl) return;
    const saved = localStorage.getItem(progressKey(language, book, chapter));
    if (saved && audioRef.current) {
      audioRef.current.currentTime = parseFloat(saved) || 0;
    }
  }, [audioUrl, language, book, chapter]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Sync muted
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Auto-play when URL arrives
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.playbackRate = speed;
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  const saveProgress = (time) => {
    if (progressSaveRef.current) clearTimeout(progressSaveRef.current);
    progressSaveRef.current = setTimeout(() => {
      localStorage.setItem(progressKey(language, book, chapter), String(time));
    }, 2000);
  };

  const handleTimeUpdate = (e) => {
    const t = e.target.currentTime;
    setCurrentTime(t);
    saveProgress(t);
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
      saveProgress(val);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().catch(() => {});
    }
  };

  const handlePlayPause = () => {
    if (!audioUrl || !audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play().catch(() => {});
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const label = bookName ? `${bookName} ${chapter}` : `${book} ${chapter}`;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Volume2 size={16} className="text-indigo-500 flex-shrink-0" />
        <span className="text-sm font-semibold text-indigo-700 flex-1 truncate">
           {label}
         </span>

        {loading && <Loader2 size={16} className="animate-spin text-indigo-400" />}

        <button
          onClick={() => setExpanded(v => !v)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-indigo-400 hover:text-indigo-600"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600"
            aria-label="Close audio player"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-indigo-100 pt-3">
          {fallbackNotice && (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-center">
              {['hae', 'om_eastern', 'gaz', 'om_west_central', 'om'].includes(language)
                ? fallbackNotice.om
                : fallbackNotice.en}
            </p>
          )}

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center font-semibold">
              {language === 'om' ? 'Sagaleen boqonnaa kanaaf hin jiru.' : 'Audio is not available for this chapter.'}
            </p>
          )}

          {/* Progress bar */}
          {audioUrl && !error && (
            <div className="space-y-1.5">
              {/* Thin visual progress */}
              <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Seekable range */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-4 opacity-0 cursor-pointer -mt-5 relative z-10"
                aria-label="Seek audio"
                style={{ marginBottom: '-1rem' }}
              />
              <div className="flex justify-between text-xs text-indigo-400 pt-1">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
          )}

          {/* Controls row */}
          <div className="flex items-center gap-2">
            {/* Restart */}
            <button
              onClick={handleRestart}
              disabled={!audioUrl || loading}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-50 disabled:opacity-40 transition-colors"
              aria-label="Restart"
            >
              <SkipBack size={15} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={!audioUrl || loading}
              className="min-h-[44px] w-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : playing
                  ? <Pause size={16} />
                  : <Play size={16} className="ml-0.5" />
              }
            </button>

            {/* Mute */}
            <button
              onClick={() => setMuted(m => !m)}
              disabled={!audioUrl}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-50 disabled:opacity-40 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Speed selector */}
            <div className="flex items-center gap-1 ml-auto">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`min-h-[36px] px-2 rounded-lg text-xs font-semibold transition-colors ${
                    speed === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden HTML5 audio for background playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={e => setDuration(e.target.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setCurrentTime(0); localStorage.removeItem(progressKey(language, book, chapter)); }}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}