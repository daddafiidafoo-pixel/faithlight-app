import React, { useState, useEffect } from 'react';
import { Bookmark, X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ReadingProgressTracker() {
  const [plan, setPlan] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // Fetch reading plan progress
      const planResponse = await base44.functions.invoke('readingPlanProgress', {});
      if (planResponse.data) {
        setPlan(planResponse.data);
      }

      // Fetch bookmarks
      const bookmarkResponse = await base44.functions.invoke('bookmarksGet', {});
      if (bookmarkResponse.data?.bookmarks) {
        setBookmarks(bookmarkResponse.data.bookmarks);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (reference) => {
    try {
      const isBookmarked = bookmarks.some(b => b.reference === reference);

      if (isBookmarked) {
        await base44.functions.invoke('bookmarksDelete', { reference });
        setBookmarks(bookmarks.filter(b => b.reference !== reference));
      } else {
        await base44.functions.invoke('bookmarksCreate', { reference });
        setBookmarks([...bookmarks, { reference, createdAt: new Date() }]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const progressPercentage = plan ? (plan.currentDay / plan.totalDays) * 100 : 0;

  if (loading) {
    return <div className="rounded-lg bg-white p-6 shadow-md animate-pulse h-48"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Reading Plan Progress */}
      {plan && (
        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">{plan.planTitle}</h3>
            <span className="text-sm font-semibold text-purple-700">
              Day {plan.currentDay} of {plan.totalDays}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Progress Text */}
          <p className="text-sm text-gray-600 mb-4">
            {progressPercentage.toFixed(0)}% complete • {plan.totalDays - plan.currentDay} days remaining
          </p>

          {/* Today's Reading */}
          {plan.todayReading && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Today's Reading</p>
              <p className="text-gray-800 font-medium text-sm">{plan.todayReading}</p>
            </div>
          )}
        </div>
      )}

      {/* Bookmarks List */}
      {bookmarks.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">My Bookmarks ({bookmarks.length})</h3>

          <div className="space-y-2">
            {bookmarks.map((bookmark, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Bookmark className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{bookmark.reference}</p>
                    <p className="text-xs text-gray-500">
                      Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleBookmark(bookmark.reference)}
                  className="p-2 hover:bg-white rounded-lg transition-colors"
                  title="Remove bookmark"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!plan && bookmarks.length === 0 && (
        <div className="rounded-lg bg-white p-8 shadow-md text-center">
          <p className="text-gray-500 mb-4">Start a reading plan to track your progress</p>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm">
            Start Reading Plan
          </button>
        </div>
      )}
    </div>
  );
}