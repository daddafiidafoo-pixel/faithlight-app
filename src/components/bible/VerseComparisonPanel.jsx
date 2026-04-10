import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

const CHAPTERS = Array.from({ length: 150 }, (_, i) => i + 1);
const VERSES = Array.from({ length: 50 }, (_, i) => i + 1);

const COMMON_TRANSLATIONS = ['KJV', 'NIV', 'ESV', 'NLT', 'NASB', 'WEB', 'ASV', 'RSV'];

export default function VerseComparisonPanel() {
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [verseStart, setVerseStart] = useState(16);
  const [verseEnd, setVerseEnd] = useState(17);
  const [selectedTranslations, setSelectedTranslations] = useState(['KJV', 'NIV', 'ESV']);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  const { data: dbTranslations = [] } = useQuery({
    queryKey: ['translations'],
    queryFn: () => base44.entities.Translation.filter({ is_active: true }),
    retry: false,
  });

  const availableTranslations = dbTranslations.length > 0
    ? dbTranslations.map(t => ({ code: t.translation_code, name: t.display_name }))
    : COMMON_TRANSLATIONS.map(c => ({ code: c, name: c }));

  const toggleTranslation = (code) => {
    setSelectedTranslations(prev =>
      prev.includes(code)
        ? prev.filter(t => t !== code)
        : prev.length < 4 ? [...prev, code] : prev
    );
  };

  const handleCompare = async () => {
    if (selectedTranslations.length === 0) return;
    setLoading(true);
    setComparisonData(null);
    setAiInsight('');
    try {
      const results = {};
      for (const code of selectedTranslations) {
        const verses = await base44.entities.BibleVerse.filter(
          { translation: code, book: selectedBook, chapter: selectedChapter },
          'verse', 300
        );
        results[code] = (verses || []).filter(v => v.verse >= verseStart && v.verse <= verseEnd);
      }
      setComparisonData(results);
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsight = async () => {
    if (!comparisonData) return;
    setLoadingInsight(true);
    try {
      const verseTexts = selectedTranslations
        .map(code => {
          const vv = comparisonData[code] || [];
          return `${code}: ${vv.map(v => v.text).join(' ')}`;
        })
        .join('\n\n');

      const insight = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare these Bible translations for ${selectedBook} ${selectedChapter}:${verseStart}-${verseEnd}. 
Highlight key word differences, theological nuances, and what each translation emphasizes. Be concise (3-4 paragraphs max).

${verseTexts}`,
      });
      setAiInsight(insight);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Select Passage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Book</label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Chapter</label>
              <Select value={String(selectedChapter)} onValueChange={v => setSelectedChapter(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {CHAPTERS.slice(0, 50).map(c => <SelectItem key={c} value={String(c)}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Verse From</label>
              <Select value={String(verseStart)} onValueChange={v => { setVerseStart(Number(v)); if (Number(v) > verseEnd) setVerseEnd(Number(v)); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {VERSES.map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Verse To</label>
              <Select value={String(verseEnd)} onValueChange={v => setVerseEnd(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {VERSES.filter(v => v >= verseStart).map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translation Selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Select translations to compare (up to 4):</p>
            <div className="flex flex-wrap gap-2">
              {availableTranslations.map(t => (
                <label key={t.code} className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  selectedTranslations.includes(t.code)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}>
                  <Checkbox
                    checked={selectedTranslations.includes(t.code)}
                    onCheckedChange={() => toggleTranslation(t.code)}
                    className="hidden"
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          <Button onClick={handleCompare} disabled={loading || selectedTranslations.length === 0} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {loading ? 'Loading...' : 'Compare'}
          </Button>
        </CardContent>
      </Card>

      {/* Side-by-side Results */}
      {comparisonData && (
        <>
          <div className="text-center text-sm text-gray-500 font-medium">
            {selectedBook} {selectedChapter}:{verseStart}{verseEnd > verseStart ? `–${verseEnd}` : ''} — {selectedTranslations.length} translations
          </div>
          <div className={`grid gap-4 ${selectedTranslations.length === 1 ? 'grid-cols-1' : selectedTranslations.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {selectedTranslations.map((code, idx) => {
              const label = availableTranslations.find(t => t.code === code)?.name || code;
              const verses = comparisonData[code] || [];
              const colors = ['border-indigo-300 bg-indigo-50', 'border-amber-300 bg-amber-50', 'border-emerald-300 bg-emerald-50', 'border-rose-300 bg-rose-50'];
              const headerColors = ['text-indigo-700 bg-indigo-100', 'text-amber-700 bg-amber-100', 'text-emerald-700 bg-emerald-100', 'text-rose-700 bg-rose-100'];
              return (
                <Card key={code} className={`border-2 ${colors[idx]}`}>
                  <CardHeader className={`py-3 px-4 rounded-t-xl ${headerColors[idx]}`}>
                    <CardTitle className="text-sm font-bold tracking-wide">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    {verses.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No verses found for this translation.</p>
                    ) : (
                      verses.map(v => (
                        <p key={v.id} className="text-sm text-gray-800 leading-relaxed">
                          <sup className="font-bold text-gray-400 mr-1">{v.verse}</sup>{v.text}
                        </p>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Insight */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-5">
              {!aiInsight ? (
                <div className="text-center">
                  <p className="text-sm text-purple-700 mb-3">Get an AI-powered analysis of the translation differences</p>
                  <Button variant="outline" onClick={handleGetInsight} disabled={loadingInsight} className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100">
                    {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : '✨'}
                    {loadingInsight ? 'Analyzing...' : 'AI Translation Insight'}
                  </Button>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">✨ Translation Analysis</h4>
                  <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">{aiInsight}</p>
                  <Button variant="ghost" size="sm" onClick={() => setAiInsight('')} className="mt-2 text-purple-600">Dismiss</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}