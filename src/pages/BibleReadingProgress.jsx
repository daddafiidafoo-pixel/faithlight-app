import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bibleBookNames';
import { useNavigate } from 'react-router-dom';

const OT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Moofaa');
const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Haaraa');

function ProgressBar({ percent, color = '#7C3AED' }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, percent)}%`, backgroundColor: color }} />
    </div>
  );
}

export default function BibleReadingProgress() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('OT');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.BibleReadingProgress.filter({ user_email: user.email }, null, 200)
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.book_id] = r; });
        setProgressMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const books = tab === 'OT' ? OT_BOOKS : NT_BOOKS;

  const totalChapters = books.reduce((sum, b) => sum + (b.chapters_count || 0), 0);
  const readChapters = books.reduce((sum, b) => {
    const prog = progressMap[b.book_id];
    return sum + (prog?.chapters_read?.length || 0);
  }, 0);
  const overallPct = totalChapters > 0 ? Math.round((readChapters / totalChapters) * 100) : 0;
  const completedBooks = books.filter(b => {
    const prog = progressMap[b.book_id];
    return prog && prog.chapters_read?.length >= b.chapters_count;
  }).length;

  const handleBookClick = (book) => {
    navigate(`/BibleReaderPage?book_id=${book.book_id}&chapter=1`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <TrendingUp className="w-14 h-14 text-violet-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Reading Progress</h2>
        <p className="text-slate-500 mb-6">Sign in to track your Bible reading journey.</p>
        <button onClick={() => base44.auth.redirectToLogin('/BibleReadingProgress')}
          className="px-6 py-3 rounded-2xl bg-violet-600 text-white font-semibold text-sm">Sign In</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex-1">Bible Progress</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">
        {/* Overall stats */}
        <div className="rounded-3xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}>
          <p className="text-sm font-medium opacity-80 mb-1">{tab === 'OT' ? 'Old Testament' : 'New Testament'} Progress</p>
          <p className="text-4xl font-bold mb-3">{overallPct}%</p>
          <div className="h-2 w-full rounded-full bg-white/30 overflow-hidden mb-3">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="flex justify-between text-xs font-medium opacity-80">
            <span>{readChapters} / {totalChapters} chapters</span>
            <span>{completedBooks} books complete</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-white border border-slate-200 p-1 gap-1">
          {['OT', 'NT'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: tab === t ? '#7C3AED' : 'transparent', color: tab === t ? 'white' : '#6B7280' }}>
              {t === 'OT' ? 'Old Testament' : 'New Testament'}
            </button>
          ))}
        </div>

        {/* Books grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {books.map(book => {
              const prog = progressMap[book.book_id];
              const chaptersRead = prog?.chapters_read?.length || 0;
              const total = book.chapters_count || 1;
              const pct = Math.round((chaptersRead / total) * 100);
              const isComplete = chaptersRead >= total;
              return (
                <button key={book.book_id} onClick={() => handleBookClick(book)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 border border-slate-100 hover:border-violet-200 transition-all text-left shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isComplete ? '#F0FDF4' : '#F5F3FF' }}>
                    {isComplete
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <BookOpen className="w-5 h-5 text-violet-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-slate-900 truncate">{book.name_en}</p>
                      <span className="text-xs font-bold ml-2 shrink-0" style={{ color: isComplete ? '#16A34A' : '#7C3AED' }}>
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar percent={pct} color={isComplete ? '#22C55E' : '#7C3AED'} />
                    <p className="text-xs text-slate-400 mt-1">{chaptersRead} / {total} chapters</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}