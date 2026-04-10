import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, X } from 'lucide-react';
import { getReadingHistory, clearReadingHistory } from '@/lib/readingHistory';
import { useNavigate } from 'react-router-dom';

export default function ContinueReadingSection() {
  const [history, setHistory] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Try new localStorage format first, fallback to old
    try {
      const raw = localStorage.getItem('faithlight_reading_history');
      if (raw) { setHistory(JSON.parse(raw)); return; }
    } catch {}
    setHistory(getReadingHistory());
  }, []);

  if (!history) return null;

  const timeAgo = () => {
    const diff = Date.now() - history.timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleContinue = () => {
    const bookParam = history.book_id ? `book_id=${history.book_id}` : `book=${history.book}`;
    navigate(`/BibleReaderPage?${bookParam}&chapter=${history.chapter}`);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    localStorage.removeItem('faithlight_reading_history');
    clearReadingHistory();
    setHistory(null);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-slate-900 mb-3">Continue Reading</h3>
      <button
        onClick={handleContinue}
        className="w-full flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-violet-300 transition text-left"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 flex-shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {history.book} — Chapter {history.chapter}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{timeAgo()}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleClear}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            aria-label="Clear history"
          >
            <X className="h-4 w-4" />
          </button>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </button>
    </div>
  );
}