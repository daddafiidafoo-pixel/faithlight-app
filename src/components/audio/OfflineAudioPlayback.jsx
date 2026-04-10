import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Wifi, WifiOff } from 'lucide-react';

/**
 * Audio playback for offline Bible audio
 * Integrates with downloaded audio packs
 */
export default function OfflineAudioPlayback({
  audioUrl,
  title,
  chapterNumber,
  isOffline = false,
  onChapterChange,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onChapterChange?.(chapterNumber + 1);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [chapterNumber, onChapterChange]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="pt-6 space-y-4">
        {/* Title & Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {isOffline ? (
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  <Wifi className="w-3 h-3" />
                  Streaming
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {}}
          crossOrigin="anonymous"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = parseFloat(e.target.value);
                setCurrentTime(parseFloat(e.target.value));
              }
            }}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChapterChange?.(Math.max(1, chapterNumber - 1))}
              className="gap-1"
            >
              <SkipBack className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <Button
              size="sm"
              onClick={togglePlay}
              className="gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onChapterChange?.(chapterNumber + 1)}
              className="gap-1"
            >
              <span className="hidden sm:inline">Next</span>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                setVolume(vol);
                if (audioRef.current) audioRef.current.volume = vol;
              }}
              className="w-20 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Chapter Info */}
        <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
          <p>Chapter {chapterNumber}</p>
          <p className="text-xs text-gray-600 mt-1">
            {isOffline
              ? 'Offline mode - no internet needed'
              : 'Streaming from cloud'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}