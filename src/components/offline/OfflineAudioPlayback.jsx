import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Loader2 } from 'lucide-react';

/**
 * Offline audio/video playback
 * Works with downloaded content stored in IndexedDB
 */
export default function OfflineAudioPlayback({ content, onProgress }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Try to load from IndexedDB first
  useEffect(() => {
    const loadFromOffline = async () => {
      if (!content?.offline_url) return;

      setIsLoading(true);
      try {
        // In a real app, fetch from IndexedDB blob storage
        if (audioRef.current && content.offline_url) {
          audioRef.current.src = content.offline_url;
        }
      } catch (error) {
        console.error('Error loading offline content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromOffline();
  }, [content]);

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (onProgress) {
        onProgress({
          currentTime: audioRef.current.currentTime,
          duration: audioRef.current.duration,
        });
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{content?.title || 'Audio'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            onClick={handleSeek}
            className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:h-3 transition-all"
          >
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => skip(-15)}
            className="gap-1"
          >
            <SkipBack className="w-4 h-4" />
            15s
          </Button>

          <Button
            size="lg"
            onClick={togglePlay}
            className="rounded-full w-14 h-14"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => skip(15)}
            className="gap-1"
          >
            <SkipForward className="w-4 h-4" />
            15s
          </Button>
        </div>

        {/* Playback Speed & Volume */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                if (audioRef.current) audioRef.current.playbackRate = rate;
              }}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

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
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}