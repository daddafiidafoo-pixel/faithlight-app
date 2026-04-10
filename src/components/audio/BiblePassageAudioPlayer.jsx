import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BiblePassageAudioPlayer({ reference, language = 'en', autoPlay = false }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  const languageMap = {
    en: 'English',
    sw: 'Kiswahili',
    om: 'Afaan Oromoo',
    ar: 'Arabic',
    fr: 'French',
    am: 'Amharic',
    ti: 'Tigrinya',
  };

  const { data: audioUrl, isLoading, error } = useQuery({
    queryKey: ['audioTrack', reference, language],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAudioTrack', {
        verseReference: reference,
        language: language || 'en',
      });
      return res.data?.audioUrl || null;
    },
    enabled: !!reference,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      if (autoPlay) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [audioUrl, autoPlay]);

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  if (error) return null;

  return (
    <div className="w-full max-w-sm mx-auto">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
        {/* Header */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            {isLoading ? 'Loading...' : 'Bible Audio'}
          </p>
          <p className="text-sm text-gray-700 font-medium">{reference}</p>
          <p className="text-xs text-gray-500 mt-1">{languageMap[language] || language}</p>
        </div>

        {/* Play button and progress */}
        <div className="space-y-3">
          {/* Play/Pause button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              disabled={isLoading || !audioUrl}
              className={`flex-shrink-0 p-3 rounded-full transition-all ${
                isLoading || !audioUrl
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            {/* Progress bar */}
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                disabled={!audioUrl}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: !audioUrl
                    ? '#e5e7eb'
                    : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center justify-between px-1">
            <div className="relative">
              <button
                onClick={() => setShowVolumeControl(!showVolumeControl)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                {volume === 0 ? (
                  <VolumeX size={18} />
                ) : volume < 0.5 ? (
                  <Volume1 size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              {/* Volume slider */}
              {showVolumeControl && (
                <div className="absolute bottom-full left-2 mb-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 text-center mt-1 w-12">{Math.round(volume * 100)}%</p>
                </div>
              )}
            </div>

            {/* Status text */}
            <p className="text-xs text-gray-500">
              {isLoading ? 'Loading audio...' : !audioUrl ? 'No audio available' : 'Ready'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}