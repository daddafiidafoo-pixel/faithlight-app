import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader, AlertCircle, BookOpen, FileText, Mic, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/components/languageStore';

const CATEGORIES = [
  { id: 'all', label: 'All Results', icon: Search },
  { id: 'verses', label: 'Verses', icon: BookOpen },
  { id: 'studies', label: 'Studies', icon: FileText },
  { id: 'sermons', label: 'Sermons', icon: Mic },
];

const LANGUAGE_SUGGESTIONS = {
  en: [
    'verses about finding peace during difficult times',
    'scriptures on hope and encouragement',
    'overcoming fear with faith',
    'love and compassion passages',
    "God's strength in weakness",
    'forgiveness and grace',
    'purpose and calling in Christ',
  ],
  om: [
    'Waarri Waaqayyoo nagaa naaf kenna',
    'Abdii fi jajjabina',
    'Amantaa Waaqayyo',
    'Gara Waaqayyotti deebi\'uu',
  ],
  am: [
    'ሰላምን ስለሚሰጡ ጥቅሶች',
    'ስለ ተስፋ እና ማበረታቻ',
    'በፍርሃት ጊዜ እምነት',
    'ወደ እግዚአብሔር ቀረቡ',
  ],
  sw: [
    'mistari kuhusu amani',
    'tumaini na imara katika Mungu',
    'nguvu za Mungu',
    'upendo na huruma',
  ],
};

// Mock categorization of results — real impl would come from backend
function categorizeResults(results) {
  if (!results?.length) return { verses: [], studies: [], sermons: [] };
  // Assign categories based on relevance score bands (simplified)
  return {
    verses: results.slice(0, Math.ceil(results.length * 0.6)),
    studies: results.slice(Math.ceil(results.length * 0.6), Math.ceil(results.length * 0.8)).map(r => ({
      ...r, studyTitle: `Study: ${r.reference.split(' ')[0]} Deep Dive`, type: 'study',
    })),
    sermons: results.slice(Math.ceil(results.length * 0.8)).map(r => ({
      ...r, sermonTitle: `Sermon: ${r.reference}`, type: 'sermon',
    })),
  };
}

function VerseCard({ result }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">{result.reference}</h3>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">{result.relevanceScore}% match</span>
      </div>
      <p className="text-gray-700 italic leading-relaxed mb-3">"{result.text}"</p>
      {result.explanation && (
        <div className="bg-blue-50 border-l-4 border-blue-500 pl-3 py-2 rounded-r-lg">
          <p className="text-xs font-semibold text-blue-900 mb-0.5">Why this matches:</p>
          <p className="text-xs text-blue-800">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}

function StudyCard({ result }) {
  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={15} className="text-purple-500" />
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Study Plan</span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{result.studyTitle}</h3>
      <p className="text-sm text-gray-600 italic mb-2">Key verse: {result.reference}</p>
      <p className="text-sm text-gray-500">"{result.text?.slice(0, 100)}…"</p>
    </div>
  );
}

function SermonCard({ result }) {
  return (
    <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Mic size={15} className="text-amber-500" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Sermon Topic</span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{result.sermonTitle}</h3>
      <p className="text-sm text-gray-600 italic mb-2">Based on: {result.reference}</p>
      <p className="text-sm text-gray-500">"{result.text?.slice(0, 80)}…"</p>
    </div>
  );
}

export default function SemanticBibleSearch() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const [query, setQuery] = useState('');
  const [searchLang, setSearchLang] = useState('en');
  const [rawResults, setRawResults] = useState(null);
  const [categorized, setCategorized] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showLangPicker, setShowLangPicker] = useState(false);

  const suggestions = LANGUAGE_SUGGESTIONS[searchLang] || LANGUAGE_SUGGESTIONS.en;

  const LANG_OPTIONS = [
    { code: 'en', label: 'English' },
    { code: 'om', label: 'Afaan Oromoo' },
    { code: 'am', label: 'አማርኛ' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ];

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setRawResults(null);
    setCategorized(null);
    setActiveCategory('all');
    try {
      const response = await base44.functions.invoke('semanticBibleSearch', {
        query: q.trim(),
        language: searchLang,
      });
      if (response.data?.success) {
        const results = response.data.results || [];
        setRawResults(results);
        setCategorized(categorizeResults(results));
      } else {
        setError(response.data?.error || 'Search failed. Please try again.');
      }
    } catch (err) {
      setError('Search is unavailable right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const onSuggestion = (s) => { setQuery(s); handleSearch(s); };

  const displayResults = () => {
    if (!categorized) return [];
    if (activeCategory === 'verses') return categorized.verses;
    if (activeCategory === 'studies') return categorized.studies;
    if (activeCategory === 'sermons') return categorized.sermons;
    return rawResults || [];
  };

  const totalCount = rawResults?.length || 0;
  const counts = categorized ? {
    all: totalCount,
    verses: categorized.verses.length,
    studies: categorized.studies.length,
    sermons: categorized.sermons.length,
  } : {};

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Scripture Search</h1>
              <p className="text-xs text-gray-500">Natural language · Multi-translation · Categorized</p>
            </div>
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(s => !s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Globe size={13} />
                {LANG_OPTIONS.find(l => l.code === searchLang)?.label}
                {showLangPicker ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showLangPicker && (
                <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {LANG_OPTIONS.map(l => (
                    <button key={l.code} onClick={() => { setSearchLang(l.code); setShowLangPicker(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${searchLang === l.code ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >{l.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={searchLang === 'om' ? 'Barbaadi…' : searchLang === 'am' ? 'ፈልግ…' : 'Search by theme, emotion, context…'}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-gray-900"
                dir={searchLang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()} className="rounded-xl px-5">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Suggestions */}
        {!rawResults && !loading && !error && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              {searchLang === 'om' ? 'Yaada barbaaddaa:' : searchLang === 'am' ? 'ሀሳቦችን ይሞክሩ:' : 'Try searching for:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => onSuggestion(s)}
                  className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
                  dir={['am', 'ar'].includes(searchLang) ? 'rtl' : 'ltr'}
                >{s}</button>
              ))}
            </div>

            {/* Language note for Oromo/Amharic */}
            {(searchLang === 'om' || searchLang === 'am') && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">
                  {searchLang === 'om' ? '📌 Oromoo barreeffama' : '📌 አማርኛ ፍለጋ'}
                </p>
                <p className="text-xs">
                  {searchLang === 'om'
                    ? 'Barbaachi Afaan Oromoo deeggara. Gaafii Afaan Oromoo barreessuu dandeessa — AI sagantaa hiika sirritti.'
                    : 'የአማርኛ ፍለጋ ይደገፋል። በአማርኛ ጥያቄ ይጻፉ — AI በትክክል ይተረጉማል።'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 mb-5">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 text-sm">{error}</p>
              <p className="text-xs text-red-700 mt-1">Try rephrasing your query or switching language.</p>
            </div>
          </div>
        )}

        {/* Category tabs */}
        {rawResults && (
          <>
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {CATEGORIES.map(({ id, label, icon: CatIcon }) => (
                <button key={id} onClick={() => setActiveCategory(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${activeCategory === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'}`}
                >
                  <CatIcon size={12} />
                  {label}
                  {counts[id] !== undefined && (
                    <span className={`ml-0.5 ${activeCategory === id ? 'text-indigo-200' : 'text-gray-400'}`}>({counts[id]})</span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-4">
              {totalCount} result{totalCount !== 1 ? 's' : ''} for <span className="font-semibold text-gray-800">"{query}"</span>
            </p>

            {displayResults().length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No {activeCategory === 'all' ? '' : activeCategory} found for this query.
              </div>
            ) : (
              <div className="space-y-4">
                {displayResults().map((result, idx) => (
                  result.type === 'study' ? <StudyCard key={idx} result={result} /> :
                  result.type === 'sermon' ? <SermonCard key={idx} result={result} /> :
                  <VerseCard key={idx} result={result} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}