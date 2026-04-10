import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { getTodayVerse, getTodayDateString } from './dailyVersesConfig';
import { getVerse } from './bibleVerseCache';
import { toast } from 'sonner';

export default function DailyVerseMini({ isDarkMode = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState(null);
  const synth = React.useRef(window.speechSynthesis);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const todayVerse = getTodayVerse();
  const todayDateString = getTodayDateString();
  const stored = localStorage.getItem('preferred_translation');
  const translationId = (stored && stored !== 'undefined' && stored !== 'null') ? stored : 'WEB';

  // Home budget: exactly 1 query (translation_id + book + chapter — 3 fields, safe)
  const { data: verse } = useQuery({
    queryKey: ['dailyVerseMini', translationId, todayVerse.book, todayVerse.chapter, todayVerse.verse],
    queryFn: async () => {
      try {
        return await getVerse(translationId, todayVerse.book, todayVerse.chapter, todayVerse.verse);
      } catch {
        return null;
      }
    },
    retry: false,
    throwOnError: false,
  });

  const handlePlay = () => {
    if (!verse) { toast.error('Could not load verse'); return; }
    setIsPlaying(true);
    synth.current.cancel();
    const textToRead = `${verse.reference}. ${verse.text}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = user?.voice_speed || 1;
    utterance.onend = () => {
      setIsPlaying(false);
      localStorage.setItem('dailyVerseLastPlayedDate', todayDateString);
    };
    utterance.onerror = () => { setIsPlaying(false); toast.error('Audio playback error'); };
    synth.current.speak(utterance);
  };

  if (!verse) return null;

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const textColor = isDarkMode ? '#EAEAEA' : '#6E6E6E';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-0.5" style={{ color: primaryColor }}>
            Today's Verse
          </p>
          <p className="text-xs truncate" style={{ color: textColor }}>
            {verse.reference}
          </p>
        </div>
        <Button
          size="sm"
          onClick={handlePlay}
          disabled={isPlaying}
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          className="gap-1 flex-shrink-0"
        >
          {isPlaying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          <span className="text-xs hidden sm:inline">Play</span>
        </Button>
      </div>
    </div>
  );
}