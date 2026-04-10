import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bookmark } from 'lucide-react';

export default function VerseBookmarkButton({ verse, book, chapter, translation, currentUser, savedVerseIds = [] }) {
  const verseKey = `${book}-${chapter}-${verse.verse}`;
  const [saved, setSaved] = useState(savedVerseIds.includes(verseKey));
  const [loading, setLoading] = useState(false);

  const toggle = async (e) => {
    e.stopPropagation();
    if (!currentUser || loading) return;
    setLoading(true);
    try {
      if (saved) {
        const existing = await base44.entities.SavedVerse.filter({
          user_id: currentUser.id,
          book,
          chapter: parseInt(chapter),
          verse: verse.verse,
          translation
        });
        if (existing.length > 0) await base44.entities.SavedVerse.delete(existing[0].id);
        setSaved(false);
      } else {
        await base44.entities.SavedVerse.create({
          user_id: currentUser.id,
          book,
          chapter: parseInt(chapter),
          verse: verse.verse,
          translation,
          verse_text: verse.text,
          reference: `${book} ${chapter}:${verse.verse}`
        });
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove bookmark' : 'Bookmark this verse'}
      className={`p-1 rounded transition-colors ${saved ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
    >
      <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}