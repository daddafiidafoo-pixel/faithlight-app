/**
 * useBibleChapter — fetches verses for a specific book + chapter via bibleService.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useBibleChapter(book, chapter, bibleLanguage, books) {
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!book || !chapter) return;
    let mounted = true;
    setLoading(true);
    setError('');

    base44.asServiceRole.entities.BibleVerse.filter({
      language: bibleLanguage,
      version: 'default',
      book_code: book,
      chapter_number: chapter,
    })
      .then(verses => {
        if (!mounted) return;
        const bookName = books.find(b => b.book_code === book)?.display_name || book;
        if (verses?.length) {
          setChapterData({
            bookName,
            bookCode: book,
            chapter,
            verses: verses.map(v => ({ verse: v.verse_number, text: v.verse_text })),
          });
        } else {
          setChapterData(null);
          setError('This chapter is not available in the selected language.');
        }
      })
      .catch(() => {
        if (mounted) {
          setChapterData(null);
          setError('Could not load this chapter. Please try again.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [book, chapter, bibleLanguage, books]);

  return { chapterData, loading, error };
}