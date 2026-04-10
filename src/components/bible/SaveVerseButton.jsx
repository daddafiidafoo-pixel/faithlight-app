import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'fl_saved_verses';

export function getSavedVerses() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
export function saveVerse(verse) {
  const all = getSavedVerses();
  if (all.find(v => v.id === verse.id)) return false;
  all.unshift({ ...verse, savedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('fl:verses_updated'));
  return true;
}
export function unsaveVerse(id) {
  const all = getSavedVerses().filter(v => v.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('fl:verses_updated'));
}
export function isVerseSaved(id) {
  return getSavedVerses().some(v => v.id === id);
}

export default function SaveVerseButton({ verseId, book, chapter, verse, text, className = '' }) {
  const [saved, setSaved] = useState(() => isVerseSaved(verseId));

  useEffect(() => {
    const sync = () => setSaved(isVerseSaved(verseId));
    window.addEventListener('fl:verses_updated', sync);
    return () => window.removeEventListener('fl:verses_updated', sync);
  }, [verseId]);

  const toggle = (e) => {
    e.stopPropagation();
    if (saved) {
      unsaveVerse(verseId);
      setSaved(false);
      toast('Verse removed from bookmarks');
    } else {
      saveVerse({ id: verseId, book, chapter, verse, text });
      setSaved(true);
      toast.success('Verse bookmarked! 📖');
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark verse'}
      className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-500'} ${className}`}
    >
      {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
    </button>
  );
}