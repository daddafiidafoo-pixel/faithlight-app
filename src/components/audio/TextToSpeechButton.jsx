/**
 * TextToSpeechButton
 * Language-aware TTS using Web Speech API.
 * Supports play/pause, speed control, and per-language voice selection.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Pause, Play, Square, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

// Map app language codes to BCP-47 locale hints for voice selection
const LANG_LOCALE_MAP = {
  en: 'en',
  om: 'om',   // Afaan Oromoo — falls back to system default
  am: 'am',   // Amharic
  ar: 'ar',
  sw: 'sw',
  fr: 'fr',
  ti: 'ti',
};

function getBestVoice(langCode) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const locale = LANG_LOCALE_MAP[langCode] || langCode;
  // Try exact match first, then prefix match
  return (
    voices.find(v => v.lang.toLowerCase().startsWith(locale.toLowerCase())) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
    voices[0]
  );
}

const SPEEDS = [0.75, 1, 1.25, 1.5];

export default function TextToSpeechButton({
  text,
  reference = '',
  language = 'en',
  size = 'md',       // 'sm' | 'md' | 'lg'
  showLabel = true,
  className = '',
}) {
  const [status, setStatus] = useState('idle'); // idle | playing | paused
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const utteranceRef = useRef(null);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Cancel on unmount
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!('speechSynthesis' in window)) return null;

  const fullText = reference ? `${reference}. ${text}` : text;

  const stop = () => {
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(fullText);
    utt.rate = speedRef.current;
    utt.pitch = 1;
    utt.volume = 1;

    // Wait for voices to load (needed on some browsers)
    const assignVoice = () => {
      const voice = getBestVoice(language);
      if (voice) utt.voice = voice;
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      assignVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = assignVoice;
    }

    utt.onstart = () => setStatus('playing');
    utt.onend = () => setStatus('idle');
    utt.onerror = (e) => {
      if (e.error !== 'interrupted') toast.error('Speech failed');
      setStatus('idle');
    };
    utt.onpause = () => setStatus('paused');
    utt.onresume = () => setStatus('playing');

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
    setStatus('playing');
  };

  const toggle = () => {
    if (status === 'idle') {
      speak();
    } else if (status === 'playing') {
      window.speechSynthesis.pause();
      setStatus('paused');
    } else {
      window.speechSynthesis.resume();
      setStatus('playing');
    }
  };

  const handleSpeedChange = (s) => {
    setSpeed(s);
    setShowSpeedMenu(false);
    // Restart with new speed if currently playing/paused
    if (status !== 'idle') {
      speak();
    }
  };

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const btnBase = `flex items-center gap-1.5 font-medium transition-all rounded-xl border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`;
  const btnSizing = size === 'sm'
    ? 'px-2.5 py-1.5 text-xs min-h-[36px]'
    : size === 'lg'
    ? 'px-4 py-3 text-base min-h-[48px]'
    : 'px-3 py-2 text-sm min-h-[40px]';

  const colorIdle = 'bg-white border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700';
  const colorActive = 'bg-indigo-50 border-indigo-300 text-indigo-700';

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Play / Pause button */}
      <button
        onClick={toggle}
        aria-label={status === 'playing' ? 'Pause' : status === 'paused' ? 'Resume' : 'Listen'}
        className={`${btnBase} ${btnSizing} ${status !== 'idle' ? colorActive : colorIdle}`}
      >
        {status === 'playing' ? (
          <>
            <Pause size={iconSize} />
            {showLabel && <span>Pause</span>}
            <span className="flex gap-0.5 ml-1">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className="w-0.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ height: 10 + i * 3, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </>
        ) : status === 'paused' ? (
          <>
            <Play size={iconSize} />
            {showLabel && <span>Resume</span>}
          </>
        ) : (
          <>
            <Volume2 size={iconSize} />
            {showLabel && <span>Listen</span>}
          </>
        )}
      </button>

      {/* Stop button (only when active) */}
      {status !== 'idle' && (
        <button
          onClick={stop}
          aria-label="Stop"
          className={`${btnBase} px-2 py-2 min-h-[40px] border-gray-200 text-gray-500 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
        >
          <Square size={iconSize} />
        </button>
      )}

      {/* Speed selector */}
      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(s => !s)}
          aria-label="Playback speed"
          className={`${btnBase} px-2 py-2 min-h-[40px] text-xs border-gray-200 text-gray-500 bg-white hover:bg-gray-50`}
        >
          {speed}x <ChevronDown size={10} />
        </button>
        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[72px]">
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`block w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}