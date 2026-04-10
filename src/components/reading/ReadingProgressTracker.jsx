import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { markChapterComplete, isChapterComplete, getTotalChaptersRead } from '@/lib/readingProgressDb';

export default function ReadingProgressTracker({ book, chapter, onChapterComplete }) {
  const [isComplete, setIsComplete] = useState(false);
  const [totalRead, setTotalRead] = useState(0);

  useEffect(() => {
    if (book && chapter) {
      setIsComplete(isChapterComplete(book, chapter));
      setTotalRead(getTotalChaptersRead());
    }
  }, [book, chapter]);

  const handleToggleComplete = () => {
    if (!isComplete) {
      markChapterComplete(book, chapter);
      setIsComplete(true);
      setTotalRead(getTotalChaptersRead());
      if (onChapterComplete) onChapterComplete(book, chapter);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <button
        onClick={handleToggleComplete}
        className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
      >
        {isComplete ? (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        ) : (
          <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">
          {book} {chapter}
        </p>
        <p className="text-xs text-slate-500">
          {isComplete ? 'Completed ✓' : 'Mark as read'}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs font-semibold text-indigo-600">{totalRead}</p>
        <p className="text-xs text-slate-400">chapters</p>
      </div>
    </div>
  );
}