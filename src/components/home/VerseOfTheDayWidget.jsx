import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader, ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

// Sample Verse of the Day data (in production, fetch from Bible.is API)
const DAILY_VERSES = [
  {
    date: '2026-03-09',
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    author: 'Jesus Christ',
    reflection: 'God\'s love is unconditional and extends to everyone who believes in Him.'
  },
  {
    date: '2026-03-08',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    text: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters.',
    author: 'David',
    reflection: 'When we trust in God\'s guidance, we find peace and provision in all circumstances.'
  },
  {
    date: '2026-03-07',
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    author: 'Solomon',
    reflection: 'True wisdom comes from surrendering our plans to God\'s perfect direction.'
  },
  {
    date: '2026-03-06',
    book: 'Romans',
    chapter: 8,
    verse: 28,
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    author: 'Paul',
    reflection: 'Even in difficult circumstances, God is working out His perfect plan for those who trust Him.'
  }
];

export default function VerseOfTheDayWidget() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchVersOfTheDay = async () => {
      try {
        setLoading(true);
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // In production, fetch from Bible.is API
        // const response = await fetch(`/api/verse-of-day?date=${today}`);
        // const data = await response.json();

        // For now, use sample data
        const todayVerse = DAILY_VERSES[0];
        setVerse(todayVerse);
        setError(null);
      } catch (err) {
        console.error('Error fetching verse of the day:', err);
        setError('Unable to load verse. Using cache.');
        // Fallback to sample verse
        setVerse(DAILY_VERSES[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchVersOfTheDay();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 text-center">
        <p className="text-gray-600">{error || 'Verse of the day unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Verse of the Day</h3>
            <p className="text-xs text-gray-500">
              {verse.book} {verse.chapter}:{verse.verse}
            </p>
          </div>
        </div>
      </div>

      {/* Verse Text */}
      <div className="mb-4">
        <p className="text-lg leading-relaxed text-gray-900 font-serif mb-3">
          &quot;{verse.text}&quot;
        </p>
        <p className="text-sm text-gray-600 italic">— {verse.author}</p>
      </div>

      {/* Reflection (expandable) */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-medium text-gray-900">Daily Reflection</span>
          <ChevronRight className={`w-4 h-4 text-indigo-600 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            {verse.reflection}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link to={createPageUrl('BibleReader')} className="flex-1">
          <Button variant="outline" className="w-full gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
            <BookOpen className="w-4 h-4" />
            Read Full Chapter
          </Button>
        </Link>
        <Button
          onClick={() => {
            const text = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
          }}
          variant="ghost"
          className="px-4 text-indigo-600 hover:bg-indigo-100"
        >
          Copy
        </Button>
      </div>

      {/* Navigation to previous verses */}
      <div className="mt-4 pt-4 border-t border-indigo-200">
        <p className="text-xs text-gray-500 text-center">
          New verse every day at midnight
        </p>
      </div>
    </div>
  );
}