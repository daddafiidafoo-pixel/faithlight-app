import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen, Loader2, X, Tag, SlidersHorizontal, StickyNote, Highlighter, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguageStore } from '@/stores/languageStore';
import { useTranslation } from '@/components/hooks/useTranslation';
import { translations } from '@/lib/translations';

// ── Translations ──────────────────────────────────────────────────────────────

const SEARCH_UI = {
  en: {
    title: 'Advanced Bible Search',
    subtitle: 'Search across Bible translations. Use "phrase", -exclude, book:John',
    searchPlaceholder: 'Search: faith, "born again", -darkness, book:John...',
    search: 'Search',
    filters: 'Filters',
    searchScope: 'Search Scope',
    current: 'Current Translation',
    allTrans: 'All Translations',
    translation: 'Translation',
    testament: 'Testament',
    any: 'Any',
    oldTestament: 'Old Testament',
    newTestament: 'New Testament',
    myVerses: 'My Verses',
    hasNote: 'Has my note',
    hasHighlight: 'Has my highlight',
    bookCategory: 'Book Category',
    resetFilters: 'Reset Filters',
    quickSearches: 'Quick Searches',
    searching: 'Searching scripture...',
    noResultsFound: 'No results found',
    versesFound: (n) => `${n} verse${n !== 1 ? 's' : ''} found`,
    for: ' for',
    noVersesFor: 'No verses found for',
    tryDifferent: 'Try different keywords, remove filters, or search all translations.',
    loadMore: 'Load more results',
    enterPhrase: 'Enter a word, phrase, or operator above to search scripture',
    tipExact: 'Tip: use "double quotes" for exact phrases'
  },
  om: {
    title: 'Barruudhaa Bibaa Jajjaboo',
    subtitle: 'Barruudhaa hiika Bibaa irraa. Fayyadami "seentaa", -dura, kitaaba:Yohannees',
    searchPlaceholder: 'Barruudhaa: amantiis, "deebii deebi\'ame", -haala guddaa, kitaaba:Yohannees...',
    search: 'Barruudhaa',
    filters: 'Kaffaltoonni',
    searchScope: 'Hammangaa Barruudhaa',
    current: 'Hiika Ammaa',
    allTrans: 'Hiikoota Hundaa',
    translation: 'Hiika',
    testament: 'Waayilee',
    any: 'Kamiyyuu',
    oldTestament: 'Waayilee Durii',
    newTestament: 'Waayilee Haaraa',
    myVerses: 'Seernota Koo',
    hasNote: 'Seerna koo jira',
    hasHighlight: 'Mallattoo koo jira',
    bookCategory: 'Kategooricha Kitaabaa',
    resetFilters: 'Kaffaltoonni Irra Deebii',
    quickSearches: 'Barruudhaa Ariifannoo',
    searching: 'Seernota barruudhaa jira...',
    noResultsFound: 'Barruudhaan hin argine',
    versesFound: (n) => `seerna ${n} argame`,
    for: ' kan',
    noVersesFor: 'Seerna "',
    tryDifferent: 'Jechoonni hirsuun duwwaa itti fayyadami, ykn hiikoota hundaa barruudhaa.',
    loadMore: 'Barruudhaa dabalee seenna',
    enterPhrase: 'Jecha, seentaa, ykn hojii seensa barruudhaa galtee godhi',
    tipExact: 'Gorsaa: haquulee "dachaa" itti fayyadami seentoota of danda\'a\'uu kan.'
  }
};

// ── Constants ─────────────────────────────────────────────────────────────────

const BOOK_CATEGORIES = {
  'Law':               ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy'],
  'History':           ['Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther'],
  'Poetry':            ['Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon'],
  'Major Prophets':    ['Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel'],
  'Minor Prophets':    ['Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'],
  'Gospels':           ['Matthew','Mark','Luke','John'],
  'NT History':        ['Acts'],
  'Pauline Epistles':  ['Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon'],
  'General Epistles':  ['Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude'],
  'Prophecy':          ['Revelation'],
};

const TRANSLATIONS = ['WEB','ASV'];

const getQuickSearches = (language) => {
  const chips = translations[language]?.advancedSearch?.topicChips || [];
  return chips.map((label, idx) => {
    const queries = ['faith', 'love', 'hope', 'born again', 'do not fear', 'grace', 'salvation', 'prayer'];
    return { label, q: queries[idx] || label.toLowerCase() };
  });
};

// ── Filters Panel ─────────────────────────────────────────────────────────────

function FiltersPanel({ filters, onChange, ui }) {
  const { testament, categories, translation, scope, has_notes, has_highlights } = filters;

  const toggleCategory = (cat) => {
    const next = categories.includes(cat) ? categories.filter(c => c !== cat) : [...categories, cat];
    onChange({ ...filters, categories: next });
  };

  return (
    <div className="space-y-5">
      {/* Scope */}
      <div>
        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">{ui.searchScope}</label>
        <div className="flex gap-2">
          {[['current', ui.current], ['all', ui.allTrans]].map(([v,l]) => (
            <button key={v} onClick={() => onChange({ ...filters, scope: v })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${scope === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Translation (only when scope=current) */}
      {scope === 'current' && (
        <div>
          <label className="text-xs font-bold uppercase text-gray-500 block mb-2">{ui.translation}</label>
          <Select value={translation} onValueChange={v => onChange({ ...filters, translation: v })}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRANSLATIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Testament */}
      <div>
        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">{ui.testament}</label>
        <div className="flex gap-2">
          {[['any', ui.any], ['ot', ui.oldTestament], ['nt', ui.newTestament]].map(([v,l]) => (
            <button key={v} onClick={() => onChange({ ...filters, testament: v })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${testament === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* My verses filters */}
      <div>
        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">{ui.myVerses}</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={has_notes} onChange={e => onChange({ ...filters, has_notes: e.target.checked })} className="rounded" />
            <StickyNote className="w-3.5 h-3.5 text-amber-500" /> {ui.hasNote}
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={has_highlights} onChange={e => onChange({ ...filters, has_highlights: e.target.checked })} className="rounded" />
            <Highlighter className="w-3.5 h-3.5 text-yellow-500" /> {ui.hasHighlight}
          </label>
        </div>
      </div>

      {/* Book Categories */}
      <div>
        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">{ui.bookCategory}</label>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(BOOK_CATEGORIES).map(cat => (
            <button key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${categories.includes(cat) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full"
        onClick={() => onChange({ scope: 'current', translation: filters.translation, testament: 'any', categories: [], has_notes: false, has_highlights: false })}>
        {ui.resetFilters}
      </Button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdvancedBibleSearch() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const ui = SEARCH_UI[uiLanguage] || SEARCH_UI.en;
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [filters, setFilters] = useState({
    scope: 'current',
    translation: localStorage.getItem('preferred_translation') || 'WEB',
    testament: 'any',
    categories: [],
    has_notes: false,
    has_highlights: false,
  });
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const doSearch = useCallback(async (q, f, off = 0, append = false) => {
    if (!q.trim()) return;
    if (off === 0) { setLoading(true); setSearched(true); }
    else setLoadingMore(true);
    try {
      const resp = await base44.functions.invoke('bibleSearch', {
        q,
        scope: f.scope,
        translation: f.translation,
        has_notes: f.has_notes,
        has_highlights: f.has_highlights,
        user_id: user?.id || null,
        limit: 30,
        offset: off,
        use_ai_fallback: true,
      });
      const data = resp.data || {};
      const incoming = data.results || [];
      setTotal(data.total || 0);
      if (append) setResults(prev => [...prev, ...incoming]);
      else setResults(incoming);
      setOffset(off);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user]);

  const handleSearch = () => {
    setQuery(inputValue);
    doSearch(inputValue, filters, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleQuick = (q) => {
    setInputValue(q);
    setQuery(q);
    doSearch(q, filters, 0);
  };

  const loadMore = () => doSearch(query, filters, offset + 30, true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4" key={uiLanguage}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Search className="w-6 h-6 text-white" />
            </div>
            {ui.title}
          </h1>
          <p className="text-gray-500 mt-1">
            {ui.subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-4 shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9 pr-8 text-sm"
                  placeholder={ui.searchPlaceholder}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {inputValue && (
                  <button
                    onClick={() => { setInputValue(''); setResults([]); setSearched(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !inputValue.trim()}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span className="hidden sm:inline">{ui.search}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(v => !v)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{ui.filters}</span>
                {(filters.categories.length > 0 || filters.testament !== 'any') && (
                  <Badge className="bg-indigo-600 text-white text-xs px-1.5 py-0">
                    {filters.categories.length + (filters.testament !== 'any' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Active filter chips */}
            {(filters.categories.length > 0 || filters.testament !== 'any' || filters.scope === 'all' || filters.has_notes || filters.has_highlights) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {filters.scope === 'all' && (
                  <Badge variant="secondary" className="text-xs gap-1">All Translations<button onClick={() => setFilters(f => ({ ...f, scope: 'current' }))}><X className="w-3 h-3" /></button></Badge>
                )}
                {filters.testament !== 'any' && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {filters.testament === 'ot' ? 'Old Testament' : 'New Testament'}
                    <button onClick={() => setFilters(f => ({ ...f, testament: 'any' }))}><X className="w-3 h-3" /></button>
                  </Badge>
                )}
                {filters.has_notes && (
                  <Badge variant="secondary" className="text-xs gap-1"><StickyNote className="w-3 h-3" />Has note<button onClick={() => setFilters(f => ({ ...f, has_notes: false }))}><X className="w-3 h-3" /></button></Badge>
                )}
                {filters.has_highlights && (
                  <Badge variant="secondary" className="text-xs gap-1"><Highlighter className="w-3 h-3" />Has highlight<button onClick={() => setFilters(f => ({ ...f, has_highlights: false }))}><X className="w-3 h-3" /></button></Badge>
                )}
                {filters.categories.map(c => (
                  <Badge key={c} variant="secondary" className="text-xs gap-1">
                    {c}
                    <button onClick={() => setFilters(f => ({ ...f, categories: f.categories.filter(x => x !== c) }))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters Panel (expandable) */}
        {showFilters && (
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-4">
              <FiltersPanel filters={filters} onChange={setFilters} ui={ui} />
            </CardContent>
          </Card>
        )}

        {/* Quick searches */}
         {!searched && (
           <div className="mb-6">
             <p className="text-xs font-bold uppercase text-gray-400 mb-2 flex items-center gap-1">
               <Tag className="w-3 h-3" /> {ui.quickSearches}
             </p>
             <div className="flex flex-wrap gap-2">
               {getQuickSearches(uiLanguage).map(qs => (
                 <button
                   key={qs.q}
                   onClick={() => handleQuick(qs.q)}
                   className="px-3 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-700 text-sm hover:bg-indigo-50 transition-colors"
                 >
                   {qs.label}
                 </button>
               ))}
             </div>
           </div>
         )}

        <div className="flex gap-6">
          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="ml-3 text-gray-500">{ui.searching}</span>
              </div>
            )}

            {searched && !loading && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {results.length === 0 ? ui.noResultsFound : ui.versesFound(total)}
                    {query && <span className="text-gray-400 font-normal">{ui.for} "{query}"</span>}
                  </p>
                  {results.length > 0 && filters.scope === 'all' && (
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(results.map(r => r.translation))].map(t => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {results.length === 0 ? (
                   <Card className="text-center py-14">
                     <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                     <p className="text-gray-500 mb-2">{ui.noVersesFor} "{query}"</p>
                     <p className="text-sm text-gray-400">{ui.tryDifferent}</p>
                   </Card>
                 ) : (
                   <div className="space-y-2">
                     {results.map((r, i) => (
                       <Link key={`${r.verse_id || i}-${r.translation}`} to={createPageUrl(`BibleReader?book=${encodeURIComponent(r.book)}&chapter=${r.chapter}&translation=${r.translation}`)}>
                         <Card className="hover:shadow-md transition-all border-indigo-100 hover:border-indigo-300 cursor-pointer">
                           <CardContent className="p-4">
                             <div className="flex items-start gap-3">
                               <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2 flex-wrap mb-1">
                                   <span className="font-bold text-indigo-700 text-sm">{r.ref}</span>
                                   <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{r.translation}</Badge>
                                   {r.source === 'ai' && <Badge className="text-xs px-1.5 py-0 h-4 bg-purple-100 text-purple-700 border-0"><Sparkles className="w-2.5 h-2.5 mr-0.5" />AI</Badge>}
                                   {r.has_note && <StickyNote className="w-3.5 h-3.5 text-amber-500" />}
                                   {r.has_highlight && <Highlighter className="w-3.5 h-3.5 text-yellow-500" />}
                                 </div>
                                 <p
                                   className="text-sm text-gray-800 leading-relaxed italic [&_mark]:bg-yellow-200 [&_mark]:text-gray-900 [&_mark]:rounded-sm [&_mark]:px-0.5"
                                   dangerouslySetInnerHTML={{ __html: r.highlighted || r.text }}
                                 />
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       </Link>
                     ))}
                     {results.length < total && (
                       <Button variant="outline" className="w-full mt-2" onClick={loadMore} disabled={loadingMore}>
                         {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                         {ui.loadMore}
                       </Button>
                     )}
                   </div>
                 )}
              </>
            )}

            {!searched && !loading && (
              <Card className="border-dashed border-2 border-gray-200 text-center py-16">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">{ui.enterPhrase}</p>
                <p className="text-xs text-gray-300 mt-2">{ui.tipExact}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}