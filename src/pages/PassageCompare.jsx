import React, { useState } from 'react';
import { GitCompare } from 'lucide-react';
import MultiTranslationCompare from '../components/bible/MultiTranslationCompare';

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

export default function PassageCompare() {
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('3');
  const [startVerse, setStartVerse] = useState('');
  const [endVerse, setEndVerse] = useState('');
  const [committed, setCommitted] = useState({ book: 'John', chapter: '3', startVerse: '', endVerse: '' });

  const handleSearch = () => {
    setCommitted({ book, chapter, startVerse, endVerse });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--faith-light-primary-dark)] flex items-center gap-3 mb-1">
          <GitCompare className="w-7 h-7 text-indigo-600" />
          Compare Translations
        </h1>
        <p className="text-gray-500 text-sm">View any passage side-by-side across multiple Bible translations</p>
      </div>

      {/* Passage Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-600 mb-3">Select Passage</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-500 mb-1">Book</label>
            <select
              value={book}
              onChange={e => setBook(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Chapter</label>
            <input
              type="number" min="1"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Verse</label>
            <input
              type="number" min="1"
              value={startVerse}
              onChange={e => setStartVerse(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="All"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Verse</label>
            <input
              type="number" min="1"
              value={endVerse}
              onChange={e => setEndVerse(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="All"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-2.5 text-sm transition"
        >
          Compare Passage
        </button>
      </div>

      {/* Comparison Component — auto-expanded */}
      <div>
        <MultiTranslationCompare
          key={`${committed.book}-${committed.chapter}-${committed.startVerse}-${committed.endVerse}`}
          book={committed.book}
          chapter={parseInt(committed.chapter) || 1}
          startVerse={committed.startVerse ? parseInt(committed.startVerse) : undefined}
          endVerse={committed.endVerse ? parseInt(committed.endVerse) : undefined}
          defaultTranslation="WEB"
        />
      </div>
    </div>
  );
}