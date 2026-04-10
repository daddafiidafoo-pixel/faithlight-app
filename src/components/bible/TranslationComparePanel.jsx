import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChapter } from '../bibleVerseCache';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitCompare, X, ChevronDown, ChevronUp } from 'lucide-react';

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

const COLORS = ['bg-blue-50 border-blue-200', 'bg-purple-50 border-purple-200', 'bg-green-50 border-green-200', 'bg-amber-50 border-amber-200'];
const TEXT_COLORS = ['text-blue-700', 'text-purple-700', 'text-green-700', 'text-amber-700'];

function TranslationColumn({ translationId, book, chapter, startVerse, endVerse, label, colorClass, textColor }) {
  const { data: allVerses = [], isLoading } = useQuery({
    queryKey: ['compareVerses', translationId, book, chapter],
    queryFn: () => getChapter(translationId, book, chapter),
    enabled: !!book && !!chapter && !!translationId,
    staleTime: 10 * 60 * 1000,
  });

  const verses = startVerse
    ? allVerses.filter(v => v.verse >= startVerse && v.verse <= (endVerse || startVerse))
    : allVerses;

  return (
    <div className={`flex-1 min-w-[220px] border rounded-xl p-4 ${colorClass}`}>
      <div className={`text-xs font-bold mb-3 ${textColor}`}>{label}</div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
      ) : verses.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Not available in this translation</p>
      ) : (
        <div className="space-y-2">
          {verses.map(v => (
            <p key={v.verse} className="text-sm text-gray-800 leading-relaxed">
              <span className={`text-xs font-bold mr-1.5 ${textColor}`}>{v.verse}</span>
              {v.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TranslationComparePanel({ book, chapter, startVerse, endVerse, defaultTranslation = 'WEB' }) {
  const [selected, setSelected] = useState([defaultTranslation, 'KJV']);
  const [expanded, setExpanded] = useState(false);

  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return; // keep at least 1
      setSelected(s => s.filter(x => x !== id));
    } else {
      if (selected.length >= 4) { 
        setSelected(s => [...s.slice(1), id]);
      } else {
        setSelected(s => [...s, id]);
      }
    }
  };

  const passageLabel = startVerse
    ? `${book} ${chapter}:${startVerse}${endVerse && endVerse !== startVerse ? `–${endVerse}` : ''}`
    : `${book} ${chapter}`;

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
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-indigo-500" />}
      </button>

      {expanded && (
        <div className="p-4">
          {/* Translation picker */}
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_TRANSLATIONS.map(t => (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                title={t.full}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selected.includes(t.id)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="text-xs text-gray-400 self-center ml-1">Select up to 4</span>
          </div>

          {/* Comparison columns */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {selected.map((tid, i) => {
              const meta = ALL_TRANSLATIONS.find(t => t.id === tid);
              return (
                <TranslationColumn
                  key={tid}
                  translationId={tid}
                  book={book}
                  chapter={chapter}
                  startVerse={startVerse}
                  endVerse={endVerse}
                  label={meta?.full || tid}
                  colorClass={COLORS[i % COLORS.length]}
                  textColor={TEXT_COLORS[i % TEXT_COLORS.length]}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}