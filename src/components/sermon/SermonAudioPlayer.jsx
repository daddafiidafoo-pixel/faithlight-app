import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';

/**
 * SermonAudioPlayer - Text-to-speech player for sermons
 */
export default function SermonAudioPlayer({ text, language = 'en', title = 'Sermon' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Generate audio on mount
  useEffect(() => {
    const generateAudio = async () => {
      if (!text || !audioRef.current?.src) return;
    };
    generateAudio();
  }, [text, language]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current?.src) {
      setLoading(true);
      try {
        // Use Web Speech API for TTS with language-specific handling
        let speechText = text;
        
        // For Oromo, add transparent fallback message since native voice may not be available
        if (language === 'om') {
          speechText = `Sagalee Afaan Oromoo amma guutuu miti. Sagalee Ingiliizii fayyadamaa jirra.\n\n${text}`;
        }
        
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = languageCodeToSpeechLang(language);
        utterance.rate = speed;

        // Try to select a natural voice for the language
        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter((v) => v.lang.startsWith(language));
        if (langVoices.length > 0) {
          utterance.voice = langVoices[0];
        }

        utterance.onend = () => {
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } catch (err) {
        console.error('[SermonAudioPlayer] Error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const languageCodeToSpeechLang = (code) => {
    const map = {
      en: 'en-US',
      om: 'om-ET', // Afaan Oromoo
      am: 'am-ET', // Amharic
      ar: 'ar-SA',
      sw: 'sw-TZ',
      fr: 'fr-FR',
    };
    return map[code] || 'en-US';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            disabled={loading}
            aria-label={isPlaying ? 'Pause sermon audio' : 'Play sermon audio'}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-900">Listen to Sermon</p>
            <p className="text-xs text-gray-600">Language: {languageCodeToSpeechLang(language)}</p>
          </div>
        </div>
        <Volume2 size={18} className="text-indigo-600" />
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-700 w-12">Speed:</label>
        <div className="flex gap-1">
          {[0.75, 1, 1.25].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSpeed(s);
                if (audioRef.current) audioRef.current.playbackRate = s;
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                speed === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {audioRef.current?.duration && (
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              if (audioRef.current) audioRef.current.currentTime = e.target.value;
              setCurrentTime(e.target.value);
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}