import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AudioBiblePlayer({ bookId, chapter, verse }) {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Call backend function to get audio URL from Bible Brain API
        const response = await base44.functions.invoke('getBibleBrainAudio', {
          book_id: bookId,
          chapter,
          verse,
        });

        if (response.data?.audio_url) {
          setAudioUrl(response.data.audio_url);
        } else {
          setError('Audio not available for this passage');
        }
      } catch (err) {
        console.error('Failed to load audio:', err);
        setError('Failed to load audio');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId && chapter) {
      fetchAudio();
    }
  }, [bookId, chapter, verse]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl && !isLoading) {
    return error ? (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        {error}
      </div>
    ) : null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlayPause}
            disabled={isLoading || !audioUrl}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-slate-200 rounded cursor-pointer accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-slate-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-slate-200 rounded cursor-pointer accent-violet-600"
          />
        </div>

        {isLoading && (
          <p className="text-xs text-slate-500">Loading audio...</p>
        )}
      </div>
    </div>
  );
}