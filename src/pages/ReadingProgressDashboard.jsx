import React, { useEffect, useState } from 'react';
import { Flame, BookOpen, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReadingProgressDashboard() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const progressItems = await base44.entities.ReadingProgress.filter(
          { user_email: currentUser.email },
          '-completion_percentage',
          50
        );

        setProgress(progressItems);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleChapterToggle = async (progressId, chapterNum) => {
    try {
      const item = progress.find((p) => p.id === progressId);
      let updatedChapters = [...item.chapters_completed];

      if (updatedChapters.includes(chapterNum)) {
        updatedChapters = updatedChapters.filter((c) => c !== chapterNum);
      } else {
        updatedChapters.push(chapterNum);
      }

      const completion = Math.round((updatedChapters.length / item.total_chapters) * 100);

      await base44.entities.ReadingProgress.update(progressId, {
        chapters_completed: updatedChapters,
        completion_percentage: completion,
        last_read_date: new Date().toISOString().split('T')[0],
      });

      setProgress((prev) =>
        prev.map((p) =>
          p.id === progressId
            ? {
                ...p,
                chapters_completed: updatedChapters,
                completion_percentage: completion,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Please log in to view reading progress</p>
      </div>
    );
  }

  const totalStreak = progress.reduce((sum, p) => sum + (p.reading_streak || 0), 0);
  const overallCompletion = progress.length
    ? Math.round(progress.reduce((sum, p) => sum + p.completion_percentage, 0) / progress.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Reading Progress</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <p className="text-sm text-slate-600">Current Streak</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalStreak} days</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-violet-600" />
                <p className="text-sm text-slate-600">Books in Progress</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{progress.length}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <p className="text-sm text-slate-600">Overall Completion</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">{overallCompletion}%</p>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {progress.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600">No reading plans yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {progress.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.book_name}
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-600">
                      {item.chapters_completed.length} / {item.total_chapters} chapters
                    </span>
                    <span className="text-sm font-semibold text-violet-600">
                      {item.completion_percentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all"
                      style={{ width: `${item.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Chapter Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: item.total_chapters }, (_, i) => i + 1).map(
                    (chapter) => (
                      <button
                        key={chapter}
                        type="button"
                        onClick={() => handleChapterToggle(item.id, chapter)}
                        className={`aspect-square rounded-lg font-medium text-sm transition ${
                          item.chapters_completed.includes(chapter)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {chapter}
                      </button>
                    )
                  )}
                </div>

                {/* Last Read */}
                {item.last_read_date && (
                  <p className="text-xs text-slate-500 mt-4">
                    Last read: {new Date(item.last_read_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}