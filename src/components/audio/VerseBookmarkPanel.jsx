import React, { useState, useEffect } from 'react';
import { Bookmark, X, Save } from 'lucide-react';

const STORAGE_KEY = 'faithlight-verse-bookmarks';

export function getVerseBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function saveVerseBookmark(bookmark) {
  const existing = getVerseBookmarks().filter(b => b.id !== bookmark.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([bookmark, ...existing]));
}

export function deleteVerseBookmark(id) {
  const updated = getVerseBookmarks().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function VerseBookmarkPanel({ bookId, chapter, verseNumber, verseText, currentTime, onClose }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const bookmarkId = `${bookId}-${chapter}-${verseNumber}`;

  useEffect(() => {
    const existing = getVerseBookmarks().find(b => b.id === bookmarkId);
    if (existing) setNote(existing.note || '');
  }, [bookmarkId]);

  const handleSave = () => {
    saveVerseBookmark({
      id: bookmarkId,
      bookId,
      chapter,
      verseNumber,
      verseText,
      note,
      timestamp: currentTime,
      savedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose?.(); }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Bookmark className="w-5 h-5" />
            <h3 className="font-bold text-base">Bookmark Verse</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="bg-indigo-50 rounded-xl p-3">
          <p className="text-xs font-bold text-indigo-600 mb-1">{bookId} {chapter}:{verseNumber}</p>
          <p className="text-sm text-slate-700 italic line-clamp-3">{verseText}</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Personal Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Write your reflection here..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Bookmark'}
        </button>
      </div>
    </div>
  );
}