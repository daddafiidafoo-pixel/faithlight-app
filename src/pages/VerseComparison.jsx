import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ChevronLeft, ChevronRight, Loader2, RefreshCw, Sparkles, Copy, Check, ChevronDown, ChevronUp, Columns, List, AlignJustify } from 'lucide-react';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah',
  'Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
];

const TRANSLATIONS = ['WEB', 'ASV', 'KJV', 'NIV', 'ESV', 'NLT', 'NASB', 'RSV'];

const TRANSLATION_COLORS = [
  'border-indigo-300 bg-indigo-50 text-indigo-900',
  'border-amber-300 bg-amber-50 text-amber-900',
  'border-emerald-300 bg-emerald-50 text-emerald-900',
  'border-rose-300 bg-rose-50 text-rose-900',
];

const CHAPTERS = Array.from({ length: 150 }, (_, i) => i + 1);
const VERSES = Array.from({ length: 176 }, (_, i) => i + 1);

export default function VerseComparison() {
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [verseStart, setVerseStart] = useState(16);
  const [verseEnd, setVerseEnd] = useState(16);
  const [selectedTranslations, setSelectedTranslations] = useState(['WEB', 'ASV']);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('side'); // 'side' | 'tabs' | 'stacked'
  const [collapsedTranslations, setCollapsedTranslations] = useState({});

  const toggleTranslation = (t) => {
    setSelectedTranslations(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 4 ? [...prev, t] : prev
    );
  };

  const handleCompare = useCallback(async () => {
    if (!selectedTranslations.length) return;
    setLoading(true);
    setResults(null);
    setAiInsight('');
    const out = {};
    await Promise.all(selectedTranslations.map(async (t) => {
      const verses = await base44.entities.BibleVerse.filter(
        { translation: t, book, chapter },
        'verse', 300
      );
      out[t] = (verses || []).filter(v => v.verse >= verseStart && v.verse <= verseEnd);
    }));
    setResults(out);
    setLoading(false);
  }, [book, chapter, verseStart, verseEnd, selectedTranslations]);

  const navigate = (direction) => {
    // Navigate verses: prev/next verse
    const newStart = verseStart + direction;
    const newEnd = verseEnd + direction;
    if (newStart < 1) return;
    setVerseStart(newStart);
    setVerseEnd(newEnd);
    // Auto-compare after navigation
    setTimeout(async () => {
      if (!selectedTranslations.length) return;
      setLoading(true);
      setResults(null);
      setAiInsight('');
      const out = {};
      await Promise.all(selectedTranslations.map(async (t) => {
        const verses = await base44.entities.BibleVerse.filter(
          { translation: t, book, chapter },
          'verse', 300
        );
        out[t] = (verses || []).filter(v => v.verse >= newStart && v.verse <= newEnd);
      }));
      setResults(out);
      setLoading(false);
    }, 0);
  };

  const handleGetInsight = async () => {
    if (!results) return;
    setLoadingInsight(true);
    const texts = selectedTranslations
      .map(t => `${t}: ${(results[t] || []).map(v => v.text).join(' ')}`)
      .join('\n\n');
    const insight = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare these Bible translations for ${book} ${chapter}:${verseStart}${verseEnd > verseStart ? `-${verseEnd}` : ''}. 
Highlight key word differences, theological nuances, and what each translation emphasizes. Be concise (3-4 paragraphs).

${texts}`,
    });
    setAiInsight(insight);
    setLoadingInsight(false);
  };

  const handleCopyAll = () => {
    if (!results) return;
    const text = selectedTranslations
      .map(t => `[${t}] ${book} ${chapter}:${verseStart}${verseEnd > verseStart ? `-${verseEnd}` : ''}\n${(results[t] || []).map(v => `${v.verse}. ${v.text}`).join('\n')}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCollapse = (t) => setCollapsedTranslations(prev => ({ ...prev, [t]: !prev[t] }));

  const passageRef = `${book} ${chapter}:${verseStart}${verseEnd > verseStart ? `–${verseEnd}` : ''}`;

  const TranslationCard = ({ t, idx, collapsible = false }) => {
    const vv = results?.[t] || [];
    const colorClass = TRANSLATION_COLORS[idx % TRANSLATION_COLORS.length];
    const isCollapsed = collapsedTranslations[t];
    return (
      <Card className={`border-2 ${colorClass.split(' ')[0]}`}>
        <CardHeader
          className={`py-3 px-4 rounded-t-xl ${colorClass.split(' ')[1]} ${collapsible ? 'cursor-pointer select-none' : ''}`}
          onClick={collapsible ? () => toggleCollapse(t) : undefined}
        >
          <div className="flex items-center justify-between">
            <Badge className="text-sm font-bold px-3 py-1 bg-white/80 text-gray-800 border-0 shadow-sm">{t}</Badge>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium opacity-70">{passageRef}</span>
              {collapsible && (isCollapsed ? <ChevronDown className="w-4 h-4 opacity-60" /> : <ChevronUp className="w-4 h-4 opacity-60" />)}
            </div>
          </div>
        </CardHeader>
        {!isCollapsed && (
          <CardContent className="p-4">
            {vv.length === 0 ? (
              <p className="text-gray-400 italic text-sm">Translation not available in database for this passage.</p>
            ) : (
              <div className="space-y-2">
                {vv.map(v => (
                  <p key={v.verse} className="text-gray-800 leading-relaxed text-sm">
                    <sup className="font-bold text-indigo-600 mr-1">{v.verse}</sup>
                    {v.text}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            Verse Comparison
          </h1>
          <p className="text-gray-500 mt-1">Compare the same passage across multiple Bible translations side-by-side.</p>
        </div>

        {/* Controls */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-base text-gray-700">Select Passage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Book / Chapter / Verse selectors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Book</label>
                <Select value={book} onValueChange={setBook}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Chapter</label>
                <Select value={String(chapter)} onValueChange={v => setChapter(Number(v))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {CHAPTERS.slice(0, 50).map(c => <SelectItem key={c} value={String(c)}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">From Verse</label>
                <Select value={String(verseStart)} onValueChange={v => { const n = Number(v); setVerseStart(n); if (n > verseEnd) setVerseEnd(n); }}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {VERSES.map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">To Verse</label>
                <Select value={String(verseEnd)} onValueChange={v => setVerseEnd(Number(v))}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {VERSES.filter(v => v >= verseStart).map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Translations */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Translations (up to 4):</p>
              <div className="flex flex-wrap gap-2">
                {TRANSLATIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleTranslation(t)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selectedTranslations.includes(t)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                    } ${!selectedTranslations.includes(t) && selectedTranslations.length >= 4 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleCompare} disabled={loading || selectedTranslations.length === 0} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? 'Loading translations...' : 'Compare Passage'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {(results || loading) && (
          <div className="space-y-4">
            {/* Verse navigation bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg border bg-white hover:bg-gray-50 shadow-sm disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-gray-800 px-2">{passageRef}</span>
                <button onClick={() => navigate(1)} className="p-2 rounded-lg border bg-white hover:bg-gray-50 shadow-sm transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {results && (
                  <button onClick={handleCopyAll} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-700 px-3 py-1.5 border bg-white rounded-lg shadow-sm transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy all'}
                  </button>
                )}
                {results && (
                  <Button size="sm" variant="outline" onClick={handleGetInsight} disabled={loadingInsight} className="gap-1.5">
                    {loadingInsight ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-500" />}
                    AI Insight
                  </Button>
                )}
              </div>
            </div>

            {/* View mode switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {[
                { mode: 'side', icon: <Columns className="w-3.5 h-3.5" />, label: 'Side by Side' },
                { mode: 'tabs', icon: <List className="w-3.5 h-3.5" />, label: 'Tabs' },
                { mode: 'stacked', icon: <AlignJustify className="w-3.5 h-3.5" />, label: 'Collapsible' },
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === mode ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <span className="ml-3 text-gray-500">Fetching translations...</span>
              </div>
            )}

            {/* Side-by-side view */}
            {results && viewMode === 'side' && (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {selectedTranslations.map((t, idx) => <TranslationCard key={t} t={t} idx={idx} />)}
              </div>
            )}

            {/* Tabs view */}
            {results && viewMode === 'tabs' && (
              <Tabs defaultValue={selectedTranslations[0]}>
                <TabsList className="mb-4">
                  {selectedTranslations.map(t => (
                    <TabsTrigger key={t} value={t} className="font-bold">{t}</TabsTrigger>
                  ))}
                </TabsList>
                {selectedTranslations.map((t, idx) => (
                  <TabsContent key={t} value={t}>
                    <TranslationCard t={t} idx={idx} />
                  </TabsContent>
                ))}
              </Tabs>
            )}

            {/* Collapsible / stacked view */}
            {results && viewMode === 'stacked' && (
              <div className="space-y-3">
                {selectedTranslations.map((t, idx) => <TranslationCard key={t} t={t} idx={idx} collapsible />)}
              </div>
            )}

            {/* AI Insight */}
            {aiInsight && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                    <Sparkles className="w-4 h-4" /> AI Translation Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiInsight}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">Select a passage and translations to compare</p>
            <p className="text-sm mt-1">View the same verse across different Bible versions side-by-side</p>
          </div>
        )}
      </div>
    </div>
  );
}