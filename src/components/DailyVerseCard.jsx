import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, Volume2, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VERSES = [
  {
    dayOfWeek: 1,
    text: "Your word is a lamp to my feet and a light to my path.",
    reference: "Psalm 119:105"
  },
  {
    dayOfWeek: 2,
    text: "Trust in the Lord with all your heart.",
    reference: "Proverbs 3:5"
  },
  {
    dayOfWeek: 3,
    text: "The Lord is my strength and my shield.",
    reference: "Psalm 28:7"
  },
  {
    dayOfWeek: 4,
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  },
  {
    dayOfWeek: 5,
    text: "For I know the plans I have for you.",
    reference: "Jeremiah 29:11"
  },
  {
    dayOfWeek: 6,
    text: "The Lord is near to all who call on Him.",
    reference: "Psalm 145:18"
  },
  {
    dayOfWeek: 0,
    text: "Be still, and know that I am God.",
    reference: "Psalm 46:10"
  }
];

export default function DailyVerseCard() {
  const [user, setUser] = useState(null);
  const [verse, setVerse] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeVerse = async () => {
      try {
        // Get current user
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Get verse for today (by day of week)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const todayVerse = VERSES.find(v => v.dayOfWeek === dayOfWeek);
        setVerse(todayVerse);

        // Check if user has saved this verse
        if (currentUser) {
          const savedVerses = await base44.entities.SavedVerse.filter({
            user_id: currentUser.id,
            verse_text: todayVerse.text
          });
          setIsSaved(savedVerses.length > 0);
        }
      } catch (error) {
        console.error('Error initializing verse:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeVerse();
  }, []);

  const handleSaveVerse = async () => {
    if (!user || !verse) return;

    try {
      if (isSaved) {
        // Remove from saved
        const saved = await base44.entities.SavedVerse.filter({
          user_id: user.id,
          verse_text: verse.text
        });
        if (saved.length > 0) {
          await base44.entities.SavedVerse.delete(saved[0].id);
        }
      } else {
        // Add to saved
        await base44.entities.SavedVerse.create({
          user_id: user.id,
          verse_text: verse.text,
          reference: verse.reference,
          day_of_week: new Date().getDay()
        });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving verse:', error);
    }
  };

  const handlePlayAudio = () => {
    if (!verse) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const text = `${verse.text}. ${verse.reference}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    if (!verse) return;

    const text = `"${verse.text}"\n— ${verse.reference}\n\nShared from FaithLight`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Verse of the Day',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Verse copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8 md:p-12 shadow-2xl animate-pulse">
        <div className="relative z-10">
          <div className="h-6 bg-purple-700 rounded w-32 mb-4"></div>
          <div className="h-32 bg-purple-700 rounded mb-6"></div>
          <div className="h-6 bg-purple-600 rounded w-48 mb-8"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-purple-700 rounded w-20"></div>
            <div className="h-10 bg-purple-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-8 md:p-12 shadow-2xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl -ml-32 -mb-32"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-purple-300 mb-2">📖 Today's Word</h2>
          <p className="text-sm text-purple-200">Let God's Word guide your day.</p>
        </div>

        {/* Verse */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed mb-6">
            "{verse.text}"
          </p>
          <p className="text-lg text-amber-300 font-medium">
            — {verse.reference}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveVerse}
            disabled={!user}
            className={`text-white hover:bg-purple-500/20 ${isSaved ? 'text-red-400' : 'text-purple-300'}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayAudio}
            className="text-purple-300 hover:bg-purple-500/20"
          >
            {isPlaying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            {isPlaying ? 'Playing' : 'Listen'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-purple-300 hover:bg-purple-500/20"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}