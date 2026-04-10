import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function PassageAudioPlayer({ book, chapter }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Fetch audio when book/chapter changes
  useEffect(() => {
    if (!book || !chapter) return;
    setAudioUrl(null);
    setError(null);
    setPlaying(false);
    setProgress(0);
    setDuration(0);
    fetchAudio();
  }, [book, chapter]);

  const fetchAudio = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('biblebrain_audio', {
        book,
        chapter: parseInt(chapter),
        translation: 'ENGWEB'
      });
      const url = res?.data?.audio_url || res?.data?.url || res?.data?.mp3;
      if (!url) throw new Error('No audio available for this passage');
      setAudioUrl(url);
    } catch (e) {
      setError(e.message || 'Audio unavailable for this passage');
    } finally {
      setLoading(false);
    }
  };

  // Sync speed to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(p => !p);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    audioRef.current.play();
    setPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => setPlaying(false);

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const pct = parseFloat(e.target.value);
    audioRef.current.currentTime = (pct / 100) * duration;
    setProgress(audioRef.current.currentTime);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-4 text-white shadow-lg">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-indigo-300" />
        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Audio Bible</span>
        {book && chapter && (
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-indigo-200">
            {book} {chapter}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-2 text-indigo-300 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading audio…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 text-red-300 text-xs py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {audioUrl && !loading && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />

          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range" min="0" max="100"
              value={pct}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-full accent-indigo-400 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-indigo-300 mt-1">
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="p-2 rounded-full hover:bg-white/10 transition text-indigo-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-lg hover:bg-indigo-100 transition"
              >
                {playing
                  ? <Pause className="w-5 h-5" />
                  : <Play className="w-5 h-5 ml-0.5" />
                }
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex items-center gap-1">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    speed === s
                      ? 'bg-indigo-400 text-white'
                      : 'text-indigo-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!audioUrl && !loading && !error && (
        <p className="text-xs text-indigo-400 py-2">Select a book and chapter above to load audio.</p>
      )}
    </div>
  );
}