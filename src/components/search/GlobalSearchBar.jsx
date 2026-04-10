import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, X, Filter, BookOpen, MessageCircle, Users, Star, Clock, ChevronDown, Save, Trash2, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['All', 'Bible', 'Forum', 'Groups', 'Study Plans', 'Sermons'];
const DATE_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
];
const SORT_OPTIONS = [
  { label: 'Most Relevant', value: 'relevant' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Popular', value: 'popular' },
];

const SAVED_FILTERS_KEY = 'faithlight_saved_filters';

function getSavedFilters() {
  try { return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]'); } catch { return []; }
}
function saveFilter(filter) {
  const saved = getSavedFilters();
  const updated = [filter, ...saved.filter(f => f.name !== filter.name)].slice(0, 5);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
}
function deleteFilter(name) {
  const updated = getSavedFilters().filter(f => f.name !== name);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
}

export default function GlobalSearchBar({ autoFocus = false, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevant');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedFilters, setSavedFilters] = useState(getSavedFilters());
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_recent_searches') || '[]'); } catch { return []; }
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const addRecentSearch = (q) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('fl_recent_searches', JSON.stringify(updated));
  };

  const doSearch = useCallback(async (q, cat, date, sort) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const combinedResults = [];

    // Search Bible verses
    if (cat === 'All' || cat === 'Bible') {
      try {
        const verses = await base44.entities.BibleVerse.filter({ translation: 'WEB' }, '-created_date', 20);
        const filtered = verses.filter(v =>
          v.text?.toLowerCase().includes(q.toLowerCase()) ||
          v.book?.toLowerCase().includes(q.toLowerCase())
        );
        filtered.slice(0, 5).forEach(v => combinedResults.push({
          id: `verse-${v.id}`, type: 'Bible', icon: BookOpen, title: `${v.book} ${v.chapter}:${v.verse}`,
          desc: v.text?.slice(0, 100) + '…', url: createPageUrl('BibleReader'), color: 'indigo',
        }));
      } catch {}
    }

    // Search forum topics
    if (cat === 'All' || cat === 'Forum') {
      try {
        const posts = await base44.entities.ForumTopic.filter({}, '-created_date', 30);
        const filtered = posts.filter(p =>
          p.title?.toLowerCase().includes(q.toLowerCase()) ||
          p.content?.toLowerCase().includes(q.toLowerCase())
        );
        filtered.slice(0, 4).forEach(p => combinedResults.push({
          id: `forum-${p.id}`, type: 'Forum', icon: MessageCircle, title: p.title,
          desc: p.content?.slice(0, 100) + '…', url: createPageUrl('BibleForum'), color: 'green',
        }));
      } catch {}
    }

    // Search groups
    if (cat === 'All' || cat === 'Groups') {
      try {
        const groups = await base44.entities.Group.filter({}, '-created_date', 30);
        const filtered = groups.filter(g =>
          g.name?.toLowerCase().includes(q.toLowerCase()) ||
          g.description?.toLowerCase().includes(q.toLowerCase())
        );
        filtered.slice(0, 4).forEach(g => combinedResults.push({
          id: `group-${g.id}`, type: 'Groups', icon: Users, title: g.name,
          desc: g.description?.slice(0, 100) || 'Community group', url: createPageUrl('Groups'), color: 'amber',
        }));
      } catch {}
    }

    // Sort
    if (sort === 'newest') combinedResults.sort((a, b) => b.id.localeCompare(a.id));

    setResults(combinedResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, category, dateFilter, sortBy), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, category, dateFilter, sortBy, doSearch]);

  const handleSelect = (result) => {
    addRecentSearch(query);
    navigate(result.url);
    onClose?.();
  };

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return;
    const f = { name: saveFilterName.trim(), category, dateFilter, sortBy, query };
    saveFilter(f);
    setSavedFilters(getSavedFilters());
    setShowSaveInput(false);
    setSaveFilterName('');
  };

  const applyFilter = (f) => {
    setQuery(f.query || '');
    setCategory(f.category || 'All');
    setDateFilter(f.dateFilter || '');
    setSortBy(f.sortBy || 'relevant');
  };

  const removeSavedFilter = (name) => {
    deleteFilter(name);
    setSavedFilters(getSavedFilters());
  };

  const TYPE_COLORS = { Bible: 'bg-indigo-100 text-indigo-700', Forum: 'bg-green-100 text-green-700', Groups: 'bg-amber-100 text-amber-700', 'Study Plans': 'bg-purple-100 text-purple-700', Sermons: 'bg-rose-100 text-rose-700' };

  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* Search input */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search scripture, forum topics, groups…"
          className="flex-1 text-base outline-none bg-transparent text-gray-800 placeholder-gray-400"
        />
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
          title="Advanced filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm px-2">
            Esc
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-100 bg-gray-50/80 flex-shrink-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${category === cat ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="bg-indigo-50/60 border-b border-indigo-100 px-4 py-3 space-y-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Date</label>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-300">
                {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Sort by</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-300">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Save filter */}
          <div className="flex items-center gap-2">
            {showSaveInput ? (
              <>
                <input
                  value={saveFilterName}
                  onChange={e => setSaveFilterName(e.target.value)}
                  placeholder="Filter name…"
                  className="flex-1 text-xs border border-indigo-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-400"
                  onKeyDown={e => e.key === 'Enter' && handleSaveFilter()}
                />
                <button onClick={handleSaveFilter} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Save</button>
                <button onClick={() => setShowSaveInput(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
              </>
            ) : (
              <button onClick={() => setShowSaveInput(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                <Save className="w-3 h-3" /> Save this filter
              </button>
            )}
          </div>

          {/* Saved filters */}
          {savedFilters.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Saved Filters</p>
              <div className="flex flex-wrap gap-1.5">
                {savedFilters.map(f => (
                  <div key={f.name} className="flex items-center gap-1 bg-white border border-indigo-100 rounded-full px-2.5 py-0.5">
                    <button onClick={() => applyFilter(f)} className="text-xs text-indigo-700 font-medium hover:text-indigo-900">{f.name}</button>
                    <button onClick={() => removeSavedFilter(f.name)} className="text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results area */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-2" />
            <span className="text-sm">Searching…</span>
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="py-6 px-4">
            <div className="text-center mb-5 text-gray-400">
              <Search className="w-7 h-7 mx-auto mb-2 opacity-40" />
              <p className="text-sm text-gray-600 font-medium">No results for "<strong>{query}</strong>"</p>
              <p className="text-xs text-gray-400 mt-0.5">Try these next steps instead:</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { navigate(`${createPageUrl('BibleReader')}?search=${encodeURIComponent(query)}`); onClose?.(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-300 transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700">Search Bible for "{query}"</p>
                  <p className="text-xs text-gray-400">Find relevant verses and passages</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 ml-auto rotate-[-90deg]" />
              </button>
              <button
                onClick={() => { navigate(`${createPageUrl('BibleStudyPlans')}?topic=${encodeURIComponent(query)}`); onClose?.(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-100 hover:bg-purple-50 hover:border-purple-300 transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700">Create Study Plan on "{query}"</p>
                  <p className="text-xs text-gray-400">Build an AI-powered study plan for this topic</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-purple-400 ml-auto rotate-[-90deg]" />
              </button>
              <button
                onClick={() => { navigate(`${createPageUrl('Community')}?prompt=${encodeURIComponent(query)}`); onClose?.(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-green-100 hover:bg-green-50 hover:border-green-300 transition-all group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">Create Post about "{query}"</p>
                  <p className="text-xs text-gray-400">Start a community discussion on this topic</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-green-400 ml-auto rotate-[-90deg]" />
              </button>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="py-2">
            <p className="px-4 py-1.5 text-xs text-gray-400 font-medium">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            {results.map(r => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-start gap-3 group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[r.type] || 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 truncate">{r.title}</span>
                      <Badge className={`text-xs flex-shrink-0 ${TYPE_COLORS[r.type]}`}>{r.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <div className="py-3">
            <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1"><Clock className="w-3 h-3" /> Recent Searches</p>
            {recentSearches.map(s => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5 text-gray-300" /> {s}
              </button>
            ))}
          </div>
        )}

        {/* Empty state with hints */}
        {!query && recentSearches.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-500">Search FaithLight</p>
            <p className="text-xs mt-1">Bible verses, forum topics, groups, study plans and more</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Psalm 23', 'faith', 'prayer group', 'Romans'].map(s => (
                <button key={s} onClick={() => setQuery(s)} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}