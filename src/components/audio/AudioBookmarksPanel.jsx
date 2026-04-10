import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Clock, X } from 'lucide-react';

const STORAGE_KEY = 'fl_audio_bookmarks';

export function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function addBookmark({ title, subtitle, src, timestamp }) {
  const bookmarks = getBookmarks();
  const id = `${src}_${Math.round(timestamp)}`;
  if (bookmarks.find(b => b.id === id)) return false;
  const updated = [{ id, title, subtitle, src, timestamp, savedAt: new Date().toISOString() }, ...bookmarks];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  window.dispatchEvent(new Event('fl:bookmarks_updated'));
  return true;
}

export function removeBookmark(id) {
  const updated = getBookmarks().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('fl:bookmarks_updated'));
}

export function isBookmarked(src, timestamp) {
  const id = `${src}_${Math.round(timestamp)}`;
  return getBookmarks().some(b => b.id === id);
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AudioBookmarksPanel({ onSeek, onClose }) {
  const [bookmarks, setBookmarks] = useState(getBookmarks());

  useEffect(() => {
    const update = () => setBookmarks(getBookmarks());
    window.addEventListener('fl:bookmarks_updated', update);
    return () => window.removeEventListener('fl:bookmarks_updated', update);
  }, []);

  return (
    <div className="border-t border-gray-100 bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
        <div className="flex items-center gap-1.5">
          <Bookmark size={13} className="text-indigo-600" />
          <span className="text-xs font-bold text-gray-800">Bookmarks</span>
          {bookmarks.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 rounded-full px-1.5 font-semibold">{bookmarks.length}</span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-0.5">
          <X size={14} />
        </button>
      </div>

      {bookmarks.length === 0 ? (
        <div className="px-4 py-4 text-center">
          <BookmarkCheck size={24} className="text-gray-200 mx-auto mb-1" />
          <p className="text-xs text-gray-400">No bookmarks yet. Tap 🔖 while playing to save a moment.</p>
        </div>
      ) : (
        <div className="max-h-44 overflow-y-auto divide-y divide-gray-50">
          {bookmarks.map(b => (
            <div key={b.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 group">
              <button
                onClick={() => onSeek?.(b)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-xs font-semibold text-gray-800 truncate">{b.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-indigo-400" />
                  <span className="text-xs text-indigo-600 font-mono">{formatTime(b.timestamp)}</span>
                  <span className="text-xs text-gray-400">· {timeAgo(b.savedAt)}</span>
                </div>
              </button>
              <button
                onClick={() => removeBookmark(b.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}