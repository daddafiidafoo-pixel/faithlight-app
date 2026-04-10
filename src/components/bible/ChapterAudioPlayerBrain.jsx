import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Loader2, Volume2, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Bible Brain audio fileset IDs per language
const AUDIO_FILESETS = {
  en:  'ENGKJVO1DA',
  om:  'GAZBIBN1DA',
  hae: 'HAEBSEN2SA',
  gaz: 'GAZBIBN1DA',
  am:  'AMHNTLV1DA',
  sw:  'SWAHLIB2DA',
};

export default function ChapterAudioPlayerBrain({ bookId, chapter, language, bookName, onClose }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef(null);

  const filesetId = AUDIO_FILESETS[language] || AUDIO_FILESETS.en;

  useEffect(() => {
    setAudioUrl(null);
    setError('');
    setLoading(true);
    setPlaying(false);
    setCurrentTime(0);

    base44.functions.invoke('bibleBrainAudio', {
      filesetId,
      bookId,
      chapter,
    })
      .then(res => {
        const url = res?.data?.url || res?.data?.audio_url;
        if (!url) throw new Error('No audio URL returned');
        setAudioUrl(url);
      })
      .catch(err => {
        console.error('Audio fetch error:', err);
        setError('Audio not available for this chapter');
      })
      .finally(() => setLoading(false));
  }, [bookId, chapter, language, filesetId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    audio.load();
    if (playing) audio.play().catch(() => setPlaying(false));
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleEnded = () => setPlaying(false);

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * duration;
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (secs) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + secs));
    }
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-lg">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-indigo-200" />
          <div>
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Audio Bible</p>
            <p className="text-sm font-semibold">{bookName} {chapter}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors" aria-label="Close audio player">
            <X size={15} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 size={18} className="animate-spin text-indigo-200" />
          <span className="text-sm text-indigo-200">Loading audio...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 py-2 text-indigo-200 text-sm">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {audioUrl && !loading && (
        <>
          {/* Progress bar */}
          <div
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-2 relative"
            onClick={seek}
            role="slider"
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          >
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-indigo-200 mb-3">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => skip(-15)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors" aria-label="Rewind 15s">
              <SkipBack size={18} />
            </button>

            <button
              onClick={() => setPlaying(v => !v)}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shadow-lg"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>

            <button onClick={() => skip(15)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors" aria-label="Forward 15s">
              <SkipForward size={18} />
            </button>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {[0.75, 1, 1.25, 1.5].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  speed === s ? 'bg-white text-indigo-700' : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}