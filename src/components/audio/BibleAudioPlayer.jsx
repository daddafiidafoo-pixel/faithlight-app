import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, SkipForward, SkipBack, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BibleAudioPlayer({ bookName, chapter, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  const audioUrl = `https://audio-bible.example.com/${bookName.toLowerCase()}/${chapter}.mp3`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(e.target.value);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg">
      <audio ref={audioRef} src={audioUrl} />

      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold">{bookName} {chapter}</h3>
          <p className="text-sm opacity-90">Bible Audio</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1 bg-white/30 rounded cursor-pointer"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlayback}
            className="bg-white text-purple-600 hover:bg-white/90"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
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
            className="w-20 h-1 bg-white/30 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}