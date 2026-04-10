import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Volume2, Moon, ChevronDown, ChevronUp } from 'lucide-react';

const SPEEDS = [
  { label: '0.5×', value: 0.5 },
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
];

const SLEEP_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

export default function TTSPlayer({ verses = [], book, chapter, isDarkMode, onVerseChange, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const utteranceRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const sleepIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopAll();
    };
  }, []);

  // Stop when verses change (new chapter)
  useEffect(() => {
    stopAll();
    setCurrentVerseIdx(0);
  }, [book, chapter]);

  const stopAll = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(sleepTimerRef.current);
    clearInterval(sleepIntervalRef.current);
    if (isMountedRef.current) {
      setIsPlaying(false);
      setSleepRemaining(null);
    }
    utteranceRef.current = null;
  }, []);

  const speakVerse = useCallback((idx, rate) => {
    if (!verses[idx]) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const verse = verses[idx];
    const text = `Verse ${verse.verse}. ${verse.text}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      if (isMountedRef.current) {
        setCurrentVerseIdx(idx);
        onVerseChange?.(idx);
      }
    };

    utterance.onend = () => {
      if (!isMountedRef.current) return;
      const nextIdx = idx + 1;
      if (nextIdx < verses.length) {
        speakVerse(nextIdx, rate);
      } else {
        setIsPlaying(false);
        setCurrentVerseIdx(0);
        onVerseChange?.(null);
      }
    };

    utterance.onerror = () => {
      if (isMountedRef.current) setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, [verses, onVerseChange]);

  const handlePlay = () => {
    if (!window.speechSynthesis) return;
    setIsPlaying(true);
    speakVerse(currentVerseIdx, speed);

    // Set up sleep timer
    if (sleepMinutes > 0) {
      const ms = sleepMinutes * 60 * 1000;
      setSleepRemaining(sleepMinutes * 60);
      sleepTimerRef.current = setTimeout(() => {
        stopAll();
      }, ms);
      sleepIntervalRef.current = setInterval(() => {
        setSleepRemaining(prev => {
          if (prev <= 1) {
            clearInterval(sleepIntervalRef.current);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handlePause = () => {
    window.speechSynthesis?.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    window.speechSynthesis?.resume();
    setIsPlaying(true);
  };

  const handleStop = () => {
    stopAll();
    setCurrentVerseIdx(0);
  };

  const handleSpeedChange = (val) => {
    setSpeed(val);
    if (isPlaying) {
      speakVerse(currentVerseIdx, val);
    }
  };

  const bg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const text = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const border = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const muted = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const accent = '#6C5CE7';

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ background: bg, border: `1px solid ${border}` }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ borderBottom: expanded ? `1px solid ${border}` : 'none' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4" style={{ color: accent }} />
          <span className="text-sm font-semibold" style={{ color: text }}>Read Aloud</span>
          {isPlaying && (
            <span className="text-xs px-2 py-0.5 rounded-full animate-pulse" style={{ background: accent, color: 'white' }}>
              Verse {(verses[currentVerseIdx]?.verse) ?? '—'}
            </span>
          )}
          {sleepRemaining !== null && (
            <span className="text-xs flex items-center gap-1" style={{ color: muted }}>
              <Moon className="w-3 h-3" /> {formatTime(sleepRemaining)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button onClick={(e) => { e.stopPropagation(); stopAll(); onClose(); }}
              className="text-xs opacity-50 hover:opacity-100" style={{ color: text }}>✕</button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: muted }} /> : <ChevronDown className="w-4 h-4" style={{ color: muted }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <Button size="sm" onClick={handlePlay} disabled={!verses.length} className="gap-2" style={{ background: accent, color: 'white', border: 'none' }}>
                <Play className="w-4 h-4" />
                {currentVerseIdx > 0 ? 'Resume' : 'Play Chapter'}
              </Button>
            ) : (
              <Button size="sm" onClick={handlePause} variant="outline" className="gap-2">
                <Pause className="w-4 h-4" /> Pause
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleStop} disabled={!isPlaying && currentVerseIdx === 0} className="gap-2">
              <Square className="w-4 h-4" /> Stop
            </Button>
            <span className="text-xs" style={{ color: muted }}>
              {verses.length > 0 ? `${currentVerseIdx + 1} / ${verses.length} verses` : 'No verses'}
            </span>
          </div>

          {/* Speed + Sleep Row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Speed */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: muted }}>Speed</span>
              <div className="flex gap-1">
                {SPEEDS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleSpeedChange(s.value)}
                    className="text-xs px-2 py-1 rounded-md transition-all"
                    style={{
                      background: speed === s.value ? accent : 'transparent',
                      color: speed === s.value ? 'white' : muted,
                      border: `1px solid ${speed === s.value ? accent : border}`,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Timer */}
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5" style={{ color: muted }} />
              <span className="text-xs font-medium" style={{ color: muted }}>Sleep</span>
              <Select value={String(sleepMinutes)} onValueChange={v => setSleepMinutes(Number(v))}>
                <SelectTrigger className="h-7 text-xs w-24" style={{ background: bg, color: text, borderColor: border }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLEEP_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Verse progress bar */}
          {verses.length > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: muted }}>
                <span>Progress</span>
                <span>{Math.round((currentVerseIdx / verses.length) * 100)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: border }}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ background: accent, width: `${(currentVerseIdx / verses.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {!window.speechSynthesis && (
            <p className="text-xs" style={{ color: muted }}>
              Text-to-speech is not supported in this browser.
            </p>
          )}
        </div>
      )}
    </div>
  );
}