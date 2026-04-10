import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Zap, Maximize2 } from 'lucide-react';

export default function ImmersiveAudioBiblePlayer({ 
  bookCode = 'JHN', 
  chapter = 3, 
  verses = [], 
  audioUrl 
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate verse timings (simplified - assumes equal distribution)
  const verseTimings = verses.map((_, idx) => ({
    verseNum: idx + 1,
    startTime: (idx / verses.length) * duration,
    endTime: ((idx + 1) / verses.length) * duration
  }));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentVerse = () => {
      const timing = verseTimings.find(
        t => audio.currentTime >= t.startTime && audio.currentTime < t.endTime
      );
      if (timing) {
        setCurrentVerseIndex(timing.verseNum - 1);
      }
    };

    audio.addEventListener('timeupdate', updateCurrentVerse);
    return () => audio.removeEventListener('timeupdate', updateCurrentVerse);
  }, [verseTimings]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(err => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const PlayerContent = () => (
    <div className="flex flex-col gap-6">
      {/* Now Playing */}
      <div className="text-center">
        <p className="text-sm text-slate-600 uppercase tracking-wide font-semibold">Now Playing</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">
          {bookCode} {chapter}:{currentVerseIndex + 1}
        </h2>
      </div>

      {/* Verse Display with Highlighting */}
      <div className="bg-gradient-to-b from-purple-50 to-blue-50 rounded-lg p-6 min-h-[150px] max-h-[250px] overflow-y-auto">
        {verses.map((verse, idx) => (
          <p
            key={idx}
            className={`text-lg leading-relaxed transition-all mb-3 ${
              idx === currentVerseIndex
                ? 'bg-yellow-200 px-2 py-1 rounded font-semibold scale-105'
                : 'text-slate-700 opacity-60'
            }`}
          >
            <span className="font-bold text-purple-700">{idx + 1}</span> {verse}
          </p>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => {
            setCurrentTime(parseFloat(e.target.value));
            if (audioRef.current) {
              audioRef.current.currentTime = parseFloat(e.target.value);
            }
          }}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-slate-600 font-semibold">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="p-3 hover:bg-slate-200 rounded-full transition-colors">
          <SkipBack className="w-6 h-6 text-slate-700" />
        </button>

        <button
          onClick={handlePlayPause}
          className="p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-lg"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>

        <button className="p-3 hover:bg-slate-200 rounded-full transition-colors">
          <SkipForward className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      {/* Speed and Volume Controls */}
      <div className="grid grid-cols-2 gap-4">
        {/* Playback Speed */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase block mb-2">
            <Zap className="w-3 h-3 inline mr-1" /> Speed
          </label>
          <div className="flex gap-1">
            {[0.75, 1, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`flex-1 py-2 text-xs font-semibold rounded transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase block mb-2">
            <Volume2 className="w-3 h-3 inline mr-1" /> Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-slate-200 rounded-lg accent-purple-600"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'p-6'}`}>
      {!audioUrl && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 mb-4">
          Audio not available for this chapter.
        </div>
      )}
      <audio
        ref={audioRef}
        src={audioUrl || ''}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => {
          console.error('Audio failed to load');
          setIsPlaying(false);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {isFullscreen && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-3 bg-white/80 hover:bg-white rounded-full"
          >
            <Maximize2 className="w-6 h-6 text-slate-700 rotate-180" />
          </button>
        </div>
      )}

      <div className={isFullscreen ? 'h-full flex flex-col items-center justify-center px-6 py-12' : ''}>
        {isFullscreen ? (
          <div className="w-full max-w-2xl">
            <PlayerContent />
          </div>
        ) : (
          <PlayerContent />
        )}
      </div>

      {/* Fullscreen Button */}
      {!isFullscreen && (
        <button
          onClick={() => setIsFullscreen(true)}
          className="mt-4 w-full py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          Fullscreen
        </button>
      )}
    </div>
  );
}