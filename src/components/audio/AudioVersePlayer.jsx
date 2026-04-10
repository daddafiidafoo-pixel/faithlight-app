import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { useAppStore } from '@/components/store/appStore';

export default function AudioVersePlayer({ verse, reference, language }) {
  const audioLanguage = useAppStore((s) => s.audioLanguage);
  const theme = useAppStore((s) => s.theme);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  // Fetch audio track based on language
  useEffect(() => {
    const fetchAudioTrack = async () => {
      setLoading(true);
      try {
        const trackLang = language || audioLanguage;
        const response = await fetch(
          `/getAudioTrack?reference=${encodeURIComponent(reference)}&lang=${trackLang}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.audioUrl) {
            setAudioUrl(data.audioUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch audio track:', err);
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      fetchAudioTrack();
    }
  }, [reference, language, audioLanguage]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
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

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isDark = theme === 'dark';

  return (
    <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex items-center gap-3 mb-3">
        <Volume2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {reference}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={togglePlayPause}
          disabled={loading || !audioUrl}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700'
              : 'bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300'
          } text-white disabled:text-gray-500`}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: isDark
              ? `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
              : `linear-gradient(to right, #6366f1 0%, #6366f1 ${(currentTime / duration) * 100}%, #d1d5db ${(currentTime / duration) * 100}%, #d1d5db 100%)`,
          }}
        />

        <span className={`text-xs font-medium min-w-[40px] text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
          }}
          className="w-full h-1 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {loading && (
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          Loading audio...
        </p>
      )}
    </div>
  );
}