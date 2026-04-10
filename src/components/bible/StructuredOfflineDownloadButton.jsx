/**
 * Offline download button for StructuredBibleVerse (licensed translations).
 * Respects offline_allowed flag on the translation.
 */
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

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

function storageKey(abbrev, bookOrder, chapter) {
  return `sbv_${abbrev}_${bookOrder}_${chapter}`;
}

export default function StructuredOfflineDownloadButton({
  book,
  chapter,
  translationAbbrev,
  translationMeta, // { offline_allowed: bool, name: string }
  isDarkMode = false,
}) {
  const [downloading, setDownloading] = useState(false);

  const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
  const key = storageKey(translationAbbrev, bookOrder, chapter);
  const isDownloaded = !!localStorage.getItem(key);

  const offlineAllowed = translationMeta?.offline_allowed !== false;

  const handleDownload = async () => {
    if (!offlineAllowed) {
      toast.error(`Offline download not permitted for ${translationAbbrev} under its license.`);
      return;
    }
    setDownloading(true);
    try {
      const verses = await base44.entities.StructuredBibleVerse.filter({
        translation_abbrev: translationAbbrev,
        book_order: bookOrder,
        chapter: parseInt(chapter),
      }, 'verse', 500);

      if (verses.length === 0) {
        toast.error('No verses found for this chapter yet. Please check back after content is imported.');
        return;
      }

      localStorage.setItem(key, JSON.stringify(verses));
      toast.success(`${book} ${chapter} (${translationAbbrev}) saved for offline reading`);
    } catch (error) {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const color = isDarkMode ? '#8FB996' : '#6B8E6E';

  if (!offlineAllowed) {
    return (
      <Button variant="ghost" size="icon" disabled title="Offline download not permitted for this translation" className="h-10 w-10">
        <Lock className="w-4 h-4 text-gray-400" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDownload}
      disabled={downloading || isDownloaded}
      title={isDownloaded ? 'Downloaded' : `Download ${book} ${chapter} (${translationAbbrev}) for offline`}
      className="h-10 w-10"
      style={{ color }}
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isDownloaded ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </Button>
  );
}