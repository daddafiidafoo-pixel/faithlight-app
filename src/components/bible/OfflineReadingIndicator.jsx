import React from 'react';
import { HardDrive, Wifi, WifiOff } from 'lucide-react';

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

function isBookDownloaded(translation, book) {
  return !!localStorage.getItem(`offline_book_${translation}_${book}`);
}

function isChapterDownloaded(translation, book, chapter) {
  const bookKey = `offline_book_${translation}_${book}`;
  if (localStorage.getItem(bookKey)) return true;
  const legacyKey = `bible_${book}_${chapter}_${translation}`;
  if (localStorage.getItem(legacyKey)) return true;
  const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
  const structuredKey = `sbv_${translation}_${bookOrder}_${chapter}`;
  if (localStorage.getItem(structuredKey)) return true;
  return false;
}

export default function OfflineReadingIndicator({ book, chapter, translation, isOnline }) {
  if (!book || !chapter) return null;

  const offline = isChapterDownloaded(translation, book, chapter);

  if (offline) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
        <HardDrive className="w-3.5 h-3.5" />
        Downloaded content
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-3 py-1">
        <WifiOff className="w-3.5 h-3.5" />
        Offline — content unavailable
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
      <Wifi className="w-3.5 h-3.5" />
      Online
    </div>
  );
}