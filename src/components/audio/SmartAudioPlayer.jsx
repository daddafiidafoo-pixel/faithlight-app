import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, Bookmark, Timer, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const SLEEP_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
];

export default function SmartAudioPlayer({
  book,
  chapter,
  language,
  translation,
  isDarkMode,
  onCurrentTimeChange,
  userId
}) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showBookmarkNote, setShowBookmarkNote] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const audioRef = useRef(null);
  const sleepTimerRef = useRef(null);

  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';

  // Check if chapter is available offline
  useEffect(() => {
    const loadOfflineAudio = async () => {
      setIsLoadingOffline(true);
      try {
        const cacheKey = `fl_audio_${language}_${translation}_${book}_${chapter}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setAudioUrl(cached);
          setIsLoadingOffline(false);
          return;
        }
      } catch (error) {
        console.error('Failed to load offline audio:', error);
      }

      // If not offline, try to load from stream
      if (isOnline) {
        try {
          const streamUrl = `/api/audio/stream/${language}/${translation}/${book}/${chapter}`;
          setAudioUrl(streamUrl);
        } catch (error) {
          toast.error('Failed to load audio');
        }
      } else {
        toast.error(`${book} ${chapter} is not downloaded for offline use`);
      }
      setIsLoadingOffline(false);
    };

    loadOfflineAudio();
  }, [language, translation, book, chapter, isOnline]);

  // Handle online/offline changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply speed when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sleep timer logic
  useEffect(() => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    if (sleepMinutes > 0) {
      let remaining = sleepMinutes * 60;
      setSleepRemaining(remaining);
      sleepTimerRef.current = setInterval(() => {
        remaining -= 1;
        setSleepRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(sleepTimerRef.current);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setSleepMinutes(0);
          setSleepRemaining(null);
          toast.info('Sleep timer ended — audio paused');
        }
      }, 1000);
    } else {
      setSleepRemaining(null);
    }
    return () => clearInterval(sleepTimerRef.current);
  }, [sleepMinutes]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        toast.error('Failed to play audio');
        console.error(err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      onCurrentTimeChange?.(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const saveBookmark = async () => {
    if (!userId) { toast.error('Log in to save bookmarks'); return; }
    try {
      await base44.entities.Bookmark.create({
        user_id: userId,
        book,
        chapter,
        timestamp_seconds: Math.floor(currentTime),
        note: bookmarkNote,
        type: 'audio_timestamp',
      });
      toast.success('Bookmark saved!');
      setShowBookmarkNote(false);
      setBookmarkNote('');
    } catch (e) {
      toast.error('Failed to save bookmark');
    }
  };

  const formatSleep = (secs) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoadingOffline) {
    return <div style={{ color: textColor, fontSize: '14px' }}>Loading audio...</div>;
  }

  if (!audioUrl) {
    return (
      <div style={{ color: '#ef4444', fontSize: '14px' }}>
        Audio not available. Make sure the chapter is downloaded or you're online.
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: isDarkMode ? '#1A1F1C' : '#F0F0F0' }}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Main Controls Row */}
      <div className="flex items-center gap-3">
        {/* Play Button */}
        <button
          onClick={togglePlay}
          className="p-2 rounded-full hover:opacity-80 transition-opacity flex-shrink-0"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Scrubber */}
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.currentTime = parseFloat(e.target.value);
                setCurrentTime(parseFloat(e.target.value));
              }
            }}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: primaryColor }}
          />
          <div className="flex justify-between mt-1" style={{ color: textColor, fontSize: '11px' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: primaryColor }}>
          <Volume2 className="w-4 h-4" />
          <span>{isOnline ? '📡' : '📴'}</span>
        </div>
      </div>

      {/* Extra Controls Row */}
      <div className="flex items-center gap-2 flex-wrap relative">

        {/* Speed Control */}
        <div className="relative">
          <button
            onClick={() => { setShowSpeedMenu(v => !v); setShowSleepMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold hover:opacity-80 transition"
            style={{ backgroundColor: primaryColor + '22', color: primaryColor }}
          >
            {playbackSpeed}x <ChevronDown className="w-3 h-3" />
          </button>
          {showSpeedMenu && (
            <div className="absolute bottom-full mb-1 left-0 z-20 rounded-lg shadow-lg border overflow-hidden" style={{ backgroundColor: isDarkMode ? '#1A1F1C' : '#fff', borderColor: isDarkMode ? '#333' : '#e5e7eb' }}>
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => { setPlaybackSpeed(s); setShowSpeedMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-xs hover:opacity-70"
                  style={{ color: s === playbackSpeed ? primaryColor : textColor, fontWeight: s === playbackSpeed ? 700 : 400 }}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sleep Timer */}
        <div className="relative">
          <button
            onClick={() => { setShowSleepMenu(v => !v); setShowSpeedMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold hover:opacity-80 transition"
            style={{ backgroundColor: sleepMinutes > 0 ? '#f59e0b22' : primaryColor + '22', color: sleepMinutes > 0 ? '#f59e0b' : primaryColor }}
          >
            <Timer className="w-3 h-3" />
            {sleepRemaining ? formatSleep(sleepRemaining) : 'Sleep'}
          </button>
          {showSleepMenu && (
            <div className="absolute bottom-full mb-1 left-0 z-20 rounded-lg shadow-lg border overflow-hidden" style={{ backgroundColor: isDarkMode ? '#1A1F1C' : '#fff', borderColor: isDarkMode ? '#333' : '#e5e7eb' }}>
              {SLEEP_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSleepMinutes(opt.value); setShowSleepMenu(false); }}
                  className="block w-full text-left px-4 py-2 text-xs hover:opacity-70"
                  style={{ color: opt.value === sleepMinutes ? '#f59e0b' : textColor, fontWeight: opt.value === sleepMinutes ? 700 : 400 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => setShowBookmarkNote(v => !v)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold hover:opacity-80 transition"
          style={{ backgroundColor: primaryColor + '22', color: primaryColor }}
        >
          <Bookmark className="w-3 h-3" />
          Bookmark
        </button>
      </div>

      {/* Bookmark Note Input */}
      {showBookmarkNote && (
        <div className="flex gap-2 items-center mt-1">
          <input
            type="text"
            value={bookmarkNote}
            onChange={e => setBookmarkNote(e.target.value)}
            placeholder={`Note for ${formatTime(currentTime)}... (optional)`}
            className="flex-1 text-xs rounded px-2 py-1 border outline-none"
            style={{ borderColor: isDarkMode ? '#333' : '#e5e7eb', backgroundColor: isDarkMode ? '#111' : '#fff', color: textColor }}
            onKeyDown={e => e.key === 'Enter' && saveBookmark()}
          />
          <button
            onClick={saveBookmark}
            className="px-3 py-1 rounded text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}