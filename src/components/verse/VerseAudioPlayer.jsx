import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Loader2, Volume2, VolumeX } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VerseAudioPlayer({
  bookId,
  chapter,
  verseStart,
  verseEnd,
  referenceText,
  audioFilesetId,
  language = 'en',
  compact = false,
  onError = null,
}) {
  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  // Fetch verse audio from Bible Brain
  const fetchVerseAudio = useCallback(async () => {
    if (!audioFilesetId || !bookId) {
      setError('Audio not available');
      onError?.('Audio not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('bibleBrainVerseAudio', {
        fileset_id: audioFilesetId,
        book_id: bookId,
        chapter,
        verse_start: verseStart,
        verse_end: verseEnd || verseStart,
        language,
      });

      const url = res?.data?.url;
      if (url) {
        setAudioUrl(url);
      } else {
        setError('Audio file not found');
        onError?.('Audio file not found');
      }
    } catch (err) {
      const msg = err?.message || 'Failed to load audio';
      setError(msg);
      onError?.(msg);
      console.error('[VerseAudioPlayer]', err);
    } finally {
      setLoading(false);
    }
  }, [audioFilesetId, bookId, chapter, verseStart, verseEnd, language, onError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Sync muted
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const handlePlay = async () => {
    if (!audioUrl) {
      await fetchVerseAudio();
      return;
    }
    audioRef.current?.play();
  };

  const handlePause = () => {
    audioRef.current?.pause();
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Compact mode (single-line player)
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-200">
        {!playing ? (
          <button
            onClick={handlePlay}
            disabled={loading}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            aria-label="Play audio"
            title="Play verse audio"
          >
            <Play size={14} className="ml-0.5" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            aria-label="Pause audio"
            title="Pause verse audio"
          >
            <Pause size={14} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-indigo-600" />
          ) : error ? (
            <span className="text-xs text-red-600">{error}</span>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 accent-indigo-600 cursor-pointer"
                aria-label="Seek"
              />
              <span className="text-xs text-indigo-600 font-medium whitespace-nowrap">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleStop}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
          aria-label="Stop audio"
          title="Stop playback"
        >
          <Square size={12} />
        </button>
      </div>
    );
  }

  // Full mode (expanded player)
  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-indigo-100">
        <Volume2 size={18} className="text-indigo-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{referenceText}</p>
          <p className="text-xs text-slate-500">Audio Bible</p>
        </div>
        {loading && <Loader2 size={16} className="animate-spin text-indigo-600 flex-shrink-0" />}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Play controls */}
        <div className="flex items-center gap-3">
          {!playing ? (
            <button
              onClick={handlePlay}
              disabled={loading}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
              aria-label="Play verse audio"
            >
              <Play size={18} className="ml-0.5" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0"
              aria-label="Pause audio"
            >
              <Pause size={18} />
            </button>
          )}

          <div className="flex-1 space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 accent-indigo-600 cursor-pointer"
              aria-label="Seek"
            />
            <div className="flex justify-between text-xs text-indigo-600 font-medium">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleStop}
            className="min-h-[40px] px-3 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors text-sm font-medium"
            aria-label="Stop audio"
          >
            Stop
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label={muted ? 'Unmute' : 'Mute'}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs text-indigo-600 font-medium">Speed:</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`min-h-[36px] px-2 rounded text-xs font-semibold transition-colors ${
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

      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onDurationChange={(e) => setDuration(e.target.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
          }}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}