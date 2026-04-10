import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, Headphones, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * VerseAudioPlayer
 * Plays a chapter verse-by-verse using AI-generated text-to-speech narration.
 * Highlights the current verse in sync.
 *
 * Props:
 *   - book, chapter, verses: array of {verse, text}
 *   - isDarkMode
 *   - onVerseChange(verseIndex): callback to highlight the active verse in parent
 */
export default function VerseAudioPlayer({ book, chapter, verses = [], isDarkMode = false, onVerseChange }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState('alloy');
  const [audioQueue, setAudioQueue] = useState([]); // array of {verseIdx, audioUrl}
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);
  const synthRef = useRef(null);

  const primaryColor = isDarkMode ? '#818CF8' : '#4F46E5';
  const cardColor = isDarkMode ? '#1E293B' : '#FFFFFF';
  const textColor = isDarkMode ? '#E2E8F0' : '#1E293B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';

  const VOICES = [
    { id: 'alloy', label: 'Alloy' },
    { id: 'echo', label: 'Echo' },
    { id: 'fable', label: 'Fable' },
    { id: 'onyx', label: 'Onyx' },
    { id: 'nova', label: 'Nova' },
    { id: 'shimmer', label: 'Shimmer' },
  ];

  // Use Web Speech API for verse-by-verse playback (no API key needed)
  const speakVerse = (verseIdx) => {
    if (!verses[verseIdx]) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(verses[verseIdx].text);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    // Try to use a nice voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')
    ) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      setCurrentVerseIdx(verseIdx);
      onVerseChange?.(verseIdx);
    };

    utterance.onend = () => {
      const nextIdx = verseIdx + 1;
      if (nextIdx < verses.length) {
        speakVerse(nextIdx);
      } else {
        setIsPlaying(false);
        setCurrentVerseIdx(0);
        onVerseChange?.(null);
        toast.success(`Finished reading ${book} ${chapter}`);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!verses.length) { toast.error('Load a chapter first'); return; }
    setIsPlaying(true);
    speakVerse(currentVerseIdx);
  };

  const handlePause = () => {
    setIsPlaying(false);
    window.speechSynthesis.pause();
  };

  const handleResume = () => {
    setIsPlaying(true);
    window.speechSynthesis.resume();
  };

  const handleStop = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    setCurrentVerseIdx(0);
    onVerseChange?.(null);
  };

  const handlePrev = () => {
    const idx = Math.max(0, currentVerseIdx - 1);
    window.speechSynthesis.cancel();
    setCurrentVerseIdx(idx);
    if (isPlaying) speakVerse(idx);
  };

  const handleNext = () => {
    const idx = Math.min(verses.length - 1, currentVerseIdx + 1);
    window.speechSynthesis.cancel();
    setCurrentVerseIdx(idx);
    if (isPlaying) speakVerse(idx);
  };

  const handleSpeedChange = (val) => {
    setSpeed(val);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      speakVerse(currentVerseIdx);
    }
  };

  const jumpToVerse = (idx) => {
    window.speechSynthesis.cancel();
    setCurrentVerseIdx(idx);
    if (isPlaying) speakVerse(idx);
  };

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Reset when chapter changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentVerseIdx(0);
    onVerseChange?.(null);
  }, [book, chapter]);

  if (!verses.length) return null;

  const currentVerse = verses[currentVerseIdx];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: cardColor, borderColor }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ borderBottom: `1px solid ${borderColor}` }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: primaryColor + '20' }}>
            <Headphones className="w-4 h-4" style={{ color: primaryColor }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: textColor }}>Verse Audio Playback</p>
            {isPlaying && (
              <p className="text-xs" style={{ color: primaryColor }}>
                ▶ Verse {currentVerse?.verse} of {verses.length}
              </p>
            )}
            {!isPlaying && (
              <p className="text-xs" style={{ color: isDarkMode ? '#94A3B8' : '#6B7280' }}>
                Listen verse-by-verse with text sync
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1 rounded-full animate-pulse"
                  style={{
                    height: `${8 + i * 4}px`,
                    backgroundColor: primaryColor,
                    animationDelay: `${i * 0.15}s`
                  }}
                />
              ))}
            </div>
          )}
          <span className="text-xs" style={{ color: isDarkMode ? '#94A3B8' : '#9CA3AF' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Current verse display */}
          {currentVerse && (
            <div
              className="rounded-lg p-3 text-sm leading-relaxed"
              style={{
                backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                borderLeft: `3px solid ${primaryColor}`,
                color: textColor
              }}
            >
              <span className="font-bold mr-2" style={{ color: primaryColor }}>v{currentVerse.verse}</span>
              {currentVerse.text}
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentVerseIdx === 0}
              className="p-2 rounded-full transition-opacity disabled:opacity-30"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
            >
              <SkipBack className="w-4 h-4" style={{ color: textColor }} />
            </button>

            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="p-3 rounded-full text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                <Play className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="p-3 rounded-full text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <Pause className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentVerseIdx === verses.length - 1}
              className="p-2 rounded-full transition-opacity disabled:opacity-30"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
            >
              <SkipForward className="w-4 h-4" style={{ color: textColor }} />
            </button>

            {isPlaying && (
              <button
                onClick={handleStop}
                className="p-2 rounded-full transition-opacity"
                style={{ backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }}
              >
                <X className="w-4 h-4" style={{ color: textColor }} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: isDarkMode ? '#94A3B8' : '#9CA3AF' }}>
              <span>Verse {currentVerseIdx + 1}</span>
              <span>{verses.length} verses</span>
            </div>
            <div
              className="w-full h-1.5 rounded-full cursor-pointer"
              style={{ backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                jumpToVerse(Math.floor(pct * verses.length));
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((currentVerseIdx + 1) / verses.length) * 100}%`,
                  backgroundColor: primaryColor
                }}
              />
            </div>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 flex-shrink-0" style={{ color: isDarkMode ? '#94A3B8' : '#6B7280' }} />
            <span className="text-xs flex-shrink-0" style={{ color: isDarkMode ? '#94A3B8' : '#6B7280' }}>Speed</span>
            <Slider
              min={0.5} max={2} step={0.25}
              value={[speed]}
              onValueChange={([v]) => handleSpeedChange(v)}
              className="flex-1"
            />
            <span className="text-xs font-mono w-8 text-center" style={{ color: textColor }}>{speed}x</span>
          </div>

          {/* Verse list */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {verses.map((v, idx) => (
              <button
                key={idx}
                onClick={() => jumpToVerse(idx)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors truncate"
                style={{
                  backgroundColor: idx === currentVerseIdx
                    ? primaryColor + '20'
                    : 'transparent',
                  color: idx === currentVerseIdx ? primaryColor : (isDarkMode ? '#94A3B8' : '#6B7280'),
                  fontWeight: idx === currentVerseIdx ? 600 : 400,
                  border: idx === currentVerseIdx ? `1px solid ${primaryColor}40` : '1px solid transparent'
                }}
              >
                <span className="font-bold mr-2">{v.verse}</span>
                {v.text.substring(0, 60)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}