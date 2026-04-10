import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Loader2, Volume2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Inline audio bar that sits beneath a verse.
 * Shows a play/pause button + thin progress strip for the whole chapter.
 * (Bible Brain audio is chapter-level, not per-verse.)
 */
export default function VerseAudioBar({ book, chapter, language = 'en', bookName, activeVerseNumber, totalVerses }) {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const progressKey = `fl_audio_${language}_${book}_${chapter}`;

  const fetchAudio = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    try {
      const result = await base44.functions.invoke('getChapterAudio', {
        bookCode: book,
        chapter,
        language,
      });

      const url = result?.data?.url;
      if (url) {
        setAudioUrl(url);
      } else {
        setError(result?.data?.error || 'Audio not available for this chapter.');
      }
    } catch (err) {
      console.error('[VerseAudioBar]', err);
      setError('Audio not available for this chapter.');
    }
    setLoading(false);
  }, [book, chapter, language]);

  // Fetch audio when play is first requested
  const handlePlayPause = () => {
    if (!audioUrl && !loading && !error) {
      fetchAudio();
      return;
    }
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  // Auto-play once audio URL arrives
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const saved = parseFloat(localStorage.getItem(progressKey)) || 0;
      audioRef.current.currentTime = saved;
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  const handleTimeUpdate = (e) => {
    const t = e.target.currentTime;
    setCurrentTime(t);
    localStorage.setItem(progressKey, String(t));
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Approximate which verse is playing based on progress
  const playingVerseNumber = duration > 0 && totalVerses > 0
    ? Math.min(totalVerses, Math.floor((currentTime / duration) * totalVerses) + 1)
    : null;

  const isActiveVerse = playingVerseNumber === activeVerseNumber;

  return (
    <div className="mt-2 mb-1">
      <div className={`rounded-2xl px-3 py-2.5 flex items-center gap-3 transition-all ${
        playing && isActiveVerse
          ? 'bg-indigo-50 border border-indigo-200'
          : 'bg-gray-50 border border-gray-200'
      }`}>

        {/* Play / Pause / Loading button */}
        <button
          onClick={handlePlayPause}
          aria-label={playing ? 'Pause audio' : 'Play chapter audio'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            playing
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {loading
            ? <Loader2 size={14} className="animate-spin" />
            : playing
              ? <Pause size={14} />
              : <Play size={14} className="ml-0.5" />
          }
        </button>

        {/* Progress section */}
        <div className="flex-1 min-w-0">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <div className="relative">
              {/* Visual progress bar */}
              <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Invisible seek range on top */}
              {audioUrl && (
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
                  aria-label="Seek audio"
                />
              )}
            </div>
          )}

          {/* Label */}
          <div className="flex items-center gap-1.5 mt-1">
            <Volume2 size={10} className="text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-indigo-500 truncate">
              {playing && isActiveVerse
                ? `Playing verse ~${playingVerseNumber}`
                : bookName
                  ? `${bookName} ${chapter}`
                  : `Chapter ${chapter}`}
            </span>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={e => setDuration(e.target.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
            localStorage.removeItem(progressKey);
          }}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}