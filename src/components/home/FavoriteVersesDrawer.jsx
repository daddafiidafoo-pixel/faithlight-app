import React, { useState, useEffect } from 'react';
import { X, Trash2, BookOpen, Star } from 'lucide-react';

const STORAGE_KEY = 'fl_favorite_verses';

export function getFavoriteVerses() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function saveFavoriteVerse(verse) {
  const favs = getFavoriteVerses();
  if (favs.find(v => v.ref === verse.ref)) return false; // already saved
  favs.unshift({ ...verse, savedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs.slice(0, 100)));
  return true;
}

export function removeFavoriteVerse(ref) {
  const favs = getFavoriteVerses().filter(v => v.ref !== ref);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function isFavoriteVerse(ref) {
  return getFavoriteVerses().some(v => v.ref === ref);
}

export default function FavoriteVersesDrawer({ open, onClose }) {
  const [verses, setVerses] = useState([]);

  useEffect(() => {
    if (open) setVerses(getFavoriteVerses());
  }, [open]);

  const handleRemove = (ref) => {
    removeFavoriteVerse(ref);
    setVerses(prev => prev.filter(v => v.ref !== ref));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Saved Verses</h2>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
              {verses.length}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {verses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No saved verses yet.</p>
              <p className="text-xs mt-1">Click "Save" on the verse of the day to collect verses.</p>
            </div>
          ) : (
            verses.map(verse => (
              <div key={verse.ref} className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-4 relative group">
                <p className="text-gray-800 dark:text-gray-100 text-sm leading-relaxed italic mb-2">
                  "{verse.text}"
                </p>
                <p className="text-amber-600 dark:text-amber-400 font-bold text-xs">— {verse.ref}</p>
                <button
                  onClick={() => handleRemove(verse.ref)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}