import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize2, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AudioPlayer({ text, title = 'Audio', audioLanguage = 'en' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  // Generate audio using Web Speech API or TTS service
  const generateAudio = async () => {
    if (!audioRef.current && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLangCode(audioLanguage);
      utterance.rate = playbackRate;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const getLangCode = (lang) => {
    const langMap = {
      en: 'en-US',
      om: 'en-US', // Fallback for Afaan Oromoo
      sw: 'sw-KE',
      ar: 'ar-SA',
      fr: 'fr-FR',
      am: 'am-ET',
      ti: 'ti-ER',
    };
    return langMap[lang] || 'en-US';
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (currentTime === 0) {
        generateAudio();
      } else {
        window.speechSynthesis.resume();
      }
      setIsPlaying(true);
    }
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    window.speechSynthesis.cancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-2xl">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <p className="text-sm font-medium mb-2 truncate">{title}</p>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div
                className="bg-white rounded-full h-1 transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Time */}
          <span className="text-xs font-medium">{formatTime(currentTime)}</span>

          {/* Speed Control */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlaybackRateChange}
            className="text-white hover:bg-white/20 text-xs px-2"
          >
            {playbackRate}x
          </Button>

          {/* Volume */}
          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Hidden audio ref for potential future use */}
        <audio ref={audioRef} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />
      </div>
    </div>
  );
}