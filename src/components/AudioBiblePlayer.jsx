import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Download, Loader2, Volume2 } from 'lucide-react';
import { OfflineAudioStorage } from './OfflineAudioStorage';

export default function AudioBiblePlayer({ audio, onAudioEnded }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    checkOfflineStatus();
  }, [audio]);

  const checkOfflineStatus = () => {
    if (audio) {
      const offline = OfflineAudioStorage.isAudioOffline(audio.translation_code, audio.book, audio.chapter);
      setIsOffline(offline);
    }
  };

  const handlePlayPause = () => {
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

  const handleEnded = () => {
    setIsPlaying(false);
    if (onAudioEnded) onAudioEnded();
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = async () => {
    if (!audio) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(audio.audio_url);
      const blob = await response.blob();
      
      // Store in offline storage with blob data
      const audioData = {
        ...audio,
        audioData: blob,
        downloadedAt: new Date().toISOString(),
        isOffline: true
      };
      
      OfflineAudioStorage.saveAudio(audioData);
      setIsOffline(true);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveOffline = () => {
    if (window.confirm('Remove offline access to this audio?')) {
      OfflineAudioStorage.removeAudio(audio.translation_code, audio.book, audio.chapter);
      setIsOffline(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audio) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {audio.book} {audio.chapter}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {audio.narrator && <span>{audio.narrator} • </span>}
              {formatTime(duration)} • {audio.translation_code}
            </p>
          </div>
          <div className="flex gap-2">
            {isOffline ? (
              <Badge variant="secondary" className="gap-1">
                ✓ Offline
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <audio
          ref={audioRef}
          src={audio.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
              className="gap-2"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>

            <Button variant="ghost" size="icon" disabled>
              <SkipBack className="w-4 h-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <SkipForward className="w-4 h-4 text-gray-400" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-500" />
            <select
              value={playbackRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="text-sm border rounded px-2 py-1 cursor-pointer"
            >
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>

        {/* Download Button */}
        <div>
          {isOffline ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveOffline}
              className="w-full gap-2"
            >
              ✓ Downloaded • Remove Offline
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full gap-2"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download for Offline ({audio.file_size_mb?.toFixed(1)}MB)
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}