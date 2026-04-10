/**
 * useVerseNotes — manages verse note state for the reader.
 * All persistence via bibleService layer.
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchNotes, saveNote, deleteNote } from '@/components/services/api';

export function useVerseNotes(userId, book, chapter) {
  const [notes, setNotes] = useState({});
  const [activeVerse, setActiveVerse] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId || !book || !chapter) return;
    fetchNotes(userId, book, chapter).then(data => {
      const map = {};
      (data || []).forEach(n => { map[n.verse] = n.note_text; });
      setNotes(map);
    });
  }, [userId, book, chapter]);

  const openNote = useCallback((verse) => {
    setActiveVerse(verse);
    setDraft(notes[verse] || '');
  }, [notes]);

  const closeNote = useCallback(() => {
    setActiveVerse(null);
    setDraft('');
  }, []);

  const saveActiveNote = useCallback(async () => {
    if (!activeVerse) return;
    setSaving(true);
    try {
      if (draft.trim()) {
        await saveNote(userId, { book, chapter, verse: activeVerse, note_text: draft.trim() });
        setNotes(prev => ({ ...prev, [activeVerse]: draft.trim() }));
      } else {
        await deleteNote(userId, book, chapter, activeVerse);
        setNotes(prev => { const next = { ...prev }; delete next[activeVerse]; return next; });
      }
    } finally {
      setSaving(false);
      closeNote();
    }
  }, [userId, book, chapter, activeVerse, draft, closeNote]);

  return { notes, activeVerse, draft, setDraft, saving, openNote, closeNote, saveActiveNote };
}