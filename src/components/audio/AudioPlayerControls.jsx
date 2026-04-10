import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export default function AudioPlayerControls({ isPlaying, onPlayPause, audioRef, onProgressChange }) {
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioRef?.current) return;

    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onProgressChange?.(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef, onProgressChange]);

  const handleSkip = (seconds) => {
    if (audioRef?.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
  };

  const handleVolumeChange = (value) => {
    const vol = value[0];
    setVolume(vol);
    if (audioRef?.current) {
      audioRef.current.volume = vol / 100;
      if (vol > 0 && isMuted) setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef?.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => handleSkip(-15)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          title="Skip back 15 seconds"
        >
          <SkipBack className="w-4 h-4" />
          <span className="text-xs">15s</span>
        </Button>

        <Button
          onClick={onPlayPause}
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 rounded-full w-14 h-14 flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          onClick={() => handleSkip(15)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          title="Skip forward 15 seconds"
        >
          <span className="text-xs">15s</span>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 px-2">
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          className="text-gray-600"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />

        <span className="text-xs text-gray-600 w-8 text-right">
          {isMuted ? '0' : volume}%
        </span>
      </div>
    </div>
  );
}