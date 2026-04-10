import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/components/languageStore';
import { Play, Pause, Volume2, Loader2, AlertCircle } from 'lucide-react';

/**
 * Fetches and plays audio version of Bible passage
 * Respects active language setting
 */
export default function DevotionAudioPlayer({ verseReference, bookName }) {
  const audioLanguage = useLanguageStore(s => s.audioLanguage) || 'en';
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch audio track
  const { data: audioUrl, isLoading, error } = useQuery({
    queryKey: ['devotion-audio', verseReference, audioLanguage],
    queryFn: async () => {
      try {
        // Call backend function to get audio track
        const response = await base44.functions.invoke('getAudioTrack', {
          verseReference,
          language: audioLanguage,
        });
        
        return response.data?.audioUrl || null;
      } catch (err) {
        console.error('Error fetching audio:', err);
        return null;
      }
    },
    enabled: !!verseReference,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
    }
  }, [audioUrl]);

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

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 px-4">
        <Loader2 className="animate-spin w-4 h-4 text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Loading audio...</span>
      </div>
    );
  }

  if (error || !audioUrl) {
    return (
      <div className="flex items-start gap-2 py-4 px-4 bg-muted/50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">Audio not available for this passage</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            aria-label="Audio progress"
          />
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
      />

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Volume2 className="w-3 h-3" /> Audio Bible
      </p>
    </div>
  );
}