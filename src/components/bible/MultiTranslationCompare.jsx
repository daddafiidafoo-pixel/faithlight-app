import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitCompare, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ALL_TRANSLATIONS = [
  { id: 'WEB', label: 'WEB', full: 'World English Bible' },
  { id: 'KJV', label: 'KJV', full: 'King James Version' },
  { id: 'NIV', label: 'NIV', full: 'New International Version' },
  { id: 'ESV', label: 'ESV', full: 'English Standard Version' },
  { id: 'NASB', label: 'NASB', full: 'New American Standard' },
  { id: 'NLT', label: 'NLT', full: 'New Living Translation' },
  { id: 'AMP', label: 'AMP', full: 'Amplified Bible' },
  { id: 'MSG', label: 'MSG', full: 'The Message' },
];

const COL_STYLES = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', numBg: 'bg-blue-200' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', numBg: 'bg-purple-200' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', numBg: 'bg-green-200' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', numBg: 'bg-amber-200' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', numBg: 'bg-rose-200' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700', numBg: 'bg-teal-200' },
];

// Simple word-level diff: returns spans with difference highlights
function DiffText({ text, baseText, colorClass }) {
  if (!baseText || !text) return <span>{text}</span>;
  const words = text.split(' ');
  const baseWords = new Set(baseText.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, '')));
  return (
    <>
      {words.map((word, i) => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        const isDiff = clean.length > 3 && !baseWords.has(clean);
        return (
          <span key={i}>
            {isDiff
              ? <mark className={`${colorClass} rounded px-0.5`}>{word}</mark>
              : word
            }
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
}

function useTranslationVerses(translationId, book, chapter) {
  return useQuery({
    queryKey: ['compareVerses', translationId, book, chapter],
    queryFn: async () => {
      // Try StructuredBibleVerse first
      const BIBLE_BOOKS = [
        'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
        '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
        'Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Songs',
        'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
        'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
        'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
        '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
        '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
        'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
      ];
      const bookOrder = BIBLE_BOOKS.indexOf(book) + 1;
      const structured = await base44.entities.StructuredBibleVerse.filter(
        { translation_abbrev: translationId, book_order: bookOrder, chapter: parseInt(chapter) },
        'verse', 200
      ).catch(() => []);
      if (structured.length > 0) return structured;

      return base44.entities.BibleVerse.filter(
        { book, chapter: parseInt(chapter), translation: translationId },
        'verse', 200
      ).catch(() => []);
    },
    enabled: !!book && !!chapter && !!translationId,
    staleTime: 10 * 60 * 1000,
  });
}

export default function MultiTranslationCompare({ book, chapter, startVerse, endVerse, defaultTranslation = 'WEB' }) {
  const [selected, setSelected] = useState([defaultTranslation, 'KJV']);
  const [expanded, setExpanded] = useState(false);
  const [showDiffs, setShowDiffs] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      setSelected(s => s.filter(x => x !== id));
    } else {
      setSelected(s => [...s, id]);
    }
  };

  const passageLabel = startVerse
    ? `${book} ${chapter}:${startVerse}${endVerse && endVerse !== startVerse ? `–${endVerse}` : ''}`
    : `${book} ${chapter}`;

  // Fetch all selected translations
  const queries = selected.map(tid => ({
    tid,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    result: useTranslationVerses(tid, book, chapter)
  }));

  const isAnyLoading = queries.some(q => q.result.isLoading);

  // Filter to verse range
  const allData = queries.map(q => ({
    tid: q.tid,
    verses: (q.result.data || []).filter(v =>
      startVerse ? v.verse >= startVerse && v.verse <= (endVerse || startVerse) : true
    )
  }));

  // Get unique verse numbers present across all translations
  const verseNums = useMemo(() => {
    const nums = new Set();
    allData.forEach(d => d.verses.forEach(v => nums.add(v.verse)));
    return [...nums].sort((a, b) => a - b);
  }, [allData]);

  // Base translation text for diffing
  const baseVerses = allData[0]?.verses || [];
  const baseMap = Object.fromEntries(baseVerses.map(v => [v.verse, v.text || v.verse_text || '']));

  const generateAISummary = async () => {
    setLoadingSummary(true);
    setAiSummary(null);
    try {
      const excerpts = allData.map(d => {
        const sample = d.verses.slice(0, 3).map(v => `v${v.verse}: "${v.text || v.verse_text}"`).join(' ');
        return `[${d.tid}] ${sample}`;
      }).join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare these ${selected.length} Bible translations for ${passageLabel}:\n\n${excerpts}\n\nProvide a concise, insightful summary of:\n1. Key wording differences between translations\n2. How each translation's approach affects meaning\n3. Which translation(s) are most literal vs. most readable\n4. Any theologically significant differences in word choice\n\nKeep it under 200 words.`
      });
      setAiSummary(res);
    } catch (e) {
      toast.error('Could not generate AI summary');
    }
    setLoadingSummary(false);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm text-indigo-800">Compare Translations</span>
          <Badge className="bg-indigo-100 text-indigo-700 border-none text-xs">{passageLabel}</Badge>
          {selected.length > 0 && (
            <Badge className="bg-purple-100 text-purple-700 border-none text-xs">{selected.length} selected</Badge>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Translation picker */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Select translations (up to 6):</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TRANSLATIONS.map((t, i) => {
                const isSelected = selected.includes(t.id);
                const style = isSelected ? COL_STYLES[selected.indexOf(t.id) % COL_STYLES.length] : null;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    disabled={!isSelected && selected.length >= 6}
                    title={t.full}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${
                      isSelected
                        ? `${style.badge} border-current`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setShowDiffs(d => !d)}
                className={`relative w-9 h-5 rounded-full transition-colors ${showDiffs ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showDiffs ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs text-gray-600">Highlight differences</span>
            </label>

            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 h-7"
              onClick={generateAISummary}
              disabled={loadingSummary || selected.length < 2}
            >
              {loadingSummary
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing…</>
                : <><Sparkles className="w-3 h-3 text-indigo-500" /> AI Summary</>
              }
            </Button>
          </div>

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">AI Translation Analysis</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiSummary}</p>
            </div>
          )}

          {/* Comparison table (verse-by-verse rows) */}
          {isAnyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          ) : verseNums.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No verses found for this passage.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="w-8 text-xs font-bold text-gray-400 px-3 py-2 bg-gray-50 border-b border-gray-200 text-left">#</th>
                    {selected.map((tid, i) => {
                      const style = COL_STYLES[i % COL_STYLES.length];
                      const meta = ALL_TRANSLATIONS.find(t => t.id === tid);
                      return (
                        <th key={tid} className={`px-3 py-2 text-left border-b border-gray-200 ${style.bg}`}>
                          <span className={`text-xs font-bold ${style.text}`}>{meta?.full || tid}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {verseNums.map((vNum, rowIdx) => (
                    <tr key={vNum} className={rowIdx % 2 === 0 ? '' : 'bg-gray-50/50'}>
                      <td className="px-3 py-2 text-xs font-bold text-gray-400 align-top">{vNum}</td>
                      {selected.map((tid, i) => {
                        const style = COL_STYLES[i % COL_STYLES.length];
                        const d = allData.find(a => a.tid === tid);
                        const verse = d?.verses.find(v => v.verse === vNum);
                        const text = verse?.text || verse?.verse_text || '';
                        const baseText = i === 0 ? '' : baseMap[vNum] || '';
                        return (
                          <td key={tid} className={`px-3 py-2.5 leading-relaxed align-top text-gray-800 text-xs border-l border-gray-100`}>
                            {text
                              ? showDiffs && i > 0
                                ? <DiffText text={text} baseText={baseText} colorClass={`${style.bg} ${style.text}`} />
                                : text
                              : <span className="text-gray-300 italic">—</span>
                            }
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}