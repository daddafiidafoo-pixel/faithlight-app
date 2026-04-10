import React, { useEffect, useState } from 'react';
import { getContinueReading } from '@/lib/readingHistoryService';
import { useAuth } from '@/lib/AuthContext';
import { ChevronRight, BookOpen } from 'lucide-react';

export default function ContinueReadingCard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) loadHistory();
  }, [user?.email]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getContinueReading(user.email, 3);
      setHistory(data);
    } catch (error) {
      console.error('Error loading reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="h-32 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 p-6 shadow-sm border border-violet-200">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-bold text-slate-900">Continue Reading</h3>
        </div>
        <p className="text-slate-600">Start reading to see your recent passages here</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-5 h-5 text-violet-600" />
        <h3 className="text-lg font-bold text-slate-900">Continue Reading</h3>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <a
            key={item.id}
            href={`/BibleReaderPage?book=${item.book_id}&chapter=${item.chapter}`}
            className="group block rounded-xl bg-slate-50 p-4 hover:bg-violet-50 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-violet-600">
                  {item.reference}
                </p>
                {item.plan_title && (
                  <p className="text-xs text-slate-500 mt-1">{item.plan_title}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 flex-shrink-0" />
            </div>
            {item.progress_percentage > 0 && (
              <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600"
                  style={{ width: `${item.progress_percentage}%` }}
                />
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}