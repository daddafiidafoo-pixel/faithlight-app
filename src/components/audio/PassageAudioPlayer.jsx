import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';

export default function PassageAudioPlayer({ passage, bookId, chapter }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

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

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const audioUrl = `https://api.scripture.api.bible/static/audio/ENGESV/${bookId}/${chapter}_1.mp3`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-violet-50 to-blue-50 p-4 shadow-sm">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlayPause}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          {/* Progress */}
          <div className="flex-1 space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-2 bg-slate-300 rounded cursor-pointer accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume & Speed */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-slate-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (audioRef.current) {
                  audioRef.current.volume = parseFloat(e.target.value);
                }
              }}
              className="flex-1 h-2 bg-slate-300 rounded cursor-pointer accent-violet-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                if (audioRef.current) {
                  audioRef.current.playbackRate = rate;
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-600"
            >
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        </div>

        {/* Reading Text */}
        {passage && (
          <div className="mt-4 bg-white rounded-lg p-4 border border-slate-200 max-h-40 overflow-y-auto">
            <p className="text-sm text-slate-700 leading-relaxed italic">{passage}</p>
          </div>
        )}
      </div>
    </div>
  );
}