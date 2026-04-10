import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Loader2, X, BookmarkPlus, Link2, Menu, Search } from 'lucide-react';
import { toast } from 'sonner';
import VerseHighlightPicker, { COLORS } from '../components/bible/VerseHighlightPicker';

const BIBLE_BOOKS = [
  { id: 'GEN', name: 'Genesis', chapters: 50, t: 'OT' }, { id: 'EXO', name: 'Exodus', chapters: 40, t: 'OT' },
  { id: 'LEV', name: 'Leviticus', chapters: 27, t: 'OT' }, { id: 'NUM', name: 'Numbers', chapters: 36, t: 'OT' },
  { id: 'DEU', name: 'Deuteronomy', chapters: 34, t: 'OT' }, { id: 'JOS', name: 'Joshua', chapters: 24, t: 'OT' },
  { id: 'JDG', name: 'Judges', chapters: 21, t: 'OT' }, { id: 'RUT', name: 'Ruth', chapters: 4, t: 'OT' },
  { id: '1SA', name: '1 Samuel', chapters: 31, t: 'OT' }, { id: '2SA', name: '2 Samuel', chapters: 24, t: 'OT' },
  { id: '1KI', name: '1 Kings', chapters: 22, t: 'OT' }, { id: '2KI', name: '2 Kings', chapters: 25, t: 'OT' },
  { id: '1CH', name: '1 Chronicles', chapters: 29, t: 'OT' }, { id: '2CH', name: '2 Chronicles', chapters: 36, t: 'OT' },
  { id: 'EZR', name: 'Ezra', chapters: 10, t: 'OT' }, { id: 'NEH', name: 'Nehemiah', chapters: 13, t: 'OT' },
  { id: 'EST', name: 'Esther', chapters: 10, t: 'OT' }, { id: 'JOB', name: 'Job', chapters: 42, t: 'OT' },
  { id: 'PSA', name: 'Psalms', chapters: 150, t: 'OT' }, { id: 'PRO', name: 'Proverbs', chapters: 31, t: 'OT' },
  { id: 'ECC', name: 'Ecclesiastes', chapters: 12, t: 'OT' }, { id: 'SNG', name: 'Song of Solomon', chapters: 8, t: 'OT' },
  { id: 'ISA', name: 'Isaiah', chapters: 66, t: 'OT' }, { id: 'JER', name: 'Jeremiah', chapters: 52, t: 'OT' },
  { id: 'LAM', name: 'Lamentations', chapters: 5, t: 'OT' }, { id: 'EZK', name: 'Ezekiel', chapters: 48, t: 'OT' },
  { id: 'DAN', name: 'Daniel', chapters: 12, t: 'OT' }, { id: 'HOS', name: 'Hosea', chapters: 14, t: 'OT' },
  { id: 'MAL', name: 'Malachi', chapters: 4, t: 'OT' },
  { id: 'MAT', name: 'Matthew', chapters: 28, t: 'NT' }, { id: 'MRK', name: 'Mark', chapters: 16, t: 'NT' },
  { id: 'LUK', name: 'Luke', chapters: 24, t: 'NT' }, { id: 'JHN', name: 'John', chapters: 21, t: 'NT' },
  { id: 'ACT', name: 'Acts', chapters: 28, t: 'NT' }, { id: 'ROM', name: 'Romans', chapters: 16, t: 'NT' },
  { id: '1CO', name: '1 Corinthians', chapters: 16, t: 'NT' }, { id: '2CO', name: '2 Corinthians', chapters: 13, t: 'NT' },
  { id: 'GAL', name: 'Galatians', chapters: 6, t: 'NT' }, { id: 'EPH', name: 'Ephesians', chapters: 6, t: 'NT' },
  { id: 'PHP', name: 'Philippians', chapters: 4, t: 'NT' }, { id: 'COL', name: 'Colossians', chapters: 4, t: 'NT' },
  { id: '1TH', name: '1 Thessalonians', chapters: 5, t: 'NT' }, { id: '2TH', name: '2 Thessalonians', chapters: 3, t: 'NT' },
  { id: '1TI', name: '1 Timothy', chapters: 6, t: 'NT' }, { id: '2TI', name: '2 Timothy', chapters: 4, t: 'NT' },
  { id: 'TIT', name: 'Titus', chapters: 3, t: 'NT' }, { id: 'HEB', name: 'Hebrews', chapters: 13, t: 'NT' },
  { id: 'JAS', name: 'James', chapters: 5, t: 'NT' }, { id: '1PE', name: '1 Peter', chapters: 5, t: 'NT' },
  { id: '2PE', name: '2 Peter', chapters: 3, t: 'NT' }, { id: '1JN', name: '1 John', chapters: 5, t: 'NT' },
  { id: 'JUD', name: 'Jude', chapters: 1, t: 'NT' }, { id: 'REV', name: 'Revelation', chapters: 22, t: 'NT' },
];

const COLOR_HEX = Object.fromEntries(COLORS.map(c => [c.id, c.hex]));

export default function FullBibleReader() {
  const [user, setUser] = useState(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [selectedBook, setSelectedBook] = useState(BIBLE_BOOKS.find(b => b.id === 'JHN'));
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [verses, setVerses] = useState([]);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [highlights, setHighlights] = useState({}); // { "verseNum": { color, id } }
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [crossRefs, setCrossRefs] = useState(null);
  const [loadingCrossRefs, setLoadingCrossRefs] = useState(false);
  const [showCrossRefPanel, setShowCrossRefPanel] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalNote, setJournalNote] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [bookSearch, setBookSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchChapter(selectedBook.id, selectedChapter);
    }
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    if (selectedBook && selectedChapter && user) {
      loadHighlights(selectedBook.id, selectedChapter, user.id);
    }
  }, [selectedBook, selectedChapter, user]);

  const fetchChapter = async (bookId, chapter) => {
    setLoadingChapter(true);
    setVerses([]);
    setSelectedVerse(null);
    try {
      // Try the bibleChapter backend function first
      const resp = await base44.functions.invoke('bibleChapter', {
        book_id: bookId,
        chapter_number: chapter,
        translation: 'WEB'
      }).catch(() => null);

      const rawVerses = resp?.data?.verses || resp?.data?.data?.verses || [];
      if (rawVerses.length > 0) {
        setVerses(rawVerses.map(v => ({ number: v.number || v.verse_number || v.verse, text: v.text || v.verse_text })));
        return;
      }

      // Fallback to AI
      const bookName = BIBLE_BOOKS.find(b => b.id === bookId)?.name || bookId;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide the complete text of ${bookName} chapter ${chapter} from the World English Bible (WEB) translation. Include all verses. Be accurate and complete.`,
        response_json_schema: {
          type: 'object',
          properties: {
            verses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  number: { type: 'number' },
                  text:   { type: 'string' }
                },
                required: ['number', 'text']
              }
            }
          },
          required: ['verses']
        }
      });
      setVerses(result?.verses || []);
    } catch (e) {
      console.error('Chapter fetch failed:', e);
      toast.error('Could not load chapter. Please try again.');
    } finally {
      setLoadingChapter(false);
    }
  };

  const loadHighlights = async (bookId, chapter, userId) => {
    try {
      const data = await base44.entities.BibleHighlight.filter({
        user_id: userId,
        book_id: bookId,
        chapter_number: chapter
      });
      const map = {};
      data.forEach(h => { map[h.verse_number] = { color: h.color, id: h.id }; });
      setHighlights(map);
    } catch {}
  };

  const handleHighlight = async (color) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (!selectedVerse) return;

    const verseNum = selectedVerse.number;
    const existing = highlights[verseNum];

    try {
      if (!color) {
        // Remove highlight
        if (existing?.id) {
          await base44.entities.BibleHighlight.delete(existing.id);
          setHighlights(prev => { const n = { ...prev }; delete n[verseNum]; return n; });
          toast.success('Highlight removed');
        }
      } else if (existing?.id) {
        // Update color
        await base44.entities.BibleHighlight.update(existing.id, { color });
        setHighlights(prev => ({ ...prev, [verseNum]: { ...prev[verseNum], color } }));
        toast.success('Highlight updated');
      } else {
        // Create new
        const created = await base44.entities.BibleHighlight.create({
          user_id: user.id,
          book_id: selectedBook.id,
          chapter_number: selectedChapter,
          verse_number: verseNum,
          color,
          note: selectedVerse.text,
        });
        setHighlights(prev => ({ ...prev, [verseNum]: { color, id: created.id } }));
        toast.success('Verse highlighted ✨');
      }
    } catch (e) {
      toast.error('Failed to save highlight');
    }
    setSelectedVerse(null);
  };

  const handleSaveToJournal = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setSavingJournal(true);
    try {
      await base44.entities.JournalEntry.create({
        user_id: user.id,
        title: `${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`,
        content: `"${selectedVerse.text}"\n\n${journalNote}`,
        verse_reference: `${selectedBook.name} ${selectedChapter}:${selectedVerse.number}`,
        created_date: new Date().toISOString(),
      });
      toast.success('Saved to your journal 📖');
      setShowJournalModal(false);
      setJournalNote('');
      setSelectedVerse(null);
    } catch {
      toast.error('Failed to save to journal');
    } finally {
      setSavingJournal(false);
    }
  };

  const fetchCrossReferences = async () => {
    if (!selectedVerse) return;
    setLoadingCrossRefs(true);
    setShowCrossRefPanel(true);
    setCrossRefs(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide 4 cross-reference Bible verses for ${selectedBook.name} ${selectedChapter}:${selectedVerse.number} ("${selectedVerse.text}"). Give thematically related verses with brief connection explanations.`,
        response_json_schema: {
          type: 'object',
          properties: {
            references: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference:  { type: 'string' },
                  text:       { type: 'string' },
                  connection: { type: 'string' }
                },
                required: ['reference', 'text', 'connection']
              }
            }
          }
        }
      });
      setCrossRefs(result?.references || []);
      setSelectedVerse(null);
    } catch {
      toast.error('Failed to load cross-references');
    } finally {
      setLoadingCrossRefs(false);
    }
  };

  const filteredBooks = BIBLE_BOOKS.filter(b =>
    b.name.toLowerCase().includes(bookSearch.toLowerCase())
  );
  const otBooks = filteredBooks.filter(b => b.t === 'OT');
  const ntBooks = filteredBooks.filter(b => b.t === 'NT');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowBookPicker(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {selectedBook?.name}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedChapter(c => Math.max(1, c - 1))}
              disabled={selectedChapter <= 1}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-16 text-center text-sm font-semibold text-gray-700">Ch. {selectedChapter}</span>
            <button
              onClick={() => setSelectedChapter(c => Math.min(selectedBook?.chapters || 1, c + 1))}
              disabled={selectedChapter >= (selectedBook?.chapters || 1)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="ml-auto text-xs text-gray-400">WEB</span>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-32">
        {loadingChapter ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm text-gray-500">Loading chapter…</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {selectedBook?.name} {selectedChapter}
            </h2>
            <div className="space-y-1">
              {verses.map((verse) => {
                const highlight = highlights[verse.number];
                const isSelected = selectedVerse?.number === verse.number;
                return (
                  <motion.div
                    key={verse.number}
                    onClick={() => setSelectedVerse(isSelected ? null : verse)}
                    className="group cursor-pointer rounded-xl px-3 py-2 transition-all"
                    style={{
                      backgroundColor: isSelected
                        ? '#EEF2FF'
                        : highlight
                        ? COLOR_HEX[highlight.color] + 'CC'
                        : 'transparent',
                      border: isSelected ? '1.5px solid #6366F1' : '1.5px solid transparent',
                    }}
                  >
                    <span className="text-xs font-bold text-indigo-400 mr-2 select-none">{verse.number}</span>
                    <span className="text-base leading-7 text-gray-800">{verse.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Chapter Nav at bottom */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedChapter(c => Math.max(1, c - 1))}
                disabled={selectedChapter <= 1}
                className="flex items-center gap-2 text-sm text-indigo-600 font-medium disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Chapter
              </button>
              <button
                onClick={() => setSelectedChapter(c => Math.min(selectedBook?.chapters || 1, c + 1))}
                disabled={selectedChapter >= (selectedBook?.chapters || 1)}
                className="flex items-center gap-2 text-sm text-indigo-600 font-medium disabled:opacity-40"
              >
                Next Chapter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Highlight / Action Picker */}
      {selectedVerse && !showJournalModal && !showCrossRefPanel && (
        <VerseHighlightPicker
          verse={selectedVerse}
          existingColor={highlights[selectedVerse.number]?.color}
          onHighlight={handleHighlight}
          onSaveJournal={() => setShowJournalModal(true)}
          onCrossReference={fetchCrossReferences}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {/* Journal Save Modal */}
      <AnimatePresence>
        {showJournalModal && selectedVerse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && setShowJournalModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BookmarkPlus className="w-5 h-5 text-indigo-600" />
                  Save to Journal
                </h3>
                <button onClick={() => setShowJournalModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-indigo-600 font-semibold mb-1">{selectedBook?.name} {selectedChapter}:{selectedVerse.number}</p>
                <p className="text-sm text-gray-700 italic">"{selectedVerse.text}"</p>
              </div>
              <textarea
                value={journalNote}
                onChange={e => setJournalNote(e.target.value)}
                placeholder="Add your reflection or note…"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleSaveToJournal}
                disabled={savingJournal}
                className="mt-3 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                {savingJournal ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                {savingJournal ? 'Saving…' : 'Save Entry'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-References Panel */}
      <AnimatePresence>
        {showCrossRefPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && setShowCrossRefPanel(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[75vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  Cross References
                </h3>
                <button onClick={() => setShowCrossRefPanel(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              {loadingCrossRefs ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-500">Finding related verses…</span>
                </div>
              ) : crossRefs?.length > 0 ? (
                <div className="space-y-4">
                  {crossRefs.map((ref, i) => (
                    <div key={i} className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-purple-700 mb-1">{ref.reference}</p>
                      <p className="text-sm text-gray-700 italic mb-2">"{ref.text}"</p>
                      <p className="text-xs text-gray-500 bg-white rounded-lg px-2 py-1">{ref.connection}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No references found.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Picker Modal */}
      <AnimatePresence>
        {showBookPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={(e) => e.target === e.currentTarget && setShowBookPicker(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full bg-white rounded-t-3xl p-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">Select Book</h3>
                <button onClick={() => setShowBookPicker(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  placeholder="Search books…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto flex-1">
                {[{ label: 'Old Testament', books: otBooks }, { label: 'New Testament', books: ntBooks }].map(({ label, books }) => (
                  books.length > 0 && (
                    <div key={label} className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {books.map(book => (
                          <button
                            key={book.id}
                            onClick={() => {
                              setSelectedBook(book);
                              setSelectedChapter(1);
                              setShowBookPicker(false);
                              setBookSearch('');
                            }}
                            className={`py-2 px-3 rounded-xl text-sm font-medium text-left transition-all ${
                              selectedBook?.id === book.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-50 hover:bg-indigo-50 text-gray-700'
                            }`}
                          >
                            {book.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}