import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook for managing Bible verse text selection and saving to favorites
 */
export function useBibleTextSelection() {
  const [selectedText, setSelectedText] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleTextSelection = useCallback((e) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText({
        text,
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
      });
    } else {
      setSelectedText(null);
    }
  }, []);

  const saveVerseToFavorites = useCallback(async (verseReference, personalNotes = '') => {
    if (!selectedText) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await base44.entities.UserHighlight.create({
        user_email: (await base44.auth.me())?.email,
        verse_text: selectedText.text,
        reference_text: verseReference,
        color: 'yellow',
        personal_notes: personalNotes,
        language: 'en',
      });
      
      setSelectedText(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [selectedText]);

  return {
    selectedText,
    saving,
    error,
    handleTextSelection,
    saveVerseToFavorites,
    clearSelection: () => setSelectedText(null),
  };
}