import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft } from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalm': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Songs': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3,
  'Haggai': 2, 'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1,
  'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

export default function DrivingMode() {
  const navigate = useNavigate();
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const synth = useRef(window.speechSynthesis);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('audio_bible_prefs');
    if (saved) {
      const prefs = JSON.parse(saved);
      if (prefs.lastBook && prefs.lastChapter) {
        setBook(prefs.lastBook);
        setChapter(prefs.lastChapter);
        setCurrentVerseIndex(prefs.lastVerseIndex || 0);
      }
    }
  }, []);

  const chapters = chapter ? Array.from({ length: CHAPTER_COUNTS[book] || 1 }, (_, i) => i + 1) : [];

  // Fetch verses
  const { data: verses = [] } = useQuery({
    queryKey: ['bibleVerses', book, chapter],
    queryFn: async () => {
      if (!book || !chapter) return [];
      return base44.entities.BibleVerse.filter({
        book,
        chapter: parseInt(chapter),
        translation: 'WEB'
      }, 'verse', 500);
    },
    enabled: !!book && !!chapter
  });

  // Playback effect
  useEffect(() => {
    if (isPlaying && verses.length > 0) {
      playVerse();
    } else {
      synth.current.cancel();
    }
    return () => {
      synth.current.cancel();
    };
  }, [isPlaying, currentVerseIndex, speed, verses]);

  const playVerse = () => {
    if (!verses || verses.length === 0) return;

    synth.current.cancel();
    const verse = verses[currentVerseIndex];
    const verseNumber = verse.verse;
    const verseText = verse.text;
    const textToRead = `Verse ${verseNumber}. ${verseText}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      if (currentVerseIndex < verses.length - 1) {
        setCurrentVerseIndex(currentVerseIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    synth.current.speak(utterance);
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

  return (
    <div className="min-h-screen flex flex-col justify-between items-center" style={{ backgroundColor: '#0F1411' }}>
      {/* Close Button */}
      <div className="w-full p-6 flex justify-start">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('AudioBible'))}
          className="h-12 w-12"
        >
          <ChevronLeft className="w-6 h-6" style={{ color: '#8FB996' }} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6 w-full">
        {/* Current Reading Info */}
        <p className="text-5xl font-bold mb-2" style={{ color: '#EAEAEA' }}>
          {book} {chapter}
        </p>
        <p className="text-2xl mb-8" style={{ color: '#A0A0A0' }}>
          Verse {verses[currentVerseIndex]?.verse} of {verses.length}
        </p>

        {/* Large Play/Pause Button */}
        <Button
          size="icon"
          onClick={handlePlayPause}
          className="h-24 w-24 mb-12"
          style={{ backgroundColor: '#8FB996', color: '#FFFFFF' }}
        >
          {isPlaying ? (
            <Pause className="w-12 h-12" />
          ) : (
            <Play className="w-12 h-12 ml-1" />
          )}
        </Button>

        {/* Previous & Next Buttons */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <Button
            size="icon"
            onClick={handlePrevious}
            disabled={currentVerseIndex === 0}
            className="h-16 w-16"
            style={{ backgroundColor: '#8FB996', color: '#FFFFFF' }}
          >
            <SkipBack className="w-8 h-8" />
          </Button>

          <Button
            size="icon"
            onClick={handleNext}
            disabled={currentVerseIndex === verses.length - 1}
            className="h-16 w-16"
            style={{ backgroundColor: '#8FB996', color: '#FFFFFF' }}
          >
            <SkipForward className="w-8 h-8" />
          </Button>
        </div>

        {/* Speed Selector */}
        <div className="flex justify-center gap-3">
          {PLAYBACK_SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="px-5 py-3 rounded-lg font-bold text-lg transition-all"
              style={{
                backgroundColor: speed === s ? '#8FB996' : '#1A1F1C',
                color: speed === s ? '#0F1411' : '#EAEAEA',
                border: `2px solid ${speed === s ? '#8FB996' : '#2A2F2C'}`
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Indicator */}
      <div className="p-6 text-center">
        <p className="text-sm" style={{ color: '#A0A0A0' }}>Driving Mode - Eyes on the road</p>
      </div>
    </div>
  );
}