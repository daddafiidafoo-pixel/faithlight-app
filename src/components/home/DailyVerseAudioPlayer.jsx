import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '@/components/hooks/useTranslation';

export default function DailyVerseAudioPlayer({ book, chapter, verse, lang = 'en' }) {
   const [audioUrl, setAudioUrl] = useState(null);
   const [loading, setLoading] = useState(false);
   const [playing, setPlaying] = useState(false);
   const [error, setError] = useState(null);
   const [isFallback, setIsFallback] = useState(false);
   const audioRef = useRef(null);
   const t = useTranslation();

  // Reset when verse changes
  useEffect(() => {
    setAudioUrl(null);
    setPlaying(false);
    setError(null);
    setIsFallback(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [book, chapter, verse, lang]);

  const fetchAndPlay = async () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    // If we already have the URL, just play
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('bibleBrainAPI', {
        action: 'audioForVerse',
        book,
        chapter,
        verse,
        lang,
      });
      const url = res?.data?.audioUrl;
      const fallback = res?.data?.fallback;
      if (!url) {
        setError('Audio not available for this verse');
        setLoading(false);
        return;
      }
      setAudioUrl(url);
      setIsFallback(!!fallback);
      // Play after state updates
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setPlaying(true);
        }
      }, 50);
    } catch (e) {
      setError('Could not load audio');
      console.error('[DailyVerseAudioPlayer]', e);
    }
    setLoading(false);
  };

  const handleAudioEnded = () => setPlaying(false);
  const handleAudioError = () => {
    setError(true);
    setPlaying(false);
  };

  if (!book || !chapter) return null;

  // If audio failed, show a clean localized message — no red raw key text
  if (error) {
    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <VolumeX className="w-3.5 h-3.5" />
          {t('common.audioUnavailable')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={fetchAndPlay}
        disabled={loading}
        aria-label={playing ? 'Pause verse audio' : 'Play verse audio'}
        className="flex items-center gap-2 min-h-[44px] min-w-[44px] h-auto px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : playing
            ? <Pause className="w-4 h-4" />
            : <Play className="w-4 h-4" />
        }
        {loading ? t('common.loading') : playing ? t('common.pause') : `▶ ${t('common.listen')}`}
      </button>

      {isFallback && (
        <span className="text-xs text-muted-foreground">(English audio)</span>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        className="hidden"
      />
    </div>
  );
}