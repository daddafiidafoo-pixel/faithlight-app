import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/components/languageStore';
import { useTranslation } from '@/components/hooks/useTranslation';
import { formatLocalizedDate } from '@/lib/formatLocalizedDate';
import ContinueReadingTracker from '@/components/devotion/ContinueReadingTracker';
import DevotionalReflection from '@/components/devotion/DevotionalReflection';
import DevotionAudioPlayer from '@/components/devotion/DevotionAudioPlayer';
import { Loader2, Calendar, BookOpen } from 'lucide-react';

/**
 * Daily Devotional page — fully translated
 * All visible strings use the global translation hook.
 */
export default function DailyDevotional() {
  const [searchParams] = useSearchParams();
  const customVerse = searchParams.get('verse');
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const audioLanguage = useLanguageStore(s => s.audioLanguage);
  const t = useTranslation();
  const [verseData, setVerseData] = useState(null);

  const today = new Date();
  const dateStr = formatLocalizedDate(today, uiLanguage);

  // Fetch verse data
  const { isLoading, error } = useQuery({
    queryKey: ['daily-verse', customVerse, uiLanguage],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke(
          customVerse ? 'getCustomVerse' : 'getDailyVerse',
          customVerse ? { reference: customVerse } : {}
        );

        const verse = response.data;

        // Track the verse as read
        ContinueReadingTracker.addVerse({
          reference: verse.reference,
          text: verse.text,
          translation: verse.translation,
        });

        setVerseData(verse);
        return verse;
      } catch (err) {
        console.error('Error fetching verse:', err);
        throw err;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('dailyDevotional.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !verseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('dailyDevotional.verseNotFound')}
          </h2>
          <p className="text-muted-foreground">
            {t('dailyDevotional.verseNotFoundDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b border-border py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground mb-4 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{dateStr}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('dailyDevotional.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('dailyDevotional.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Verse Display */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm mb-8">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">
            {verseData.reference}
          </p>
          <p className="text-2xl md:text-3xl leading-relaxed text-foreground italic mb-4">
            "{verseData.text}"
          </p>
          <p className="text-sm text-muted-foreground">
            {verseData.translation}
          </p>
        </div>

        {/* Audio Player */}
        <div className="mb-8">
          <DevotionAudioPlayer
            reference={verseData.reference}
            language={audioLanguage || 'en'}
          />
        </div>

        {/* Devotional Reflection */}
        <div className="mb-8">
          <DevotionalReflection
            verseReference={verseData.reference}
            verseText={verseData.text}
            bookName={verseData.book}
          />
        </div>

        {/* Reflection Prompt */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3">
            {t('dailyDevotional.reflectAndPray')}
          </h3>
          <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
            <li>{t('dailyDevotional.reflect1')}</li>
            <li>{t('dailyDevotional.reflect2')}</li>
            <li>{t('dailyDevotional.reflect3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}