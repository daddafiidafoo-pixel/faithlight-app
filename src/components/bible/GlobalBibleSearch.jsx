import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, X, Loader2, BookOpen, StickyNote, Highlighter, Filter, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '../I18nProvider';

const BOOK_CATEGORIES = {
  'Law':              ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy'],
  'History':          ['Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther'],
  'Poetry':           ['Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon'],
  'Major Prophets':   ['Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel'],
  'Minor Prophets':   ['Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'],
  'Gospels':          ['Matthew','Mark','Luke','John'],
  'NT History':       ['Acts'],
  'Pauline Epistles': ['Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon'],
  'General Epistles': ['Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude'],
  'Prophecy':         ['Revelation'],
};

const QUICK_SUGGESTIONS = [
  'faith', 'love', 'hope', 'grace', 'salvation', 'prayer', 'forgiveness', 'joy', 'peace',
];

const TOPICS = {
  'Faith & Trust': ['faith', 'trust', 'believe'],
  'Love & Compassion': ['love', 'compassion', 'mercy'],
  'Hope & Peace': ['hope', 'peace', 'comfort'],
  'Forgiveness': ['forgive', 'repent', 'grace'],
  'Strength & Courage': ['strength', 'courage', 'overcome'],
};

const BIBLE_CHARACTERS = [
  'Jesus', 'David', 'Moses', 'Abraham', 'Paul', 'Peter', 'Mary', 'John',
  'Joseph', 'Hannah', 'Job', 'Solomon', 'Ruth', 'Esther', 'Daniel',
];

const RECENT_KEY = 'bible_search_recent';

function saveRecent(q) {
  const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const next = [q, ...prev.filter(x => x !== q)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function getRecent() {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
}

// ── Result Row ─────────────────────────────────────────────────────────────────
function ResultRow({ result, onClose }) {
  const url = createPageUrl(`BibleReader?book=${encodeURIComponent(result.book)}&chapter=${result.chapter}&translation=${result.translation}`);
  return (
    <Link to={url} onClick={onClose} className="block group">
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0">
        <BookOpen className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0 group-hover:text-indigo-600" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-sm text-indigo-700 group-hover:text-indigo-900">{result.ref}</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{result.translation}</Badge>
            {result.source === 'ai' && (
              <Badge className="text-xs px-1.5 py-0 h-4 bg-purple-100 text-purple-700 border-0">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI
              </Badge>
            )}
            {result.has_note && <StickyNote className="w-3.5 h-3.5 text-amber-500" />}
            {result.has_highlight && <Highlighter className="w-3.5 h-3.5 text-yellow-500" />}
          </div>
          <p
            className="text-sm text-gray-700 leading-relaxed line-clamp-2 [&_mark]:bg-yellow-200 [&_mark]:text-gray-900 [&_mark]:rounded-sm [&_mark]:px-0.5"
            dangerouslySetInnerHTML={{ __html: result.highlighted || result.text }}
          />
        </div>
      </div>
    </Link>
  );
}

// ── Filters Sheet ──────────────────────────────────────────────────────────────
function FiltersSheet({ filters, onChange, t }) {
  const [open, setOpen] = useState(false);

  const toggleCat = (cat) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const activeCount = filters.categories.length
    + (filters.testament !== 'any' ? 1 : 0)
    + (filters.scope === 'all' ? 1 : 0)
    + (filters.has_notes ? 1 : 0)
    + (filters.has_highlights ? 1 : 0);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-700 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        <Filter className="w-3.5 h-3.5" />
        {t('search.filters', 'Filters')}
        {activeCount > 0 && (
          <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {activeCount}
          </span>
        )}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          {/* Scope */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase">Scope</span>
            {['current', 'all'].map(s => (
              <button
                key={s}
                onClick={() => onChange({ ...filters, scope: s })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  filters.scope === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {s === 'current' ? 'Current Translation' : 'All Translations'}
              </button>
            ))}
          </div>

          {/* Testament */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase">Testament</span>
            {[['any','Any'], ['ot','Old'], ['nt','New']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => onChange({ ...filters, testament: v })}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                  filters.testament === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Personal filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase">My Verses</span>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_notes}
                onChange={e => onChange({ ...filters, has_notes: e.target.checked })}
                className="rounded"
              />
              <StickyNote className="w-3.5 h-3.5 text-amber-500" /> Has note
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_highlights}
                onChange={e => onChange({ ...filters, has_highlights: e.target.checked })}
                className="rounded"
              />
              <Highlighter className="w-3.5 h-3.5 text-yellow-500" /> Has highlight
            </label>
          </div>

          {/* Book categories */}
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Book Categories</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(BOOK_CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    filters.categories.includes(cat)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onChange({ scope: 'current', translation: filters.translation, testament: 'any', categories: [], has_notes: false, has_highlights: false })}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function GlobalBibleSearch({ open, onClose, defaultTranslation = 'WEB', user }) {
  const { t, lang } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recent, setRecent] = useState(getRecent());
  const [filters, setFilters] = useState({
    scope: 'current',
    translation: defaultTranslation,
    testament: 'any',
    categories: [],
    has_notes: false,
    has_highlights: false,
  });
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setRecent(getRecent());
    } else {
      setInputValue('');
      setResults([]);
      setTotal(0);
      setOffset(0);
    }
  }, [open]);

  const doSearch = useCallback(async (q, f, off = 0, append = false) => {
    if (!q.trim()) { setResults([]); setTotal(0); return; }
    if (off === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const resp = await base44.functions.invoke('bibleSearch', {
        q,
        scope: f.scope,
        translation: f.translation,
        book: null,
        chapter: null,
        has_notes: f.has_notes,
        has_highlights: f.has_highlights,
        user_id: user?.id || null,
        limit: 20,
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

  // Debounced search on input change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!inputValue.trim()) { setResults([]); setTotal(0); return; }
    debounceRef.current = setTimeout(() => {
      doSearch(inputValue, filters, 0);
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [inputValue, filters, doSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      clearTimeout(debounceRef.current);
      saveRecent(inputValue.trim());
      setRecent(getRecent());
      doSearch(inputValue, filters, 0);
    }
    if (e.key === 'Escape') onClose();
  };

  const runQuery = (q) => {
    setInputValue(q);
    saveRecent(q);
    setRecent(getRecent());
    doSearch(q, filters, 0);
  };

  const loadMore = () => {
    doSearch(inputValue, filters, offset + 20, true);
  };

  const hasMore = results.length < total;
  const showEmpty = !loading && inputValue.trim() && results.length === 0;
  const showResults = results.length > 0;
  const showHome = !inputValue.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
          <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder', 'Search scripture…')}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />}
          {inputValue && !loading && (
            <button onClick={() => { setInputValue(''); setResults([]); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b bg-white">
          <FiltersSheet filters={filters} onChange={(f) => { setFilters(f); }} t={t} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Home state */}
           {showHome && (
             <div className="p-4 space-y-5">
               {recent.length > 0 && (
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('search.recentSearches', 'Recent Searches')}</p>
                   <div className="flex flex-wrap gap-2">
                     {recent.map(r => (
                       <button
                         key={r}
                         onClick={() => runQuery(r)}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 text-sm text-gray-700 rounded-full transition-colors"
                       >
                         <Search className="w-3 h-3 text-gray-400" />
                         {r}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Topics</p>
                 <div className="space-y-2">
                   {Object.entries(TOPICS).map(([topic, keywords]) => (
                     <div key={topic}>
                       <p className="text-xs text-gray-600 font-medium mb-1">{topic}</p>
                       <div className="flex flex-wrap gap-1.5">
                         {keywords.map(keyword => (
                           <button
                             key={keyword}
                             onClick={() => runQuery(keyword)}
                             className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded-full transition-colors border border-purple-100"
                           >
                             {keyword}
                           </button>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bible Characters</p>
                 <div className="flex flex-wrap gap-2">
                   {BIBLE_CHARACTERS.map(char => (
                     <button
                       key={char}
                       onClick={() => runQuery(char)}
                       className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm rounded-full transition-colors border border-amber-100"
                     >
                       {char}
                     </button>
                   ))}
                 </div>
               </div>

               <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">{t('search.suggestions', 'Quick Search')}</p>
                 <div className="flex flex-wrap gap-2">
                   {QUICK_SUGGESTIONS.map(s => (
                     <button
                       key={s}
                       onClick={() => runQuery(s)}
                       className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm rounded-full transition-colors border border-indigo-100"
                     >
                       {s}
                     </button>
                   ))}
                 </div>
               </div>

               <p className="text-xs text-gray-400 pt-2 border-t">
                 <strong>Tips:</strong> Use <code className="bg-gray-100 px-1 rounded">"quotes"</code> for exact phrases, <code className="bg-gray-100 px-1 rounded">-word</code> to exclude, <code className="bg-gray-100 px-1 rounded">book:John</code> to search one book.
               </p>
             </div>
           )}

          {/* Empty state */}
          {showEmpty && (
            <div className="py-14 text-center text-gray-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('search.noResults', 'No verses found')} "{inputValue}"</p>
              <p className="text-xs mt-1">{t('search.tryAnother', 'Try different words or remove filters')}</p>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {total} result{total !== 1 ? 's' : ''}
                  {inputValue && <span className="text-gray-400"> for "{inputValue}"</span>}
                </span>
                {filters.scope === 'all' && (
                  <div className="flex gap-1">
                    {[...new Set(results.map(r => r.translation))].map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {results.map((r, i) => (
                <ResultRow key={`${r.verse_id || i}-${r.translation}`} result={r} onClose={onClose} />
              ))}

              {hasMore && (
                <div className="p-4 text-center">
                  <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-400 flex items-center justify-between">
          <span>{t('search.enterHint', '↵ Enter to search · Esc to close')}</span>
          <Link to={createPageUrl('AdvancedBibleSearch')} onClick={onClose} className="text-indigo-600 hover:underline">
            {t('search.advanced', 'Advanced Search')} →
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}