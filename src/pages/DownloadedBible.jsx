import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import { listDownloadedChapters, removeOfflineChapter, getOfflineStats } from '@/components/lib/offlineBibleChapterService';
import { WifiOff, BookOpen, Trash2, RefreshCw } from 'lucide-react';

function groupByBook(chapters) {
  const map = {};
  for (const ch of chapters) {
    if (!map[ch.book_id]) {
      map[ch.book_id] = { book_id: ch.book_id, book_name: ch.book_name || ch.book_id, language: ch.language, chapters: [] };
    }
    map[ch.book_id].chapters.push(ch);
  }
  return Object.values(map).sort((a, b) => a.book_name.localeCompare(b.book_name));
}

export default function DownloadedBible() {
  const { t } = useI18n();
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const chapters = await listDownloadedChapters();
    setBooks(groupByBook(chapters));
    const s = { totalChapters: chapters.length, books: [...new Set(chapters.map(c => c.book_id))].length };
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemoveChapter = async (ch) => {
    await removeOfflineChapter(ch.book_id, ch.chapter_number, ch.language);
    load();
  };

  const handleRemoveBook = async (book) => {
    for (const ch of book.chapters) {
      await removeOfflineChapter(ch.book_id, ch.chapter_number, ch.language);
    }
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white px-4 pt-10 pb-10">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/15 p-2.5 rounded-xl">
              <WifiOff className="w-5 h-5 text-indigo-200" />
            </div>
            <h1 className="text-xl font-bold">{t('offline.downloadedBible', 'Downloaded Bible')}</h1>
          </div>
          <p className="text-indigo-200 text-sm">{t('offline.downloadedDesc', 'Available for offline reading')}</p>
          {stats && stats.totalChapters > 0 && (
            <div className="flex gap-4 mt-4">
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-black">{stats.books}</p>
                <p className="text-xs text-indigo-300">{t('offline.books', 'Books')}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <p className="text-xl font-black">{stats.totalChapters}</p>
                <p className="text-xs text-indigo-300">{t('offline.chapters', 'Chapters')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
            {t('offline.downloadedContent', 'Downloaded Content')}
          </h2>
          <button onClick={load} className="text-gray-400 hover:text-indigo-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-200 dark:bg-slate-700 animate-pulse" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">{t('offline.noDownloads', 'No chapters downloaded yet')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
              {t('offline.noDownloadsDesc', 'Open the Bible reader and tap Download on any chapter')}
            </p>
            <Link
              to={createPageUrl('BibleReader')}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {t('nav.bible', 'Open Bible')}
            </Link>
          </div>
        ) : (
          books.map(book => (
            <div key={book.book_id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {/* Book header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{book.book_name}</span>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">
                    {book.chapters.length} ch
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveBook(book)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
                >
                  {t('offline.removeAll', 'Remove all')}
                </button>
              </div>

              {/* Chapter list */}
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {book.chapters
                  .sort((a, b) => a.chapter_number - b.chapter_number)
                  .map(ch => (
                    <div key={ch.cache_key} className="flex items-center gap-1">
                      <Link
                        to={createPageUrl('BibleReader') + `?book=${ch.book_id}&chapter=${ch.chapter_number}&offline=1`}
                        className="px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors"
                      >
                        {ch.chapter_number}
                      </Link>
                      <button
                        onClick={() => handleRemoveChapter(ch)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        title={t('offline.remove', 'Remove')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}