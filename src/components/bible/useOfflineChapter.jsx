/**
 * useOfflineChapter
 * Checks OfflineIndex entity + localStorage to decide if a chapter is available offline.
 * Returns { isOffline, checkOffline, markDownloaded }
 */
import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

function checkLocalStorage(translation, book, chapter) {
  // New book-level key
  if (localStorage.getItem(`offline_book_${translation}_${book}`)) return true;
  // Legacy book key
  if (localStorage.getItem(`bible_book_${book}_${translation}`)) return true;
  // Structured key
  const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
  if (localStorage.getItem(`sbv_${translation}_${bookOrder}_${chapter}`)) return true;
  // Legacy chapter key
  if (localStorage.getItem(`bible_${book}_${chapter}_${translation}`)) return true;
  return false;
}

export function useOfflineChapter(userId, translation, book, chapter) {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkOffline = useCallback(async () => {
    if (!book || !chapter) { setIsOffline(false); return; }

    // Fast localStorage check first
    if (checkLocalStorage(translation, book, chapter)) {
      setIsOffline(true);
      return;
    }

    // Then check OfflineIndex entity if user is logged in
    if (!userId) { setIsOffline(false); return; }
    setChecking(true);
    try {
      const res = await base44.entities.OfflineIndex.filter({
        user_id: userId, translation, book, chapter
      }, '-created_date', 1).catch(() => []);
      setIsOffline(res[0]?.is_downloaded === true);
    } catch {
      setIsOffline(false);
    } finally {
      setChecking(false);
    }
  }, [userId, translation, book, chapter]);

  useEffect(() => {
    checkOffline();
  }, [checkOffline]);

  return { isOffline, checking, recheck: checkOffline };
}

export function loadOfflineVerses(translation, book, chapter) {
  // New book-level key
  const bookKey = `offline_book_${translation}_${book}`;
  const bookStr = localStorage.getItem(bookKey);
  if (bookStr) {
    try { const all = JSON.parse(bookStr); return all.filter(v => v.chapter === chapter); } catch {}
  }
  // Legacy book key
  const legacyBook = localStorage.getItem(`bible_book_${book}_${translation}`);
  if (legacyBook) {
    try { const all = JSON.parse(legacyBook); return all.filter(v => v.chapter === chapter); } catch {}
  }
  // Structured
  const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
  const structuredStr = localStorage.getItem(`sbv_${translation}_${bookOrder}_${chapter}`);
  if (structuredStr) {
    try { return JSON.parse(structuredStr); } catch {}
  }
  // Legacy chapter
  const chapterStr = localStorage.getItem(`bible_${book}_${chapter}_${translation}`);
  if (chapterStr) {
    try { return JSON.parse(chapterStr); } catch {}
  }
  return null;
}