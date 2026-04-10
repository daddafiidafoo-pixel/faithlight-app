import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, ChevronDown, ChevronUp } from 'lucide-react';

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export default function ScriptureAudioPlayer({ book, chapter, verses = [], onClose, onVerseChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const playingRef = useRef(false);
  const idxRef = useRef(0);
  const speedRef = useRef(1);

  // Keep refs in sync
  useEffect(() => { idxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const stopSpeaking = useCallback(() => {
    playingRef.current = false;
    synthRef.current.cancel();
    utteranceRef.current = null;
  }, []);

  const speakVerse = useCallback((idx) => {
    if (!verses[idx]) return;
    stopSpeaking();

    const text = `${verses[idx].verse}. ${verses[idx].text}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speedRef.current;
    utt.lang = 'en-US';

    utt.onstart = () => { playingRef.current = true; };
    utt.onend = () => {
      if (!playingRef.current) return;
      const next = idxRef.current + 1;
      if (next < verses.length) {
        setCurrentIdx(next);
        idxRef.current = next;
        onVerseChange?.(next);
        speakVerse(next);
      } else {
        // Finished all verses
        setIsPlaying(false);
        playingRef.current = false;
        setCurrentIdx(0);
      }
    };
    utt.onerror = () => { setIsPlaying(false); playingRef.current = false; };

    utteranceRef.current = utt;
    synthRef.current.speak(utt);
  }, [verses, stopSpeaking, onVerseChange]);

  // Keep audio going when tab is hidden (iOS/Android workaround via periodic resume)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playingRef.current) {
        // Resume any paused synth on visibility change (Chrome suspends on hidden tabs)
        if (synthRef.current.paused) synthRef.current.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Periodic resume to prevent browser from suspending TTS
  useEffect(() => {
    const interval = setInterval(() => {
      if (playingRef.current && synthRef.current.paused) {
        synthRef.current.resume();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSpeaking();
  }, [stopSpeaking]);

  const handlePlayPause = () => {
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      playingRef.current = false;
    } else {
      if (synthRef.current.paused && utteranceRef.current) {
        synthRef.current.resume();
        setIsPlaying(true);
        playingRef.current = true;
      } else {
        setIsPlaying(true);
        speakVerse(currentIdx);
      }
    }
  };

  const handlePrev = () => {
    const prev = Math.max(0, currentIdx - 1);
    setCurrentIdx(prev);
    onVerseChange?.(prev);
    if (isPlaying) speakVerse(prev);
  };

  const handleNext = () => {
    const next = Math.min(verses.length - 1, currentIdx + 1);
    setCurrentIdx(next);
    onVerseChange?.(next);
    if (isPlaying) speakVerse(next);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    // Restart current verse at new speed
    if (isPlaying) {
      speakVerse(currentIdx);
    }
  };

  const handleClose = () => {
    stopSpeaking();
    setIsPlaying(false);
    onClose?.();
  };

  const currentVerse = verses[currentIdx];
  const progress = verses.length > 0 ? ((currentIdx + 1) / verses.length) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-200" />
          <span className="text-white text-sm font-semibold">
            {book} {chapter} — Audio
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(v => !v)} className="text-indigo-200 hover:text-white p-1">
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={handleClose} className="text-indigo-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Verse {currentIdx + 1}</span>
              <span>{verses.length} verses</span>
            </div>
          </div>

          {/* Current verse preview */}
          {currentVerse && (
            <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 min-h-[60px]">
              <span className="text-xs font-bold text-indigo-600 mr-1">{currentVerse.verse}.</span>
              <span className="text-sm text-gray-700 leading-relaxed line-clamp-3">{currentVerse.text}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            >
              <SkipBack className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-colors"
            >
              {isPlaying
                ? <Pause className="w-6 h-6 text-white" />
                : <Play className="w-6 h-6 text-white ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIdx === verses.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
            >
              <SkipForward className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Speed control */}
          <div>
            <p className="text-xs text-gray-400 text-center mb-2">Playback Speed</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {SPEEDS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    speed === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Verse list (scrollable) */}
          <div className="max-h-36 overflow-y-auto space-y-1 border-t border-gray-100 pt-3">
            {verses.map((v, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIdx(i); onVerseChange?.(i); if (isPlaying) speakVerse(i); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex gap-2 ${
                  i === currentIdx ? 'bg-indigo-100 text-indigo-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold min-w-5 text-indigo-500">{v.verse}</span>
                <span className="line-clamp-1">{v.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}