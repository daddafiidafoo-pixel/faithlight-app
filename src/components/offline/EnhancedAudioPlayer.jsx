import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Volume2, Wifi, WifiOff, Moon, X, ChevronUp, ChevronDown,
  BookOpen, Loader2, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHAPTER_COUNTS, ALL_BOOKS, BOOK_IDS } from './offlineConstants';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [
  { label: 'Off', minutes: 0 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hr', minutes: 60 },
];

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Simple hook to detect online status
function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

export default function EnhancedAudioPlayer({ book, chapter, fileset_id_audio, language_code, language_name, bible_name, onClose }) {
  const audioRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const isOnline = useOnline();

  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [hasOfflineText, setHasOfflineText] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [sleepIdx, setSleepIdx] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const [currentChapter, setCurrentChapter] = useState(chapter);

  const bookId = BOOK_IDS[currentBook] || currentBook;

  // Persist resume position
  const resumeKey = `audio_resume_${fileset_id_audio}_${bookId}_${currentChapter}`;

  const loadAudioUrl = useCallback(async () => {
    setLoadingUrl(true);
    setAudioUrl(null);
    try {
      // Check saved URL first
      const saved = await base44.entities.OfflineAudioChapter.filter(
        { fileset_id_audio, book_id: BOOK_IDS[currentBook] || currentBook, chapter: currentChapter },
        'created_date', 1
      );
      if (saved.length && saved[0].audio_source_url) {
        setAudioUrl(saved[0].audio_source_url);
      }
    } catch { }
    setLoadingUrl(false);
  }, [fileset_id_audio, currentBook, currentChapter]);

  const checkOfflineText = useCallback(async () => {
    try {
      const rows = await base44.entities.OfflineTextChapter.filter(
        { book_id: BOOK_IDS[currentBook] || currentBook, chapter: currentChapter }, 'created_date', 1
      );
      setHasOfflineText(rows.length > 0);
    } catch { setHasOfflineText(false); }
  }, [currentBook, currentChapter]);

  useEffect(() => { loadAudioUrl(); checkOfflineText(); }, [currentBook, currentChapter]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    // Resume from saved position
    const saved = parseFloat(localStorage.getItem(resumeKey) || '0');
    audio.src = audioUrl;
    audio.playbackRate = speed;
    if (saved > 0) audio.currentTime = saved;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      localStorage.setItem(resumeKey, audio.currentTime.toString());
    };
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); autoNext(); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioUrl]);

  // Auto-play next chapter
  const autoNext = useCallback(() => {
    const totalCh = CHAPTER_COUNTS[currentBook] || 1;
    if (currentChapter < totalCh) {
      setCurrentChapter(c => c + 1);
      setPlaying(true);
    } else {
      const idx = ALL_BOOKS.indexOf(currentBook);
      if (idx < ALL_BOOKS.length - 1) {
        setCurrentBook(ALL_BOOKS[idx + 1]);
        setCurrentChapter(1);
        setPlaying(true);
      }
    }
  }, [currentBook, currentChapter]);

  // Auto-play when new chapter loads
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (playing) {
      audio.play().catch(() => {});
    }
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { audio.play().catch(() => {}); }
    else { audio.pause(); }
  };

  const skip = (secs) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + secs, audio.duration || 0));
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    const s = SPEEDS[next];
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  // Sleep timer
  useEffect(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepIdx === 0 || !playing) { setSleepRemaining(null); return; }
    const mins = SLEEP_OPTIONS[sleepIdx].minutes;
    let remaining = mins * 60;
    setSleepRemaining(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      setSleepRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        audioRef.current?.pause();
        setSleepIdx(0);
        setSleepRemaining(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepIdx, playing]);

  const prevChapter = () => {
    if (currentChapter > 1) { setCurrentChapter(c => c - 1); }
    else {
      const idx = ALL_BOOKS.indexOf(currentBook);
      if (idx > 0) {
        const prev = ALL_BOOKS[idx - 1];
        setCurrentBook(prev);
        setCurrentChapter(CHAPTER_COUNTS[prev] || 1);
      }
    }
  };

  const nextChapter = () => autoNext();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // OFFLINE: no URL available
  if (!isOnline && !audioUrl && !loadingUrl) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-sm text-gray-700">Audio Unavailable</span>
          </div>
          {onClose && <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
        <p className="text-xs text-gray-500">Audio requires an internet connection.</p>
        {hasOfflineText && (
          <Link to={createPageUrl(`OfflineReader?book=${encodeURIComponent(currentBook)}&chapter=${currentChapter}`)}
            className="flex items-center gap-2 w-full px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
            <BookOpen className="w-4 h-4" /> Read offline text instead
          </Link>
        )}
      </div>
    );
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{currentBook} {currentChapter}</p>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={() => setMinimized(false)} className="text-gray-400"><ChevronUp className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <audio ref={audioRef} preload="metadata" />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-white/80" />
          <div>
            <p className="text-xs text-white/70">{language_name || language_code} · {bible_name || fileset_id_audio}</p>
            <p className="text-sm font-bold text-white">{currentBook} {currentChapter}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isOnline && <span title="Streaming requires internet"><WifiOff className="w-4 h-4 text-amber-300" /></span>}
          <button onClick={() => setShowSettings(s => !s)} className="p-1 text-white/70 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setMinimized(true)} className="p-1 text-white/70 hover:text-white">
            <ChevronDown className="w-4 h-4" />
          </button>
          {onClose && <button onClick={onClose} className="p-1 text-white/70 hover:text-white"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Speed</span>
            <button onClick={cycleSpeed} className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
              {SPEEDS[speedIdx]}×
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> Sleep Timer</span>
            <div className="flex gap-1">
              {SLEEP_OPTIONS.map((opt, i) => (
                <button key={i} onClick={() => setSleepIdx(i)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${sleepIdx === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {sleepRemaining && (
            <p className="text-xs text-amber-600 text-center">
              Pausing in {Math.floor(sleepRemaining / 60)}:{(sleepRemaining % 60).toString().padStart(2, '0')}
            </p>
          )}
          {!isOnline && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Audio requires internet to stream.
            </p>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-4 space-y-4">
        {loadingUrl ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        ) : !audioUrl ? (
          <div className="text-center py-3 space-y-2">
            <p className="text-xs text-gray-500">No saved stream for this chapter.</p>
            {hasOfflineText && (
              <Link to={createPageUrl(`OfflineReader?book=${encodeURIComponent(currentBook)}&chapter=${currentChapter}`)}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline">
                <BookOpen className="w-3.5 h-3.5" /> Read offline text
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div>
              <div className="w-full h-2 bg-gray-100 rounded-full cursor-pointer" onClick={seek}>
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button onClick={prevChapter} className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button onClick={() => skip(-10)} className="flex flex-col items-center text-gray-400 hover:text-gray-700 transition-colors">
                <Rewind className="w-4 h-4" />
                <span className="text-[10px]">10s</span>
              </button>

              <button onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white shadow-md transition-colors">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button onClick={() => skip(10)} className="flex flex-col items-center text-gray-400 hover:text-gray-700 transition-colors">
                <FastForward className="w-4 h-4" />
                <span className="text-[10px]">10s</span>
              </button>
              <button onClick={nextChapter} className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed pill */}
            <div className="flex justify-center">
              <button onClick={cycleSpeed}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-600 transition-colors">
                {SPEEDS[speedIdx]}× speed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}