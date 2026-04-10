import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck, Trash2, Play, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STORAGE_KEY = 'faithlight_audio_bookmarks_v2';

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveBookmarks(bms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bms));
}

/**
 * AudioTimestampBookmarks
 *
 * Props (Player controls):
 *   book, chapter (string), verseIndex (number), verses ([{verse, text}])
 *   translation (string)
 *   onJump(book, chapter, verseIndex) — called when user taps a bookmark to jump
 *
 * Exports a compact "Save Bookmark" button + MyBookmarks list tab.
 */

/**
 * useAudioResumePosition
 * Automatically saves and restores playback position for an <audio> element.
 * Used by FaithRoutineHub's AudioDemoTab.
 */
export function useAudioResumePosition(audioRef, chapterKey) {
  const saveKey = `fl_audio_pos_${chapterKey}`;

  useEffect(() => {
    const el = audioRef?.current;
    if (!el) return;

    // Restore saved position
    const saved = parseFloat(localStorage.getItem(saveKey) || '0');
    if (saved > 0 && isFinite(saved)) {
      el.currentTime = saved;
    }

    // Save position every 5 seconds
    const interval = setInterval(() => {
      if (!el.paused && el.currentTime > 0) {
        localStorage.setItem(saveKey, String(el.currentTime));
      }
    }, 5000);

    // Save on pause/unload
    const onPause = () => localStorage.setItem(saveKey, String(el.currentTime));
    el.addEventListener('pause', onPause);

    return () => {
      clearInterval(interval);
      el.removeEventListener('pause', onPause);
    };
  }, [audioRef, saveKey]);
}

/**
 * Legacy default export: audio-element bookmark panel (used by FaithRoutineHub).
 * Saves named timestamps for an <audio> element by chapterKey.
 */
const LEGACY_KEY = 'fl_audio_bm_legacy';
function loadLegacy(chapterKey) {
  try {
    const all = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}');
    return all[chapterKey] || [];
  } catch { return []; }
}
function saveLegacy(chapterKey, bms) {
  try {
    const all = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}');
    all[chapterKey] = bms;
    localStorage.setItem(LEGACY_KEY, JSON.stringify(all));
  } catch {}
}

export default function AudioTimestampBookmarks({ audioRef, chapterKey, bookName }) {
  const [bookmarks, setBookmarks] = useState(() => loadLegacy(chapterKey));
  const [label, setLabel] = useState('');

  const addBookmark = () => {
    const el = audioRef?.current;
    const t = el?.currentTime ?? 0;
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const name = label.trim() || `${bookName} — ${mins}:${secs.toString().padStart(2, '0')}`;
    const bm = { id: Date.now(), name, time: t };
    const updated = [bm, ...bookmarks];
    setBookmarks(updated);
    saveLegacy(chapterKey, updated);
    setLabel('');
    toast.success('Bookmark saved!');
  };

  const jumpTo = (time) => {
    const el = audioRef?.current;
    if (el) { el.currentTime = time; el.play().catch(() => {}); }
  };

  const remove = (id) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    saveLegacy(chapterKey, updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Optional label…"
          className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-300"
        />
        <button
          onClick={addBookmark}
          className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {bookmarks.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">No bookmarks yet — play audio then tap Add</p>
      )}

      <div className="space-y-2">
        {bookmarks.map(bm => {
          const mins = Math.floor(bm.time / 60);
          const secs = Math.floor(bm.time % 60);
          return (
            <div key={bm.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <Clock size={12} className="text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-xs text-gray-700 truncate">{bm.name}</span>
              <span className="text-xs font-mono text-indigo-600 flex-shrink-0">{mins}:{secs.toString().padStart(2, '0')}</span>
              <button onClick={() => jumpTo(bm.time)} className="p-1 text-indigo-500 hover:text-indigo-700"><Play size={12} /></button>
              <button onClick={() => remove(bm.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useAudioBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  const addBookmark = ({ book, chapter, verseIndex, verse, text, translation, note = '' }) => {
    const id = `${book}_${chapter}_${verseIndex}_${Date.now()}`;
    const bm = {
      id,
      book,
      chapter: String(chapter),
      verseIndex,
      verse,
      text: text?.slice(0, 120) + (text?.length > 120 ? '…' : ''),
      translation,
      note,
      savedAt: new Date().toISOString(),
    };
    const updated = [bm, ...bookmarks].slice(0, 100); // max 100 bookmarks
    setBookmarks(updated);
    saveBookmarks(updated);
    toast.success('Bookmark saved!');
    return bm;
  };

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    saveBookmarks(updated);
    toast.success('Bookmark removed');
  };

  const updateNote = (id, note) => {
    const updated = bookmarks.map(b => b.id === id ? { ...b, note } : b);
    setBookmarks(updated);
    saveBookmarks(updated);
  };

  const isBookmarked = (book, chapter, verseIndex) =>
    bookmarks.some(b => b.book === book && b.chapter === String(chapter) && b.verseIndex === verseIndex);

  return { bookmarks, addBookmark, removeBookmark, updateNote, isBookmarked };
}

export function BookmarkButton({ book, chapter, verseIndex, verse, text, translation, bookmarkHook }) {
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = bookmarkHook;
  const saved = isBookmarked(book, chapter, verseIndex);
  const existing = bookmarks.find(b => b.book === book && b.chapter === String(chapter) && b.verseIndex === verseIndex);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (saved && existing) {
          removeBookmark(existing.id);
        } else {
          addBookmark({ book, chapter, verseIndex, verse, text, translation });
        }
      }}
      className={`gap-1.5 transition-all ${saved ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-600'}`}
    >
      {saved ? <BookmarkCheck size={14} className="text-amber-600" /> : <Bookmark size={14} />}
      <span className="text-xs">{saved ? 'Saved' : 'Bookmark'}</span>
    </Button>
  );
}

export function MyBookmarksTab({ bookmarkHook, onJump, isDarkMode }) {
  const { bookmarks, removeBookmark, updateNote } = bookmarkHook;
  // All hooks must be called unconditionally at the top
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';

  // Early return with no hooks called conditionally
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-14" style={{ color: mutedColor }}>
        <Bookmark size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-semibold text-sm">No bookmarks yet</p>
        <p className="text-xs mt-1 opacity-70">Tap the Bookmark button while listening to save your spot</p>
      </div>
    );
  }

  const grouped = bookmarks.reduce((acc, bm) => {
    const key = `${bm.book} ${bm.chapter}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(bm);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: textColor }}>
          🔖 {bookmarks.length} saved listening point{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {Object.entries(grouped).map(([chapterKey, bms]) => (
        <div key={chapterKey}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: mutedColor }}>{chapterKey}</p>
          <div className="space-y-2">
            {bms.map(bm => (
              <motion.div
                key={bm.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: cardColor, borderColor }}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-indigo-500">
                          {bm.book} {bm.chapter}:{bm.verse}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {bm.translation}
                        </span>
                        <span className="text-xs flex items-center gap-0.5" style={{ color: mutedColor }}>
                          <Clock size={9} />
                          {new Date(bm.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed italic line-clamp-2" style={{ color: mutedColor }}>
                        "{bm.text}"
                      </p>
                      {bm.note && (
                        <p className="text-xs mt-1 text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                          📝 {bm.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === bm.id ? null : bm.id)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      {expandedId === bm.id ? <ChevronUp size={14} style={{ color: mutedColor }} /> : <ChevronDown size={14} style={{ color: mutedColor }} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedId === bm.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 gap-1.5 text-xs"
                              style={{ backgroundColor: '#6B8E6E', color: '#fff' }}
                              onClick={() => { onJump?.(bm.book, bm.chapter, bm.verseIndex); setExpandedId(null); }}
                            >
                              <Play size={12} /> Jump Here
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs border-red-200 text-red-500 hover:bg-red-50"
                              onClick={() => removeBookmark(bm.id)}
                            >
                              <Trash2 size={12} /> Remove
                            </Button>
                          </div>

                          {/* Note editor */}
                          {editingNote === bm.id ? (
                            <div className="flex gap-2">
                              <input
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                style={{ backgroundColor: cardColor, borderColor, color: textColor }}
                              />
                              <Button size="sm" className="text-xs bg-indigo-600 text-white" onClick={() => { updateNote(bm.id, noteText); setEditingNote(null); }}>Save</Button>
                              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditingNote(null)}>✕</Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingNote(bm.id); setNoteText(bm.note || ''); }}
                              className="text-xs text-left text-indigo-500 hover:underline"
                            >
                              {bm.note ? '✏️ Edit note' : '+ Add note'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}