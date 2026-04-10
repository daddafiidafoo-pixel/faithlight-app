import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Headphones, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

const BOOK_CHAPTERS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34, Joshua: 24, Judges: 21, Ruth: 4,
  'Samuel': 31, '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31, Ecclesiastes: 12, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9, Obadiah: 1,
  Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16, '1 Corinthians': 16, '2 Corinthians': 13,
  Galatians: 6, Ephesians: 6, Philippians: 4, Colossians: 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
  '1 Timothy': 6, '2 Timothy': 4, Titus: 3, Philemon: 1, Hebrews: 13, James: 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, Jude: 1, Revelation: 22,
};

function HeatmapCell({ intensity, chapter, book }) {
  const colors = [
    'bg-gray-100',
    'bg-blue-100',
    'bg-blue-300',
    'bg-blue-500',
    'bg-blue-700',
  ];
  const color = colors[Math.min(intensity, 4)];

  return (
    <div
      className={`${color} w-6 h-6 rounded text-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all group relative`}
      title={`${book} ${chapter}`}
    >
      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
        {book} {chapter}: {intensity} reads
      </div>
    </div>
  );
}

function BookHeatmap({ book, engagement }) {
  const chapters = BOOK_CHAPTERS[book] || 1;
  const bookEngagement = engagement[book] || {};

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-sm mb-2 w-32">{book}</h3>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: chapters }, (_, i) => i + 1).map((ch) => (
          <HeatmapCell
            key={ch}
            chapter={ch}
            book={book}
            intensity={bookEngagement[ch] || 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function ScriptureHeatmap() {
  const { user, isAuthenticated } = useAuth();

  const { data: engagement = {}, isLoading } = useQuery({
    queryKey: ['scriptureEngagement', user?.email],
    queryFn: async () => {
      const [readSessions, notes, bookmarks] = await Promise.all([
        base44.entities.ReadingSessionLog.filter({ userEmail: user.email }),
        base44.entities.VerseNote.filter({ userEmail: user.email }),
        user ? base44.entities.Bookmark?.filter?.({ userEmail: user.email }) : [],
      ]);

      const engagement = {};
      BIBLE_BOOKS.forEach((book) => {
        engagement[book] = {};
      });

      // Count reads from sessions
      readSessions.forEach((session) => {
        session.booksRead?.forEach((book) => {
          BIBLE_BOOKS.forEach((b) => {
            if (b.toLowerCase() === book.toLowerCase()) {
              for (let ch = 1; ch <= (BOOK_CHAPTERS[b] || 1); ch++) {
                engagement[b][ch] = (engagement[b][ch] || 0) + 1;
              }
            }
          });
        });
      });

      // Count notes
      notes.forEach((note) => {
        const book = note.bookName;
        const chapter = note.chapter;
        if (engagement[book]) {
          engagement[book][chapter] = (engagement[book][chapter] || 0) + 2;
        }
      });

      // Count bookmarks
      bookmarks?.forEach((bm) => {
        const book = bm.bookName;
        const chapter = bm.chapter;
        if (engagement[book]) {
          engagement[book][chapter] = (engagement[book][chapter] || 0) + 1;
        }
      });

      return engagement;
    },
    enabled: !!user?.email,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Sign in to view your Scripture engagement</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalChaptersRead = Object.values(engagement).reduce(
    (sum, book) => sum + Object.keys(book).length,
    0
  );
  const totalIntensity = Object.values(engagement).reduce(
    (sum, book) => sum + Object.values(book).reduce((s, i) => s + i, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Scripture Heatmap</h1>
          <p className="text-gray-600">Your Bible engagement journey across all 66 books</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Chapters Read</p>
            <p className="text-2xl font-bold">{totalChaptersRead}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Books Engaged</p>
            <p className="text-2xl font-bold">
              {Object.values(engagement).filter((book) => Object.keys(book).length > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Reads</p>
            <p className="text-2xl font-bold">{totalIntensity}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-700" />
              <span className="text-xs text-gray-500">Most Active</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-4 mb-8 border border-gray-200">
          <p className="text-sm font-semibold mb-3">Intensity Scale</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <span className="text-xs">Not read</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100" />
              <span className="text-xs">Light</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-300" />
              <span className="text-xs">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-700" />
              <span className="text-xs">Very High</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl p-8 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BIBLE_BOOKS.map((book) => (
              <BookHeatmap key={book} book={book} engagement={engagement} />
            ))}
          </div>
        </motion.div>

        {totalChaptersRead === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Start reading to build your heatmap!</p>
          </div>
        )}
      </div>
    </div>
  );
}