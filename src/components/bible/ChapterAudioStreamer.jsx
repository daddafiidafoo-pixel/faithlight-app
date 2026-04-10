import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_TIMER_MINUTES = [15, 30, 45, 60];

export default function ChapterAudioStreamer({ 
  book, 
  chapter, 
  audioUrl, 
  onClose,
  isDarkMode = false 
}) {
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [error, setError] = useState(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    
    audioRef.current.src = audioUrl;
    setError(null);
    
    const handleError = () => {
      setError('Unable to load audio. Please try again.');
      setIsPlaying(false);
    };
    
    audioRef.current.addEventListener('error', handleError);
    return () => audioRef.current?.removeEventListener('error', handleError);
  }, [audioUrl]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Sleep timer countdown
  useEffect(() => {
    if (!sleepTimer) return;
    
    timerRef.current = setInterval(() => {
      setSleepTimeRemaining(prev => {
        if (prev <= 1) {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setSleepTimer(null);
          toast('Sleep timer ended', { icon: '😴' });
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sleepTimer]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setError('Failed to play audio');
      });
      setIsPlaying(true);
    }
  };

  const seek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const setSleepTimerMinutes = (minutes) => {
    setSleepTimer(minutes);
    setSleepTimeRemaining(minutes * 60);
    setShowSleepMenu(false);
    toast(`Sleep timer set for ${minutes} minutes`, { icon: '⏰' });
  };

  const clearSleepTimer = () => {
    setSleepTimer(null);
    setSleepTimeRemaining(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSleepTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: bgColor, borderColor, color: textColor }}>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor }}>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">🎧 {book} {chapter} Audio</h3>
          <p className="text-xs mt-1" style={{ color: mutedColor }}>Streaming audio Bible chapter</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:opacity-70 transition-opacity"
          aria-label="Close audio player"
        >
          <X size={20} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-start gap-3">
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      )}

      {/* Progress bar */}
      <div
        className="h-1 bg-opacity-20 cursor-pointer hover:h-2 transition-all"
        style={{ backgroundColor: primaryColor }}
        onClick={seek}
      >
        <div
          className="h-full transition-all"
          style={{ width: `${progressPercent}%`, backgroundColor: primaryColor }}
        />
      </div>

      {/* Time display */}
      <div className="px-4 pt-2 pb-1 flex justify-between text-xs" style={{ color: mutedColor }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Main controls */}
      <div className="px-4 py-3 space-y-3">
        {/* Playback controls row */}
        <div className="flex items-center justify-between gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
            disabled={!audioUrl || error}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span className="text-sm">{isPlaying ? 'Playing' : 'Play'}</span>
          </button>

          {/* Speed control */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-3 py-2 rounded-lg text-sm font-semibold transition-all border"
              style={{
                borderColor: showSpeedMenu ? primaryColor : borderColor,
                backgroundColor: showSpeedMenu ? `${primaryColor}20` : 'transparent',
                color: showSpeedMenu ? primaryColor : textColor,
              }}
              aria-label="Playback speed"
            >
              {speed}×
            </button>
            {showSpeedMenu && (
              <div
                className="absolute top-full mt-1 right-0 rounded-lg border shadow-lg p-2 z-20 flex gap-1 flex-wrap w-32"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                {SPEED_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      setShowSpeedMenu(false);
                    }}
                    className="px-2 py-1 rounded text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: speed === s ? primaryColor : borderColor,
                      color: speed === s ? '#FFFFFF' : textColor,
                    }}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleepMenu(!showSleepMenu)}
              className="p-2 rounded-lg transition-all border"
              style={{
                borderColor: sleepTimer ? primaryColor : borderColor,
                backgroundColor: sleepTimer ? `${primaryColor}20` : 'transparent',
                color: sleepTimer ? primaryColor : mutedColor,
              }}
              aria-label="Sleep timer"
              title={sleepTimer ? `Timer: ${formatSleepTime(sleepTimeRemaining)}` : 'Set sleep timer'}
            >
              <Clock size={18} />
            </button>
            {showSleepMenu && (
              <div
                className="absolute top-full mt-1 right-0 rounded-lg border shadow-lg p-2 z-20 flex flex-col gap-1 min-w-32"
                style={{ backgroundColor: bgColor, borderColor }}
              >
                {sleepTimer && (
                  <button
                    onClick={clearSleepTimer}
                    className="px-3 py-1 rounded text-xs font-semibold transition-all text-red-600 hover:bg-red-50"
                  >
                    Cancel Timer
                  </button>
                )}
                {!sleepTimer && SLEEP_TIMER_MINUTES.map(mins => (
                  <button
                    key={mins}
                    onClick={() => setSleepTimerMinutes(mins)}
                    className="px-3 py-1 rounded text-xs font-semibold transition-all text-left"
                    style={{
                      backgroundColor: borderColor,
                      color: textColor,
                    }}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-3">
          <Volume2 size={16} style={{ color: mutedColor }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 rounded-full cursor-pointer"
            style={{
              accentColor: primaryColor,
            }}
            aria-label="Volume"
          />
          <span className="text-xs w-6 text-right" style={{ color: mutedColor }}>
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Sleep timer display */}
        {sleepTimer && (
          <div
            className="px-3 py-2 rounded-lg flex items-center justify-between border"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: primaryColor, color: primaryColor }}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap size={14} />
              Sleep Timer Active
            </div>
            <span className="font-mono text-sm font-semibold">
              {formatSleepTime(sleepTimeRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="px-4 py-2 border-t text-xs" style={{ borderColor, color: mutedColor }}>
        💡 Tip: Use playback speed to adjust listening pace, or set a sleep timer to listen before bed.
      </div>
    </div>
  );
}