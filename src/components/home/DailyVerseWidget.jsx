import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Bookmark, BookMarked } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';
import { t } from '@/lib/translations';
import { base44 } from '@/api/base44Client';

export default function DailyVerseWidget() {
  const navigate = useNavigate();
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const [verse, setVerse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [savedAsHighlight, setSavedAsHighlight] = useState(false);

  const loadRandomVerse = async () => {
    setIsLoading(true);
    try {
      // Get all verses and pick a random one
      const allVerses = await base44.entities.StructuredBibleVerse.list('?', 1);
      const randomVerse = allVerses[Math.floor(Math.random() * allVerses.length)];
      setVerse(randomVerse);
      setSavedToJournal(false);
      setSavedAsHighlight(false);
    } catch (error) {
      console.error('Failed to load verse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRandomVerse();
  }, []);

  const handleSaveToJournal = async () => {
    if (!verse) return;
    setIsSavingJournal(true);
    try {
      await base44.entities.PrayerJournalEntry.create({
        userEmail: 'user@faithlight.local', // In real app, get from auth
        verseReference: verse.reference,
        noteContent: verse.text,
        mood: 'peaceful',
        isPrivate: true,
      });
      setSavedToJournal(true);
      setTimeout(() => setSavedToJournal(false), 3000);
    } catch (error) {
      console.error('Failed to save to journal:', error);
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleSaveAsHighlight = async () => {
    if (!verse) return;
    setIsSavingHighlight(true);
    try {
      await base44.entities.VerseHighlight.create({
        userEmail: 'user@faithlight.local', // In real app, get from auth
        book: verse.book_key,
        chapter: verse.chapter,
        verseStart: verse.verse,
        verseEnd: verse.verse,
        verseReference: verse.reference,
        textSnippet: verse.text,
        color: 'yellow',
      });
      setSavedAsHighlight(true);
      setTimeout(() => setSavedAsHighlight(false), 3000);
    } catch (error) {
      console.error('Failed to save highlight:', error);
    } finally {
      setIsSavingHighlight(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-6 sm:p-8">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : verse ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {uiLanguage === 'om' ? 'Ayaa Guyyaa' : 'Verse of the Day'}
              </h3>
              <p className="text-2xl font-bold text-primary mt-1">{verse.reference}</p>
            </div>
            <button
              onClick={loadRandomVerse}
              disabled={isLoading}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary hover:text-primary/80"
              title={uiLanguage === 'om' ? 'Haaroomsi' : 'Refresh'}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Verse Text */}
          <p className="text-lg leading-relaxed text-foreground italic">
            "{verse.text}"
          </p>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            {verse.language_code && (
              <span>{verse.language_code.toUpperCase()}</span>
            )}
            {verse.translation_code && (
              <span> · {verse.translation_code}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-primary/10">
            <button
              onClick={() => navigate(`/BibleReader?book=${verse.book_key}&chapter=${verse.chapter}&verse=${verse.verse}`)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              {t(uiLanguage, 'common.read')}
            </button>

            <button
              onClick={handleSaveToJournal}
              disabled={isSavingJournal}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                savedToJournal
                  ? 'bg-green-100 text-green-700'
                  : 'bg-background border border-input hover:border-primary text-foreground'
              }`}
            >
              {isSavingJournal
                ? '...'
                : savedToJournal
                ? '✓ ' + t(uiLanguage, 'common.save')
                : t(uiLanguage, 'journal.title')}
            </button>

            <button
              onClick={handleSaveAsHighlight}
              disabled={isSavingHighlight}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                savedAsHighlight
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-background border border-input hover:border-primary text-foreground'
              }`}
            >
              {isSavingHighlight
                ? '...'
                : savedAsHighlight
                ? '✓ ' + t(uiLanguage, 'highlights.title')
                : t(uiLanguage, 'common.save')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}