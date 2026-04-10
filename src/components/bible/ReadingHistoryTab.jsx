import React, { useState, useEffect } from "react";
import { Bookmark, Trash2, Book } from "lucide-react";
import { loadBookmarks, deleteBookmark, getReadingHistory } from "../utils/bibleBookmarkUtils";

export default function ReadingHistoryTab() {
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setBookmarks(loadBookmarks());
    setHistory(getReadingHistory());
  }, []);

  const handleDeleteBookmark = (id) => {
    deleteBookmark(id);
    setBookmarks(loadBookmarks());
    setHistory(getReadingHistory());
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <Bookmark className="h-5 w-5" />
          Bookmarks
        </div>
        {bookmarks.length === 0 ? (
          <p className="text-sm text-gray-500">No bookmarks yet. Start reading to bookmark verses.</p>
        ) : (
          <div className="space-y-3">
            {bookmarks.map(bookmark => (
              <div key={bookmark.id} className="flex items-start justify-between rounded-lg border p-3">
                <div className="flex-1">
                  <div className="font-medium text-sm">{bookmark.reference}</div>
                  <div className="mt-1 text-xs text-gray-600 leading-relaxed">
                    {bookmark.verseText.substring(0, 100)}...
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(bookmark.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBookmark(bookmark.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <Book className="h-5 w-5" />
          Reading History
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No reading history yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry, idx) => (
              <div key={idx} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{entry.reference}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last read: {new Date(entry.lastReadAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}