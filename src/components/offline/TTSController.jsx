import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '../I18nProvider';
import { Slider } from '@/components/ui/slider';

const TTS_LANG_MAP = {
  en: 'en-US',
  om: 'om-ET', // Afaan Oromo
  am: 'am-ET', // Amharic
  fr: 'fr-FR',
  ar: 'ar-SA',
};

export default function TTSController({ verses, currentChapter, currentBook }) {
  const { lang, t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);
  const synth = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Check TTS support
    const speechSupported = 'speechSynthesis' in window;
    setSupported(speechSupported);
    if (!speechSupported) {
      setError('Device text-to-speech not available');
    }

    return () => {
      if (synth.current && synth.current.speaking) {
        synth.current.cancel();
      }
    };
  }, []);

  const speak = (text, verseIdx) => {
    if (!supported || !synth.current) return;

    synth.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = TTS_LANG_MAP[lang] || 'en-US';
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setPlaying(true);
      setCurrentVerseIdx(verseIdx);
    };

    utterance.onend = () => {
      if (verseIdx < verses.length - 1) {
        // Auto-play next verse
        setTimeout(() => speak(verses[verseIdx + 1]?.text, verseIdx + 1), 300);
      } else {
        setPlaying(false);
      }
    };

    utterance.onerror = () => {
      setError('Speech synthesis error');
      setPlaying(false);
    };

    utteranceRef.current = utterance;
    synth.current.speak(utterance);
  };

  const handlePlay = () => {
    if (!verses || verses.length === 0) return;
    speak(verses[currentVerseIdx]?.text, currentVerseIdx);
  };

  const handlePause = () => {
    if (synth.current) {
      synth.current.cancel();
      setPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentVerseIdx > 0) {
      const prevIdx = currentVerseIdx - 1;
      speak(verses[prevIdx]?.text, prevIdx);
    }
  };

  const handleNext = () => {
    if (currentVerseIdx < verses.length - 1) {
      const nextIdx = currentVerseIdx + 1;
      speak(verses[nextIdx]?.text, nextIdx);
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed[0]);
    // If currently speaking, restart with new speed
    if (playing && synth.current && synth.current.speaking) {
      const text = verses[currentVerseIdx]?.text;
      if (text) {
        synth.current.cancel();
        setTimeout(() => speak(text, currentVerseIdx), 100);
      }
    }
  };

  const currentVerse = verses?.[currentVerseIdx];

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm font-semibold">{t('offline.tts.not_supported', 'Text-to-speech not available')}</p>
        </div>
        <p className="text-xs text-amber-700">
          {t('offline.tts.try_another', 'Your device does not support text-to-speech. Try another device or use streamed audio.')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-purple-600" />
        <div className="flex-1">
          <p className="font-semibold text-gray-800 text-sm">{t('offline.tts.title', 'Device Voice')}</p>
          <p className="text-xs text-gray-500">
            {currentBook} {currentChapter}
            {currentVerse?.verse ? `:${currentVerse.verse}` : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2">
          {error}
        </div>
      )}

      {/* Current Verse Display */}
      {currentVerse && (
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <p className="text-xs font-semibold text-gray-500 mb-1">Verse {currentVerse.verse}</p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">{currentVerse.text}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentVerseIdx === 0 || playing}
          className="gap-1"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="lg"
          onClick={playing ? handlePause : handlePlay}
          disabled={!verses || verses.length === 0}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          {playing ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {t('offline.tts.listen', 'Listen')}
            </>
          )}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleNext}
          disabled={currentVerseIdx >= verses.length - 1 || playing}
          className="gap-1"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700">
            {t('offline.tts.speed', 'Speed')}
          </label>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {speed.toFixed(2)}×
          </span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={handleSpeedChange}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.5×</span>
          <span>1× Normal</span>
          <span>2×</span>
        </div>
      </div>

      {/* Progress */}
      {verses && verses.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Verse {currentVerseIdx + 1}</span>
          <div className="flex-1 mx-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${((currentVerseIdx + 1) / verses.length) * 100}%` }}
            />
          </div>
          <span>{verses.length}</span>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center italic">
        {t('offline.tts.desc', 'Listen offline using your device\'s built-in voice.')}
      </p>
    </div>
  );
}