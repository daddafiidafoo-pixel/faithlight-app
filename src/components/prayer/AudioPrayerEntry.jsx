import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Trash2, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AudioPrayerEntry({ entry, onDelete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const audio = new Audio(entry.audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);

    return () => {
      audio.pause();
    };
  }, [entry.audioUrl]);

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.PrayerAudioEntry.delete(entry.id),
    onSuccess: () => {
      toast.success('Prayer deleted');
      queryClient.invalidateQueries({ queryKey: ['prayerAudio'] });
      onDelete?.();
    },
  });

  const downloadAudio = () => {
    const a = document.createElement('a');
    a.href = entry.audioUrl;
    a.download = entry.title || 'prayer.webm';
    a.click();
  };

  const categoryColors = {
    prayer: 'bg-indigo-100 text-indigo-700',
    gratitude: 'bg-amber-100 text-amber-700',
    praise: 'bg-pink-100 text-pink-700',
    reflection: 'bg-blue-100 text-blue-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{entry.title || 'Prayer Entry'}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(entry.recordedAt).toLocaleDateString()} at{' '}
            {new Date(entry.recordedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[entry.category] || categoryColors.other}`}>
          {entry.category}
        </span>
      </div>

      {/* Audio Player */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Progress bar */}
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={audioRef.current?.duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Duration */}
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(entry.duration)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={downloadAudio}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-indigo-300 text-indigo-600 rounded-lg py-2 hover:bg-indigo-50 transition-colors"
        >
          <Download size={14} />
          Download
        </button>
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="flex items-center justify-center gap-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg py-2 px-3 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {deleteMutation.isPending ? (
            <Loader size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}