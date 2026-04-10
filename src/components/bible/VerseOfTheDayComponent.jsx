import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Share2, Copy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';
import { createPageUrl } from '@/utils';

export default function VerseOfTheDayComponent() {
  const { t, lang } = useI18n();
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchVerseOfDay();
  }, [lang]);

  const fetchVerseOfDay = async () => {
    try {
      setLoading(true);
      // Get today's verse reference from VerseOfDay entity
      const today = new Date().toISOString().slice(5, 10); // MM-DD format
      const verseOfDay = await base44.entities.VerseOfDay.filter(
        { day_key: today },
        '-created_date',
        1
      );

      if (!verseOfDay?.length) {
        // Fallback: random verse
        const allVerses = await base44.entities.StructuredBibleVerse.filter(
          { language_code: lang || 'en' },
          'RAND()',
          1
        );
        if (allVerses?.length) {
          setVerse(allVerses[0]);
        }
        setLoading(false);
        return;
      }

      const vodRef = verseOfDay[0];
      // Fetch the actual verse text
      const verseText = await base44.entities.StructuredBibleVerse.filter(
        {
          language_code: lang || 'en',
          book_key: vodRef.book_key,
          chapter: vodRef.chapter,
          verse: vodRef.verse,
        },
        '-created_date',
        1
      );

      if (verseText?.length) {
        setVerse(verseText[0]);
      }
    } catch (error) {
      console.error('Error fetching verse of day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (verse) {
      const text = `${verse.book_name} ${verse.chapter}:${verse.verse}\n${verse.text}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (verse && navigator.share) {
      try {
        await navigator.share({
          title: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
          text: verse.text,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 animate-pulse">
        <div className="h-32 bg-indigo-100 rounded"></div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {t('home.verseOfTheDayCard', 'Verse of the Day')}
          </h3>
          <p className="text-sm text-gray-600">
            {verse.book_name} {verse.chapter}:{verse.verse}
          </p>
        </div>
      </div>

      <blockquote className="pl-4 border-l-4 border-indigo-600 text-gray-800 italic mb-4 py-2">
        "{verse.text}"
      </blockquote>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}
        </Button>

        {navigator.share && (
          <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            {t('common.share', 'Share')}
          </Button>
        )}

        <a
          href={createPageUrl('BibleReader', `?book=${verse.book_key}&chapter=${verse.chapter}`)}
          className="ml-auto"
        >
          <Button variant="default" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {t('home.readMore', 'Read More')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}