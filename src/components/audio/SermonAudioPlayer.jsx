import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, ChevronUp, ChevronDown, SkipBack, SkipForward, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SermonAudioPlayer({ sermon, user, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);
  const queryClient = useQueryClient();

  // Load saved progress
  const { data: progress } = useQuery({
    queryKey: ['sermonProgress', sermon.id, user?.email],
    queryFn: () => {
      if (!user) return null;
      return base44.entities.SermonAudioProgress.filter({
        sermonAudioId: sermon.id,
        userId: user.email
      }).then(r => r[0] || null);
    }
  });

  // Save progress on change
  const saveProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (!user) return;
      const existing = await base44.entities.SermonAudioProgress.filter({
        sermonAudioId: sermon.id,
        userId: user.email
      });

      if (existing.length > 0) {
        await base44.entities.SermonAudioProgress.update(existing[0].id, data);
      } else {
        await base44.entities.SermonAudioProgress.create({
          sermonAudioId: sermon.id,
          userId: user.email,
          ...data
        });
      }
    }
  });

  // Load saved position
  useEffect(() => {
    if (audioRef.current && progress) {
      audioRef.current.currentTime = progress.currentPositionSeconds || 0;
      setCurrentTime(progress.currentPositionSeconds || 0);
    }
  }, [progress]);

  // Save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && user) {
        saveProgressMutation.mutate({
          currentPositionSeconds: audioRef.current.currentTime,
          lastPlayedAt: new Date().toISOString()
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [user, saveProgressMutation]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress_percent = sermon.durationSeconds ? (currentTime / sermon.durationSeconds) * 100 : 0;

  // Mini player
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-40">
        <audio
          ref={audioRef}
          src={sermon.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{sermon.title}</p>
            <p className="text-xs text-slate-500">{formatTime(currentTime)} / {formatTime(sermon.durationSeconds)}</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(true)}
              className="text-slate-600"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="h-1 bg-slate-200 rounded-full mt-2 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (audioRef.current) {
              audioRef.current.currentTime = percent * sermon.durationSeconds;
            }
          }}
        >
          <div
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${progress_percent}%` }}
          />
        </div>
      </div>
    );
  }

  // Expanded player
  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-50">
      <audio
        ref={audioRef}
        src={sermon.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Close button */}
      <div className="flex justify-between items-center p-6">
        <h2 className="text-xl font-bold text-white">{sermon.title}</h2>
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(false)}
          className="text-white hover:bg-white/10"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
      </div>

      {/* Thumbnail */}
      {sermon.thumbnailUrl && (
        <div className="flex-1 flex items-center justify-center px-6">
          <img
            src={sermon.thumbnailUrl}
            alt={sermon.title}
            className="w-64 h-64 rounded-lg object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="px-6 py-4 text-center">
        {sermon.speaker && <p className="text-slate-300 mb-2">{sermon.speaker}</p>}
        <p className="text-3xl font-bold text-white mb-4">{formatTime(currentTime)}</p>

        {/* Progress bar */}
        <div
          className="h-2 bg-slate-600 rounded-full cursor-pointer mb-4"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (audioRef.current) {
              audioRef.current.currentTime = percent * sermon.durationSeconds;
            }
          }}
        >
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progress_percent}%` }}
          />
        </div>

        <p className="text-slate-400 text-sm">{formatTime(sermon.durationSeconds)}</p>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-6 px-6 pb-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSkip(-15)}
          className="text-white border-white hover:bg-white/10 gap-1"
        >
          <SkipBack className="w-4 h-4" /> 15s
        </Button>

        <Button
          onClick={isPlaying ? handlePause : handlePlay}
          className="bg-indigo-600 hover:bg-indigo-700 w-16 h-16 rounded-full"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSkip(15)}
          className="text-white border-white hover:bg-white/10 gap-1"
        >
          15s <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}