import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, Volume2, VolumeX } from 'lucide-react';

const LABELS = {
  en: { listen: 'Listen', loading: 'Loading…', unavailable: 'Audio not available', playing: 'Playing' },
  am: { listen: 'ያዳምጡ', loading: 'እየጫነ ነው…', unavailable: 'ድምፅ አይገኝም', playing: 'እያጫወተ ነው' },
  om: { listen: 'Dhageeffadhu', loading: 'Fe\'amaa jira…', unavailable: 'Sagalee hin jiru', playing: 'Taphatamaa jira' },
  ar: { listen: 'استمع', loading: 'جارٍ التحميل…', unavailable: 'الصوت غير متاح', playing: 'يتم التشغيل' },
  fr: { listen: 'Écouter', loading: 'Chargement…', unavailable: 'Audio indisponible', playing: 'En cours' },
  sw: { listen: 'Sikiliza', loading: 'Inapakia…', unavailable: 'Sauti haipatikani', playing: 'Inacheza' },
};

function getL(lang, key) {
  return (LABELS[lang] || LABELS.en)[key];
}

/**
 * DailyVerseAudioPlayer
 * Plays the audioUrl from a DailyVerse entity record.
 * Props:
 *   audioUrl  - string (from DailyVerse.audioUrl)
 *   lang      - ISO language code
 *   isDark    - boolean
 */
export default function DailyVerseAudioPlayer({ audioUrl, lang = 'en', isDark = false }) {
  const [status, setStatus] = useState('idle'); // idle | loading | playing | paused | error
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const isRTL = lang === 'ar';

  const accent = '#6C5CE7';
  const bg = isDark ? '#1E293B' : '#F8FAFC';
  const border = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#E2E8F0' : '#1F2937';
  const mutedColor = isDark ? '#94A3B8' : '#9CA3AF';

  // Reset when audioUrl changes
  useEffect(() => {
    setStatus('idle');
    setProgress(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [audioUrl]);

  if (!audioUrl) {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
        style={{ backgroundColor: bg, border: `1px solid ${border}`, color: mutedColor }}
      >
        <VolumeX size={14} />
        {getL(lang, 'unavailable')}
      </div>
    );
  }

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === 'idle') {
      audio.src = audioUrl;
      audio.load();
      setStatus('loading');
      audio.play().then(() => setStatus('playing')).catch(() => setStatus('error'));
    } else if (status === 'playing') {
      audio.pause();
      setStatus('paused');
    } else if (status === 'paused') {
      audio.play();
      setStatus('playing');
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = isRTL
      ? 1 - (e.clientX - rect.left) / rect.width
      : (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="rounded-xl px-4 py-3 space-y-2"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      <audio
        ref={audioRef}
        muted={muted}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a) setProgress((a.currentTime / a.duration) * 100 || 0);
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setStatus('idle'); setProgress(0); }}
        onError={() => setStatus('error')}
      />

      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          disabled={status === 'error'}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          {isLoading
            ? <Loader2 size={16} className="animate-spin" />
            : isPlaying
              ? <Pause size={16} />
              : <Play size={16} />
          }
        </button>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: textColor }}>
            {isPlaying ? getL(lang, 'playing') : getL(lang, 'listen')}
          </p>
          {duration > 0 && (
            <p className="text-xs" style={{ color: mutedColor, direction: 'ltr' }}>
              {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
            </p>
          )}
        </div>

        {/* Mute */}
        <button onClick={() => setMuted(v => !v)} className="flex-shrink-0">
          {muted
            ? <VolumeX size={14} style={{ color: mutedColor }} />
            : <Volume2 size={14} style={{ color: mutedColor }} />
          }
        </button>
      </div>

      {/* Progress bar */}
      {(isPlaying || status === 'paused') && (
        <div
          className="w-full h-1.5 rounded-full cursor-pointer overflow-hidden"
          style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: accent }}
          />
        </div>
      )}

      {status === 'error' && (
        <p className="text-xs" style={{ color: '#EF4444' }}>⚠ {getL(lang, 'unavailable')}</p>
      )}
    </div>
  );
}