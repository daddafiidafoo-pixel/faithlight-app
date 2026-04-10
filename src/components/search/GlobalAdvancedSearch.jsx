import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getRecentSearches, logSearch, clearSearchHistory } from '@/components/lib/search/recentSearches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Search, X, Filter, BookOpen, Users, MessageCircle,
  Clock, Sparkles, Save, Trash2, SlidersHorizontal, ArrowUpDown,
  Tag, CalendarDays, Circle, ExternalLink, PenLine, Map
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const SAVED_FILTERS_KEY = 'faithlight_saved_filters';
const RECENT_SEARCHES_KEY = 'faithlight_recent_searches';

const CATEGORIES = ['All', 'Devotional', 'Teaching', 'Testimony', 'Question', 'Announcement'];
const STATUSES = ['All', 'published', 'pending'];
const DATE_RANGES = [
  { label: 'Any time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
];
const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Most liked', value: 'likes' },
  { label: 'Most relevant', value: 'relevant' },
];

/* ── LocalStorage helpers ── */
const getSaved = () => JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]');
const saveFilter = (name, filters) => {
  const next = [{ name, filters, id: Date.now() }, ...getSaved()].slice(0, 10);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(next));
};
const deleteFilter = (id) =>
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(getSaved().filter(f => f.id !== id)));
const getRecent = () => JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
const addRecent = (q) => {
  const next = [q, ...getRecent().filter(x => x !== q)].slice(0, 8);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
};

/* ── Date filter helper ── */
function filterByDate(item, range) {
  if (range === 'all') return true;
  const created = new Date(item.created_date);
  const now = new Date();
  if (range === 'today') return created.toDateString() === now.toDateString();
  if (range === 'week') { const d = new Date(now); d.setDate(now.getDate() - 7); return created >= d; }
  if (range === 'month') { const d = new Date(now); d.setMonth(now.getMonth() - 1); return created >= d; }
  return true;
}

/* ── Tag match helper ── */
function matchesTags(item, tags) {
  if (!tags.length) return true;
  const text = `${item.title || ''} ${item.body || ''} ${item.description || ''} ${item.content || ''}`.toLowerCase();
  return tags.every(tag => text.includes(tag.toLowerCase()));
}

/* ── Sort helper ── */
function sortItems(items, sort, query) {
  const arr = [...items];
  if (sort === 'newest') return arr.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  if (sort === 'oldest') return arr.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  if (sort === 'likes') return arr.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
  if (sort === 'relevant') {
    const lower = query.toLowerCase();
    return arr.sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase().includes(lower) ? 2 : 0;
      const bTitle = (b.title || '').toLowerCase().includes(lower) ? 2 : 0;
      return (bTitle) - (aTitle);
    });
  }
  return arr;
}

export default function GlobalAdvancedSearch({ open, onClose }) {
  const [me, setMe] = useState(null);
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');
  const [tagInput, setTagInput] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [results, setResults] = useState({ posts: [], plans: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [recentSearches, setRecentSearches] = useState(getRecent());
  const [savedFilters, setSavedFilters] = useState(getSaved());
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const inputRef = useRef(null);
  const tagInputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setRecentSearches(getRecent());
      setSavedFilters(getSaved());
      if (me?.id) getRecentSearches(me).then(r => { if (r.length) setRecentSearches(r); });
    }
  }, [open, me?.id]);

  const doSearch = useCallback(async (q, cat, stat, date, tags, sort) => {
    if (!q || q.trim().length < 2) { setResults({ posts: [], plans: [], topics: [] }); return; }
    setLoading(true);
    const lower = q.toLowerCase();

    const [postsRaw, plansRaw, topicsRaw] = await Promise.all([
      base44.entities.CommunityPost.filter({ status: 'published' }, '-created_date', 100).catch(() => []),
      base44.entities.StudyPlan.list('-created_date', 100).catch(() => []),
      base44.entities.ForumTopic.list('-created_date', 100).catch(() => []),
    ]);

    const matchPost = p =>
      (p.title?.toLowerCase().includes(lower) || p.body?.toLowerCase().includes(lower)) &&
      (cat === 'All' || p.category === cat) &&
      (stat === 'All' || p.status === stat) &&
      filterByDate(p, date) && matchesTags(p, tags);

    const matchPlan = p =>
      (p.title?.toLowerCase().includes(lower) || p.description?.toLowerCase().includes(lower)) &&
      filterByDate(p, date) && matchesTags(p, tags);

    const matchTopic = t =>
      (t.title?.toLowerCase().includes(lower) || t.content?.toLowerCase().includes(lower)) &&
      filterByDate(t, date) && matchesTags(t, tags);

    setResults({
      posts: sortItems(postsRaw.filter(matchPost), sort, q).slice(0, 20),
      plans: sortItems(plansRaw.filter(matchPlan), sort, q).slice(0, 10),
      topics: sortItems(topicsRaw.filter(matchTopic), sort, q).slice(0, 10),
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(query, category, status, dateRange, activeTags, sortBy), 350);
    } else {
      setResults({ posts: [], plans: [], topics: [] });
    }
  }, [query, category, status, dateRange, activeTags, sortBy, doSearch]);

  const handleSearch = (q) => {
    setQuery(q);
    if (q.trim()) {
      addRecent(q.trim());
      if (me?.id) logSearch(me, q.trim());
    }
    setRecentSearches(getRecent());
  };

  const handleClearHistory = async () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
    if (me?.id) await clearSearchHistory(me);
  };

  const handleChipClick = (chip) => {
    setQuery(chip);
    addRecent(chip);
    setRecentSearches(getRecent());
    doSearch(chip, category, status, dateRange, activeTags, sortBy);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !activeTags.includes(t)) setActiveTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t) => setActiveTags(prev => prev.filter(x => x !== t));

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return;
    saveFilter(saveFilterName.trim(), { category, status, dateRange, sortBy, activeTags });
    setSavedFilters(getSaved());
    setSaveFilterName('');
    setShowSaveInput(false);
    toast.success('Filter saved!');
  };

  const handleLoadFilter = (f) => {
    setCategory(f.filters.category || 'All');
    setStatus(f.filters.status || 'All');
    setDateRange(f.filters.dateRange || 'all');
    setSortBy(f.filters.sortBy || 'relevant');
    setActiveTags(f.filters.activeTags || []);
    toast.success(`Filter "${f.name}" applied`);
  };

  const handleDeleteFilter = (id, e) => {
    e.stopPropagation();
    deleteFilter(id);
    setSavedFilters(getSaved());
  };

  const clearAll = () => {
    setCategory('All'); setStatus('All'); setDateRange('all');
    setSortBy('relevant'); setActiveTags([]);
  };

  const totalResults = results.posts.length + results.plans.length + results.topics.length;
  const hasActiveFilters = category !== 'All' || status !== 'All' || dateRange !== 'all' || activeTags.length > 0 || sortBy !== 'relevant';

  const tabData = [
    { id: 'all', label: 'All', count: totalResults },
    { id: 'posts', label: 'Posts', count: results.posts.length },
    { id: 'plans', label: 'Study Plans', count: results.plans.length },
    { id: 'topics', label: 'Forum', count: results.topics.length },
  ];

  const getVisibleResults = () => {
    if (activeTab === 'posts') return results.posts.map(r => ({ ...r, _type: 'post' }));
    if (activeTab === 'plans') return results.plans.map(r => ({ ...r, _type: 'plan' }));
    if (activeTab === 'topics') return results.topics.map(r => ({ ...r, _type: 'topic' }));
    return [
      ...results.posts.slice(0, 5).map(r => ({ ...r, _type: 'post' })),
      ...results.plans.slice(0, 3).map(r => ({ ...r, _type: 'plan' })),
      ...results.topics.slice(0, 3).map(r => ({ ...r, _type: 'topic' })),
    ];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl">

        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search posts, study plans, forum topics..."
            className="flex-1 text-base outline-none bg-transparent placeholder-gray-400"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              hasActiveFilters || showFilters
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />}
          </button>
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-3">
            {/* Row 1: Category / Status / Date / Sort */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                  <Circle className="w-2.5 h-2.5" /> Category
                </label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                  <Circle className="w-2.5 h-2.5" /> Status
                </label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                  <CalendarDays className="w-2.5 h-2.5" /> Date
                </label>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
                  {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                  <ArrowUpDown className="w-2.5 h-2.5" /> Sort
                </label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Custom Tag Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Custom Tags (press Enter to add)
              </label>
              <div className="flex gap-1.5 flex-wrap mb-1.5">
                {activeTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="e.g. grace, prayer, psalm..."
                  className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white outline-none focus:ring-1 focus:ring-indigo-300"
                />
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={addTag}>Add</Button>
                {hasActiveFilters && (
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-700" onClick={clearAll}>Clear all</Button>
                )}
              </div>
            </div>

            {/* Save / Load filters */}
            <div className="flex items-center gap-2">
              {showSaveInput ? (
                <>
                  <input
                    value={saveFilterName}
                    onChange={e => setSaveFilterName(e.target.value)}
                    placeholder="Filter name..."
                    className="flex-1 text-xs border border-indigo-300 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-200"
                    onKeyDown={e => e.key === 'Enter' && handleSaveFilter()}
                    autoFocus
                  />
                  <Button size="sm" className="h-6 px-2 text-xs bg-indigo-600 text-white" onClick={handleSaveFilter}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setShowSaveInput(false)}>Cancel</Button>
                </>
              ) : (
                <button onClick={() => setShowSaveInput(true)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  <Save className="w-3 h-3" /> Save this filter
                </button>
              )}
            </div>

            {savedFilters.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-400 font-medium self-center">Saved:</span>
                {savedFilters.map(f => (
                  <button key={f.id} onClick={() => handleLoadFilter(f)}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 group">
                    {f.name}
                    <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                      onClick={e => handleDeleteFilter(f.id, e)} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active tag badges (compact, always visible when active) */}
        {!showFilters && activeTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap px-4 py-2 bg-indigo-50 border-b border-indigo-100">
            <Tag className="w-3.5 h-3.5 text-indigo-400 self-center" />
            {activeTags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                #{tag} <button onClick={() => removeTag(tag)}><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        {query.length >= 2 && (
          <div className="flex border-b border-gray-100 bg-white px-4">
            {tabData.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 border-b-2 transition-colors ${
                  activeTab === t.id ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === t.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto bg-white">
          {!query && (
            <div className="p-4 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <button onClick={handleClearHistory} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      Clear history
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(s => (
                      <button key={s} onClick={() => handleChipClick(s)}
                        className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Try searching for
                </p>
                <div className="flex flex-wrap gap-2">
                  {['faith', 'forgiveness', 'prayer', 'John 3:16', 'study plan', 'devotional'].map(s => (
                    <button key={s} onClick={() => handleChipClick(s)}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {query.length >= 2 && !loading && totalResults === 0 && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium text-gray-700 mb-1">No results for "<span className="text-indigo-600">{query}</span>"</p>
              <p className="text-xs text-gray-400 mb-5">Try a different keyword, or take one of these actions:</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  to={createPageUrl(`BibleReader?q=${encodeURIComponent(query)}`)}
                  onClick={onClose}
                  className="flex items-center gap-2 justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Search Bible for "{query}"
                </Link>
                <Link
                  to={createPageUrl(`AIStudyPlanBuilder?topic=${encodeURIComponent(query)}`)}
                  onClick={onClose}
                  className="flex items-center gap-2 justify-center px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium rounded-xl hover:bg-amber-100 transition-colors"
                >
                  <Map className="w-4 h-4" />
                  Create Study Plan on "{query}"
                </Link>
                <Link
                  to={createPageUrl('Community')}
                  onClick={onClose}
                  className="flex items-center gap-2 justify-center px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  Create a Post
                </Link>
              </div>
            </div>
          )}

          {getVisibleResults().map((item, idx) => (
            <ResultItem key={`${item._type}-${item.id || idx}`} item={item} query={query} onClose={onClose} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {query.length >= 2
              ? `${totalResults} result${totalResults !== 1 ? 's' : ''} · sorted by ${SORT_OPTIONS.find(o => o.value === sortBy)?.label}`
              : 'Type to search across all content'}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded bg-white">Esc</kbd> close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, 100);
  const start = Math.max(0, idx - 30);
  const snippet = text.slice(start, idx + query.length + 60);
  const parts = snippet.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{p}</mark>
      : p
  );
}

function ResultItem({ item, query, onClose }) {
  const typeConfig = {
    post: { icon: MessageCircle, color: 'text-blue-500', label: 'Post', url: createPageUrl('Community') },
    plan: { icon: BookOpen, color: 'text-indigo-500', label: 'Study Plan', url: createPageUrl('BibleStudyPlans') },
    topic: { icon: Users, color: 'text-green-500', label: 'Forum', url: createPageUrl('BibleForum') },
  };
  const cfg = typeConfig[item._type] || typeConfig.post;
  const Icon = cfg.icon;

  return (
    <Link to={cfg.url} onClick={onClose} className="block group">
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
        <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
              {highlight(item.title || item.body, query)}
            </p>
            <Badge variant="outline" className="text-xs px-1.5 h-4 flex-shrink-0">{cfg.label}</Badge>
            {item.category && <Badge className="text-xs px-1.5 h-4 bg-gray-100 text-gray-600 border-0 flex-shrink-0">{item.category}</Badge>}
            {item.status && item.status !== 'published' && (
              <Badge className="text-xs px-1.5 h-4 bg-amber-100 text-amber-700 border-0 flex-shrink-0">{item.status}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {highlight(item.body || item.description || item.content, query)}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {item.created_date && (
              <p className="text-xs text-gray-400">{new Date(item.created_date).toLocaleDateString()}</p>
            )}
            {item.like_count > 0 && (
              <p className="text-xs text-gray-400">♥ {item.like_count}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}