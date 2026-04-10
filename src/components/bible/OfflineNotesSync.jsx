/**
 * OfflineNotesSync
 * Shows sync status for pending notes/highlights and handles auto-sync when online.
 * Pending items are stored in localStorage under 'pending_notes' and 'pending_highlights'.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const PENDING_NOTES_KEY = 'offline_pending_notes';
const PENDING_HIGHLIGHTS_KEY = 'offline_pending_highlights';

export function savePendingNote(item) {
  const existing = getPendingNotes();
  const idx = existing.findIndex(n => n.book === item.book && n.chapter === item.chapter && n.verse === item.verse);
  if (idx >= 0) existing[idx] = item; else existing.push(item);
  localStorage.setItem(PENDING_NOTES_KEY, JSON.stringify(existing));
}

export function savePendingHighlight(item) {
  const existing = getPendingHighlights();
  const idx = existing.findIndex(h => h.book === item.book && h.chapter === item.chapter && h.verse === item.verse);
  if (idx >= 0) existing[idx] = item; else existing.push(item);
  localStorage.setItem(PENDING_HIGHLIGHTS_KEY, JSON.stringify(existing));
}

export function deletePendingNote(book, chapter, verse) {
  const existing = getPendingNotes().filter(n => !(n.book === book && n.chapter === chapter && n.verse === verse));
  localStorage.setItem(PENDING_NOTES_KEY, JSON.stringify(existing));
}

export function deletePendingHighlight(book, chapter, verse) {
  const existing = getPendingHighlights().filter(h => !(h.book === book && h.chapter === chapter && h.verse === verse));
  localStorage.setItem(PENDING_HIGHLIGHTS_KEY, JSON.stringify(existing));
}

export function getPendingNotes() {
  try { return JSON.parse(localStorage.getItem(PENDING_NOTES_KEY) || '[]'); } catch { return []; }
}

export function getPendingHighlights() {
  try { return JSON.parse(localStorage.getItem(PENDING_HIGHLIGHTS_KEY) || '[]'); } catch { return []; }
}

export default function OfflineNotesSync({ userId }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshCount = useCallback(() => {
    setPendingCount(getPendingNotes().length + getPendingHighlights().length);
  }, []);

  useEffect(() => {
    refreshCount();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    // Listen for new pending items
    window.addEventListener('offline-note-saved', refreshCount);
    window.addEventListener('offline-highlight-saved', refreshCount);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('offline-note-saved', refreshCount);
      window.removeEventListener('offline-highlight-saved', refreshCount);
    };
  }, [refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && userId) {
      const t = setTimeout(() => syncNow(), 1500);
      return () => clearTimeout(t);
    }
  }, [isOnline, pendingCount, userId]);

  async function syncNow() {
    if (!userId || syncing) return;
    setSyncing(true);
    setError(null);
    let failed = 0;

    // Sync notes
    const notes = getPendingNotes();
    const syncedNoteIds = [];
    for (const note of notes) {
      try {
        // Check if exists
        const existing = await base44.entities.VerseNote.filter({ user_id: userId, book: note.book, chapter: note.chapter, verse: note.verse }, '-created_date', 1).catch(() => []);
        if (existing[0]) {
          await base44.entities.VerseNote.update(existing[0].id, { note_text: note.note_text, is_public: note.is_public });
        } else {
          await base44.entities.VerseNote.create({ user_id: userId, book: note.book, chapter: note.chapter, verse: note.verse, translation: note.translation, note_text: note.note_text, is_public: note.is_public, verse_text: note.verse_text });
        }
        syncedNoteIds.push({ book: note.book, chapter: note.chapter, verse: note.verse });
      } catch { failed++; }
    }
    // Remove synced notes
    const remainingNotes = getPendingNotes().filter(n => !syncedNoteIds.some(s => s.book === n.book && s.chapter === n.chapter && s.verse === n.verse));
    localStorage.setItem(PENDING_NOTES_KEY, JSON.stringify(remainingNotes));

    // Sync highlights
    const highlights = getPendingHighlights();
    const syncedHlIds = [];
    for (const hl of highlights) {
      try {
        const existing = await base44.entities.VerseHighlight.filter({ user_id: userId, book: hl.book, chapter: hl.chapter, verse: hl.verse }, '-created_date', 1).catch(() => []);
        if (existing[0]) {
          await base44.entities.VerseHighlight.update(existing[0].id, { color: hl.color });
        } else {
          await base44.entities.VerseHighlight.create({ user_id: userId, book: hl.book, chapter: hl.chapter, verse: hl.verse, translation: hl.translation, color: hl.color, verse_text: hl.verse_text });
        }
        syncedHlIds.push({ book: hl.book, chapter: hl.chapter, verse: hl.verse });
      } catch { failed++; }
    }
    const remainingHls = getPendingHighlights().filter(h => !syncedHlIds.some(s => s.book === h.book && s.chapter === h.chapter && s.verse === h.verse));
    localStorage.setItem(PENDING_HIGHLIGHTS_KEY, JSON.stringify(remainingHls));

    setSyncing(false);
    refreshCount();
    setLastSync(new Date());
    if (failed > 0) setError(`${failed} item(s) failed to sync`);
  }

  const total = pendingCount;

  if (total === 0 && !syncing && !error) {
    if (!lastSync) return null;
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        All synced
      </div>
    );
  }

  if (!isOnline && total > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
        <CloudOff className="w-3.5 h-3.5" />
        {total} pending · will sync when online
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Syncing {total} item{total !== 1 ? 's' : ''}…
      </div>
    );
  }

  if (error) {
    return (
      <button onClick={syncNow} className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 hover:bg-red-100">
        <AlertCircle className="w-3.5 h-3.5" />
        {error} · Retry
      </button>
    );
  }

  if (total > 0 && isOnline) {
    return (
      <button onClick={syncNow} className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1 hover:bg-indigo-100">
        <Cloud className="w-3.5 h-3.5" />
        {total} unsaved · Sync now
      </button>
    );
  }

  return null;
}