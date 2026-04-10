import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChapter, clearVerseCache, makeRefKey, saveVerse, unsaveVerse, isVerseSaved } from '../bibleVerseCache';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import VerseDiscussion from './VerseDiscussion';
import TranslationComparePanel from './TranslationComparePanel';
import VerseActions from './VerseActions';

const TRANSLATIONS = [
  { id: 'WEB', label: 'World English Bible' },
  { id: 'KJV', label: 'King James Version' },
  { id: 'NIV', label: 'New International Version' },
  { id: 'ESV', label: 'English Standard Version' },
  { id: 'NASB', label: 'New American Standard Bible' },
];

const CHAPTER_COUNTS = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  'Psalm': 150, 'Proverbs': 31, 'Isaiah': 66, 'Jeremiah': 52,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, 'Revelation': 22,
};

export default function ChapterView({ book, chapter, user, onChapterChange, onBookChange }) {
  const [translation, setTranslation] = useState(() => localStorage.getItem('preferred_translation') || 'WEB');
  const [savedMap, setSavedMap] = useState({});           // refKey → bool
  const [savingKey, setSavingKey] = useState(null);
  const [highlights, setHighlights] = useState({});
  const [discussingVerse, setDiscussingVerse] = useState(null); // verse number
  const activeRef = useRef(null);

  const maxChapter = CHAPTER_COUNTS[book] || 50;

  // ── Fetch chapter (safe: translation_id + book + chapter) ──────────────────
  const { data: verses = [], isLoading, isFetching } = useQuery({
    queryKey: ['chapterView', translation, book, chapter],
    queryFn: () => getChapter(translation, book, chapter),
    enabled: !!book && !!chapter,
    staleTime: 5 * 60 * 1000,
  });

  // ── Lazy-load saved status for this chapter's verses ──────────────────────
  useEffect(() => {
    if (!user?.id || !book) return;
    // filter user_id + book (2 fields — safe), match client-side
    isVerseSaved(user.id, book, chapter, verses[0]?.verse ?? 1)
      .then(({ saved }) => {
        if (!saved) return;
        const map = {};
        saved.forEach(s => { map[s.ref_key || s.verse_ref_key] = true; });
        setSavedMap(map);
      })
      .catch(() => {});
  }, [user?.id, book, chapter]);

  const handleTranslationChange = (newT) => {
    clearVerseCache(translation, book, chapter);  // bust only the current chapter
    setTranslation(newT);
    localStorage.setItem('preferred_translation', newT);
  };

  const handleSave = async (v) => {
    if (!user) { toast.error('Please sign in to save verses'); return; }
    const refKey = makeRefKey(book, chapter, v.verse);
    setSavingKey(refKey);
    try {
      if (savedMap[refKey]) {
        await unsaveVerse(user.id, book, chapter, v.verse);
        setSavedMap(m => ({ ...m, [refKey]: false }));
        toast.success('Removed from saved');
      } else {
        await saveVerse({ userId: user.id, translationId: translation, book, chapter, verse: v.verse, text: v.text, reference: `${book} ${chapter}:${v.verse}` });
        setSavedMap(m => ({ ...m, [refKey]: true }));
        toast.success('Verse saved! 🙌');
      }
    } catch { toast.error('Failed to save verse'); }
    setSavingKey(null);
  };

  const handleHighlight = (verseKey, color) => {
    setHighlights(m => ({ ...m, [verseKey]: color }));
  };

  const handleClearHighlight = (verseKey) => {
    setHighlights(m => { const u = { ...m }; delete u[verseKey]; return u; });
  };

  const goChapter = (delta) => {
    const next = chapter + delta;
    if (next < 1 || next > maxChapter) return;
    onChapterChange?.(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 sticky top-[64px] z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 -mx-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => goChapter(-1)} disabled={chapter <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-gray-700 min-w-[90px] text-center">{book} {chapter}</span>
          <Button variant="ghost" size="icon" onClick={() => goChapter(1)} disabled={chapter >= maxChapter}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Select value={translation} onValueChange={handleTranslationChange}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSLATIONS.map(t => (
              <SelectItem key={t.id} value={t.id} className="text-xs">{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFetching && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}

        <div className="ml-auto text-xs text-gray-400">{verses.length} verses</div>
      </div>

      {/* ── Verse list ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading {book} {chapter}…</span>
        </div>
      ) : verses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No verses found for this translation.</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {verses.map((v, i) => {
            const refKey = makeRefKey(book, chapter, v.verse);
            const saved = !!savedMap[refKey];
            const highlighted = highlights[refKey];
            const HIGHLIGHT_BG = {
              yellow: '#FFFAED', green: '#F0FDF4', pink: '#FDF2F8', blue: '#EFF6FF'
            };
            const HIGHLIGHT_BORDER = {
              yellow: '#FCD34D', green: '#86EFAC', pink: '#F472B6', blue: '#93C5FD'
            };
            return (
              <div
                key={v.id || i}
                ref={discussingVerse === v.verse ? activeRef : null}
                className="group px-4 py-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: highlighted ? HIGHLIGHT_BG[highlighted] : undefined,
                  borderLeft: highlighted ? `3px solid ${HIGHLIGHT_BORDER[highlighted]}` : '3px solid transparent',
                }}
              >
                <div className="flex gap-3">
                  <span className="text-xs font-bold text-indigo-400 mt-1 w-6 flex-shrink-0">{v.verse}</span>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed text-[15px]">{v.text}</p>
                    {/* Action row */}
                    <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <VerseActions
                        verse={v}
                        book={book}
                        chapter={chapter}
                        translation={translation}
                        highlighted={highlighted}
                        isBookmarked={saved}
                        onHighlight={(color) => handleHighlight(refKey, color)}
                        onClearHighlight={() => handleClearHighlight(refKey)}
                        onBookmark={() => handleSave(v)}
                      />
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 gap-1 text-xs text-gray-400 hover:text-purple-600"
                        onClick={() => setDiscussingVerse(discussingVerse === v.verse ? null : v.verse)}
                      >
                        <MessageCircle className="w-3 h-3" />
                        Discuss
                      </Button>
                    </div>
                    {/* Inline discussion panel */}
                    {discussingVerse === v.verse && (
                      <div className="mt-3 ml-0 border-l-2 border-indigo-200 pl-3">
                        <VerseDiscussion
                          user={user}
                          book={book}
                          chapter={chapter}
                          verse={v.verse}
                          verseText={v.text}
                          translation={translation}
                          onClose={() => setDiscussingVerse(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Translation Comparison ─────────────────────────────────────────── */}
      {verses.length > 0 && (
        <div className="mt-4">
          <TranslationComparePanel book={book} chapter={chapter} defaultTranslation={translation} />
        </div>
      )}

      {/* ── Chapter navigation footer ───────────────────────────────────────── */}
      <div className="flex justify-between pt-6 pb-2 border-t border-gray-100">
        <Button variant="outline" onClick={() => goChapter(-1)} disabled={chapter <= 1} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <span className="text-xs text-gray-400 self-center">{book} {chapter} / {maxChapter}</span>
        <Button variant="outline" onClick={() => goChapter(1)} disabled={chapter >= maxChapter} className="gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}