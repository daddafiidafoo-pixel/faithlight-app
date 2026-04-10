import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import VerseExplainer from './VerseExplainer';
import ChapterSummarizer from './ChapterSummarizer';
import ChapterSummaryPrompt from './ChapterSummaryPrompt';

const PLAYBACK_SPEEDS = [1, 1.25, 1.5];

const getTranslationName = (code) => {
  const translations = {
    'WEB': 'World English Bible',
    'ASV': 'American Standard Version',
    'KJV': 'King James Version',
    'ESV': 'English Standard Version'
  };
  return translations[code] || code;
};

export default function FloatingAudioBar({ 
  verses, 
  book, 
  chapter,
  translation = 'WEB',
  onClose,
  isDarkMode = false
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExplainingMode, setIsExplainingMode] = useState(false);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const synth = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const summarizerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      playVerse();
    }
    return () => {
      synth.current.cancel();
      setIsSpeaking(false);
    };
  }, [isPlaying, currentVerseIndex, speed]);

  const playVerse = () => {
    if (!verses || verses.length === 0) return;

    synth.current.cancel();
    const verse = verses[currentVerseIndex];
    
    // Construct natural-sounding text
    const verseNumber = verse.verse;
    const verseText = verse.text;
    const textToRead = `Verse ${verseNumber}. ${verseText}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      // Auto-advance to next verse
      if (currentVerseIndex < verses.length - 1) {
        setCurrentVerseIndex(currentVerseIndex + 1);
      } else {
        // Chapter complete: show summary prompt
        setIsPlaying(false);
        setShowSummaryPrompt(true);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synth.current.speak(utterance);
    utteranceRef.current = utterance;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      synth.current.pause();
      setIsPlaying(false);
    } else {
      if (synth.current.paused) {
        synth.current.resume();
      }
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    synth.current.cancel();
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    synth.current.cancel();
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    setSpeed(PLAYBACK_SPEEDS[nextIndex]);
  };

  const handleExplanationStart = () => {
    setIsExplainingMode(true);
    // Keep isPlaying true so it resumes after explanation
  };

  const handleExplanationEnd = () => {
    setIsExplainingMode(false);
    // Resume Bible playback
    if (isPlaying) {
      setTimeout(() => {
        playVerse();
      }, 500);
    }
  };

  const handleSummaryRequest = async () => {
    if (summarizerRef.current) {
      await summarizerRef.current.playSummary({
        book,
        chapter,
        translation_code: translation,
        translation_name: getTranslationName(translation),
        chapter_text: verses.map(v => `${v.verse}. ${v.text}`).join('\n'),
        onSummaryStart: () => {
          setIsExplainingMode(true);
        },
        onSummaryEnd: () => {
          setIsExplainingMode(false);
          setShowSummaryPrompt(false);
        },
        onError: (errorCode) => {
          setShowSummaryPrompt(false);
        },
        speed: speed,
        isDarkMode
      });
    }
  };

  const handleSummarySkip = () => {
    setShowSummaryPrompt(false);
  };

  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const textColor = isDarkMode ? '#EAEAEA' : '#6E6E6E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ backgroundColor: bgColor, borderTop: `1px solid ${borderColor}`, boxShadow: '0 -2px 8px rgba(0,0,0,0.1)' }}
    >
      <ChapterSummarizer ref={summarizerRef} />

      <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
        {/* Chapter Summary Prompt */}
        {showSummaryPrompt && (
          <ChapterSummaryPrompt
            book={book}
            chapter={chapter}
            onSummary={handleSummaryRequest}
            onSkip={handleSummarySkip}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: primaryColor }}>
              {book} {chapter}
            </p>
            <p className="text-xs" style={{ color: textColor }}>
              Verse {verses[currentVerseIndex]?.verse} of {verses.length}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentVerseIndex === 0 || isExplainingMode}
            className="h-9 w-9"
          >
            <SkipBack className="w-4 h-4" style={{ color: primaryColor }} />
          </Button>

          <Button
            size="icon"
            onClick={handlePlayPause}
            disabled={isExplainingMode}
            className="h-10 w-10"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentVerseIndex === verses.length - 1 || isExplainingMode}
            className="h-9 w-9"
          >
            <SkipForward className="w-4 h-4" style={{ color: primaryColor }} />
          </Button>

          {/* Explanation Button */}
          <VerseExplainer
            verse={verses[currentVerseIndex]}
            book={book}
            chapter={chapter}
            translation_code={translation}
            translation_name={getTranslationName(translation)}
            verses_text={verses.map(v => `${v.verse}. ${v.text}`).join('\n')}
            onExplanationStart={handleExplanationStart}
            onExplanationEnd={handleExplanationEnd}
            isDarkMode={isDarkMode}
          />

          {/* Speed Control */}
          <button
            onClick={handleSpeedChange}
            disabled={isExplainingMode}
            className="px-2 py-1 rounded text-xs font-semibold border"
            style={{ 
              color: primaryColor,
              borderColor: borderColor,
              backgroundColor: isDarkMode ? '#0F1411' : '#FAFAF7',
              opacity: isExplainingMode ? 0.5 : 1
            }}
            title="Click to change speed"
          >
            {speed}x
          </button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isExplainingMode}
            className="h-9 w-9"
          >
            <X className="w-4 h-4" style={{ color: mutedColor }} />
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}