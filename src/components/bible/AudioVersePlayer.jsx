import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { fetchBibleBrainAudio } from '@/components/lib/bibleBrainAudio';

export default function AudioVersePlayer({ versionId, bookId, chapter, verse, verseText }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadAudio = async () => {
      setLoading(true);
      setError(null);
      try {
        const audioData = await fetchBibleBrainAudio(versionId, bookId, chapter, verse);
        if (audioData?.audioUrl) {
          if (audioRef.current) {
            audioRef.current.src = audioData.audioUrl;
          }
        } else {
          setError('Audio not available for this verse.');
        }
      } catch (err) {
        setError('Failed to load audio.');
        console.error('[AudioVersePlayer] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (verse) {
      loadAudio();
    }
  }, [versionId, bookId, chapter, verse]);

  const handlePlayPause = () => {
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

  const handleEnded = () => {
    setPlaying(false);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setError('Failed to play audio.')}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={handlePlayPause}
          disabled={loading || error}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : playing ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {loading ? 'Loading...' : playing ? 'Pause' : 'Play'}
        </Button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-gray-600">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-gray-300 rounded-full cursor-pointer">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
          </div>
          <span className="text-xs text-gray-600">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 hover:bg-blue-100 rounded"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-gray-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1"
            title="Volume"
          />
        </div>
      </div>

      {verseText && (
        <p className="text-xs text-gray-700 italic mt-2">{verseText}</p>
      )}
    </div>
  );
}